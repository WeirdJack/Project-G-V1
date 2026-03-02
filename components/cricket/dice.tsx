"use client"

import type { GameState } from "@/lib/cricket-game/types"
import { isCpuBatting } from "@/lib/cricket-game/game-engine"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"

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

export function Dice({ state, onRoll }: DiceProps) {
  const { dice } = state
  const isCpu = isCpuBatting(state)
  const canRoll = !dice.isRolling && !state.tokenAnimation.isAnimating && !state.flashEffect && !isCpu
  const teamColor = state.battingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
  const showValue = dice.value > 0
  const dots = showValue ? DOT_POSITIONS[dice.value] || [] : []

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={canRoll ? onRoll : undefined}
        disabled={!canRoll}
        className="group relative"
        style={{ perspective: "400px" }}
        aria-label={canRoll ? "Roll dice" : dice.isRolling ? "Rolling..." : "Wait"}
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-xl border-2 transition-transform sm:h-24 sm:w-24"
          style={{
            borderColor: canRoll ? teamColor : "#2a3a4a",
            backgroundColor: "#0f1a2a",
            boxShadow: canRoll
              ? `0 0 16px ${teamColor}44`
              : dice.isRolling
                ? `0 0 20px ${teamColor}66`
                : "none",
            animation: dice.isRolling ? "dice-roll 0.15s ease-in-out infinite" : "none",
            cursor: canRoll ? "pointer" : "default",
            transform: canRoll ? "scale(1)" : undefined,
          }}
        >
          {dice.isRolling ? (
            <span
              className="font-mono text-3xl font-bold sm:text-4xl"
              style={{ color: teamColor, animation: "number-flash 0.1s infinite" }}
            >
              ?
            </span>
          ) : showValue ? (
            <svg viewBox="0 0 100 100" className="h-full w-full p-3">
              {dots.map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={10}
                  fill={teamColor}
                  style={{
                    filter: `drop-shadow(0 0 4px ${teamColor}88)`,
                  }}
                />
              ))}
            </svg>
          ) : (
            <span className="font-mono text-lg text-muted-foreground">ROLL</span>
          )}
        </div>

        {/* Hover ring */}
        {canRoll && (
          <div
            className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              border: `1px solid ${teamColor}44`,
              boxShadow: `0 0 24px ${teamColor}22`,
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
              ? "Click to roll"
              : state.flashEffect
                ? ""
                : ""}
      </p>

      <style jsx>{`
        @keyframes dice-roll {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(8deg) scale(1.05); }
          50% { transform: rotate(-8deg) scale(1); }
          75% { transform: rotate(4deg) scale(1.05); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes number-flash {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
