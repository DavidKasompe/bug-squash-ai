import {
  bugReports as mockBugReports,
  getBugById,
  getBugReports,
  getPatchesForBug,
  getRepositories,
  getValidationSummary,
  patches as mockPatches,
  repositories as mockRepositories,
} from "@/lib/mirai/mock-data";
import type { BugReport, PatchVariant, Repository } from "@/lib/mirai/types";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function listBugReports() {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("bug_reports").select("*").order("created_at", { ascending: false });

    if (!error && data) {
      return data.map(
        (bug): BugReport => ({
          id: bug.id,
          title: bug.title,
          summary: bug.summary ?? bug.title,
          affectedFile: bug.affected_file ?? "unknown",
          affectedFunction: bug.affected_function ?? "unknown",
          suggestedFix: bug.suggested_fix ?? "Pending AI workflow output.",
          confidenceScore: bug.confidence_score ?? 0,
          severity: bug.severity ?? "low",
          status: bug.status ?? "queued",
          repositoryId: bug.repository_id ?? "unknown",
          repositoryName: bug.repository_name ?? "Unknown repository",
        }),
      );
    }
  }

  return getBugReports();
}

export async function listRepositories() {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("repositories").select("*").order("created_at", { ascending: false });

    if (!error && data) {
      return data.map(
        (repository): Repository => ({
          id: repository.id,
          githubId: repository.github_id,
          name: repository.name,
          fullName: repository.full_name,
          description: repository.description ?? "",
          defaultBranch: repository.default_branch ?? "main",
          status: repository.status ?? "inactive",
          isConnected: repository.is_connected ?? true,
          analyzeBranches: repository.analyze_branches ?? [],
          analyzePaths: repository.analyze_paths ?? [],
        }),
      );
    }
  }

  return getRepositories();
}

export async function listConnectedRepositories() {
  const repositories = await listRepositories();

  return repositories.filter((repository) => repository.isConnected);
}

export async function getBugDetails(bugId: string) {
  const bugs = await listBugReports();

  return bugs.find((bug) => bug.id === bugId) ?? getBugById(bugId);
}

export async function listPatchVariants(bugId: string) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("patch_runs")
      .select("*")
      .eq("bug_report_id", bugId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map(
        (patch): PatchVariant => ({
          id: patch.id,
          bugId: patch.bug_report_id,
          status: patch.status ?? "pending",
          originalFilePath: patch.original_file_path ?? "unknown",
          originalCode: patch.original_code ?? "",
          patchedCode: patch.diff_preview ?? "",
          reviewNotes: patch.patch_summary ?? "Pending review notes.",
          confidenceScore: patch.confidence_score ?? 0,
          pullRequestUrl: patch.pull_request_url ?? undefined,
        }),
      );
    }
  }

  return getPatchesForBug(bugId);
}

export async function getValidationDetails() {
  return getValidationSummary();
}

export async function createUploadRecord({
  repositoryId,
  filename,
  storagePath,
  contentType,
}: {
  repositoryId: string;
  filename: string;
  storagePath: string;
  contentType: string;
}) {
  if (isSupabaseConfigured) {
    const supabase = createSupabaseAdminClient();

    await supabase.from("log_uploads").insert({
      repository_id: repositoryId,
      filename,
      storage_path: storagePath,
      content_type: contentType,
    });
  }

  return {
    repositoryId,
    filename,
    storagePath,
  };
}

export function getMockCounts() {
  return {
    bugs: mockBugReports.length,
    patches: mockPatches.length,
    repositories: mockRepositories.length,
  };
}
