import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Get a fresh installation access token ────────────────────────────────────
export async function getInstallationToken(installationId: string): Promise<string> {
  // Check Supabase cache first
  const { data } = await supabase
    .from("installations")
    .select("token, token_expires_at")
    .eq("installation_id", installationId)
    .single();

  // Return cached token if it expires in more than 5 minutes
  if (data?.token && data.token_expires_at) {
    const expiresAt = new Date(data.token_expires_at);
    if (expiresAt.getTime() - Date.now() > 5 * 60 * 1000) {
      return data.token;
    }
  }

  // Generate a new token
  const auth = createAppAuth({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  });

  const { token, expiresAt } = await auth({
    type: "installation",
    installationId: parseInt(installationId),
  });

  // Cache it
  await supabase
    .from("installations")
    .update({ token, token_expires_at: expiresAt })
    .eq("installation_id", installationId);

  return token;
}

// ─── Get an Octokit instance for an installation ──────────────────────────────
export async function getOctokit(installationId: string): Promise<Octokit> {
  const token = await getInstallationToken(installationId);
  return new Octokit({ auth: token });
}

export async function getDefaultBranch(installationId: string, repo: string): Promise<string> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);
  const { data } = await octokit.repos.get({
    owner,
    repo: repoName,
  });

  return data.default_branch || "main";
}

// ─── Fetch file content from a repo ──────────────────────────────────────────
export async function fetchFileFromGitHub(
  installationId: string,
  repo: string,
  filePath: string,
  ref = "main"
): Promise<{ content: string; sha: string }> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);

  const { data } = await octokit.repos.getContent({
    owner,
    repo: repoName,
    path: filePath,
    ref,
  });

  if ("content" in data && data.type === "file") {
    return {
      content: Buffer.from(data.content, "base64").toString("utf8"),
      sha: data.sha,
    };
  }
  throw new Error(`${filePath} is not a file in ${repo}`);
}

// ─── Fetch workflow run logs ──────────────────────────────────────────────────
export async function fetchWorkflowLogs(
  installationId: string,
  owner: string,
  repo: string,
  runId: number
): Promise<string> {
  const octokit = await getOctokit(installationId);

  try {
    // Get the log download URL (GitHub redirects to a zip)
    const { url } = await octokit.actions.downloadWorkflowRunLogs({
      owner,
      repo,
      run_id: runId,
    });

    // Fetch the raw log content (plain text for small logs)
    const response = await fetch(url);
    const text = await response.text();
    return text.slice(0, 8000); // Trim to avoid token limits
  } catch {
    return "";
  }
}

// ─── Extract stack trace from log text ────────────────────────────────────────
export function extractStackTrace(logText: string): string {
  // Look for common error patterns
  const patterns = [
    /Error:[\s\S]{0,3000}(?=\n\n|\n[A-Z]|$)/,
    /TypeError:[\s\S]{0,3000}(?=\n\n|\n[A-Z]|$)/,
    /at .+\(.+:\d+:\d+\)[\s\S]{0,2000}/,
    /Exception:[\s\S]{0,3000}(?=\n\n|\n[A-Z]|$)/,
    /FAIL[\s\S]{0,3000}(?=\n\n|$)/,
  ];

  for (const pattern of patterns) {
    const match = logText.match(pattern);
    if (match) return match[0].trim();
  }

  // Fall back to last 2000 chars of the log
  return logText.slice(-2000).trim();
}

// ─── Create a branch from main ────────────────────────────────────────────────
export async function createBranch(
  installationId: string,
  repo: string,
  branchName: string,
  baseBranch = "main"
): Promise<void> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);

  const { data: ref } = await octokit.git.getRef({
    owner,
    repo: repoName,
    ref: `heads/${baseBranch}`,
  });

  await octokit.git.createRef({
    owner,
    repo: repoName,
    ref: `refs/heads/${branchName}`,
    sha: ref.object.sha,
  });
}

// ─── Commit a file to a branch ────────────────────────────────────────────────
export async function commitFile(
  installationId: string,
  repo: string,
  branch: string,
  filePath: string,
  content: string,
  sha: string,
  message: string
): Promise<void> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo: repoName,
    path: filePath,
    message,
    content: Buffer.from(content).toString("base64"),
    sha,
    branch,
  });
}

// ─── Open a Pull Request ──────────────────────────────────────────────────────
export async function openPullRequest(
  installationId: string,
  repo: string,
  head: string,
  base: string,
  title: string,
  body: string
): Promise<{ url: string; number: number }> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);

  const { data: pr } = await octokit.pulls.create({
    owner,
    repo: repoName,
    title,
    body,
    head,
    base,
  });

  return { url: pr.html_url, number: pr.number };
}

// ─── Merge a Pull Request ─────────────────────────────────────────────────────
export async function mergePullRequest(
  installationId: string,
  repo: string,
  prNumber: number,
  commitTitle: string
): Promise<void> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);

  await octokit.pulls.merge({
    owner,
    repo: repoName,
    pull_number: prNumber,
    merge_method: "squash",
    commit_title: commitTitle,
  });
}

// ─── List repos accessible to an installation ─────────────────────────────────
export async function listInstallationRepos(installationId: string) {
  const octokit = await getOctokit(installationId);
  const { data } = await octokit.apps.listReposAccessibleToInstallation({ per_page: 100 });
  return data.repositories.map(r => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    private: r.private,
    language: r.language,
    updated_at: r.updated_at,
  }));
}
