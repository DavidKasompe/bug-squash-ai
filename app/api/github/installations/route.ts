import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { listInstallationRepos } from "@/lib/github";
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
  const userId = session.user.id;

  // ── 1. GitHub App installations ───────────────────────────────────────────
  const { data: appInstallations, error } = await supabase
    .from("installations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[github/installations] app installations error:", error);
    return NextResponse.json({ error: "Failed to load installations." }, { status: 500 });
  }

  // ── 2. OAuth repos (virtual installation) ────────────────────────────────
  // Check if this user has a GitHub OAuth token stored by Better Auth
  const { data: oauthAccount } = await supabase
    .from("account")
    .select("accessToken, scope")
    .eq("userId", userId)
    .eq("providerId", "github")
    .single();

  let oauthInstallation: object | null = null;

  if (oauthAccount?.accessToken) {
    try {
      const virtualId = `oauth:${userId}`;
      const repos = await listInstallationRepos(virtualId);

      oauthInstallation = {
        id: virtualId,
        installation_id: virtualId,
        user_id: userId,
        // Surface the GitHub login as the "account" name
        account_login: session.user.name ?? session.user.email ?? "GitHub Account",
        account_avatar_url: session.user.image ?? null,
        account_type: "User",
        // "repos" matches what the dashboard UI reads
        repos,
        // Mark clearly so the frontend can distinguish from App installs
        source: "oauth",
        created_at: new Date().toISOString(),
      };
    } catch (err) {
      // Token might be expired or revoked — skip silently
      console.warn("[github/installations] OAuth repo fetch failed:", err);
    }
  }

  const installations = [
    ...(oauthInstallation ? [oauthInstallation] : []),
    ...(appInstallations ?? []),
  ];

  return NextResponse.json({ installations });
}
