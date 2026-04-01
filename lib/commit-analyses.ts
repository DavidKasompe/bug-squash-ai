import type { CommitAnalysisResult } from "@/lib/prompts";

type MinimalSupabaseClient = {
  from: (table: string) => {
    upsert: (values: Record<string, unknown>, options?: Record<string, unknown>) => {
      select: (columns: string) => {
        single: () => PromiseLike<{ data: { id: string } | null; error: { message?: string } | null }>;
      };
    };
    select: (columns: string) => {
      in: (column: string, values: string[]) => PromiseLike<{ data: CommitAnalysisRecord[] | null; error: { message?: string } | null }>;
    };
  };
};

export type CommitAnalysisRecord = {
  id: string;
  session_id: string | null;
  repo: string;
  branch: string | null;
  commit_sha: string;
  title: string | null;
  summary: string | null;
  context: string | null;
  changed_files: string[] | null;
  confirmed_errors_count: number | null;
  potential_errors_count: number | null;
  confirmed_errors: string[] | null;
  potential_errors: string[] | null;
  confirmed_findings: CommitAnalysisResult["confirmed_findings"] | null;
  potential_findings: CommitAnalysisResult["potential_findings"] | null;
  recommended_checks: string[] | null;
  created_at: string | null;
};

export function isMissingCommitAnalysesTableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /public\.commit_analyses|Failed to (persist|load) commit analys/i.test(error.message);
}

export async function persistCommitAnalysisRecord(
  supabase: MinimalSupabaseClient,
  input: {
    userId: string;
    sessionId?: string | null;
    installationId?: string | null;
    result: CommitAnalysisResult;
  },
) {
  const payload = {
    user_id: input.userId,
    session_id: input.sessionId ?? null,
    installation_id: input.installationId ?? null,
    repo: input.result.repo,
    branch: input.result.branch,
    commit_sha: input.result.commit_sha,
    commit_message: input.result.commit_message,
    title: input.result.title,
    summary: input.result.summary,
    context: input.result.context,
    changed_files: input.result.changed_files,
    confirmed_errors_count: input.result.confirmed_errors_count,
    potential_errors_count: input.result.potential_errors_count,
    confirmed_errors: input.result.confirmed_errors,
    potential_errors: input.result.potential_errors,
    confirmed_findings: input.result.confirmed_findings,
    potential_findings: input.result.potential_findings,
    recommended_checks: input.result.recommended_checks,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("commit_analyses")
    .upsert(payload, { onConflict: "session_id" })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message ?? "Failed to persist commit analysis.");
  }

  return data?.id ?? null;
}

export async function loadCommitAnalysisRecords(
  supabase: MinimalSupabaseClient,
  sessionIds: string[],
) {
  if (sessionIds.length === 0) {
    return new Map<string, CommitAnalysisRecord>();
  }

  const { data, error } = await supabase
    .from("commit_analyses")
    .select("id, session_id, repo, branch, commit_sha, title, summary, context, changed_files, confirmed_errors_count, potential_errors_count, confirmed_errors, potential_errors, confirmed_findings, potential_findings, recommended_checks, created_at")
    .in("session_id", sessionIds);

  if (error) {
    throw new Error(error.message ?? "Failed to load commit analyses.");
  }

  return new Map(
    ((data as CommitAnalysisRecord[] | null) ?? [])
      .filter((record) => typeof record.session_id === "string" && record.session_id.length > 0)
      .map((record) => [record.session_id as string, record]),
  );
}
