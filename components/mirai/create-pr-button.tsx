"use client";

import { useEffect, useState } from "react";
import { ExternalLink, GitPullRequest, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CreatePrButton({
  patchId,
  prUrl,
  disabledReason,
}: {
  patchId: string | null;
  prUrl?: string | null;
  disabledReason?: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">(
    prUrl ? "done" : "idle",
  );
  const [url, setUrl] = useState<string | null>(prUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prUrl) {
      return;
    }

    setUrl(prUrl);
    setStatus("done");
    setError(null);
  }, [prUrl]);

  async function handleCreatePr() {
    if (!patchId) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(`/api/patches/${patchId}/create-pr`, {
        method: "POST",
      });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 409 && payload.pr_url) {
          setUrl(payload.pr_url);
          setStatus("done");
          return;
        }

        throw new Error(payload.error ?? "Failed to create pull request.");
      }

      if (!payload.pr_url) {
        throw new Error("Pull request URL was not returned.");
      }

      setUrl(payload.pr_url);
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Failed to create pull request.");
    }
  }

  return (
    <div className="space-y-3">
      {status === "done" && url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ExternalLink className="size-4" />
          View pull request
        </a>
      ) : (
        <Button
          type="button"
          onClick={handleCreatePr}
          disabled={status === "loading" || !patchId || Boolean(disabledReason)}
        >
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GitPullRequest className="size-4" />
          )}
          {status === "loading" ? "Opening pull request..." : "Open Pull Request"}
        </Button>
      )}

      {disabledReason ? <p className="text-sm text-muted-foreground">{disabledReason}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
