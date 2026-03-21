import { NextResponse } from "next/server";

import { listConnectedRepositories, listRepositories } from "@/lib/mirai/server";

export async function GET() {
  return NextResponse.json({
    connected: await listConnectedRepositories(),
    available: await listRepositories(),
  });
}
