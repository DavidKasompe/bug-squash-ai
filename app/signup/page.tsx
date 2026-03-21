"use client";

import { useState } from "react";
import Link from "next/link";
import { Github, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { signUp, signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const { data, error } = await signUp.email({
        email,
        password,
        name,
        callbackURL: "/overview"
      });
      
      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Failed to create account. Please try again.");
      } else {
        setStatus("success");
        router.push("/overview");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("An unexpected error occurred.");
    }
  };

  const handleGithubSignup = async () => {
    try {
      await signIn.social({ provider: "github", callbackURL: "/overview" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center p-4 font-sans text-[#111111]">
      <div className="w-full max-w-sm animate-fade-in relative z-10">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex gap-[2px]">
              <div className="w-[12px] h-[18px] bg-[#2A6948] rounded-sm transform skew-x-[-15deg]"></div>
              <div className="w-[12px] h-[18px] bg-[#2A6948]/50 rounded-sm transform skew-x-[-15deg]"></div>
            </div>
            <span className="font-bold text-3xl tracking-tight text-[#111111]">Mirai</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-black/[0.04] rounded-3xl p-8 shadow-sm">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Create an account</h1>
            <p className="text-sm text-black/60">Start squashing bugs automatically.</p>
          </div>

          <div className="flex flex-col gap-5">
            
            <button 
              onClick={handleGithubSignup}
              className="w-full flex items-center justify-center gap-3 bg-[#111111] hover:bg-black/80 text-white font-semibold rounded-xl py-3 px-4 transition-colors shadow-sm"
            >
              <Github className="w-5 h-5" />
              Sign up with GitHub
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-black/10"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-black/40 uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t border-black/10"></div>
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-xs font-bold text-[#111111]">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe" 
                  className="bg-[#F5F4F0] border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2A6948] focus:bg-white transition-all text-[#111111] placeholder:text-black/30"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-bold text-[#111111]">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="bg-[#F5F4F0] border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2A6948] focus:bg-white transition-all text-[#111111] placeholder:text-black/30"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-xs font-bold text-[#111111]">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password" 
                  className="bg-[#F5F4F0] border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2A6948] focus:bg-white transition-all text-[#111111] placeholder:text-black/30"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={status === "loading" || status === "success"}
                className="w-full flex items-center justify-center gap-2 bg-[#2A6948] hover:bg-[#1E4A31] disabled:opacity-70 disabled:hover:bg-[#2A6948] text-white font-semibold rounded-xl py-3 px-4 transition-colors shadow-sm mt-2"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === "success" ? (
                  "Navigating to Dashboard..."
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

          </div>
        </div>

        <p className="text-center text-sm text-black/60 mt-8 font-medium">
          Already have an account? <Link href="/login" className="text-[#2A6948] hover:underline transition-colors font-bold">Log in</Link>
        </p>

      </div>
    </div>
  );
}
