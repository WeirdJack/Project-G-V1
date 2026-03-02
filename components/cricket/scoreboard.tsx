"use client"

import type { GameState } from "@/lib/cricket-game/types"
import { getOverString } from "@/lib/cricket-game/game-engine"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"

interface ScoreboardProps {
  state: GameState
}

export function Scoreboard({ state }: ScoreboardProps) {
  const batting = state[state.battingTeamKey]
  const bowling = state[state.bowlingTeamKey]
  const battingColor = state.battingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
  const currentBatsman = batting.players[batting.currentBatsmanIndex]
  const oversStr = getOverString(batting.overs, batting.balls)

  // Target info for 2nd innings
  const targetInfo =
    state.currentInnings === 2 && state.target !== null
      ? {
          remaining: state.target - batting.totalRuns + 1,
          totalBalls:
            state.config.overs * 6 - (batting.overs * 6 + batting.balls),
        }
      : null

  // Recent balls in current over
  const recentEvents = batting.ballEvents.slice(-6)

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Main score */}
      <div
        className="flex flex-col gap-1 rounded-xl border border-border/50 bg-card/80 p-4"
        style={{ borderLeftColor: battingColor, borderLeftWidth: 3 }}
      >
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: battingColor }}
            />
            <span className="font-sans text-sm font-medium text-foreground">
              {batting.name}
            </span>
            <span className="font-sans text-xs text-muted-foreground">
              (Batting)
            </span>
          </div>
          <span className="font-sans text-xs text-muted-foreground">
            Inn. {state.currentInnings}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold text-foreground">
            {batting.totalRuns}/{batting.wickets}
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            ({oversStr} ov)
          </span>
        </div>

        {/* Target chase info */}
        {targetInfo && targetInfo.remaining > 0 && (
          <p className="font-sans text-xs text-accent">
            Need {targetInfo.remaining} from {targetInfo.totalBalls} balls
          </p>
        )}
      </div>

      {/* Current batsman */}
      {currentBatsman && !currentBatsman.isOut && (
        <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
          <span className="font-sans text-xs text-muted-foreground">
            {currentBatsman.name}
          </span>
          <span className="font-mono text-sm font-medium text-foreground">
            {currentBatsman.runs}{" "}
            <span className="text-xs text-muted-foreground">
              ({currentBatsman.ballsFaced}b)
            </span>
          </span>
        </div>
      )}

      {/* This over */}
      {recentEvents.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-sans text-xs text-muted-foreground mr-1">This over:</span>
          {recentEvents.map((e, i) => (
            <span
              key={i}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-medium"
              style={{
                backgroundColor: e.isWicket
                  ? "#7a2a2a"
                  : e.isExtra
                    ? "#4a2a6a"
                    : e.runs >= 4
                      ? "#8a6a10"
                      : "#1a2a3a",
                color: e.isWicket
                  ? "#ff6666"
                  : e.isExtra
                    ? "#bb88ee"
                    : e.runs >= 4
                      ? "#ffe066"
                      : "#8ffff0",
              }}
            >
              {e.isWicket ? "W" : e.squareType === "wide" ? "Wd" : e.squareType === "no-ball" ? "NB" : e.runs}
            </span>
          ))}
        </div>
      )}

      {/* Bowling team score (if 2nd innings) */}
      {state.currentInnings === 2 && (
        <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
          <span className="font-sans text-xs text-muted-foreground">
            {bowling.name} scored
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            {state[state.bowlingTeamKey === "team1" ? "team1" : "team2"].totalRuns}/{
              state[state.bowlingTeamKey === "team1" ? "team1" : "team2"].wickets
            }
          </span>
        </div>
      )}
    </div>
  )
}
