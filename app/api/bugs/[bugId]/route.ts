import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bugId: string }> },
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { bugId } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: bug, error: bugError } = await supabase
    .from("bugs")
    .select("*")
    .eq("id", bugId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (bugError) {
    console.error("[api/bugs/[bugId]]", bugError);
    return NextResponse.json({ error: "Failed to load bug." }, { status: 500 });
  }

  if (!bug) {
    return NextResponse.json({ error: "Bug not found." }, { status: 404 });
  }

  const { data: patch, error: patchError } = await supabase
    .from("patches")
    .select("id, diff, tests_generated, pr_url, status, branch_name, created_at")
    .eq("bug_id", bugId)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (patchError) {
    console.error("[api/bugs/[bugId]:patch]", patchError);
    return NextResponse.json({ error: "Failed to load bug patch." }, { status: 500 });
  }

  return NextResponse.json({
    bug,
    patch: patch ?? null,
  });
}
