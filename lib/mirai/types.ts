export type Severity = "low" | "medium" | "high" | "critical";

export type BugStatus = "queued" | "investigating" | "ready" | "resolved";

export type PatchStatus = "pending" | "generated" | "reviewed" | "applied" | "failed" | "rejected";

export type TestStatus = "passed" | "failed";

export type RepositoryStatus = "active" | "inactive" | "syncing" | "error";

export interface Repository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  description: string;
  defaultBranch: string;
  status: RepositoryStatus;
  isConnected: boolean;
  analyzeBranches: string[];
  analyzePaths: string[];
}

export interface BugReport {
  id: string;
  title: string;
  summary: string;
  affectedFile: string;
  affectedFunction: string;
  suggestedFix: string;
  confidenceScore: number;
  severity: Severity;
  status: BugStatus;
  repositoryId: string;
  repositoryName: string;
}

export interface PatchVariant {
  id: string;
  bugId: string;
  status: PatchStatus;
  originalFilePath: string;
  originalCode: string;
  patchedCode: string;
  reviewNotes: string;
  confidenceScore: number;
  pullRequestUrl?: string;
}

export interface ValidationCase {
  id: string;
  name: string;
  status: TestStatus;
  duration: number;
  details?: string;
}

export interface ValidationSummary {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  successRate: number;
  testCases: ValidationCase[];
}
