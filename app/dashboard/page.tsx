import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, Filter } from "lucide-react";

import { SignOutButton } from "@/components/mirai/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { getServerSession, isAuthConfigured } from "@/lib/auth";
import { listBugReports } from "@/lib/mirai/server";
import { cn } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ severity?: string; repo?: string }>;
}) {
  const session = await getServerSession();

  if (isAuthConfigured && !session) {
    redirect("/signin");
  }

  const params = (await searchParams) ?? {};
  const bugs = await listBugReports();
  const filtered = bugs.filter((bug) => {
    const severityMatch = !params.severity || params.severity === "all" || bug.severity === params.severity;
    const repoMatch = !params.repo || params.repo === "all" || bug.repositoryId === params.repo;

    return severityMatch && repoMatch;
  });
  const uniqueRepos = Array.from(new Map(bugs.map((bug) => [bug.repositoryId, bug.repositoryName])).entries());

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">Mirai / Dashboard</p>
              <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">Bug reports ready for action</h1>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                This replaces the legacy dashboard and keeps the same core flow: review bugs, inspect confidence, and
                move into patch generation.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {session ? (
                <div className="sm:col-span-3 flex justify-end">
                  <SignOutButton />
                </div>
              ) : null}
              <div className="rounded-2xl bg-background px-4 py-4">
                <p className="text-sm text-muted-foreground">Visible bugs</p>
                <p className="mt-2 font-display text-3xl font-semibold">{filtered.length}</p>
              </div>
              <div className="rounded-2xl bg-background px-4 py-4">
                <p className="text-sm text-muted-foreground">Critical + high</p>
                <p className="mt-2 font-display text-3xl font-semibold">
                  {bugs.filter((bug) => bug.severity === "critical" || bug.severity === "high").length}
                </p>
              </div>
              <div className="rounded-2xl bg-background px-4 py-4">
                <p className="text-sm text-muted-foreground">Ready for patching</p>
                <p className="mt-2 font-display text-3xl font-semibold">
                  {bugs.filter((bug) => bug.status === "ready").length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Filter className="size-4 text-primary" />
            <p className="text-sm font-medium">Filters</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard?severity=all&repo=all" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
              Reset
            </Link>
            {["critical", "high", "medium", "low"].map((severity) => (
              <Link
                key={severity}
                href={`/dashboard?severity=${severity}&repo=${params.repo ?? "all"}`}
                className={cn(buttonVariants({ variant: params.severity === severity ? "default" : "outline" }), "rounded-full capitalize")}
              >
                {severity}
              </Link>
            ))}
            {uniqueRepos.map(([repoId, repoName]) => (
              <Link
                key={repoId}
                href={`/dashboard?severity=${params.severity ?? "all"}&repo=${repoId}`}
                className={cn(buttonVariants({ variant: params.repo === repoId ? "default" : "outline" }), "rounded-full")}
              >
                {repoName}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4">
          {filtered.map((bug) => (
            <article key={bug.id} className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="rounded-full bg-secondary px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-secondary-foreground">
                      {bug.severity}
                    </p>
                    <p className="rounded-full bg-background px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {bug.status}
                    </p>
                    <p className="text-sm text-muted-foreground">{bug.repositoryName}</p>
                  </div>

                  <div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight">{bug.title}</h2>
                    <p className="mt-2 max-w-3xl text-muted-foreground">{bug.summary}</p>
                  </div>

                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                    <div>
                      <p className="font-medium text-foreground">Affected file</p>
                      <p className="mt-1">{bug.affectedFile}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Function</p>
                      <p className="mt-1">{bug.affectedFunction}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Suggested next fix</p>
                      <p className="mt-1">{bug.suggestedFix}</p>
                    </div>
                  </div>
                </div>

                <div className="min-w-52 rounded-[1.5rem] bg-background p-5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-primary" />
                    <p className="text-sm font-medium">Confidence</p>
                  </div>
                  <p className="mt-3 font-display text-4xl font-semibold">{bug.confidenceScore}%</p>
                  <Link href={`/code-patch/${bug.id}`} className={cn(buttonVariants(), "mt-5 w-full justify-center")}>
                    Open patch preview
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
