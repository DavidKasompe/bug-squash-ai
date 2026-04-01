"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, Paperclip, CheckCircle2, TestTube2,
  Copy, GitMerge, Zap, FileCode2, Sparkles, RotateCcw,
  ThumbsUp, ThumbsDown, MessageSquare, Plus, Bug, Loader2
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  parseAnalysisResponse,
  parseCommitAnalysisResponse,
  type AnalysisResult,
  type CommitAnalysisResult,
  type CommitAnalysisFinding,
} from "@/lib/prompts";
import { CreatePrButton } from "@/components/mirai/create-pr-button";

const SUGGESTED_BUGS = [
  "TypeError: Cannot read properties of null (reading 'id')\n  at resumeCheckoutSession (src/payments/retry-checkout.ts:114)",
  "RangeError: Maximum call stack size exceeded\n  at render (src/components/RecursiveTree.tsx:23)",
  "ECONNREFUSED 127.0.0.1:5432 — database connection refused",
  "UnhandledPromiseRejectionWarning: JWT expired at /api/auth/verify",
];

type ChatSessionSummary = {
  id: string;
  title: string | null;
  created_at: string;
  bug_id: string | null;
  session_type?: "bug-chat" | "commit-analysis";
  commit_analysis?: {
    repo: string;
    branch: string;
    commit_sha: string;
    title: string;
  } | null;
  bug?: {
    id: string;
    title: string | null;
    status: string;
    severity: string;
    repo: string;
    installation_id: string | null;
  } | null;
};

type RestoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  bugId?: string | null;
};

function buildBugIdMap(messages: RestoredMessage[]) {
  return messages.reduce<Record<number, string>>((accumulator, message, index) => {
    if (message.bugId) {
      accumulator[index] = message.bugId;
    }

    return accumulator;
  }, {});
}

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
  const [patchId, setPatchId] = useState<string | null>(null);
  const [patchPrUrl, setPatchPrUrl] = useState<string | null>(null);
  const [patchLookupError, setPatchLookupError] = useState<string | null>(null);
  const hasPatchDiff = Boolean(result.diff);

  useEffect(() => {
    if (!bugId || patchId) return;

    let isActive = true;

    fetch(`/api/bugs/${bugId}/patch`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load patch details.");
        }

        if (!isActive) {
          return;
        }

        setPatchId(payload.patchId ?? null);
        setPatchPrUrl(payload.pr_url ?? null);
        setPatchLookupError(null);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setPatchLookupError(
          error instanceof Error ? error.message : "Failed to load patch details.",
        );
      });

    return () => {
      isActive = false;
    };
  }, [bugId, patchId]);

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
          <CreatePrButton
            patchId={patchId}
            prUrl={patchPrUrl}
            disabledReason={
              !hasPatchDiff
                ? "No diff was generated for this analysis."
                : patchLookupError
                  ? patchLookupError
                  : bugId && !patchId && !patchPrUrl
                    ? "Waiting for patch details."
                    : null
            }
          />
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

function CreateIssueFromFindingButton({
  finding,
  result,
  installationId,
  activeSessionId,
  existingBugId,
  onIssueCreated,
}: {
  finding: CommitAnalysisFinding;
  result: CommitAnalysisResult;
  installationId?: string | null;
  activeSessionId?: string | null;
  existingBugId?: string | null;
  onIssueCreated?: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [createdBugId, setCreatedBugId] = useState<string | null>(existingBugId ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingBugId) {
      setCreatedBugId(existingBugId);
    }
  }, [existingBugId]);

  const handleCreateIssue = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/bugs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: finding.title,
          repo: result.repo,
          severity: finding.severity,
          confidence: finding.confidence,
          detail: finding.detail || finding.title,
          file: finding.file,
          installationId,
          sessionId: activeSessionId,
          commitSha: result.commit_sha,
          commitMessage: result.commit_message,
          branch: result.branch,
          context: result.context,
          recommendedChecks: result.recommended_checks,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create issue.");
      }

      setCreatedBugId(payload.bugId ?? null);
      onIssueCreated?.();
      window.open(`/issues/${payload.bugId}`, "_blank", "noopener,noreferrer");
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : "Failed to create issue.");
    } finally {
      setIsCreating(false);
    }
  };

  if (createdBugId) {
    return (
      <a
        href={`/issues/${createdBugId}`}
        className="inline-flex items-center gap-2 rounded-lg border border-[#2A6948]/20 bg-[#2A6948]/10 px-3 py-1.5 text-[11px] font-semibold text-[#2A6948]"
      >
        <Bug className="h-3.5 w-3.5" />
        View issue
      </a>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleCreateIssue}
        disabled={isCreating}
        className="inline-flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-[11px] font-semibold text-black/70 hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bug className="h-3.5 w-3.5" />}
        Create issue
      </button>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
}

function CreatePatchDraftButton({
  finding,
  result,
  installationId,
  activeSessionId,
  existingBugId,
  onIssueCreated,
}: {
  finding: CommitAnalysisFinding;
  result: CommitAnalysisResult;
  installationId?: string | null;
  activeSessionId?: string | null;
  existingBugId?: string | null;
  onIssueCreated?: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [createdBugId, setCreatedBugId] = useState<string | null>(existingBugId ?? null);
  const [existingPatchId, setExistingPatchId] = useState<string | null>(null);
  const [existingPrUrl, setExistingPrUrl] = useState<string | null>(null);
  const [patchUnavailableMessage, setPatchUnavailableMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingBugId) {
      setCreatedBugId(existingBugId);
    }
  }, [existingBugId]);

  useEffect(() => {
    if (!createdBugId) {
      setExistingPatchId(null);
      setExistingPrUrl(null);
      return;
    }

    let isActive = true;

    fetch(`/api/bugs/${createdBugId}/patch`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load patch details.");
        }

        if (isActive) {
          setExistingPatchId(payload.patchId ?? null);
          setExistingPrUrl(payload.pr_url ?? null);
          setPatchUnavailableMessage(null);
        }
      })
      .catch(() => {
        if (isActive) {
          setExistingPatchId(null);
          setExistingPrUrl(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [createdBugId]);

  const handleCreatePatchDraft = async () => {
    setIsCreating(true);
    setError(null);
    setPatchUnavailableMessage(null);

    try {
      const response = await fetch("/api/commit-findings/patch-draft", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: finding.title,
          repo: result.repo,
          severity: finding.severity,
          confidence: finding.confidence,
          detail: finding.detail || finding.title,
          file: finding.file,
          installationId,
          sessionId: activeSessionId,
          commitSha: result.commit_sha,
          commitMessage: result.commit_message,
          branch: result.branch,
          context: result.context,
          recommendedChecks: result.recommended_checks,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create patch draft.");
      }

      setCreatedBugId(payload.bugId ?? null);
      setExistingPatchId(payload.patchId ?? null);
      setPatchUnavailableMessage(
        payload.patchStatus === "unavailable"
          ? payload.message ?? "No safe patch could be generated for this finding yet."
          : null,
      );
      onIssueCreated?.();
      window.open(`/issues/${payload.bugId}`, "_blank", "noopener,noreferrer");
    } catch (patchError) {
      setError(patchError instanceof Error ? patchError.message : "Failed to create patch draft.");
    } finally {
      setIsCreating(false);
    }
  };

  if (createdBugId && existingPatchId) {
    return (
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <a
          href={`/issues/${createdBugId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-[#2A6948]/20 bg-[#2A6948]/10 px-3 py-1.5 text-[11px] font-semibold text-[#2A6948]"
        >
          <FileCode2 className="h-3.5 w-3.5" />
          View patch draft
        </a>
        <CreatePrButton patchId={existingPatchId} prUrl={existingPrUrl} />
      </div>
    );
  }

  const noPatchMessage =
    patchUnavailableMessage ??
    (createdBugId && !existingPatchId
      ? "No safe patch draft is attached to this finding yet. You can review the issue or try regenerating with the current repo state."
      : null);

  if (createdBugId && noPatchMessage) {
    return (
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`/issues/${createdBugId}`}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700"
          >
            <Bug className="h-3.5 w-3.5" />
            View issue
          </a>
          <button
            type="button"
            onClick={handleCreatePatchDraft}
            disabled={isCreating}
            className="inline-flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-[11px] font-semibold text-black/70 hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            Regenerate patch draft
          </button>
        </div>
        <p className="text-[11px] text-amber-700">{noPatchMessage}</p>
        {error && <span className="text-[11px] text-red-600">{error}</span>}
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleCreatePatchDraft}
        disabled={isCreating}
        className="inline-flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-[11px] font-semibold text-black/70 hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCode2 className="h-3.5 w-3.5" />}
        Create patch draft
      </button>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
}

function CommitAnalysisBubble({
  result,
  installationId,
  activeSessionId,
  existingBugId,
  onIssueCreated,
}: {
  result: CommitAnalysisResult;
  installationId?: string | null;
  activeSessionId?: string | null;
  existingBugId?: string | null;
  onIssueCreated?: () => void;
}) {
  const severityClassName = (severity: "Critical" | "High" | "Medium" | "Low") => {
    if (severity === "Critical") return "bg-red-100 text-red-700";
    if (severity === "High") return "bg-orange-100 text-orange-700";
    if (severity === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  const confirmedFindingCards =
    result.confirmed_findings.length > 0
      ? result.confirmed_findings
      : result.confirmed_errors.map((detail) => ({
          title: detail,
          severity: "High" as const,
          confidence: 70,
          detail,
          file: null,
        }));

  const potentialFindingCards =
    result.potential_findings.length > 0
      ? result.potential_findings
      : result.potential_errors.map((detail) => ({
          title: detail,
          severity: "Medium" as const,
          confidence: 60,
          detail,
          file: null,
        }));

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0 mt-0.5">
        <GitMerge className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-[#2A6948]/10 text-[#2A6948]">
            Commit Analysis
          </span>
          <span className="text-sm font-bold text-[#111111]">{result.title}</span>
          <span className="ml-auto text-xs font-mono text-black/35">
            {result.repo} · {result.commit_sha.slice(0, 7)}
          </span>
        </div>

        <div className="bg-[#F5F4F0] rounded-2xl rounded-tl-sm overflow-hidden border border-black/[0.04]">
          <div className="px-5 py-3.5 border-b border-black/[0.04]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#111111]">Summary</p>
            <p className="mt-2 text-sm text-black/60 leading-relaxed">{result.summary}</p>
          </div>
          <div className="px-5 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#111111]">Context</p>
            <p className="mt-2 text-sm text-black/60 leading-relaxed">{result.context}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-black/[0.04] bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">Confirmed Errors</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{result.confirmed_errors_count}</p>
            <div className="mt-3 space-y-2">
              {confirmedFindingCards.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityClassName(item.severity)}`}>
                      {item.severity}
                    </span>
                    <span className="font-semibold">{item.title}</span>
                    <span className="ml-auto text-[10px] font-bold">{item.confidence}%</span>
                  </div>
                  <p className="mt-1 text-red-700/90">{item.detail}</p>
                  {item.file && <p className="mt-1 font-mono text-[10px] text-red-700/80">{item.file}</p>}
                  <CreateIssueFromFindingButton
                    finding={item}
                    result={result}
                    installationId={installationId}
                    activeSessionId={activeSessionId}
                    existingBugId={existingBugId}
                    onIssueCreated={onIssueCreated}
                  />
                  <CreatePatchDraftButton
                    finding={item}
                    result={result}
                    installationId={installationId}
                    activeSessionId={activeSessionId}
                    existingBugId={existingBugId}
                    onIssueCreated={onIssueCreated}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-black/[0.04] bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Potential Errors</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{result.potential_errors_count}</p>
            <div className="mt-3 space-y-2">
              {potentialFindingCards.map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityClassName(item.severity)}`}>
                      {item.severity}
                    </span>
                    <span className="font-semibold">{item.title}</span>
                    <span className="ml-auto text-[10px] font-bold">{item.confidence}%</span>
                  </div>
                  <p className="mt-1 text-amber-700/90">{item.detail}</p>
                  {item.file && <p className="mt-1 font-mono text-[10px] text-amber-700/80">{item.file}</p>}
                  <CreateIssueFromFindingButton
                    finding={item}
                    result={result}
                    installationId={installationId}
                    activeSessionId={activeSessionId}
                    existingBugId={existingBugId}
                    onIssueCreated={onIssueCreated}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-black/[0.04] bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#111111]">Changed Files</p>
          <div className="mt-3 space-y-2">
            {result.changed_files.map((filePath) => (
              <div key={filePath} className="text-xs font-mono text-black/60">{filePath}</div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-black/[0.04] bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#2A6948]">Recommended Checks</p>
          <div className="mt-3 space-y-2">
            {result.recommended_checks.map((check) => (
              <div key={check} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#2A6948]" />
                <span className="text-xs text-black/70">{check}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bugIds, setBugIds] = useState<Record<number, string>>({});
  const [chatSessions, setChatSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionLoading, setActiveSessionLoading] = useState(false);
  const [pendingBugId, setPendingBugId] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<Array<{
    installation_id: string;
    full_name: string;
  }>>([]);
  const [branchSuggestions, setBranchSuggestions] = useState<string[]>([]);
  const [selectedRepoKey, setSelectedRepoKey] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [sessionFilter, setSessionFilter] = useState<"all" | "bug-chat" | "commit-analysis">("all");

  const selectedRepo = repositories.find((repository) => `${repository.installation_id}:${repository.full_name}` === selectedRepoKey) ?? null;
  const filteredSessions = chatSessions.filter((chatSession) => {
    if (sessionFilter === "all") {
      return true;
    }

    return chatSession.session_type === sessionFilter;
  });
  const recentCommitAnalyses = chatSessions
    .filter((chatSession) => {
      if (chatSession.session_type !== "commit-analysis" || !chatSession.commit_analysis) {
        return false;
      }

      if (selectedRepo && chatSession.commit_analysis.repo !== selectedRepo.full_name) {
        return false;
      }

      if (selectedBranch.trim() && chatSession.commit_analysis.branch !== selectedBranch.trim()) {
        return false;
      }

      return true;
    })
    .slice(0, 5);
  const activeSessionSummary = chatSessions.find((chatSession) => chatSession.id === sessionId) ?? null;
  const requestedSessionId = searchParams.get("session");

  const refreshChatSessions = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/sessions", {
        credentials: "include",
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load chat sessions.");
      }

      setChatSessions((payload.sessions as ChatSessionSummary[]) ?? []);
    } catch (error) {
      console.error("[overview/page:sessions]", error);
    }
  }, []);

  const { messages, input, setInput, setMessages, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    streamProtocol: "text",
    body: {
      sessionId,
      repo: selectedRepo?.full_name,
      installationId: selectedRepo?.installation_id,
      branch: selectedBranch.trim() || undefined,
    },
    onResponse: (res) => {
      const sid = res.headers.get("x-session-id");
      const bid = res.headers.get("x-bug-id");
      if (sid && !sessionId) setSessionId(sid);
      if (bid) setPendingBugId(bid);
    },
  });

  useEffect(() => {
    if (!pendingBugId || messages.length === 0) {
      return;
    }

    const lastMessageIndex = messages.length - 1;
    const lastMessage = messages[lastMessageIndex];
    if (lastMessage?.role !== "assistant") {
      return;
    }

    setBugIds((previous) => ({
      ...previous,
      [lastMessageIndex]: pendingBugId,
    }));
    setPendingBugId(null);
  }, [messages, pendingBugId]);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    let isActive = true;

    async function loadRepositories() {
      try {
        const response = await fetch("/api/github/installations", {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load repositories.");
        }

        const nextRepositories = ((payload.installations as Array<{
          installation_id: string;
          repos?: Array<{ full_name: string }>;
        }>) ?? []).flatMap((installation) =>
          (installation.repos ?? []).map((repo) => ({
            installation_id: installation.installation_id,
            full_name: repo.full_name,
          })),
        );

        if (!isActive) {
          return;
        }

        setRepositories(nextRepositories);
        if (!selectedRepoKey && nextRepositories.length > 0) {
          setSelectedRepoKey(`${nextRepositories[0].installation_id}:${nextRepositories[0].full_name}`);
        }
      } catch (error) {
        console.error("[overview/page]", error);
      }
    }

    void loadRepositories();

    return () => {
      isActive = false;
    };
  }, [selectedRepoKey]);

  useEffect(() => {
    let isActive = true;

    async function loadBranches() {
      if (!selectedRepo) {
        setBranchSuggestions([]);
        return;
      }

      try {
        const params = new URLSearchParams({
          installationId: selectedRepo.installation_id,
          repo: selectedRepo.full_name,
        });
        const response = await fetch(`/api/github/branches?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to load branches.");
        }

        if (!isActive) {
          return;
        }

        const nextBranches = Array.isArray(payload.branches)
          ? payload.branches.filter((branch: unknown): branch is string => typeof branch === "string")
          : [];
        setBranchSuggestions(nextBranches);

        setSelectedBranch((previous) => (previous.trim() || nextBranches.length === 0 ? previous : nextBranches[0]));
      } catch (error) {
        console.error("[overview/page:branches]", error);
        if (isActive) {
          setBranchSuggestions([]);
        }
      }
    }

    void loadBranches();

    return () => {
      isActive = false;
    };
  }, [selectedRepo]);

  useEffect(() => {
    async function loadChatSessions() {
      await refreshChatSessions();
    }

    void loadChatSessions();
    const intervalId = window.setInterval(() => {
      void loadChatSessions();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshChatSessions, sessionId]);

  const handleSuggest = (s: string) => {
    setInput(s);
  };

  const handleCommitQuickAction = (mode: "latest" | "recent" | "recent-3") => {
    if (!selectedRepo) {
      return;
    }

    const repoLabel = selectedRepo.full_name.split("/").pop() ?? selectedRepo.full_name;
    const prompt =
      mode === "latest"
        ? `Analyze the last commit in ${repoLabel}`
        : mode === "recent"
          ? `Analyze the last 2 commits in ${repoLabel}`
          : `Analyze the last 3 commits in ${repoLabel}`;

    setInput(prompt);
    window.requestAnimationFrame(() => {
      formRef.current?.requestSubmit();
    });
  };

  const handleNewSession = useCallback(() => {
    setSessionId(null);
    setBugIds({});
    setMessages([]);
    setInput("");
    setPendingBugId(null);
  }, [setInput, setMessages]);

  const handleSessionChange = useCallback(async (nextSessionId: string) => {
    if (!nextSessionId) {
      handleNewSession();
      return;
    }

    setActiveSessionLoading(true);
    try {
      const response = await fetch(`/api/chat/sessions/${nextSessionId}`, {
        credentials: "include",
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load chat session.");
      }

      const restoredMessages = ((payload.session?.messages as RestoredMessage[] | undefined) ?? [])
        .map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          bugId: message.bugId ?? null,
        }));

      setSessionId(payload.session.id);
      setMessages(
        restoredMessages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
        })),
      );
      setBugIds(buildBugIdMap(restoredMessages));
      const sessionBug = payload.session?.bug as ChatSessionSummary["bug"] | undefined;
      if (sessionBug?.installation_id && sessionBug.repo) {
        setSelectedRepoKey(`${sessionBug.installation_id}:${sessionBug.repo}`);
      }
      const commitAnalysisMeta = payload.session?.commit_analysis as ChatSessionSummary["commit_analysis"] | undefined;
      if (!sessionBug?.installation_id && commitAnalysisMeta?.repo) {
        const matchingRepository = repositories.find(
          (repository) => repository.full_name === commitAnalysisMeta.repo,
        );

        if (matchingRepository) {
          setSelectedRepoKey(`${matchingRepository.installation_id}:${matchingRepository.full_name}`);
        }
      }
      if (commitAnalysisMeta?.branch) {
        setSelectedBranch(commitAnalysisMeta.branch);
      }
      setInput("");
      setPendingBugId(null);
    } catch (error) {
      console.error("[overview/page:session]", error);
    } finally {
      setActiveSessionLoading(false);
    }
  }, [handleNewSession, repositories, setInput, setMessages]);

  useEffect(() => {
    if (!requestedSessionId || requestedSessionId === sessionId || activeSessionLoading) {
      return;
    }

    void handleSessionChange(requestedSessionId);
  }, [activeSessionLoading, handleSessionChange, requestedSessionId, sessionId]);

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
          <select
            value={sessionFilter}
            onChange={(event) => setSessionFilter(event.target.value as "all" | "bug-chat" | "commit-analysis")}
            className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-black/60 outline-none"
          >
            <option value="all">All sessions</option>
            <option value="bug-chat">Bug chats</option>
            <option value="commit-analysis">Commit analyses</option>
          </select>
          <select
            value={sessionId ?? ""}
            onChange={(event) => {
              void handleSessionChange(event.target.value);
            }}
            className="max-w-64 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-black/60 outline-none"
          >
            <option value="">New session</option>
            {filteredSessions.map((chatSession) => (
              <option key={chatSession.id} value={chatSession.id}>
                {[
                  chatSession.session_type === "commit-analysis" ? "Commit" : chatSession.bug?.severity,
                  chatSession.session_type === "commit-analysis"
                    ? chatSession.commit_analysis?.branch
                    : chatSession.bug?.status,
                  chatSession.title ?? "Untitled chat",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </option>
            ))}
          </select>
          <select
            value={selectedRepoKey}
            onChange={(event) => setSelectedRepoKey(event.target.value)}
            className="max-w-64 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-black/60 outline-none"
          >
            <option value="">No repo context</option>
            {repositories.map((repository) => {
              const value = `${repository.installation_id}:${repository.full_name}`;
              return (
                <option key={value} value={value}>
                  {repository.full_name}
                </option>
              );
            })}
          </select>
          <input
            list="overview-branch-suggestions"
            value={selectedBranch}
            onChange={(event) => setSelectedBranch(event.target.value)}
            placeholder="Branch (optional)"
            className="w-36 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-black/60 outline-none placeholder:text-black/25"
          />
          <datalist id="overview-branch-suggestions">
            {branchSuggestions.map((branch) => (
              <option key={branch} value={branch} />
            ))}
          </datalist>
          <button
            type="button"
            onClick={() => handleCommitQuickAction("latest")}
            disabled={!selectedRepo || isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-black/60 hover:bg-black/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" /> Last commit
          </button>
          <button
            type="button"
            onClick={() => handleCommitQuickAction("recent")}
            disabled={!selectedRepo || isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-black/60 hover:bg-black/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GitMerge className="w-3.5 h-3.5" /> Last 2 commits
          </button>
          <button
            type="button"
            onClick={() => handleCommitQuickAction("recent-3")}
            disabled={!selectedRepo || isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-black/60 hover:bg-black/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GitMerge className="w-3.5 h-3.5" /> Last 3 commits
          </button>
          <button onClick={handleNewSession}
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
            {selectedRepo ? (
              <div className="mt-6 rounded-2xl border border-[#2A6948]/10 bg-[#2A6948]/[0.03] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#2A6948]">Commit Analysis</p>
                <p className="mt-2 text-sm text-black/55">
                  Analyze the selected repository{selectedBranch.trim() ? ` on branch ${selectedBranch.trim()}` : ""} without typing a prompt.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleCommitQuickAction("latest")}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black/65 ring-1 ring-black/[0.06] hover:bg-black/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Zap className="h-3.5 w-3.5 text-[#2A6948]" />
                    Analyze last commit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCommitQuickAction("recent")}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black/65 ring-1 ring-black/[0.06] hover:bg-black/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <GitMerge className="h-3.5 w-3.5 text-[#2A6948]" />
                    Analyze last 2 commits
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCommitQuickAction("recent-3")}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black/65 ring-1 ring-black/[0.06] hover:bg-black/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <GitMerge className="h-3.5 w-3.5 text-[#2A6948]" />
                    Analyze last 3 commits
                  </button>
                </div>
                {recentCommitAnalyses.length > 0 ? (
                  <div className="mt-5 rounded-xl border border-black/[0.05] bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/35">Recent Commit Analyses</p>
                    <div className="mt-3 space-y-2">
                      {recentCommitAnalyses.map((chatSession) => (
                        <button
                          key={chatSession.id}
                          type="button"
                          onClick={() => {
                            void handleSessionChange(chatSession.id);
                          }}
                          className="flex w-full items-center justify-between rounded-xl border border-black/[0.05] px-3 py-2 text-left hover:bg-black/[0.02]"
                        >
                          <div>
                            <p className="text-xs font-semibold text-black/75">
                              {chatSession.commit_analysis?.title ?? chatSession.title ?? "Commit analysis"}
                            </p>
                            <p className="mt-1 text-[11px] font-mono text-black/40">
                              {chatSession.commit_analysis?.branch} · {chatSession.commit_analysis?.commit_sha.slice(0, 7)}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2A6948]">Open</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-8">
          {activeSessionLoading ? (
            <div className="rounded-2xl border border-black/[0.05] bg-white px-4 py-3 text-sm text-black/50">
              Loading saved conversation…
            </div>
          ) : null}
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
            const commitAnalysis = parseCommitAnalysisResponse(m.content);
            if (commitAnalysis) {
              return (
                <CommitAnalysisBubble
                  key={m.id}
                  result={commitAnalysis}
                  installationId={selectedRepo?.full_name === commitAnalysis.repo ? selectedRepo.installation_id : null}
                  activeSessionId={sessionId}
                  existingBugId={activeSessionSummary?.bug_id ?? null}
                  onIssueCreated={() => {
                    void refreshChatSessions();
                  }}
                />
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
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="bg-[#F5F4F0] border border-black/[0.06] rounded-2xl overflow-hidden focus-within:border-[#2A6948]/40 focus-within:bg-white transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
                placeholder="Paste a stack trace, describe a bug, or ask to analyze a commit..."
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
