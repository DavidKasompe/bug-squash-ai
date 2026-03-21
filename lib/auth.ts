import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Initialize Postgres connection to Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
});

import { headers } from "next/headers";

export const isAuthConfigured = true;

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
