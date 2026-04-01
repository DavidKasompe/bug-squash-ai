import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: patches, error } = await supabase
    .from("patches")
    .select("tests_generated, status")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[api/validation]", error);
    return NextResponse.json({ error: "Failed to load validation details." }, { status: 500 });
  }

  const testCases = (patches ?? []).flatMap((patch, patchIndex) =>
    ((patch.tests_generated as string[] | null) ?? []).map((testName, testIndex) => ({
      id: `${patchIndex}-${testIndex}`,
      name: testName,
      status: patch.status === "failed" ? "failed" : "passed",
      duration: 0,
      details: patch.status === "failed" ? "Patch application or validation failed." : "Generated test attached to patch.",
    })),
  );

  const passedCount = testCases.filter((testCase) => testCase.status === "passed").length;
  const failedCount = testCases.length - passedCount;
  const totalTests = testCases.length;
  const successRate = totalTests === 0 ? 0 : Math.round((passedCount / totalTests) * 100);

  return NextResponse.json({
    totalTests,
    passedCount,
    failedCount,
    successRate,
    testCases,
  });
}
