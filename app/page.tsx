import Link from "next/link";
import { ArrowRight, ArrowUpRight, GitBranch, Sparkles } from "lucide-react";

const featureCards = [
  {
    title: "Log ingestion",
    description:
      "Capture stack traces from chat, uploads, or GitHub Actions and normalize them into persisted bug records.",
    accent: "bg-[#111111] text-white",
  },
  {
    title: "Patch workflows",
    description:
      "Run Groq-backed analysis, generate diffs, attach tests, and move issues into review-ready patches.",
    accent: "bg-white text-[#111111]",
  },
  {
    title: "GitHub sync",
    description:
      "Connect repositories, track installation state, and open pull requests directly from Mirai.",
    accent: "bg-[#111111] text-white",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black pb-24 font-sans text-white selection:bg-[#9AFA5A] selection:text-black">
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

      <header className="fixed left-1/2 top-16 z-50 w-full max-w-5xl -translate-x-1/2 px-4">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-[#1C1D1A]/90 px-5 py-2.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="mr-6 flex flex-col items-center gap-0.5">
              <div className="flex gap-[2px]">
                <div className="h-[14px] w-[10px] skew-x-[-15deg] rounded-sm bg-[#9AFA5A]" />
                <div className="h-[14px] w-[10px] skew-x-[-15deg] rounded-sm bg-emerald-400" />
              </div>
            </div>
            <span className="text-xl font-semibold tracking-tight text-white/95">Mirai</span>
          </div>

          <div className="hidden items-center gap-7 text-sm font-medium text-white/70 md:flex">
            <a href="#product" className="transition-colors hover:text-white">
              Product
            </a>
            <a href="#platform" className="transition-colors hover:text-white">
              Platform
            </a>
            <a href="#metrics" className="transition-colors hover:text-white">
              Metrics
            </a>
            <a href="#footer" className="transition-colors hover:text-white">
              Company
            </a>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="hidden text-white/80 transition-colors hover:text-white sm:block">
              Log In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/10 px-4 py-1.5 text-sm text-white transition-all hover:bg-white/20"
            >
              Sign Up
              <div className="rounded-full bg-[#9AFA5A] p-0.5 text-black">
                <ArrowUpRight className="size-3" strokeWidth={3} />
              </div>
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pb-10 pt-40 text-center md:pt-48">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9AFA5A]/10 blur-[120px]" />

        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
          <span className="text-[#9AFA5A]">Bug orchestration</span>
          <br />
          that developers love
        </h1>

        <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-white/60 md:text-xl">
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
            className="rounded-full border border-[#384333] bg-black/40 px-6 py-2.5 text-sm font-semibold text-[#9AFA5A] backdrop-blur-sm transition-colors hover:border-[#9AFA5A]/50 hover:bg-[#9AFA5A]/5 sm:text-base"
          >
            Start free
          </Link>
        </div>

        <div className="mt-20 flex aspect-square w-full max-w-md items-center justify-center">
          <div className="absolute h-[420px] w-[420px] rounded-full bg-[#9AFA5A]/30 blur-[100px]" />
          <div
            className="relative h-64 w-64 rounded-[2.5rem] bg-gradient-to-br from-[#E6FFCD] via-[#9AFA5A] to-[#123908]"
            style={{
              boxShadow:
                "inset 0 4px 30px rgba(255,255,255,0.7), inset 0 -4px 30px rgba(0,0,0,0.5), 0 0 100px rgba(154,250,90,0.5), 0 30px 60px rgba(0,0,0,0.9)",
            }}
          >
            <div className="absolute left-0 right-0 top-0 h-1/2 rounded-t-[2.5rem] bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </div>
      </section>

      <section id="platform" className="mx-auto mt-24 max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <div key={card.title} className={`rounded-3xl border border-white/10 p-6 shadow-2xl ${card.accent}`}>
              <div className="mb-4 inline-flex rounded-2xl bg-[#9AFA5A]/10 p-3 text-[#9AFA5A]">
                {card.title === "GitHub sync" ? <GitBranch className="size-5" /> : <Sparkles className="size-5" />}
              </div>
              <h2 className="text-xl font-semibold tracking-tight">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-current/70">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="mx-auto mt-28 max-w-6xl px-4">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#050505] shadow-2xl">
          <div className="border-b border-white/5 bg-[#0a0a0a] px-5 py-4 text-sm font-mono tracking-wider text-white/40">
            mirai-workspace.ts
          </div>
          <div className="space-y-2 p-8 font-mono text-sm leading-7 text-white/75 md:text-base">
            <div className="text-white/30">
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

      <section id="metrics" className="mx-auto my-24 max-w-6xl px-4 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-12 gap-y-8 rounded-[3rem] border border-white/10 bg-[#1C1D1A]/50 px-12 py-10 shadow-2xl shadow-[#9AFA5A]/5 backdrop-blur-md">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-semibold text-[#9AFA5A] md:text-5xl">1s</span>
            <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/50 md:text-base">
              Cold start time
            </span>
          </div>
          <div className="hidden h-16 w-px bg-white/10 md:block" />
          <div className="flex flex-col items-center">
            <span className="text-4xl font-semibold text-white md:text-5xl">99.9%</span>
            <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/50 md:text-base">
              Validation confidence
            </span>
          </div>
          <div className="hidden h-16 w-px bg-white/10 md:block" />
          <div className="flex flex-col items-center">
            <span className="text-4xl font-semibold text-[#9AFA5A] md:text-5xl">10x</span>
            <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/50 md:text-base">
              Faster incident resolution
            </span>
          </div>
        </div>
      </section>

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
            className="inline-block rounded-full border border-[#9AFA5A] bg-[#9AFA5A] px-8 py-4 text-lg font-semibold text-black shadow-[0_0_30px_rgba(154,250,90,0.3)] transition-colors hover:bg-[#85e04b]"
          >
            Start building for free
          </Link>
        </div>
      </section>

      <footer id="footer" className="w-full border-t border-white/5 bg-[#0a0a0a] px-6 pb-10 pt-20">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-12 md:flex-row">
          <div className="flex max-w-sm flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex gap-[2px]">
                  <div className="h-[14px] w-[10px] skew-x-[-15deg] rounded-sm bg-[#9AFA5A]" />
                  <div className="h-[14px] w-[10px] skew-x-[-15deg] rounded-sm bg-emerald-700/50" />
                </div>
              </div>
              <span className="text-lg font-semibold tracking-tight text-white/90">Mirai</span>
            </div>
            <p className="text-sm leading-relaxed text-white/40">
              Bug orchestration for high-velocity teams. Mirai turns broken runtime signals into actionable fixes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-16 lg:grid-cols-3 lg:gap-24">
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white/90">Product</h4>
              <a href="#product" className="text-sm text-white/50 transition-colors hover:text-white">
                Features
              </a>
              <a href="#platform" className="text-sm text-white/50 transition-colors hover:text-white">
                Integrations
              </a>
              <a href="#metrics" className="text-sm text-white/50 transition-colors hover:text-white">
                Metrics
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white/90">Resources</h4>
              <Link href="/overview" className="text-sm text-white/50 transition-colors hover:text-white">
                Workspace
              </Link>
              <Link href="/issues" className="text-sm text-white/50 transition-colors hover:text-white">
                Bug Reports
              </Link>
              <Link href="/connections" className="text-sm text-white/50 transition-colors hover:text-white">
                Connections
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-white/90">Company</h4>
              <Link href="/signup" className="text-sm text-white/50 transition-colors hover:text-white">
                Get started
              </Link>
              <Link href="/login" className="text-sm text-white/50 transition-colors hover:text-white">
                Log in
              </Link>
              <a href="#footer" className="text-sm text-white/50 transition-colors hover:text-white">
                Contact
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-20 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-white/30">© 2026 Mirai Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#product" className="text-xs text-white/30 transition-colors hover:text-white">
              Product
            </a>
            <a href="#platform" className="text-xs text-white/30 transition-colors hover:text-white">
              Platform
            </a>
            <a href="#metrics" className="text-xs text-white/30 transition-colors hover:text-white">
              Metrics
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
