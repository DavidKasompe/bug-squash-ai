import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

import { env } from "@/lib/env";

export type BugAnalysisInput = {
  logSnippet: string;
  repository?: string;
  branch?: string;
};

export type BugAnalysisResult = {
  summary: string;
  probableCause: string;
  suggestedNextAction: string;
};

const bugAnalysisAgent =
  env.OPENAI_API_KEY
    ? new Agent({
        name: "miraiBugAnalysis",
        instructions: `
You analyze application logs and produce concise engineering output.
Return:
- a summary of the issue
- the most probable root cause
- the best next action for a developer
Keep the answer grounded in the provided log snippet and repository context.
        `.trim(),
        model: openai("gpt-4o-mini"),
      })
    : null;

export async function runBugAnalysisWorkflow(input: BugAnalysisInput): Promise<BugAnalysisResult> {
  if (bugAnalysisAgent && input.logSnippet.trim()) {
    const prompt = [
      `Repository: ${input.repository ?? "unknown"}`,
      `Branch: ${input.branch ?? "unknown"}`,
      "Log snippet:",
      input.logSnippet,
      'Respond as JSON with keys "summary", "probableCause", and "suggestedNextAction".',
    ].join("\n\n");

    const response = await bugAnalysisAgent.generate(prompt);

    try {
      return JSON.parse(response.text) as BugAnalysisResult;
    } catch {
      return {
        summary: response.text,
        probableCause: "The model response was not JSON; inspect the generated summary.",
        suggestedNextAction: "Tighten the output schema or add structured extraction before production use.",
      };
    }
  }

  const summary = input.logSnippet.trim()
    ? "Mastra is wired, but no provider key is configured. Using fallback analysis output."
    : "No log snippet was provided.";

  return {
    summary,
    probableCause: "Provider credentials or runtime setup are missing for live Mastra execution.",
    suggestedNextAction: "Set OPENAI_API_KEY and retry analysis through the Mirai API.",
  };
}
