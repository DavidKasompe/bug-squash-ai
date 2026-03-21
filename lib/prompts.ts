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
