"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import {
  Send, Paperclip, AlertTriangle, CheckCircle2, TestTube2,
  Copy, GitMerge, Zap, FileCode2, Sparkles, RotateCcw,
  ThumbsUp, ThumbsDown, MessageSquare, Plus, Bug, ExternalLink,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { parseAnalysisResponse, type AnalysisResult } from "@/lib/prompts";

const SUGGESTED_BUGS = [
  "TypeError: Cannot read properties of null (reading 'id')\n  at resumeCheckoutSession (src/payments/retry-checkout.ts:114)",
  "RangeError: Maximum call stack size exceeded\n  at render (src/components/RecursiveTree.tsx:23)",
  "ECONNREFUSED 127.0.0.1:5432 — database connection refused",
  "UnhandledPromiseRejectionWarning: JWT expired at /api/auth/verify",
];

// ─── Bubble Components ────────────────────────────────────────────────────────
function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-[#2A6948] text-white rounded-2xl rounded-br-sm px-4 py-3">
        <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-[#F5F4F0] rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#2A6948]/50 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-[#2A6948]/50 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-[#2A6948]/50 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function AnalysisBubble({ result }: { result: AnalysisResult }) {
  const sColor =
    result.severity === "Critical" ? "bg-red-50 text-red-600" :
    result.severity === "High"     ? "bg-orange-50 text-orange-600" :
                                     "bg-amber-50 text-amber-600";
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${sColor}`}>{result.severity}</span>
          <span className="text-sm font-bold text-[#111111]">{result.title}</span>
          <span className="ml-auto text-xs font-bold text-[#2A6948]">{result.confidence}% confidence</span>
        </div>
        <div className="bg-[#F5F4F0] rounded-2xl rounded-tl-sm overflow-hidden border border-black/[0.04]">
          <div className="px-5 py-3.5 border-b border-black/[0.04] flex gap-4">
            <div className="w-28 shrink-0 text-[10px] font-bold text-[#111111] uppercase tracking-wider mt-0.5">Root Cause</div>
            <p className="text-sm text-black/60 leading-relaxed">{result.root_cause}</p>
          </div>
          {result.fix_steps.map((step, i) => (
            <div key={i} className="px-5 py-3 border-b border-black/[0.04] last:border-0 flex gap-4 items-start">
              <div className="w-28 shrink-0 text-[10px] font-bold text-[#111111] uppercase tracking-wider mt-0.5">Step {i + 1}</div>
              <p className="text-sm text-black/60 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
        {(result.affected_file || result.affected_function) && (
          <div className="flex items-center gap-4 text-xs">
            {result.affected_file && <span className="font-mono text-black/40">{result.affected_file}</span>}
            {result.affected_function && <span className="font-mono text-[#2A6948]">{result.affected_function}()</span>}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-black/[0.04]"><ThumbsUp className="w-3.5 h-3.5 text-black/30" /></button>
          <button className="p-1.5 rounded-lg hover:bg-black/[0.04]"><ThumbsDown className="w-3.5 h-3.5 text-black/30" /></button>
          <button className="p-1.5 rounded-lg hover:bg-black/[0.04]"><RotateCcw className="w-3.5 h-3.5 text-black/30" /></button>
        </div>
      </div>
    </div>
  );
}

function DiffBubble({ result, bugId }: { result: AnalysisResult; bugId?: string }) {
  const [prStatus, setPrStatus] = useState<"idle" | "loading" | "done">("idle");
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [patchId, setPatchId] = useState<string | null>(null);

  // Load patch ID from Supabase via bug ID
  useEffect(() => {
    if (!bugId || patchId) return;
    fetch(`/api/bugs/${bugId}/patch`).then(r => r.json()).then(d => {
      if (d.patchId) setPatchId(d.patchId);
    }).catch(() => {});
  }, [bugId, patchId]);

  const handleMerge = async () => {
    if (!patchId) return;
    setPrStatus("loading");
    try {
      const res = await fetch(`/api/patches/${patchId}/create-pr`, { method: "POST" });
      const data = await res.json();
      if (data.pr_url) {
        setPrUrl(data.pr_url);
        setPrStatus("done");
      } else {
        throw new Error(data.error ?? "Unknown error");
      }
    } catch (err: any) {
      alert(`PR creation failed: ${err.message}`);
      setPrStatus("idle");
    }
  };

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0 mt-0.5">
        <GitMerge className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-3.5 h-3.5 text-black/40" />
          <span className="text-xs font-mono font-semibold text-[#111111]">
            {result.affected_file ?? "Patch"} · {result.diff ? "Changes ready" : "No diff generated"}
          </span>
          <button className="ml-auto flex items-center gap-1 text-[10px] font-bold border border-black/[0.08] px-2 py-1 rounded-lg hover:bg-black/[0.03]" onClick={() => navigator.clipboard.writeText(result.diff ?? "")}>
            <Copy className="w-3 h-3" /> Copy
          </button>
        </div>

        {result.diff && (
          <div className="bg-[#111111] rounded-2xl overflow-x-auto text-xs font-mono border border-black/10">
            {result.diff.split("\n").map((line, i) => {
              const cls =
                line.startsWith("+") && !line.startsWith("+++") ? "bg-[#2A6948]/10 text-[#5fba87]" :
                line.startsWith("-") && !line.startsWith("---") ? "bg-red-500/10 text-red-400" :
                line.startsWith("@@")                           ? "text-blue-400/60" :
                                                                   "text-white/30";
              return (
                <div key={i} className={`px-4 py-0.5 ${cls}`}>{line || "\u00A0"}</div>
              );
            })}
          </div>
        )}

        {result.tests.length > 0 && (
          <div className="bg-[#F5F4F0] rounded-xl p-4 border border-black/[0.04]">
            <div className="flex items-center gap-2 mb-3">
              <TestTube2 className="w-3.5 h-3.5 text-[#2A6948]" />
              <p className="text-[10px] font-bold text-[#2A6948] uppercase tracking-wider">Auto-Generated Tests</p>
            </div>
            {result.tests.map((t, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-black/[0.04] last:border-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2A6948] shrink-0" />
                <span className="text-xs font-mono text-[#111111]/60">{t}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2.5">
          {prStatus === "done" ? (
            <a href={prUrl!} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 bg-[#2A6948] text-white rounded-xl py-2.5 px-5 text-xs font-bold">
              <ExternalLink className="w-3.5 h-3.5" /> View PR on GitHub
            </a>
          ) : (
            <button onClick={handleMerge} disabled={prStatus === "loading" || !patchId}
              className="flex items-center gap-2 bg-[#2A6948] hover:bg-[#1E4A31] disabled:opacity-40 text-white rounded-xl py-2.5 px-5 text-xs font-bold transition-colors shadow-md shadow-[#2A6948]/20">
              {prStatus === "loading" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitMerge className="w-3.5 h-3.5" />}
              {prStatus === "loading" ? "Creating PR..." : "Open Pull Request"}
            </button>
          )}
          <button className="flex items-center gap-2 border border-black/[0.08] bg-white hover:bg-black/[0.02] text-black/60 rounded-xl py-2.5 px-4 text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5" /> Comment
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-black/[0.04]"><ThumbsUp className="w-3.5 h-3.5 text-black/30" /></button>
          <button className="p-1.5 rounded-lg hover:bg-black/[0.04]"><ThumbsDown className="w-3.5 h-3.5 text-black/30" /></button>
          <button className="p-1.5 rounded-lg hover:bg-black/[0.04]"><RotateCcw className="w-3.5 h-3.5 text-black/30" /></button>
        </div>
      </div>
    </div>
  );
}

function PlainBubble({ content }: { content: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 bg-[#F5F4F0] rounded-2xl rounded-tl-sm px-5 py-4">
        <p className="text-sm text-[#111111] leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bugIds, setBugIds] = useState<Record<number, string>>({});

  const { messages, input, setInput, handleSubmit, isLoading, append } = useChat({
    api: "/api/chat",
    body: { sessionId },
    onResponse: (res) => {
      const sid = res.headers.get("x-session-id");
      const bid = res.headers.get("x-bug-id");
      if (sid && !sessionId) setSessionId(sid);
      if (bid) setBugIds(prev => ({ ...prev, [messages.length]: bid }));
    },
  });

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSuggest = (s: string) => {
    setInput(s);
  };

  return (
    <div className="flex flex-col h-full -my-10 -mx-6 md:-mx-10">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05] bg-white/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-[#2A6948]" />
            <span className="font-bold text-sm text-[#111111]">AI Debugging</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-black/20" />
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#2A6948]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2A6948] animate-pulse" />
            Agent active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { window.location.reload(); }}
            className="flex items-center gap-1.5 border border-black/[0.08] bg-white rounded-lg px-3 py-1.5 text-xs font-semibold text-black/60 hover:bg-black/[0.02]">
            <Plus className="w-3.5 h-3.5" /> New session
          </button>
          <Link href="/issues" className="flex items-center gap-1.5 bg-[#2A6948] hover:bg-[#1E4A31] text-white rounded-lg px-3 py-1.5 text-xs font-bold transition-colors">
            All issues
          </Link>
        </div>
      </div>

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 space-y-8">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-bold text-black/30 uppercase tracking-wider mb-3">Paste a stack trace or try an example</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_BUGS.map(s => (
                <button key={s} onClick={() => handleSuggest(s)}
                  className="text-left p-3.5 rounded-xl border border-black/[0.06] bg-white hover:border-[#2A6948]/30 hover:bg-[#2A6948]/[0.03] text-xs text-black/60 font-mono transition-all line-clamp-2">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-8">
          {messages.map((m, idx) => {
            if (m.role === "user") return <UserBubble key={m.id} content={m.content} />;

            // Try to parse as structured AI response
            const parsed = parseAnalysisResponse(m.content);
            if (parsed) {
              const bugId = bugIds[idx];
              return (
                <div key={m.id} className="space-y-5">
                  <AnalysisBubble result={parsed} />
                  {parsed.diff && <DiffBubble result={parsed} bugId={bugId} />}
                </div>
              );
            }
            // Plain conversational response
            return <PlainBubble key={m.id} content={m.content} />;
          })}

          {isLoading && <ThinkingBubble />}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="px-6 md:px-10 pb-6 pt-3 border-t border-black/[0.05] bg-white/80 backdrop-blur shrink-0">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="bg-[#F5F4F0] border border-black/[0.06] rounded-2xl overflow-hidden focus-within:border-[#2A6948]/40 focus-within:bg-white transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e as any); }}
                placeholder="Paste a stack trace, error log, or describe a bug..."
                rows={3}
                className="w-full bg-transparent px-5 pt-4 pb-2 text-sm text-[#111111] placeholder:text-black/30 focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-black/[0.04]">
                <div className="flex items-center gap-1.5">
                  <button type="button" className="p-1.5 rounded-lg hover:bg-black/[0.05] text-black/30 hover:text-black/60">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 rounded-lg hover:bg-black/[0.05] text-black/30 hover:text-black/60">
                    <Zap className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-black/25 font-medium ml-1 hidden sm:block">
                    Write comments, add context, or assign tasks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-black/25 font-mono hidden sm:block">⌘↵</span>
                  <button type="submit" disabled={!input.trim() || isLoading}
                    className="w-8 h-8 bg-[#2A6948] hover:bg-[#1E4A31] disabled:opacity-30 rounded-xl flex items-center justify-center transition-colors shadow-sm shadow-[#2A6948]/20">
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
