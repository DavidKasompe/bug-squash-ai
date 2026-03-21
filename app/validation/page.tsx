import { redirect } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

import { getServerSession, isAuthConfigured } from "@/lib/auth";
import { getValidationDetails } from "@/lib/mirai/server";

export default async function ValidationPage() {
  const session = await getServerSession();

  if (isAuthConfigured && !session) {
    redirect("/signin");
  }

  const validation = await getValidationDetails();

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">Mirai / Validation</p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">Validation results</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            This mirrors the legacy validation summary and test case flow, now rendered from the Next.js server layer.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Total tests</p>
            <p className="mt-2 font-display text-4xl font-semibold">{validation.totalTests}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Passed</p>
            <p className="mt-2 font-display text-4xl font-semibold">{validation.passedCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Failed</p>
            <p className="mt-2 font-display text-4xl font-semibold">{validation.failedCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Success rate</p>
            <p className="mt-2 font-display text-4xl font-semibold">{validation.successRate}%</p>
          </div>
        </section>

        <section className="grid gap-4">
          {validation.testCases.map((testCase) => (
            <article key={testCase.id} className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {testCase.status === "passed" ? (
                      <CheckCircle2 className="size-4 text-primary" />
                    ) : (
                      <XCircle className="size-4 text-destructive" />
                    )}
                    <h2 className="font-medium">{testCase.name}</h2>
                  </div>
                  {testCase.details ? <p className="mt-2 text-sm text-muted-foreground">{testCase.details}</p> : null}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <p className="rounded-full bg-background px-3 py-1 font-mono uppercase tracking-[0.2em]">
                    {testCase.status}
                  </p>
                  <p>{testCase.duration}s</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
