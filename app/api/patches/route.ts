import { NextResponse } from "next/server";

import { bugReports, patches } from "@/lib/mirai/mock-data";

export async function GET() {
  return NextResponse.json({
    results: patches,
    bugCount: bugReports.length,
  });
}
