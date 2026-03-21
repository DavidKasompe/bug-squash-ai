import { SignInForm } from "@/components/mirai/sign-in-form";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">Mirai / Auth</p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">Sign in to the replacement stack</h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            This page now represents the Better Auth target flow for Mirai. The old JWT login from Django is being
            replaced with a unified Next.js auth surface.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl bg-background p-5">
              <p className="text-sm font-medium">What changes here</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Sessions, route protection, provider sign-in, and account storage will move into Better Auth and Supabase.
              </p>
            </div>
            <div className="rounded-2xl bg-background p-5">
              <p className="text-sm font-medium">Legacy parity</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Mirai still preserves the same product entry point: sign in, review bugs, upload logs, and generate fixes.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <SignInForm />
        </section>
      </div>
    </main>
  );
}
