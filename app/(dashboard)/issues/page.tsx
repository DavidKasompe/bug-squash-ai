"use client";

import { useEffect, useState } from "react";
import { Filter, AlertTriangle, ArrowRight, Activity, Cpu, RefreshCw, Upload } from "lucide-react";
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
  High:     "bg-orange-50 text-orange-600",
  Medium:   "bg-amber-50 text-amber-600",
  Low:      "bg-blue-50 text-blue-600",
};

const statusColor: Record<string, string> = {
  Detected:      "bg-black/[0.05] text-black/50",
  Investigating: "bg-blue-50 text-blue-600",
  Ready:         "bg-[#2A6948]/10 text-[#2A6948]",
  Patching:      "bg-amber-50 text-amber-600",
  Resolved:      "bg-[#2A6948]/10 text-[#2A6948]",
};

const SEVERITIES = ["Critical", "High", "Medium", "Low"];

// ─── Right Panel: Agent Live Feed ─────────────────────────────────────────────
function AgentFeedPanel({ bugs }: { bugs: Bug[] }) {
  const recent = bugs.slice(0, 6);
  const resolved = bugs.filter(b => b.status === "Resolved").length;

  return (
    <>
      <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-black/40" />
          <span className="font-semibold text-sm text-[#111111]">Agent Feed</span>
          <span className="flex items-center gap-1 bg-[#2A6948]/10 text-[#2A6948] text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2A6948] animate-pulse inline-block" />
            Live
          </span>
        </div>
        <Activity className="w-4 h-4 text-black/30" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {recent.length === 0 ? (
          <p className="text-xs text-black/30 text-center py-8">No activity yet. Connect a repo or paste a trace in the dashboard.</p>
        ) : (
          recent.map(bug => (
            <div key={bug.id} className="flex gap-3 p-3 rounded-xl hover:bg-[#F5F4F0] transition-colors">
              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                bug.status === "Investigating" ? "bg-[#2A6948] animate-pulse" :
                bug.status === "Resolved"     ? "bg-black/20" : "bg-amber-400"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#111111] leading-snug truncate">{bug.title || "Analyzing…"}</p>
                <p className="text-xs text-black/40 mt-0.5 font-mono">{bug.status} · {bug.repo.split("/")[1] ?? bug.repo}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="px-4 pb-4 pt-2 border-t border-black/[0.06] shrink-0">
        <div className="bg-[#F5F4F0] rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs font-medium text-black/60">Resolved bugs</span>
          <span className="text-sm font-bold text-[#2A6948]">{resolved}</span>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BugReportsPage() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

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

  const displayed = filter ? bugs.filter(b => b.severity === filter) : bugs;
  const critical  = bugs.filter(b => b.severity === "Critical" || b.severity === "High").length;
  const ready     = bugs.filter(b => b.status === "Ready").length;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="text-xs font-mono font-semibold text-black/30 uppercase tracking-[0.15em] mb-2">Mirai / Dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111] mb-1">Bug reports ready for action</h1>
        <p className="text-sm text-black/50 max-w-lg">Review detected issues, inspect AI confidence, and move into patch generation.</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Visible bugs",    value: bugs.length },
          { label: "Critical + high", value: critical },
          { label: "Ready for patch", value: ready },
        ].map(s => (
          <div key={s.label} className="bg-white border border-black/[0.05] rounded-2xl px-5 py-4 min-w-[130px]">
            <div className="text-xs text-black/40 font-medium mb-1">{s.label}</div>
            <div className="text-2xl font-bold text-[#111111]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-black/[0.05] rounded-2xl px-5 py-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-black/40 mr-2">
          <Filter className="w-3.5 h-3.5" /> Severity
        </div>
        <button onClick={() => setFilter(null)} className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${!filter ? "border-[#2A6948] bg-[#2A6948]/[0.06] text-[#2A6948]" : "border-black/[0.08] text-black/60 hover:bg-black/[0.03]"}`}>All</button>
        {SEVERITIES.map(s => (
          <button key={s} onClick={() => setFilter(f => f === s ? null : s)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${filter === s ? "border-[#2A6948] bg-[#2A6948]/[0.06] text-[#2A6948]" : "border-black/[0.08] text-black/60 hover:bg-black/[0.03]"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Upload new trace shortcut */}
      <Link href="/overview" className="flex items-center gap-3 bg-[#2A6948]/[0.05] border border-[#2A6948]/10 rounded-2xl px-5 py-3.5 hover:bg-[#2A6948]/[0.08] transition-colors">
        <Upload className="w-4 h-4 text-[#2A6948]" />
        <span className="text-sm font-semibold text-[#2A6948]">Paste a stack trace in the AI chat to create a new bug</span>
        <ArrowRight className="w-4 h-4 text-[#2A6948] ml-auto" />
      </Link>

      {/* Bug list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-black/30">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading bugs...</span>
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-16 text-black/30">
          <Cpu className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{filter ? `No ${filter} bugs found` : "No bugs detected yet"}</p>
          <p className="text-xs mt-1">Connect a GitHub repo or paste a trace in the AI chat to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(bug => (
            <div key={bug.id} className="bg-white border border-black/[0.05] rounded-2xl p-6 flex flex-col lg:flex-row gap-6 lg:items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${severityColor[bug.severity] ?? "bg-black/[0.05] text-black/40"}`}>{bug.severity}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${statusColor[bug.status] ?? "bg-black/[0.05] text-black/40"}`}>
                    {bug.status === "Investigating" ? (
                      <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-blue-600 animate-pulse inline-block" />{bug.status}</span>
                    ) : bug.status}
                  </span>
                  <span className="text-xs font-mono text-black/30">{bug.repo}</span>
                </div>
                <h3 className="text-base font-bold text-[#111111] mb-1.5">{bug.title ?? "Analyzing…"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {bug.affected_file && (
                    <div>
                      <div className="text-[10px] font-bold text-[#111111] uppercase tracking-widest mb-1">Affected file</div>
                      <div className="text-xs text-black/40 font-mono">{bug.affected_file}</div>
                    </div>
                  )}
                  {bug.affected_function && (
                    <div>
                      <div className="text-[10px] font-bold text-[#111111] uppercase tracking-widest mb-1">Function</div>
                      <div className="text-xs text-black/40 font-mono">{bug.affected_function}()</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:w-48 shrink-0 bg-[#F5F4F0] rounded-xl p-5 flex flex-col">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">
                  <AlertTriangle className="w-3 h-3 text-[#2A6948]" /> Confidence
                </div>
                <div className="text-3xl font-bold text-[#2A6948] mb-5">
                  {bug.confidence != null ? `${bug.confidence}%` : "—"}
                </div>
                {bug.status === "Ready" || bug.status === "Patching" ? (
                  <Link href={`/issues/${bug.id}`} className="w-full bg-[#2A6948] hover:bg-[#1E4A31] text-white rounded-lg py-2.5 px-4 flex items-center justify-between font-semibold text-xs transition-colors">
                    Open patch <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div className="w-full bg-black/[0.04] text-black/30 rounded-lg py-2.5 px-4 text-center font-semibold text-xs">
                    {bug.status === "Resolved" ? "✓ Resolved" : "Analyzing..."}
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

// Export panel for layout
export { AgentFeedPanel };
