import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("bugs")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/bugs]", error);
    return NextResponse.json({ error: "Failed to load bugs." }, { status: 500 });
  }

  return NextResponse.json({
    bugs: data ?? [],
  });
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
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
    commitSha ? `Commit: ${commitSha}` : "",
    commitMessage ? `Commit message: ${commitMessage}` : "",
  ].filter(Boolean);

  const { data, error } = await supabase
    .from("bugs")
    .insert({
      user_id: session.user.id,
      installation_id: installationId,
      repo,
      title,
      description: descriptionParts.join("\n\n"),
      stack_trace: commitSha ? `Commit analysis finding from ${commitSha}` : "Commit analysis finding",
      severity,
      status: "Detected",
      affected_file: file,
      confidence,
      root_cause: detail,
      ai_suggestion: recommendedChecks.join("\n"),
      fix_steps: recommendedChecks,
      source: "commit_analysis",
    })
    .select("id, title")
    .single();

  if (error) {
    console.error("[api/bugs:post]", error);
    return NextResponse.json({ error: "Failed to create bug." }, { status: 500 });
  }

  if (sessionId) {
    const { error: sessionUpdateError } = await supabase
      .from("chat_sessions")
      .update({ bug_id: data.id, title })
      .eq("id", sessionId)
      .eq("user_id", session.user.id);

    if (sessionUpdateError) {
      console.error("[api/bugs:post:session]", sessionUpdateError);
    }
  }

  return NextResponse.json({
    bugId: data.id,
    title: data.title,
  });
}
