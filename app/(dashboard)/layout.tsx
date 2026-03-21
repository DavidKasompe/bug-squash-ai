"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bug, GitBranch, Zap, BarChart2, Key,
  Settings, HelpCircle, Search, ChevronUp, Activity, Cpu,
  Brain, CheckCircle2, TestTube2, Send, Wifi
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",   href: "/overview" },
  { icon: Bug,             label: "Bug Reports",  href: "/issues" },
  { icon: GitBranch,       label: "Connections",  href: "/connections" },
  { icon: Zap,             label: "Workflows",    href: "/workflows" },
  { icon: BarChart2,       label: "Usage",        href: "/usage" },
  { icon: Key,             label: "API Keys",     href: "/api-keys" },
];

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="w-[240px] shrink-0 h-screen sticky top-0 bg-white border-r border-black/[0.06] flex flex-col z-30">
      <div className="px-4 pt-5 pb-3">
        <Link href="/" className="flex items-center gap-2.5 mb-5">
          <div className="flex gap-[2px]">
            <div className="w-[10px] h-[14px] bg-[#2A6948] rounded-sm transform skew-x-[-15deg]" />
            <div className="w-[10px] h-[14px] bg-[#2A6948]/40 rounded-sm transform skew-x-[-15deg]" />
          </div>
          <span className="font-bold text-[17px] tracking-tight text-[#111111]">Mirai</span>
        </Link>
        <button className="w-full flex items-center gap-2.5 bg-[#F5F4F0] hover:bg-black/5 rounded-xl px-3 py-2 text-sm text-black/40 transition-colors">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left text-xs">Search...</span>
          <kbd className="text-[10px] font-bold font-mono bg-black/10 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = pathname === href || (href !== "/overview" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active ? "bg-[#2A6948]/10 text-[#2A6948] font-semibold" : "text-black/60 hover:text-[#111111] hover:bg-black/[0.04]"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#2A6948]" : "text-black/40 group-hover:text-black/60"}`} />
                {label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2A6948]" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-2 pb-4 border-t border-black/[0.06] pt-3 space-y-0.5">
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-black/60 hover:text-[#111111] hover:bg-black/[0.04] transition-all">
          <Settings className="w-4 h-4 text-black/40" /> Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-black/60 hover:text-[#111111] hover:bg-black/[0.04] transition-all">
          <HelpCircle className="w-4 h-4 text-black/40" /> Help
        </button>
        <div className="mt-2 pt-2 border-t border-black/[0.06]">
          <Link href="/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.04] transition-all group">
            <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-white text-xs font-bold shrink-0">DK</div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-semibold text-[#111111] truncate">David Kasompe</div>
              <div className="text-xs text-black/40 truncate">david@example.com</div>
            </div>
            <ChevronUp className="w-4 h-4 text-black/30 shrink-0" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

// AGENT FEED — shown on /overview
function AgentFeedPanel() {
  const events = [
    { time: "Just now", msg: "Analyzing trace: null checkout session", status: "active" },
    { time: "2m ago",   msg: "Root cause identified in resumeCheckoutSession", status: "done" },
    { time: "5m ago",   msg: "Generated patch for auth/token.ts", status: "done" },
    { time: "12m ago",  msg: "Queued: BatchUploader.kt overflow fix", status: "queued" },
    { time: "18m ago",  msg: "PR opened: mirai-labs/checkout-service #41", status: "done" },
    { time: "1h ago",   msg: "Detected 3 new traces from runtime-gateway", status: "done" },
  ];
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
        {events.map((e, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl hover:bg-[#F5F4F0] transition-colors">
            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${e.status === "active" ? "bg-[#2A6948] animate-pulse" : e.status === "done" ? "bg-black/20" : "bg-amber-400"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#111111] leading-snug">{e.msg}</p>
              <p className="text-xs text-black/40 mt-0.5 font-mono">{e.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4 pt-2 border-t border-black/[0.06] shrink-0">
        <div className="bg-[#F5F4F0] rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs font-medium text-black/60">Auto-resolved this week</span>
          <span className="text-sm font-bold text-[#2A6948]">14</span>
        </div>
      </div>
    </>
  );
}

// AI CHAT PANEL — shown on /issues/[id]
function AIAgentPanel() {
  return (
    <>
      <div className="px-5 py-4 border-b border-black/[0.06] flex items-center gap-2.5 shrink-0">
        <Brain className="w-4 h-4 text-black/40" />
        <span className="font-semibold text-sm">Agent View</span>
        <span className="flex items-center gap-1 bg-[#2A6948]/10 text-[#2A6948] text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2A6948] animate-pulse inline-block" />
          Analyzing
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Root Cause */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 bg-[#F5F4F0] rounded-2xl rounded-tl-sm p-4">
            <p className="text-[10px] font-bold text-[#2A6948] mb-2 uppercase tracking-wider">Root Cause</p>
            <p className="text-xs text-[#111111] leading-relaxed">
              <code className="bg-black/[0.06] px-1 py-0.5 rounded font-mono">resumeCheckoutSession</code> reads <code className="bg-black/[0.06] px-1 py-0.5 rounded font-mono">req.session.id</code> directly. After a token refresh the session context is rebuilt from scratch — making it transiently null before rehydration completes, causing the 500.
            </p>
          </div>
        </div>
        {/* Fix steps */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 bg-[#F5F4F0] rounded-2xl rounded-tl-sm p-4">
            <p className="text-[10px] font-bold text-[#2A6948] mb-3 uppercase tracking-wider">Fix Applied</p>
            <div className="space-y-2">
              {["Extract sessionId from JWT payload directly", "Guard against null session before proceeding", "Fallback: rehydrate from order snapshot"].map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2A6948] shrink-0 mt-0.5" />
                  <span className="text-xs text-[#111111] leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Tests */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 bg-[#F5F4F0] rounded-2xl rounded-tl-sm p-4">
            <p className="text-[10px] font-bold text-[#2A6948] mb-3 uppercase tracking-wider flex items-center gap-1">
              <TestTube2 className="w-3 h-3" /> Auto-Generated Tests
            </p>
            {["should return 400 when session is null after token refresh", "should rehydrate session from order snapshot if missing", "should not call with stale session id"].map((t, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-black/[0.05] last:border-0">
                <div className="w-1 h-1 rounded-full bg-[#2A6948]" />
                <span className="text-xs font-mono text-[#111111]/70">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-black/[0.06] shrink-0">
        <div className="flex items-center gap-2 bg-[#F5F4F0] rounded-xl px-3 py-2.5">
          <input type="text" placeholder="Ask Mirai about this bug..." className="flex-1 bg-transparent text-xs text-[#111111] placeholder:text-black/30 focus:outline-none" />
          <button className="w-7 h-7 bg-[#2A6948] rounded-lg flex items-center justify-center hover:bg-[#1E4A31] transition-colors">
            <Send className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </>
  );
}

// CONNECTION HEALTH — shown on /connections
function ConnectionsPanel() {
  const repos = [
    { name: "checkout-service", status: "ok",   lastSync: "2m ago" },
    { name: "runtime-gateway",  status: "ok",   lastSync: "1h ago" },
    { name: "mobile-observer",  status: "warn", lastSync: "3h ago" },
  ];
  return (
    <>
      <div className="px-5 py-4 border-b border-black/[0.06] flex items-center gap-2.5 shrink-0">
        <Wifi className="w-4 h-4 text-black/40" />
        <span className="font-semibold text-sm">Connection Health</span>
        <span className="flex items-center gap-1 bg-[#2A6948]/10 text-[#2A6948] text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2A6948] animate-pulse inline-block" /> Live
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider px-1 mb-3">mirai-labs</p>
        {repos.map(r => (
          <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F4F0] transition-colors">
            <div className={`w-2 h-2 rounded-full shrink-0 ${r.status === "ok" ? "bg-[#2A6948]" : "bg-amber-400"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold font-mono text-[#111111]">{r.name}</p>
              <p className="text-[10px] text-black/40">Synced {r.lastSync}</p>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.status === "ok" ? "text-[#2A6948] bg-[#2A6948]/10" : "text-amber-600 bg-amber-50"}`}>
              {r.status === "ok" ? "Healthy" : "Warning"}
            </span>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4 pt-2 border-t border-black/[0.06] shrink-0">
        <div className="bg-[#F5F4F0] rounded-xl p-3 text-xs text-black/50 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#2A6948]" />
          All webhooks receiving events normally.
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isOverview     = pathname === "/overview";
  const isIssueDetail  = /^\/issues\/.+/.test(pathname);
  const isConnections  = pathname === "/connections";
  // On /overview the page manages its own layout — no right panel needed
  const showPanel      = isIssueDetail || isConnections;

  return (
    <div className="flex h-screen bg-[#F5F4F0] text-[#111111] font-sans overflow-hidden">
      <Sidebar pathname={pathname} />

      <main className={`flex-1 overflow-y-auto flex flex-col ${isOverview ? "" : ""}`}>
        {isOverview ? (
          // Full-bleed for the chat page — no padding wrapper
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-10 px-6 md:px-10 w-full">
            {children}
          </div>
        )}
      </main>

      {showPanel && (
        <aside className="w-[360px] shrink-0 h-screen sticky top-0 border-l border-black/[0.06] bg-white flex flex-col overflow-hidden">
          {isIssueDetail ? <AIAgentPanel /> : <ConnectionsPanel />}
        </aside>
      )}
    </div>
  );
}
