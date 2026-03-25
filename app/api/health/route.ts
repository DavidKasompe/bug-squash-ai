import { NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    app: "Mirai",
    status: "ok",
    services: {
      database: env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
      auth: env.BETTER_AUTH_SECRET ? "configured" : "missing",
      llm: env.GROQ_API_KEY ? "configured" : "missing",
    },
  });
}
