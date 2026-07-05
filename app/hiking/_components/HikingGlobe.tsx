"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import Globe from "globe.gl";
import type { HikePin } from "@/lib/hikes";

// Two accent colours from the site palette, mapped by range.
const RANGE_COLOR: Record<HikePin["range"], string> = {
  Himalaya: "#3B82F6", // cool blue — snow/high altitude
  Sahyadri: "#4E8A5E", // sage green — the Western Ghats
};

// Theme-aware globe surface colours (three.js needs plain hex, not CSS vars).
function palette(dark: boolean) {
  return dark
    ? { ocean: "#211F1B", land: "#4A463D", atmosphere: "#3B82F6" }
    : { ocean: "#E4DBC5", land: "#B7AB8C", atmosphere: "#6AA9E9" };
}

function isDark() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

export default function HikingGlobe({ pins }: { pins: HikePin[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let disposed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let world: any;
    let ro: ResizeObserver | undefined;
    let mo: MutationObserver | undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const world_ = new (Globe as any)(el, { animateIn: true });
    world = world_;

    const applyTheme = () => {
      const p = palette(isDark());
      world.hexPolygonColor(() => p.land).atmosphereColor(p.atmosphere);
      const mat = world.globeMaterial() as THREE.MeshPhongMaterial;
      mat.color = new THREE.Color(p.ocean);
      mat.needsUpdate = true;
    };

    world
      .backgroundColor("rgba(0,0,0,0)")
      .showGlobe(true)
      .showGraticules(false)
      .showAtmosphere(true)
      .atmosphereAltitude(0.16)
      // Pins
      .pointsData(pins)
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude(0.012)
      .pointColor((d: object) => RANGE_COLOR[(d as HikePin).range])
      // Subtle scale by visits — Karnala (12+) reads heavier than one-offs, but not by much.
      .pointRadius((d: object) => 0.3 + Math.min((d as HikePin).visits, 5) * 0.08)
      .pointLabel((d: object) => {
        const h = d as HikePin;
        return `<div style="font-family:system-ui;font-size:12px;padding:4px 8px;background:rgba(20,18,16,0.9);color:#fff;border-radius:6px;white-space:nowrap">
          <strong>${h.name}</strong><br/><span style="opacity:0.7">${h.subRegion}</span>
        </div>`;
      })
      .onPointClick((d: object) => {
        const h = d as HikePin;
        router.push(`/hiking/${h.slug}`);
        // lower altitude = closer. 0.35 flies in; do NOT use 1.5 (that pulls away).
        world.pointOfView({ lat: h.lat, lng: h.lng, altitude: 0.35 }, 1800);
      });

    // Dotted continents from the self-hosted geojson.
    fetch("/geo/countries-110m.geojson")
      .then((r) => r.json())
      .then((geo) => {
        if (disposed) return;
        world
          .hexPolygonsData(geo.features)
          .hexPolygonResolution(3)
          .hexPolygonMargin(0.35)
          .hexPolygonUseDots(true)
          .hexPolygonAltitude(0.003)
          .hexPolygonColor(() => palette(isDark()).land);
      })
      .catch(() => {});

    applyTheme();

    // Start focused on India (all hikes are there), slightly tilted.
    world.pointOfView({ lat: 21, lng: 78, altitude: 1.9 }, 0);

    // Idle auto-rotate; pause the moment the user grabs the globe.
    const controls = world.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableZoom = true;
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
    });

    // Size to container.
    const resize = () => {
      if (!el) return;
      world.width(el.clientWidth).height(el.clientHeight);
    };
    resize();
    ro = new ResizeObserver(resize);
    ro.observe(el);

    // Recolour on light/dark toggle.
    mo = new MutationObserver(applyTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      disposed = true;
      ro?.disconnect();
      mo?.disconnect();
      try {
        world._destructor?.();
      } catch {
        /* noop */
      }
      if (el) el.innerHTML = "";
    };
  }, [pins, router]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} aria-hidden="true" />;
}
