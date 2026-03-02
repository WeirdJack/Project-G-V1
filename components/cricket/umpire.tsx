"use client"

import { useEffect, useState } from "react"
import type { GameState, SquareType } from "@/lib/cricket-game/types"

type UmpireSignal =
  | "idle"
  | "out"
  | "boundary"
  | "six"
  | "wide"
  | "no-ball"
  | "single"
  | "double"
  | "triple"

const SIGNAL_CONFIG: Record<
  UmpireSignal,
  {
    label: string
    labelColor: string
    glowColor: string
    // Left arm angle (degrees from down), Right arm angle
    leftArm: number
    rightArm: number
  }
> = {
  idle:     { label: "",         labelColor: "#8ffff0", glowColor: "transparent",  leftArm: 0,   rightArm: 0   },
  out:      { label: "OUT!",     labelColor: "#ff6666", glowColor: "#ff666644",    leftArm: 0,   rightArm: 170 },
  boundary: { label: "FOUR!",    labelColor: "#ffe066", glowColor: "#ffe06644",    leftArm: 90,  rightArm: 90  },
  six:      { label: "SIX!",     labelColor: "#ffdd33", glowColor: "#ffdd3344",    leftArm: 170, rightArm: 170 },
  wide:     { label: "WIDE",     labelColor: "#cc99ff", glowColor: "#cc99ff44",    leftArm: 90,  rightArm: 90  },
  "no-ball":{ label: "NO BALL",  labelColor: "#bb88ee", glowColor: "#bb88ee44",    leftArm: 90,  rightArm: 0   },
  single:   { label: "1 RUN",    labelColor: "#8ffff0", glowColor: "#8ffff044",    leftArm: 0,   rightArm: 30  },
  double:   { label: "2 RUNS",   labelColor: "#8ffff0", glowColor: "#8ffff044",    leftArm: 0,   rightArm: 50  },
  triple:   { label: "3 RUNS",   labelColor: "#8ffff0", glowColor: "#8ffff044",    leftArm: 0,   rightArm: 70  },
}

function squareTypeToSignal(type: SquareType | null): UmpireSignal {
  if (!type) return "idle"
  switch (type) {
    case "wicket":   return "out"
    case "boundary": return "boundary"
    case "six":      return "six"
    case "wide":     return "wide"
    case "no-ball":  return "no-ball"
    case "single":   return "single"
    case "double":   return "double"
    case "triple":   return "triple"
    default:         return "idle"
  }
}

interface UmpireProps {
  state: GameState
}

export function Umpire({ state }: UmpireProps) {
  const [signal, setSignal] = useState<UmpireSignal>("idle")
  const [showLabel, setShowLabel] = useState(false)

  useEffect(() => {
    if (state.lastSquareLanded) {
      const newSignal = squareTypeToSignal(state.lastSquareLanded.type)
      setSignal(newSignal)
      setShowLabel(true)
    } else {
      // Delay returning to idle so the signal lingers
      const t = setTimeout(() => {
        setSignal("idle")
        setShowLabel(false)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [state.lastSquareLanded])

  const config = SIGNAL_CONFIG[signal]
  const isActive = signal !== "idle"

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Signal label */}
      <div
        className="flex h-8 items-center justify-center font-mono text-sm font-bold tracking-widest transition-all duration-300"
        style={{
          color: config.labelColor,
          opacity: showLabel && config.label ? 1 : 0,
          transform: showLabel && config.label ? "translateY(0)" : "translateY(8px)",
          textShadow: showLabel ? `0 0 12px ${config.glowColor}` : "none",
        }}
      >
        {config.label}
      </div>

      {/* Umpire SVG figure */}
      <div
        className="relative"
        style={{
          filter: isActive ? `drop-shadow(0 0 16px ${config.glowColor})` : "none",
          transition: "filter 0.4s ease",
        }}
      >
        <svg
          width="100"
          height="160"
          viewBox="0 0 100 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`Umpire signalling ${signal}`}
          role="img"
        >
          {/* Hat */}
          <ellipse
            cx="50"
            cy="22"
            rx="18"
            ry="6"
            fill="#3a3a5a"
            stroke="#5a5a8a"
            strokeWidth="1"
          />
          <rect x="38" y="8" width="24" height="16" rx="4" fill="#3a3a5a" stroke="#5a5a8a" strokeWidth="1" />

          {/* Head */}
          <circle cx="50" cy="34" r="12" fill="#d4a574" stroke="#b8896a" strokeWidth="1" />

          {/* Eyes */}
          <circle cx="46" cy="32" r="1.5" fill="#2a2a3a" />
          <circle cx="54" cy="32" r="1.5" fill="#2a2a3a" />

          {/* Mouth - changes with signal */}
          {signal === "out" ? (
            <circle cx="50" cy="38" r="2" fill="#2a2a3a" />
          ) : signal === "six" ? (
            <path d="M46 37 Q50 41 54 37" stroke="#2a2a3a" strokeWidth="1.5" fill="none" />
          ) : (
            <path d="M47 38 L53 38" stroke="#2a2a3a" strokeWidth="1" />
          )}

          {/* Body / Coat */}
          <path
            d="M38 48 L38 100 L62 100 L62 48 Q62 44 50 44 Q38 44 38 48Z"
            fill="#2a2a4a"
            stroke="#4a4a7a"
            strokeWidth="1"
          />
          {/* Coat buttons */}
          <circle cx="50" cy="60" r="1.5" fill="#6a6a9a" />
          <circle cx="50" cy="72" r="1.5" fill="#6a6a9a" />
          <circle cx="50" cy="84" r="1.5" fill="#6a6a9a" />

          {/* Left arm */}
          <g
            style={{
              transformOrigin: "38px 52px",
              transform: `rotate(-${config.leftArm}deg)`,
              transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <line
              x1="38"
              y1="52"
              x2="38"
              y2="86"
              stroke="#d4a574"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Left hand */}
            <circle cx="38" cy="88" r="4" fill="#d4a574" stroke="#b8896a" strokeWidth="0.5" />
            {/* Sleeve */}
            <rect x="33" y="48" width="10" height="12" rx="3" fill="#2a2a4a" stroke="#4a4a7a" strokeWidth="0.5" />

            {/* Finger raised on OUT signal (left hand) */}
            {signal === "out" && config.leftArm > 100 && (
              <line
                x1="38"
                y1="88"
                x2="38"
                y2="80"
                stroke="#d4a574"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
          </g>

          {/* Right arm */}
          <g
            style={{
              transformOrigin: "62px 52px",
              transform: `rotate(${config.rightArm}deg)`,
              transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <line
              x1="62"
              y1="52"
              x2="62"
              y2="86"
              stroke="#d4a574"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Right hand */}
            <circle cx="62" cy="88" r="4" fill="#d4a574" stroke="#b8896a" strokeWidth="0.5" />
            {/* Sleeve */}
            <rect x="57" y="48" width="10" height="12" rx="3" fill="#2a2a4a" stroke="#4a4a7a" strokeWidth="0.5" />

            {/* Finger raised on OUT signal (right hand for out) */}
            {signal === "out" && (
              <line
                x1="62"
                y1="84"
                x2="62"
                y2="74"
                stroke="#d4a574"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
          </g>

          {/* Legs */}
          <line x1="44" y1="100" x2="42" y2="140" stroke="#2a2a3a" strokeWidth="6" strokeLinecap="round" />
          <line x1="56" y1="100" x2="58" y2="140" stroke="#2a2a3a" strokeWidth="6" strokeLinecap="round" />

          {/* Shoes */}
          <ellipse cx="40" cy="144" rx="7" ry="4" fill="#1a1a2a" />
          <ellipse cx="60" cy="144" rx="7" ry="4" fill="#1a1a2a" />
        </svg>

        {/* Glow ring behind on active signal */}
        {isActive && (
          <div
            className="absolute inset-0 -z-10 animate-pulse rounded-full"
            style={{
              background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* "Umpire" label */}
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Umpire
      </span>
    </div>
  )
}
