"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brain, FileCode2, GitBranch, Loader2 } from "lucide-react";

type CommitAnalysisFinding = {
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  detail?: string | null;
  file?: string | null;
};

type CommitAnalysisDetail = {
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
  confirmed_findings: CommitAnalysisFinding[];
  potential_findings: CommitAnalysisFinding[];
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

function severityClassName(severity: CommitAnalysisFinding["severity"]) {
  if (severity === "Critical") return "bg-red-100 text-red-700";
  if (severity === "High") return "bg-orange-100 text-orange-700";
  if (severity === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export default function CommitAnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CommitAnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    void params.then((resolved) => {
      if (isActive) {
        setAnalysisId(resolved.id);
      }
    });

    return () => {
      isActive = false;
    };
  }, [params]);

  useEffect(() => {
    if (!analysisId) {
      return;
    }

    let isActive = true;

    async function loadAnalysis() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/commit-analyses/${analysisId}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load commit analysis.");
        }

        if (isActive) {
          setAnalysis((payload.analysis as CommitAnalysisDetail) ?? null);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load commit analysis.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadAnalysis();

    return () => {
      isActive = false;
    };
  }, [analysisId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-black/[0.05] bg-white px-5 py-4 text-sm text-black/50">
        <Loader2 className="size-4 animate-spin" />
        Loading commit analysis...
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error ?? "Commit analysis not found."}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-3">
        <Link href={"/commit-analyses" as never} className="text-sm text-black/45 hover:text-black/70">
          Back to commit analyses
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2A6948]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#2A6948]">
            <Brain className="size-3" />
            Commit Analysis
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F4F0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black/45">
            <GitBranch className="size-3" />
            {analysis.branch}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111]">{analysis.title}</h1>
        <div className="flex items-center gap-3 text-xs text-black/40 flex-wrap">
          <span className="font-mono">{analysis.repo}</span>
          <span className="font-mono">{analysis.commit_sha.slice(0, 7)}</span>
          <span>{new Date(analysis.created_at).toLocaleString()}</span>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-black/55">{analysis.summary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-black/[0.05] bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Confirmed</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#111111]">
            {analysis.confirmed_errors_count ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-black/[0.05] bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Potential</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#111111]">
            {analysis.potential_errors_count ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-black/[0.05] bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Changed Files</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-[#111111]">
            {analysis.changed_files.length}
          </p>
        </div>
        <div className="rounded-2xl border border-black/[0.05] bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Linked Issue</p>
          {analysis.bug ? (
            <Link
              href={`/issues/${analysis.bug.id}`}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2A6948]"
            >
              <FileCode2 className="size-4" />
              View issue
            </Link>
          ) : (
            <p className="mt-3 text-sm text-black/45">No linked issue yet.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-black/[0.05] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Context</p>
            <p className="mt-3 text-sm leading-relaxed text-black/60">{analysis.context}</p>
          </section>

          <section className="rounded-2xl border border-black/[0.05] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Confirmed Findings</p>
            <div className="mt-4 space-y-3">
              {analysis.confirmed_findings.length > 0 ? (
                analysis.confirmed_findings.map((finding, index) => (
                  <div key={`${finding.title}-${index}`} className="rounded-xl border border-black/[0.05] bg-[#F5F4F0] p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${severityClassName(finding.severity)}`}>
                        {finding.severity}
                      </span>
                      <span className="text-sm font-semibold text-[#111111]">{finding.title}</span>
                      <span className="ml-auto text-xs font-bold text-[#2A6948]">{finding.confidence}%</span>
                    </div>
                    {finding.file ? <p className="mt-2 font-mono text-xs text-black/40">{finding.file}</p> : null}
                    {finding.detail ? <p className="mt-2 text-sm leading-relaxed text-black/60">{finding.detail}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-black/45">No confirmed findings were recorded.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.05] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Potential Findings</p>
            <div className="mt-4 space-y-3">
              {analysis.potential_findings.length > 0 ? (
                analysis.potential_findings.map((finding, index) => (
                  <div key={`${finding.title}-${index}`} className="rounded-xl border border-black/[0.05] bg-[#F5F4F0] p-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${severityClassName(finding.severity)}`}>
                        {finding.severity}
                      </span>
                      <span className="text-sm font-semibold text-[#111111]">{finding.title}</span>
                      <span className="ml-auto text-xs font-bold text-[#2A6948]">{finding.confidence}%</span>
                    </div>
                    {finding.file ? <p className="mt-2 font-mono text-xs text-black/40">{finding.file}</p> : null}
                    {finding.detail ? <p className="mt-2 text-sm leading-relaxed text-black/60">{finding.detail}</p> : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-black/45">No potential findings were recorded.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-black/[0.05] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Changed Files</p>
            <div className="mt-4 space-y-2">
              {analysis.changed_files.length > 0 ? (
                analysis.changed_files.map((filePath) => (
                  <div key={filePath} className="rounded-xl bg-[#F5F4F0] px-3 py-2 font-mono text-xs text-black/60">
                    {filePath}
                  </div>
                ))
              ) : (
                <p className="text-sm text-black/45">No changed files were stored.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.05] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Recommended Checks</p>
            <div className="mt-4 space-y-2">
              {analysis.recommended_checks.length > 0 ? (
                analysis.recommended_checks.map((check, index) => (
                  <div key={`${check}-${index}`} className="rounded-xl bg-[#F5F4F0] px-3 py-2 text-sm text-black/60">
                    {check}
                  </div>
                ))
              ) : (
                <p className="text-sm text-black/45">No recommended checks were recorded.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-black/[0.05] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Actions</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/overview?session=${analysis.session_id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2A6948] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E4A31]"
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
                  Open issue
                </Link>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
