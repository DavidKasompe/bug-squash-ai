import { Zap, Plus, GitMerge, Bug, Bell, ChevronRight, ToggleLeft, ToggleRight, Clock, CheckCircle2 } from "lucide-react";

const workflows = [
  {
    id: "wf_1",
    name: "Auto-patch on Critical Bugs",
    desc: "When Mirai detects a Critical severity bug, automatically generate a patch and open a draft PR.",
    trigger: "Severity = Critical",
    action: "Generate patch → Open PR",
    status: "active",
    runs: 14,
    lastRun: "2h ago",
  },
  {
    id: "wf_2",
    name: "Notify on New Trace",
    desc: "Send a Slack notification when a new runtime trace is ingested from any connected repository.",
    trigger: "New trace ingested",
    action: "Notify → #eng-alerts",
    status: "active",
    runs: 41,
    lastRun: "12m ago",
  },
  {
    id: "wf_3",
    name: "Weekly Bug Digest",
    desc: "Every Monday at 9am, send a summary of all open and resolved bugs to the team.",
    trigger: "Schedule: Mon 09:00",
    action: "Email digest → team",
    status: "paused",
    runs: 8,
    lastRun: "6d ago",
  },
  {
    id: "wf_4",
    name: "Auto Test on Patch",
    desc: "After a patch is merged, automatically run the generated test suite and report results.",
    trigger: "PR merged",
    action: "Run tests → Comment results",
    status: "active",
    runs: 9,
    lastRun: "3h ago",
  },
];

const templates = [
  { icon: Bug,      label: "Auto-fix on detection",   desc: "Generate and open a PR whenever a Critical bug is found." },
  { icon: Bell,     label: "Slack alert on error",     desc: "Push a message to your Slack channel on any new trace." },
  { icon: GitMerge, label: "Run tests after merge",    desc: "Execute the auto-generated test suite post-merge." },
  { icon: Clock,    label: "Weekly digest report",     desc: "Summarize open and resolved issues every Monday." },
];

export default function WorkflowsPage() {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono font-semibold text-black/30 uppercase tracking-[0.15em] mb-2">Mirai / Workflows</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#111111] mb-1">Automation Workflows</h1>
          <p className="text-sm text-black/50 max-w-lg">Configure rules that run automatically when Mirai detects, patches, or resolves bugs.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2A6948] hover:bg-[#1E4A31] text-white rounded-xl py-2.5 px-5 text-sm font-bold transition-colors shadow-sm shadow-[#2A6948]/20 shrink-0">
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      {/* Active workflows */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-black/30 uppercase tracking-widest px-1">Your Workflows</h2>
        {workflows.map(wf => (
          <div key={wf.id} className="bg-white border border-black/[0.05] rounded-2xl p-5 flex gap-5 items-start hover:border-black/10 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-[#2A6948]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4 text-[#2A6948]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="font-bold text-sm text-[#111111]">{wf.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${wf.status === "active" ? "bg-[#2A6948]/10 text-[#2A6948]" : "bg-black/[0.05] text-black/40"}`}>
                  {wf.status === "active" ? "● Active" : "⏸ Paused"}
                </span>
              </div>
              <p className="text-sm text-black/50 mb-4 leading-relaxed">{wf.desc}</p>
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <div className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-0.5">Trigger</div>
                  <div className="text-xs font-mono text-[#111111]">{wf.trigger}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-0.5">Action</div>
                  <div className="text-xs font-mono text-[#111111]">{wf.action}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-black/30 uppercase tracking-wider mb-0.5">Runs</div>
                  <div className="text-xs font-mono text-[#111111]">{wf.runs} total · last {wf.lastRun}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {wf.status === "active"
                ? <ToggleRight className="w-8 h-8 text-[#2A6948] cursor-pointer" />
                : <ToggleLeft className="w-8 h-8 text-black/20 cursor-pointer" />}
              <button className="p-1.5 rounded-lg hover:bg-black/[0.04] transition-colors">
                <ChevronRight className="w-4 h-4 text-black/30" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-xs font-bold text-black/30 uppercase tracking-widest px-1 mb-3">Start from a template</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map(t => (
            <button key={t.label} className="text-left bg-white border border-black/[0.05] rounded-2xl p-5 hover:border-[#2A6948]/20 hover:shadow-sm transition-all group flex gap-4 items-start">
              <div className="w-9 h-9 rounded-xl bg-[#F5F4F0] flex items-center justify-center shrink-0">
                <t.icon className="w-4 h-4 text-[#2A6948]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#111111] group-hover:text-[#2A6948] transition-colors mb-1">{t.label}</p>
                <p className="text-xs text-black/40 leading-relaxed">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
