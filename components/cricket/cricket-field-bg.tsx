"use client"

import { useEffect, useRef } from "react"

/**
 * Cartoonish cricket ground background — intended to sit behind the GameBoard canvas.
 * Draws a bright top-down ground with bold outlines, chunky grass tufts, a sandy pitch,
 * wiggly boundary rope, cartoon stumps, and cheerful crowd blobs.
 */
export function CricketFieldBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let t = 0

    // Grass tufts scattered in outfield
    type Tuft = { x: number; y: number; size: number; phase: number }
    const tufts: Tuft[] = []
    // Crowd blobs around the stands
    type Blob = { angle: number; dist: number; color: string; phase: number; w: number; h: number }
    const blobs: Blob[] = []

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1)
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1)
      ctx!.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
      buildScene()
    }

    function buildScene() {
      if (!canvas) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      const cx = w / 2
      const cy = h / 2
      const minDim = Math.min(w, h)
      const outerR = minDim * 0.46
      const boundaryR = outerR * 0.80

      tufts.length = 0
      blobs.length = 0

      // Grass tufts between 30-yard circle and boundary
      const infieldR = outerR * 0.50
      for (let i = 0; i < 55; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = infieldR + Math.random() * (boundaryR - infieldR - 4)
        const tx = cx + Math.cos(angle) * dist
        const ty = cy + Math.sin(angle) * dist
        tufts.push({ x: tx, y: ty, size: 3 + Math.random() * 3, phase: Math.random() * Math.PI * 2 })
      }

      // Crowd blobs — chunky cartoon spectators in the stands
      const standInner = boundaryR * 1.05
      const standOuter = outerR * 1.02
      const crowdColors = ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff9f43","#ee5a24","#a29bfe","#fd79a8"]
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 + 0.05
        const dist = standInner + Math.random() * (standOuter - standInner)
        blobs.push({
          angle,
          dist,
          color: crowdColors[Math.floor(Math.random() * crowdColors.length)],
          phase: Math.random() * Math.PI * 2,
          w: 5 + Math.random() * 5,
          h: 6 + Math.random() * 5,
        })
      }
    }

    function roundRect(
      x: number, y: number, w: number, h: number, r: number
    ) {
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
    }

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      const cx = w / 2
      const cy = h / 2
      const minDim = Math.min(w, h)
      const outerR = minDim * 0.46
      const boundaryR = outerR * 0.80
      const infieldR = outerR * 0.50

      ctx.clearRect(0, 0, w, h)

      // -- Sky/stadium background --
      ctx.fillStyle = "#1a1a2e"
      ctx.fillRect(0, 0, w, h)

      // -- Stands (dark ring outside the field) --
      ctx.beginPath()
      ctx.arc(cx, cy, outerR * 1.08, 0, Math.PI * 2)
      ctx.fillStyle = "#16213e"
      ctx.fill()
      ctx.strokeStyle = "#0f3460"
      ctx.lineWidth = 3
      ctx.stroke()

      // -- Outfield grass (bright cartoon green) --
      ctx.beginPath()
      ctx.arc(cx, cy, boundaryR, 0, Math.PI * 2)
      ctx.fillStyle = "#3d9e3d"
      ctx.fill()
      ctx.strokeStyle = "#2d7a2d"
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Mowing stripes on outfield
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, boundaryR, 0, Math.PI * 2)
      ctx.clip()
      const stripeW = minDim * 0.06
      const count = Math.ceil((boundaryR * 2) / stripeW) + 2
      for (let i = 0; i < count; i++) {
        if (i % 2 === 0) {
          ctx.fillStyle = "rgba(0,0,0,0.06)"
          ctx.fillRect(cx - boundaryR + i * stripeW, cy - boundaryR, stripeW, boundaryR * 2)
        }
      }
      ctx.restore()

      // -- Infield (lighter green) --
      ctx.beginPath()
      ctx.arc(cx, cy, infieldR, 0, Math.PI * 2)
      ctx.fillStyle = "#4db84d"
      ctx.fill()
      ctx.strokeStyle = "#2d7a2d"
      ctx.lineWidth = 2
      ctx.setLineDash([6, 5])
      ctx.stroke()
      ctx.setLineDash([])

      // -- Wiggly boundary rope --
      ctx.beginPath()
      const ropeSegs = 120
      for (let i = 0; i <= ropeSegs; i++) {
        const angle = (i / ropeSegs) * Math.PI * 2
        const wiggle = Math.sin(angle * 8 + t * 1.2) * 2.5
        const r = boundaryR + wiggle
        const rx = cx + Math.cos(angle) * r
        const ry = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(rx, ry)
        else ctx.lineTo(rx, ry)
      }
      ctx.closePath()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Rope color alternating dashes (red/white)
      ctx.beginPath()
      for (let i = 0; i <= ropeSegs; i++) {
        const angle = (i / ropeSegs) * Math.PI * 2
        const wiggle = Math.sin(angle * 8 + t * 1.2) * 2.5
        const r = boundaryR + wiggle
        const rx = cx + Math.cos(angle) * r
        const ry = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(rx, ry)
        else ctx.lineTo(rx, ry)
      }
      ctx.strokeStyle = "#ff4444"
      ctx.lineWidth = 2.5
      ctx.setLineDash([8, 8])
      ctx.stroke()
      ctx.setLineDash([])

      // -- Grass tufts --
      for (const tuft of tufts) {
        const sway = Math.sin(tuft.phase + t * 1.5) * 1.2
        ctx.save()
        ctx.translate(tuft.x + sway, tuft.y)
        // Three blades
        for (let b = -1; b <= 1; b++) {
          ctx.beginPath()
          ctx.moveTo(b * tuft.size * 0.4, 0)
          ctx.quadraticCurveTo(
            b * tuft.size * 0.8 + sway * 0.5,
            -tuft.size,
            b * tuft.size * 0.6 + sway,
            -tuft.size * 1.8
          )
          ctx.strokeStyle = "#2a6b2a"
          ctx.lineWidth = 1.2
          ctx.stroke()
        }
        ctx.restore()
      }

      // -- Pitch (sandy cartoon rectangle) --
      const pitchLen = minDim * 0.24
      const pitchW = minDim * 0.055
      ctx.save()
      ctx.translate(cx, cy)
      // Shadow
      ctx.shadowColor = "rgba(0,0,0,0.4)"
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 3
      // Pitch fill
      ctx.fillStyle = "#d4a96a"
      roundRect(-pitchW / 2, -pitchLen / 2, pitchW, pitchLen, 4)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      // Pitch outline (bold cartoon)
      ctx.strokeStyle = "#8b6914"
      ctx.lineWidth = 2
      roundRect(-pitchW / 2, -pitchLen / 2, pitchW, pitchLen, 4)
      ctx.stroke()
      // Crease lines
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1.8
      const cr1 = -pitchLen * 0.35
      const cr2 = pitchLen * 0.35
      ctx.beginPath()
      ctx.moveTo(-pitchW * 0.7, cr1)
      ctx.lineTo(pitchW * 0.7, cr1)
      ctx.moveTo(-pitchW * 0.7, cr2)
      ctx.lineTo(pitchW * 0.7, cr2)
      ctx.stroke()
      // Stumps (3 per end, cartoon style)
      const stumpColors = ["#f5e642", "#f5e642", "#f5e642"]
      for (const sy of [cr1 - 2, cr2 + 2]) {
        for (let s = -1; s <= 1; s++) {
          // Stump post
          ctx.fillStyle = stumpColors[s + 1]
          ctx.fillRect(s * pitchW * 0.22 - 1, sy - 6, 2.5, 8)
          // Bail (tiny crossbar)
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(s * pitchW * 0.22 - 2, sy - 6, 5, 1.5)
        }
      }
      ctx.restore()

      // -- Crowd blobs (cartoon spectators) --
      for (const blob of blobs) {
        const bob = Math.sin(blob.phase + t * 1.8) * 1.5
        const bx = cx + Math.cos(blob.angle) * blob.dist
        const by = cy + Math.sin(blob.angle) * blob.dist + bob
        // Body
        ctx.beginPath()
        ctx.ellipse(bx, by + blob.h * 0.2, blob.w * 0.45, blob.h * 0.55, 0, 0, Math.PI * 2)
        ctx.fillStyle = blob.color
        ctx.fill()
        ctx.strokeStyle = "rgba(0,0,0,0.3)"
        ctx.lineWidth = 0.8
        ctx.stroke()
        // Head
        ctx.beginPath()
        ctx.arc(bx, by - blob.h * 0.3, blob.w * 0.32, 0, Math.PI * 2)
        ctx.fillStyle = "#f5cba7"
        ctx.fill()
        ctx.strokeStyle = "rgba(0,0,0,0.25)"
        ctx.lineWidth = 0.8
        ctx.stroke()
      }

      // -- Floodlight towers (4 corners, cartoon style) --
      const towerPositions = [
        { x: cx - outerR * 0.75, y: cy - outerR * 0.75 },
        { x: cx + outerR * 0.75, y: cy - outerR * 0.75 },
        { x: cx - outerR * 0.75, y: cy + outerR * 0.75 },
        { x: cx + outerR * 0.75, y: cy + outerR * 0.75 },
      ]
      for (const tp of towerPositions) {
        // Light cone
        const coneGrad = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, outerR * 0.32)
        coneGrad.addColorStop(0, "rgba(255,250,200,0.10)")
        coneGrad.addColorStop(1, "rgba(255,250,200,0)")
        ctx.beginPath()
        ctx.arc(tp.x, tp.y, outerR * 0.32, 0, Math.PI * 2)
        ctx.fillStyle = coneGrad
        ctx.fill()
        // Tower pole
        ctx.beginPath()
        ctx.moveTo(tp.x, tp.y)
        ctx.lineTo(cx + (tp.x - cx) * 0.92, cy + (tp.y - cy) * 0.92)
        ctx.strokeStyle = "#4a5568"
        ctx.lineWidth = 3
        ctx.stroke()
        // Light bulb
        ctx.beginPath()
        ctx.arc(tp.x, tp.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,250,180,${0.7 + 0.3 * Math.sin(t * 1.5 + tp.x)})`
        ctx.fill()
        ctx.strokeStyle = "#888"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // -- Subtle dark vignette to keep the game board readable on top --
      const vignette = ctx.createRadialGradient(cx, cy, infieldR * 0.3, cx, cy, outerR * 1.1)
      vignette.addColorStop(0, "rgba(0,0,0,0)")
      vignette.addColorStop(0.7, "rgba(0,0,0,0.08)")
      vignette.addColorStop(1, "rgba(0,0,0,0.45)")
      ctx.beginPath()
      ctx.arc(cx, cy, outerR * 1.1, 0, Math.PI * 2)
      ctx.fillStyle = vignette
      ctx.fill()

      t += 0.016
      animId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    draw()

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full rounded-sm"
      aria-hidden="true"
    />
  )
}
