import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { applyPatch, parsePatch } from "diff";
import {
  commitFile,
  createBranch,
  fetchFileFromGitHub,
  getDefaultBranch,
  mergePullRequest,
  openPullRequest,
  resolveRepositoryFilePath,
} from "@/lib/github";
import { buildPRBody } from "@/lib/prompts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type PatchBugRecord = {
  id: string;
  title: string;
  severity: string;
  confidence: number;
  root_cause: string;
  fix_steps: string[];
  ai_suggestion: string;
  repo: string;
  affected_file: string | null;
  installation_id: string | null;
};

function sanitizeUnifiedDiff(diffText: string) {
  const lines = diffText.replace(/\r\n/g, "\n").split("\n");
  const sanitized: string[] = [];
  let insideHunk = false;

  for (const line of lines) {
    if (line.startsWith("--- ") || line.startsWith("+++ ")) {
      sanitized.push(line);
      continue;
    }

    if (line.startsWith("@@")) {
      insideHunk = true;
      sanitized.push(line);
      continue;
    }

    if (!insideHunk) {
      continue;
    }

    if (
      line.startsWith(" ") ||
      line.startsWith("+") ||
      line.startsWith("-") ||
      line === "\\ No newline at end of file"
    ) {
      sanitized.push(line);
      continue;
    }

    break;
  }

  return sanitized.join("\n").trim();
}

function normalizeUnifiedDiffHunkHeaders(diffText: string) {
  const lines = sanitizeUnifiedDiff(diffText).split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith("@@")) {
      continue;
    }

    let oldCount = 0;
    let newCount = 0;
    let cursor = index + 1;

    while (cursor < lines.length) {
      const nextLine = lines[cursor];
      if (nextLine.startsWith("@@") || nextLine.startsWith("--- ") || nextLine.startsWith("+++ ")) {
        break;
      }

      if (nextLine.startsWith("-")) {
        oldCount += 1;
      } else if (nextLine.startsWith("+")) {
        newCount += 1;
      } else {
        oldCount += 1;
        newCount += 1;
      }

      cursor += 1;
    }

    const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/);
    if (!match) {
      continue;
    }

    const [, oldStart, newStart, trailer] = match;
    lines[index] = `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@${trailer}`;
  }

  return lines.join("\n");
}

function applyGeneratedPatch(currentContent: string, diffText: string) {
  const sanitizedDiff = sanitizeUnifiedDiff(diffText);

  try {
    const directApply = applyPatch(currentContent, sanitizedDiff, { fuzzFactor: 2 });
    if (directApply !== false) {
      return directApply;
    }
  } catch {
    // Fall through to header normalization for malformed AI-generated hunks.
  }

  const normalizedDiff = normalizeUnifiedDiffHunkHeaders(sanitizedDiff);
  if (normalizedDiff !== sanitizedDiff) {
    try {
      const normalizedApply = applyPatch(currentContent, normalizedDiff, { fuzzFactor: 2 });
      if (normalizedApply !== false) {
        return normalizedApply;
      }
    } catch {
      // Fall through to final failure.
    }
  }

  return false;
}

function tryApplyPatchByExactReplacement(currentContent: string, diffText: string) {
  const parsedPatches = parsePatch(normalizeUnifiedDiffHunkHeaders(diffText));
  if (parsedPatches.length !== 1) {
    return false;
  }

  let nextContent = currentContent;

  for (const hunk of parsedPatches[0].hunks) {
    const oldBlock = hunk.lines
      .filter((line) => !line.startsWith("+"))
      .map((line) => (line.startsWith("\\") ? null : line.slice(1)))
      .filter((line): line is string => line !== null)
      .join("\n");
    const newBlock = hunk.lines
      .filter((line) => !line.startsWith("-"))
      .map((line) => (line.startsWith("\\") ? null : line.slice(1)))
      .filter((line): line is string => line !== null)
      .join("\n");

    if (!oldBlock) {
      return false;
    }

    const firstIndex = nextContent.indexOf(oldBlock);
    const lastIndex = nextContent.lastIndexOf(oldBlock);

    if (firstIndex === -1 || firstIndex !== lastIndex) {
      return false;
    }

    nextContent =
      nextContent.slice(0, firstIndex) +
      newBlock +
      nextContent.slice(firstIndex + oldBlock.length);
  }

  return nextContent;
}

async function finalizePullRequest(params: {
  installationId: string;
  repo: string;
  branchName: string;
  baseBranch: string;
  bug: PatchBugRecord;
  patchId: string;
  finalFilePath: string;
  affectedFile: string;
  sessionUserId: string;
}) {
  const { installationId, repo, branchName, baseBranch, bug, patchId, finalFilePath, affectedFile, sessionUserId } = params;

  const { url: prUrl, number: prNumber } = await openPullRequest(
    installationId,
    repo,
    branchName,
    baseBranch,
    `[Mirai] ${bug.title}`,
    buildPRBody(bug),
  );

  await supabase.from("patches").update({
    pr_url: prUrl,
    pr_number: prNumber,
    branch_name: branchName,
    status: "pr_open",
  }).eq("id", patchId);

  if (finalFilePath !== affectedFile) {
    await supabase.from("bugs").update({ affected_file: finalFilePath }).eq("id", bug.id);
  }

  await supabase.from("bugs").update({ status: "Patching" }).eq("id", bug.id);

  const { data: autoMergeWorkflow } = await supabase
    .from("workflows")
    .select("id")
    .eq("user_id", sessionUserId)
    .eq("trigger", "severity_critical")
    .eq("status", "active")
    .maybeSingle();

  if (autoMergeWorkflow && bug.severity === "Critical") {
    await mergePullRequest(installationId, repo, prNumber, `fix: ${bug.title} [Mirai AI]`);
    await supabase.from("patches").update({ status: "merged" }).eq("id", patchId);
    await supabase.from("bugs").update({
      status: "Resolved",
      resolved_at: new Date().toISOString(),
    }).eq("id", bug.id);
  }

  return { prUrl, prNumber };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ patchId: string }> },
) {
  void req;
  const { patchId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
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

    const bug = patch.bugs as PatchBugRecord;
    const repo = bug.repo;
    const affectedFile = bug.affected_file;
    const installationId = bug.installation_id;

    if (!affectedFile) {
      return Response.json({ error: "No affected file - cannot apply patch automatically" }, { status: 400 });
    }
    if (!installationId) {
      return Response.json({ error: "No GitHub installation linked to this bug" }, { status: 400 });
    }

    const baseBranch = await getDefaultBranch(installationId, repo);
    const resolvedFile = await resolveRepositoryFilePath(
      installationId,
      repo,
      affectedFile,
      baseBranch,
    );

    if (!resolvedFile.path) {
      return Response.json(
        {
          error: `Affected file "${affectedFile}" was not found in ${repo}@${baseBranch}.`,
          candidates: resolvedFile.candidates,
        },
        { status: 422 },
      );
    }

    const finalFilePath = resolvedFile.path;
    const { content: currentContent, sha: fileSha } = await fetchFileFromGitHub(
      installationId,
      repo,
      finalFilePath,
      baseBranch,
    );

    const shortId = bug.id.slice(0, 8);
    const branchName = `mirai/fix-${shortId}-${Date.now()}`;
    await createBranch(installationId, repo, branchName, baseBranch);

    const patchedContent = applyGeneratedPatch(currentContent, patch.diff);
    const finalPatchedContent =
      patchedContent !== false
        ? patchedContent
        : tryApplyPatchByExactReplacement(currentContent, patch.diff);

    if (finalPatchedContent === false) {
      return Response.json(
        { error: "Patch did not apply cleanly — the file may have changed since analysis" },
        { status: 422 },
      );
    }

    await commitFile(
      installationId,
      repo,
      branchName,
      finalFilePath,
      finalPatchedContent,
      fileSha,
      `fix: ${bug.title} [Mirai AI]`,
    );

    const { prUrl, prNumber } = await finalizePullRequest({
      installationId,
      repo,
      branchName,
      baseBranch,
      bug,
      patchId,
      finalFilePath,
      affectedFile,
      sessionUserId: session.user.id,
    });

    return Response.json({ ok: true, pr_url: prUrl, pr_number: prNumber, branch: branchName });
  } catch (err: unknown) {
    console.error("[create-pr]", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to create PR" },
      { status: 500 },
    );
  }
}
