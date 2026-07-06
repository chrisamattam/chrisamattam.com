"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

// Hardcoded first message — disclosure + opener + logging note, shown once,
// zero API cost, guaranteed before any real exchange.
const OPENER: Msg = {
  role: "assistant",
  content:
    "Hi — I'm an AI clone of Chris. I can answer questions about his work, writing, reading, and hikes, using only what's published on this site — and I can make mistakes, so anything important is worth verifying on the page I point you to. Conversations are logged so Chris can improve the site. What would you like to know?",
};

// Render inline [text](/path) links (internal → Next Link) and plain text.
function renderContent(text: string) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\((\/[^)]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={i++} href={m[2]} style={{ color: "var(--text-link)", textUnderlineOffset: 3 }}>
        {m[1]}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Msg[]>([OPENER]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);

    // History for the model = the real exchange, minus the client-only opener.
    const history = messages.filter((m) => m !== OPENER);
    const next = [...messages, { role: "user" as const, content: text }, { role: "assistant" as const, content: "" }];
    setMessages(next);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: "Something went wrong — try again." };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "calc(100dvh - 6rem)" }}>
      <div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>
          Preview · AI clone
        </p>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.9rem", paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? "var(--accent)" : "var(--surface-subtle)",
              color: m.role === "user" ? "#fff" : "var(--text-primary)",
              border: m.role === "user" ? "none" : "1px solid var(--border-subtle)",
              borderRadius: 14,
              padding: "0.6rem 0.9rem",
              fontSize: 15,
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
            }}
          >
            {m.role === "assistant" ? renderContent(m.content) : m.content}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        style={{ display: "flex", gap: "0.5rem" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Ask about Chris's work, writing, or hikes…"
          style={{
            flex: 1,
            padding: "0.7rem 0.9rem",
            fontSize: 15,
            borderRadius: 12,
            border: "1px solid var(--border-default)",
            background: "var(--surface-page)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          style={{
            padding: "0 1.1rem",
            borderRadius: 12,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 500,
            cursor: busy ? "default" : "pointer",
            opacity: busy || !input.trim() ? 0.55 : 1,
          }}
        >
          {busy ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
