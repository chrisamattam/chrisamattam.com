"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HikeDetail from "./HikeDetail";
import type { Hike } from "@/lib/hikes";

export default function HikeOverlay({ hike }: { hike: Hike }) {
  const router = useRouter();
  const close = () => router.back();

  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      {/* Scrim */}
      <div
        onClick={close}
        style={{ position: "absolute", inset: 0, background: "rgba(10,9,8,0.45)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={hike.name}
        style={{
          position: "relative",
          width: "min(560px, 100%)",
          height: "100%",
          overflowY: "auto",
          background: "var(--surface-page)",
          borderLeft: "1px solid var(--border-subtle)",
          boxShadow: "-24px 0 60px -30px rgba(0,0,0,0.5)",
          padding: "clamp(1.5rem, 3vw, 2.5rem)",
          animation: "hikeSlideIn 0.36s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "sticky",
            top: 0,
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-default)",
            background: "var(--surface-page)",
            color: "var(--text-primary)",
            cursor: "pointer",
            float: "right",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6l-12 12" />
          </svg>
        </button>

        <HikeDetail hike={hike} />
      </div>

      <style>{`@keyframes hikeSlideIn { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`}</style>
    </div>
  );
}
