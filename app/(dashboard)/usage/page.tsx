import { BarChart2, Zap, Bug, GitMerge, TrendingUp, Clock } from "lucide-react";

const weeklyData = [
  { day: "Mon", bugs: 3, patches: 2 },
  { day: "Tue", bugs: 5, patches: 4 },
  { day: "Wed", bugs: 2, patches: 2 },
  { day: "Thu", bugs: 7, patches: 5 },
  { day: "Fri", bugs: 4, patches: 4 },
  { day: "Sat", bugs: 1, patches: 1 },
  { day: "Sun", bugs: 2, patches: 2 },
];

const maxBugs = Math.max(...weeklyData.map(d => d.bugs));

const stats = [
  { icon: Bug,       label: "Bugs detected",    value: "24",  delta: "+8 this week",  color: "text-red-500" },
  { icon: GitMerge,  label: "Patches merged",   value: "20",  delta: "+6 this week",  color: "text-[#2A6948]" },
  { icon: Zap,       label: "Workflows run",    value: "72",  delta: "+14 this week", color: "text-amber-500" },
  { icon: TrendingUp,label: "Avg confidence",   value: "84%", delta: "+2% vs last wk", color: "text-blue-500" },
];

const recentActivity = [
  { time: "Today 18:12", event: "Patch merged — checkout-service #41", kind: "merge" },
  { time: "Today 18:09", event: "3 tests generated for retry-checkout.ts", kind: "test" },
  { time: "Today 17:50", event: "Critical bug detected — runtime-gateway", kind: "bug" },
  { time: "Today 16:03", event: "Workflow fired: Notify on new trace", kind: "workflow" },
  { time: "Today 14:31", event: "Patch merged — mobile-observer #89", kind: "merge" },
  { time: "Yesterday",   event: "Weekly digest sent — 5 open, 9 resolved", kind: "report" },
];

const kindColor: Record<string, string> = {
  merge:    "bg-[#2A6948]/10 text-[#2A6948]",
  test:     "bg-blue-50 text-blue-600",
  bug:      "bg-red-50 text-red-600",
  workflow: "bg-amber-50 text-amber-600",
  report:   "bg-black/[0.05] text-black/50",
};

export default function UsagePage() {
  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="text-xs font-mono font-semibold text-black/30 uppercase tracking-[0.15em] mb-2">Mirai / Usage</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111] mb-1">Usage & Activity</h1>
        <p className="text-sm text-black/50 max-w-lg">Track bugs detected, patches merged, workflows fired, and overall agent performance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-black/[0.05] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs font-medium text-black/40">{s.label}</span>
            </div>
            <div className="text-3xl font-bold text-[#111111] mb-1">{s.value}</div>
            <div className="text-xs text-black/40 font-medium">{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white border border-black/[0.05] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-sm text-[#111111]">Bugs detected vs. Patches merged</h2>
            <p className="text-xs text-black/40 mt-0.5">Last 7 days</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-black/40"><span className="w-3 h-3 rounded-sm bg-red-200 inline-block" /> Detected</span>
            <span className="flex items-center gap-1.5 text-black/40"><span className="w-3 h-3 rounded-sm bg-[#2A6948] inline-block" /> Patched</span>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {weeklyData.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end gap-0.5 justify-center" style={{ height: "120px" }}>
                <div
                  className="w-[45%] bg-red-100 hover:bg-red-200 rounded-t-sm transition-colors"
                  style={{ height: `${(d.bugs / maxBugs) * 100}%` }}
                  title={`${d.bugs} detected`}
                />
                <div
                  className="w-[45%] bg-[#2A6948] hover:bg-[#1E4A31] rounded-t-sm transition-colors"
                  style={{ height: `${(d.patches / maxBugs) * 100}%` }}
                  title={`${d.patches} patched`}
                />
              </div>
              <span className="text-[10px] font-bold text-black/30">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white border border-black/[0.05] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center gap-2">
          <Clock className="w-4 h-4 text-black/30" />
          <h2 className="font-bold text-sm text-[#111111]">Recent Activity</h2>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-[#F5F4F0]/50 transition-colors">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${kindColor[a.kind]}`}>{a.kind}</span>
              <span className="flex-1 text-sm text-[#111111]">{a.event}</span>
              <span className="text-xs text-black/30 font-mono shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
