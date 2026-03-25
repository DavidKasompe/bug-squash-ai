import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { env } from "@/lib/env";

// Initialize Postgres connection to Supabase
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    env.BETTER_AUTH_URL,
    env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean) as string[],
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID || "",
      clientSecret: env.GITHUB_CLIENT_SECRET || "",
    },
  },
});

import { headers } from "next/headers";

export const isAuthConfigured = Boolean(
  env.DATABASE_URL &&
  env.BETTER_AUTH_SECRET &&
  env.BETTER_AUTH_URL,
);

export const getServerSession = async () => {
  try {
    const headersList = await headers();
    return await auth.api.getSession({
      headers: headersList
    });
  } catch (e) {
    return null;
  }
};
