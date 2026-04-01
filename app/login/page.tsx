"use client";

import { useState } from "react";
import Link from "next/link";
import { Github, ArrowRight, Loader2, AlertCircle } from "lucide-react";

import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");

    try {
      const { error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Failed to sign in. Please check your credentials.");
      } else {
        setStatus("success");
        window.location.href = "/overview";
      }
    } catch {
      setStatus("error");
      setErrorMessage("An unexpected error occurred.");
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signIn.social({ provider: "github", callbackURL: "/overview" });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F4F0] p-4 font-sans text-[#111111]">
      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex gap-[2px]">
              <div className="h-[18px] w-[12px] skew-x-[-15deg] rounded-sm bg-[#2A6948]" />
              <div className="h-[18px] w-[12px] skew-x-[-15deg] rounded-sm bg-[#2A6948]/50" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-[#111111]">Mirai</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-black/[0.04] bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-black/60">Log in to your account to continue.</p>
          </div>

          <div className="flex flex-col gap-5">
            <button
              onClick={handleGithubLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#111111] px-4 py-3 font-semibold text-white transition-colors shadow-sm hover:bg-black/80"
            >
              <Github className="h-5 w-5" />
              Continue with GitHub
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-black/10" />
              <span className="mx-4 flex-shrink-0 text-xs font-bold uppercase tracking-widest text-black/40">
                Or
              </span>
              <div className="flex-grow border-t border-black/10" />
            </div>

            {status === "error" ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-bold text-[#111111]">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                  className="rounded-xl border border-transparent bg-[#F5F4F0] px-4 py-3 text-sm text-[#111111] transition-all placeholder:text-black/30 focus:border-[#2A6948] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-[#111111]">
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-[#2A6948] hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border border-transparent bg-[#F5F4F0] px-4 py-3 text-sm text-[#111111] transition-all placeholder:text-black/30 focus:border-[#2A6948] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2A6948] px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#1E4A31] disabled:opacity-70 disabled:hover:bg-[#2A6948]"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === "success" ? (
                  "Success!"
                ) : (
                  <>
                    Log In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-black/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-[#2A6948] transition-colors hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
