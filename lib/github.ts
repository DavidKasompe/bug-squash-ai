import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Get a fresh installation access token ────────────────────────────────────
export async function getInstallationToken(installationId: string): Promise<string> {
  // OAuth path: virtual installationId like "oauth:<userId>"
  if (installationId.startsWith("oauth:")) {
    const userId = installationId.slice(6);
    const { data, error } = await supabase
      .from("account")
      .select("accessToken")
      .eq("userId", userId)
      .eq("providerId", "github")
      .single();

    if (error || !data?.accessToken) {
      throw new Error("No GitHub OAuth token found for user. Please sign in with GitHub.");
    }
    return data.accessToken as string;
  }

  // GitHub App path: real numeric installationId
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

export async function listRepositoryBranches(
  installationId: string,
  repo: string,
  limit = 20,
): Promise<string[]> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);
  const { data } = await octokit.repos.listBranches({
    owner,
    repo: repoName,
    per_page: Math.min(Math.max(limit, 1), 100),
  });

  return data.map((branch) => branch.name);
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

type RepositoryFileCandidate = {
  path: string;
  score: number;
};

export async function findRepositoryFileCandidates(
  installationId: string,
  repo: string,
  ref = "main",
  targetPath?: string | null,
): Promise<string[]> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);
  const normalizedTarget = targetPath?.replace(/^\.?\//, "").toLowerCase() ?? "";
  const targetSegments = normalizedTarget.split("/").filter(Boolean);
  const targetBaseName = targetSegments[targetSegments.length - 1] ?? "";

  const { data } = await octokit.git.getTree({
    owner,
    repo: repoName,
    tree_sha: ref,
    recursive: "true",
  });

  const candidates = (data.tree ?? [])
    .filter((entry) => entry.type === "blob" && typeof entry.path === "string")
    .map((entry) => {
      const path = entry.path!;
      const normalizedPath = path.toLowerCase();
      let score = 0;

      if (normalizedTarget && normalizedPath === normalizedTarget) {
        score += 100;
      }

      if (targetBaseName && normalizedPath.endsWith(targetBaseName)) {
        score += 60;
      }

      for (const segment of targetSegments) {
        if (segment && normalizedPath.includes(segment)) {
          score += 10;
        }
      }

      return {
        path,
        score,
      } satisfies RepositoryFileCandidate;
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map((candidate) => candidate.path);

  return candidates;
}

export async function resolveRepositoryFilePath(
  installationId: string,
  repo: string,
  filePath: string,
  ref = "main",
): Promise<{
  path: string | null;
  candidates: string[];
}> {
  try {
    await fetchFileFromGitHub(installationId, repo, filePath, ref);
    return { path: filePath, candidates: [] };
  } catch {
    const candidates = await findRepositoryFileCandidates(installationId, repo, ref, filePath);

    if (candidates.length === 1) {
      return {
        path: candidates[0],
        candidates,
      };
    }

    return {
      path: null,
      candidates,
    };
  }
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

  // OAuth token: list repos the authenticated user owns / has access to
  if (installationId.startsWith("oauth:")) {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
      affiliation: "owner,collaborator,organization_member",
    });
    return data.map(r => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      private: r.private,
      language: r.language ?? null,
      updated_at: r.updated_at ?? null,
    }));
  }

  // GitHub App installation token
  const { data } = await octokit.apps.listReposAccessibleToInstallation({ per_page: 100 });
  return data.repositories.map(r => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    private: r.private,
    language: r.language ?? null,
    updated_at: r.updated_at ?? null,
  }));
}

export type CommitFileAnalysis = {
  commitSha?: string;
  filename: string;
  status?: string;
  additions?: number;
  deletions?: number;
  changes?: number;
  patch?: string;
  content?: string;
};

export type CommitSummary = {
  sha: string;
  message: string;
  author: string;
  committedAt: string;
  url: string;
};

export type CommitAnalysisContext = {
  sha: string;
  branch: string;
  message: string;
  author: string;
  committedAt: string;
  url: string;
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  commits: CommitSummary[];
  files: CommitFileAnalysis[];
};

async function buildCommitAnalysisContextFromSha(
  installationId: string,
  repo: string,
  targetBranch: string,
  commitSha: string,
): Promise<CommitAnalysisContext> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);

  const { data: detailedCommit } = await octokit.repos.getCommit({
    owner,
    repo: repoName,
    ref: commitSha,
  });

  const textFilePattern = /\.(ts|tsx|js|jsx|json|md|py|java|kt|go|rb|rs|php|cs|swift|yml|yaml|toml|env|ini|sh|sql)$/i;
  const contentCandidates = (detailedCommit.files ?? [])
    .filter((file) => file.status !== "removed" && !!file.filename && textFilePattern.test(file.filename))
    .sort((left, right) => {
      const leftPatchScore = left.patch ? left.patch.length : 0;
      const rightPatchScore = right.patch ? right.patch.length : 0;
      return rightPatchScore - leftPatchScore;
    })
    .slice(0, 3);

  const contentByFile = new Map<string, string>();
  await Promise.all(
    contentCandidates.map(async (file) => {
      try {
        const result = await fetchFileFromGitHub(installationId, repo, file.filename, detailedCommit.sha);
        contentByFile.set(file.filename, result.content);
      } catch {
        // Some files in a commit may be binary, renamed, or otherwise unavailable as plain text.
      }
    }),
  );

  return {
    sha: detailedCommit.sha,
    branch: targetBranch,
    message: detailedCommit.commit.message,
    author: detailedCommit.commit.author?.name ?? "unknown",
    committedAt: detailedCommit.commit.author?.date ?? "",
    url: detailedCommit.html_url,
    stats: {
      additions: detailedCommit.stats?.additions ?? 0,
      deletions: detailedCommit.stats?.deletions ?? 0,
      total: detailedCommit.stats?.total ?? 0,
    },
    commits: [
      {
        sha: detailedCommit.sha,
        message: detailedCommit.commit.message,
        author: detailedCommit.commit.author?.name ?? "unknown",
        committedAt: detailedCommit.commit.author?.date ?? "",
        url: detailedCommit.html_url,
      },
    ],
    files: (detailedCommit.files ?? []).map((file) => ({
      commitSha: detailedCommit.sha,
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch,
      content: contentByFile.get(file.filename),
    })),
  };
}

export async function getLatestCommitAnalysisContext(
  installationId: string,
  repo: string,
  branch?: string,
): Promise<CommitAnalysisContext> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);
  const targetBranch = branch ?? (await getDefaultBranch(installationId, repo));

  const { data: commits } = await octokit.repos.listCommits({
    owner,
    repo: repoName,
    sha: targetBranch,
    per_page: 1,
  });

  const latestCommit = commits[0];
  if (!latestCommit) {
    throw new Error(`No commits found for ${repo} on ${targetBranch}.`);
  }

  return buildCommitAnalysisContextFromSha(installationId, repo, targetBranch, latestCommit.sha);
}

export async function getCommitAnalysisContext(
  installationId: string,
  repo: string,
  ref: string,
  branch?: string,
): Promise<CommitAnalysisContext> {
  const targetBranch = branch ?? (await getDefaultBranch(installationId, repo));
  return buildCommitAnalysisContextFromSha(installationId, repo, targetBranch, ref);
}

export async function getRecentCommitAnalysisContext(
  installationId: string,
  repo: string,
  count: number,
  branch?: string,
): Promise<CommitAnalysisContext> {
  const [owner, repoName] = repo.split("/");
  const octokit = await getOctokit(installationId);
  const targetBranch = branch ?? (await getDefaultBranch(installationId, repo));
  const normalizedCount = Math.min(Math.max(count, 1), 3);

  const { data: commits } = await octokit.repos.listCommits({
    owner,
    repo: repoName,
    sha: targetBranch,
    per_page: normalizedCount,
  });

  if (commits.length === 0) {
    throw new Error(`No commits found for ${repo} on ${targetBranch}.`);
  }

  const contexts = await Promise.all(
    commits.map((commit) => buildCommitAnalysisContextFromSha(installationId, repo, targetBranch, commit.sha)),
  );

  const latest = contexts[0];
  return {
    sha: latest.sha,
    branch: targetBranch,
    message: `Recent ${contexts.length}-commit audit`,
    author: latest.author,
    committedAt: latest.committedAt,
    url: latest.url,
    stats: contexts.reduce(
      (acc, context) => ({
        additions: acc.additions + context.stats.additions,
        deletions: acc.deletions + context.stats.deletions,
        total: acc.total + context.stats.total,
      }),
      { additions: 0, deletions: 0, total: 0 },
    ),
    commits: contexts.flatMap((context) => context.commits),
    files: contexts.flatMap((context) => context.files),
  };
}
