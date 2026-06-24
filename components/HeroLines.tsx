'use client'

import { useEffect, useRef } from 'react'

interface Props {
  className?: string
  style?: React.CSSProperties
  speed?: number
}

export default function HeroLines({ className, style, speed = 0.00048 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf: number
    const t0 = performance.now()

    let cW = 0
    let cH = 0
    let cachedGrad: CanvasGradient | null = null

    // Spike state
    let spikeAmp = 0
    let spikeLine = 0.5
    let nextSpikeAt = 4.5

    // Mouse state
    let mNormY = 0.5
    let mSpeed = 0
    let lastMx = -1
    let lastMy = -1
    let lastMt = 0

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      mNormY = Math.max(0, Math.min(1, my / (cH || canvas.offsetHeight)))
      if (lastMx >= 0) {
        const dt = Math.max(e.timeStamp - lastMt, 1)
        const dx = mx - lastMx
        const dy = my - lastMy
        const instant = Math.sqrt(dx * dx + dy * dy) / dt
        mSpeed = mSpeed * 0.55 + instant * 0.45
      }
      lastMx = mx; lastMy = my; lastMt = e.timeStamp
    }
    window.addEventListener('mousemove', onMouseMove)

    function buildGradient() {
      const root = getComputedStyle(document.documentElement)
      const hsl = root.getPropertyValue('--foreground').trim() || '0 0% 11%'
      const c = (a: number) => `hsl(${hsl} / ${a})`
      const g = ctx!.createLinearGradient(0, 0, cW, 0)
      g.addColorStop(0.00, c(0.000))
      g.addColorStop(0.10, c(0.008))
      g.addColorStop(0.22, c(0.055))
      g.addColorStop(0.40, c(0.115))
      g.addColorStop(0.65, c(0.165))
      g.addColorStop(0.85, c(0.200))
      g.addColorStop(1.00, c(0.225))
      return g
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const W = Math.max(canvas!.offsetWidth, 1)
      const H = Math.max(canvas!.offsetHeight, 1)
      canvas!.width  = W * dpr
      canvas!.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      cW = W
      cH = H
      cachedGrad = buildGradient()
    }

    function baseWave(xn: number, phase: number, t: number): number {
      const x = xn * 9
      const h1 = Math.sin(x * 0.85 + t * 0.52 + phase)
      const h2 = Math.sin(x * 2.15 + t * 1.08 + phase * 1.45) * 0.52
      const h3 = Math.sin(x * 0.38 + t * 0.37 + phase * 0.62) * 0.40
      const h4 = Math.sin(x * 4.70 + t * 1.82 + phase * 0.25) * 0.15
      const h5 = Math.sin(x * 1.55 + t * 0.78 + phase * 1.85) * 0.23
      const h6 = Math.sin(x * 7.30 + t * 2.60 + phase * 0.50) * 0.07
      return (h1 + h2 + h3 + h4 + h5 + h6) / 2.37
    }

    function sharpWave(xn: number, phase: number, t: number, s: number): number {
      const x = xn * 9
      const tMod = t * (1 + s * 6)
      const s1 = Math.sin(x * 11.0 + tMod * 18.0 + phase * 0.8)
      const s2 = Math.sin(x *  6.5 + tMod * 12.5 + phase * 1.2) * 0.55
      const s3 = Math.sin(x * 18.0 + tMod * 28.0 + phase * 0.3) * 0.30
      const raw = (s1 + s2 + s3) / 1.85
      return raw > 0 ? raw * raw * 1.5 : raw * 0.55
    }

    function draw(now: number) {
      const w = cW
      const h = cH
      if (!w || !h || !cachedGrad) {
        raf = requestAnimationFrame(draw)
        return
      }
      const t  = (now - t0) * speed
      const ts = (now - t0) / 1000

      ctx!.clearRect(0, 0, w, h)

      mSpeed *= 0.970
      const mouseBoost = Math.min(mSpeed * 1.1, 2.0)

      spikeAmp *= 0.963
      if (ts > nextSpikeAt && spikeAmp < 0.08) {
        spikeAmp   = 2.8 + Math.random() * 3.2
        spikeLine  = 0.1 + Math.random() * 0.8
        nextSpikeAt = ts + 3.5 + Math.random() * 9
      }

      const isMobile = w < 768
      const numLines = Math.min(Math.round(h / 16), isMobile ? 60 : 130)
      const padTop   = h * 0.04
      const padBot   = h * 0.04
      const spacing  = (h - padTop - padBot) / (numLines - 1)
      const maxAmp   = h * 0.11
      const steps    = isMobile ? 100 : 220

      ctx!.strokeStyle = cachedGrad
      ctx!.lineJoin    = 'round'

      for (let i = 0; i < numLines; i++) {
        const baseY    = padTop + i * spacing
        const phase    = i * 0.365
        const lineNorm = i / (numLines - 1)
        const ampMod   = 0.68 + 0.32 * Math.sin(i * 1.08 + t * 0.14)

        const distSpike    = Math.abs(lineNorm - spikeLine)
        const spikeInfluence = spikeAmp * Math.exp(-distSpike * distSpike * 20)

        const distMouse    = Math.abs(lineNorm - mNormY)
        const mouseInfluence = mouseBoost * Math.exp(-distMouse * distMouse * 20)

        const totalBoost = spikeInfluence + mouseInfluence
        const stackMid   = Math.abs(lineNorm - 0.5)
        ctx!.lineWidth   = 0.55 + 0.50 * (1 - stackMid) + Math.min(totalBoost * 0.22, 0.6)

        ctx!.beginPath()
        for (let s = 0; s <= steps; s++) {
          const xn     = s / steps
          const x      = xn * w
          const thresh = 0.18
          const env    = xn <= thresh ? 0 : Math.pow((xn - thresh) / (1 - thresh), 2.05)
          const amp    = maxAmp * env * ampMod

          const bDisp       = baseWave(xn, phase, t) * amp
          const boostedBase = baseWave(xn, phase, t) * amp * (1 + totalBoost * 0.50)
          const sharpDisp   = totalBoost > 0.08
            ? sharpWave(xn, phase, t, mouseBoost * 0.15) * totalBoost * amp * 0.35
            : 0

          const y = baseY - (bDisp * 0.5 + boostedBase * 0.5 + sharpDisp)
          s === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y)
        }
        ctx!.stroke()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    raf = requestAnimationFrame(draw)

    const mo = new MutationObserver(() => { cachedGrad = buildGradient() })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [speed])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ background: 'transparent', display: 'block', ...style }}
      aria-hidden="true"
    />
  )
}
