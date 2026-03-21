import { createAppAuth } from "@octokit/auth-app";

export async function GET() {
  // Redirect user to GitHub App installation page
  const appSlug = process.env.GITHUB_APP_SLUG!; // e.g. "mirai-ai-app"
  const url = `https://github.com/apps/${appSlug}/installations/new`;
  return Response.redirect(url);
}
