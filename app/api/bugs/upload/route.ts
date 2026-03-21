import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/bugs/upload — upload trace, create bug, kick off analysis
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { trace, repo } = await req.json();
  if (!trace) return Response.json({ error: "trace required" }, { status: 400 });

  const { data: bug, error } = await supabase.from("bugs").insert({
    user_id:     session.user.id,
    repo:        repo ?? "manual-upload",
    stack_trace: trace,
    source:      "upload",
    status:      "Detected",
  }).select().single();

  if (error || !bug) return Response.json({ error: "Failed to create bug" }, { status: 500 });

  // Kick off async analysis
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "x-internal-key": process.env.INTERNAL_API_KEY! },
    body:    JSON.stringify({ bugId: bug.id, stackTrace: trace }),
  }).catch(console.error);

  return Response.json({ bugId: bug.id });
}
