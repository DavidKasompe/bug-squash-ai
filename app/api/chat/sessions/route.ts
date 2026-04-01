import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { isMissingCommitAnalysesTableError, loadCommitAnalysisRecords } from "@/lib/commit-analyses";
import { parseCommitAnalysisResponse } from "@/lib/prompts";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

type SessionRow = {
  id: string;
  title: string | null;
  created_at: string;
  bug_id: string | null;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }> | null;
  bugs: Array<{
    id: string;
    title: string | null;
    status: string;
    severity: string;
    repo: string;
    installation_id: string | null;
  }> | null;
};

export async function GET() {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, bug_id, messages, bugs(id, title, status, severity, repo, installation_id)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[api/chat/sessions]", error);
    return NextResponse.json({ error: "Failed to load chat sessions." }, { status: 500 });
  }

  let persistedCommitAnalyses = new Map<string, { repo: string; branch: string | null; commit_sha: string; title: string | null }>();
  try {
    persistedCommitAnalyses = await loadCommitAnalysisRecords(
      supabase as never,
      ((data as SessionRow[] | null) ?? []).map((row) => row.id),
    );
  } catch (commitAnalysisError) {
    if (!isMissingCommitAnalysesTableError(commitAnalysisError)) {
      console.warn("[api/chat/sessions:commit-analyses]", commitAnalysisError);
    }
  }

  const sessions = ((data as SessionRow[] | null) ?? []).map((row) => {
    const persistedCommitAnalysis = persistedCommitAnalyses.get(row.id);
    const latestAssistantMessage = [...(row.messages ?? [])]
      .reverse()
      .find((message) => message.role === "assistant");
    const commitAnalysis = latestAssistantMessage
      ? parseCommitAnalysisResponse(latestAssistantMessage.content)
      : null;

    return {
      id: row.id,
      title: row.title,
      created_at: row.created_at,
      bug_id: row.bug_id,
      bug: row.bugs?.[0] ?? null,
      session_type: persistedCommitAnalysis || commitAnalysis ? "commit-analysis" : "bug-chat",
      commit_analysis: persistedCommitAnalysis
        ? {
            repo: persistedCommitAnalysis.repo,
            branch: persistedCommitAnalysis.branch ?? "unknown",
            commit_sha: persistedCommitAnalysis.commit_sha,
            title: persistedCommitAnalysis.title ?? row.title ?? "Commit analysis",
          }
        : commitAnalysis
        ? {
            repo: commitAnalysis.repo,
            branch: commitAnalysis.branch,
            commit_sha: commitAnalysis.commit_sha,
            title: commitAnalysis.title,
          }
        : null,
    };
  });

  return NextResponse.json({ sessions });
}
