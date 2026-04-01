import { redirect } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

import { getServerSession, isAuthConfigured } from "@/lib/auth";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

type ValidationSummary = {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  successRate: number;
  testCases: Array<{
    id: string;
    name: string;
    status: "passed" | "failed";
    duration: number;
    details?: string;
  }>;
};

export default async function ValidationPage() {
  const session = await getServerSession();

  if (isAuthConfigured && !session) {
    redirect("/login");
  }

  const emptyState: ValidationSummary = {
    totalTests: 0,
    passedCount: 0,
    failedCount: 0,
    successRate: 0,
    testCases: [],
  };

  let validation = emptyState;

  if (session?.user && isSupabaseConfigured) {
    const supabase = createSupabaseAdminClient();
    const { data: patches } = await supabase
      .from("patches")
      .select("tests_generated, status")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const testCases = (patches ?? []).flatMap((patch, patchIndex) =>
      ((patch.tests_generated as string[] | null) ?? []).map((testName, testIndex) => ({
        id: `${patchIndex}-${testIndex}`,
        name: testName,
        status: patch.status === "failed" ? ("failed" as const) : ("passed" as const),
        duration: 0,
        details:
          patch.status === "failed"
            ? "Patch application or validation failed."
            : "Generated test attached to patch.",
      })),
    );

    const passedCount = testCases.filter((testCase) => testCase.status === "passed").length;
    const failedCount = testCases.length - passedCount;
    validation = {
      totalTests: testCases.length,
      passedCount,
      failedCount,
      successRate: testCases.length === 0 ? 0 : Math.round((passedCount / testCases.length) * 100),
      testCases,
    };
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">Mirai / Validation</p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">Validation results</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Review the generated test coverage attached to the latest Mirai patches.
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
          {validation.testCases.length === 0 ? (
            <article className="rounded-[1.5rem] border border-dashed border-border bg-card p-8 text-sm text-muted-foreground shadow-sm">
              No generated tests are available yet. Create a patch from the AI chat or upload flow first.
            </article>
          ) : (
            validation.testCases.map((testCase) => (
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
            ))
          )}
        </section>
      </div>
    </main>
  );
}
