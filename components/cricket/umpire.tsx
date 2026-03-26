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

function CartoonUmpireSVG({ signal }: { signal: UmpireSignal }) {
  const isActive = signal !== "idle" && signal !== "dot"
  const signalColor = isActive ? SIGNAL_LABELS[signal].color : "#a0b8c0"

  // Arm positions per signal — exaggerated for cartoon feel
  const armConfigs: Record<UmpireSignal, { left: string; right: string }> = {
    idle:       { left: "M24,46 L18,62",   right: "M36,46 L42,62"  },
    out:        { left: "M24,46 L18,62",   right: "M36,46 L40,22"  },
    boundary:   { left: "M24,46 L12,44",   right: "M36,46 L48,44"  },
    six:        { left: "M24,46 L18,28",   right: "M36,46 L42,28"  },
    wide:       { left: "M24,46 L10,46",   right: "M36,46 L50,46"  },
    "no-ball":  { left: "M24,46 L18,62",   right: "M36,46 L50,46"  },
    byes:       { left: "M24,46 L18,62",   right: "M36,46 L40,22"  },
    "leg-byes": { left: "M24,46 L18,62",   right: "M36,46 L44,56"  },
    runs:       { left: "M24,46 L18,62",   right: "M36,46 L46,50"  },
    dot:        { left: "M24,46 L18,62",   right: "M36,46 L42,62"  },
  }

  const arms = armConfigs[signal]
  // Hat band / button color changes with signal
  const accentColor = isActive ? signalColor : "#e8c97a"

  return (
    <svg
      viewBox="0 0 60 96"
      width="52"
      height="83"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Umpire signalling ${signal}`}
      role="img"
    >
      {/* --- Body shadow --- */}
      <ellipse cx="30" cy="90" rx="16" ry="4" fill="#000" opacity="0.18" />

      {/* --- Trousers --- */}
      <rect x="19" y="54" width="10" height="26" rx="4" fill="#2a3a5a" stroke="#111" strokeWidth="2" />
      <rect x="31" y="54" width="10" height="26" rx="4" fill="#2a3a5a" stroke="#111" strokeWidth="2" />
      {/* Crease */}
      <line x1="24" y1="55" x2="24" y2="78" stroke="#1a2a4a" strokeWidth="1" />
      <line x1="36" y1="55" x2="36" y2="78" stroke="#1a2a4a" strokeWidth="1" />

      {/* --- Shoes --- */}
      <ellipse cx="24" cy="82" rx="9" ry="4" fill="#111" stroke="#000" strokeWidth="1.5" />
      <ellipse cx="36" cy="82" rx="9" ry="4" fill="#111" stroke="#000" strokeWidth="1.5" />
      {/* Shoe shine */}
      <ellipse cx="21" cy="80" rx="3" ry="1.5" fill="#fff" opacity="0.18" />
      <ellipse cx="33" cy="80" rx="3" ry="1.5" fill="#fff" opacity="0.18" />

      {/* --- Body (white coat) --- */}
      <rect x="17" y="26" width="26" height="30" rx="6" fill="#f5f0dc" stroke="#222" strokeWidth="2.5" />
      {/* Coat lapels */}
      <path d="M30,26 L24,34 L30,32 L36,34 Z" fill="#e8e0c8" stroke="#222" strokeWidth="1.5" />
      {/* Coat pocket */}
      <rect x="20" y="42" width="8" height="6" rx="2" fill="#e8e0c8" stroke="#333" strokeWidth="1" />
      {/* Buttons with signal color */}
      <circle cx="30" cy="34" r="2" fill={accentColor} stroke="#333" strokeWidth="1" />
      <circle cx="30" cy="41" r="2" fill={accentColor} stroke="#333" strokeWidth="1" />
      <circle cx="30" cy="48" r="2" fill={accentColor} stroke="#333" strokeWidth="1" />

      {/* --- Left arm (sleeve) --- */}
      <path d={arms.left} stroke="#222" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d={arms.left} stroke="#f5f0dc" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Left hand */}
      <circle cx={arms.left.split(" ").pop()?.split(",")[0] ?? "18"} cy={arms.left.split(" ").pop()?.split(",")[1] ?? "62"} r="3.5" fill="#d4a96a" stroke="#222" strokeWidth="1.5" />

      {/* --- Right arm (sleeve) --- */}
      <path d={arms.right} stroke="#222" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d={arms.right} stroke={isActive ? signalColor : "#f5f0dc"} strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Right hand */}
      <circle cx={arms.right.split(" ").pop()?.split(",")[0] ?? "42"} cy={arms.right.split(" ").pop()?.split(",")[1] ?? "62"} r="3.5" fill="#d4a96a" stroke="#222" strokeWidth="1.5" />

      {/* --- Neck --- */}
      <rect x="26" y="22" width="8" height="8" rx="3" fill="#d4a96a" stroke="#222" strokeWidth="1.5" />

      {/* --- Head --- */}
      <circle cx="30" cy="14" r="13" fill="#d4a96a" stroke="#222" strokeWidth="2.5" />
      {/* Ear left */}
      <ellipse cx="17" cy="14" rx="3" ry="4" fill="#c4996a" stroke="#222" strokeWidth="1.5" />
      {/* Ear right */}
      <ellipse cx="43" cy="14" rx="3" ry="4" fill="#c4996a" stroke="#222" strokeWidth="1.5" />
      {/* Blush */}
      <ellipse cx="22" cy="17" rx="4" ry="2.5" fill="#e08080" opacity="0.35" />
      <ellipse cx="38" cy="17" rx="4" ry="2.5" fill="#e08080" opacity="0.35" />

      {/* --- Sunglasses --- */}
      <rect x="19" y="10" width="9" height="6" rx="2.5" fill="#1a1a2a" stroke="#444" strokeWidth="1.2" />
      <rect x="32" y="10" width="9" height="6" rx="2.5" fill="#1a1a2a" stroke="#444" strokeWidth="1.2" />
      <line x1="28" y1="13" x2="32" y2="13" stroke="#555" strokeWidth="1.2" />
      {/* Lens shine */}
      <ellipse cx="22" cy="12" rx="1.8" ry="1.2" fill="#fff" opacity="0.22" />
      <ellipse cx="35" cy="12" rx="1.8" ry="1.2" fill="#fff" opacity="0.22" />

      {/* --- Mouth --- */}
      {isActive
        ? <path d="M25,20 Q30,24 35,20" stroke="#5a2a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        : <line x1="26" y1="21" x2="34" y2="21" stroke="#5a2a1a" strokeWidth="1.5" strokeLinecap="round" />
      }

      {/* --- Hat --- */}
      {/* Brim */}
      <ellipse cx="30" cy="4" rx="16" ry="4" fill="#f5f0dc" stroke="#222" strokeWidth="2" />
      {/* Crown */}
      <rect x="20" y="-5" width="20" height="12" rx="4" fill="#f5f0dc" stroke="#222" strokeWidth="2" />
      {/* Hat band with signal color */}
      <rect x="20" y="1" width="20" height="3" rx="1" fill={accentColor} stroke="#33330033" strokeWidth="0" />
      {/* Hat top shine */}
      <ellipse cx="30" cy="-3" rx="6" ry="2" fill="#fff" opacity="0.12" />
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
        style={{
          animation: isActive ? "umpire-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
        }}
      >
        <CartoonUmpireSVG signal={signal} />
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
          0%   { transform: scale(0.85) rotate(-4deg); }
          60%  { transform: scale(1.12) rotate(2deg);  }
          100% { transform: scale(1)    rotate(0deg);  }
        }
      `}</style>
    </div>
  )
}
