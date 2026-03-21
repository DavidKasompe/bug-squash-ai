"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Github, UploadCloud, Activity, CheckCircle2, Wifi, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Repo  = { id: number; name: string; full_name: string; private: boolean; language: string | null; updated_at: string };
type Inst  = { id: string; installation_id: string; account_login: string; account_type: string; repos: Repo[]; created_at: string };

export default function ConnectionsPage() {
  const router = useRouter();
  const [installations, setInstallations] = useState<Inst[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [traceText, setTraceText] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "connected") setSuccess("Repository connected successfully!");
    if (params.get("error"))                   setError("Failed to connect. Please try again.");
    // Clean URL
    window.history.replaceState({}, "", "/connections");
  }, []);

  useEffect(() => {
    supabase
      .from("installations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setInstallations((data as Inst[]) ?? []); setLoading(false); });
  }, []);

  const handleConnect = () => {
    router.push("/api/github/install");
  };

  const handleUpload = async () => {
    if (!traceText.trim()) return;
    setUploading(true);
    try {
      const res = await fetch("/api/bugs/upload", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ trace: traceText, repo: "manual-upload" }),
      });
      const data = await res.json();
      if (data.bugId) {
        setTraceText("");
        setSuccess("Trace uploaded! Mirai is analyzing it now…");
        router.push(`/issues/${data.bugId}`);
      }
    } catch { setError("Upload failed. Please try again."); }
    finally { setUploading(false); }
  };

  const allRepos = installations.flatMap(inst =>
    (inst.repos ?? []).map(r => ({ ...r, account_login: inst.account_login, installation_id: inst.installation_id }))
  );

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="text-xs font-mono font-semibold text-black/30 uppercase tracking-[0.15em] mb-2">Mirai / Connections</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111] mb-1">Data Sources</h1>
        <p className="text-sm text-black/50 max-w-lg">Connect Mirai to your GitHub repositories or upload runtime traces for immediate analysis.</p>
      </div>

      {/* Status banners */}
      {success && (
        <div className="flex items-center gap-3 bg-[#2A6948]/10 border border-[#2A6948]/20 rounded-2xl px-5 py-3.5 text-sm text-[#2A6948] font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-3.5 text-sm text-red-600 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── GitHub Card ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-black/[0.05] rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#F5F4F0] flex items-center justify-center shrink-0">
              <Github className="w-5 h-5 text-[#111111]" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#111111]">GitHub App</h2>
              <p className="text-xs text-black/40">Automatic PR generation on bug detection</p>
            </div>
          </div>

          <div className="flex-1 space-y-2 mb-5">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-black/30 py-4"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading repos...</div>
            ) : allRepos.length === 0 ? (
              <div className="text-center py-6 text-black/30">
                <Github className="w-6 h-6 mx-auto mb-2 opacity-20" />
                <p className="text-xs">No repositories connected yet.</p>
              </div>
            ) : (
              allRepos.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-black/[0.06] bg-[#F5F4F0]/60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-[#2A6948] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-semibold text-[#111111] truncate">{r.full_name}</p>
                      <p className="text-[10px] text-black/30">{r.language ?? "Unknown"} · {r.private ? "Private" : "Public"}</p>
                    </div>
                  </div>
                  <a href={`https://github.com/${r.full_name}`} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] font-bold px-2.5 py-1 border border-black/[0.08] rounded-lg bg-white hover:bg-black/[0.03] transition-colors flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> View
                  </a>
                </div>
              ))
            )}
            {allRepos.length > 5 && (
              <p className="text-xs text-black/30 text-center pt-1">+{allRepos.length - 5} more repos connected</p>
            )}
          </div>

          <button onClick={handleConnect}
            className="w-full bg-[#111111] hover:bg-black/80 text-white rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 font-semibold text-sm transition-colors">
            <Github className="w-4 h-4" /> {allRepos.length > 0 ? "Connect More Repos" : "Connect GitHub"}
          </button>
        </div>

        {/* ── Upload Card ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-black/[0.05] rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#F5F4F0] flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5 text-[#111111]" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#111111]">Upload Trace</h2>
              <p className="text-xs text-black/40">Paste any stack trace for immediate analysis</p>
            </div>
          </div>

          <textarea
            value={traceText}
            onChange={e => setTraceText(e.target.value)}
            placeholder={"TypeError: Cannot read properties of null...\n  at myFunction (src/app.ts:23)\n  ..."}
            rows={7}
            className="w-full flex-1 bg-[#F5F4F0] border border-transparent rounded-xl px-4 py-3 text-xs font-mono text-[#111111] placeholder:text-black/20 focus:outline-none focus:border-[#2A6948]/30 focus:bg-white transition-all resize-none mb-5"
          />

          <div className="flex items-start gap-2.5 text-[11px] text-black/50 bg-[#F5F4F0] p-3 rounded-xl mb-4">
            <Activity className="w-3.5 h-3.5 text-[#2A6948] shrink-0 mt-0.5" />
            Mirai parses the stack trace, identifies the file and function, and starts AI analysis immediately.
          </div>

          <button onClick={handleUpload} disabled={!traceText.trim() || uploading}
            className="w-full bg-[#2A6948] hover:bg-[#1E4A31] disabled:opacity-40 text-white rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 font-semibold text-sm transition-colors">
            {uploading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</> : <><UploadCloud className="w-4 h-4" /> Analyze Trace</>}
          </button>
        </div>
      </div>

      {/* Connected accounts */}
      {installations.length > 0 && (
        <div className="bg-white border border-black/[0.05] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-black/[0.05] flex items-center gap-2">
            <Wifi className="w-4 h-4 text-black/30" />
            <h2 className="font-bold text-sm text-[#111111]">Connected Accounts</h2>
          </div>
          <div className="divide-y divide-black/[0.04]">
            {installations.map(inst => (
              <div key={inst.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-white text-xs font-bold">
                    {inst.account_login?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">{inst.account_login}</p>
                    <p className="text-xs text-black/40">{inst.account_type} · {(inst.repos ?? []).length} repos</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#2A6948] bg-[#2A6948]/10 px-2 py-0.5 rounded-full">Connected</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
