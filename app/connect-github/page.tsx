import { redirect } from "next/navigation";

import { GitHubConsole } from "@/components/mirai/github-console";
import { getServerSession, isAuthConfigured } from "@/lib/auth";
import { listConnectedRepositories, listRepositories } from "@/lib/mirai/server";

export default async function ConnectGitHubPage() {
  const session = await getServerSession();

  if (isAuthConfigured && !session) {
    redirect("/signin");
  }

  const repositories = await listRepositories();
  const connectedRepositories = await listConnectedRepositories();

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <GitHubConsole repositories={repositories} connectedRepositories={connectedRepositories} />
      </div>
    </main>
  );
}
