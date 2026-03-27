"use client"

import { useEffect, useRef, useState } from "react"
import type { GameState } from "@/lib/cricket-game/types"

interface ThunderEffectProps {
  state: GameState
}

interface Bolt {
  id: number
  x: number
  path: string
  opacity: number
  color: string
}

function randomBolt(id: number, isSix: boolean): Bolt {
  const x = 5 + Math.random() * 90
  const color = isSix ? "#ffe066" : "#88eeff"
  // Generate a jagged lightning path downward
  let path = `M ${x} 0`
  let cy = 0
  let cx = x
  while (cy < 100) {
    const dy = 8 + Math.random() * 14
    const dx = (Math.random() - 0.5) * 18
    cy += dy
    cx += dx
    path += ` L ${cx} ${cy}`
  }
  return { id, x, path, opacity: 0.85 + Math.random() * 0.15, color }
}

export function ThunderEffect({ state }: ThunderEffectProps) {
  const [bolts, setBolts] = useState<Bolt[]>([])
  const [flash, setFlash] = useState<{ color: string; opacity: number } | null>(null)
  const prevSquareRef = useRef<string | null>(null)
  const idRef = useRef(0)

  useEffect(() => {
    const sq = state.lastSquareLanded
    if (!sq) return
    // Use balls bowled as part of key so each delivery triggers independently
    const batting = state[state.battingTeamKey]
    const key = `${sq.type}-${batting.overs}-${batting.balls}-${batting.totalRuns}`
    if (key === prevSquareRef.current) return
    prevSquareRef.current = key

    const isFour = sq.type === "boundary"
    const isSix = sq.type === "six"
    if (!isFour && !isSix) return

    // Haptic vibration
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(isSix ? [80, 40, 120] : [60])
    }

    // Screen flash
    const flashColor = isSix ? "rgba(255,220,50,0.22)" : "rgba(100,220,255,0.18)"
    setFlash({ color: flashColor, opacity: 1 })
    setTimeout(() => setFlash(null), 500)

    // Generate multiple bolts
    const count = isSix ? 8 : 5
    const newBolts = Array.from({ length: count }, (_, i) => randomBolt(++idRef.current, isSix))
    setBolts(newBolts)

    // Two flicker rounds for realism
    setTimeout(() => {
      setBolts(Array.from({ length: Math.ceil(count / 2) }, (_, i) => randomBolt(++idRef.current, isSix)))
    }, 180)
    setTimeout(() => setBolts([]), 420)
  }, [state.lastSquareLanded, state.battingTeamKey, state.team1.overs, state.team1.balls, state.team2.overs, state.team2.balls])

  if (bolts.length === 0 && !flash) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden="true"
    >
      {/* Full-screen flash */}
      {flash && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ backgroundColor: flash.color }}
        />
      )}

      {/* Lightning bolts */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {bolts.map((bolt) => (
          <g key={bolt.id}>
            {/* Glow outer */}
            <path
              d={bolt.path}
              stroke={bolt.color}
              strokeWidth="2.5"
              fill="none"
              opacity={bolt.opacity * 0.35}
              strokeLinecap="round"
              filter="blur(3px)"
            />
            {/* Core bolt */}
            <path
              d={bolt.path}
              stroke={bolt.color}
              strokeWidth="0.8"
              fill="none"
              opacity={bolt.opacity}
              strokeLinecap="round"
            />
            {/* Bright white core */}
            <path
              d={bolt.path}
              stroke="white"
              strokeWidth="0.3"
              fill="none"
              opacity={bolt.opacity * 0.7}
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
