"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import Globe from "globe.gl";
import type { HikePin } from "@/lib/hikes";

export type GlobeController = {
  flyTo: (lat: number, lng: number, altitude?: number) => void;
};

const REGION_COLOR: Record<HikePin["region"], string> = {
  himalaya: "#3B82F6",
  sahyadri: "#4E8A5E",
};

// Tunables
const CLUSTER_PX = 24; // pixel radius within which markers merge
const CLUSTER_THROTTLE_MS = 50; // recompute grouping ~20fps (positions still update every frame)
const ANIM_MS = 200; // spiderfy fan-out / collapse duration
const TOUCH = 44; // min touch target (px), via transparent padding
const GLOBE_RADIUS = 100; // three-globe constant, for occlusion math

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// three-globe's lat/lng → scene-space point (for our own back-of-globe occlusion test).
function polar2Cartesian(lat: number, lng: number, alt = 0) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lng) * Math.PI) / 180;
  const r = GLOBE_RADIUS * (1 + alt);
  return { x: r * Math.sin(phi) * Math.cos(theta), y: r * Math.cos(phi), z: r * Math.sin(phi) * Math.sin(theta) };
}

// SVG shape strings — colour AND shape differ by region (colourblind-safe).
function singleSvg(region: HikePin["region"]) {
  const c = REGION_COLOR[region];
  return region === "himalaya"
    ? `<svg width="18" height="16" viewBox="0 0 18 16"><path d="M9 2 L16.5 14 L1.5 14 Z" fill="${c}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="${c}" stroke="#fff" stroke-width="2"/></svg>`;
}
function badgeSvg(region: HikePin["region"], count: number) {
  const c = REGION_COLOR[region];
  return region === "himalaya"
    ? `<svg width="36" height="32" viewBox="0 0 36 32"><path d="M18 2 L34 29 L2 29 Z" fill="${c}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><text x="18" y="23" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="system-ui,-apple-system,sans-serif">${count}</text></svg>`
    : `<svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="${c}" stroke="#fff" stroke-width="2"/><text x="15" y="15" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="700" fill="#fff" font-family="system-ui,-apple-system,sans-serif">${count}</text></svg>`;
}

type Proj = { x: number; y: number; visible: boolean };
type Group = { id: string; members: string[]; region: HikePin["region"] };

export default function HikingGlobe({
  pins,
  controllerRef,
  onOpen,
}: {
  pins: HikePin[];
  controllerRef?: MutableRefObject<GlobeController | null>;
  onOpen: (pin: HikePin) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const pinBySlug = new Map(pins.map((p) => [p.slug, p]));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const world = new (Globe as any)(el, { animateIn: false })
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl("/textures/earth-blue-marble.jpg")
      .bumpImageUrl("/textures/earth-topology.png")
      .showAtmosphere(true)
      .atmosphereColor("#8Fb9EA")
      .atmosphereAltitude(0.18);
    // NOTE: no .htmlElementsData() — markers are drawn by our own clustering overlay below.

    if (controllerRef) {
      controllerRef.current = {
        flyTo: (lat, lng, altitude = 0.5) => world.pointOfView({ lat, lng, altitude }, 1600),
      };
    }
    world.pointOfView({ lat: 21, lng: 78, altitude: 1.9 }, 0);

    const controls = world.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.enableZoom = true;

    // ── Overlay layer (leader-line SVG + marker/badge DOM), on top of the canvas ──
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:3";
    const svgNS = "http://www.w3.org/2000/svg";
    const leaderSvg = document.createElementNS(svgNS, "svg");
    leaderSvg.setAttribute("style", "position:absolute;inset:0;width:100%;height:100%;pointer-events:none");
    overlay.appendChild(leaderSvg);
    el.appendChild(overlay);

    // Persistent per-pin marker elements (44px touch target, smaller visual centred).
    const markerEls = new Map<string, HTMLDivElement>();
    for (const p of pins) {
      const wrap = document.createElement("div");
      wrap.style.cssText = `position:absolute;left:0;top:0;width:${TOUCH}px;height:${TOUCH}px;display:none;align-items:center;justify-content:center;pointer-events:auto;cursor:pointer`;
      const shape = document.createElement("div");
      shape.style.cssText = "transition:transform 140ms ease;display:flex";
      shape.innerHTML = singleSvg(p.region);
      wrap.appendChild(shape);
      wrap.title = `${p.name} — ${p.area}, ${p.state}`;
      // Clicks are handled by the container hit-test (canvas swallows DOM clicks).
      overlay.appendChild(wrap);
      markerEls.set(p.slug, wrap);
    }

    // Dynamic badge elements, keyed by cluster id.
    const badgeEls = new Map<string, HTMLDivElement>();
    const getBadge = (id: string, region: HikePin["region"], count: number): HTMLDivElement => {
      let b = badgeEls.get(id);
      if (!b) {
        b = document.createElement("div");
        b.style.cssText = `position:absolute;left:0;top:0;width:${TOUCH}px;height:${TOUCH}px;display:none;align-items:center;justify-content:center;pointer-events:auto;cursor:pointer`;
        overlay.appendChild(b);
        badgeEls.set(id, b);
      }
      b.dataset.count = String(count);
      b.innerHTML = badgeSvg(region, count);
      return b;
    };

    // ── Interaction state ──
    let openId: string | null = null;
    let openTarget = false;
    let prog = 0; // 0 collapsed, 1 fully fanned
    let groups: Group[] = [];
    let lastCluster = 0;
    let lastFrame = performance.now();
    // Screen positions of what's currently drawn, for our own hit-testing —
    // globe.gl's canvas swallows pointer events, so DOM element clicks don't fire.
    let badgeHits: { id: string; x: number; y: number }[] = [];
    let markerHits: { slug: string; x: number; y: number }[] = [];

    const setOpen = (id: string) => {
      if (openId === id && openTarget) {
        openTarget = false; // clicking the open badge again collapses
      } else {
        openId = id;
        openTarget = true;
      }
    };
    const closeSpider = () => {
      openTarget = false;
    };

    // We hit-test clicks ourselves against the tracked positions (the canvas
    // intercepts pointer events, so the DOM badges/markers never get the click).
    el.addEventListener("click", (e) => {
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const near = (a: { x: number; y: number }, r: number) =>
        (a.x - px) ** 2 + (a.y - py) ** 2 <= r * r;
      // Badges first, then markers (both use generous radii for easy clicking).
      const badge = badgeHits.find((b) => near(b, 30));
      if (badge) {
        setOpen(badge.id);
        return;
      }
      const marker = markerHits.find((m) => near(m, 26));
      if (marker) {
        const pin = pinBySlug.get(marker.slug);
        if (pin) onOpenRef.current(pin);
        return;
      }
      closeSpider();
    });
    // Any drag/rotate collapses immediately + pauses auto-rotate.
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
      closeSpider();
    });

    const project = (): Map<string, Proj> => {
      const cam = world.camera().position;
      const m = new Map<string, Proj>();
      for (const p of pins) {
        const s = world.getScreenCoords(p.lat, p.lng, 0.008);
        const P = polar2Cartesian(p.lat, p.lng, 0);
        // Visible iff on the camera-facing hemisphere: C·P > |P|².
        const facing = cam.x * P.x + cam.y * P.y + cam.z * P.z > P.x * P.x + P.y * P.y + P.z * P.z;
        m.set(p.slug, { x: s.x, y: s.y, visible: facing && Number.isFinite(s.x) });
      }
      return m;
    };

    // Greedy pixel-distance clustering over currently-visible pins.
    const recomputeGroups = (proj: Map<string, Proj>) => {
      const pts = pins.filter((p) => proj.get(p.slug)?.visible);
      const used = new Set<string>();
      const out: Group[] = [];
      for (const p of pts) {
        if (used.has(p.slug)) continue;
        const seed = proj.get(p.slug)!;
        const members = [p.slug];
        used.add(p.slug);
        for (const q of pts) {
          if (used.has(q.slug)) continue;
          const qp = proj.get(q.slug)!;
          const dx = qp.x - seed.x;
          const dy = qp.y - seed.y;
          if (dx * dx + dy * dy <= CLUSTER_PX * CLUSTER_PX) {
            members.push(q.slug);
            used.add(q.slug);
          }
        }
        members.sort();
        out.push({ id: members.join("|"), members, region: p.region });
      }
      // Drop badge DOM for clusters that no longer exist.
      const live = new Set(out.filter((g) => g.members.length > 1).map((g) => g.id));
      for (const [id, b] of badgeEls) {
        if (!live.has(id)) {
          b.remove();
          badgeEls.delete(id);
        }
      }
      return out;
    };

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const dt = now - lastFrame;
      lastFrame = now;

      const proj = project();
      if (now - lastCluster > CLUSTER_THROTTLE_MS) {
        groups = recomputeGroups(proj);
        lastCluster = now;
      }

      // Animate fan progress.
      prog += (openTarget ? 1 : -1) * (dt / ANIM_MS);
      prog = Math.max(0, Math.min(1, prog));
      if (prog <= 0 && !openTarget) openId = null;
      const eased = easeOutCubic(prog);

      // Reset visibility each frame (cheap for ~11 elements).
      for (const w of markerEls.values()) w.style.display = "none";
      for (const b of badgeEls.values()) b.style.display = "none";
      let leaders = "";
      badgeHits = [];
      markerHits = [];

      for (const g of groups) {
        const visMembers = g.members.filter((s) => proj.get(s)?.visible);
        if (visMembers.length === 0) continue;
        let cx = 0;
        let cy = 0;
        for (const s of visMembers) {
          const pr = proj.get(s)!;
          cx += pr.x;
          cy += pr.y;
        }
        cx /= visMembers.length;
        cy /= visMembers.length;

        if (g.members.length === 1) {
          const s = g.members[0];
          const pr = proj.get(s)!;
          const w = markerEls.get(s)!;
          w.style.display = "flex";
          w.style.transform = `translate(${pr.x - TOUCH / 2}px, ${pr.y - TOUCH / 2}px)`;
          markerHits.push({ slug: s, x: pr.x, y: pr.y });
        } else if (g.id === openId && prog > 0) {
          // Spiderfied: fan members around the live centroid.
          const n = g.members.length;
          const radius = Math.min(Math.max(46 + n * 6, 50), 96);
          g.members.forEach((s, i) => {
            const w = markerEls.get(s)!;
            if (!proj.get(s)?.visible) return;
            const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
            const mx = cx + Math.cos(ang) * radius * eased;
            const my = cy + Math.sin(ang) * radius * eased;
            w.style.display = "flex";
            w.style.transform = `translate(${mx - TOUCH / 2}px, ${my - TOUCH / 2}px)`;
            markerHits.push({ slug: s, x: mx, y: my });
            leaders += `<line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="${REGION_COLOR[g.region]}" stroke-width="1" stroke-opacity="${0.4 * eased}"/>`;
          });
        } else {
          // Collapsed cluster → badge.
          const b = getBadge(g.id, g.region, g.members.length);
          b.style.display = "flex";
          b.style.transform = `translate(${cx - TOUCH / 2}px, ${cy - TOUCH / 2}px)`;
          badgeHits.push({ id: g.id, x: cx, y: cy });
        }
      }

      leaderSvg.innerHTML = leaders;
      raf = requestAnimationFrame(tick);
    };

    const resize = () => world.width(el.clientWidth).height(el.clientHeight);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("click", closeSpider);
      if (controllerRef) controllerRef.current = null;
      try {
        world._destructor?.();
      } catch {
        /* noop */
      }
      overlay.remove();
      if (el) el.innerHTML = "";
    };
  }, [pins, controllerRef]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} aria-hidden="true" />;
}
