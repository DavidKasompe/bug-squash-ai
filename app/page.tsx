import Link from "next/link";
import { ArrowRight, ArrowUpRight, Upload, Sparkles, ShieldCheck, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

// Modal-inspired color for the bright green: #9BFa55
const GREEN_COLOR = "#9AFA5A";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-[#9AFA5A] selection:text-black pb-24">
      {/* Top Banner */}
      <div className="w-full bg-[#9AFA5A] text-black py-2.5 px-4 flex items-center justify-center text-sm font-medium">
        <span>From broken signals to actionable fixes: Scaling bug orchestration on Mirai</span>
        <Link href="/signup" className="ml-3 underline font-semibold flex items-center gap-1 hover:no-underline">
          Register <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Floating Navbar */}
      <header className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 px-4">
        <nav className="flex items-center justify-between bg-[#1C1D1A]/90 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 shadow-2xl">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <div className="flex flex-col gap-0.5 items-center mr-6">
              <div className="flex gap-[2px]">
                <div className="w-[10px] h-[14px] bg-[#9AFA5A] rounded-sm transform skew-x-[-15deg]"></div>
                <div className="w-[10px] h-[14px] bg-emerald-400 rounded-sm transform skew-x-[-15deg]"></div>
              </div>
            </div>
            <span className="font-semibold text-xl tracking-tight text-white/95">Mirai</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-white/70">
            <Link href="#product" className="hover:text-white transition-colors">Product</Link>
            <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
            <Link href="#resources" className="hover:text-white transition-colors">Resources</Link>
            <Link href="#customers" className="hover:text-white transition-colors">Customers</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#docs" className="hover:text-white transition-colors">Docs</Link>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/signin" className="text-white/80 hover:text-white hidden sm:block transition-colors">
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-1.5 flex items-center gap-1.5 transition-all text-sm border border-white/5"
            >
              Sign Up
              <div className="bg-[#9AFA5A] text-black rounded-full p-0.5">
                <ArrowUpRight className="size-3" strokeWidth={3} />
              </div>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 md:pt-48 pb-10 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        
        {/* Glowing backdrop effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#9AFA5A]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        <h1 className="max-w-4xl font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.05]">
          <span className="text-[#9AFA5A]">Bug orchestration</span><br />
          that developers love
        </h1>
        
        <p className="mt-8 max-w-2xl text-lg md:text-xl text-white/60 leading-relaxed font-medium">
          Run analysis, automated patching, and batch bug processing with sub-second cold starts, instant validation, and a developer experience that feels local.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link 
            href="/dashboard" 
            className="bg-[#9AFA5A] text-black hover:bg-[#85e04b] transition-colors rounded-full px-6 py-2.5 font-semibold text-sm sm:text-base border border-[#9AFA5A]"
          >
            Get Started
          </Link>
          <Link 
            href="/contact" 
            className="border border-[#384333] hover:border-[#9AFA5A]/50 hover:bg-[#9AFA5A]/5 transition-colors rounded-full px-6 py-2.5 font-semibold text-[#9AFA5A] text-sm sm:text-base backdrop-blur-sm bg-black/40"
          >
            Contact Us
          </Link>
        </div>

        {/* The Glowing Cube Element */}
        <div className="mt-20 relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
          {/* Intense Outer Glow */}
          <div className="absolute inset-0 bg-[#9AFA5A]/40 blur-[100px] rounded-full mix-blend-screen animate-glow-pulse"></div>
          
          {/* Cube Simulation */}
          <div className="relative w-64 h-64 rounded-[2.5rem] bg-gradient-to-br from-[#E6FFCD] via-[#9AFA5A] to-[#123908] animate-cube-rotate"
               style={{
                 boxShadow: 'inset 0 4px 30px rgba(255,255,255,0.7), inset 0 -4px 30px rgba(0,0,0,0.5), 0 0 100px rgba(154,250,90,0.5), 0 30px 60px rgba(0,0,0,0.9)',
               }}
          >
            {/* Top highlight */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-[2.5rem]"></div>
          </div>
        </div>

      </section>

      {/* Logo Row */}
      <section className="w-full mt-24 mb-10 border-y border-white/5 bg-transparent">
        <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-white/5 border-x-0">
          {['scale', 'Quora', 'substack', 'Meta', 'Lovable', 'Mistral AI'].map((logo, i) => (
            <div key={i} className="py-8 px-4 flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all">
              <span className="font-display font-bold text-lg md:text-xl tracking-wide">
                {logo === 'Meta' ? '∞ Meta' : 
                 logo === 'Lovable' ? '♥ Lovable' : 
                 logo === 'substack' ? '≡ substack' :
                 logo}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Animated Terminal Section */}
      <section className="relative z-10 w-full max-w-5xl lg:max-w-6xl mx-auto mt-28 px-4">
        <div className="rounded-2xl border border-white/10 bg-[#000000] overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#9AFA5A]/5 to-transparent pointer-events-none"></div>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#0a0a0a]">
            <div className="flex gap-2.5 pl-2">
              <div className="w-3.5 h-3.5 rounded-full bg-white/10"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-white/10"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-white/10"></div>
            </div>
            <div className="text-sm text-white/40 font-mono tracking-wider">mastra-workflow.ts</div>
            <div className="w-12"></div>
          </div>
          {/* Editor Body */}
          <div className="p-8 md:p-12 font-mono text-base md:text-lg leading-relaxed overflow-x-auto text-white/70">
            <div className="text-white/30 mb-6">// Automatically fixing a runtime issue detected in production</div>
            <div className="flex mb-1">
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">1</span>
              <span><span className="text-pink-400">import</span> { '{' } patchAgent { '}' } <span className="text-pink-400">from</span> <span className="text-emerald-200">'@mastra/core'</span>;</span>
            </div>
            <div className="flex mb-1">
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">2</span>
              <span></span>
            </div>
            <div className="flex mb-1">
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">3</span>
              <span><span className="text-pink-400">const</span> result = <span className="text-pink-400">await</span> patchAgent.run({ '{' }</span>
            </div>
            <div className="flex mb-1">
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">4</span>
              <span>  traceId: <span className="text-emerald-200">'err_prod_89x12'</span>,</span>
            </div>
            <div className="flex mb-1">
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">5</span>
              <span>  autoMerge: <span className="text-purple-400">true</span></span>
            </div>
            <div className="flex mb-1">
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">6</span>
              <span>{ '}' });</span>
            </div>
            <div className="flex mb-1">
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">7</span>
              <span></span>
            </div>
            <div className="flex mb-1 opacity-0 animate-fade-in" style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}>
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">8</span>
              <span className="text-[#9AFA5A]">// ✓ Found TypeError in auth/login.tsx</span>
            </div>
            <div className="flex mb-1 opacity-0 animate-fade-in" style={{ animationDelay: '3s', animationFillMode: 'forwards' }}>
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">9</span>
              <span className="text-[#9AFA5A]">// ✓ Generated fix with 99.8% confidence</span>
            </div>
            <div className="flex mb-1 opacity-0 animate-fade-in" style={{ animationDelay: '4.5s', animationFillMode: 'forwards' }}>
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">10</span>
              <span className="text-[#9AFA5A]">// ✓ PR #412 created and merged</span>
            </div>
            <div className="flex mt-3">
              <span className="text-emerald-400/50 w-8 inline-block select-none text-right mr-6">11</span>
              <span className="w-3 h-6 bg-[#9AFA5A] animate-pulse"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Marquee */}
      <section id="product" className="relative z-10 w-full mt-32 shadow-[0_0_120px_rgba(154,250,90,0.03)] focus:outline-none overflow-hidden">
        <div className="text-center mb-16 px-4">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">Everything you need to <span className="text-[#9AFA5A]">squash bugs</span></h2>
          <p className="mt-4 text-white/50 text-xl font-medium max-w-2xl mx-auto leading-relaxed">From capturing the trace to merging the PR, Mirai handles the entire lifecycle automatically.</p>
        </div>
        
        <div className="relative flex w-full overflow-hidden group">
          {/* Fading Edges for the Marquee */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#000000] to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#000000] to-transparent z-20 pointer-events-none"></div>

          {/* Marquee Track */}
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {[0, 1].map((setIndex) => (
              <div key={setIndex} className="flex gap-6 px-3">
                {/* Card 1: Log Ingestion */}
                <div className="group/card relative overflow-hidden rounded-xl bg-[#111] border border-white/5 transition-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#9AFA5A]/10 flex flex-col h-[400px] w-[320px] md:w-[400px] shrink-0">
                   <div className="p-6 pb-0 flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-semibold text-white">Log Ingestion</h3>
                        <p className="text-white/40 text-base mt-1">Capture & normalize</p>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-[#9AFA5A] opacity-80 flex items-center justify-center shadow-lg shadow-[#9AFA5A]/20"></div>
                   </div>
                   <div className="mt-auto w-full h-[60%] border-t border-white/5 relative overflow-hidden bg-[#0d0d0d] flex items-center justify-center">
                     <span className="text-white/20 text-xs absolute z-0">/images/feature-logs.png</span>
                     {/* <Image 
                       src="/images/feature-logs.png" 
                       alt="Log Ingestion" 
                       width={396} 
                       height={396} 
                       className="w-full h-full object-cover relative z-10" 
                     /> */}
                   </div>
                </div>

                {/* Card 2: Patch Workflows */}
                <div className="group/card relative overflow-hidden rounded-xl bg-[#f5f5f5] border border-white/5 transition-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#9AFA5A]/10 flex flex-col h-[400px] w-[320px] md:w-[400px] shrink-0">
                   <div className="p-6 pb-0 flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-semibold text-black">Patch Workflows</h3>
                        <p className="text-black/50 text-base mt-1">Mastra AI agents</p>
                     </div>
                     <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center shadow-sm">
                       <Sparkles className="w-4 h-4 text-black" />
                     </div>
                   </div>
                   <div className="mt-auto w-full h-[60%] border-t border-black/5 relative overflow-hidden bg-white flex items-center justify-center">
                     <span className="text-black/20 text-xs absolute z-0">/images/feature-patch.png</span>
                     {/* <Image 
                       src="/images/feature-patch.png" 
                       alt="Patch Workflows" 
                       width={396} 
                       height={396} 
                       className="w-full h-full object-cover relative z-10" 
                     /> */}
                   </div>
                </div>

                {/* Card 3: Validation */}
                <div className="group/card relative overflow-hidden rounded-xl bg-white border border-white/5 transition-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#9AFA5A]/10 flex flex-col h-[400px] w-[320px] md:w-[400px] shrink-0">
                   <div className="p-6 pb-0 flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-semibold text-black">Validation</h3>
                        <p className="text-black/50 text-base mt-1">Zero-shot confidence</p>
                     </div>
                     <div className="w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">✓</div>
                   </div>
                   <div className="mt-auto w-full h-[60%] border-t border-black/5 relative overflow-hidden bg-white flex items-center justify-center">
                     <span className="text-black/20 text-xs absolute z-0">/images/feature-validation.png</span>
                     {/* <Image 
                       src="/images/feature-validation.png" 
                       alt="Validation" 
                       width={396} 
                       height={396} 
                       className="w-full h-full object-cover relative z-10" 
                     /> */}
                   </div>
                </div>

                {/* Card 4: Native GitHub Sync */}
                <div className="group/card relative overflow-hidden rounded-xl bg-[#111] border border-white/5 transition-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#9AFA5A]/10 flex flex-col h-[400px] w-[320px] md:w-[400px] shrink-0">
                   <div className="p-6 pb-0 flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-semibold text-white">GitHub Sync</h3>
                        <p className="text-white/40 text-base mt-1">Real-time PR sync</p>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-[#2da44e] flex items-center justify-center shadow-lg shadow-[#2da44e]/20">
                       <GitBranch className="w-4 h-4 text-white" />
                     </div>
                   </div>
                   <div className="mt-auto w-full h-[60%] border-t border-white/5 relative overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
                     <span className="text-white/20 text-xs absolute z-0">/images/feature-github.png</span>
                     {/* <Image 
                       src="/images/feature-github.png" 
                       alt="GitHub Sync" 
                       width={396} 
                       height={396} 
                       className="w-full h-full object-cover relative z-10" 
                     /> */}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Stats */}
      <section className="relative w-full max-w-6xl mx-auto mt-32 px-4 mb-20 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-12 gap-y-8 rounded-[3rem] bg-[#1C1D1A]/50 backdrop-blur-md border border-white/10 px-12 py-10 shadow-2xl shadow-[#9AFA5A]/5">
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-display font-semibold text-[#9AFA5A]">1s</span>
            <span className="text-white/50 text-sm md:text-base font-semibold tracking-wider uppercase mt-2">Cold Start Time</span>
          </div>
          <div className="w-px h-16 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-display font-semibold text-white">99.9%</span>
            <span className="text-white/50 text-sm md:text-base font-semibold tracking-wider uppercase mt-2">Validation Confidence</span>
          </div>
          <div className="w-px h-16 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-display font-semibold text-[#9AFA5A]">10x</span>
            <span className="text-white/50 text-sm md:text-base font-semibold tracking-wider uppercase mt-2">Faster Incident Resolving</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative w-full mt-10 border-t border-white/5 bg-gradient-to-b from-[#0a0f08] to-[#040803] pt-28 pb-32 text-center px-4 overflow-hidden">
        {/* Glow behind CTA */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[400px] bg-[#9AFA5A]/10 rounded-[100%] blur-[100px] pointer-events-none"></div>
        
        <h2 className="text-4xl md:text-6xl font-display font-semibold mb-6 tracking-tight text-white relative z-10">
          Ready to squash bugs <span className="text-[#9AFA5A]">faster?</span>
        </h2>
        <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-10 relative z-10 font-medium">
          Stop deciphering complex logs manually. Let Mirai orchestrate fixes, validate patches, and keep your production healthy.
        </p>
        <div className="relative z-10">
          <Link 
            href="/signup" 
            className="inline-block bg-[#9AFA5A] text-black hover:bg-[#85e04b] transition-colors rounded-full px-8 py-4 font-semibold text-lg border border-[#9AFA5A] shadow-[0_0_30px_rgba(154,250,90,0.3)] hover:shadow-[0_0_40px_rgba(154,250,90,0.5)] transform hover:-translate-y-1"
          >
            Start Building for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#0a0a0a] border-t border-white/5 pt-20 pb-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          
          <div className="flex flex-col gap-6 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-0.5 items-center">
                <div className="flex gap-[2px]">
                  <div className="w-[10px] h-[14px] bg-[#9AFA5A] rounded-sm transform skew-x-[-15deg]"></div>
                  <div className="w-[10px] h-[14px] bg-emerald-700/50 rounded-sm transform skew-x-[-15deg]"></div>
                </div>
              </div>
              <span className="font-semibold text-lg tracking-tight text-white/90">Mirai</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Bug orchestration for high-velocity teams. Mirai turns broken runtime signals into instantly actionable fixes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 sm:gap-16 lg:gap-24">
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white/90 text-sm">Product</h4>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Features</Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Integrations</Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Pricing</Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Changelog</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white/90 text-sm">Resources</h4>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Documentation</Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">API Reference</Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Community</Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Blog</Link>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-white/90 text-sm">Company</h4>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">About Us</Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Careers</Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              <Link href="#" className="text-white/50 hover:text-white transition-colors text-sm">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© 2026 Mirai Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-white/30 hover:text-white transition-colors text-xs">Twitter</Link>
            <Link href="#" className="text-white/30 hover:text-white transition-colors text-xs">GitHub</Link>
            <Link href="#" className="text-white/30 hover:text-white transition-colors text-xs">Discord</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}

