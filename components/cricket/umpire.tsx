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

const SIGNAL_LABELS: Record<UmpireSignal, { label: string; color: string; glow: string }> = {
  idle:       { label: "",         color: "#8ffff0", glow: "transparent"  },
  out:        { label: "OUT!",     color: "#ff6666", glow: "#ff666655"    },
  boundary:   { label: "FOUR!",    color: "#ffe066", glow: "#ffe06655"    },
  six:        { label: "SIX!",     color: "#ffdd33", glow: "#ffdd3355"    },
  wide:       { label: "WIDE",     color: "#cc99ff", glow: "#cc99ff55"    },
  "no-ball":  { label: "NO BALL",  color: "#bb88ee", glow: "#bb88ee55"    },
  byes:       { label: "BYES",     color: "#88ccff", glow: "#88ccff55"    },
  "leg-byes": { label: "LEG BYES", color: "#88ccff", glow: "#88ccff55"    },
  runs:       { label: "RUNS",     color: "#8ffff0", glow: "#8ffff055"    },
  dot:        { label: "DOT",      color: "#888888", glow: "#88888844"    },
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

/* ──────────────────────────────────────────────────────
   Sub-components for each arm/hand pose
   All coordinates are in a 160 x 240 viewBox.
   Shoulder-L = (48,82)   Shoulder-R = (112,82)
   Arms are drawn as upper-arm + forearm + hand/fingers.
   Transition is done via CSS on the wrapping <g>.
   ────────────────────────────────────────────────────── */

/* ── Idle: both arms relaxed at sides ── */
function ArmsIdle() {
  return (
    <>
      {/* Left arm down */}
      <path d="M48,82 L40,115 L38,148" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="150" r="5" fill="#d4a574" />
      {/* Left sleeve */}
      <path d="M48,78 Q42,82 40,96" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Right arm down */}
      <path d="M112,82 L120,115 L122,148" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="122" cy="150" r="5" fill="#d4a574" />
      {/* Right sleeve */}
      <path d="M112,78 Q118,82 120,96" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  )
}

/* ── OUT: right arm straight up, index finger raised ── */
function ArmsOut() {
  return (
    <>
      {/* Left arm relaxed */}
      <path d="M48,82 L40,115 L38,148" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="150" r="5" fill="#d4a574" />
      <path d="M48,78 Q42,82 40,96" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Right arm straight up */}
      <path d="M112,82 L114,60 L115,30" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Index finger pointing up */}
      <line x1="115" y1="30" x2="115" y2="14" stroke="#d4a574" strokeWidth="3.5" strokeLinecap="round" />
      {/* Fist (other fingers curled) */}
      <ellipse cx="115" cy="30" rx="5" ry="6" fill="#d4a574" />
      <path d="M112,78 Q116,75 114,64" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  )
}

/* ── FOUR: right arm waving back and forth in front of chest (official ICC) ── */
function ArmsBoundary() {
  return (
    <>
      {/* Left arm relaxed at side */}
      <path d="M48,82 L40,115 L38,148" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="150" r="5" fill="#d4a574" />
      <path d="M48,78 Q42,82 40,96" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Right arm bent at elbow, forearm across chest waving */}
      <path d="M112,82 L115,100 L70,95" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="70" cy="95" r="5" fill="#d4a574" />
      {/* Open hand */}
      <line x1="67" y1="90" x2="64" y2="86" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="89" x2="70" y2="84" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="73" y1="90" x2="76" y2="86" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <path d="M112,78 Q114,88 115,98" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  )
}

/* ── SIX: both arms raised straight above head ── */
function ArmsSix() {
  return (
    <>
      {/* Left arm up */}
      <path d="M48,82 L42,55 L36,24" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="36" cy="22" r="5" fill="#d4a574" />
      {/* Fingers spread */}
      <line x1="33" y1="19" x2="30" y2="12" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="17" x2="36" y2="10" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="39" y1="19" x2="42" y2="12" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <path d="M48,78 Q44,72 42,58" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Right arm up */}
      <path d="M112,82 L118,55 L124,24" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="124" cy="22" r="5" fill="#d4a574" />
      {/* Fingers spread */}
      <line x1="121" y1="19" x2="118" y2="12" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="124" y1="17" x2="124" y2="10" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="127" y1="19" x2="130" y2="12" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <path d="M112,78 Q116,72 118,58" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  )
}

/* ── WIDE: both arms stretched out horizontally ── */
function ArmsWide() {
  return (
    <>
      {/* Left arm out horizontal */}
      <path d="M48,82 L20,78 L2,80" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="2" cy="80" r="5" fill="#d4a574" />
      {/* Open palm */}
      <line x1="2" y1="75" x2="0" y2="70" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="-1" y1="77" x2="-4" y2="73" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <path d="M48,78 Q38,76 24,76" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Right arm out horizontal */}
      <path d="M112,82 L140,78 L158,80" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="158" cy="80" r="5" fill="#d4a574" />
      {/* Open palm */}
      <line x1="158" y1="75" x2="160" y2="70" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="161" y1="77" x2="164" y2="73" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <path d="M112,78 Q122,76 136,76" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  )
}

/* ── NO BALL: right arm extended horizontally to the side (official ICC) ── */
function ArmsNoBall() {
  return (
    <>
      {/* Left arm relaxed at side */}
      <path d="M48,82 L40,115 L38,148" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="150" r="5" fill="#d4a574" />
      <path d="M48,78 Q42,82 40,96" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Right arm extended straight out horizontally */}
      <path d="M112,82 L145,80 L168,80" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="168" cy="80" r="5" fill="#d4a574" />
      {/* Open palm facing forward */}
      <line x1="168" y1="75" x2="168" y2="69" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="171" y1="76" x2="174" y2="72" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="165" y1="76" x2="162" y2="72" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <path d="M112,78 Q130,78 145,78" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  )
}

/* ── BYES: one open hand raised above head (official ICC) ── */
function ArmsByes() {
  return (
    <>
      {/* Left arm relaxed */}
      <path d="M48,82 L40,115 L38,148" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="150" r="5" fill="#d4a574" />
      <path d="M48,78 Q42,82 40,96" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Right arm raised with open palm */}
      <path d="M112,82 L118,55 L122,28" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="122" cy="26" r="5" fill="#d4a574" />
      {/* Open palm fingers spread */}
      <line x1="119" y1="22" x2="116" y2="14" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="122" y1="20" x2="122" y2="12" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="125" y1="22" x2="128" y2="14" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <line x1="127" y1="25" x2="132" y2="20" stroke="#d4a574" strokeWidth="2" strokeLinecap="round" />
      <path d="M112,78 Q116,72 118,58" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  )
}

/* ── LEG BYES: touch raised knee with hand (official ICC) ── */
function ArmsLegByes() {
  return (
    <>
      {/* Left arm relaxed */}
      <path d="M48,82 L40,115 L38,148" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="150" r="5" fill="#d4a574" />
      <path d="M48,78 Q42,82 40,96" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Right arm bent down touching knee area */}
      <path d="M112,82 L115,110 L95,145" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="95" cy="147" r="5" fill="#d4a574" />
      <path d="M112,78 Q114,90 115,105" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  )
}

/* ── RUNS: both arms relaxed, small acknowledging gesture ── */
function ArmsRuns() {
  return (
    <>
      {/* Left arm relaxed */}
      <path d="M48,82 L40,115 L38,148" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="150" r="5" fill="#d4a574" />
      <path d="M48,78 Q42,82 40,96" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
      {/* Right arm slightly raised in acknowledgment */}
      <path d="M112,82 L125,90 L140,85" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="140" cy="85" r="5" fill="#d4a574" />
      <path d="M112,78 Q118,82 124,86" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  )
}

/* ── DOT BALL: both arms at sides, no signal needed ── */
function ArmsDot() {
  return (
    <>
      {/* Both arms relaxed - same as idle */}
      <path d="M48,82 L40,115 L38,148" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="150" r="5" fill="#d4a574" />
      <path d="M48,78 Q42,82 40,96" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M112,82 L120,115 L122,148" stroke="#d4a574" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="122" cy="150" r="5" fill="#d4a574" />
      <path d="M112,78 Q118,82 120,96" stroke="#e8e8e8" strokeWidth="9" strokeLinecap="round" fill="none" />
    </>
  )
}

const ARM_COMPONENTS: Record<UmpireSignal, React.FC> = {
  idle: ArmsIdle,
  out: ArmsOut,
  boundary: ArmsBoundary,
  six: ArmsSix,
  wide: ArmsWide,
  "no-ball": ArmsNoBall,
  byes: ArmsByes,
  "leg-byes": ArmsLegByes,
  runs: ArmsRuns,
  dot: ArmsDot,
}

export function Umpire({ state }: UmpireProps) {
  const [signal, setSignal] = useState<UmpireSignal>("idle")

  useEffect(() => {
    if (state.lastSquareLanded) {
      const s = squareTypeToSignal(state.lastSquareLanded.type)
      setSignal(s)
    } else {
      const t = setTimeout(() => {
        setSignal("idle")
      }, 300)
      return () => clearTimeout(t)
    }
  }, [state.lastSquareLanded])

  const cfg = SIGNAL_LABELS[signal]
  const isActive = signal !== "idle"
  const ArmsPose = ARM_COMPONENTS[signal]

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Umpire figure */}
      <div
        className="relative"
        style={{
          filter: isActive ? `drop-shadow(0 0 18px ${cfg.glow})` : "none",
          transition: "filter 0.4s ease",
        }}
      >
        <svg
          width="90"
          height="129"
          viewBox="-10 0 180 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`Umpire signalling ${signal}`}
          role="img"
          className="overflow-visible"
        >
          {/* ── Wide-brim sun hat ── */}
          <ellipse cx="80" cy="34" rx="26" ry="8" fill="#f0f0f0" stroke="#ccc" strokeWidth="1" />
          <path d="M62,34 Q62,14 80,12 Q98,14 98,34" fill="#f5f5f5" stroke="#ccc" strokeWidth="1" />
          {/* Hat band */}
          <rect x="62" y="30" width="36" height="5" rx="2" fill="#1a3a1a" />

          {/* ── Head ── */}
          <ellipse cx="80" cy="48" rx="14" ry="16" fill="#d4a574" stroke="#b8896a" strokeWidth="1" />
          {/* Sunglasses */}
          <rect x="68" y="44" width="10" height="7" rx="2" fill="#1a1a2a" stroke="#333" strokeWidth="0.8" />
          <rect x="82" y="44" width="10" height="7" rx="2" fill="#1a1a2a" stroke="#333" strokeWidth="0.8" />
          <line x1="78" y1="47" x2="82" y2="47" stroke="#333" strokeWidth="1" />
          {/* Nose */}
          <ellipse cx="80" cy="52" rx="2" ry="1.5" fill="#c29468" />
          {/* Mouth - expression changes */}
          {signal === "out" ? (
            <ellipse cx="80" cy="58" rx="3" ry="2.5" fill="#2a2a3a" />
          ) : signal === "six" || signal === "boundary" ? (
            <path d="M74,56 Q80,62 86,56" stroke="#2a2a3a" strokeWidth="1.5" fill="none" />
          ) : (
            <path d="M76,58 L84,58" stroke="#8a6a5a" strokeWidth="1.2" strokeLinecap="round" />
          )}

          {/* ── Neck ── */}
          <rect x="74" y="62" width="12" height="8" rx="3" fill="#d4a574" />

          {/* ── Body: white cricket umpire coat ── */}
          <path
            d="M48,76 L44,170 L116,170 L112,76 Q112,68 80,68 Q48,68 48,76Z"
            fill="#f0f0f0"
            stroke="#ddd"
            strokeWidth="1"
          />
          {/* Coat collar */}
          <path d="M64,70 L80,78 L96,70" fill="none" stroke="#ddd" strokeWidth="1.5" />
          {/* Coat center line */}
          <line x1="80" y1="78" x2="80" y2="168" stroke="#e0e0e0" strokeWidth="1" />
          {/* Buttons */}
          <circle cx="80" cy="92" r="2" fill="#ccc" stroke="#bbb" strokeWidth="0.5" />
          <circle cx="80" cy="108" r="2" fill="#ccc" stroke="#bbb" strokeWidth="0.5" />
          <circle cx="80" cy="124" r="2" fill="#ccc" stroke="#bbb" strokeWidth="0.5" />
          <circle cx="80" cy="140" r="2" fill="#ccc" stroke="#bbb" strokeWidth="0.5" />
          {/* Pockets */}
          <rect x="54" y="110" width="16" height="12" rx="2" fill="none" stroke="#ddd" strokeWidth="1" />
          <rect x="90" y="110" width="16" height="12" rx="2" fill="none" stroke="#ddd" strokeWidth="1" />
          {/* Coat hem line */}
          <line x1="44" y1="168" x2="116" y2="168" stroke="#ddd" strokeWidth="1" />

          {/* ── Arms (signal-specific) ── */}
          <ArmsPose />

          {/* ── Legs: dark trousers ── */}
          <path d="M58,170 L56,210 L50,212 L62,212 L60,170" fill="#2a2a3a" stroke="#1a1a2a" strokeWidth="0.5" />
          <path d="M100,170 L102,210 L96,212 L108,212 L106,170" fill="#2a2a3a" stroke="#1a1a2a" strokeWidth="0.5" />

          {/* ── Shoes ── */}
          <ellipse cx="55" cy="215" rx="10" ry="5" fill="#1a1a1a" />
          <ellipse cx="103" cy="215" rx="10" ry="5" fill="#1a1a1a" />
          {/* Shoe shine */}
          <ellipse cx="53" cy="213" rx="4" ry="1.5" fill="#2a2a2a" />
          <ellipse cx="101" cy="213" rx="4" ry="1.5" fill="#2a2a2a" />

          {/* ── Belt ── */}
          <rect x="48" y="155" width="64" height="5" rx="2" fill="#3a3a3a" />
          <rect x="76" y="154" width="8" height="7" rx="1" fill="#888" stroke="#666" strokeWidth="0.5" />
        </svg>

        {/* Glow aura */}
        {isActive && (
          <div
            className="absolute inset-0 -z-10 animate-pulse rounded-full"
            style={{
              background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Umpire
      </span>
    </div>
  )
}
