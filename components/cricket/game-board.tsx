"use client"

import { useRef, useEffect, useCallback, type ReactNode } from "react"
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
  children?: ReactNode
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

export function GameBoard({ state, children }: GameBoardProps) {
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
        // Token outer glow - consistent, no pulsing
        ctx.save()
        ctx.globalAlpha = 0.55
        ctx.shadowColor = tokenColor
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(tokenPos.x, tokenPos.y, squareSize * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = tokenColor
        ctx.fill()
        ctx.restore()
      }

      // Center area - cricket pitch graphic
      const pitchW = minDim * 0.10
      const pitchH = minDim * 0.20
      ctx.save()
      ctx.fillStyle = "#1a2a1a"
      ctx.strokeStyle = "#2a4a2a"
      ctx.lineWidth = 1

      // Pitch rectangle
      const pitchRoundedRadius = 4
      ctx.beginPath()
      ctx.roundRect(cx - pitchW / 2, cy - pitchH / 2, pitchW, pitchH, pitchRoundedRadius)
      ctx.fill()
      ctx.stroke()

      // Crease lines
      ctx.strokeStyle = "#4a6a4a"
      ctx.lineWidth = 1
      const creaseY1 = cy - pitchH * 0.35
      const creaseY2 = cy + pitchH * 0.35
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
          ctx.fillRect(cx + s * 2 - 0.5, creaseY - 3, 1, 6)
        }
      }
      ctx.restore()
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
    <div className="relative aspect-square w-full max-w-[320px]">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: "block" }}
      />
      
      {/* Corner score components - outside circular area but inside game board */}
      {children}

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
