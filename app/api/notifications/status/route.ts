import { env } from "@/lib/env";

export async function GET() {
  return Response.json({
    emailConfigured: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
  });
}
