import { createOpenAI } from "@ai-sdk/openai";

import { env } from "@/lib/env";

export const isGroqConfigured = Boolean(env.GROQ_API_KEY);

const groq = createOpenAI({
  apiKey: env.GROQ_API_KEY,
  baseURL: env.GROQ_BASE_URL,
});

export function getGroqModel() {
  return groq(env.GROQ_MODEL);
}
