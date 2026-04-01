import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const repositoryId = formData.get("repositoryId");
  const file = formData.get("file");

  if (typeof repositoryId !== "string" || !(file instanceof File)) {
    return NextResponse.json(
      {
        message: "repositoryId and file are required.",
      },
      { status: 400 },
    );
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        message: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "log";
  const storagePath = `${repositoryId}/${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "text/plain",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      {
        message: uploadError.message,
      },
      { status: 500 },
    );
  }

  const { error: recordError } = await supabase.from("log_uploads").insert({
    user_id: session.user.id,
    repository_id: repositoryId,
    filename: file.name,
    storage_path: storagePath,
    content_type: file.type || "text/plain",
  });

  if (recordError) {
    return NextResponse.json(
      {
        message: recordError.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Upload registered.",
    storagePath,
  });
}
