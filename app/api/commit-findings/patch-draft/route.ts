import { NextResponse } from "next/server";
import { generateText } from "ai";
import { applyPatch, createTwoFilesPatch } from "diff";

import { getServerSession } from "@/lib/auth";
import { fetchFileFromGitHub } from "@/lib/github";
import { getGroqModel, isGroqConfigured } from "@/lib/llm";
import {
  COMMIT_FINDING_PATCH_SYSTEM_PROMPT,
  parseCommitFindingPatchDraftResponse,
} from "@/lib/prompts";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n...<truncated>`;
}

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

function getApplicableDiff(currentContent: string, diffText: string) {
  const sanitizedDiff = sanitizeUnifiedDiff(diffText);

  try {
    const applied = applyPatch(currentContent, sanitizedDiff, { fuzzFactor: 2 });
    if (applied !== false) {
      return sanitizedDiff;
    }
  } catch {
    // Fall through to normalized diff.
  }

  const normalizedDiff = normalizeUnifiedDiffHunkHeaders(sanitizedDiff);
  if (normalizedDiff !== sanitizedDiff) {
    try {
      const applied = applyPatch(currentContent, normalizedDiff, { fuzzFactor: 2 });
      if (applied !== false) {
        return normalizedDiff;
      }
    } catch {
      // Fall through to failure.
    }
  }

  return null;
}

function buildUnifiedDiff(filePath: string, currentContent: string, updatedContent: string) {
  const patch = createTwoFilesPatch(
    `a/${filePath}`,
    `b/${filePath}`,
    currentContent,
    updatedContent,
    "",
    "",
    { context: 3 },
  );

  return patch.trim();
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  if (!isGroqConfigured) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
  }

  const body = await request.json();
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const repo = typeof body?.repo === "string" ? body.repo.trim() : "";
  const severity = typeof body?.severity === "string" ? body.severity.trim() : "Medium";
  const detail = typeof body?.detail === "string" ? body.detail.trim() : "";
  const file = typeof body?.file === "string" ? body.file.trim() : null;
  const installationId =
    typeof body?.installationId === "string" && body.installationId.trim().length > 0
      ? body.installationId.trim()
      : null;
  const confidence =
    typeof body?.confidence === "number" && Number.isFinite(body.confidence)
      ? Math.min(100, Math.max(0, Math.round(body.confidence)))
      : null;
  const commitSha = typeof body?.commitSha === "string" ? body.commitSha.trim() : "";
  const commitMessage = typeof body?.commitMessage === "string" ? body.commitMessage.trim() : "";
  const branch = typeof body?.branch === "string" ? body.branch.trim() : "";
  const context = typeof body?.context === "string" ? body.context.trim() : "";
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : "";
  const recommendedChecks = Array.isArray(body?.recommendedChecks)
    ? body.recommendedChecks.filter((item: unknown): item is string => typeof item === "string")
    : [];

  if (!title || !repo || !detail) {
    return NextResponse.json(
      { error: "title, repo, and detail are required." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const descriptionParts = [
    detail,
    context ? `Commit context:\n${context}` : "",
    branch ? `Branch: ${branch}` : "",
    commitSha ? `Commit: ${commitSha}` : "",
    commitMessage ? `Commit message: ${commitMessage}` : "",
  ].filter(Boolean);

  const { data: bug, error: bugInsertError } = await supabase
    .from("bugs")
    .insert({
      user_id: session.user.id,
      installation_id: installationId,
      repo,
      title,
      description: descriptionParts.join("\n\n"),
      stack_trace: `Commit finding patch draft request${commitSha ? ` from ${commitSha}` : ""}`,
      severity,
      status: "Investigating",
      affected_file: file,
      confidence,
      root_cause: detail,
      ai_suggestion: recommendedChecks.join("\n"),
      fix_steps: recommendedChecks,
      source: "commit_analysis",
    })
    .select("id")
    .single();

  if (bugInsertError || !bug) {
    console.error("[commit-findings/patch-draft:bug]", bugInsertError);
    return NextResponse.json({ error: "Failed to create draft bug." }, { status: 500 });
  }

  let currentFileContent = "";
  if (installationId && file) {
    try {
      const { content } = await fetchFileFromGitHub(
        installationId,
        repo,
        file,
        branch || "main",
      );
      currentFileContent = content;
    } catch (fileFetchError) {
      console.warn("[commit-findings/patch-draft:file-context]", fileFetchError);
    }
  }

  const analysisPrompt = [
    `Repository: ${repo}`,
    branch ? `Branch: ${branch}` : "",
    commitSha ? `Commit SHA: ${commitSha}` : "",
    commitMessage ? `Commit message: ${commitMessage}` : "",
    file ? `Affected file: ${file}` : "",
    `Finding title: ${title}`,
    `Finding detail: ${detail}`,
    context ? `Commit context:\n${context}` : "",
    recommendedChecks.length > 0 ? `Recommended checks:\n- ${recommendedChecks.join("\n- ")}` : "",
    currentFileContent
      ? `Current file content snapshot for ${file}:\n\`\`\`\n${truncateText(currentFileContent, 12000)}\n\`\`\``
      : "",
    "",
    "Generate a bug analysis and a safe patch draft for this finding.",
    "The diff must target the exact affected file path and be based on the provided current file content snapshot.",
    "If the fix is not safe from the provided file context, set diff to null.",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const { text } = await generateText({
      model: getGroqModel(),
      system: COMMIT_FINDING_PATCH_SYSTEM_PROMPT,
      prompt: analysisPrompt,
    });

    let parsed = parseCommitFindingPatchDraftResponse(text);
    if (!parsed) {
      throw new Error("Failed to parse AI response.");
    }

    if (parsed.updated_file && currentFileContent) {
      const derivedDiff = buildUnifiedDiff(
        parsed.affected_file ?? file ?? "file",
        currentFileContent,
        parsed.updated_file,
      );
      const applicableDiff = getApplicableDiff(currentFileContent, derivedDiff);

      parsed = {
        ...parsed,
        diff: applicableDiff,
      };
    } else if (parsed.diff && currentFileContent) {
      const applicableDiff = getApplicableDiff(currentFileContent, parsed.diff);

      if (applicableDiff) {
        parsed = {
          ...parsed,
          diff: applicableDiff,
        };
      } else {
        const correctionPrompt = [
          analysisPrompt,
          "The previous diff did not apply cleanly to the current file snapshot.",
          "Return the same JSON shape again, but fix the diff so it applies exactly to the provided current file content.",
          "If you cannot produce a safe valid diff, set diff to null.",
          `Previous response:\n${text}`,
        ].join("\n\n");

        const { text: correctedText } = await generateText({
          model: getGroqModel(),
          system: COMMIT_FINDING_PATCH_SYSTEM_PROMPT,
          prompt: correctionPrompt,
        });

        const correctedParsed = parseCommitFindingPatchDraftResponse(correctedText);
        let correctedDiff: string | null = null;

        if (correctedParsed?.updated_file && currentFileContent) {
          const derivedDiff = buildUnifiedDiff(
            correctedParsed.affected_file ?? file ?? "file",
            currentFileContent,
            correctedParsed.updated_file,
          );
          correctedDiff = getApplicableDiff(currentFileContent, derivedDiff);
        } else if (correctedParsed?.diff && currentFileContent) {
          correctedDiff = getApplicableDiff(currentFileContent, correctedParsed.diff);
        }

        if (correctedParsed) {
          parsed = {
            ...correctedParsed,
            diff: correctedDiff,
            affected_file: correctedParsed.affected_file ?? file,
          };
        } else {
          parsed = {
            ...parsed,
            diff: null,
          };
        }
      }
    }

    await supabase
      .from("bugs")
      .update({
        title: parsed.title,
        severity: parsed.severity,
        confidence: parsed.confidence,
        root_cause: parsed.root_cause,
        ai_suggestion: parsed.fix_steps.join("\n"),
        fix_steps: parsed.fix_steps,
        affected_file: parsed.affected_file ?? file,
        affected_function: parsed.affected_function,
        status: "Ready",
      })
      .eq("id", bug.id);

    let patchId: string | null = null;
    if (parsed.diff) {
      const { data: patch, error: patchInsertError } = await supabase
        .from("patches")
        .insert({
          bug_id: bug.id,
          user_id: session.user.id,
          diff: parsed.diff,
          tests_generated: parsed.tests,
          status: "pending",
        })
        .select("id")
        .single();

      if (patchInsertError) {
        console.error("[commit-findings/patch-draft:patch]", patchInsertError);
      } else {
        patchId = patch?.id ?? null;
      }
    }

    if (sessionId) {
      const { error: sessionUpdateError } = await supabase
        .from("chat_sessions")
        .update({ bug_id: bug.id, title: parsed.title })
        .eq("id", sessionId)
        .eq("user_id", session.user.id);

      if (sessionUpdateError) {
        console.error("[commit-findings/patch-draft:session]", sessionUpdateError);
      }
    }

    return NextResponse.json({
      bugId: bug.id,
      patchId,
      title: parsed.title,
      patchStatus: patchId ? "created" : "unavailable",
      message: patchId
        ? "Patch draft created."
        : "No safe patch could be generated from the available file context. Review the issue and regenerate after refining the finding or file context.",
    });
  } catch (error) {
    console.error("[commit-findings/patch-draft]", error);
    await supabase.from("bugs").update({ status: "Detected" }).eq("id", bug.id);
    return NextResponse.json({ error: "Failed to create patch draft." }, { status: 500 });
  }
}
