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
    .from("patches")
    .select("*, bugs(id, title, repo, severity, status)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/patches]", error);
    return NextResponse.json({ error: "Failed to load patches." }, { status: 500 });
  }

  return NextResponse.json({
    results: data ?? [],
  });
}
