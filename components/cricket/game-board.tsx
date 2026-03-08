"use client"

import { useRef, useEffect, useCallback } from "react"
import type { GameState } from "@/lib/cricket-game/types"
import {
  BOARD_SQUARES,
  TOTAL_SQUARES,
  SQUARE_COLORS,
  TEAM_1_COLOR,
  TEAM_2_COLOR,
} from "@/lib/cricket-game/constants"

interface GameBoardProps {
  state: GameState
}

function getSquarePositions(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count: number
): { x: number; y: number; angle: number }[] {
  const positions: { x: number; y: number; angle: number }[] = []
  for (let i = 0; i < count; i++) {
    // Start from top, go clockwise
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2
    positions.push({
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
      angle,
    })
  }
  return positions
}

export function GameBoard({ state }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)

  const tokenColor = state.battingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      ctx.clearRect(0, 0, width, height)

      const cx = width / 2
      const cy = height / 2
      const minDim = Math.min(width, height)
      const rx = minDim * 0.38
      const ry = minDim * 0.38
      const squareSize = minDim * 0.056

      const positions = getSquarePositions(cx, cy, rx, ry, TOTAL_SQUARES)

      // Draw track path (connecting line)
      ctx.beginPath()
      ctx.strokeStyle = "#1a2a3a"
      ctx.lineWidth = squareSize * 1.6
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      for (let i = 0; i <= TOTAL_SQUARES; i++) {
        const pos = positions[i % TOTAL_SQUARES]
        if (i === 0) ctx.moveTo(pos.x, pos.y)
        else ctx.lineTo(pos.x, pos.y)
      }
      ctx.closePath()
      ctx.stroke()

      // Draw squares
      for (let i = 0; i < TOTAL_SQUARES; i++) {
        const square = BOARD_SQUARES[i]
        const pos = positions[i]
        const colors = SQUARE_COLORS[square.type]
        const isLanded = state.lastSquareLanded?.id === i

        // Glow for landed square
        if (isLanded) {
          const pulseIntensity = 0.5 + 0.5 * Math.sin(time * 4)
          ctx.save()
          ctx.shadowColor = colors.text
          ctx.shadowBlur = 15 + pulseIntensity * 10
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, squareSize + 2, 0, Math.PI * 2)
          ctx.fillStyle = colors.bg
          ctx.fill()
          ctx.restore()
        }

        // Square background
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, squareSize, 0, Math.PI * 2)
        ctx.fillStyle = colors.bg
        ctx.fill()
        ctx.strokeStyle = isLanded ? colors.text : "#1a3a4a"
        ctx.lineWidth = isLanded ? 2 : 1
        ctx.stroke()

        // Square label
        ctx.fillStyle = colors.text
        ctx.font = `bold ${squareSize * 0.65}px 'Geist Mono', monospace`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(square.label, pos.x, pos.y)
      }

      // Draw token
      let tokenPos: { x: number; y: number }
      if (state.tokenAnimation.isAnimating) {
        const from = positions[state.tokenAnimation.fromSquare]
        const to = positions[state.tokenAnimation.toSquare]
        // Smooth easeInOut interpolation
        const t = state.tokenAnimation.progress
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        // We won't have real-time progress in canvas, so just use current position
        tokenPos = {
          x: from.x + (to.x - from.x) * eased,
          y: from.y + (to.y - from.y) * eased,
        }
      } else {
        tokenPos = positions[state.tokenPosition]
      }

      if (tokenPos) {
        // Token glow
        const glowPulse = 0.6 + 0.4 * Math.sin(time * 3)
        ctx.save()
        ctx.shadowColor = tokenColor
        ctx.shadowBlur = 12 + glowPulse * 8
        ctx.beginPath()
        ctx.arc(tokenPos.x, tokenPos.y, squareSize * 0.55, 0, Math.PI * 2)
        ctx.fillStyle = tokenColor
        ctx.fill()
        ctx.restore()

        // Token inner
        ctx.beginPath()
        ctx.arc(tokenPos.x, tokenPos.y, squareSize * 0.35, 0, Math.PI * 2)
        ctx.fillStyle = "#0a0a1a"
        ctx.fill()
      }

      // Center area - cricket pitch graphic
      const pitchW = minDim * 0.14
      const pitchH = minDim * 0.28
      ctx.save()
      ctx.fillStyle = "#1a2a1a"
      ctx.strokeStyle = "#2a4a2a"
      ctx.lineWidth = 1

      // Pitch rectangle
      const pitchRoundedRadius = 6
      ctx.beginPath()
      ctx.roundRect(cx - pitchW / 2, cy - pitchH / 2, pitchW, pitchH, pitchRoundedRadius)
      ctx.fill()
      ctx.stroke()

      // Crease lines
      ctx.strokeStyle = "#4a6a4a"
      ctx.lineWidth = 1
      const creaseY1 = cy - pitchH * 0.38
      const creaseY2 = cy + pitchH * 0.38
      ctx.beginPath()
      ctx.moveTo(cx - pitchW * 0.35, creaseY1)
      ctx.lineTo(cx + pitchW * 0.35, creaseY1)
      ctx.moveTo(cx - pitchW * 0.35, creaseY2)
      ctx.lineTo(cx + pitchW * 0.35, creaseY2)
      ctx.stroke()

      // Stumps
      ctx.fillStyle = "#8a7a5a"
      for (const creaseY of [creaseY1, creaseY2]) {
        for (let s = -1; s <= 1; s++) {
          ctx.fillRect(cx + s * 3 - 0.5, creaseY - 4, 1.5, 8)
        }
      }

      // --- Animated Players ---
      const playerScale = minDim * 0.008

      // Helper to draw a stick figure player
      const drawPlayer = (
        px: number,
        py: number,
        scale: number,
        color: string,
        armAngle: number,
        legOffset: number,
        hasBat: boolean
      ) => {
        ctx.save()
        ctx.translate(px, py)
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = scale * 0.4
        ctx.lineCap = "round"

        // Head
        ctx.beginPath()
        ctx.arc(0, -scale * 3.5, scale * 0.8, 0, Math.PI * 2)
        ctx.fill()

        // Body
        ctx.beginPath()
        ctx.moveTo(0, -scale * 2.7)
        ctx.lineTo(0, 0)
        ctx.stroke()

        // Arms
        const armSwing = Math.sin(armAngle) * scale * 1.2
        ctx.beginPath()
        ctx.moveTo(0, -scale * 2)
        ctx.lineTo(-scale * 1.2 + armSwing * 0.3, -scale * 0.8)
        ctx.moveTo(0, -scale * 2)
        ctx.lineTo(scale * 1.2 - armSwing * 0.3, -scale * 0.8 + armSwing)
        ctx.stroke()

        // Bat (for batsman)
        if (hasBat) {
          ctx.strokeStyle = "#c9a66b"
          ctx.lineWidth = scale * 0.5
          const batX = scale * 1.2 - armSwing * 0.3
          const batY = -scale * 0.8 + armSwing
          ctx.beginPath()
          ctx.moveTo(batX, batY)
          ctx.lineTo(batX + scale * 1.5, batY + scale * 1.2)
          ctx.stroke()
          ctx.strokeStyle = color
          ctx.lineWidth = scale * 0.4
        }

        // Legs
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(-scale * 0.6 + legOffset * 0.5, scale * 2)
        ctx.moveTo(0, 0)
        ctx.lineTo(scale * 0.6 - legOffset * 0.5, scale * 2)
        ctx.stroke()

        ctx.restore()
      }

      // Batsman (striker) at bottom crease - batting stance with slight sway
      const batsmanSway = Math.sin(time * 2) * 0.3
      const batsmanArmSwing = Math.sin(time * 1.5) * 0.8
      drawPlayer(
        cx + pitchW * 0.15,
        creaseY2 + playerScale * 1,
        playerScale,
        "#e8e8e8",
        batsmanArmSwing,
        batsmanSway,
        true
      )

      // Non-striker at top crease - idle stance
      const nonStrikerSway = Math.sin(time * 1.8 + 1) * 0.2
      drawPlayer(
        cx - pitchW * 0.2,
        creaseY1 + playerScale * 2,
        playerScale * 0.9,
        "#c8c8c8",
        0,
        nonStrikerSway,
        true
      )

      // Bowler - running/bowling animation
      const bowlerPhase = (time * 3) % (Math.PI * 2)
      const bowlerRunCycle = Math.sin(bowlerPhase) * playerScale * 0.8
      const bowlerArmAction = Math.sin(bowlerPhase * 0.5) * 2.5
      const bowlerY = cy - pitchH * 0.08 + Math.abs(Math.sin(bowlerPhase * 2)) * playerScale * 0.5
      drawPlayer(
        cx,
        bowlerY,
        playerScale * 0.95,
        "#aaccff",
        bowlerArmAction,
        bowlerRunCycle,
        false
      )

      // Wicket keeper behind striker
      const keeperSway = Math.sin(time * 2.2) * 0.15
      ctx.save()
      ctx.translate(cx - pitchW * 0.25, creaseY2 + playerScale * 4)
      ctx.strokeStyle = "#aaccff"
      ctx.fillStyle = "#aaccff"
      ctx.lineWidth = playerScale * 0.35
      ctx.lineCap = "round"
      // Crouched keeper
      ctx.beginPath()
      ctx.arc(0, -playerScale * 2, playerScale * 0.7, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(0, -playerScale * 1.3)
      ctx.lineTo(0, playerScale * 0.2)
      ctx.stroke()
      // Crouched legs
      ctx.beginPath()
      ctx.moveTo(0, playerScale * 0.2)
      ctx.lineTo(-playerScale * 0.8 + keeperSway, playerScale * 1)
      ctx.moveTo(0, playerScale * 0.2)
      ctx.lineTo(playerScale * 0.8 - keeperSway, playerScale * 1)
      ctx.stroke()
      // Arms ready
      ctx.beginPath()
      ctx.moveTo(0, -playerScale * 0.8)
      ctx.lineTo(-playerScale * 1.2, -playerScale * 0.3)
      ctx.moveTo(0, -playerScale * 0.8)
      ctx.lineTo(playerScale * 1.2, -playerScale * 0.3)
      ctx.stroke()
      ctx.restore()

      ctx.restore()

      // Center text: innings info
      ctx.fillStyle = "#6a8a9a"
      ctx.font = `${minDim * 0.022}px 'Geist', sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      const battingTeamName = state[state.battingTeamKey].name
      ctx.fillText(battingTeamName, cx, cy + pitchH / 2 + minDim * 0.05)
      ctx.fillText(
        `Innings ${state.currentInnings}`,
        cx,
        cy - pitchH / 2 - minDim * 0.05
      )
    },
    [state, tokenColor]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    function render(timestamp: number) {
      if (!canvas || !ctx) return
      const time = timestamp / 1000
      timeRef.current = time

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      draw(ctx, rect.width, rect.height, time)
      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [draw])

  return (
    <div className="relative aspect-square w-full max-w-[500px]">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: "block" }}
      />

      {/* Flash effects */}
      {state.flashEffect && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            animation: "flash-out 1.2s ease-out forwards",
            backgroundColor:
              state.flashEffect === "wicket"
                ? "rgba(220, 50, 50, 0.15)"
                : state.flashEffect === "six"
                  ? "rgba(255, 200, 0, 0.15)"
                  : "rgba(255, 180, 0, 0.1)",
          }}
        />
      )}

      {/* Flash text */}
      {state.flashEffect && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ animation: "flash-text 1.2s ease-out forwards" }}
        >
          <span
            className="font-mono text-4xl font-black tracking-widest sm:text-5xl"
            style={{
              color:
                state.flashEffect === "wicket"
                  ? "#ff4444"
                  : state.flashEffect === "six"
                    ? "#ffcc00"
                    : "#ffaa00",
              textShadow:
                state.flashEffect === "wicket"
                  ? "0 0 30px #ff444488"
                  : "0 0 30px #ffcc0088",
            }}
          >
            {state.flashEffect === "wicket"
              ? "OUT!"
              : state.flashEffect === "six"
                ? "SIX!"
                : "FOUR!"}
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes flash-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes flash-text {
          0% { opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; transform: scale(1.2); }
          60% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}
