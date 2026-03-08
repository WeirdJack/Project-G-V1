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
    <div className="flex h-full w-full flex-col gap-2">
      {/* Main score card with batter info inside */}
      <div
        className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/80 p-3"
        style={{ borderLeftColor: battingColor, borderLeftWidth: 3 }}
      >
        {/* Team name and innings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: battingColor }}
            />
            <span className="font-sans text-xs font-medium text-foreground">
              {batting.name}
            </span>
          </div>
          <span className="font-sans text-[10px] text-muted-foreground">
            Inn. {state.currentInnings}
          </span>
        </div>

        {/* Team score */}
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-bold text-foreground">
            {batting.totalRuns}/{batting.wickets}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            ({oversStr})
          </span>
        </div>

        {/* Batsmen - striker and non-striker */}
        <div className="flex flex-col gap-1 border-t border-border/30 pt-2">
          {/* Striker */}
          {striker && !striker.isOut && (
            <div className="flex items-center justify-between">
              <span className="font-sans text-xs text-muted-foreground">
                {striker.name}*
              </span>
              <span className="font-mono text-sm font-semibold" style={{ color: battingColor }}>
                {striker.runs}
                <span className="text-[10px] text-muted-foreground ml-0.5">
                  ({striker.ballsFaced})
                </span>
              </span>
            </div>
          )}
          {/* Non-striker */}
          {nonStriker && !nonStriker.isOut && nonStriker.id !== striker?.id && (
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10px] text-muted-foreground/70">
                {nonStriker.name}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {nonStriker.runs}
                <span className="text-[10px] text-muted-foreground/70 ml-0.5">
                  ({nonStriker.ballsFaced})
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Target chase info */}
        {targetInfo && targetInfo.remaining > 0 && (
          <p className="font-sans text-[10px] text-accent">
            Need {targetInfo.remaining}
            {targetInfo.totalBalls !== null
              ? ` from ${targetInfo.totalBalls} balls`
              : " more"}
          </p>
        )}
      </div>

      {/* Bowling team score (if 2nd innings) */}
      {state.currentInnings === 2 && (
        <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-2 py-1.5">
          <span className="font-sans text-[10px] text-muted-foreground">
            {bowling.name}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {state[state.bowlingTeamKey === "team1" ? "team1" : "team2"].totalRuns}/{
              state[state.bowlingTeamKey === "team1" ? "team1" : "team2"].wickets
            }
          </span>
        </div>
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
