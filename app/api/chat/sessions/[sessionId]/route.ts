import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { isMissingCommitAnalysesTableError, loadCommitAnalysisRecords } from "@/lib/commit-analyses";
import { parseCommitAnalysisResponse } from "@/lib/prompts";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  bugId?: string | null;
};

type BugRow = {
  id: string;
  title: string | null;
  status: string;
  severity: string;
  repo: string;
  installation_id: string | null;
};

type SessionRow = {
  id: string;
  title: string | null;
  created_at: string;
  bug_id: string | null;
  messages: StoredMessage[] | null;
  bugs: BugRow[] | null;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { sessionId } = await params;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, bug_id, messages, bugs(id, title, status, severity, repo, installation_id)")
    .eq("id", sessionId)
    .eq("user_id", session.user.id)
    .single();

  const sessionRow = data as SessionRow | null;

  if (error || !sessionRow) {
    return NextResponse.json({ error: "Chat session not found." }, { status: 404 });
  }

  const messages = (sessionRow.messages ?? []).map((message, index) => ({
    id: `${sessionRow.id}-${index}`,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt ?? null,
    bugId: message.bugId ?? null,
  }));
  let persistedCommitAnalysis:
    | {
        repo: string;
        branch: string | null;
        commit_sha: string;
        title: string | null;
      }
    | undefined;
  try {
    persistedCommitAnalysis = (await loadCommitAnalysisRecords(supabase as never, [sessionRow.id])).get(sessionRow.id);
  } catch (commitAnalysisError) {
    if (!isMissingCommitAnalysesTableError(commitAnalysisError)) {
      console.warn("[api/chat/sessions/[sessionId]:commit-analyses]", commitAnalysisError);
    }
  }
  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const commitAnalysis = latestAssistantMessage
    ? parseCommitAnalysisResponse(latestAssistantMessage.content)
    : null;

  return NextResponse.json({
    session: {
      id: sessionRow.id,
      title: sessionRow.title,
      created_at: sessionRow.created_at,
      bug_id: sessionRow.bug_id,
      bug: sessionRow.bugs?.[0] ?? null,
      session_type: persistedCommitAnalysis || commitAnalysis ? "commit-analysis" : "bug-chat",
      commit_analysis: persistedCommitAnalysis
        ? {
            repo: persistedCommitAnalysis.repo,
            branch: persistedCommitAnalysis.branch ?? "unknown",
            commit_sha: persistedCommitAnalysis.commit_sha,
            title: persistedCommitAnalysis.title ?? sessionRow.title ?? "Commit analysis",
          }
        : commitAnalysis
        ? {
            repo: commitAnalysis.repo,
            branch: commitAnalysis.branch,
            commit_sha: commitAnalysis.commit_sha,
            title: commitAnalysis.title,
          }
        : null,
      messages,
    },
  });
}
