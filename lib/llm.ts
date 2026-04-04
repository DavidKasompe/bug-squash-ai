import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";

import { env } from "@/lib/env";

export const isGroqConfigured = Boolean(env.GROQ_API_KEY);

const groq = createOpenAI({
  apiKey: env.GROQ_API_KEY,
  baseURL: env.GROQ_BASE_URL,
});

export function getGroqModel(): LanguageModelV1 {
  return groq(env.GROQ_MODEL) as LanguageModelV1;
}
