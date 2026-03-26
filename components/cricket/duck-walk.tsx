"use client"

import { useEffect, useState, useRef } from "react"
import type { GameState } from "@/lib/cricket-game/types"
import { playSound } from "@/lib/cricket-game/sound-engine"

interface DuckWalkProps {
  state: GameState
  soundEnabled: boolean
}

/*
  Shows a cartoonish walking duck animation over the gameboard when a batter
  is dismissed for 0 runs (golden duck).
  Rendered as an absolute overlay inside the gameboard wrapper.
*/
export function DuckWalk({ state, soundEnabled }: DuckWalkProps) {
  const [visible, setVisible] = useState(false)
  const [batsmanName, setBatsmanName] = useState("")
  const [step, setStep] = useState(0)
  const prevLastSquare = useRef(state.lastSquareLanded)
  const quackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const sq = state.lastSquareLanded
    const prev = prevLastSquare.current
    prevLastSquare.current = sq

    if (sq?.type !== "wicket") return
    if (sq === prev) return

    const batting = state[state.battingTeamKey]
    const batter = batting.players[batting.currentBatsmanIndex]
    if (!batter) return
    if (batter.runs !== 0) return

    setBatsmanName(batter.name)
    setVisible(true)
    setStep(0)

    // Leg cycle for walking animation
    stepTimer.current = setInterval(() => setStep((s) => (s + 1) % 8), 180)

    if (soundEnabled) {
      quackTimer.current = setTimeout(() => playSound("duck-quack"), 400)
      // Second quack
      quackTimer.current = setTimeout(() => playSound("duck-quack"), 1400)
    }

    // Hide after animation (~3.8s)
    hideTimer.current = setTimeout(() => {
      setVisible(false)
      if (stepTimer.current) clearInterval(stepTimer.current)
    }, 3900)

    return () => {
      if (quackTimer.current) clearTimeout(quackTimer.current)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (stepTimer.current) clearInterval(stepTimer.current)
    }
  }, [state.lastSquareLanded, state, soundEnabled])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl"
      aria-hidden="true"
    >
      {/* Duck + label walking right-to-left */}
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          right: "-80px",
          animation: "duck-cross 3.8s linear forwards",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Label */}
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: 900,
            color: "#ffd700",
            textShadow: "0 0 8px #ffd700, 0 1px 3px #000",
            whiteSpace: "nowrap",
            letterSpacing: "0.08em",
            marginBottom: 2,
          }}
        >
          GOLDEN DUCK — {batsmanName}
        </div>
        {/* Duck */}
        <CartoonWalkingDuck step={step} />
      </div>

      <style jsx>{`
        @keyframes duck-cross {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100vw - 160px)); }
        }
      `}</style>
    </div>
  )
}

// ── Cartoonish walking duck with leg cycle ───────────────────────────────────

function CartoonWalkingDuck({ step }: { step: number }) {
  // Body bobs up on even steps
  const bodyBob = step % 2 === 0 ? -2 : 0

  // Left/right leg angles for walk cycle
  const leftLegAngle  = [15, 25, 20, 5, -15, -25, -20, -5][step] ?? 0
  const rightLegAngle = [-15, -25, -20, -5, 15, 25, 20, 5][step] ?? 0

  // Left/right foot spread
  const leftFootX  = 28 + Math.round(Math.sin((leftLegAngle * Math.PI) / 180) * 6)
  const rightFootX = 48 + Math.round(Math.sin((rightLegAngle * Math.PI) / 180) * 6)

  return (
    <svg
      viewBox="0 0 90 80"
      width="72"
      height="64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shadow */}
      <ellipse cx="45" cy="77" rx="22" ry="4" fill="#000" opacity="0.15" />

      {/* Legs — drawn behind body */}
      {/* Left leg */}
      <line
        x1="34" y1={55 + bodyBob}
        x2={leftFootX} y2="68"
        stroke="#ff9900" strokeWidth="5" strokeLinecap="round"
      />
      {/* Right leg */}
      <line
        x1="46" y1={56 + bodyBob}
        x2={rightFootX} y2="68"
        stroke="#ff9900" strokeWidth="5" strokeLinecap="round"
      />

      {/* Feet */}
      <path
        d={`M${leftFootX - 5},68 Q${leftFootX},65 ${leftFootX + 7},68 L${leftFootX + 5},72 Z`}
        fill="#ff9900" stroke="#cc6600" strokeWidth="1"
      />
      <path
        d={`M${rightFootX - 5},68 Q${rightFootX},65 ${rightFootX + 7},68 L${rightFootX + 5},72 Z`}
        fill="#ff9900" stroke="#cc6600" strokeWidth="1"
      />

      {/* Body */}
      <ellipse cx="40" cy={44 + bodyBob} rx="24" ry="18"
        fill="#f5d020" stroke="#1a1a00" strokeWidth="2.5" />

      {/* Wing */}
      <ellipse cx="36" cy={46 + bodyBob} rx="13" ry="9"
        fill="#e8bc00" stroke="#1a1a00" strokeWidth="1.5"
        transform={`rotate(-8 36 ${46 + bodyBob})`} />
      <path d={`M26,${50 + bodyBob} Q34,${42 + bodyBob} 46,${46 + bodyBob}`}
        stroke="#c8a000" strokeWidth="1.5" fill="none" />

      {/* Bat tucked under wing */}
      <rect x="10" y={42 + bodyBob} width="5" height="16" rx="2"
        fill="#c8a060" stroke="#7a5a20" strokeWidth="1.2"
        transform={`rotate(-15 10 ${42 + bodyBob})`} />
      <rect x="9" y={54 + bodyBob} width="7" height="4" rx="1"
        fill="#b89050" stroke="#7a5a20" strokeWidth="1"
        transform={`rotate(-15 9 ${54 + bodyBob})`} />

      {/* Neck */}
      <ellipse cx="58" cy={33 + bodyBob} rx="9" ry="11"
        fill="#f5d020" stroke="#1a1a00" strokeWidth="2.5" />

      {/* White collar */}
      <ellipse cx="54" cy={41 + bodyBob} rx="8" ry="3.5"
        fill="white" stroke="#1a1a00" strokeWidth="1.5" />

      {/* Head */}
      <ellipse cx="64" cy={20 + bodyBob} rx="15" ry="13"
        fill="#2a9a2a" stroke="#1a1a00" strokeWidth="2.5" />

      {/* Eye */}
      <circle cx="71" cy={16 + bodyBob} r="4.5"
        fill="white" stroke="#1a1a00" strokeWidth="1.5" />
      <circle cx="72.5" cy={15.5 + bodyBob} r="2.5" fill="#1a1a00" />
      <circle cx="73.2" cy={14.8 + bodyBob} r="0.9" fill="white" />

      {/* Eyelid / expression */}
      <path d={`M67,${13 + bodyBob} Q71,${10 + bodyBob} 75,${13 + bodyBob}`}
        stroke="#1a4a1a" strokeWidth="1.5" fill="none" />

      {/* Cricket helmet on head */}
      <path d={`M50,${17 + bodyBob} Q52,${5 + bodyBob} 64,${6 + bodyBob} Q76,${5 + bodyBob} 78,${17 + bodyBob}`}
        fill="#c8352a" stroke="#1a1a00" strokeWidth="2" />
      <rect x="49" y={14 + bodyBob} width="5" height="8" rx="2"
        fill="#c8352a" stroke="#1a1a00" strokeWidth="1.5" />
      {/* Grill */}
      <line x1="49" y1={17 + bodyBob} x2="54" y2={17 + bodyBob} stroke="#888" strokeWidth="1" />
      <line x1="49" y1={20 + bodyBob} x2="54" y2={20 + bodyBob} stroke="#888" strokeWidth="1" />

      {/* Bill */}
      <path d={`M78,${22 + bodyBob} Q88,${25 + bodyBob} 84,${29 + bodyBob} Q80,${31 + bodyBob} 70,${27 + bodyBob} Z`}
        fill="#ff9900" stroke="#1a1a00" strokeWidth="2" />
      <line x1="78" y1={26 + bodyBob} x2="84" y2={27 + bodyBob}
        stroke="#cc6600" strokeWidth="1.5" />

      {/* Blush */}
      <circle cx="63" cy={25 + bodyBob} r="4" fill="#ff8866" opacity="0.3" />

      {/* Motion lines */}
      <line x1="2" y1={38 + bodyBob} x2="12" y2={38 + bodyBob} stroke="#888" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="0" y1={44 + bodyBob} x2="12" y2={44 + bodyBob} stroke="#888" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <line x1="3" y1={50 + bodyBob} x2="11" y2={50 + bodyBob} stroke="#888" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
    </svg>
  )
}
