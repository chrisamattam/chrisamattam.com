import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getLLM, LLM_MODEL, llmConfigured } from "@/lib/llm";
import { buildSystemPrompt } from "@/lib/chatPrompt";

export const runtime = "nodejs";

const MAX_MESSAGE = 1000;
const MAX_TOKENS = 700;
const MAX_HISTORY = 20;

// Best-effort in-memory guards (v1). Real persistence + the spend/turn ledger
// move to Supabase in the hardening pass; free inference means no $ blast radius,
// so these exist to curb abuse and stay within the provider's free rate limits.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 6; // messages/min per session
const TURN_MAX = 20; // user messages per session
const buckets = new Map<string, { hits: number[]; turns: number }>();

const CANNED = {
  unconfigured: "The chatbot isn't switched on yet — but the site itself has everything it knows.",
  rate: "One at a time — give me a few seconds between messages.",
  turns:
    "I've hit my conversation limit — everything I know is on the site itself. Try Work, Writing, or Hiking, or reach Chris via the contact page.",
  error: "I'm having trouble thinking right now — the site itself is fully awake, though.",
};

function textStream(text: string): Response {
  const body = new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode(text));
      c.close();
    },
  });
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

type ClientMsg = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  if (!llmConfigured()) return textStream(CANNED.unconfigured);

  let payload: { message?: unknown; history?: unknown };
  try {
    payload = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  if (!message || message.length > MAX_MESSAGE) {
    return new Response("message must be 1–1000 characters", { status: 400 });
  }

  // Session cookie (best-effort identity; a cleared cookie is bounded by the caps).
  let sid = req.cookies.get("cbsid")?.value;
  const setCookie = !sid;
  if (!sid) sid = randomUUID();

  // Rate + turn guards
  const now = Date.now();
  const b = buckets.get(sid) ?? { hits: [], turns: 0 };
  b.hits = b.hits.filter((t) => now - t < RATE_WINDOW_MS);
  if (b.hits.length >= RATE_MAX) return textStream(CANNED.rate);
  if (b.turns >= TURN_MAX) return textStream(CANNED.turns);
  b.hits.push(now);
  b.turns += 1;
  buckets.set(sid, b);

  // v1: history comes from the client (to be replaced by server-owned history
  // once Supabase lands — that closes the forged-history injection vector).
  const rawHistory = Array.isArray(payload.history) ? (payload.history as ClientMsg[]) : [];
  const history = rawHistory
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  const system = await buildSystemPrompt();

  let completion;
  try {
    completion = await getLLM().chat.completions.create({
      model: LLM_MODEL,
      max_tokens: MAX_TOKENS,
      stream: true,
      messages: [{ role: "system", content: system }, ...history, { role: "user", content: message }],
    });
  } catch {
    return textStream(CANNED.error);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(enc.encode(delta));
        }
      } catch {
        controller.enqueue(enc.encode("\n\n(connection dropped — ask again)"));
      } finally {
        controller.close();
      }
    },
  });

  const headers = new Headers({ "content-type": "text/plain; charset=utf-8" });
  if (setCookie) {
    headers.append(
      "set-cookie",
      `cbsid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    );
  }
  return new Response(stream, { headers });
}
