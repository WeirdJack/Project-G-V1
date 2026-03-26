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
  | "runs"
  | "dot"

const SIGNAL_LABELS: Record<UmpireSignal, { label: string; color: string; bg: string }> = {
  idle:      { label: "",         color: "#a0b8c0", bg: "transparent" },
  out:       { label: "OUT!",     color: "#ff4444", bg: "#ff444422"   },
  boundary:  { label: "FOUR!",    color: "#ffd700", bg: "#ffd70022"   },
  six:       { label: "SIX!",     color: "#ffaa00", bg: "#ffaa0022"   },
  wide:      { label: "WIDE",     color: "#cc77ff", bg: "#cc77ff22"   },
  "no-ball": { label: "NO BALL",  color: "#aa66ff", bg: "#aa66ff22"   },
  runs:      { label: "RUNS",     color: "#66ffcc", bg: "#66ffcc22"   },
  dot:       { label: "DOT",      color: "#667788", bg: "#66778822"   },
}

function squareTypeToSignal(type: SquareType | null): UmpireSignal {
  if (!type) return "idle"
  switch (type) {
    case "wicket":   return "out"
    case "boundary": return "boundary"
    case "six":      return "six"
    case "wide":     return "wide"
    case "no-ball":  return "no-ball"
    case "single":
    case "double":
    case "triple":   return "runs"
    case "dot":      return "dot"
    default:         return "idle"
  }
}

interface UmpireProps {
  state: GameState
}

// Arm path endpoints per signal
const ARM_PATHS: Record<UmpireSignal, { left: string; right: string }> = {
  idle:      { left: "M10,18 L6,28",   right: "M18,18 L22,28"  },
  out:       { left: "M10,18 L6,28",   right: "M18,18 L22,8"   },
  boundary:  { left: "M10,18 L4,18",   right: "M18,18 L24,18"  },
  six:       { left: "M10,18 L6,10",   right: "M18,18 L22,10"  },
  wide:      { left: "M10,18 L2,18",   right: "M18,18 L26,18"  },
  "no-ball": { left: "M10,18 L6,28",   right: "M18,18 L26,18"  },
  runs:      { left: "M10,18 L6,28",   right: "M18,18 L22,14"  },
  dot:       { left: "M10,18 L6,28",   right: "M18,18 L22,28"  },
}

function UmpireSVG({ signal }: { signal: UmpireSignal }) {
  const isActive = signal !== "idle" && signal !== "dot"
  const signalColor = SIGNAL_LABELS[signal].color
  const arms = ARM_PATHS[signal]

  return (
    <svg viewBox="0 0 28 52" width="40" height="74" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Head */}
      <circle cx="14" cy="7" r="6" fill="#d4a96a" stroke="#555" strokeWidth="1" />
      {/* Hat */}
      <rect x="8" y="1" width="12" height="5" rx="2" fill="#f5f0dc" stroke="#555" strokeWidth="1" />
      <rect x="6" y="4" width="16" height="2" rx="1" fill="#f5f0dc" stroke="#555" strokeWidth="0.5" />
      {/* Eyes */}
      <circle cx="11" cy="7" r="1" fill="#333" />
      <circle cx="17" cy="7" r="1" fill="#333" />
      {/* Body */}
      <rect x="8" y="14" width="12" height="16" rx="3" fill="#f5f0dc" stroke="#555" strokeWidth="1" />
      {/* Left arm */}
      <line
        x1={arms.left.split("L")[0].replace("M", "").split(",")[0]}
        y1={arms.left.split("L")[0].replace("M", "").split(",")[1]}
        x2={arms.left.split("L")[1].split(",")[0]}
        y2={arms.left.split("L")[1].split(",")[1]}
        stroke="#f5f0dc"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={arms.left.split("L")[0].replace("M", "").split(",")[0]}
        y1={arms.left.split("L")[0].replace("M", "").split(",")[1]}
        x2={arms.left.split("L")[1].split(",")[0]}
        y2={arms.left.split("L")[1].split(",")[1]}
        stroke="#555"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Right arm */}
      <line
        x1={arms.right.split("L")[0].replace("M", "").split(",")[0]}
        y1={arms.right.split("L")[0].replace("M", "").split(",")[1]}
        x2={arms.right.split("L")[1].split(",")[0]}
        y2={arms.right.split("L")[1].split(",")[1]}
        stroke={isActive ? signalColor : "#f5f0dc"}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={arms.right.split("L")[0].replace("M", "").split(",")[0]}
        y1={arms.right.split("L")[0].replace("M", "").split(",")[1]}
        x2={arms.right.split("L")[1].split(",")[0]}
        y2={arms.right.split("L")[1].split(",")[1]}
        stroke="#555"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Legs */}
      <rect x="9" y="30" width="4" height="14" rx="2" fill="#2a3a5a" stroke="#555" strokeWidth="1" />
      <rect x="15" y="30" width="4" height="14" rx="2" fill="#2a3a5a" stroke="#555" strokeWidth="1" />
      {/* Shoes */}
      <ellipse cx="11" cy="45" rx="5" ry="2.5" fill="#111" />
      <ellipse cx="17" cy="45" rx="5" ry="2.5" fill="#111" />
    </svg>
  )
}

export function Umpire({ state }: UmpireProps) {
  const [signal, setSignal] = useState<UmpireSignal>("idle")
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    if (state.lastSquareLanded) {
      const s = squareTypeToSignal(state.lastSquareLanded.type)
      setSignal(s)
      setAnimKey((k) => k + 1)
    } else {
      const t = setTimeout(() => setSignal("idle"), 300)
      return () => clearTimeout(t)
    }
  }, [state.lastSquareLanded])

  const cfg = SIGNAL_LABELS[signal]
  const isActive = signal !== "idle"

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        key={animKey}
        style={{ animation: isActive ? "umpire-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both" : "none" }}
      >
        <UmpireSVG signal={signal} />
      </div>
      {isActive ? (
        <span
          className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
          style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}55` }}
        >
          {cfg.label}
        </span>
      ) : (
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/50">
          Umpire
        </span>
      )}
      <style jsx>{`
        @keyframes umpire-pop {
          0%   { transform: scale(0.85); }
          60%  { transform: scale(1.1);  }
          100% { transform: scale(1);    }
        }
      `}</style>
    </div>
  )
}
