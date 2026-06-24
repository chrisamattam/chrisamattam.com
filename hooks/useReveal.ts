"use client";

import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    // If the user prefers reduced motion, leave everything visible (never arm/hide).
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    // Arm elements (hide them) only now that JS is confirmed running. Without this
    // class the CSS keeps content fully visible, so a missed element can never vanish.
    elements.forEach((el) => el.classList.add("reveal-armed"));

    const reveal = (el: HTMLElement) => {
      if (el.classList.contains("in")) return;
      const delay = el.dataset.stagger ? parseInt(el.dataset.stagger, 10) : 0;
      window.setTimeout(() => el.classList.add("in"), delay);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    // Fail-safe: an element must never stay permanently hidden if the observer
    // misses it. Sweep anything currently in the viewport on mount, on scroll,
    // and once more after a short delay.
    const sweep = () => {
      for (const el of elements) {
        if (el.classList.contains("in")) continue;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight - 16 && r.bottom > 0) reveal(el);
      }
    };
    sweep();
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });

    // Interval sweep catches any scroll event the listener might miss for the first few seconds.
    const iv = window.setInterval(sweep, 350);

    // Ultimate guarantee: after a few seconds nothing may remain hidden, regardless of
    // observer/scroll behaviour. Reveals any straggler so the page is never stuck blank.
    const hardFailsafe = window.setTimeout(() => {
      elements.forEach((el) => el.classList.add("in"));
      window.clearInterval(iv);
    }, 4000);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", sweep);
      window.removeEventListener("resize", sweep);
      window.clearInterval(iv);
      window.clearTimeout(hardFailsafe);
    };
  }, []);
}
