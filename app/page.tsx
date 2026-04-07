import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bug, GitBranch, Sparkles } from "lucide-react";

const featureCards = [
  {
    icon: Bug,
    title: "Log ingestion",
    description:
      "Capture stack traces from chat, uploads, or GitHub Actions and normalize them into persisted bug records.",
  },
  {
    icon: Sparkles,
    title: "Patch workflows",
    description:
      "Run Groq-backed analysis, generate diffs, attach tests, and move issues into review-ready patches.",
  },
  {
    icon: GitBranch,
    title: "GitHub sync",
    description:
      "Connect repositories, track installation state, and open pull requests directly from Mirai.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black pb-24 font-sans text-white selection:bg-[#9AFA5A] selection:text-black">
      {/* Top banner */}
      <div className="flex w-full items-center justify-center bg-[#9AFA5A] px-4 py-2.5 text-sm font-medium text-black">
        <span>
          From broken signals to actionable fixes: Mirai keeps bug triage, patching, and PR creation in one loop.
        </span>
        <Link
          href="/signup"
          className="ml-3 inline-flex items-center gap-1 font-semibold underline hover:no-underline"
        >
          Register <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Floating nav */}
      <header className="fixed left-1/2 top-16 z-50 w-full max-w-5xl -translate-x-1/2 px-4">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-[#1C1D1A]/90 px-5 py-2.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="mr-6 flex items-center gap-0.5">
              <div className="flex gap-[2px]">
                <div className="h-[14px] w-[10px] skew-x-[-15deg] rounded-sm bg-[#9AFA5A]" />
                <div className="h-[14px] w-[10px] skew-x-[-15deg] rounded-sm bg-emerald-400/60" />
              </div>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white/95">Mirai</span>
          </div>

          <div className="hidden items-center gap-7 text-sm font-medium text-white/60 md:flex">
            <a href="#product" className="transition-colors hover:text-white">Product</a>
            <a href="#platform" className="transition-colors hover:text-white">Platform</a>
            <a href="#metrics" className="transition-colors hover:text-white">Metrics</a>
            <a href="#footer" className="transition-colors hover:text-white">Company</a>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="hidden text-white/70 transition-colors hover:text-white sm:block">
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm text-white transition-all hover:bg-white/20"
            >
              Sign Up
              <div className="rounded-full bg-[#9AFA5A] p-0.5 text-black">
                <ArrowUpRight className="size-3" strokeWidth={3} />
              </div>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pb-10 pt-40 text-center md:pt-48">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9AFA5A]/8 blur-[140px]" />

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9AFA5A]/20 bg-[#9AFA5A]/5 px-4 py-1.5">
          <span className="inline-block size-1.5 rounded-full bg-[#9AFA5A] animate-pulse" />
          <span className="text-xs font-semibold text-[#9AFA5A]">AI-powered bug execution</span>
        </div>

        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
          <span className="text-[#9AFA5A]">Bug orchestration</span>
          <br />
          that developers love
        </h1>

        <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-white/55 md:text-xl">
          Run analysis, automated patching, and validation with a debugging workspace that feels local and a GitHub
          loop that stays in sync.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/overview"
            className="rounded-full border border-[#9AFA5A] bg-[#9AFA5A] px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#85e04b] sm:text-base"
          >
            Open workspace
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10 sm:text-base"
          >
            Start free
          </Link>
        </div>

        {/* Product UI preview — replaces the abstract cube */}
        <div className="relative mt-16 w-full max-w-2xl">
          <div className="pointer-events-none absolute -inset-12 rounded-full bg-[#9AFA5A]/8 blur-[80px]" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-[#0d0d0d] px-4 py-3">
              <div className="size-3 rounded-full bg-red-500/40" />
              <div className="size-3 rounded-full bg-amber-500/40" />
              <div className="size-3 rounded-full bg-[#9AFA5A]/40" />
              <span className="ml-3 font-mono text-[11px] text-white/20">mirai — AI analysis</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-[#9AFA5A] animate-pulse" />
                <span className="text-[10px] font-semibold text-[#9AFA5A]">Agent active</span>
              </div>
            </div>

            {/* Analysis finding */}
            <div className="border-b border-white/[0.04] px-5 py-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                  Critical
                </span>
                <span className="text-sm font-semibold text-white">
                  Null reference in checkout session handler
                </span>
                <span className="ml-auto font-mono text-xs font-bold text-[#9AFA5A]">94%</span>
              </div>
              <p className="text-xs leading-relaxed text-white/35">
                Root cause: resumeCheckoutSession reads session.user.id before null check on session object
                returned from expired cache entry.
              </p>
            </div>

            {/* Diff preview */}
            <div className="border-b border-white/[0.04] px-5 py-3 font-mono text-xs">
              <div className="mb-1.5 text-white/20">{"// src/payments/retry-checkout.ts:114"}</div>
              <div className="rounded px-2 py-0.5 text-red-400/80 bg-red-500/5">
                - const id = session.user.id
              </div>
              <div className="rounded px-2 py-0.5 text-[#9AFA5A] bg-[#9AFA5A]/5">
                + const id = session?.user?.id ?? null
              </div>
              <div className="rounded px-2 py-0.5 text-[#9AFA5A] bg-[#9AFA5A]/5">
                + if (!id) return null
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-3 bg-[#0d0d0d] px-5 py-3">
              <span className="text-[11px] text-white/30">Patch draft ready · 2 tests generated</span>
              <span className="ml-auto rounded-lg border border-[#9AFA5A]/25 bg-[#9AFA5A]/8 px-3 py-1.5 text-[11px] font-bold text-[#9AFA5A]">
                Open Pull Request →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section id="platform" className="mx-auto mt-28 max-w-6xl px-4">
        <div className="grid gap-5 md:grid-cols-3">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-3xl border border-white/[0.07] bg-[#111111] p-7 shadow-xl transition-colors hover:border-white/[0.12]"
              >
                <div className="mb-5 inline-flex rounded-2xl bg-[#9AFA5A]/10 p-3 text-[#9AFA5A]">
                  <Icon className="size-5" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/45">{card.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Code block */}
      <section id="product" className="mx-auto mt-28 max-w-6xl px-4">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#050505] shadow-2xl">
          <div className="border-b border-white/5 bg-[#0a0a0a] px-5 py-4 font-mono text-sm tracking-wider text-white/35">
            mirai-workspace.ts
          </div>
          <div className="space-y-2 p-8 font-mono text-sm leading-7 text-white/75 md:text-base">
            <div className="text-white/25">
              {"// Mirai turns runtime failures into persisted bug records and review-ready patches."}
            </div>
            <div>
              <span className="text-pink-400">const</span> bug = <span className="text-pink-400">await</span>{" "}
              mirai.analyzeTrace(trace)
            </div>
            <div>
              <span className="text-pink-400">const</span> patch = <span className="text-pink-400">await</span>{" "}
              mirai.generatePatch(bug.id)
            </div>
            <div>
              <span className="text-pink-400">await</span> mirai.openPullRequest(patch.id)
            </div>
            <div className="pt-3 text-[#9AFA5A]">
              {"// persisted issue, generated tests, and PR state stay in sync across the dashboard"}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section id="metrics" className="mx-auto my-28 max-w-6xl px-4 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-12 gap-y-8 rounded-[3rem] border border-white/10 bg-[#1C1D1A]/50 px-12 py-10 shadow-2xl shadow-[#9AFA5A]/5 backdrop-blur-md">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-semibold text-[#9AFA5A] md:text-5xl">1s</span>
            <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/45 md:text-base">
              Cold start time
            </span>
          </div>
          <div className="hidden h-16 w-px bg-white/10 md:block" />
          <div className="flex flex-col items-center">
            <span className="text-4xl font-semibold text-white md:text-5xl">99.9%</span>
            <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/45 md:text-base">
              Validation confidence
            </span>
          </div>
          <div className="hidden h-16 w-px bg-white/10 md:block" />
          <div className="flex flex-col items-center">
            <span className="text-4xl font-semibold text-[#9AFA5A] md:text-5xl">10x</span>
            <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/45 md:text-base">
              Faster incident resolution
            </span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-[#0a0f08] to-[#040803] px-4 pb-32 pt-28 text-center">
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 translate-y-1/2 rounded-[100%] bg-[#9AFA5A]/10 blur-[100px]" />
        <h2 className="relative z-10 mb-6 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Ready to squash bugs <span className="text-[#9AFA5A]">faster?</span>
        </h2>
        <p className="relative z-10 mx-auto mb-10 max-w-xl text-lg font-medium text-white/50 md:text-xl">
          Let Mirai analyze traces, generate patches, validate changes, and keep your GitHub loop moving.
        </p>
        <div className="relative z-10">
          <Link
            href="/signup"
            className="inline-block rounded-full border border-[#9AFA5A] bg-[#9AFA5A] px-8 py-4 text-lg font-semibold text-black shadow-[0_0_40px_rgba(154,250,90,0.25)] transition-colors hover:bg-[#85e04b]"
          >
            Start building for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="w-full border-t border-white/5 bg-[#0a0a0a] px-6 pb-10 pt-20">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-12 md:flex-row">
          <div className="flex max-w-sm flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="flex gap-[2px]">
                <div className="h-[14px] w-[10px] skew-x-[-15deg] rounded-sm bg-[#9AFA5A]" />
                <div className="h-[14px] w-[10px] skew-x-[-15deg] rounded-sm bg-emerald-700/40" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-white/90">Mirai</span>
            </div>
            <p className="text-sm leading-relaxed text-white/35">
              Bug orchestration for high-velocity teams. Mirai turns broken runtime signals into actionable fixes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-16 lg:grid-cols-3 lg:gap-24">
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white/80">Product</h4>
              <a href="#product" className="text-sm text-white/40 transition-colors hover:text-white">Features</a>
              <a href="#platform" className="text-sm text-white/40 transition-colors hover:text-white">Integrations</a>
              <a href="#metrics" className="text-sm text-white/40 transition-colors hover:text-white">Metrics</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white/80">Resources</h4>
              <Link href="/overview" className="text-sm text-white/40 transition-colors hover:text-white">Workspace</Link>
              <Link href="/issues" className="text-sm text-white/40 transition-colors hover:text-white">Bug Reports</Link>
              <Link href="/connections" className="text-sm text-white/40 transition-colors hover:text-white">Connections</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white/80">Company</h4>
              <Link href="/signup" className="text-sm text-white/40 transition-colors hover:text-white">Get started</Link>
              <Link href="/login" className="text-sm text-white/40 transition-colors hover:text-white">Log in</Link>
              <a href="#footer" className="text-sm text-white/40 transition-colors hover:text-white">Contact</a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-20 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-white/25">© 2026 Mirai Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#product" className="text-xs text-white/25 transition-colors hover:text-white">Product</a>
            <a href="#platform" className="text-xs text-white/25 transition-colors hover:text-white">Platform</a>
            <a href="#metrics" className="text-xs text-white/25 transition-colors hover:text-white">Metrics</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
