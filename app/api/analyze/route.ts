import { createClient } from "@supabase/supabase-js";
import { generateText } from "ai";
import { ANALYSIS_SYSTEM_PROMPT, parseAnalysisResponse } from "@/lib/prompts";
import { getGroqModel, isGroqConfigured } from "@/lib/llm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  // Validate internal key (prevents public access to this endpoint)
  const internalKey = req.headers.get("x-internal-key");
  if (internalKey !== process.env.INTERNAL_API_KEY) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!isGroqConfigured) {
    return Response.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });
  }

  const { bugId, stackTrace } = await req.json();
  if (!bugId || !stackTrace) {
    return Response.json({ error: "bugId and stackTrace required" }, { status: 400 });
  }

  try {
    const { data: bugRecord, error: bugLookupError } = await supabase
      .from("bugs")
      .select("id, user_id")
      .eq("id", bugId)
      .single();

    if (bugLookupError || !bugRecord) {
      return Response.json({ error: "Bug not found" }, { status: 404 });
    }

    // Mark bug as Investigating
    await supabase.from("bugs").update({ status: "Investigating" }).eq("id", bugId);

    // Run AI analysis
    const { text } = await generateText({
      model:  getGroqModel(),
      system: ANALYSIS_SYSTEM_PROMPT,
      prompt: stackTrace,
    });

    const parsed = parseAnalysisResponse(text);
    if (!parsed) throw new Error("Failed to parse AI response");

    // Update the bug with analysis results
    await supabase.from("bugs").update({
      title:              parsed.title,
      severity:           parsed.severity,
      confidence:         parsed.confidence,
      root_cause:         parsed.root_cause,
      ai_suggestion:      parsed.fix_steps.join("\n"),
      fix_steps:          parsed.fix_steps,
      affected_file:      parsed.affected_file,
      affected_function:  parsed.affected_function,
      status:             "Ready",
    }).eq("id", bugId);

    // If a diff was generated, create a patch record
    if (parsed.diff) {
      await supabase.from("patches").insert({
        bug_id:          bugId,
        user_id:         bugRecord.user_id,
        diff:            parsed.diff,
        tests_generated: parsed.tests,
        status:          "pending",
      });
    }

    return Response.json({ ok: true, bugId, severity: parsed.severity });
  } catch (err) {
    console.error("[/api/analyze]", err);
    // Mark bug as Detected again so it can be retried
    await supabase.from("bugs").update({ status: "Detected" }).eq("id", bugId);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
