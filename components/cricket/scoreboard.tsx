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
  const striker = batting.players[batting.currentBatsmanIndex]
  const nonStriker = batting.players[batting.nonStrikerIndex]
  const oversStr = getOverString(batting.overs, batting.balls)

  // Target info for 2nd innings
  const isTest = state.config.overs === "test"
  const targetInfo =
    state.currentInnings === 2 && state.target !== null
      ? {
          remaining: state.target - batting.totalRuns + 1,
          totalBalls: isTest
            ? null
            : (state.config.overs as number) * 6 - (batting.overs * 6 + batting.balls),
        }
      : null

  return (
    <div className="flex w-full flex-col justify-center rounded-lg bg-background/90 p-2 backdrop-blur-sm">
      {/* Team name + Score in one row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: battingColor }}
          />
          <span className="font-sans text-[9px] text-muted-foreground">
            {batting.name}
          </span>
        </div>
        <span className="font-sans text-[8px] text-muted-foreground/70">
          Inn {state.currentInnings}
        </span>
      </div>

      {/* Main score - large and centered */}
      <div className="flex items-baseline justify-center gap-1 py-1">
        <span className="font-mono text-2xl font-bold text-foreground">
          {batting.totalRuns}/{batting.wickets}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">
          ({oversStr})
        </span>
      </div>

      {/* Batsmen - compact */}
      <div className="flex flex-col gap-0.5 border-t border-border/20 pt-1">
        {striker && !striker.isOut && (
          <div className="flex items-center justify-between">
            <span className="font-sans text-[8px] text-muted-foreground">
              {striker.name}*
            </span>
            <span className="font-mono text-[10px] font-semibold" style={{ color: battingColor }}>
              {striker.runs}<span className="text-[8px] text-muted-foreground">({striker.ballsFaced})</span>
            </span>
          </div>
        )}
        {nonStriker && !nonStriker.isOut && nonStriker.id !== striker?.id && (
          <div className="flex items-center justify-between">
            <span className="font-sans text-[7px] text-muted-foreground/60">
              {nonStriker.name}
            </span>
            <span className="font-mono text-[8px] text-muted-foreground/70">
              {nonStriker.runs}({nonStriker.ballsFaced})
            </span>
          </div>
        )}
      </div>

      {/* Target chase info */}
      {targetInfo && targetInfo.remaining > 0 && (
        <p className="font-sans text-[8px] text-accent text-center mt-0.5">
          Need {targetInfo.remaining}
          {targetInfo.totalBalls !== null ? ` from ${targetInfo.totalBalls}b` : ""}
        </p>
      )}
    </div>
  )
}

/* Separate "This Over" component to be used full-width */
export function ThisOver({ state }: ScoreboardProps) {
  const batting = state[state.battingTeamKey]
  // Get only balls from the current over (resets when a new over starts)
  const currentOver = batting.overs
  const currentOverEvents = batting.ballEvents.filter((e) => e.over === currentOver)

  if (currentOverEvents.length === 0) return null

  return (
    <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-card/60 px-3 py-2">
      <span className="font-sans text-xs text-muted-foreground">This over:</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {currentOverEvents.map((e, i) => (
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
    </div>
  )
}
