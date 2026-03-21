"use client";

import { useMemo, useState } from "react";
import { FileText, GitBranch, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Repository } from "@/lib/mirai/types";

export function UploadConsole({
  connectedRepositories,
  availableRepositories,
}: {
  connectedRepositories: Repository[];
  availableRepositories: Repository[];
}) {
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string>(connectedRepositories[0]?.id ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const selectedRepository = useMemo(
    () => connectedRepositories.find((repository) => repository.id === selectedRepositoryId) ?? null,
    [connectedRepositories, selectedRepositoryId],
  );

  async function handleUpload() {
    if (!selectedRepositoryId || !selectedFile) {
      setStatusMessage("Choose a repository and a log file first.");
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("repositoryId", selectedRepositoryId);
    formData.append("file", selectedFile);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as { message?: string; storagePath?: string };
    setIsUploading(false);

    if (!response.ok) {
      setStatusMessage(result.message ?? "Upload failed.");
      return;
    }

    setStatusMessage(`Uploaded to ${result.storagePath ?? "Mirai intake"}.`);
    setSelectedFile(null);
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-secondary p-3 text-secondary-foreground">
            <GitBranch className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Repository context</h2>
            <p className="text-sm text-muted-foreground">
              Choose a connected repository so log analysis can resolve code ownership and patch targets.
            </p>
          </div>
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
                  {repository.defaultBranch}
                </p>
              </div>
            </button>
          ))}
        </div>

        {availableRepositories.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-4">
            <p className="text-sm font-medium">Available to connect next</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {availableRepositories.map((repository) => repository.fullName).join(", ")}
            </p>
          </div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-secondary p-3 text-secondary-foreground">
            <Upload className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">Upload intake</h2>
            <p className="text-sm text-muted-foreground">
              Uploads now target the Supabase storage contract when the project env is configured.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-dashed border-border bg-background p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-secondary p-4 text-secondary-foreground">
              <FileText className="size-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Upload logs into Supabase storage</h3>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              The selected repository is <span className="font-medium text-foreground">{selectedRepository?.fullName ?? "not set"}</span>.
              Mirai will persist raw logs to Supabase Storage and trigger Mastra analysis on upload.
            </p>

            <label className="mt-6 block w-full max-w-xl rounded-2xl border border-border bg-card px-4 py-4 text-left">
              <span className="text-sm font-medium">Log file</span>
              <input
                type="file"
                accept=".log,.txt,.json"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="mt-3 block w-full text-sm"
              />
            </label>

            <Button className="mt-5" type="button" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload and register log"}
            </Button>

            {statusMessage ? <p className="mt-4 text-sm text-muted-foreground">{statusMessage}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
