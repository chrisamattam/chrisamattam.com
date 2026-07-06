import OpenAI from "openai";

/**
 * Provider-agnostic inference seam. Defaults to Groq (free, OpenAI-compatible,
 * doesn't train on inputs). Swap to Gemini / OpenRouter / etc. purely via env:
 *   LLM_BASE_URL, LLM_API_KEY (or GROQ_API_KEY), LLM_MODEL
 */
const BASE_URL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const API_KEY = process.env.LLM_API_KEY || process.env.GROQ_API_KEY || "";

export const LLM_MODEL = process.env.LLM_MODEL || "llama-3.3-70b-versatile";

export function llmConfigured(): boolean {
  return API_KEY.length > 0;
}

let client: OpenAI | null = null;
export function getLLM(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: API_KEY, baseURL: BASE_URL });
  return client;
}
