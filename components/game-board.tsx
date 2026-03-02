"use client"

import { useRef, useEffect } from "react"
import { type Position, GRID_SIZE, CELL_SIZE } from "@/hooks/use-snake-game"

interface GameBoardProps {
  snake: Position[]
  food: Position
  ateFood: boolean
}

export function GameBoard({ snake, food, ateFood }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const foodPulseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = GRID_SIZE * CELL_SIZE

    const draw = () => {
      foodPulseRef.current += 0.06

      ctx.clearRect(0, 0, size, size)

      // Draw grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"
      ctx.lineWidth = 0.5
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath()
        ctx.moveTo(i * CELL_SIZE, 0)
        ctx.lineTo(i * CELL_SIZE, size)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, i * CELL_SIZE)
        ctx.lineTo(size, i * CELL_SIZE)
        ctx.stroke()
      }

      // Draw food with pulse animation
      const foodPulse = Math.sin(foodPulseRef.current) * 2 + 2
      const foodX = food.x * CELL_SIZE + CELL_SIZE / 2
      const foodY = food.y * CELL_SIZE + CELL_SIZE / 2
      const foodRadius = CELL_SIZE / 2 - 3 + foodPulse

      // Food glow
      ctx.shadowColor = "#e05050"
      ctx.shadowBlur = 12 + foodPulse * 2
      ctx.fillStyle = "#e05050"
      ctx.beginPath()
      ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2)
      ctx.fill()

      // Food highlight
      ctx.shadowBlur = 0
      ctx.fillStyle = "rgba(255, 150, 150, 0.5)"
      ctx.beginPath()
      ctx.arc(foodX - 2, foodY - 2, foodRadius * 0.4, 0, Math.PI * 2)
      ctx.fill()

      // Eat animation ring
      if (ateFood) {
        ctx.strokeStyle = "rgba(224, 80, 80, 0.4)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(foodX, foodY, foodRadius + 6, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw snake
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      const snakeLength = snake.length

      snake.forEach((segment, index) => {
        const x = segment.x * CELL_SIZE
        const y = segment.y * CELL_SIZE
        const padding = index === 0 ? 1 : 2
        const radius = index === 0 ? 6 : 4

        // Color gradient from head to tail
        const progress = index / Math.max(snakeLength - 1, 1)
        const r = Math.round(80 + (40 - 80) * progress)
        const g = Math.round(220 + (160 - 220) * progress)
        const b = Math.round(100 + (80 - 100) * progress)

        if (index === 0) {
          // Head glow
          ctx.shadowColor = `rgb(${r}, ${g}, ${b})`
          ctx.shadowBlur = 10
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.beginPath()
        ctx.roundRect(
          x + padding,
          y + padding,
          CELL_SIZE - padding * 2,
          CELL_SIZE - padding * 2,
          radius
        )
        ctx.fill()
        ctx.shadowBlur = 0

        // Head eyes
        if (index === 0) {
          ctx.fillStyle = "#fff"
          const eyeSize = 3
          const cx = x + CELL_SIZE / 2
          const cy = y + CELL_SIZE / 2

          ctx.beginPath()
          ctx.arc(cx - 4, cy - 3, eyeSize, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(cx + 4, cy - 3, eyeSize, 0, Math.PI * 2)
          ctx.fill()

          // Pupils
          ctx.fillStyle = "#111"
          ctx.beginPath()
          ctx.arc(cx - 3.5, cy - 3, 1.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(cx + 4.5, cy - 3, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [snake, food, ateFood])

  const size = GRID_SIZE * CELL_SIZE

  return (
    <div className="relative">
      <div
        className="rounded-lg border-2 border-border overflow-hidden"
        style={{
          boxShadow: "0 0 40px rgba(80, 220, 100, 0.08), inset 0 0 60px rgba(0,0,0,0.3)",
        }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="block bg-background"
          style={{ width: size, height: size }}
        />
      </div>
    </div>
  )
}
