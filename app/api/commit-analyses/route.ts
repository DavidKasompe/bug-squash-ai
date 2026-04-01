import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { isMissingCommitAnalysesTableError, loadCommitAnalysisRecords, type CommitAnalysisRecord } from "@/lib/commit-analyses";
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

function buildFallbackAnalyses(rows: SessionRow[]) {
  return rows
    .map((row) => {
      const latestAssistantMessage = [...(row.messages ?? [])]
        .reverse()
        .find((message) => message.role === "assistant");
      const commitAnalysis = latestAssistantMessage
        ? parseCommitAnalysisResponse(latestAssistantMessage.content)
        : null;

      if (!commitAnalysis) {
        return null;
      }

      return {
        id: row.id,
        session_id: row.id,
        title: commitAnalysis.title,
        repo: commitAnalysis.repo,
        branch: commitAnalysis.branch,
        commit_sha: commitAnalysis.commit_sha,
        summary: commitAnalysis.summary,
        context: commitAnalysis.context,
        confirmed_errors_count: commitAnalysis.confirmed_errors_count,
        potential_errors_count: commitAnalysis.potential_errors_count,
        changed_files: commitAnalysis.changed_files,
        confirmed_findings: commitAnalysis.confirmed_findings,
        potential_findings: commitAnalysis.potential_findings,
        recommended_checks: commitAnalysis.recommended_checks,
        created_at: row.created_at,
        bug: row.bugs?.[0] ?? null,
      };
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);
}

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
    .limit(50);

  if (error) {
    console.error("[api/commit-analyses:sessions]", error);
    return NextResponse.json({ error: "Failed to load commit analyses." }, { status: 500 });
  }

  const sessionRows = (data as SessionRow[] | null) ?? [];
  let persisted = new Map<string, CommitAnalysisRecord>();

  try {
    persisted = await loadCommitAnalysisRecords(
      supabase as never,
      sessionRows.map((row) => row.id),
    );
  } catch (persistError) {
    if (!isMissingCommitAnalysesTableError(persistError)) {
      console.warn("[api/commit-analyses:persisted]", persistError);
    }
  }

  const analyses = sessionRows
    .map((row) => {
      const persistedRecord = persisted.get(row.id);
      if (persistedRecord) {
        return {
          id: persistedRecord.id,
          session_id: row.id,
          title: persistedRecord.title ?? row.title ?? "Commit analysis",
          repo: persistedRecord.repo,
          branch: persistedRecord.branch ?? "unknown",
          commit_sha: persistedRecord.commit_sha,
          summary: persistedRecord.summary ?? "",
          context: persistedRecord.context ?? "",
          confirmed_errors_count: persistedRecord.confirmed_errors_count,
          potential_errors_count: persistedRecord.potential_errors_count,
          changed_files: persistedRecord.changed_files ?? [],
          confirmed_findings: persistedRecord.confirmed_findings ?? [],
          potential_findings: persistedRecord.potential_findings ?? [],
          recommended_checks: persistedRecord.recommended_checks ?? [],
          created_at: persistedRecord.created_at ?? row.created_at,
          bug: row.bugs?.[0] ?? null,
        };
      }

      return null;
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);

  const persistedSessionIds = new Set(analyses.map((analysis) => analysis.session_id));
  const fallback = buildFallbackAnalyses(
    sessionRows.filter((row) => !persistedSessionIds.has(row.id)),
  );

  return NextResponse.json({
    analyses: [...analyses, ...fallback].sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    ),
  });
}
