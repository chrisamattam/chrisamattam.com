"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { REGION_LABEL, type HikePin, type Region } from "@/lib/hikes";
import type { GlobeController } from "./HikingGlobe";

const HikingGlobe = dynamic(() => import("./HikingGlobe"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
      loading globe…
    </div>
  ),
});

const REGION_COLOR: Record<Region, string> = { himalaya: "#3B82F6", sahyadri: "#4E8A5E" };

// Matches the globe markers: triangle = Himalaya, circle = Sahyadri.
function RegionMark({ region, size = 11 }: { region: Region; size?: number }) {
  const c = REGION_COLOR[region];
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" style={{ display: "block", flexShrink: 0 }} aria-hidden="true">
      {region === "himalaya" ? (
        <path d="M6 1 L11 10.5 L1 10.5 Z" fill={c} strokeLinejoin="round" />
      ) : (
        <circle cx="6" cy="6" r="5" fill={c} />
      )}
    </svg>
  );
}

function LegendDot({ region }: { region: Region }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      <RegionMark region={region} size={11} />
      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{REGION_LABEL[region]}</span>
    </span>
  );
}

export default function HikingExplorer({ pins }: { pins: HikePin[] }) {
  const controller = useRef<GlobeController | null>(null);
  const router = useRouter();

  const byRegion: Record<Region, HikePin[]> = {
    himalaya: pins.filter((p) => p.region === "himalaya"),
    sahyadri: pins.filter((p) => p.region === "sahyadri"),
  };

  // Fly the globe to the hike first, then open the detail once the camera
  // has arrived (~1.4s) — so you actually see the zoom-in before the panel.
  const focusThenOpen = (p: HikePin) => {
    controller.current?.flyTo(p.lat, p.lng, 0.45);
    window.setTimeout(() => router.push(`/hiking/${p.slug}`), 1400);
  };

  // Returning from a hike page via ?focus=<slug> re-centers the globe on it.
  useEffect(() => {
    const focus = new URLSearchParams(window.location.search).get("focus");
    if (!focus) return;
    const pin = pins.find((p) => p.slug === focus);
    if (!pin) return;
    let tries = 0;
    const id = window.setInterval(() => {
      if (controller.current) {
        controller.current.flyTo(pin.lat, pin.lng, 0.6);
        window.clearInterval(id);
      } else if (++tries > 40) {
        window.clearInterval(id);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [pins]);

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
            <LegendDot region="himalaya" />
            <LegendDot region="sahyadri" />
          </div>
        </div>

        {(["himalaya", "sahyadri"] as const).map((region) => (
          <div key={region} style={{ padding: "0 clamp(1.5rem, 3vw, 2.25rem)", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <RegionMark region={region} size={10} />
              <h2 style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>
                {REGION_LABEL[region]}
              </h2>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                {byRegion[region].length}
              </span>
            </div>

            {byRegion[region].map((p) => (
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
                  {p.area}, {p.state}
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
