import { createAuthClient } from "better-auth/react";
import { env } from "@/lib/env";

export const authClient = createAuthClient({
  baseURL:
    env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
});

export const { signIn, signUp, signOut, useSession } = authClient;
