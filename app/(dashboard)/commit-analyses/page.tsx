"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Brain, FileCode2, Loader2 } from "lucide-react";

type CommitAnalysisListItem = {
  id: string;
  session_id: string;
  title: string;
  repo: string;
  branch: string;
  commit_sha: string;
  summary: string;
  context: string;
  confirmed_errors_count: number | null;
  potential_errors_count: number | null;
  changed_files: string[];
  confirmed_findings: Array<{
    title: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    confidence: number;
    detail?: string | null;
    file?: string | null;
  }>;
  potential_findings: Array<{
    title: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    confidence: number;
    detail?: string | null;
    file?: string | null;
  }>;
  recommended_checks: string[];
  created_at: string;
  bug: {
    id: string;
    title: string | null;
    status: string;
    severity: string;
    repo: string;
    installation_id: string | null;
  } | null;
};

export default function CommitAnalysesPage() {
  const [analyses, setAnalyses] = useState<CommitAnalysisListItem[]>([]);
  const [filter, setFilter] = useState("");
  const [repoFilter, setRepoFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAnalyses() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/commit-analyses", {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load commit analyses.");
        }

        if (isActive) {
          setAnalyses((payload.analyses as CommitAnalysisListItem[]) ?? []);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load commit analyses.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadAnalyses();

    return () => {
      isActive = false;
    };
  }, []);

  const availableRepos = useMemo(() => {
    return Array.from(new Set(analyses.map((analysis) => analysis.repo))).sort((left, right) =>
      left.localeCompare(right),
    );
  }, [analyses]);

  const availableBranches = useMemo(() => {
    const branchSet = new Set(
      analyses
        .filter((analysis) => repoFilter === "all" || analysis.repo === repoFilter)
        .map((analysis) => analysis.branch),
    );

    return Array.from(branchSet).sort((left, right) => left.localeCompare(right));
  }, [analyses, repoFilter]);

  const filteredAnalyses = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase();

    return analyses.filter((analysis) => {
      if (repoFilter !== "all" && analysis.repo !== repoFilter) {
        return false;
      }

      if (branchFilter !== "all" && analysis.branch !== branchFilter) {
        return false;
      }

      if (!normalizedFilter) {
        return true;
      }

      return [
        analysis.title,
        analysis.repo,
        analysis.branch,
        analysis.commit_sha,
        analysis.bug?.title ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedFilter);
    });
  }, [analyses, branchFilter, filter, repoFilter]);

  const summary = useMemo(() => {
    const linkedIssues = filteredAnalyses.filter((analysis) => analysis.bug).length;

    return {
      total: filteredAnalyses.length,
      linkedIssues,
      unlinkedIssues: filteredAnalyses.length - linkedIssues,
      confirmed: filteredAnalyses.reduce(
        (sum, analysis) => sum + (analysis.confirmed_errors_count ?? 0),
        0,
      ),
      potential: filteredAnalyses.reduce(
        (sum, analysis) => sum + (analysis.potential_errors_count ?? 0),
        0,
      ),
    };
  }, [filteredAnalyses]);

  useEffect(() => {
    if (repoFilter !== "all" && !availableRepos.includes(repoFilter)) {
      setRepoFilter("all");
    }
  }, [availableRepos, repoFilter]);

  useEffect(() => {
    if (branchFilter !== "all" && !availableBranches.includes(branchFilter)) {
      setBranchFilter("all");
    }
  }, [availableBranches, branchFilter]);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono font-semibold text-black/30 uppercase tracking-[0.15em] mb-2">
            Mirai / Commit Analyses
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#111111] mb-1">Commit Analyses</h1>
          <p className="text-sm text-black/50 max-w-2xl">
            Review saved commit analyses, jump back into the original session, and open the linked issue or patch draft when a finding was promoted into the bug workflow.
          </p>
        </div>
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter by repo, branch, SHA, or title"
          className="w-72 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-black/60 outline-none placeholder:text-black/25"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-black/[0.05] bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Analyses</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#111111]">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-black/[0.05] bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Linked Issues</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#2A6948]">{summary.linkedIssues}</p>
        </div>
        <div className="rounded-2xl border border-red-50 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Confirmed Findings</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-red-600">{summary.confirmed}</p>
        </div>
        <div className="rounded-2xl border border-amber-50 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Potential Findings</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-amber-600">{summary.potential}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={repoFilter}
          onChange={(event) => {
            setRepoFilter(event.target.value);
            setBranchFilter("all");
          }}
          className="rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-black/60 outline-none"
        >
          <option value="all">All repos</option>
          {availableRepos.map((repo) => (
            <option key={repo} value={repo}>
              {repo}
            </option>
          ))}
        </select>
        <select
          value={branchFilter}
          onChange={(event) => setBranchFilter(event.target.value)}
          className="rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-black/60 outline-none"
        >
          <option value="all">All branches</option>
          {availableBranches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-black/[0.05] bg-white px-5 py-4 text-sm text-black/50">
          <Loader2 className="size-4 animate-spin" />
          Loading commit analyses...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="rounded-2xl border border-black/[0.05] bg-white px-5 py-10 text-center text-sm text-black/40">
          No commit analyses found yet.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnalyses.map((analysis) => (
            <div key={analysis.id} className="rounded-2xl border border-black/[0.05] bg-white p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#2A6948]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#2A6948]">
                      <Brain className="size-3" />
                      Commit Analysis
                    </span>
                    <span className="text-sm font-bold text-[#111111]">{analysis.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-black/40 flex-wrap">
                    <span className="font-mono">{analysis.repo}</span>
                    <span className="font-mono">{analysis.branch}</span>
                    <span className="font-mono">{analysis.commit_sha.slice(0, 7)}</span>
                    <span>{new Date(analysis.created_at).toLocaleString()}</span>
                  </div>
                  {analysis.summary ? (
                    <p className="max-w-3xl text-sm leading-relaxed text-black/55">{analysis.summary}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    (analysis.confirmed_errors_count ?? 0) > 0
                      ? "bg-red-50 text-red-600"
                      : "bg-[#F5F4F0] text-black/40"
                  }`}>
                    <span className="font-bold">{analysis.confirmed_errors_count ?? 0}</span>
                    {" "}confirmed
                  </div>
                  <div className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    (analysis.potential_errors_count ?? 0) > 0
                      ? "bg-amber-50 text-amber-600"
                      : "bg-[#F5F4F0] text-black/40"
                  }`}>
                    <span className="font-bold">{analysis.potential_errors_count ?? 0}</span>
                    {" "}potential
                  </div>
                </div>
              </div>

              {analysis.changed_files.length > 0 ? (
                <div className="mt-4 rounded-xl bg-[#F5F4F0] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Changed Files</p>
                  <div className="mt-3 grid gap-2">
                    {analysis.changed_files.slice(0, 6).map((filePath) => (
                      <div key={filePath} className="text-xs font-mono text-black/60">
                        {filePath}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <Link
                  href={`/commit-analyses/${analysis.id}` as never}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2A6948] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E4A31]"
                >
                  <Brain className="size-3.5" />
                  Open analysis
                </Link>
                <Link
                  href={`/overview?session=${analysis.session_id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-xs font-semibold text-black/65 hover:bg-black/[0.02]"
                >
                  <Brain className="size-3.5" />
                  Open in chat
                </Link>
                {analysis.bug ? (
                  <Link
                    href={`/issues/${analysis.bug.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-xs font-semibold text-black/65 hover:bg-black/[0.02]"
                  >
                    <FileCode2 className="size-3.5" />
                    View linked issue
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
