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

function DiceFace({ value, color, size }: { value: number; color: string; size: number }) {
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1]
  const dotR = size < 80 ? 8 : 10
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {dots.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={dotR}
          fill={color}
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
      ))}
    </svg>
  )
}

export function Dice({ state, onRoll }: DiceProps) {
  const { dice } = state
  const isCpu = isCpuBatting(state)
  const canRoll = !dice.isRolling && !state.tokenAnimation.isAnimating && !state.flashEffect && !isCpu
  const teamColor = state.battingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR

  // Tumbling random faces during roll
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

  // Determine which face to show
  const displayValue = dice.isRolling ? tumbleFace : dice.value > 0 ? dice.value : 0
  const showIdle = !dice.isRolling && dice.value === 0

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={canRoll ? () => { unlockAudio(); onRoll(); } : undefined}
        disabled={!canRoll}
        className="group relative"
        style={{ perspective: "600px" }}
        aria-label={canRoll ? "Roll dice" : dice.isRolling ? "Rolling..." : "Wait"}
      >
        <div
          className="flex items-center justify-center rounded-2xl border-2"
          style={{
            width: 96,
            height: 96,
            borderColor: teamColor,
            backgroundColor: "#0c1424",
            boxShadow: dice.isRolling
              ? `0 0 28px ${teamColor}66, 0 0 8px ${teamColor}33 inset`
              : `0 0 20px ${teamColor}55, 0 0 40px ${teamColor}22`,
            animation: dice.isRolling
              ? "dice-tumble 0.2s ease-in-out infinite"
              : "dice-neon-glow 2s ease-in-out infinite",
            cursor: canRoll ? "pointer" : "default",
            transition: "box-shadow 0.3s ease, border-color 0.3s ease",
          }}
        >
          {showIdle ? (
            /* Idle: show a static "ready" dice face (value 6) with muted color */
            <DiceFace value={6} color="#3a4a5a" size={72} />
          ) : (
            <DiceFace value={displayValue || 1} color={teamColor} size={72} />
          )}
        </div>

        {/* Hover glow ring */}
        {canRoll && !dice.isRolling && (
          <div
            className="absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              border: `1px solid ${teamColor}55`,
              boxShadow: `0 0 30px ${teamColor}22`,
            }}
          />
        )}
      </button>

      <p className="font-sans text-xs text-muted-foreground">
        {dice.isRolling
          ? "Rolling..."
          : isCpu
            ? "CPU is playing..."
            : canRoll
              ? "Roll to play"
              : ""}
      </p>

      <style jsx>{`
        @keyframes dice-tumble {
          0% { transform: rotateX(0deg) rotateZ(0deg) scale(1); }
          20% { transform: rotateX(72deg) rotateZ(15deg) scale(1.08); }
          40% { transform: rotateX(144deg) rotateZ(-10deg) scale(0.95); }
          60% { transform: rotateX(216deg) rotateZ(12deg) scale(1.06); }
          80% { transform: rotateX(288deg) rotateZ(-8deg) scale(0.97); }
          100% { transform: rotateX(360deg) rotateZ(0deg) scale(1); }
        }
        @keyframes dice-neon-glow {
          0%, 100% { 
            opacity: 0.85;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  )
}
