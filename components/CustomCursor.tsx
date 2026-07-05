"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Hides the native pointer and draws a small crosshair reticle that follows the
 * mouse. Desktop / fine-pointer only; respects reduced-motion; keeps the native
 * text caret inside form fields.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false); // over a link/button
  const [overText, setOverText] = useState(false); // over an input/textarea

  const reduce = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return; // skip touch
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: PointerEvent) => {
      const el = e.target as Element | null;
      const text = !!el?.closest?.("input, textarea, [contenteditable='true']");
      const interactive = !!el?.closest?.("a, button, [role='button'], label, select");
      setOverText(text);
      setHovering(interactive && !text);
    };
    const hide = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      style={{
        x: reduce ? x : sx,
        y: reduce ? y : sy,
        position: "fixed",
        left: 0,
        top: 0,
        width: 22,
        height: 22,
        marginLeft: -11,
        marginTop: -11,
        zIndex: 9999,
        pointerEvents: "none",
        color: "var(--text-primary)",
        willChange: "transform",
      }}
      animate={{ opacity: visible && !overText ? 1 : 0, scale: hovering ? 1.7 : 1 }}
      transition={{
        opacity: { duration: 0.15 },
        scale: { type: "spring", stiffness: 400, damping: 25 },
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1" shapeRendering="geometricPrecision">
        <line x1="11" y1="1" x2="11" y2="7" />
        <line x1="11" y1="15" x2="11" y2="21" />
        <line x1="1" y1="11" x2="7" y2="11" />
        <line x1="15" y1="11" x2="21" y2="11" />
      </svg>
    </motion.div>
  );
}
