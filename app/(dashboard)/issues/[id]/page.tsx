import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, FileCode2, ListChecks, TestTube2 } from "lucide-react";

import { CreatePrButton } from "@/components/mirai/create-pr-button";
import { getServerSession } from "@/lib/auth";
import { loadCommitAnalysisRecords } from "@/lib/commit-analyses";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

type BugRecord = {
  id: string;
  user_id: string;
  title: string | null;
  severity: string;
  status: string;
  repo: string;
  confidence: number | null;
  affected_file: string | null;
  affected_function: string | null;
  root_cause: string | null;
  ai_suggestion: string | null;
  fix_steps: string[] | null;
  installation_id: string | null;
  source: string | null;
};

type PatchRecord = {
  id: string;
  diff: string;
  tests_generated: string[] | null;
  pr_url: string | null;
  status: string;
};

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user || !isSupabaseConfigured) {
    notFound();
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: bugData, error: bugError } = await supabase
    .from("bugs")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  const bug = bugData as BugRecord | null;

  if (bugError || !bug) {
    notFound();
  }

  const { data: patchData } = await supabase
    .from("patches")
    .select("id, diff, tests_generated, pr_url, status")
    .eq("bug_id", bug.id)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const patch = patchData as PatchRecord | null;
  const { data: sessionLink } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("bug_id", bug.id)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const linkedSessionId = sessionLink?.id ?? null;

  let linkedCommitAnalysis: {
    id: string;
    title: string | null;
    repo: string;
    branch: string | null;
    commit_sha: string;
  } | null = null;

  if (linkedSessionId) {
    try {
      const records = await loadCommitAnalysisRecords(supabase as never, [linkedSessionId]);
      const record = records.get(linkedSessionId);
      if (record) {
        linkedCommitAnalysis = {
          id: record.id,
          title: record.title,
          repo: record.repo,
          branch: record.branch,
          commit_sha: record.commit_sha,
        };
      }
    } catch (commitAnalysisError) {
      console.warn("[issues/[id]:commit-analysis]", commitAnalysisError);
    }
  }

  const disabledReason = !patch
    ? "No patch has been generated for this bug yet."
    : !bug.installation_id
      ? "Connect a GitHub repository in Connections before opening a pull request."
      : !bug.affected_file
        ? "Mirai could not identify the affected file for this bug."
        : null;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <Link
          href="/issues"
          className="inline-flex items-center gap-2 text-sm font-medium text-black/50 transition-colors hover:text-black"
        >
          <ArrowLeft className="size-4" />
          Back to bug reports
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-600">
            {bug.severity}
          </span>
          <span className="rounded-full bg-black/[0.05] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black/50">
            {bug.status}
          </span>
          <span className="text-xs font-mono text-black/30">{bug.repo}</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#111111]">
          {bug.title ?? "Untitled bug"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-black/50">
          {bug.root_cause ?? bug.ai_suggestion ?? "Mirai has not attached a root cause summary yet."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.05] bg-white p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">
            <AlertTriangle className="mr-1 inline size-3 text-[#2A6948]" />
            Confidence
          </div>
          <div className="mt-2 text-4xl font-bold text-[#2A6948]">
            {bug.confidence != null ? `${bug.confidence}%` : "--"}
          </div>
        </div>
        <div className="rounded-2xl border border-black/[0.05] bg-white p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">
            Affected file
          </div>
          <div className="mt-2 break-all text-sm font-mono text-[#111111]">
            {bug.affected_file ?? "Not identified"}
          </div>
        </div>
        <div className="rounded-2xl border border-black/[0.05] bg-white p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">
            Function
          </div>
          <div className="mt-2 text-sm font-mono text-[#111111]">
            {bug.affected_function ? `${bug.affected_function}()` : "Not identified"}
          </div>
        </div>
      </div>

      {linkedCommitAnalysis ? (
        <div className="rounded-2xl border border-black/[0.05] bg-white p-6">
          <div className="flex items-center gap-2">
            <FileCode2 className="size-4 text-black/40" />
            <h2 className="text-sm font-semibold text-[#111111]">Originating commit analysis</h2>
          </div>
          <div className="mt-4 flex items-center gap-3 flex-wrap text-xs text-black/40">
            <span className="font-mono">{linkedCommitAnalysis.repo}</span>
            <span className="font-mono">{linkedCommitAnalysis.branch ?? "unknown"}</span>
            <span className="font-mono">{linkedCommitAnalysis.commit_sha.slice(0, 7)}</span>
          </div>
          <p className="mt-3 text-sm text-black/55">
            {linkedCommitAnalysis.title ?? "This bug was created from a commit-analysis finding."}
          </p>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Link
              href={`/commit-analyses/${linkedCommitAnalysis.id}` as never}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2A6948] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E4A31]"
            >
              <FileCode2 className="size-3.5" />
              Open commit analysis
            </Link>
            {linkedSessionId ? (
              <Link
                href={`/overview?session=${linkedSessionId}`}
                className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-xs font-semibold text-black/65 hover:bg-black/[0.02]"
              >
                <ArrowLeft className="size-3.5" />
                Open in chat
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {(bug.fix_steps ?? []).length > 0 ? (
        <div className="rounded-2xl border border-black/[0.05] bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <ListChecks className="size-4 text-[#2A6948]" />
            <h2 className="text-sm font-semibold text-[#111111]">Fix steps</h2>
          </div>
          <div className="space-y-3">
            {(bug.fix_steps ?? []).map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2A6948]/10 text-[10px] font-bold text-[#2A6948]">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-black/65">{step}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-black/[0.05] bg-white p-6">
        <div className="flex items-center gap-2">
          <FileCode2 className="size-4 text-black/40" />
          <h2 className="text-sm font-semibold text-[#111111]">Patch preview</h2>
        </div>
        {patch?.diff ? (
          <div className="mt-4 overflow-hidden rounded-2xl bg-[#111111]">
            {patch.diff.split("\n").map((line, i) => {
              const cls =
                line.startsWith("+") && !line.startsWith("+++")
                  ? "bg-[#2A6948]/10 text-[#5fba87]"
                  : line.startsWith("-") && !line.startsWith("---")
                    ? "bg-red-500/10 text-red-400"
                    : line.startsWith("@@")
                      ? "text-blue-400/60"
                      : "text-white/35";
              return (
                <div key={i} className={`px-4 py-0.5 font-mono text-xs leading-6 ${cls}`}>
                  {line || "\u00A0"}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-black/40">No patch diff available yet.</p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-black/[0.05] bg-white p-6">
          <div className="flex items-center gap-2">
            <TestTube2 className="size-4 text-[#2A6948]" />
            <h2 className="text-sm font-semibold text-[#111111]">Generated tests</h2>
          </div>
          <div className="mt-4 space-y-2">
            {(patch?.tests_generated ?? []).length > 0 ? (
              (patch?.tests_generated ?? []).map((testName) => (
                <div
                  key={testName}
                  className="rounded-xl border border-black/[0.05] bg-[#F5F4F0] px-4 py-3 text-sm text-black/70"
                >
                  {testName}
                </div>
              ))
            ) : (
              <p className="text-sm text-black/40">No generated tests are attached to this patch.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.05] bg-white p-6 lg:w-80">
          <p className="text-sm font-semibold text-[#111111]">GitHub actions</p>
          <p className="mt-2 text-sm text-black/50">
            Open a pull request for this patch once the bug has a GitHub installation and repository context.
          </p>
          <div className="mt-6">
            <CreatePrButton patchId={patch?.id ?? null} prUrl={patch?.pr_url ?? null} disabledReason={disabledReason} />
          </div>
        </div>
      </div>
    </div>
  );
}
