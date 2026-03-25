import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { applyPatch } from "diff";
import {
  fetchFileFromGitHub,
  createBranch,
  commitFile,
  getDefaultBranch,
  openPullRequest,
  mergePullRequest,
} from "@/lib/github";
import { buildPRBody } from "@/lib/prompts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: Request,
  { params }: { params: Promise<{ patchId: string }> }
) {
  const { patchId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  try {
    // ── 1. Load patch + parent bug ──────────────────────────────────────────
    const { data: patch, error: patchErr } = await supabase
      .from("patches")
      .select("*, bugs(*)")
      .eq("id", patchId)
      .eq("user_id", session.user.id)
      .single();

    if (patchErr || !patch) {
      return Response.json({ error: "Patch not found" }, { status: 404 });
    }
    if (patch.status !== "pending") {
      return Response.json({ error: "Patch already submitted", pr_url: patch.pr_url }, { status: 409 });
    }

    const bug            = patch.bugs;
    const repo           = bug.repo;
    const affectedFile   = bug.affected_file;
    const installationId = bug.installation_id;

    if (!affectedFile) {
      return Response.json({ error: "No affected file — cannot apply patch automatically" }, { status: 400 });
    }
    if (!installationId) {
      return Response.json({ error: "No GitHub installation linked to this bug" }, { status: 400 });
    }

    // ── 2. Fetch current file from GitHub ───────────────────────────────────
    const baseBranch = await getDefaultBranch(installationId, repo);
    const { content: currentContent, sha: fileSha } = await fetchFileFromGitHub(
      installationId,
      repo,
      affectedFile,
      baseBranch
    );

    // ── 3. Apply the unified diff ───────────────────────────────────────────
    const patchedContent = applyPatch(currentContent, patch.diff);
    if (patchedContent === false) {
      return Response.json({ error: "Patch did not apply cleanly — the file may have changed since analysis" }, { status: 422 });
    }

    // ── 4. Create branch ────────────────────────────────────────────────────
    const shortId  = bug.id.slice(0, 8);
    const branchName = `mirai/fix-${shortId}-${Date.now()}`;

    await createBranch(installationId, repo, branchName, baseBranch);

    // ── 5. Commit patched file ──────────────────────────────────────────────
    await commitFile(
      installationId,
      repo,
      branchName,
      affectedFile,
      patchedContent,
      fileSha,
      `fix: ${bug.title} [Mirai AI]`
    );

    // ── 6. Open Pull Request ────────────────────────────────────────────────
    const { url: prUrl, number: prNumber } = await openPullRequest(
      installationId,
      repo,
      branchName,
      baseBranch,
      `[Mirai] ${bug.title}`,
      buildPRBody(bug)
    );

    // ── 7. Update Supabase ──────────────────────────────────────────────────
    await supabase.from("patches").update({
      pr_url:      prUrl,
      pr_number:   prNumber,
      branch_name: branchName,
      status:      "pr_open",
    }).eq("id", patchId);

    await supabase.from("bugs").update({ status: "Patching" }).eq("id", bug.id);

    // ── 8. Check auto-merge workflow ────────────────────────────────────────
    const { data: autoMergeWorkflow } = await supabase
      .from("workflows" as any)
      .select("id")
      .eq("user_id", session.user.id)
      .eq("trigger", "severity_critical")
      .eq("status", "active")
      .maybeSingle();

    if (autoMergeWorkflow && bug.severity === "Critical") {
      await mergePullRequest(installationId, repo, prNumber, `fix: ${bug.title} [Mirai AI]`);
      await supabase.from("patches").update({ status: "merged" }).eq("id", patchId);
      await supabase.from("bugs").update({
        status:      "Resolved",
        resolved_at: new Date().toISOString(),
      }).eq("id", bug.id);
    }

    return Response.json({ ok: true, pr_url: prUrl, pr_number: prNumber, branch: branchName });
  } catch (err: any) {
    console.error("[create-pr]", err);
    return Response.json({ error: err.message ?? "Failed to create PR" }, { status: 500 });
  }
}
