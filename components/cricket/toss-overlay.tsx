"use client"

import type { GameState } from "@/lib/cricket-game/types"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"

interface TossOverlayProps {
  state: GameState
}

export function TossOverlay({ state }: TossOverlayProps) {
  if (!state.toss) return null

  const winnerName = state.toss.winner === "team1" ? state.team1.name : state.team2.name
  const winnerColor = state.toss.winner === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
  const battingTeamName = state[state.battingTeamKey].name
  const bowlingTeamName = state[state.bowlingTeamKey].name

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-6 rounded-2xl border border-border/50 bg-card/90 p-8 shadow-2xl"
        style={{
          animation: "toss-in 0.5s ease-out",
          boxShadow: `0 0 40px ${winnerColor}22`,
        }}
      >
        {/* Coin animation */}
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 font-mono text-2xl font-bold"
          style={{
            borderColor: winnerColor,
            color: winnerColor,
            animation: "coin-flip 0.8s ease-out",
            boxShadow: `0 0 20px ${winnerColor}44`,
          }}
        >
          {state.toss.winner === "team1" ? "T1" : "T2"}
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="font-sans text-sm uppercase tracking-wider text-muted-foreground">
            Toss won by
          </p>
          <h2
            className="font-sans text-2xl font-bold"
            style={{ color: winnerColor }}
          >
            {winnerName}
          </h2>
          <p className="font-sans text-sm text-muted-foreground">
            elected to {state.toss.choice}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
              Batting
            </span>
            <span className="font-sans text-sm font-medium text-foreground">
              {battingTeamName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
              Bowling
            </span>
            <span className="font-sans text-sm font-medium text-foreground">
              {bowlingTeamName}
            </span>
          </div>
        </div>

        <p className="font-sans text-xs text-muted-foreground" style={{ animation: "pulse 1.5s infinite" }}>
          Starting match...
        </p>
      </div>

      <style jsx>{`
        @keyframes toss-in {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes coin-flip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(540deg); }
          100% { transform: rotateY(720deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
