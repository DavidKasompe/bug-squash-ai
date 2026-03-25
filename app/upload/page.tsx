import { redirect } from "next/navigation";

import { UploadConsole } from "@/components/mirai/upload-console";
import { getServerSession, isAuthConfigured } from "@/lib/auth";
import { listConnectedRepositories, listRepositories } from "@/lib/mirai/server";

export default async function UploadPage() {
  const session = await getServerSession();

  if (isAuthConfigured && !session) {
    redirect("/login");
  }

  const repositories = await listRepositories();
  const connectedRepositories = await listConnectedRepositories();
  const availableRepositories = repositories.filter((repository) => !repository.isConnected);

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">Mirai / Upload</p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">Log intake and repository targeting</h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            This is the Next.js replacement for the old upload page. The flow stays the same: pick repository context,
            upload logs, and trigger analysis.
          </p>
        </section>

        <UploadConsole connectedRepositories={connectedRepositories} availableRepositories={availableRepositories} />
      </div>
    </main>
  );
}
