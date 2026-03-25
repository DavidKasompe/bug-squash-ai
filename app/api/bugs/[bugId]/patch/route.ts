import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/bugs/[bugId]/patch — get the latest patch record for a bug
export async function GET(
  req: Request,
  { params }: { params: Promise<{ bugId: string }> }
) {
  const { bugId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { data: patch } = await supabase
    .from("patches")
    .select("id, status, pr_url, pr_number")
    .eq("bug_id", bugId)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!patch) return Response.json({ patchId: null });

  return Response.json({ patchId: patch.id, status: patch.status, pr_url: patch.pr_url });
}
