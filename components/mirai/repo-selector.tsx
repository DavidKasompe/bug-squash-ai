"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Lock, Globe, X, Github, CheckCircle2 } from "lucide-react";

export type SelectorRepo = {
  installation_id: string;
  full_name: string;
  language: string | null;
  private: boolean;
  source: "oauth" | "app";
};

type Props = {
  repositories: SelectorRepo[];
  selectedRepoKey: string;
  onChange: (key: string) => void;
  disabled?: boolean;
};

export function RepoSelector({ repositories, selectedRepoKey, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedRepo = repositories.find(
    (r) => `${r.installation_id}:${r.full_name}` === selectedRepoKey,
  );

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Auto-focus search when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return repositories;
    const q = query.toLowerCase();
    return repositories.filter((r) => r.full_name.toLowerCase().includes(q));
  }, [repositories, query]);

  const oauthRepos = filtered.filter((r) => r.source === "oauth");
  const appRepos = filtered.filter((r) => r.source === "app");
  const hasGroups = repositories.some((r) => r.source === "oauth") && repositories.some((r) => r.source === "app");

  const handleSelect = (key: string) => {
    onChange(key);
    setOpen(false);
  };

  const displayLabel = selectedRepo
    ? selectedRepo.full_name.split("/").pop() ?? selectedRepo.full_name
    : "No repo";

  const displayOwner = selectedRepo?.full_name.split("/")[0];

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen((v) => !v); }}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-[#F5F4F0] px-2.5 py-1.5 text-xs font-semibold text-black/60 outline-none min-w-[148px] max-w-[200px] hover:bg-white hover:border-black/[0.14] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Github className="w-3 h-3 shrink-0 text-black/35" />
        <span className="truncate flex-1 text-left">
          {selectedRepo ? (
            <>
              <span className="text-black/35">{displayOwner}/</span>
              <span className="text-[#111111]">{displayLabel}</span>
            </>
          ) : (
            <span className="text-black/40">No repo</span>
          )}
        </span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 text-black/30 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-white border border-black/[0.08] rounded-xl shadow-xl overflow-hidden">
          {/* Search bar */}
          <div className="p-2 border-b border-black/[0.05]">
            <div className="flex items-center gap-2 bg-[#F5F4F0] rounded-lg px-3 py-1.5">
              <Search className="w-3 h-3 text-black/30 shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter repositories…"
                className="flex-1 bg-transparent text-xs text-[#111111] placeholder:text-black/30 outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-black/25 hover:text-black/50 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {/* Clear selection */}
            <button
              onClick={() => handleSelect("")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#F5F4F0] transition-colors ${!selectedRepoKey ? "bg-[#2A6948]/5" : ""}`}
            >
              <span className="w-5 h-5 rounded-full bg-black/[0.06] flex items-center justify-center shrink-0">
                <X className="w-2.5 h-2.5 text-black/30" />
              </span>
              <span className={`text-xs font-medium ${!selectedRepoKey ? "text-[#2A6948]" : "text-black/45"}`}>
                No repository
              </span>
              {!selectedRepoKey && <CheckCircle2 className="w-3 h-3 text-[#2A6948] ml-auto" />}
            </button>

            {/* OAuth repos */}
            {oauthRepos.length > 0 && (
              <>
                {hasGroups && (
                  <SectionHeader label="Your GitHub Repos" />
                )}
                {oauthRepos.map((repo) => (
                  <RepoOption
                    key={`${repo.installation_id}:${repo.full_name}`}
                    repo={repo}
                    selected={selectedRepoKey === `${repo.installation_id}:${repo.full_name}`}
                    onSelect={handleSelect}
                  />
                ))}
              </>
            )}

            {/* App installation repos */}
            {appRepos.length > 0 && (
              <>
                {hasGroups && (
                  <SectionHeader label="GitHub App" />
                )}
                {appRepos.map((repo) => (
                  <RepoOption
                    key={`${repo.installation_id}:${repo.full_name}`}
                    repo={repo}
                    selected={selectedRepoKey === `${repo.installation_id}:${repo.full_name}`}
                    onSelect={handleSelect}
                  />
                ))}
              </>
            )}

            {filtered.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-black/30">
                No repositories match &ldquo;{query}&rdquo;
              </div>
            )}

            {repositories.length === 0 && !query && (
              <div className="px-4 py-6 text-center text-xs text-black/30">
                No repositories connected.{" "}
                <a href="/connections" className="text-[#2A6948] font-semibold hover:underline">
                  Connect GitHub
                </a>
              </div>
            )}
          </div>

          {/* Footer hint */}
          {repositories.length > 0 && (
            <div className="px-3 py-2 border-t border-black/[0.05] flex items-center justify-between">
              <span className="text-[10px] text-black/25">{repositories.length} repo{repositories.length !== 1 ? "s" : ""}</span>
              <a
                href="/connections"
                className="text-[10px] font-semibold text-[#2A6948] hover:underline"
                onClick={() => setOpen(false)}
              >
                Manage →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-3 py-1.5 bg-[#F5F4F0]/80 border-y border-black/[0.04] first:border-t-0">
      <span className="text-[10px] font-bold text-black/35 uppercase tracking-widest">{label}</span>
    </div>
  );
}

type RepoOptionProps = {
  repo: SelectorRepo;
  selected: boolean;
  onSelect: (key: string) => void;
};

function RepoOption({ repo, selected, onSelect }: RepoOptionProps) {
  const parts = repo.full_name.split("/");
  const owner = parts[0] ?? "";
  const name = parts[1] ?? repo.full_name;
  const key = `${repo.installation_id}:${repo.full_name}`;

  return (
    <button
      onClick={() => onSelect(key)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-[#F5F4F0] ${
        selected ? "bg-[#2A6948]/5" : ""
      }`}
    >
      {/* Avatar */}
      <span className="w-5 h-5 rounded-full bg-[#111111] flex items-center justify-center text-white text-[8px] font-bold shrink-0 uppercase">
        {owner[0] ?? "?"}
      </span>

      {/* Repo info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 min-w-0">
          <span className={`text-xs font-mono font-semibold truncate ${selected ? "text-[#2A6948]" : "text-[#111111]"}`}>
            {name}
          </span>
          {repo.private ? (
            <Lock className="w-2.5 h-2.5 text-black/25 shrink-0" />
          ) : (
            <Globe className="w-2.5 h-2.5 text-black/15 shrink-0" />
          )}
        </div>
        <p className="text-[10px] text-black/30 truncate">
          {owner}
          {repo.language ? ` · ${repo.language}` : ""}
        </p>
      </div>

      {/* Selected indicator */}
      {selected && <CheckCircle2 className="w-3.5 h-3.5 text-[#2A6948] shrink-0" />}
    </button>
  );
}
