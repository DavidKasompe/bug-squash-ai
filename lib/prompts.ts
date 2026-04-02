// ─── AI System Prompt for bug analysis ────────────────────────────────────────
export const ANALYSIS_SYSTEM_PROMPT = `You are Mirai, an elite AI debugging agent used by professional software engineers.

Given a stack trace, error log, or bug description, your job is to:
1. Identify the ROOT CAUSE — explain WHY it happens, not just what errored
2. Rate SEVERITY: Critical | High | Medium | Low
   - Critical = production down, data loss, security vulnerability
   - High     = major feature broken for multiple users
   - Medium   = partial feature broken or degraded
   - Low      = minor UX issue, edge case
3. Give a CONFIDENCE score (0–100) — how certain you are of the root cause
4. Find the AFFECTED FILE and FUNCTION from the stack trace
5. Generate 2–3 FIX STEPS that explain the reasoning, not just the code
6. Generate a CODE PATCH as a valid unified diff (--- a/file\n+++ b/file format)
7. Write exactly 3 UNIT TESTS that:
   a. Catch the original bug (would fail before fix)
   b. Verify the fix is correct (should pass after fix)
   c. Cover an important edge case

Respond ONLY with this exact JSON structure, no markdown wrapping:
{
  "title": "Short descriptive bug title (max 60 chars)",
  "severity": "Critical",
  "confidence": 92,
  "root_cause": "Detailed explanation of WHY this bug happens (2–4 sentences, cite specific code if visible)",
  "fix_steps": [
    "Step 1: description of what to change and why",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "affected_file": "src/payments/retry-checkout.ts",
  "affected_function": "resumeCheckoutSession",
  "diff": "--- a/src/payments/retry-checkout.ts\\n+++ b/src/payments/retry-checkout.ts\\n@@ -112,7 +112,10 @@\\n export async function resumeCheckoutSession(req: Request) {\\n   const token = req.headers.get(\\"authorization\\");\\n-  const session = await db.checkout.findUnique({ id: req.session.id });\\n-  if (!session) throw new Error(\\"500: Missing session\\");\\n+  const sessionId = extractSessionFromToken(token) || req.session?.id;\\n+  if (!sessionId) {\\n+    return Response.json({ error: \\"Session expired\\" }, { status: 400 });\\n+  }\\n+  const session = await db.checkout.findUnique({ id: sessionId });\\n   return activatePaymentFlow(session);",
  "tests": [
    "should return 400 when session is null after token refresh",
    "should rehydrate session from order snapshot if missing",
    "should not call resumeCheckoutSession with stale session id"
  ]
}

If the user asks a follow-up question (not a new bug), reply conversationally in plain text — do NOT return JSON.
If you cannot determine the affected file from context, set "affected_file" to null.
If you cannot generate a safe diff, set "diff" to null.`;

// ─── Parse AI response (JSON or plain text) ────────────────────────────────────
export interface AnalysisResult {
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  root_cause: string;
  fix_steps: string[];
  affected_file: string | null;
  affected_function: string | null;
  diff: string | null;
  tests: string[];
}

export interface CommitFindingPatchDraftResult {
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  root_cause: string;
  fix_steps: string[];
  affected_file: string | null;
  affected_function: string | null;
  updated_file: string | null;
  diff: string | null;
  tests: string[];
}

export interface CommitAnalysisResult {
  type: "commit-analysis";
  title: string;
  repo: string;
  branch: string;
  commit_sha: string;
  commit_message: string;
  summary: string;
  context: string;
  changed_files: string[];
  confirmed_errors_count: number;
  potential_errors_count: number;
  confirmed_errors: string[];
  potential_errors: string[];
  confirmed_findings: CommitAnalysisFinding[];
  potential_findings: CommitAnalysisFinding[];
  recommended_checks: string[];
}

export interface CommitAnalysisFinding {
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  detail: string;
  file?: string | null;
}

export function parseAnalysisResponse(text: string): AnalysisResult | null {
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed.title || !parsed.severity || typeof parsed.confidence !== "number") {
      return null;
    }

    return {
      title:             parsed.title,
      severity:          parsed.severity,
      confidence:        Math.min(100, Math.max(0, parsed.confidence)),
      root_cause:        parsed.root_cause || "",
      fix_steps:         Array.isArray(parsed.fix_steps) ? parsed.fix_steps : [],
      affected_file:     parsed.affected_file || null,
      affected_function: parsed.affected_function || null,
      diff:              parsed.diff || null,
      tests:             Array.isArray(parsed.tests) ? parsed.tests : [],
    };
  } catch {
    return null;
  }
}

export const COMMIT_ANALYSIS_SYSTEM_PROMPT = `You are Mirai, an elite AI debugging agent.

You are analyzing the latest commit in a repository. Your job is to:
1. Summarize what changed in the commit.
2. Explain the technical context in plain engineering language.
3. Count CONFIRMED ERRORS visible in the diff, file content, or commit context.
4. Count POTENTIAL ERRORS or regressions that could plausibly happen because of the changes.
5. List the confirmed errors clearly.
6. List the potential errors clearly.
7. Recommend focused checks/tests a developer should run next.
8. Prefer file-specific findings over vague repo-wide concerns whenever the evidence supports it.

Treat "confirmed errors" as issues directly visible in the commit content or obviously broken code in the diff.
Treat "potential errors" as plausible regressions, unsafe assumptions, missing guards, or integration risks.
Do not invent failures that are not supported by the provided diff or file content. If evidence is weak, call it a potential error, not a confirmed one.

Respond ONLY with this exact JSON structure:
{
  "type": "commit-analysis",
  "title": "Short title for the analysis",
  "repo": "owner/repo",
  "branch": "main",
  "commit_sha": "abcdef1",
  "commit_message": "fix: ...",
  "summary": "High-level summary of what the commit changes.",
  "context": "Detailed engineering understanding of the commit and how the changes interact with the system.",
  "changed_files": ["src/example.ts"],
  "confirmed_errors_count": 0,
  "potential_errors_count": 2,
  "confirmed_errors": [
    "No confirmed errors found in the diff."
  ],
  "confirmed_findings": [],
  "potential_errors": [
    "Potential regression ..."
  ],
  "potential_findings": [
    {
      "title": "Potential regression ...",
      "severity": "Medium",
      "confidence": 72,
      "detail": "Why this could become a problem.",
      "file": "src/example.ts"
    }
  ],
  "recommended_checks": [
    "Run ..."
  ]
}

If there are no confirmed errors, set confirmed_errors_count to 0 and use a single clear sentence in confirmed_errors.
Set confidence as an integer from 0 to 100.
Use severity values Critical | High | Medium | Low.
Do not wrap the JSON in markdown fences.`;

export const COMMIT_FINDING_PATCH_SYSTEM_PROMPT = `You are Mirai, an elite AI debugging agent creating a patch draft from a commit-analysis finding.

You will receive:
- repository and branch context
- commit metadata
- a finding title and detail
- the exact current contents of the target file when available

Your job is to:
1. Explain the root cause precisely and conservatively.
2. Produce a minimal, safe fix.
3. Produce the COMPLETE updated file content for the target file after the fix.
4. Keep the patch scoped to the requested affected file unless there is overwhelming evidence another file is required.
5. If the fix cannot be made safely from the provided file content, set both "updated_file" and "diff" to null instead of guessing.

Patch requirements:
- Use the exact affected file path provided by the user/context.
- The updated file must preserve all unrelated code exactly as-is.
- Only make the smallest safe edits needed.
- Do not omit unchanged sections.
- Prefer a small patch over a broad refactor.
- Treat "updated_file" as the source of truth. "diff" is optional and may be null.

Respond ONLY with this exact JSON structure, no markdown wrapping:
{
  "title": "Short descriptive bug title (max 60 chars)",
  "severity": "High",
  "confidence": 92,
  "root_cause": "Detailed explanation of WHY this bug happens",
  "fix_steps": [
    "Step 1: description of what to change and why",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "affected_file": "frontend/src/contexts/AuthContext.tsx",
  "affected_function": "parseUserData",
  "updated_file": "complete updated file contents here",
  "diff": null,
  "tests": [
    "should ...",
    "should ...",
    "should ..."
  ]
}

If you cannot generate a safe full-file update that matches the provided file snapshot, set both "updated_file" and "diff" to null.`;

export function parseCommitFindingPatchDraftResponse(
  text: string,
): CommitFindingPatchDraftResult | null {
  try {
    const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.title || !parsed.severity || typeof parsed.confidence !== "number") {
      return null;
    }

    return {
      title: parsed.title,
      severity: parsed.severity,
      confidence: Math.min(100, Math.max(0, parsed.confidence)),
      root_cause: parsed.root_cause || "",
      fix_steps: Array.isArray(parsed.fix_steps) ? parsed.fix_steps : [],
      affected_file: parsed.affected_file || null,
      affected_function: parsed.affected_function || null,
      updated_file: typeof parsed.updated_file === "string" ? parsed.updated_file : null,
      diff: typeof parsed.diff === "string" ? parsed.diff : null,
      tests: Array.isArray(parsed.tests) ? parsed.tests : [],
    };
  } catch {
    return null;
  }
}

function normalizeCommitFindings(value: unknown): CommitAnalysisFinding[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      title: typeof entry.title === "string" ? entry.title : "Untitled finding",
      severity:
        entry.severity === "Critical" ||
        entry.severity === "High" ||
        entry.severity === "Medium" ||
        entry.severity === "Low"
          ? entry.severity
          : "Medium",
      confidence:
        typeof entry.confidence === "number" && Number.isFinite(entry.confidence)
          ? Math.min(100, Math.max(0, Math.round(entry.confidence)))
          : 50,
      detail: typeof entry.detail === "string" ? entry.detail : "",
      file: typeof entry.file === "string" ? entry.file : null,
    }));
}

export function parseCommitAnalysisResponse(text: string): CommitAnalysisResult | null {
  try {
    const cleaned = text.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.type !== "commit-analysis" || !parsed.title || !parsed.repo || !parsed.commit_sha) {
      return null;
    }

    return {
      type: "commit-analysis",
      title: parsed.title,
      repo: parsed.repo,
      branch: parsed.branch ?? "unknown",
      commit_sha: parsed.commit_sha,
      commit_message: parsed.commit_message ?? "",
      summary: parsed.summary ?? "",
      context: parsed.context ?? "",
      changed_files: Array.isArray(parsed.changed_files) ? parsed.changed_files : [],
      confirmed_errors_count: Number.isFinite(parsed.confirmed_errors_count) ? parsed.confirmed_errors_count : 0,
      potential_errors_count: Number.isFinite(parsed.potential_errors_count) ? parsed.potential_errors_count : 0,
      confirmed_errors: Array.isArray(parsed.confirmed_errors) ? parsed.confirmed_errors : [],
      potential_errors: Array.isArray(parsed.potential_errors) ? parsed.potential_errors : [],
      confirmed_findings: normalizeCommitFindings(parsed.confirmed_findings),
      potential_findings: normalizeCommitFindings(parsed.potential_findings),
      recommended_checks: Array.isArray(parsed.recommended_checks) ? parsed.recommended_checks : [],
    };
  } catch {
    return null;
  }
}

// ─── Build a PR body from a bug record ────────────────────────────────────────
export function buildPRBody(bug: {
  title: string;
  severity: string;
  confidence: number;
  root_cause: string;
  fix_steps: string[];
  ai_suggestion: string;
}): string {
  const steps = Array.isArray(bug.fix_steps) && bug.fix_steps.length > 0
    ? bug.fix_steps.map((s, i) => `${i + 1}. ${s}`).join("\n")
    : bug.ai_suggestion;

  return `## 🤖 Mirai Auto-Patch

| Field | Value |
|---|---|
| **Bug** | ${bug.title} |
| **Severity** | ${bug.severity} |
| **AI Confidence** | ${bug.confidence}% |

### Root Cause
${bug.root_cause}

### Fix Applied
${steps}

---
*This PR was generated automatically by [Mirai AI](https://mirai.ai). Please review carefully before merging into production.*`;
}

// ─── Detect if a message is a new bug vs follow-up ────────────────────────────
export function isLikelyBugReport(message: string): boolean {
  const bugSignals = [
    /error:/i,
    /exception:/i,
    /traceback/i,
    /at \w+\.\w+\s*\(/,        // JS/Java stack frame
    /File ".*", line \d+/,     // Python traceback
    /undefined is not/i,
    /cannot read propert/i,
    /null pointer/i,
    /segmentation fault/i,
    /ENOENT|ECONNREFUSED|ETIMEDOUT/,
    /\d{3} error/i,
    /failed with exit code/i,
  ];
  return bugSignals.some(re => re.test(message));
}

export function isCommitAnalysisRequest(message: string): boolean {
  return /analy[sz]e\s+(.+?\s+)?commit/i.test(message);
}

export function extractCommitShaFromMessage(message: string): string | null {
  const explicitMatch =
    message.match(/\bcommit\s+([a-f0-9]{7,40})\b/i) ??
    message.match(/\bsha\s+([a-f0-9]{7,40})\b/i);

  return explicitMatch?.[1] ?? null;
}

export function extractCommitCountFromMessage(message: string): number | null {
  const countMatch =
    message.match(/\b(last|latest|recent)\s+(\d+)\s+commits?\b/i) ??
    message.match(/\b(\d+)\s+latest\s+commits?\b/i);

  if (!countMatch) {
    return null;
  }

  const countValue = countMatch[2] ?? countMatch[1];
  const parsed = Number.parseInt(countValue, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractBranchNameFromMessage(message: string): string | null {
  const branchMatch =
    message.match(/\bbranch\s+([A-Za-z0-9._/-]+)\b/i) ??
    message.match(/\bon\s+([A-Za-z0-9._/-]+)\s+branch\b/i);

  return branchMatch?.[1] ?? null;
}

export function isLatestCommitAnalysisRequest(message: string): boolean {
  return isCommitAnalysisRequest(message);
}

export function extractRepositoryNameFromMessage(message: string): string | null {
  const ownerRepoMatch = message.match(/\b([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\b/);
  if (ownerRepoMatch?.[1]) {
    return ownerRepoMatch[1];
  }

  const repoNameMatch = message.match(/\brepo\s+([A-Za-z0-9_.-]+)\b/i) ?? message.match(/\bin\s+([A-Za-z0-9_.-]+)\b/i);
  return repoNameMatch?.[1] ?? null;
}
