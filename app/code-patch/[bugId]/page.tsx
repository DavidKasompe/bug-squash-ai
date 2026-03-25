import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { ArrowLeft, GitPullRequest, Sparkles } from "lucide-react";

import { CodeDiff } from "@/components/mirai/code-diff";
import { buttonVariants } from "@/components/ui/button";
import { getServerSession, isAuthConfigured } from "@/lib/auth";
import { getBugDetails, listPatchVariants } from "@/lib/mirai/server";
import { cn } from "@/lib/utils";

export default async function CodePatchPage({
  params,
}: {
  params: Promise<{ bugId: string }>;
}) {
  const session = await getServerSession();

  if (isAuthConfigured && !session) {
    redirect("/login");
  }

  const { bugId } = await params;
  const bug = await getBugDetails(bugId);

  if (!bug) {
    notFound();
  }

  const patchVariants = await listPatchVariants(bugId);
  const activePatch = patchVariants[0] ?? null;

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "mb-6")}>
                <ArrowLeft className="size-4" />
                Back to dashboard
              </Link>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">Mirai / Patch Preview</p>
              <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">{bug.title}</h1>
              <p className="mt-4 max-w-3xl text-muted-foreground">{bug.summary}</p>
            </div>

            <div className="grid min-w-60 gap-3 rounded-[1.5rem] bg-background p-5">
              <p className="text-sm text-muted-foreground">Confidence</p>
              <p className="font-display text-4xl font-semibold">{activePatch?.confidenceScore ?? bug.confidenceScore}%</p>
              <p className="text-sm text-muted-foreground">Status: {activePatch?.status ?? "no patch generated"}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-primary" />
              <h2 className="font-display text-2xl font-semibold tracking-tight">Patch context</h2>
            </div>

            <div className="mt-6 grid gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Affected file</p>
                <p className="mt-1">{bug.affectedFile}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Function</p>
                <p className="mt-1">{bug.affectedFunction}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Suggested fix</p>
                <p className="mt-1">{bug.suggestedFix}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Review notes</p>
                <p className="mt-1">{activePatch?.reviewNotes ?? "No patch review is available yet."}</p>
              </div>
            </div>

            {activePatch?.pullRequestUrl ? (
              <a
                href={activePatch.pullRequestUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants(), "mt-6 w-full justify-center")}
              >
                <GitPullRequest className="size-4" />
                View simulated PR
              </a>
            ) : null}
          </article>

          {activePatch ? (
            <CodeDiff patch={activePatch} />
          ) : (
            <article className="rounded-[2rem] border border-dashed border-border bg-card p-8 shadow-sm">
              <h2 className="font-display text-2xl font-semibold tracking-tight">No patch generated yet</h2>
              <p className="mt-3 text-muted-foreground">
                The Mirai route exists, but generation and review actions still need to be wired to Mastra workflows and persistence.
              </p>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
