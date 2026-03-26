"use client"

import { useEffect, useRef } from "react"

export function CricketFieldBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let t = 0

    // Crowd dots — small blinking spectator dots around the stands
    const crowdDots: { x: number; y: number; phase: number; r: number }[] = []

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      crowdDots.length = 0
      buildCrowd()
    }

    function buildCrowd() {
      if (!canvas) return
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const outerR = Math.min(canvas.width, canvas.height) * 0.48
      const innerR = outerR * 0.82
      const count = 140
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        const dist = innerR + Math.random() * (outerR - innerR)
        crowdDots.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          phase: Math.random() * Math.PI * 2,
          r: 1.2 + Math.random() * 1.2,
        })
      }
    }

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2
      const minDim = Math.min(w, h)
      const outerR = minDim * 0.48
      const innerR = outerR * 0.78   // boundary rope edge
      const pitchLen = minDim * 0.22
      const pitchW = minDim * 0.045

      ctx.clearRect(0, 0, w, h)

      // --- Background fill ---
      ctx.fillStyle = "#0b1a0e"
      ctx.fillRect(0, 0, w, h)

      // --- Outer stands ring (dark) ---
      ctx.beginPath()
      ctx.arc(cx, cy, outerR * 1.05, 0, Math.PI * 2)
      ctx.fillStyle = "#0d1f10"
      ctx.fill()

      // --- Grass outfield (animated mowing stripes) ---
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
      ctx.clip()

      const stripeW = minDim * 0.055
      const stripeCount = Math.ceil((outerR * 2) / stripeW) + 2
      const startX = cx - outerR - stripeW
      for (let i = 0; i < stripeCount; i++) {
        const even = i % 2 === 0
        // animate stripes very slowly drifting
        const drift = (t * 0.12) % stripeW
        ctx.fillStyle = even ? "#1a3d1e" : "#163318"
        ctx.fillRect(startX + i * stripeW - drift, cy - outerR, stripeW, outerR * 2)
      }
      ctx.restore()

      // --- Inner circle (30-yard circle) ---
      const infield = outerR * 0.52
      ctx.beginPath()
      ctx.arc(cx, cy, infield, 0, Math.PI * 2)
      ctx.fillStyle = "#1c4220"
      ctx.fill()

      // Infield mowing stripes (perpendicular)
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, infield, 0, Math.PI * 2)
      ctx.clip()
      const iStripeW = minDim * 0.06
      const iCount = Math.ceil((infield * 2) / iStripeW) + 2
      const iStart = cy - infield - iStripeW
      for (let i = 0; i < iCount; i++) {
        const even = i % 2 === 0
        const drift = (t * 0.1) % iStripeW
        ctx.fillStyle = even ? "#1c4220" : "#183c1c"
        ctx.fillRect(cx - infield, iStart + i * iStripeW - drift, infield * 2, iStripeW)
      }
      ctx.restore()

      // --- Boundary rope ---
      ctx.beginPath()
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(255,255,255,0.18)"
      ctx.lineWidth = 2
      ctx.setLineDash([6, 8])
      ctx.stroke()
      ctx.setLineDash([])

      // --- 30-yard circle dashed line ---
      ctx.beginPath()
      ctx.arc(cx, cy, infield, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(255,255,255,0.10)"
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 7])
      ctx.stroke()
      ctx.setLineDash([])

      // --- Pitch (beige rectangle) ---
      ctx.save()
      ctx.translate(cx, cy)
      // Pitch shadow
      ctx.shadowColor = "rgba(0,0,0,0.6)"
      ctx.shadowBlur = 10
      ctx.fillStyle = "#8b7355"
      ctx.fillRect(-pitchW / 2, -pitchLen / 2, pitchW, pitchLen)
      ctx.shadowBlur = 0

      // Pitch texture lines (creases)
      ctx.strokeStyle = "rgba(255,255,255,0.55)"
      ctx.lineWidth = 1.2
      // Batting crease top
      ctx.beginPath()
      ctx.moveTo(-pitchW / 2 - pitchW * 0.3, -pitchLen / 2 + pitchLen * 0.12)
      ctx.lineTo(pitchW / 2 + pitchW * 0.3, -pitchLen / 2 + pitchLen * 0.12)
      ctx.stroke()
      // Batting crease bottom
      ctx.beginPath()
      ctx.moveTo(-pitchW / 2 - pitchW * 0.3, pitchLen / 2 - pitchLen * 0.12)
      ctx.lineTo(pitchW / 2 + pitchW * 0.3, pitchLen / 2 - pitchLen * 0.12)
      ctx.stroke()
      // Bowling crease top
      ctx.strokeStyle = "rgba(255,255,255,0.35)"
      ctx.beginPath()
      ctx.moveTo(-pitchW / 2, -pitchLen / 2 + pitchLen * 0.22)
      ctx.lineTo(pitchW / 2, -pitchLen / 2 + pitchLen * 0.22)
      ctx.stroke()
      // Bowling crease bottom
      ctx.beginPath()
      ctx.moveTo(-pitchW / 2, pitchLen / 2 - pitchLen * 0.22)
      ctx.lineTo(pitchW / 2, pitchLen / 2 - pitchLen * 0.22)
      ctx.stroke()

      // Stumps top (3 small lines)
      const stumpY = -pitchLen / 2 + pitchLen * 0.1
      const stumpSpacing = pitchW * 0.18
      ctx.strokeStyle = "rgba(255,235,180,0.9)"
      ctx.lineWidth = 1.5
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.moveTo(i * stumpSpacing, stumpY - 4)
        ctx.lineTo(i * stumpSpacing, stumpY + 4)
        ctx.stroke()
      }
      // Stumps bottom
      const stumpY2 = pitchLen / 2 - pitchLen * 0.1
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.moveTo(i * stumpSpacing, stumpY2 - 4)
        ctx.lineTo(i * stumpSpacing, stumpY2 + 4)
        ctx.stroke()
      }
      ctx.restore()

      // --- Crowd dots (blinking) ---
      for (const dot of crowdDots) {
        const brightness = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(dot.phase + t * 0.7))
        // Randomise colours slightly
        const hue = 80 + ((dot.x * 7 + dot.y * 3) % 60)
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${hue}, 60%, ${Math.round(brightness * 70)}%, ${brightness})`
        ctx.fill()
      }

      // --- Floodlight glow (four soft radial gradients at corners of field) ---
      const glowPositions = [
        { x: cx - outerR * 0.72, y: cy - outerR * 0.72 },
        { x: cx + outerR * 0.72, y: cy - outerR * 0.72 },
        { x: cx - outerR * 0.72, y: cy + outerR * 0.72 },
        { x: cx + outerR * 0.72, y: cy + outerR * 0.72 },
      ]
      for (const g of glowPositions) {
        const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, outerR * 0.35)
        grd.addColorStop(0, "rgba(255,245,200,0.07)")
        grd.addColorStop(1, "rgba(255,245,200,0)")
        ctx.beginPath()
        ctx.arc(g.x, g.y, outerR * 0.35, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      // --- Dark vignette over the whole field to ensure UI contrast ---
      const vignette = ctx.createRadialGradient(cx, cy, outerR * 0.3, cx, cy, outerR * 1.1)
      vignette.addColorStop(0, "rgba(0,0,0,0)")
      vignette.addColorStop(1, "rgba(0,0,0,0.55)")
      ctx.beginPath()
      ctx.arc(cx, cy, outerR * 1.1, 0, Math.PI * 2)
      ctx.fillStyle = vignette
      ctx.fill()

      t += 0.016
      animationId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
