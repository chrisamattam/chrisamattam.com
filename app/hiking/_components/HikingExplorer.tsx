"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { HikePin } from "@/lib/hikes";
import type { GlobeController } from "./HikingGlobe";

const HikingGlobe = dynamic(() => import("./HikingGlobe"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
      loading globe…
    </div>
  ),
});

const RANGE_COLOR: Record<HikePin["range"], string> = { Himalaya: "#3B82F6", Sahyadri: "#4E8A5E" };

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block" }} />
      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
    </span>
  );
}

export default function HikingExplorer({ pins }: { pins: HikePin[] }) {
  const controller = useRef<GlobeController | null>(null);
  const router = useRouter();

  const byRange = {
    Himalaya: pins.filter((p) => p.range === "Himalaya"),
    Sahyadri: pins.filter((p) => p.range === "Sahyadri"),
  };

  // Fly the globe to the hike first, then open the detail once the camera
  // has arrived (~1.4s) — so you actually see the zoom-in before the panel.
  const focusThenOpen = (p: HikePin) => {
    controller.current?.flyTo(p.lat, p.lng, 0.45);
    window.setTimeout(() => router.push(`/hiking/${p.slug}`), 1400);
  };

  return (
    <div className="hiking-explorer">
      {/* Track list — the primary way to navigate */}
      <aside className="hiking-list">
        <div style={{ padding: "clamp(1.5rem, 3vw, 2.25rem)" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 0.6rem" }}>
            Hobbies · On foot
          </p>
          <h1 style={{ fontSize: "clamp(1.9rem, 4vw, 2.6rem)", fontWeight: 500, letterSpacing: "-0.03em", color: "var(--text-primary)", margin: "0 0 0.6rem" }}>
            Hiking
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 1rem", lineHeight: 1.6 }}>
            Every hike and trek I&apos;ve done. Pick one from the list to fly there on the globe and read the account.
          </p>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <LegendDot color={RANGE_COLOR.Himalaya} label="Himalaya" />
            <LegendDot color={RANGE_COLOR.Sahyadri} label="Sahyadri" />
          </div>
        </div>

        {(["Himalaya", "Sahyadri"] as const).map((range) => (
          <div key={range} style={{ padding: "0 clamp(1.5rem, 3vw, 2.25rem)", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: RANGE_COLOR[range] }} />
              <h2 style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>
                {range}
              </h2>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                {byRange[range].length}
              </span>
            </div>

            {byRange[range].map((p) => (
              <Link
                key={p.slug}
                href={`/hiking/${p.slug}`}
                onClick={(e) => {
                  // With JS: fly first, then open. Without JS: the href still works.
                  e.preventDefault();
                  focusThenOpen(p);
                }}
                className="hiking-track"
              >
                <span style={{ fontSize: 14.5, color: "var(--text-primary)", fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-muted)" }}>
                  {p.subRegion}
                  {p.visits > 1 ? ` · ${p.visitsLabel ?? p.visits}×` : ""}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </aside>

      {/* Globe */}
      <div className="hiking-globe-pane">
        <HikingGlobe pins={pins} controllerRef={controller} onOpen={focusThenOpen} />
      </div>
    </div>
  );
}
