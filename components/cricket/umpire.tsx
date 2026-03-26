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

/* ── Cartoonish umpire SVG ── */
/* ViewBox: 0 0 100 160, drawn with thick outlines and bold colors */

function CartoonUmpire({ signal }: { signal: UmpireSignal }) {
  const isActive = signal !== "idle" && signal !== "dot"
  const skinColor = "#f5c89a"
  const coatColor = "#f8f8f2"
  const coatDark = "#e8e8d8"
  const hatColor = "#f0eed0"
  const trouserColor = "#2a3a5a"
  const shoeColor = "#1a1a2a"
  const outlineWidth = 3.5
  const accentColor = signal === "idle" || signal === "dot" ? "#5a8a6a" : SIGNAL_LABELS[signal].color

  /* Arm configs per signal */
  type ArmConfig = {
    leftUpper: string; leftFore: string; leftHand: [number, number]
    rightUpper: string; rightFore: string; rightHand: [number, number]
  }

  const arms: Record<UmpireSignal, ArmConfig> = {
    idle:      { leftUpper: "M33,62 L26,80",  leftFore:  "M26,80 L24,98",  leftHand:  [24,100], rightUpper: "M67,62 L74,80",  rightFore:  "M74,80 L76,98",  rightHand:  [76,100] },
    out:       { leftUpper: "M33,62 L26,80",  leftFore:  "M26,80 L24,98",  leftHand:  [24,100], rightUpper: "M67,62 L72,45",  rightFore:  "M72,45 L72,22",  rightHand:  [72,18]  },
    boundary:  { leftUpper: "M33,62 L26,80",  leftFore:  "M26,80 L24,98",  leftHand:  [24,100], rightUpper: "M67,62 L74,72",  rightFore:  "M74,72 L50,70",  rightHand:  [47,70]  },
    six:       { leftUpper: "M33,62 L28,44",  leftFore:  "M28,44 L24,22",  leftHand:  [24,18],  rightUpper: "M67,62 L72,44",  rightFore:  "M72,44 L76,22",  rightHand:  [76,18]  },
    wide:      { leftUpper: "M33,62 L18,60",  leftFore:  "M18,60 L4,60",   leftHand:  [2,60],   rightUpper: "M67,62 L82,60",  rightFore:  "M82,60 L96,60",  rightHand:  [98,60]  },
    "no-ball": { leftUpper: "M33,62 L26,80",  leftFore:  "M26,80 L24,98",  leftHand:  [24,100], rightUpper: "M67,62 L82,60",  rightFore:  "M82,60 L96,60",  rightHand:  [98,60]  },
    byes:      { leftUpper: "M33,62 L26,80",  leftFore:  "M26,80 L24,98",  leftHand:  [24,100], rightUpper: "M67,62 L72,44",  rightFore:  "M72,44 L76,22",  rightHand:  [76,18]  },
    "leg-byes":{ leftUpper: "M33,62 L26,80",  leftFore:  "M26,80 L24,98",  leftHand:  [24,100], rightUpper: "M67,62 L74,72",  rightFore:  "M74,72 L68,96",  rightHand:  [66,99]  },
    runs:      { leftUpper: "M33,62 L26,80",  leftFore:  "M26,80 L24,98",  leftHand:  [24,100], rightUpper: "M67,62 L80,68",  rightFore:  "M80,68 L92,64",  rightHand:  [94,63]  },
    dot:       { leftUpper: "M33,62 L26,80",  leftFore:  "M26,80 L24,98",  leftHand:  [24,100], rightUpper: "M67,62 L74,80",  rightFore:  "M74,80 L76,98",  rightHand:  [76,100] },
  }

  const a = arms[signal]

  return (
    <svg
      viewBox="-4 0 108 165"
      width="80"
      height="112"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Umpire signalling ${signal}`}
      role="img"
      style={{ overflow: "visible" }}
    >
      {/* ── Glow halo when active ── */}
      {isActive && (
        <ellipse
          cx="50" cy="80"
          rx="46" ry="72"
          fill={SIGNAL_LABELS[signal].bg}
          style={{ filter: `blur(8px)` }}
        />
      )}

      {/* ── LEFT ARM (drawn behind body) ── */}
      <path d={a.leftUpper} stroke={skinColor} strokeWidth={10} strokeLinecap="round" fill="none" />
      <path d={a.leftUpper} stroke="#1a2a1a" strokeWidth={outlineWidth + 7} strokeLinecap="round" fill="none" style={{ opacity: 0.5 }} />
      {/* Sleeve */}
      <path d={a.leftUpper} stroke={coatColor} strokeWidth={12} strokeLinecap="round" fill="none" />
      <path d={a.leftUpper} stroke="#1a2a1a" strokeWidth={outlineWidth + 9} strokeLinecap="round" fill="none" style={{ opacity: 0.18 }} />
      <path d={a.leftFore}  stroke={skinColor} strokeWidth={9}  strokeLinecap="round" fill="none" />
      <path d={a.leftFore}  stroke="#1a2a1a" strokeWidth={outlineWidth + 6} strokeLinecap="round" fill="none" style={{ opacity: 0.4 }} />
      <circle cx={a.leftHand[0]}  cy={a.leftHand[1]}  r={5.5} fill={skinColor} stroke="#1a2a1a" strokeWidth={2.5} />

      {/* ── RIGHT ARM (drawn behind body) ── */}
      <path d={a.rightUpper} stroke={skinColor} strokeWidth={10} strokeLinecap="round" fill="none" />
      <path d={a.rightUpper} stroke="#1a2a1a" strokeWidth={outlineWidth + 7} strokeLinecap="round" fill="none" style={{ opacity: 0.5 }} />
      <path d={a.rightUpper} stroke={coatColor} strokeWidth={12} strokeLinecap="round" fill="none" />
      <path d={a.rightUpper} stroke="#1a2a1a" strokeWidth={outlineWidth + 9} strokeLinecap="round" fill="none" style={{ opacity: 0.18 }} />
      <path d={a.rightFore}  stroke={skinColor} strokeWidth={9}  strokeLinecap="round" fill="none" />
      <path d={a.rightFore}  stroke="#1a2a1a" strokeWidth={outlineWidth + 6} strokeLinecap="round" fill="none" style={{ opacity: 0.4 }} />
      {/* Pointing finger for OUT */}
      {signal === "out" && (
        <line x1="72" y1="22" x2="72" y2="9" stroke={skinColor} strokeWidth={5} strokeLinecap="round" />
      )}
      <circle cx={a.rightHand[0]} cy={a.rightHand[1]} r={5.5} fill={skinColor} stroke="#1a2a1a" strokeWidth={2.5} />

      {/* ── LEGS & SHOES ── */}
      {/* Left leg */}
      <path d="M40,118 L38,148 L34,154" stroke={trouserColor} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M40,118 L38,148 L34,154" stroke="#1a2a1a" strokeWidth={outlineWidth + 10} strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ opacity: 0.4 }} />
      {/* Right leg */}
      <path d="M60,118 L62,148 L66,154" stroke={trouserColor} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M60,118 L62,148 L66,154" stroke="#1a2a1a" strokeWidth={outlineWidth + 10} strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ opacity: 0.4 }} />
      {/* Left shoe */}
      <ellipse cx="32" cy="156" rx="11" ry="5" fill={shoeColor} stroke="#1a2a1a" strokeWidth={2.5} />
      <ellipse cx="30" cy="154" rx="4" ry="2" fill="#333" />
      {/* Right shoe */}
      <ellipse cx="68" cy="156" rx="11" ry="5" fill={shoeColor} stroke="#1a2a1a" strokeWidth={2.5} />
      <ellipse cx="70" cy="154" rx="4" ry="2" fill="#333" />

      {/* ── BODY (white coat) ── */}
      {/* Outline first */}
      <path
        d="M28,60 Q26,120 34,120 L66,120 Q74,120 72,60 Q72,52 50,50 Q28,52 28,60Z"
        fill="#1a2a1a"
        style={{ opacity: 0.5 }}
        transform="translate(0,3)"
      />
      <path
        d="M28,60 Q26,120 34,120 L66,120 Q74,120 72,60 Q72,52 50,50 Q28,52 28,60Z"
        fill={coatColor}
        stroke="#1a2a1a"
        strokeWidth={outlineWidth}
      />
      {/* Lapels */}
      <path d="M50,58 L40,66 L36,60" fill={coatDark} stroke="#1a2a1a" strokeWidth={2} />
      <path d="M50,58 L60,66 L64,60" fill={coatDark} stroke="#1a2a1a" strokeWidth={2} />
      {/* Center line */}
      <line x1="50" y1="66" x2="50" y2="118" stroke="#d8d8c8" strokeWidth={1.5} />
      {/* Buttons */}
      {[76, 88, 100, 112].map((y, i) => (
        <circle key={i} cx="50" cy={y} r={2.5} fill={accentColor} stroke="#1a2a1a" strokeWidth={1.5} />
      ))}
      {/* Belt */}
      <rect x="31" y="112" width="38" height="6" rx="2" fill="#2a3a2a" stroke="#1a2a1a" strokeWidth={2} />
      <rect x="46" y="111" width="8" height="8" rx="1.5" fill={accentColor} stroke="#1a2a1a" strokeWidth={1.5} />
      {/* Pocket */}
      <rect x="34" y="82" width="12" height="9" rx="2" fill={coatDark} stroke="#d8d8c8" strokeWidth={1} />
      {/* Pocket accent square */}
      <rect x="36" y="84" width="4" height="3" rx="0.5" fill={accentColor} />

      {/* ── NECK ── */}
      <rect x="43" y="48" width="14" height="10" rx="5" fill={skinColor} stroke="#1a2a1a" strokeWidth={outlineWidth} />

      {/* ── HEAD ── */}
      {/* Head shadow */}
      <ellipse cx="51" cy="35" rx="20" ry="20" fill="#1a2a1a" style={{ opacity: 0.3 }} transform="translate(1,3)" />
      {/* Head base */}
      <ellipse cx="50" cy="34" rx="20" ry="20" fill={skinColor} stroke="#1a2a1a" strokeWidth={outlineWidth} />
      {/* Cheek blush */}
      <ellipse cx="35" cy="38" rx="5" ry="3.5" fill="#f0a080" style={{ opacity: 0.5 }} />
      <ellipse cx="65" cy="38" rx="5" ry="3.5" fill="#f0a080" style={{ opacity: 0.5 }} />
      {/* Sunglasses */}
      <rect x="34" y="30" width="12" height="8" rx="3" fill="#1a1a2a" stroke="#333" strokeWidth={2} />
      <rect x="54" y="30" width="12" height="8" rx="3" fill="#1a1a2a" stroke="#333" strokeWidth={2} />
      <line x1="46" y1="34" x2="54" y2="34" stroke="#333" strokeWidth={2} />
      {/* Glasses shine */}
      <circle cx="37" cy="32" r={1.5} fill="white" style={{ opacity: 0.6 }} />
      <circle cx="57" cy="32" r={1.5} fill="white" style={{ opacity: 0.6 }} />
      {/* Nose */}
      <ellipse cx="50" cy="41" rx="2.5" ry="2" fill="#d4a070" stroke="#1a2a1a" strokeWidth={1} />
      {/* Mouth */}
      {signal === "out" ? (
        <ellipse cx="50" cy="46" rx="5" ry="3" fill="#1a1a2a" stroke="#1a1a2a" strokeWidth={1} />
      ) : signal === "six" || signal === "boundary" ? (
        <>
          <path d="M42,45 Q50,52 58,45" stroke="#1a1a2a" strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <path d="M44,46 Q50,50 56,46" fill="#ff8888" style={{ opacity: 0.5 }} />
        </>
      ) : (
        <path d="M43,46 Q50,50 57,46" stroke="#1a1a2a" strokeWidth={2} fill="none" strokeLinecap="round" />
      )}
      {/* Ear left */}
      <ellipse cx="30" cy="34" rx="4" ry="5.5" fill={skinColor} stroke="#1a2a1a" strokeWidth={outlineWidth} />
      {/* Ear right */}
      <ellipse cx="70" cy="34" rx="4" ry="5.5" fill={skinColor} stroke="#1a2a1a" strokeWidth={outlineWidth} />

      {/* ── HAT ── */}
      {/* Brim */}
      <ellipse cx="50" cy="16" rx="26" ry="5.5" fill={hatColor} stroke="#1a2a1a" strokeWidth={outlineWidth} />
      {/* Crown */}
      <path d="M28,16 Q28,2 50,2 Q72,2 72,16" fill={hatColor} stroke="#1a2a1a" strokeWidth={outlineWidth} />
      {/* Hat band */}
      <rect x="29" y="12" width="42" height="5" rx="1" fill={accentColor} stroke="#1a2a1a" strokeWidth={1.5} />
      {/* Hat highlight */}
      <ellipse cx="50" cy="6" rx="8" ry="2" fill="white" style={{ opacity: 0.2 }} />
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
        <CartoonUmpire signal={signal} />
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
