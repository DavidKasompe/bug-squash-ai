import { generateText, streamText } from "ai";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { isMissingCommitAnalysesTableError, persistCommitAnalysisRecord } from "@/lib/commit-analyses";
import { fetchFileFromGitHub, getCommitAnalysisContext, getLatestCommitAnalysisContext, getRecentCommitAnalysisContext } from "@/lib/github";
import { getGroqModel, isGroqConfigured } from "@/lib/llm";
import {
  ANALYSIS_SYSTEM_PROMPT,
  COMMIT_ANALYSIS_SYSTEM_PROMPT,
  extractBranchNameFromMessage,
  extractCommitCountFromMessage,
  extractCommitShaFromMessage,
  extractRepositoryNameFromMessage,
  isCommitAnalysisRequest,
  isLikelyBugReport,
  parseAnalysisResponse,
  parseCommitAnalysisResponse,
} from "@/lib/prompts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type ChatSessionMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  bugId?: string | null;
};

type InstallationRecord = {
  installation_id: string;
  repos: Array<{
    name?: string;
    full_name?: string;
  }> | null;
};

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n...<truncated>`;
}

function buildCommitAnalysisPrompt(message: string, activeRepo: string, commitContext: Awaited<ReturnType<typeof getLatestCommitAnalysisContext>>) {
  const condensedFiles = commitContext.files.slice(0, 5);
  const commitSummary =
    commitContext.commits.length > 1
      ? [
          "Commits in scope:",
          ...commitContext.commits.map((commit, index) =>
            `${index + 1}. ${commit.sha.slice(0, 12)} · ${truncateText(commit.message, 120)} · ${commit.author} · ${commit.committedAt}`,
          ),
        ]
      : [];
  const fileSections = condensedFiles.map((file, index) => {
    const sections = [
      `${index + 1}. ${file.filename} (${file.status ?? "modified"}, +${file.additions ?? 0} / -${file.deletions ?? 0})${file.commitSha ? ` [${file.commitSha.slice(0, 7)}]` : ""}`,
      file.patch ? `Patch:\n${truncateText(file.patch, 500)}` : "Patch: unavailable",
    ];

    if (file.content) {
      sections.push(`Current file content snapshot:\n${truncateText(file.content, 900)}`);
    }

    return sections.join("\n");
  });

  return [
    `Repository: ${activeRepo}`,
    `Branch: ${commitContext.branch}`,
    `Commit SHA: ${commitContext.sha.slice(0, 12)}`,
    `Commit message: ${truncateText(commitContext.message, 220)}`,
    `Author: ${commitContext.author}`,
    `Committed at: ${commitContext.committedAt}`,
    `Commit URL: ${commitContext.url}`,
    `Stats: +${commitContext.stats.additions} / -${commitContext.stats.deletions} / ${commitContext.stats.total} total changes`,
    ...commitSummary,
    "Changed files:",
    ...fileSections,
    commitContext.files.length > condensedFiles.length
      ? `Additional changed files omitted: ${commitContext.files.length - condensedFiles.length}`
      : "",
    "User request:",
    truncateText(message, 260),
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function resolveChatRepositoryContext(
  userId: string,
  message: string,
  repo?: string,
  installationId?: string,
) {
  if (repo && installationId) {
    return { repo, installationId };
  }

  const repoHint = extractRepositoryNameFromMessage(message)?.toLowerCase();
  if (!repoHint) {
    return null;
  }

  const { data } = await supabase
    .from("installations")
    .select("installation_id, repos")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const installations = (data as InstallationRecord[] | null) ?? [];

  for (const installation of installations) {
    for (const repository of installation.repos ?? []) {
      const fullName = repository.full_name ?? "";
      const name = repository.name ?? fullName.split("/").pop() ?? "";

      if (
        fullName.toLowerCase() === repoHint ||
        name.toLowerCase() === repoHint ||
        fullName.toLowerCase().endsWith(`/${repoHint}`)
      ) {
        return {
          repo: fullName,
          installationId: installation.installation_id,
        };
      }
    }
  }

  return null;
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

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
  const branch = typeof payload?.branch === "string" ? payload.branch.trim() : "";

  if (!message) {
    return Response.json({ error: "message required" }, { status: 400 });
  }

  let activeSessionId = sessionId;
  if (!activeSessionId) {
    const { data: newSession } = await supabase
      .from("chat_sessions")
      .insert({ user_id: session.user.id, title: message.slice(0, 60) })
      .select()
      .single();
    activeSessionId = newSession?.id;
  }

  const resolvedRepoContext = await resolveChatRepositoryContext(
    session.user.id,
    message,
    repo,
    installationId,
  );
  const activeRepo = resolvedRepoContext?.repo ?? repo ?? null;
  const activeInstallationId = resolvedRepoContext?.installationId ?? installationId ?? null;
  const commitAnalysisRequest = isCommitAnalysisRequest(message);
  const requestedBranch = extractBranchNameFromMessage(message) ?? (branch || null);
  const requestedCommitSha = extractCommitShaFromMessage(message);
  const requestedCommitCount = extractCommitCountFromMessage(message);

  let bugId: string | null = null;
  if (isLikelyBugReport(message) && !commitAnalysisRequest) {
    const { data: bug } = await supabase
      .from("bugs")
      .insert({
        user_id: session.user.id,
        installation_id: activeInstallationId ?? null,
        repo: activeRepo ?? "unknown",
        stack_trace: message,
        source: "chat",
        status: "Investigating",
      })
      .select()
      .single();
    bugId = bug?.id ?? null;

    if (activeSessionId && bugId) {
      await supabase.from("chat_sessions").update({ bug_id: bugId }).eq("id", activeSessionId);
    }
  }

  let systemPrompt = ANALYSIS_SYSTEM_PROMPT;
  let userPrompt = message;

  if (commitAnalysisRequest) {
    if (!activeInstallationId || !activeRepo) {
      return Response.json(
        {
          error:
            "Select a connected repository or mention a connected repo name before asking for latest commit analysis.",
        },
        { status: 400 },
      );
    }

    const commitContext = requestedCommitSha
      ? await getCommitAnalysisContext(activeInstallationId, activeRepo, requestedCommitSha, requestedBranch ?? undefined)
      : requestedCommitCount && requestedCommitCount > 1
        ? await getRecentCommitAnalysisContext(activeInstallationId, activeRepo, requestedCommitCount, requestedBranch ?? undefined)
        : await getLatestCommitAnalysisContext(activeInstallationId, activeRepo, requestedBranch ?? undefined);
    systemPrompt = COMMIT_ANALYSIS_SYSTEM_PROMPT;
    userPrompt = buildCommitAnalysisPrompt(message, activeRepo, commitContext);

    if (activeSessionId) {
      await supabase
        .from("chat_sessions")
        .update({
          title: `Commit analysis: ${activeRepo.split("/").pop() ?? activeRepo}${requestedBranch ? ` (${requestedBranch})` : ""}`,
        })
        .eq("id", activeSessionId);
    }

    try {
      const { text } = await generateText({
        model:       getGroqModel(),
        system:      systemPrompt,
        prompt:      userPrompt,
        maxTokens:   8_000,
        abortSignal: AbortSignal.timeout(45_000),
      });
      const parsedCommitAnalysis = parseCommitAnalysisResponse(text);

      if (activeSessionId) {
        const { data: chatSession } = await supabase
          .from("chat_sessions")
          .select("messages")
          .eq("id", activeSessionId)
          .single();

        const existing = Array.isArray(chatSession?.messages)
          ? (chatSession.messages as ChatSessionMessage[])
          : [];

        await supabase
          .from("chat_sessions")
          .update({
            messages: [
              ...existing,
              { role: "user", content: message, createdAt: new Date().toISOString() },
              { role: "assistant", content: text, createdAt: new Date().toISOString(), bugId: null },
            ],
          })
          .eq("id", activeSessionId);
      }

      if (parsedCommitAnalysis) {
        try {
          await persistCommitAnalysisRecord(supabase as never, {
            userId: session.user.id,
            sessionId: activeSessionId,
            installationId: activeInstallationId,
            result: parsedCommitAnalysis,
          });
        } catch (persistError) {
          if (!isMissingCommitAnalysesTableError(persistError)) {
            console.warn("[/api/chat:commit-analysis:persist]", persistError);
          }
        }
      }

      return new Response(text, {
        status: 200,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-session-id": activeSessionId ?? "",
          "x-bug-id": "",
        },
      });
    } catch (error) {
      console.error("[/api/chat:commit-analysis]", error);
      return Response.json({ error: "Commit analysis failed." }, { status: 500 });
    }
  } else if (activeInstallationId && activeRepo) {
    const fileMatch = message.match(/(?:at |File "|in )([^\s()"]+\.(ts|tsx|js|jsx|py|java|kt|go|rb))/);
    const filePath = fileMatch?.[1];
    if (filePath) {
      try {
        const { content } = await fetchFileFromGitHub(activeInstallationId, activeRepo, filePath);
        systemPrompt += `\n\nAffected file content (${filePath}):\n\`\`\`\n${content.slice(0, 3000)}\n\`\`\``;
      } catch {
        // Missing file context should not block analysis.
      }
    }
  }

  let result;
  try {
    result = await streamText({
      model:       getGroqModel(),
      system:      systemPrompt,
      messages:    [{ role: "user", content: userPrompt }],
      maxTokens:   8_000,
      abortSignal: AbortSignal.timeout(45_000),
      onFinish: async ({ text }) => {
        const parsed = parseAnalysisResponse(text);

        if (parsed && bugId) {
          await supabase
            .from("bugs")
            .update({
              title: parsed.title,
              severity: parsed.severity,
              confidence: parsed.confidence,
              root_cause: parsed.root_cause,
              ai_suggestion: parsed.fix_steps.join("\n"),
              fix_steps: parsed.fix_steps,
              affected_file: parsed.affected_file,
              affected_function: parsed.affected_function,
              status: "Ready",
            })
            .eq("id", bugId);

          if (parsed.diff) {
            await supabase.from("patches").insert({
              bug_id: bugId,
              user_id: session.user.id,
              diff: parsed.diff,
              tests_generated: parsed.tests,
              status: "pending",
            });
          }

          if (activeSessionId && parsed.title) {
            await supabase.from("chat_sessions").update({ title: parsed.title }).eq("id", activeSessionId);
          }
        }

        if (activeSessionId) {
          const { data: chatSession } = await supabase
            .from("chat_sessions")
            .select("messages")
            .eq("id", activeSessionId)
            .single();

          const existing = Array.isArray(chatSession?.messages)
            ? (chatSession.messages as ChatSessionMessage[])
            : [];

          await supabase
            .from("chat_sessions")
            .update({
              messages: [
                ...existing,
                { role: "user", content: message, createdAt: new Date().toISOString() },
                { role: "assistant", content: text, createdAt: new Date().toISOString(), bugId },
              ],
            })
            .eq("id", activeSessionId);
        }
      },
    });
  } catch (error) {
    console.error("[/api/chat]", error);
    return Response.json({ error: "Chat generation failed." }, { status: 500 });
  }

  const response = result.toTextStreamResponse();
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("x-session-id", activeSessionId ?? "");
  responseHeaders.set("x-bug-id", bugId ?? "");

  return new Response(response.body, { headers: responseHeaders, status: response.status });
}
