import { env } from "@/lib/env";

const RESEND_API_URL = "https://api.resend.com/emails";

export type PullRequestOpenedEmailInput = {
  to: string;
  recipientName?: string | null;
  repo: string;
  bugTitle: string;
  severity: string;
  confidence: number;
  rootCause: string;
  fixSteps: string[];
  prUrl: string;
  prNumber: number;
  branchName: string;
  affectedFile?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderStepsHtml(steps: string[]) {
  if (!steps.length) {
    return "<li>Review the generated patch carefully before merging.</li>";
  }

  return steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
}

function renderStepsText(steps: string[]) {
  if (!steps.length) {
    return "- Review the generated patch carefully before merging.";
  }

  return steps.map((step) => `- ${step}`).join("\n");
}

function buildPullRequestOpenedEmail(input: PullRequestOpenedEmailInput) {
  const subject = `[${input.repo}] [Mirai] ${input.bugTitle} (PR #${input.prNumber})`;
  const greeting = input.recipientName ? `Hi ${input.recipientName},` : "Hi,";
  const escapedRepo = escapeHtml(input.repo);
  const escapedTitle = escapeHtml(input.bugTitle);
  const escapedSeverity = escapeHtml(input.severity);
  const escapedRootCause = escapeHtml(input.rootCause);
  const escapedBranch = escapeHtml(input.branchName);
  const escapedPrUrl = escapeHtml(input.prUrl);
  const escapedAffectedFile = input.affectedFile ? escapeHtml(input.affectedFile) : null;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;color:#111827;line-height:1.55">
      <p>${escapeHtml(greeting)}</p>
      <p>Mirai opened a pull request for a new patch in <strong>${escapedRepo}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        <tbody>
          <tr><td style="padding:8px 0;font-weight:600">Bug</td><td style="padding:8px 0">${escapedTitle}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600">Severity</td><td style="padding:8px 0">${escapedSeverity}</td></tr>
          <tr><td style="padding:8px 0;font-weight:600">AI Confidence</td><td style="padding:8px 0">${input.confidence}%</td></tr>
          <tr><td style="padding:8px 0;font-weight:600">Branch</td><td style="padding:8px 0">${escapedBranch}</td></tr>
          ${escapedAffectedFile ? `<tr><td style="padding:8px 0;font-weight:600">Affected File</td><td style="padding:8px 0">${escapedAffectedFile}</td></tr>` : ""}
        </tbody>
      </table>
      <h3 style="margin:24px 0 8px">Root Cause</h3>
      <p>${escapedRootCause}</p>
      <h3 style="margin:24px 0 8px">Fix Applied</h3>
      <ol style="padding-left:20px">${renderStepsHtml(input.fixSteps)}</ol>
      <p style="margin-top:24px">
        <a href="${escapedPrUrl}" style="display:inline-block;background:#1f7a53;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600">
          View Pull Request
        </a>
      </p>
      <p style="margin-top:24px;color:#4b5563">
        This PR was generated automatically by Mirai Debug Bot. Review carefully before merging into production.
      </p>
    </div>
  `.trim();

  const text = [
    greeting,
    "",
    `Mirai opened a pull request for ${input.repo}.`,
    "",
    `Bug: ${input.bugTitle}`,
    `Severity: ${input.severity}`,
    `AI Confidence: ${input.confidence}%`,
    `Branch: ${input.branchName}`,
    input.affectedFile ? `Affected File: ${input.affectedFile}` : null,
    "",
    "Root Cause:",
    input.rootCause,
    "",
    "Fix Applied:",
    renderStepsText(input.fixSteps),
    "",
    `Pull Request: ${input.prUrl}`,
    "",
    "This PR was generated automatically by Mirai Debug Bot. Review carefully before merging into production.",
  ].filter((line): line is string => line !== null).join("\n");

  return { subject, html, text };
}

export function isEmailConfigured() {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

export async function sendPullRequestOpenedEmail(input: PullRequestOpenedEmailInput) {
  if (!isEmailConfigured()) {
    return { skipped: true as const, reason: "email_not_configured" as const };
  }

  const { subject, html, text } = buildPullRequestOpenedEmail(input);

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.to],
      reply_to: env.EMAIL_REPLY_TO || undefined,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to send email notification (${response.status}): ${body}`);
  }

  return { skipped: false as const };
}
