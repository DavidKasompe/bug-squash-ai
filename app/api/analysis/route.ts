import { NextResponse } from "next/server";
import { z } from "zod";

import { runBugAnalysisWorkflow } from "@/mastra/workflows/bug-analysis";

const requestSchema = z.object({
  logSnippet: z.string().min(1),
  repository: z.string().optional(),
  branch: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const payload = requestSchema.parse(json);
  const result = await runBugAnalysisWorkflow(payload);

  return NextResponse.json({
    app: "Mirai",
    result,
  });
}
