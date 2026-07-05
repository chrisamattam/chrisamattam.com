"use client";

import dynamic from "next/dynamic";
import type { HikePin } from "@/lib/hikes";

// globe.gl touches `window`, so it can only load client-side.
const HikingGlobe = dynamic(() => import("./HikingGlobe"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        letterSpacing: "0.06em",
      }}
    >
      loading globe…
    </div>
  ),
});

export default function GlobeMount({ pins }: { pins: HikePin[] }) {
  return <HikingGlobe pins={pins} />;
}
