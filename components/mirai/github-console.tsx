"use client";

import { useMemo, useState } from "react";
import { FolderGit2, Github, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Repository } from "@/lib/mirai/types";

export function GitHubConsole({
  repositories,
  connectedRepositories,
}: {
  repositories: Repository[];
  connectedRepositories: Repository[];
}) {
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string>(connectedRepositories[0]?.id ?? "");
  const [path, setPath] = useState("/");

  const selectedRepository = useMemo(
    () => repositories.find((repository) => repository.id === selectedRepositoryId) ?? null,
    [repositories, selectedRepositoryId],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">GitHub integration</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Connect and scope repository analysis</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              This replaces the legacy OAuth and repository selection flow with a single Next.js page.
            </p>
          </div>
          <Button type="button">
            <Github className="size-4" />
            Connect GitHub
          </Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <FolderGit2 className="size-5 text-primary" />
            <h2 className="font-display text-2xl font-semibold tracking-tight">Connected repositories</h2>
          </div>

          <div className="mt-6 grid gap-3">
            {connectedRepositories.map((repository) => (
              <button
                key={repository.id}
                type="button"
                onClick={() => setSelectedRepositoryId(repository.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                  selectedRepositoryId === repository.id
                    ? "border-primary bg-secondary"
                    : "border-border bg-background hover:bg-secondary/60"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{repository.fullName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{repository.description}</p>
                  </div>
                  <p className="rounded-full bg-card px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {repository.status}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Analysis scope</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use this to choose branch and path filters before starting repository analysis.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm font-medium">Default branch</p>
              <p className="mt-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                {selectedRepository?.defaultBranch ?? "Select a connected repository"}
              </p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium">Path filter</span>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={path}
                  onChange={(event) => setPath(event.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <div className="rounded-2xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
              {selectedRepository
                ? `Mirai will analyze ${selectedRepository.fullName} on ${selectedRepository.defaultBranch} with path ${path}.`
                : "Choose a repository to preview the scope."}
            </div>

            <Button type="button" className="w-full">
              Start repository analysis
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium">Available to connect</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {repositories
            .filter((repository) => !repository.isConnected)
            .map((repository) => repository.fullName)
            .join(", ") || "All listed repositories are already connected."}
        </p>
      </section>
    </div>
  );
}
