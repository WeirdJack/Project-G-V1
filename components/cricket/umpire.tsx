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
  | "byes"
  | "leg-byes"
  | "runs"
  | "dot"

const SIGNAL_LABELS: Record<UmpireSignal, { label: string; color: string; bg: string }> = {
  idle:       { label: "",         color: "#a0b8c0", bg: "transparent"  },
  out:        { label: "OUT!",     color: "#ff4444", bg: "#ff444422"    },
  boundary:   { label: "FOUR!",    color: "#ffd700", bg: "#ffd70022"    },
  six:        { label: "SIX!",     color: "#ffaa00", bg: "#ffaa0022"    },
  wide:       { label: "WIDE",     color: "#cc77ff", bg: "#cc77ff22"    },
  "no-ball":  { label: "NO BALL",  color: "#aa66ff", bg: "#aa66ff22"    },
  byes:       { label: "BYES",     color: "#66bbff", bg: "#66bbff22"    },
  "leg-byes": { label: "LEG BYES", color: "#66bbff", bg: "#66bbff22"    },
  runs:       { label: "RUNS",     color: "#66ffcc", bg: "#66ffcc22"    },
  dot:        { label: "DOT",      color: "#667788", bg: "#66778822"    },
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

function UmpireSVG({ signal }: { signal: UmpireSignal }) {
  const isActive = signal !== "idle" && signal !== "dot"
  const color = isActive ? SIGNAL_LABELS[signal].color : "#a0b8c0"

  // Arm positions per signal
  const armConfigs: Record<UmpireSignal, { left: string; right: string }> = {
    idle:       { left: "M25,42 L20,58",   right: "M35,42 L40,58"  },
    out:        { left: "M25,42 L20,58",   right: "M35,42 L38,24"  },
    boundary:   { left: "M25,42 L14,46",   right: "M35,42 L46,46"  },
    six:        { left: "M25,42 L20,26",   right: "M35,42 L40,26"  },
    wide:       { left: "M25,42 L12,42",   right: "M35,42 L48,42"  },
    "no-ball":  { left: "M25,42 L20,58",   right: "M35,42 L48,42"  },
    byes:       { left: "M25,42 L20,58",   right: "M35,42 L40,26"  },
    "leg-byes": { left: "M25,42 L20,58",   right: "M35,42 L42,54"  },
    runs:       { left: "M25,42 L20,58",   right: "M35,42 L44,48"  },
    dot:        { left: "M25,42 L20,58",   right: "M35,42 L40,58"  },
  }

  const arms = armConfigs[signal]

  return (
    <svg
      viewBox="0 0 60 90"
      width="44"
      height="66"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Umpire signalling ${signal}`}
      role="img"
    >
      {/* Head */}
      <circle cx="30" cy="14" r="10" fill="#d4a96a" stroke="#5a3a1a" strokeWidth="1.5" />
      {/* Hat */}
      <ellipse cx="30" cy="6" rx="12" ry="3" fill="#f5f0dc" stroke="#5a3a1a" strokeWidth="1.2" />
      <rect x="22" y="2" width="16" height="6" rx="2" fill="#f5f0dc" stroke="#5a3a1a" strokeWidth="1.2" />
      {/* Eyes */}
      <circle cx="26" cy="13" r="1.5" fill="#3a2a1a" />
      <circle cx="34" cy="13" r="1.5" fill="#3a2a1a" />
      {/* Body */}
      <rect x="20" y="24" width="20" height="26" rx="4" fill="#f5f0dc" stroke="#5a3a1a" strokeWidth="1.5" />
      {/* Buttons */}
      <circle cx="30" cy="30" r="1.2" fill="#aaa" />
      <circle cx="30" cy="37" r="1.2" fill="#aaa" />
      <circle cx="30" cy="44" r="1.2" fill="#aaa" />
      {/* Left arm */}
      <path d={arms.left} stroke="#d4a96a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d={arms.left} stroke="#f5f0dc" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Right arm */}
      <path d={arms.right} stroke="#d4a96a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d={arms.right} stroke={isActive ? color : "#f5f0dc"} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Trousers */}
      <rect x="20" y="48" width="9" height="22" rx="3" fill="#3a4a6a" stroke="#1a2a4a" strokeWidth="1" />
      <rect x="31" y="48" width="9" height="22" rx="3" fill="#3a4a6a" stroke="#1a2a4a" strokeWidth="1" />
      {/* Shoes */}
      <ellipse cx="24" cy="72" rx="7" ry="3" fill="#1a1a2a" />
      <ellipse cx="36" cy="72" rx="7" ry="3" fill="#1a1a2a" />
    </svg>
  )
}

export function Umpire({ state }: UmpireProps) {
  const [signal, setSignal] = useState<UmpireSignal>("idle")

  useEffect(() => {
    if (state.lastSquareLanded) {
      const s = squareTypeToSignal(state.lastSquareLanded.type)
      setSignal(s)
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
        style={{
          transition: "transform 0.2s ease",
          transform: isActive ? "scale(1.08)" : "scale(1)",
        }}
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
    </div>
  )
}
