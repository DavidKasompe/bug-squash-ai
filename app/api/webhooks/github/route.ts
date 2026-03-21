import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { extractStackTrace, fetchWorkflowLogs } from "@/lib/github";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifySignature(body: string, signature: string): boolean {
  const expected = `sha256=${createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex")}`;
  // Constant-time comparison
  return expected.length === signature.length &&
    expected.split("").every((c, i) => c === signature[i]);
}

export async function POST(req: Request) {
  const body      = await req.text();
  const event     = req.headers.get("x-github-event");
  const signature = req.headers.get("x-hub-signature-256") ?? "";

  // 1. Verify the webhook signature
  if (!verifySignature(body, signature)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(body);
  const installationId = String(payload.installation?.id ?? "");

  // ── A: Workflow run failed → ingest error ──────────────────────────────────
  if (event === "workflow_run" &&
      payload.action === "completed" &&
      payload.workflow_run.conclusion === "failure") {

    const { owner, repo } = payload.repository;
    const repoFullName = payload.repository.full_name;

    // Fetch the actual log to extract the stack trace
    const logText = await fetchWorkflowLogs(
      installationId,
      payload.repository.owner.login,
      payload.repository.name,
      payload.workflow_run.id
    );
    const stackTrace = extractStackTrace(logText);
    if (!stackTrace) return Response.json({ ok: true, skipped: "no_trace" });

    // Find which user owns this installation
    const { data: installation } = await supabase
      .from("installations")
      .select("user_id")
      .eq("installation_id", installationId)
      .single();

    if (!installation) return Response.json({ ok: true, skipped: "no_installation" });

    // Create the bug record
    const { data: bug } = await supabase.from("bugs").insert({
      user_id:         installation.user_id,
      installation_id: installationId,
      repo:            repoFullName,
      stack_trace:     stackTrace,
      source:          "github_actions",
      status:          "Detected",
    }).select().single();

    if (bug) {
      // Kick off async AI analysis
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze`, {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          "x-internal-key":  process.env.INTERNAL_API_KEY!,
        },
        body: JSON.stringify({ bugId: bug.id, stackTrace }),
      });
    }
  }

  // ── B: PR merged → mark bug resolved ─────────────────────────────────────
  if (event === "pull_request" &&
      payload.action === "closed" &&
      payload.pull_request?.merged === true) {

    const prNumber = payload.pull_request.number;

    const { data: patch } = await supabase
      .from("patches")
      .select("id, bug_id")
      .eq("pr_number", prNumber)
      .single();

    if (patch) {
      await supabase.from("patches")
        .update({ status: "merged" })
        .eq("id", patch.id);

      await supabase.from("bugs")
        .update({ status: "Resolved", resolved_at: new Date().toISOString() })
        .eq("id", patch.bug_id);
    }
  }

  // ── C: PR closed without merge → mark patch failed ─────────────────────────
  if (event === "pull_request" &&
      payload.action === "closed" &&
      payload.pull_request?.merged === false) {

    const prNumber = payload.pull_request.number;
    const { data: patch } = await supabase
      .from("patches")
      .select("id, bug_id")
      .eq("pr_number", prNumber)
      .single();

    if (patch) {
      await supabase.from("patches").update({ status: "failed" }).eq("id", patch.id);
      await supabase.from("bugs").update({ status: "Ready" }).eq("id", patch.bug_id);
    }
  }

  return Response.json({ ok: true });
}
