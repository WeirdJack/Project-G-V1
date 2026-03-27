"use client"

import { useEffect, useRef, useState } from "react"
import type { GameState } from "@/lib/cricket-game/types"

interface ThunderEffectProps {
  state: GameState
}

interface Bolt {
  id: number
  path: string
  glowColor: string
  coreColor: string
  opacity: number
  strokeWidth: number
}

// Vertical jagged bolt (for SIX) — top to bottom
function makeSixBolt(id: number): Bolt {
  const startX = 5 + Math.random() * 90
  let path = `M ${startX} 0`
  let cy = 0
  let cx = startX
  while (cy < 105) {
    cy += 7 + Math.random() * 12
    cx += (Math.random() - 0.5) * 20
    path += ` L ${cx.toFixed(1)} ${cy.toFixed(1)}`
  }
  return {
    id,
    path,
    glowColor: "#ffe066",
    coreColor: "#fff8b0",
    opacity: 0.85 + Math.random() * 0.15,
    strokeWidth: 0.9,
  }
}

// Horizontal streak (for FOUR) — side to side with slight diagonal
function makeFourStreak(id: number): Bolt {
  const startY = 10 + Math.random() * 80
  let path = `M -2 ${startY}`
  let cx = 0
  let cy = startY
  while (cx < 105) {
    cx += 8 + Math.random() * 14
    cy += (Math.random() - 0.5) * 10
    path += ` L ${cx.toFixed(1)} ${cy.toFixed(1)}`
  }
  return {
    id,
    path,
    glowColor: "#00e5ff",
    coreColor: "#b0f8ff",
    opacity: 0.8 + Math.random() * 0.2,
    strokeWidth: 0.7,
  }
}

export function ThunderEffect({ state }: ThunderEffectProps) {
  const [bolts, setBolts] = useState<Bolt[]>([])
  const [flash, setFlash] = useState<{ color: string } | null>(null)
  // Track last triggered ball event by a stable string key
  const prevKeyRef = useRef<string>("")
  const idRef = useRef(0)

  useEffect(() => {
    const sq = state.lastSquareLanded
    if (!sq) return

    const isFour = sq.type === "boundary"
    const isSix  = sq.type === "six"
    if (!isFour && !isSix) return

    // Build a key from the ball event itself + run total so it's unique per ball
    const batting = state[state.battingTeamKey]
    const key = `${sq.type}|${batting.overs}|${batting.balls}|${batting.totalRuns}|${batting.wickets}`
    if (key === prevKeyRef.current) return
    prevKeyRef.current = key

    // Haptic vibration
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(isSix ? [60, 30, 100, 30, 80] : [80, 30, 50])
    }

    // Flash colour differs: cyan for four, gold for six
    setFlash({ color: isSix ? "rgba(255,220,50,0.20)" : "rgba(0,229,255,0.15)" })
    setTimeout(() => setFlash(null), isSix ? 550 : 400)

    // First wave of bolts
    const count = isSix ? 8 : 5
    const make = isSix ? makeSixBolt : makeFourStreak
    setBolts(Array.from({ length: count }, () => make(++idRef.current)))

    // Second flicker
    const t1 = setTimeout(() => {
      setBolts(Array.from({ length: Math.ceil(count * 0.6) }, () => make(++idRef.current)))
    }, isSix ? 170 : 140)

    // Third flicker (sixes only)
    const t2 = isSix
      ? setTimeout(() => {
          setBolts(Array.from({ length: 4 }, () => makeSixBolt(++idRef.current)))
        }, 310)
      : null

    // Clear
    const t3 = setTimeout(() => setBolts([]), isSix ? 500 : 380)

    return () => {
      clearTimeout(t1)
      if (t2) clearTimeout(t2)
      clearTimeout(t3)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.lastSquareLanded,
    state.battingTeamKey,
    // Include ball-level counters so the effect always re-runs on each delivery
    state.team1.balls,
    state.team1.overs,
    state.team1.totalRuns,
    state.team2.balls,
    state.team2.overs,
    state.team2.totalRuns,
  ])

  if (bolts.length === 0 && !flash) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {/* Full-screen flash */}
      {flash && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: flash.color, transition: "opacity 0.4s ease-out" }}
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
            {/* Outer glow */}
            <path
              d={bolt.path}
              stroke={bolt.glowColor}
              strokeWidth={bolt.strokeWidth * 4}
              fill="none"
              opacity={bolt.opacity * 0.3}
              strokeLinecap="round"
            />
            {/* Mid glow */}
            <path
              d={bolt.path}
              stroke={bolt.glowColor}
              strokeWidth={bolt.strokeWidth * 2}
              fill="none"
              opacity={bolt.opacity * 0.55}
              strokeLinecap="round"
            />
            {/* Core */}
            <path
              d={bolt.path}
              stroke={bolt.coreColor}
              strokeWidth={bolt.strokeWidth}
              fill="none"
              opacity={bolt.opacity}
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
