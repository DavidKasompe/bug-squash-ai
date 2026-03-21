import { NextResponse } from "next/server";

import { listBugReports } from "@/lib/mirai/server";

export async function GET() {
  return NextResponse.json({
    results: await listBugReports(),
  });
}
