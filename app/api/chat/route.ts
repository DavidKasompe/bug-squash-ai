import { streamText } from "ai";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ANALYSIS_SYSTEM_PROMPT, isLikelyBugReport, parseAnalysisResponse } from "@/lib/prompts";
import { fetchFileFromGitHub } from "@/lib/github";
import { getGroqModel, isGroqConfigured } from "@/lib/llm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  if (!isGroqConfigured) {
    return Response.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
  }

  const payload = await req.json();
  const messageFromMessages =
    Array.isArray(payload?.messages) && payload.messages.length > 0
      ? payload.messages[payload.messages.length - 1]?.content
      : undefined;
  const message = payload?.message ?? messageFromMessages;
  const sessionId = payload?.sessionId;
  const repo = payload?.repo;
  const installationId = payload?.installationId;
  if (!message) return Response.json({ error: "message required" }, { status: 400 });

  // ── 1. Create or fetch chat session ──────────────────────────────────────
  let activeSessionId = sessionId;
  if (!activeSessionId) {
    const { data: newSession } = await supabase
      .from("chat_sessions")
      .insert({ user_id: session.user.id, title: message.slice(0, 60) })
      .select()
      .single();
    activeSessionId = newSession?.id;
  }

  // ── 2. If it's a new bug, create a bug record ─────────────────────────────
  let bugId: string | null = null;
  if (isLikelyBugReport(message)) {
    const { data: bug } = await supabase.from("bugs").insert({
      user_id:         session.user.id,
      installation_id: installationId ?? null,
      repo:            repo ?? "unknown",
      stack_trace:     message,
      source:          "chat",
      status:          "Investigating",
    }).select().single();
    bugId = bug?.id ?? null;

    // Link bug to session
    if (activeSessionId && bugId) {
      await supabase.from("chat_sessions").update({ bug_id: bugId }).eq("id", activeSessionId);
    }
  }

  // ── 3. Fetch repo file context if possible ────────────────────────────────
  let fileContext = "";
  if (installationId && repo) {
    // Try to extract file path from the stack trace
    const fileMatch = message.match(/(?:at |File "|in )([^\s()"]+\.(ts|tsx|js|jsx|py|java|kt|go|rb))/);
    const filePath  = fileMatch?.[1];
    if (filePath) {
      try {
        const { content } = await fetchFileFromGitHub(installationId, repo, filePath);
        fileContext = `\n\nAffected file content (${filePath}):\n\`\`\`\n${content.slice(0, 3000)}\n\`\`\``;
      } catch { /* file not found — continue without context */ }
    }
  }

  // ── 4. Stream AI response ─────────────────────────────────────────────────
  const systemWithContext = ANALYSIS_SYSTEM_PROMPT + fileContext;

  let result;
  try {
    result = await streamText({
      model:  getGroqModel(),
      system: systemWithContext,
      messages: [{ role: "user", content: message }],
      onFinish: async ({ text }) => {
        // After streaming completes, save to DB
        const parsed = parseAnalysisResponse(text);

        if (parsed && bugId) {
          await supabase.from("bugs").update({
            title:              parsed.title,
            severity:           parsed.severity,
            confidence:         parsed.confidence,
            root_cause:         parsed.root_cause,
            ai_suggestion:      parsed.fix_steps.join("\n"),
            fix_steps:          parsed.fix_steps,
            affected_file:      parsed.affected_file,
            affected_function:  parsed.affected_function,
            status:             "Ready",
          }).eq("id", bugId);

          if (parsed.diff) {
            await supabase.from("patches").insert({
              bug_id:          bugId,
              user_id:         session.user.id,
              diff:            parsed.diff,
              tests_generated: parsed.tests,
              status:          "pending",
            });
          }
        }

        // Append message pair to chat session
        if (activeSessionId) {
          const { data: chatSession } = await supabase
            .from("chat_sessions")
            .select("messages")
            .eq("id", activeSessionId)
            .single();

          const existing = (chatSession?.messages as any[]) ?? [];
          await supabase.from("chat_sessions").update({
            messages: [
              ...existing,
              { role: "user",      content: message, createdAt: new Date().toISOString() },
              { role: "assistant", content: text,    createdAt: new Date().toISOString(), bugId },
            ]
          }).eq("id", activeSessionId);
        }
      }
    });
  } catch (error) {
    console.error("[/api/chat]", error);
    return Response.json({ error: "Chat generation failed." }, { status: 500 });
  }

  // Return session id in header so client can persist it
  const response = result.toTextStreamResponse();
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("x-session-id", activeSessionId ?? "");
  responseHeaders.set("x-bug-id",     bugId ?? "");

  return new Response(response.body, { headers: responseHeaders, status: response.status });
}
