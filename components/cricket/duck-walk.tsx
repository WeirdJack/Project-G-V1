"use client"

import { useEffect, useState, useRef } from "react"
import type { GameState } from "@/lib/cricket-game/types"
import { playSound } from "@/lib/cricket-game/sound-engine"

interface DuckWalkProps {
  state: GameState
  soundEnabled: boolean
}

/*
  Shows a walking duck animation over the gameboard when a batter is dismissed for 0 runs.
  Rendered as an absolute overlay inside the gameboard wrapper.
*/
export function DuckWalk({ state, soundEnabled }: DuckWalkProps) {
  const [visible, setVisible] = useState(false)
  const [batsmanName, setBatsmanName] = useState("")
  const prevLastSquare = useRef(state.lastSquareLanded)
  const quackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const sq = state.lastSquareLanded
    const prev = prevLastSquare.current
    prevLastSquare.current = sq

    if (sq?.type !== "wicket") return
    if (sq === prev) return

    const batting = state[state.battingTeamKey]
    const batter = batting.players[batting.currentBatsmanIndex]
    if (!batter) return

    // Golden duck: out for 0
    if (batter.runs !== 0) return

    setBatsmanName(batter.name)
    setVisible(true)

    if (soundEnabled) {
      quackTimer.current = setTimeout(() => {
        playSound("duck-quack")
      }, 400)
    }

    // Hide after animation completes (~3.4s)
    hideTimer.current = setTimeout(() => {
      setVisible(false)
    }, 3500)

    return () => {
      if (quackTimer.current) clearTimeout(quackTimer.current)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [state.lastSquareLanded, state, soundEnabled])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl"
      aria-hidden="true"
    >
      {/* Label above duck */}
      <div
        className="absolute font-sans text-[11px] font-black text-yellow-300"
        style={{
          bottom: "38%",
          left: "calc(100% + 4px)",
          animation: "duck-walk-label 3.2s linear forwards",
          whiteSpace: "nowrap",
          textShadow: "0 0 8px #ffd700, 0 1px 3px #000",
        }}
      >
        GOLDEN DUCK — {batsmanName}
      </div>

      {/* The walking duck */}
      <div
        style={{
          position: "absolute",
          bottom: "28%",
          left: "calc(100% + 4px)",
          animation: "duck-walk 3.2s linear forwards",
        }}
      >
        <WalkingDuck />
      </div>

      <style jsx>{`
        @keyframes duck-walk {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-200% - 120px)); }
        }
        @keyframes duck-walk-label {
          0%   { transform: translateX(0); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateX(calc(-200% - 200px)); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function WalkingDuck() {
  return (
    <div style={{ animation: "duck-waddle 0.4s ease-in-out infinite alternate" }}>
      <svg
        viewBox="0 0 80 70"
        width="60"
        height="53"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Body */}
        <ellipse cx="38" cy="44" rx="26" ry="20" fill="#f5d020" stroke="#1a1a00" strokeWidth="2.5" />
        {/* Wing */}
        <ellipse cx="34" cy="46" rx="14" ry="10" fill="#e8bc00" stroke="#1a1a00" strokeWidth="1.5" transform="rotate(-10 34 46)" />
        <path d="M24,50 Q32,42 44,46" stroke="#c8a000" strokeWidth="1.5" fill="none" />
        {/* Neck */}
        <ellipse cx="54" cy="34" rx="10" ry="12" fill="#f5d020" stroke="#1a1a00" strokeWidth="2.5" />
        {/* Head */}
        <ellipse cx="60" cy="22" rx="14" ry="13" fill="#2a9a2a" stroke="#1a1a00" strokeWidth="2.5" />
        {/* White collar ring */}
        <ellipse cx="55" cy="31" rx="9" ry="4" fill="white" stroke="#1a1a00" strokeWidth="1.5" />
        {/* Eye */}
        <circle cx="66" cy="18" r="4" fill="white" stroke="#1a1a00" strokeWidth="1.5" />
        <circle cx="67" cy="17" r="2" fill="#1a1a00" />
        <circle cx="68" cy="16" r="0.8" fill="white" />
        {/* Bill */}
        <path d="M72,22 Q82,24 78,28 Q74,30 66,26 Z" fill="#ff9900" stroke="#1a1a00" strokeWidth="2" />
        <line x1="72" y1="25" x2="79" y2="26" stroke="#cc6600" strokeWidth="1.5" />
        {/* Cricket bat */}
        <rect x="14" y="50" width="4" height="14" rx="1" fill="#c8a060" stroke="#7a5a20" strokeWidth="1.2" transform="rotate(15 14 50)" />
        <rect x="13" y="60" width="6" height="4" rx="0.5" fill="#c8a060" stroke="#7a5a20" strokeWidth="1" transform="rotate(15 13 60)" />
        {/* Legs */}
        <line x1="30" y1="62" x2="24" y2="72" stroke="#ff9900" strokeWidth="3" strokeLinecap="round" />
        <line x1="44" y1="62" x2="50" y2="72" stroke="#ff9900" strokeWidth="3" strokeLinecap="round" />
        {/* Feet */}
        <path d="M20,72 L24,70 L28,72 L26,74 Z" fill="#ff9900" stroke="#1a1a00" strokeWidth="1.2" />
        <path d="M46,72 L50,70 L54,72 L52,74 Z" fill="#ff9900" stroke="#1a1a00" strokeWidth="1.2" />
      </svg>

      <style jsx>{`
        @keyframes duck-waddle {
          0%   { transform: rotate(-4deg) translateY(0px); }
          100% { transform: rotate(4deg) translateY(-3px); }
        }
      `}</style>
    </div>
  )
}
