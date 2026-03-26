"use client"

import { useState, useRef, useEffect } from "react"
import type { GameState } from "@/lib/cricket-game/types"
import { isCpuBatting } from "@/lib/cricket-game/game-engine"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"
import { unlockAudio } from "@/lib/cricket-game/sound-engine"

interface DiceProps {
  state: GameState
  onRoll: () => void
}

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}

/* Random face to show while tumbling */
function randomFace(): number {
  return Math.floor(Math.random() * 6) + 1
}

/* Dot grid for a single face */
function FaceDots({ value, color }: { value: number; color: string }) {
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1]
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      {dots.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={10}
          fill={color}
          style={{ filter: `drop-shadow(0 0 3px ${color}aa)` }}
        />
      ))}
    </svg>
  )
}

/* The opposite face value (so the cube looks correct) */
function opposite(v: number) {
  return 7 - v
}

export function Dice({ state, onRoll }: DiceProps) {
  const { dice } = state
  const isCpu = isCpuBatting(state)
  const canRoll = !dice.isRolling && !state.tokenAnimation.isAnimating && !state.flashEffect && !isCpu
  const teamColor = state.battingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR

  const [tumbleFace, setTumbleFace] = useState(1)
  const tumbleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (dice.isRolling) {
      tumbleIntervalRef.current = setInterval(() => {
        setTumbleFace(randomFace())
      }, 80)
      return () => {
        if (tumbleIntervalRef.current) clearInterval(tumbleIntervalRef.current)
      }
    }
  }, [dice.isRolling])

  const frontValue = dice.isRolling ? tumbleFace : dice.value > 0 ? dice.value : 6
  const topValue = opposite(frontValue) === frontValue ? (frontValue % 6) + 1 : Math.max(1, (frontValue + 1) % 7 || 1)
  const rightValue = [1, 2, 3, 4, 5, 6].find(v => v !== frontValue && v !== topValue && v !== opposite(frontValue)) ?? 3

  // Face colors: front is vivid, top/right are darker variants
  const faceColor = dice.isRolling || dice.value > 0 ? teamColor : "#3a4a5a"
  const bgFront  = "#0c1424"
  const bgTop    = "#0a111e"
  const bgRight  = "#060d18"

  // The cube size — the visible "front face" size
  const S = 80  // px
  const D = 22  // depth/skew size

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={canRoll ? () => { unlockAudio(); onRoll(); } : undefined}
        disabled={!canRoll}
        aria-label={canRoll ? "Roll dice" : dice.isRolling ? "Rolling..." : "Wait"}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: canRoll ? "pointer" : "default",
          width: S + D,
          height: S + D,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          animation: dice.isRolling
            ? "cube-tumble 0.25s ease-in-out infinite"
            : "cube-float 3s ease-in-out infinite",
        }}
      >
        {/* 3D cube built from 3 parallelogram faces */}
        <svg
          width={S + D}
          height={S + D}
          viewBox={`0 0 ${S + D} ${S + D}`}
          style={{ overflow: "visible", display: "block" }}
        >
          <defs>
            {/* Clip paths for each face */}
            {/* Front face: bottom-left square */}
            <clipPath id="clip-front">
              <polygon points={`0,${D} ${S},${D} ${S},${S+D} 0,${S+D}`} />
            </clipPath>
            {/* Top face: parallelogram on top */}
            <clipPath id="clip-top">
              <polygon points={`${D},0 ${S+D},0 ${S},${D} 0,${D}`} />
            </clipPath>
            {/* Right face: parallelogram on right */}
            <clipPath id="clip-right">
              <polygon points={`${S},${D} ${S+D},0 ${S+D},${S} ${S},${S+D}`} />
            </clipPath>
          </defs>

          {/* --- TOP FACE --- */}
          <polygon
            points={`${D},0 ${S+D},0 ${S},${D} 0,${D}`}
            fill={bgTop}
            stroke={faceColor}
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          {/* Top face dots — transform into parallelogram space */}
          <g clipPath="url(#clip-top)" style={{ pointerEvents: "none" }}>
            <g transform={`matrix(0.78,−0.45,0.78,0.45,${D/2},0)`} style={{ transformOrigin: `${S/2}px ${D/2}px` }}>
              <FaceDots value={topValue} color={faceColor} />
            </g>
          </g>

          {/* --- RIGHT FACE --- */}
          <polygon
            points={`${S},${D} ${S+D},0 ${S+D},${S} ${S},${S+D}`}
            fill={bgRight}
            stroke={faceColor}
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <g clipPath="url(#clip-right)" style={{ pointerEvents: "none" }}>
            <g transform={`matrix(0.78,0.45,0,1,${S},${D/2})`} style={{ transformOrigin: `${S}px ${(S+D)/2}px` }}>
              <FaceDots value={rightValue} color={faceColor} />
            </g>
          </g>

          {/* --- FRONT FACE --- */}
          <rect
            x={0} y={D}
            width={S} height={S}
            rx={6}
            fill={bgFront}
            stroke={faceColor}
            strokeWidth="2"
            style={{
              filter: dice.isRolling
                ? `drop-shadow(0 0 10px ${faceColor}88)`
                : `drop-shadow(0 0 6px ${faceColor}55)`,
            }}
          />
          <g clipPath="url(#clip-front)">
            <g transform={`translate(0,${D})`}>
              <svg viewBox="0 0 100 100" width={S} height={S} style={{ display: "block" }}>
                {(DOT_POSITIONS[frontValue] || DOT_POSITIONS[1]).map(([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx} cy={cy} r={10}
                    fill={faceColor}
                    style={{ filter: `drop-shadow(0 0 3px ${faceColor}aa)` }}
                  />
                ))}
              </svg>
            </g>
          </g>

          {/* Edge highlight on front-top border */}
          <line
            x1={0} y1={D}
            x2={S} y2={D}
            stroke={faceColor}
            strokeWidth="2"
            strokeOpacity="0.7"
          />
          {/* Edge highlight on front-right border */}
          <line
            x1={S} y1={D}
            x2={S} y2={S+D}
            stroke={faceColor}
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
        </svg>
      </button>

      <p className="font-sans text-xs text-muted-foreground h-4 flex items-center justify-center">
        {dice.isRolling
          ? "Rolling..."
          : isCpu
            ? "CPU is playing..."
            : canRoll
              ? "Roll to play"
              : "\u00A0"}
      </p>

      <style jsx>{`
        @keyframes cube-tumble {
          0%   { transform: rotateX(0deg)   rotateY(0deg)   scale(1);    }
          25%  { transform: rotateX(15deg)  rotateY(20deg)  scale(1.06); }
          50%  { transform: rotateX(-10deg) rotateY(-15deg) scale(0.96); }
          75%  { transform: rotateX(12deg)  rotateY(10deg)  scale(1.04); }
          100% { transform: rotateX(0deg)   rotateY(0deg)   scale(1);    }
        }
        @keyframes cube-float {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-3px);  }
        }
      `}</style>
    </div>
  )
}
