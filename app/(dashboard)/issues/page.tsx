"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Cpu, Filter, RefreshCw, Upload } from "lucide-react";
import Link from "next/link";

type Bug = {
  id: string;
  title: string | null;
  severity: string;
  status: string;
  repo: string;
  confidence: number | null;
  affected_file: string | null;
  affected_function: string | null;
  ai_suggestion: string | null;
  created_at: string;
  source: string;
};

const severityColor: Record<string, string> = {
  Critical: "bg-red-50 text-red-600",
  High: "bg-orange-50 text-orange-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-blue-50 text-blue-600",
};

const statusColor: Record<string, string> = {
  Detected: "bg-black/[0.05] text-black/50",
  Investigating: "bg-blue-50 text-blue-600",
  Ready: "bg-[#2A6948]/10 text-[#2A6948]",
  Patching: "bg-amber-50 text-amber-600",
  Resolved: "bg-[#2A6948]/10 text-[#2A6948]",
};

const SEVERITIES = ["Critical", "High", "Medium", "Low"];
const SOURCE_LABELS: Record<string, string> = {
  chat: "AI chat",
  upload: "Upload",
  manual: "Manual",
  commit_analysis: "Commit analysis",
  github_webhook: "GitHub webhook",
  github_actions: "GitHub actions",
};

export default function BugReportsPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    let isActive = true;

    async function loadBugs() {
      try {
        const response = await fetch("/api/bugs", {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load bugs.");
        }

        if (isActive) {
          setBugs((payload.bugs as Bug[]) ?? []);
        }
      } catch (error) {
        console.error("[issues/page]", error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadBugs();
    const intervalId = window.setInterval(() => {
      void loadBugs();
    }, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const availableSources = Array.from(new Set(bugs.map((bug) => bug.source).filter(Boolean))).sort();
  const displayed = bugs.filter((bug) => {
    if (filter && bug.severity !== filter) {
      return false;
    }

    if (sourceFilter !== "all" && bug.source !== sourceFilter) {
      return false;
    }

    return true;
  });
  const critical = bugs.filter((bug) => bug.severity === "Critical" || bug.severity === "High").length;
  const ready = bugs.filter((bug) => bug.status === "Ready").length;
  const commitDerived = bugs.filter((bug) => bug.source === "commit_analysis").length;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="mb-2 text-xs font-mono font-semibold uppercase tracking-[0.15em] text-black/30">
          Mirai / Dashboard
        </p>
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-[#111111]">
          Bug reports ready for action
        </h1>
        <p className="max-w-lg text-sm text-black/50">
          Review detected issues, inspect AI confidence, and move into patch generation.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "Visible bugs", value: bugs.length },
          { label: "Critical + high", value: critical },
          { label: "Ready for patch", value: ready },
          { label: "Commit-derived", value: commitDerived },
        ].map((stat) => (
          <div
            key={stat.label}
            className="min-w-[130px] rounded-2xl border border-black/[0.05] bg-white px-5 py-4"
          >
            <div className="mb-1 text-xs font-medium text-black/40">{stat.label}</div>
            <div className="text-2xl font-bold text-[#111111]">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/[0.05] bg-white px-5 py-4">
        <div className="mr-2 flex items-center gap-2 text-xs font-bold text-black/40">
          <Filter className="size-3.5" />
          Filters
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/35">Severity</span>
          <button
            onClick={() => setFilter(null)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              !filter
                ? "border-[#2A6948] bg-[#2A6948]/[0.06] text-[#2A6948]"
                : "border-black/[0.08] text-black/60 hover:bg-black/[0.03]"
            }`}
          >
            All
          </button>
          {SEVERITIES.map((severity) => (
            <button
              key={severity}
              onClick={() => setFilter((current) => (current === severity ? null : severity))}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === severity
                  ? "border-[#2A6948] bg-[#2A6948]/[0.06] text-[#2A6948]"
                  : "border-black/[0.08] text-black/60 hover:bg-black/[0.03]"
              }`}
            >
              {severity}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black/35">Source</span>
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-black/60 outline-none"
          >
            <option value="all">All sources</option>
            {availableSources.map((source) => (
              <option key={source} value={source}>
                {SOURCE_LABELS[source] ?? source}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Link
        href="/overview"
        className="flex items-center gap-3 rounded-2xl border border-[#2A6948]/10 bg-[#2A6948]/[0.05] px-5 py-3.5 transition-colors hover:bg-[#2A6948]/[0.08]"
      >
        <Upload className="size-4 text-[#2A6948]" />
        <span className="text-sm font-semibold text-[#2A6948]">
          Paste a stack trace in the AI chat to create a new bug
        </span>
        <ArrowRight className="ml-auto size-4 text-[#2A6948]" />
      </Link>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-black/30">
          <RefreshCw className="size-4 animate-spin" />
          <span className="text-sm">Loading bugs...</span>
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-16 text-center text-black/30">
          <Cpu className="mx-auto mb-3 size-8 opacity-30" />
          <p className="text-sm font-medium">
            {filter ? `No ${filter} bugs found` : "No bugs detected yet"}
          </p>
          <p className="mt-1 text-xs">
            Connect a GitHub repo or paste a trace in the AI chat to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((bug) => (
            <div
              key={bug.id}
              className="flex flex-col gap-6 rounded-2xl border border-black/[0.05] bg-white p-6 lg:flex-row lg:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      severityColor[bug.severity] ?? "bg-black/[0.05] text-black/40"
                    }`}
                  >
                    {bug.severity}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      statusColor[bug.status] ?? "bg-black/[0.05] text-black/40"
                    }`}
                  >
                    {bug.status === "Investigating" ? (
                      <span className="flex items-center gap-1">
                        <span className="inline-block size-1 rounded-full bg-blue-600 animate-pulse" />
                        {bug.status}
                      </span>
                    ) : (
                      bug.status
                    )}
                  </span>
                  <span className="rounded bg-black/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black/45">
                    {SOURCE_LABELS[bug.source] ?? bug.source}
                  </span>
                  <span className="text-xs font-mono text-black/30">{bug.repo}</span>
                </div>
                <h3 className="mb-1.5 text-base font-bold text-[#111111]">
                  {bug.title ?? "Analyzing..."}
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {bug.affected_file ? (
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#111111]">
                        Affected file
                      </div>
                      <div className="text-xs font-mono text-black/40">{bug.affected_file}</div>
                    </div>
                  ) : null}
                  {bug.affected_function ? (
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#111111]">
                        Function
                      </div>
                      <div className="text-xs font-mono text-black/40">
                        {bug.affected_function}()
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0 rounded-xl bg-[#F5F4F0] p-5 lg:w-48">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/40">
                  <AlertTriangle className="size-3 text-[#2A6948]" />
                  Confidence
                </div>
                <div className="mb-3 text-3xl font-bold text-[#2A6948]">
                  {bug.confidence != null ? `${bug.confidence}%` : "--"}
                </div>
                {bug.confidence != null ? (
                  <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.07]">
                    <div
                      className="h-full rounded-full bg-[#2A6948] transition-all"
                      style={{ width: `${bug.confidence}%` }}
                    />
                  </div>
                ) : (
                  <div className="mb-4 h-1.5 w-full rounded-full bg-black/[0.07]" />
                )}
                {bug.status === "Ready" || bug.status === "Patching" ? (
                  <Link
                    href={`/issues/${bug.id}`}
                    className="flex w-full items-center justify-between rounded-lg bg-[#2A6948] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1E4A31]"
                  >
                    Open patch
                    <ArrowRight className="size-3.5" />
                  </Link>
                ) : (
                  <div className="w-full rounded-lg bg-black/[0.04] px-4 py-2.5 text-center text-xs font-semibold text-black/30">
                    {bug.status === "Resolved" ? "Resolved" : "Analyzing..."}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
