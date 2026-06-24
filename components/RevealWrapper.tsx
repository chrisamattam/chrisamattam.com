"use client";

import { useReveal } from "@/hooks/useReveal";

export default function RevealWrapper({ children }: { children: React.ReactNode }) {
  useReveal();
  return <>{children}</>;
}
