"use client";

import { useState } from "react";
import { Key, Plus, Copy, Trash2, Eye, EyeOff, ShieldCheck, AlertTriangle } from "lucide-react";

const initialKeys = [
  {
    id: "key_1",
    name: "Production Agent",
    prefix: "mrai_live_sk_",
    suffix: "••••••••••••••••••••••••3f9a",
    created: "Mar 18, 2026",
    lastUsed: "2 hours ago",
    scopes: ["bugs:read", "patches:write", "workflows:run"],
    status: "active",
  },
  {
    id: "key_2",
    name: "CI/CD Integration",
    prefix: "mrai_live_sk_",
    suffix: "••••••••••••••••••••••••b21c",
    created: "Mar 10, 2026",
    lastUsed: "Yesterday",
    scopes: ["bugs:read", "patches:read"],
    status: "active",
  },
  {
    id: "key_3",
    name: "Local Dev Key",
    prefix: "mrai_test_sk_",
    suffix: "••••••••••••••••••••••••a77d",
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
    setRevealed((previous) =>
      previous.includes(id) ? previous.filter((keyId) => keyId !== id) : [...previous, id],
    );
  };

  const deleteKey = (id: string) => setKeys((previous) => previous.filter((key) => key.id !== id));

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-mono font-semibold uppercase tracking-[0.15em] text-black/30">
            Mirai / API Keys
          </p>
          <h1 className="mb-1 text-3xl font-bold tracking-tight text-[#111111]">API Keys</h1>
          <p className="max-w-lg text-sm text-black/50">
            Manage secret keys for programmatic access to the Mirai API. Keep your keys secure and remember they
            carry your account&apos;s privileges.
          </p>
        </div>
        <button className="shrink-0 rounded-xl bg-[#2A6948] px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-[#2A6948]/20 transition-colors hover:bg-[#1E4A31]">
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Generate Key
          </span>
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-sm leading-relaxed text-amber-700">
          API keys are shown only once on generation. Store them securely because Mirai does not keep your full key.
        </p>
      </div>

      <div className="space-y-3">
        {keys.map((key) => (
          <div key={key.id} className="rounded-2xl border border-black/[0.05] bg-white p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F4F0]">
                  <Key className="h-4 w-4 text-[#111111]/50" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111111]">{key.name}</p>
                  <p className="mt-0.5 text-xs text-black/40">
                    Created {key.created} · Last used {key.lastUsed}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  key.status === "active" ? "bg-[#2A6948]/10 text-[#2A6948]" : "bg-black/[0.05] text-black/40"
                }`}
              >
                {key.status}
              </span>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#F5F4F0] px-4 py-3">
              <code className="flex-1 truncate text-xs font-mono text-[#111111]">
                {key.prefix}
                {revealed.includes(key.id) ? "sk_example_revealed_key_value" : key.suffix}
              </code>
              <button
                onClick={() => toggleReveal(key.id)}
                className="rounded p-1 text-black/40 transition-colors hover:bg-black/[0.06] hover:text-black/70"
              >
                {revealed.includes(key.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button className="rounded p-1 text-black/40 transition-colors hover:bg-black/[0.06] hover:text-black/70">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-black/30" />
                {key.scopes.map((scope) => (
                  <span
                    key={scope}
                    className="rounded bg-black/[0.04] px-2 py-0.5 text-[10px] font-mono font-bold text-black/50"
                  >
                    {scope}
                  </span>
                ))}
              </div>
              <button
                onClick={() => deleteKey(key.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 transition-colors hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Revoke
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/[0.05] bg-white p-6">
        <div>
          <p className="mb-1 text-sm font-bold text-[#111111]">Using the Mirai API?</p>
          <p className="text-xs text-black/40">
            See the API reference to integrate bug detection and patching into your own tooling.
          </p>
        </div>
        <button className="shrink-0 rounded-xl border border-black/[0.08] bg-[#F5F4F0] px-4 py-2 text-xs font-bold text-[#111111] transition-colors hover:bg-black/[0.05]">
          View Docs →
        </button>
      </div>
    </div>
  );
}
