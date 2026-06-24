'use client';

import { useEffect, useRef } from 'react';

const NUM_ROWS = 28;
const NUM_POINTS = 120;

const rows = Array.from({ length: NUM_ROWS }, (_, rowIndex) =>
  Array.from({ length: NUM_POINTS }, (_, i) => {
    const x = i / NUM_POINTS;
    return (
      Math.sin(x * Math.PI * 2 * (2 + rowIndex * 0.3) + rowIndex * 0.8) * 0.4 +
      Math.sin(x * Math.PI * 2 * (5 + rowIndex * 0.15) + rowIndex * 1.2) * 0.25 +
      Math.sin(x * Math.PI * 2 * (11 + rowIndex * 0.07)) * 0.15 +
      Math.sin(x * Math.PI * 2 * 17) * 0.1
    );
  })
);

export default function HeroWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dpr = window.devicePixelRatio || 1;
    const W = 300;
    const H = 400;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left) / rect.width;
      targetMouseY = (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let t = 0;
    let rafId: number;

    const draw = () => {
      if (!prefersReduced) t += 0.008;

      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      ctx.clearRect(0, 0, W, H);

      const ROW_SPACING = H / (NUM_ROWS + 2);
      const AMPLITUDE = ROW_SPACING * 0.85;

      const style = getComputedStyle(document.documentElement);
      const bgColor = style.getPropertyValue('--surface-page').trim() || '#ffffff';
      const lineColor = style.getPropertyValue('--text-primary').trim() || '#111111';

      rows.forEach((row, rowIndex) => {
        const yBase = ROW_SPACING * (rowIndex + 1.5);
        const rowNorm = rowIndex / NUM_ROWS;
        const distToMouse = Math.abs(rowNorm - mouseY);
        const mouseInfluence = Math.max(0, 1 - distToMouse * 3.5) * 0.35;

        ctx.beginPath();

        row.forEach((val, i) => {
          const x = (i / (NUM_POINTS - 1)) * W;
          const timeOffset = Math.sin(t + rowIndex * 0.22) * 0.12;
          const xNorm = i / NUM_POINTS;
          const distToMouseX = Math.abs(xNorm - mouseX);
          const mouseRipple = Math.max(0, 1 - distToMouseX * 4) * mouseInfluence;
          const y = yBase - (val + timeOffset + mouseRipple * 0.6) * AMPLITUDE;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });

        ctx.lineTo(W, yBase + AMPLITUDE);
        ctx.lineTo(0, yBase + AMPLITUDE);
        ctx.closePath();

        ctx.fillStyle = bgColor;
        ctx.fill();

        const alpha = 0.55 + (rowIndex / NUM_ROWS) * 0.35;
        ctx.strokeStyle = lineColor;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="hidden md:block"
      style={{ width: 300, height: 400, display: 'block' }}
      aria-hidden="true"
    />
  );
}
