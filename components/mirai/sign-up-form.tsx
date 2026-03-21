"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setMessage(null);

    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message ?? "Sign-up failed.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Name</span>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
            <User className="size-4 text-muted-foreground" />
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Mirai Operator"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Email</span>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
            <Mail className="size-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="team@mirai.dev"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Password</span>
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
            <Lock className="size-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </label>
      </div>

      <Button className="w-full" onClick={handleSubmit} type="button" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create Mirai account"}
      </Button>

      {message ? <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">{message}</p> : null}

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
