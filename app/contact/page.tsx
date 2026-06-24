"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RevealWrapper from "@/components/RevealWrapper";

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;
const BOOKING_URL  = process.env.NEXT_PUBLIC_BOOKING_URL;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "var(--surface-subtle)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-control)",
  color: "var(--text-primary)",
  fontSize: 15,
  fontFamily: "var(--font-sans)",
  outline: "none",
  transition: "border-color 160ms ease",
};

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!FORMSPREE_ID) return;

    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <RevealWrapper>
      <Nav />
      <main>
        <div style={{ padding: "clamp(4rem, 8vw, 7rem) 0" }}>
          <div className="container-page" style={{ maxWidth: 560 }}>
            <h1
              data-reveal
              style={{
                fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "var(--text-primary)",
                margin: "0 0 0.75rem",
              }}
            >
              Contact
            </h1>
            <p data-reveal data-stagger="80" style={{ fontSize: 17, color: "var(--text-secondary)", margin: "0 0 2.5rem" }}>
              Open to product roles, advisory conversations, and interesting problems in fintech and AI.
            </p>

            {/* Book a meeting CTA */}
            {BOOKING_URL && (
              <div data-reveal data-stagger="160" style={{ marginBottom: "2.5rem", padding: "1.25rem", background: "var(--surface-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 0.75rem" }}>
                  Prefer a quick call?
                </p>
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "var(--accent)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 500,
                    padding: "0.6rem 1.25rem",
                    borderRadius: "var(--radius-control)",
                    textDecoration: "none",
                  }}
                >
                  Book a meeting
                </a>
              </div>
            )}

            {/* Form */}
            <div data-reveal data-stagger="240">
              {status === "success" ? (
                <div
                  style={{
                    padding: "1.5rem",
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 15,
                    color: "var(--text-secondary)",
                    lineHeight: 1.65,
                  }}
                >
                  <strong style={{ color: "var(--text-primary)" }}>Message sent.</strong>{" "}
                  I&apos;ll get back to you within a day or two.
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                      Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      style={inputStyle}
                      onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "var(--accent)")}
                      onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "var(--border-default)")}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      style={inputStyle}
                      onFocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "var(--accent)")}
                      onBlur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = "var(--border-default)")}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                      Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      placeholder="What's on your mind?"
                      style={{ ...inputStyle, resize: "vertical", minHeight: 140 }}
                      onFocus={(e) => ((e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--accent)")}
                      onBlur={(e) => ((e.currentTarget as HTMLTextAreaElement).style.borderColor = "var(--border-default)")}
                    />
                  </div>

                  {status === "error" && (
                    <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>
                      Something went wrong. Try emailing me directly at chrisamattam@gmail.com.
                    </p>
                  )}

                  {!FORMSPREE_ID ? (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      Form not configured. Email me at chrisamattam@gmail.com.
                    </p>
                  ) : (
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      style={{
                        background: "var(--accent)",
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 500,
                        padding: "0.75rem 1.5rem",
                        borderRadius: "var(--radius-control)",
                        border: "none",
                        cursor: status === "sending" ? "not-allowed" : "pointer",
                        opacity: status === "sending" ? 0.7 : 1,
                        alignSelf: "flex-start",
                        fontFamily: "var(--font-sans)",
                        transition: "background 160ms ease",
                      }}
                    >
                      {status === "sending" ? "Sending…" : "Send message"}
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </RevealWrapper>
  );
}
