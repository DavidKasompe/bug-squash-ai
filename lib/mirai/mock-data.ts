import type { BugReport, PatchVariant, Repository, ValidationSummary } from "@/lib/mirai/types";

export const repositories: Repository[] = [
  {
    id: "repo-1",
    githubId: 1001,
    name: "checkout-service",
    fullName: "mirai-labs/checkout-service",
    description: "Payment orchestration and order lifecycle handling.",
    defaultBranch: "main",
    status: "active",
    isConnected: true,
    analyzeBranches: ["main", "release"],
    analyzePaths: ["/src/payments", "/src/orders"],
  },
  {
    id: "repo-2",
    githubId: 1002,
    name: "runtime-gateway",
    fullName: "mirai-labs/runtime-gateway",
    description: "API gateway and auth boundary for internal services.",
    defaultBranch: "main",
    status: "syncing",
    isConnected: true,
    analyzeBranches: ["main"],
    analyzePaths: ["/apps/api", "/packages/auth"],
  },
  {
    id: "repo-3",
    githubId: 1003,
    name: "mobile-observer",
    fullName: "mirai-labs/mobile-observer",
    description: "Telemetry collection for client runtime diagnostics.",
    defaultBranch: "develop",
    status: "inactive",
    isConnected: false,
    analyzeBranches: ["develop"],
    analyzePaths: ["/android", "/ios"],
  },
];

export const bugReports: BugReport[] = [
  {
    id: "bug-101",
    title: "Null checkout session during card retry",
    summary: "Retry flow drops the checkout session after a token refresh, causing a 500 response.",
    affectedFile: "src/payments/retry-checkout.ts",
    affectedFunction: "resumeCheckoutSession",
    suggestedFix: "Guard the session lookup and rehydrate from the order snapshot before retrying.",
    confidenceScore: 92,
    severity: "critical",
    status: "ready",
    repositoryId: "repo-1",
    repositoryName: "mirai-labs/checkout-service",
  },
  {
    id: "bug-102",
    title: "Expired auth token bypasses structured error path",
    summary: "Gateway returns a generic 500 instead of a typed auth failure on malformed bearer tokens.",
    affectedFile: "packages/auth/src/token.ts",
    affectedFunction: "parseBearerToken",
    suggestedFix: "Normalize token parsing failures and route them through the auth error mapper.",
    confidenceScore: 81,
    severity: "high",
    status: "investigating",
    repositoryId: "repo-2",
    repositoryName: "mirai-labs/runtime-gateway",
  },
  {
    id: "bug-103",
    title: "Android telemetry batch stalls on oversized payloads",
    summary: "Large crash batches exceed queue limits and block downstream upload scheduling.",
    affectedFile: "android/telemetry/BatchUploader.kt",
    affectedFunction: "enqueueUpload",
    suggestedFix: "Chunk the payload earlier and persist retry metadata with the first split.",
    confidenceScore: 74,
    severity: "medium",
    status: "queued",
    repositoryId: "repo-3",
    repositoryName: "mirai-labs/mobile-observer",
  },
];

export const patches: PatchVariant[] = [
  {
    id: "patch-301",
    bugId: "bug-101",
    status: "reviewed",
    originalFilePath: "src/payments/retry-checkout.ts",
    originalCode: `export async function resumeCheckoutSession(orderId: string) {
  const session = await checkoutSessions.get(orderId);
  return retryCharge(session.id);
}`,
    patchedCode: `export async function resumeCheckoutSession(orderId: string) {
  const session = await checkoutSessions.get(orderId);
  const recoveredSession = session ?? (await hydrateSessionFromOrderSnapshot(orderId));

  if (!recoveredSession) {
    throw new CheckoutSessionError("Missing checkout session during retry");
  }

  return retryCharge(recoveredSession.id);
}`,
    reviewNotes: "Recovered session path prevents null access during retry flow.",
    confidenceScore: 91,
    pullRequestUrl: "https://github.com/mirai-labs/checkout-service/pull/128",
  },
  {
    id: "patch-302",
    bugId: "bug-102",
    status: "generated",
    originalFilePath: "packages/auth/src/token.ts",
    originalCode: `export function parseBearerToken(value: string) {
  return value.replace("Bearer ", "").trim();
}`,
    patchedCode: `export function parseBearerToken(value: string) {
  if (!value.startsWith("Bearer ")) {
    throw new InvalidAuthTokenError("Expected Bearer token");
  }

  return value.replace("Bearer ", "").trim();
}`,
    reviewNotes: "Generated patch still needs approval before application.",
    confidenceScore: 83,
  },
];

export const validationSummary: ValidationSummary = {
  totalTests: 6,
  passedCount: 4,
  failedCount: 2,
  successRate: 67,
  testCases: [
    {
      id: "test-1",
      name: "Checkout retry restores session snapshot",
      status: "passed",
      duration: 0.46,
    },
    {
      id: "test-2",
      name: "Malformed bearer tokens return typed 401 errors",
      status: "failed",
      duration: 0.31,
      details: "Still returns a generic 500 when the header is empty.",
    },
    {
      id: "test-3",
      name: "PR payload includes diff preview",
      status: "passed",
      duration: 0.22,
    },
    {
      id: "test-4",
      name: "Large telemetry batches split before upload",
      status: "failed",
      duration: 0.57,
      details: "Chunking logic has not been ported yet in Mirai.",
    },
    {
      id: "test-5",
      name: "Connected repositories list resolves from server cache",
      status: "passed",
      duration: 0.18,
    },
    {
      id: "test-6",
      name: "Analysis workflow emits structured cause summary",
      status: "passed",
      duration: 0.41,
    },
  ],
};

export function getBugReports() {
  return bugReports;
}

export function getRepositories() {
  return repositories;
}

export function getConnectedRepositories() {
  return repositories.filter((repository) => repository.isConnected);
}

export function getBugById(bugId: string) {
  return bugReports.find((bug) => bug.id === bugId) ?? null;
}

export function getPatchesForBug(bugId: string) {
  return patches.filter((patch) => patch.bugId === bugId);
}

export function getValidationSummary() {
  return validationSummary;
}
