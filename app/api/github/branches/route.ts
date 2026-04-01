import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/auth";
import { listRepositoryBranches } from "@/lib/github";

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get("installationId");
  const repo = searchParams.get("repo");

  if (!installationId || !repo) {
    return NextResponse.json(
      { error: "installationId and repo are required." },
      { status: 400 },
    );
  }

  try {
    const branches = await listRepositoryBranches(installationId, repo);
    return NextResponse.json({ branches });
  } catch (error) {
    console.error("[api/github/branches]", error);
    return NextResponse.json({ error: "Failed to load branches." }, { status: 500 });
  }
}
