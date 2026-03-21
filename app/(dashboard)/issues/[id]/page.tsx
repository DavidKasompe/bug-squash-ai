import Link from "next/link";
import { ArrowLeft, AlertTriangle, GitMerge, FileCode2, Copy, Brain, CheckCircle2, TestTube2, ChevronRight, Send } from "lucide-react";

// RIGHT PREVIEW PANEL
function AIPreviewPanel({ bugId }: { bugId: string }) {
  return (
    <>
      {/* Panel Header */}
      <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Brain className="w-4 h-4 text-black/40" />
          <span className="font-semibold text-sm">Agent View</span>
          <span className="flex items-center gap-1 bg-[#2A6948]/10 text-[#2A6948] text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2A6948] animate-pulse inline-block" />
            Analyzing
          </span>
        </div>
      </div>

      {/* Chat-style agent messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Root cause message */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 bg-[#F5F4F0] rounded-2xl rounded-tl-sm p-4">
            <p className="text-xs font-bold text-[#2A6948] mb-2 uppercase tracking-wider">Root Cause</p>
            <p className="text-sm text-[#111111] leading-relaxed">
              The <code className="bg-black/[0.06] px-1 py-0.5 rounded text-xs font-mono">resumeCheckoutSession</code> function reads <code className="bg-black/[0.06] px-1 py-0.5 rounded text-xs font-mono">req.session.id</code> directly, but after a token refresh the session context is rebuilt from scratch — making <code className="bg-black/[0.06] px-1 py-0.5 rounded text-xs font-mono">req.session</code> transiently null before rehydration completes.
            </p>
          </div>
        </div>

        {/* Fix steps */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 bg-[#F5F4F0] rounded-2xl rounded-tl-sm p-4">
            <p className="text-xs font-bold text-[#2A6948] mb-3 uppercase tracking-wider">Fix Applied</p>
            <div className="space-y-2">
              {[
                "Extract sessionId from the JWT payload directly",
                "Guard against null session before proceeding",
                "Fallback: rehydrate from order snapshot if session is missing",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2A6948] shrink-0 mt-0.5" />
                  <span className="text-xs text-[#111111] leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generated tests */}
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[#2A6948] flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 bg-[#F5F4F0] rounded-2xl rounded-tl-sm p-4">
            <p className="text-xs font-bold text-[#2A6948] mb-3 uppercase tracking-wider">
              <TestTube2 className="w-3 h-3 inline mr-1" />
              Auto-Generated Tests
            </p>
            {[
              "should return 400 when session is null after token refresh",
              "should rehydrate session from order snapshot if missing",
              "should not call resumeCheckoutSession with stale session id",
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-black/[0.05] last:border-0">
                <div className="w-1 h-1 rounded-full bg-[#2A6948]" />
                <span className="text-xs font-mono text-[#111111]/70">{t}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Chat input */}
      <div className="px-4 py-3 border-t border-black/[0.06] shrink-0">
        <div className="flex items-center gap-2 bg-[#F5F4F0] rounded-xl px-3 py-2.5">
          <input
            type="text"
            placeholder="Ask Mirai about this bug..."
            className="flex-1 bg-transparent text-sm text-[#111111] placeholder:text-black/30 focus:outline-none"
          />
          <button className="w-7 h-7 bg-[#2A6948] rounded-lg flex items-center justify-center hover:bg-[#1E4A31] transition-colors">
            <Send className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </>
  );
}

export default function PatchPreviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-5 pb-16">

      {/* Back + breadcrumb */}
      <div>
        <Link href="/overview" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest">Critical</span>
          <span className="px-2 py-0.5 rounded bg-black/[0.04] text-black/50 text-[10px] font-bold uppercase tracking-widest">Ready</span>
          <span className="text-xs font-mono text-black/30">mirai-labs/checkout-service</span>
        </div>
        <h1 className="text-2xl font-bold text-[#111111] mb-2">Null checkout session during card retry</h1>
        <p className="text-sm text-black/50 leading-relaxed max-w-xl">
          Retry flow drops the checkout session after a token refresh, causing a 500 response.
        </p>
      </div>

      {/* Confidence + suggestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-black/[0.05] rounded-2xl p-5">
          <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">
            <AlertTriangle className="w-3 h-3 inline text-[#2A6948] mr-1" /> Confidence
          </div>
          <div className="text-4xl font-bold text-[#2A6948]">92%</div>
        </div>
        <div className="bg-white border border-black/[0.05] rounded-2xl p-5">
          <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">AI Suggestion</div>
          <p className="text-sm text-[#111111] leading-relaxed">Guard the session lookup and rehydrate from the order snapshot before retrying.</p>
        </div>
      </div>

      {/* Code Diff */}
      <div className="bg-white border border-black/[0.05] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.05] bg-[#F5F4F0]/50">
          <div className="flex items-center gap-2.5">
            <FileCode2 className="w-4 h-4 text-black/30" />
            <span className="font-mono text-xs font-semibold text-[#111111]">src/payments/retry-checkout.ts</span>
          </div>
          <button className="text-xs font-semibold flex items-center gap-1.5 border border-black/[0.08] bg-white px-2.5 py-1.5 rounded-lg hover:bg-black/[0.03] transition-colors">
            <Copy className="w-3 h-3" /> Copy
          </button>
        </div>

        <div className="overflow-x-auto text-xs font-mono leading-7 py-3 whitespace-nowrap">
          <div className="px-5 py-0.5 text-black/30 hover:bg-black/[0.02]"><span className="select-none text-black/20 mr-4 text-right inline-block w-6">112</span>{`export async function resumeCheckoutSession(req: Request) {`}</div>
          <div className="px-5 py-0.5 text-black/30 hover:bg-black/[0.02]"><span className="select-none text-black/20 mr-4 text-right inline-block w-6">113</span>{`  const token = req.headers.get("authorization");`}</div>
          <div className="px-5 py-0.5 bg-red-500/[0.06] text-red-700"><span className="select-none text-red-400 mr-4 font-bold inline-block w-6 text-center">-</span>{`  const session = await db.checkout.findUnique({ id: req.session.id });`}</div>
          <div className="px-5 py-0.5 bg-red-500/[0.06] text-red-700 border-b border-white/5"><span className="select-none text-red-400 mr-4 font-bold inline-block w-6 text-center">-</span>{`  if (!session) throw new Error("500: Missing session");`}</div>
          <div className="px-5 py-0.5 bg-[#2A6948]/[0.07] text-[#1E4A31]"><span className="select-none text-[#2A6948] mr-4 font-bold inline-block w-6 text-center">+</span>{`  const sessionId = extractSessionFromToken(token) || req.session?.id;`}</div>
          <div className="px-5 py-0.5 bg-[#2A6948]/[0.07] text-[#1E4A31]"><span className="select-none text-[#2A6948] mr-4 font-bold inline-block w-6 text-center">+</span>{`  if (!sessionId) {`}</div>
          <div className="px-5 py-0.5 bg-[#2A6948]/[0.07] text-[#1E4A31]"><span className="select-none text-[#2A6948] mr-4 font-bold inline-block w-6 text-center">+</span>{`    return Response.json({ error: "Session expired" }, { status: 400 });`}</div>
          <div className="px-5 py-0.5 bg-[#2A6948]/[0.07] text-[#1E4A31]"><span className="select-none text-[#2A6948] mr-4 font-bold inline-block w-6 text-center">+</span>{`  }`}</div>
          <div className="px-5 py-0.5 bg-[#2A6948]/[0.07] text-[#1E4A31] border-b border-black/[0.03]"><span className="select-none text-[#2A6948] mr-4 font-bold inline-block w-6 text-center">+</span>{`  const session = await db.checkout.findUnique({ id: sessionId }) ?? await rehydrateOrderSnapshot(req.user.id);`}</div>
          <div className="px-5 py-0.5 text-black/30 hover:bg-black/[0.02] pt-1"><span className="select-none text-black/20 mr-4 text-right inline-block w-6">121</span>{`  return activatePaymentFlow(session);`}</div>
          <div className="px-5 py-0.5 text-black/30 hover:bg-black/[0.02]"><span className="select-none text-black/20 mr-4 text-right inline-block w-6">122</span>{`}`}</div>
        </div>

        <div className="px-5 py-4 border-t border-black/[0.05] bg-white flex items-center justify-between gap-4">
          <p className="text-xs text-black/40 font-medium">Applying this patch will open a PR in <span className="font-mono">mirai-labs/checkout-service</span>.</p>
          <button className="bg-[#2A6948] hover:bg-[#1E4A31] text-white rounded-full py-2.5 px-6 flex items-center gap-2 font-bold text-xs transition-colors shadow-lg shadow-[#2A6948]/20 whitespace-nowrap">
            <GitMerge className="w-3.5 h-3.5" /> Merge Pull Request
          </button>
        </div>
      </div>

    </div>
  );
}
