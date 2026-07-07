import type { Metadata } from "next";
import ChatClient from "./ChatClient";

// Unlinked test harness — never indexed, form factor still undecided.
export const metadata: Metadata = {
  title: "Chat (preview)",
  robots: { index: false, follow: false },
};

export default function ChatPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(1.5rem, 4vw, 3rem) 1rem", minHeight: "100dvh" }}>
      <ChatClient />
    </main>
  );
}
