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
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]],
}

function randomFace(): number {
  return Math.floor(Math.random() * 6) + 1
}

/* A single face of the cube */
function Face({
  value,
  dotColor,
  bg,
  border,
  transform,
  size,
}: {
  value: number
  dotColor: string
  bg: string
  border: string
  transform: string
  size: number
}) {
  const dots = DOT_POSITIONS[value] || DOT_POSITIONS[1]
  const half = size / 2
  const dotR = size * 0.1

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        transform,
        borderRadius: size * 0.18,
        background: bg,
        border: `3px solid ${border}`,
        boxSizing: "border-box",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={dotR * (100 / size)} fill={dotColor} />
        ))}
      </svg>
    </div>
  )
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
      }, 100)
      return () => {
        if (tumbleIntervalRef.current) clearInterval(tumbleIntervalRef.current)
      }
    }
  }, [dice.isRolling])

  const frontValue  = dice.isRolling ? tumbleFace : dice.value > 0 ? dice.value : 6
  const backValue   = 7 - frontValue
  const topValue    = frontValue <= 3 ? frontValue + 1 : frontValue - 1
  const bottomValue = 7 - topValue
  const rightValue  = [1,2,3,4,5,6].find(v => v !== frontValue && v !== backValue && v !== topValue && v !== bottomValue) ?? 3
  const leftValue   = 7 - rightValue

  const isIdle = !dice.isRolling && dice.value === 0
  const dotColor = isIdle ? "#4a5568" : teamColor
  const faceBase = isIdle ? "#1a2535" : "#1a2535"
  const faceDark = isIdle ? "#141d2b" : "#141d2b"
  const faceTop  = isIdle ? "#202e40" : "#202e40"
  const borderColor = isIdle ? "#2d3f55" : teamColor

  const S = 72   // face size in px
  const half = S / 2

  // CSS 3D cube: rotateX(-20deg) rotateY(30deg) gives a nice cartoonish isometric-ish view
  const baseRotation = "rotateX(-22deg) rotateY(32deg)"
  const animation = dice.isRolling
    ? "dice-tumble 0.35s linear infinite"
    : "dice-float 3s ease-in-out infinite"

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
          /* scene container: give space for 3D overhang */
          width: S + 32,
          height: S + 32,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          perspective: 400,
        }}
      >
        {/* 3D scene wrapper */}
        <div
          style={{
            width: S,
            height: S,
            marginTop: 8,
            position: "relative",
            transformStyle: "preserve-3d",
            transform: baseRotation,
            animation,
            filter: `drop-shadow(0 8px 16px ${dotColor}55)`,
          }}
        >
          {/* Front */}
          <Face value={frontValue}  dotColor={dotColor} bg={faceBase}  border={borderColor} transform={`translateZ(${half}px)`}                       size={S} />
          {/* Back */}
          <Face value={backValue}   dotColor={dotColor} bg={faceDark}  border={borderColor} transform={`rotateY(180deg) translateZ(${half}px)`}         size={S} />
          {/* Top */}
          <Face value={topValue}    dotColor={dotColor} bg={faceTop}   border={borderColor} transform={`rotateX(90deg) translateZ(${half}px)`}          size={S} />
          {/* Bottom */}
          <Face value={bottomValue} dotColor={dotColor} bg={faceDark}  border={borderColor} transform={`rotateX(-90deg) translateZ(${half}px)`}         size={S} />
          {/* Right */}
          <Face value={rightValue}  dotColor={dotColor} bg={faceDark}  border={borderColor} transform={`rotateY(90deg) translateZ(${half}px)`}          size={S} />
          {/* Left */}
          <Face value={leftValue}   dotColor={dotColor} bg={faceDark}  border={borderColor} transform={`rotateY(-90deg) translateZ(${half}px)`}         size={S} />
        </div>
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
        @keyframes dice-tumble {
          0%   { transform: ${baseRotation} rotateZ(0deg)   scale(1);    }
          25%  { transform: rotateX(-40deg) rotateY(80deg)  rotateZ(10deg)  scale(1.08); }
          50%  { transform: rotateX(10deg)  rotateY(160deg) rotateZ(-8deg)  scale(0.95); }
          75%  { transform: rotateX(-30deg) rotateY(240deg) rotateZ(6deg)   scale(1.05); }
          100% { transform: ${baseRotation} rotateZ(360deg) scale(1);    }
        }
        @keyframes dice-float {
          0%, 100% { transform: ${baseRotation} translateY(0px);  }
          50%       { transform: ${baseRotation} translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
