"use client";

import { useState } from "react";
import { Key, Plus, Copy, Trash2, Eye, EyeOff, ShieldCheck, AlertTriangle } from "lucide-react";

const initialKeys = [
  {
    id: "key_1",
    name: "Production Agent",
    prefix: "mrai_live_sk_",
    suffix: "•••••••••••••••••••••••3f9a",
    created: "Mar 18, 2026",
    lastUsed: "2 hours ago",
    scopes: ["bugs:read", "patches:write", "workflows:run"],
    status: "active",
  },
  {
    id: "key_2",
    name: "CI/CD Integration",
    prefix: "mrai_live_sk_",
    suffix: "•••••••••••••••••••••••b21c",
    created: "Mar 10, 2026",
    lastUsed: "Yesterday",
    scopes: ["bugs:read", "patches:read"],
    status: "active",
  },
  {
    id: "key_3",
    name: "Local Dev Key",
    prefix: "mrai_test_sk_",
    suffix: "•••••••••••••••••••••••a77d",
    created: "Feb 28, 2026",
    lastUsed: "6 days ago",
    scopes: ["bugs:read"],
    status: "inactive",
  },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(initialKeys);
  const [revealed, setRevealed] = useState<string[]>([]);

  const toggleReveal = (id: string) => {
    setRevealed(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  };

  const deleteKey = (id: string) => setKeys(prev => prev.filter(k => k.id !== id));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono font-semibold text-black/30 uppercase tracking-[0.15em] mb-2">Mirai / API Keys</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#111111] mb-1">API Keys</h1>
          <p className="text-sm text-black/50 max-w-lg">Manage secret keys for programmatic access to the Mirai API. Keep your keys secure — they carry your account's privileges.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#2A6948] hover:bg-[#1E4A31] text-white rounded-xl py-2.5 px-5 text-sm font-bold transition-colors shadow-sm shadow-[#2A6948]/20 shrink-0">
          <Plus className="w-4 h-4" /> Generate Key
        </button>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 leading-relaxed">
          API keys are shown only once on generation. Store them securely — Mirai does not store your full key.
        </p>
      </div>

      {/* Key list */}
      <div className="space-y-3">
        {keys.map(k => (
          <div key={k.id} className="bg-white border border-black/[0.05] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5F4F0] flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4 text-[#111111]/50" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#111111]">{k.name}</p>
                  <p className="text-xs text-black/40 mt-0.5">Created {k.created} · Last used {k.lastUsed}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${k.status === "active" ? "bg-[#2A6948]/10 text-[#2A6948]" : "bg-black/[0.05] text-black/40"}`}>
                {k.status}
              </span>
            </div>

            {/* Key display */}
            <div className="flex items-center gap-2 bg-[#F5F4F0] rounded-xl px-4 py-3 mb-4">
              <code className="flex-1 text-xs font-mono text-[#111111] truncate">
                {k.prefix}{revealed.includes(k.id) ? "sk_example_revealed_key_value" : k.suffix}
              </code>
              <button onClick={() => toggleReveal(k.id)} className="p-1 rounded hover:bg-black/[0.06] transition-colors text-black/40 hover:text-black/70">
                {revealed.includes(k.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button className="p-1 rounded hover:bg-black/[0.06] transition-colors text-black/40 hover:text-black/70">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scopes */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldCheck className="w-3.5 h-3.5 text-black/30 shrink-0" />
                {k.scopes.map(s => (
                  <span key={s} className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black/[0.04] text-black/50 rounded">{s}</span>
                ))}
              </div>
              <button onClick={() => deleteKey(k.id)} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Revoke
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Docs CTA */}
      <div className="bg-white border border-black/[0.05] rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold text-sm text-[#111111] mb-1">Using the Mirai API?</p>
          <p className="text-xs text-black/40">See the API reference to integrate bug detection and patching into your own tooling.</p>
        </div>
        <button className="shrink-0 border border-black/[0.08] bg-[#F5F4F0] hover:bg-black/[0.05] text-[#111111] rounded-xl py-2 px-4 text-xs font-bold transition-colors">
          View Docs →
        </button>
      </div>
    </div>
  );
}
