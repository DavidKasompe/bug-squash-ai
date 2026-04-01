"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart2,
  Brain,
  Bug,
  CheckCircle2,
  ChevronUp,
  GitBranch,
  HelpCircle,
  Key,
  LayoutDashboard,
  Loader2,
  Search,
  Send,
  Settings,
  TestTube2,
  Wifi,
  Zap,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/overview" },
  { icon: Brain, label: "Commit Analyses", href: "/commit-analyses" },
  { icon: Bug, label: "Bug Reports", href: "/issues" },
  { icon: GitBranch, label: "Connections", href: "/connections" },
  { icon: Zap, label: "Workflows", href: "/workflows" },
  { icon: BarChart2, label: "Usage", href: "/usage" },
  { icon: Key, label: "API Keys", href: "/api-keys" },
] as const;

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sticky top-0 z-30 flex h-screen w-[240px] shrink-0 flex-col border-r border-black/[0.06] bg-white">
      <div className="px-4 pb-3 pt-5">
        <Link href="/" className="mb-5 flex items-center gap-2.5">
          <div className="flex gap-[2px]">
            <div className="h-[14px] w-[10px] skew-x-[-15deg] rounded-sm bg-[#2A6948]" />
            <div className="h-[14px] w-[10px] skew-x-[-15deg] rounded-sm bg-[#2A6948]/40" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-[#111111]">Mirai</span>
        </Link>
        <button className="flex w-full items-center gap-2.5 rounded-xl bg-[#F5F4F0] px-3 py-2 text-sm text-black/40 transition-colors hover:bg-black/5">
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 text-left text-xs">Search...</span>
          <kbd className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-[10px] font-bold">Cmd+K</kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-0.5">
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = pathname === href || (href !== "/overview" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href as never}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-[#2A6948]/10 font-semibold text-[#2A6948]"
                    : "text-black/60 hover:bg-black/[0.04] hover:text-[#111111]"
                }`}
              >
                <Icon
                  className={`size-4 shrink-0 ${
                    active ? "text-[#2A6948]" : "text-black/40 group-hover:text-black/60"
                  }`}
                />
                {label}
                {active ? <div className="ml-auto size-1.5 rounded-full bg-[#2A6948]" /> : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="space-y-0.5 border-t border-black/[0.06] px-2 pb-4 pt-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black/60 transition-all hover:bg-black/[0.04] hover:text-[#111111]"
        >
          <Settings className="size-4 text-black/40" />
          Settings
        </Link>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black/60 transition-all hover:bg-black/[0.04] hover:text-[#111111]">
          <HelpCircle className="size-4 text-black/40" />
          Help
        </button>
        <div className="mt-2 border-t border-black/[0.06] pt-2">
          <Link
            href="/settings"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-black/[0.04]"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#111111] text-xs font-bold text-white">
              DK
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm font-semibold text-[#111111]">David Kasompe</div>
              <div className="truncate text-xs text-black/40">david@example.com</div>
            </div>
            <ChevronUp className="size-4 shrink-0 text-black/30" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

type IssuePanelData = {
  bug: {
    id: string;
    title: string | null;
    severity: string;
    status: string;
    confidence: number | null;
    root_cause: string | null;
    ai_suggestion: string | null;
    affected_file: string | null;
    affected_function: string | null;
    fix_steps: string[] | null;
  };
  patch: {
    id: string;
    status: string;
    pr_url: string | null;
    tests_generated: string[] | null;
  } | null;
};

type InstallationPanel = {
  id: string;
  installation_id: string;
  account_login: string;
  account_type: string;
  repos: Array<{
    id: number;
    full_name: string;
    private: boolean;
    updated_at?: string | null;
  }>;
  created_at: string;
};

function EmptyPanelState({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-black/35">
      {label}
    </div>
  );
}

function AIAgentPanel({
  data,
  loading,
}: {
  data: IssuePanelData | null;
  loading: boolean;
}) {
  const rootCause =
    data?.bug.root_cause ??
    data?.bug.ai_suggestion ??
    "Mirai has not attached a root cause summary yet.";
  const fixSteps = data?.bug.fix_steps ?? [];
  const tests = data?.patch?.tests_generated ?? [];
  const prStateLabel = data?.patch?.pr_url
    ? "Pull request ready"
    : data?.patch
      ? "Patch ready"
      : "Analyzing";

  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-black/[0.06] px-5 py-4 shrink-0">
        <Brain className="size-4 text-black/40" />
        <span className="text-sm font-semibold">Agent View</span>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-[#2A6948]/10 px-2 py-0.5 text-[10px] font-bold text-[#2A6948]">
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span className="inline-block size-1.5 rounded-full bg-[#2A6948] animate-pulse" />
          )}
          {loading ? "Loading" : prStateLabel}
        </span>
      </div>
      {loading ? (
        <EmptyPanelState label="Loading bug context..." />
      ) : !data ? (
        <EmptyPanelState label="Issue context is unavailable for this bug." />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="flex gap-3">
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2A6948]">
            <Brain className="size-3.5 text-white" />
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-sm bg-[#F5F4F0] p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#2A6948]">
              Root Cause
            </p>
            <p className="text-xs leading-relaxed text-[#111111]">
              {rootCause}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2A6948]">
            <Brain className="size-3.5 text-white" />
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-sm bg-[#F5F4F0] p-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#2A6948]">
              Fix Applied
            </p>
            <div className="space-y-2">
              {(fixSteps.length > 0 ? fixSteps : ["Mirai is still generating fix steps for this bug."]).map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#2A6948]" />
                  <span className="text-xs leading-relaxed text-[#111111]">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2A6948]">
            <Brain className="size-3.5 text-white" />
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-sm bg-[#F5F4F0] p-4">
            <p className="mb-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#2A6948]">
              <TestTube2 className="size-3" />
              Auto-Generated Tests
            </p>
            {(tests.length > 0 ? tests : ["No generated tests attached yet."]).map((testName, index) => (
              <div
                key={index}
                className="flex items-center gap-2 border-b border-black/[0.05] py-1.5 last:border-0"
              >
                <div className="size-1 rounded-full bg-[#2A6948]" />
                <span className="font-mono text-xs text-[#111111]/70">{testName}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}
      <div className="shrink-0 border-t border-black/[0.06] px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-[#F5F4F0] px-3 py-2.5">
          <input
            type="text"
            placeholder={data?.bug.title ? `Ask Mirai about "${data.bug.title}"...` : "Ask Mirai about this bug..."}
            className="flex-1 bg-transparent text-xs text-[#111111] placeholder:text-black/30 focus:outline-none"
          />
          <button className="flex size-7 items-center justify-center rounded-lg bg-[#2A6948] transition-colors hover:bg-[#1E4A31]">
            <Send className="size-3 text-white" />
          </button>
        </div>
      </div>
    </>
  );
}

function timeAgo(input?: string | null) {
  if (!input) {
    return "unknown";
  }

  const date = new Date(input);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function ConnectionsPanel({
  installations,
  loading,
}: {
  installations: InstallationPanel[];
  loading: boolean;
}) {
  const repos = installations.flatMap((installation) =>
    (installation.repos ?? []).map((repo) => ({
      name: repo.full_name,
      status: repo.updated_at ? "ok" : "warn",
      lastSync: timeAgo(repo.updated_at ?? installation.created_at),
    })),
  );
  const accountLabel =
    installations.length > 0
      ? installations.map((installation) => installation.account_login).join(", ")
      : "No account";

  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-black/[0.06] px-5 py-4 shrink-0">
        <Wifi className="size-4 text-black/40" />
        <span className="text-sm font-semibold">Connection Health</span>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-[#2A6948]/10 px-2 py-0.5 text-[10px] font-bold text-[#2A6948]">
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span className="inline-block size-1.5 rounded-full bg-[#2A6948] animate-pulse" />
          )}
          {loading ? "Loading" : repos.length > 0 ? "Live" : "Idle"}
        </span>
      </div>
      {loading ? (
        <EmptyPanelState label="Loading installation health..." />
      ) : repos.length === 0 ? (
        <EmptyPanelState label="Connect a GitHub account to see repository health and installation status." />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-wider text-black/30">
          {accountLabel}
        </p>
        {repos.slice(0, 8).map((repo) => (
          <div
            key={repo.name}
            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#F5F4F0]"
          >
            <div
              className={`size-2 shrink-0 rounded-full ${
                repo.status === "ok" ? "bg-[#2A6948]" : "bg-amber-400"
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs font-semibold text-[#111111]">{repo.name}</p>
              <p className="text-[10px] text-black/40">Synced {repo.lastSync}</p>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                repo.status === "ok"
                  ? "bg-[#2A6948]/10 text-[#2A6948]"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {repo.status === "ok" ? "Healthy" : "Warning"}
            </span>
          </div>
        ))}
        </div>
      )}
      <div className="shrink-0 border-t border-black/[0.06] px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 rounded-xl bg-[#F5F4F0] p-3 text-xs text-black/50">
          <Activity className="size-3.5 text-[#2A6948]" />
          {repos.length > 0
            ? `${repos.length} repositories currently linked to Mirai.`
            : "Waiting for a connected GitHub installation."}
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [issuePanelData, setIssuePanelData] = useState<IssuePanelData | null>(null);
  const [issuePanelLoading, setIssuePanelLoading] = useState(false);
  const [installations, setInstallations] = useState<InstallationPanel[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  const isOverview = pathname === "/overview";
  const isIssueDetail = /^\/issues\/.+/.test(pathname);
  const isConnections = pathname === "/connections";
  const showPanel = isIssueDetail || isConnections;
  const issueId = useMemo(() => {
    const match = pathname.match(/^\/issues\/(.+)$/);
    return match?.[1] ?? null;
  }, [pathname]);

  useEffect(() => {
    if (!isIssueDetail || !issueId) {
      setIssuePanelData(null);
      setIssuePanelLoading(false);
      return;
    }

    let isActive = true;
    setIssuePanelLoading(true);

    fetch(`/api/bugs/${issueId}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load issue context.");
        }

        if (isActive) {
          setIssuePanelData(payload as IssuePanelData);
        }
      })
      .catch((error: unknown) => {
        console.error("[dashboard/layout:issue-panel]", error);
        if (isActive) {
          setIssuePanelData(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIssuePanelLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [isIssueDetail, issueId]);

  useEffect(() => {
    if (!isConnections) {
      setConnectionsLoading(false);
      return;
    }

    let isActive = true;
    setConnectionsLoading(true);

    fetch("/api/github/installations", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load installation context.");
        }

        if (isActive) {
          setInstallations((payload.installations as InstallationPanel[]) ?? []);
        }
      })
      .catch((error: unknown) => {
        console.error("[dashboard/layout:connections-panel]", error);
        if (isActive) {
          setInstallations([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setConnectionsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [isConnections]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4F0] font-sans text-[#111111]">
      <Sidebar pathname={pathname} />

      <main className="flex flex-1 flex-col overflow-y-auto">
        {isOverview ? (
          <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
        ) : (
          <div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-10">{children}</div>
        )}
      </main>

      {showPanel ? (
        <aside className="sticky top-0 flex h-screen w-[360px] shrink-0 flex-col overflow-hidden border-l border-black/[0.06] bg-white">
          {isIssueDetail ? (
            <AIAgentPanel data={issuePanelData} loading={issuePanelLoading} />
          ) : (
            <ConnectionsPanel installations={installations} loading={connectionsLoading} />
          )}
        </aside>
      ) : null}
    </div>
  );
}
