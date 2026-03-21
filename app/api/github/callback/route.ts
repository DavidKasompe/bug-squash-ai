import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const installationId = searchParams.get("installation_id");
  const setupAction    = searchParams.get("setup_action"); // install | update | delete

  if (!installationId) {
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connections?error=missing_installation`);
  }

  try {
    // Get the current logged-in user via Better Auth
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    // Get GitHub App installation token
    const appAuth = createAppAuth({
      appId:      process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    });

    const { token, expiresAt } = await appAuth({
      type:           "installation",
      installationId: parseInt(installationId),
    });

    // List repos accessible to this installation
    const octokit = new Octokit({ auth: token });
    const { data: repoData } = await octokit.apps.listReposAccessibleToInstallation({ per_page: 100 });
    const { data: installation } = await octokit.apps.getInstallation({ installation_id: parseInt(installationId) });

    const repos = repoData.repositories.map(r => ({
      id:         r.id,
      name:       r.name,
      full_name:  r.full_name,
      private:    r.private,
      language:   r.language,
      updated_at: r.updated_at,
    }));

    const account = installation.account;
    const accountLogin = account && "login" in account ? account.login : (account as any)?.name ?? "";
    const accountType  = account && "type"  in account ? account.type  : "Organization";

    // Upsert into Supabase
    await supabase.from("installations").upsert({
      user_id:          session.user.id,
      installation_id:  installationId,
      account_login:    accountLogin,
      account_type:     accountType,
      token,
      token_expires_at: expiresAt,
      repos,
    }, { onConflict: "user_id,installation_id" });

    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connections?success=connected`);
  } catch (err) {
    console.error("[github/callback]", err);
    return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connections?error=auth_failed`);
  }
}
