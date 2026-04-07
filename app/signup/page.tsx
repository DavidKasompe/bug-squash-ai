"use client";

import { useState } from "react";
import Link from "next/link";
import { Github, ArrowRight, Loader2, AlertCircle, CheckCircle2, GitMerge, Sparkles, Bug } from "lucide-react";
import { signUp, signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const PITCH_POINTS = [
  { icon: Bug, text: "AI bug analysis from any stack trace" },
  { icon: Sparkles, text: "Auto-generated patches with diff preview" },
  { icon: GitMerge, text: "One-click GitHub pull request creation" },
];

const GITHUB_OAUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID);

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [githubLoading, setGithubLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const { error } = await signUp.email({ email, password, name, callbackURL: "/overview" });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Failed to create account. Please try again.");
      } else {
        setStatus("success");
        router.push("/overview");
      }
    } catch {
      setStatus("error");
      setErrorMessage("An unexpected error occurred.");
    }
  };

  const handleGithubSignup = async () => {
    setGithubLoading(true);
    try {
      await signIn.social({ provider: "github", callbackURL: "/overview" });
    } catch (err) {
      console.error(err);
      setGithubLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left panel — product pitch */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-[#111111] p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#9AFA5A]/6 via-transparent to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#9AFA5A]/5 blur-[120px]" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="flex gap-[2px]">
            <div className="h-[16px] w-[11px] skew-x-[-15deg] rounded-sm bg-[#9AFA5A]" />
            <div className="h-[16px] w-[11px] skew-x-[-15deg] rounded-sm bg-[#9AFA5A]/40" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Mirai</span>
        </Link>

        <div className="relative">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9AFA5A]">
            AI Bug Execution
          </p>
          <h2 className="text-3xl font-semibold leading-snug tracking-tight text-white">
            From crash to merged fix,<br />without leaving your workflow.
          </h2>
          <div className="mt-10 space-y-5">
            {PITCH_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#9AFA5A]/10">
                  <Icon className="size-3.5 text-[#9AFA5A]" />
                </div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/20">© 2026 Mirai Inc. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-[#F5F4F0] p-8">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex gap-[2px]">
                <div className="h-[18px] w-[12px] skew-x-[-15deg] rounded-sm bg-[#2A6948]" />
                <div className="h-[18px] w-[12px] skew-x-[-15deg] rounded-sm bg-[#2A6948]/50" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-[#111111]">Mirai</span>
            </Link>
          </div>

          <div className="rounded-3xl border border-black/[0.04] bg-white p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold text-[#111111]">Create an account</h1>
              <p className="text-sm text-black/55">Start squashing bugs automatically.</p>
            </div>

            <div className="flex flex-col gap-5">
              {GITHUB_OAUTH_ENABLED ? (
                <>
                  <button
                    onClick={handleGithubSignup}
                    disabled={githubLoading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#111111] px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-black/80 disabled:opacity-60"
                  >
                    {githubLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Github className="h-5 w-5" />
                    )}
                    {githubLoading ? "Redirecting to GitHub…" : "Sign up with GitHub"}
                  </button>

                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-black/[0.08]" />
                    <span className="mx-4 flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-black/35">
                      Or
                    </span>
                    <div className="flex-grow border-t border-black/[0.08]" />
                  </div>
                </>
              ) : null}

              {status === "error" ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              {status === "success" ? (
                <div className="flex items-center gap-2 rounded-xl border border-[#2A6948]/20 bg-[#2A6948]/5 p-3.5 text-sm text-[#2A6948]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Account created! Redirecting…</span>
                </div>
              ) : null}

              <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-[#111111]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="rounded-xl border border-transparent bg-[#F5F4F0] px-4 py-3 text-sm text-[#111111] transition-all placeholder:text-black/25 focus:border-[#2A6948] focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-[#111111]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="rounded-xl border border-transparent bg-[#F5F4F0] px-4 py-3 text-sm text-[#111111] transition-all placeholder:text-black/25 focus:border-[#2A6948] focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-xs font-bold text-[#111111]">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="rounded-xl border border-transparent bg-[#F5F4F0] px-4 py-3 text-sm text-[#111111] transition-all placeholder:text-black/25 focus:border-[#2A6948] focus:bg-white focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2A6948] px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[#1E4A31] disabled:opacity-60 disabled:hover:bg-[#2A6948]"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : status === "success" ? (
                    "Redirecting…"
                  ) : (
                    <>
                      Create Account <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="mt-8 text-center text-sm font-medium text-black/55">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#2A6948] transition-colors hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
