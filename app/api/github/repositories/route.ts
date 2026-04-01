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
    .from("installations")
    .select("installation_id, repos")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/github/repositories]", error);
    return NextResponse.json({ error: "Failed to load repositories." }, { status: 500 });
  }

  const connected = (data ?? []).flatMap((installation) =>
    ((installation.repos as Array<{
      id?: number;
      name?: string;
      full_name?: string;
      private?: boolean;
      language?: string | null;
      updated_at?: string | null;
    }>) ?? []).map((repo) => ({
      installationId: installation.installation_id,
      id: repo.id ?? 0,
      name: repo.name ?? repo.full_name ?? "unknown",
      fullName: repo.full_name ?? repo.name ?? "unknown",
      private: Boolean(repo.private),
      language: repo.language ?? null,
      updatedAt: repo.updated_at ?? null,
    })),
  );

  return NextResponse.json({
    connected,
  });
}
