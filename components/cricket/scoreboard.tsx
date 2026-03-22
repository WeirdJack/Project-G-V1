"use client"

import type { GameState } from "@/lib/cricket-game/types"
import { getOverString } from "@/lib/cricket-game/game-engine"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"

interface ScoreboardProps {
  state: GameState
}

/* Left side - Team score and overs */
export function ScoreboardLeft({ state }: ScoreboardProps) {
  const batting = state[state.battingTeamKey]
  const battingColor = state.battingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
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
    <div className="pointer-events-auto flex flex-col items-center justify-center rounded-lg bg-background/85 p-1.5 backdrop-blur-sm w-[72px]">
      {/* Team indicator */}
      <div className="flex items-center gap-1 mb-0.5">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: battingColor }}
        />
        <span className="font-sans text-[7px] text-muted-foreground truncate max-w-[50px]">
          {batting.name}
        </span>
      </div>

      {/* Main score */}
      <span className="font-mono text-lg font-bold text-foreground leading-tight">
        {batting.totalRuns}/{batting.wickets}
      </span>

      {/* Overs */}
      <span className="font-mono text-[8px] text-muted-foreground">
        ({oversStr} ov)
      </span>

      {/* Target chase */}
      {targetInfo && targetInfo.remaining > 0 && (
        <p className="font-sans text-[7px] text-accent mt-0.5 text-center">
          Need {targetInfo.remaining}
        </p>
      )}
    </div>
  )
}

/* Right side - Batsmen info */
export function ScoreboardRight({ state }: ScoreboardProps) {
  const batting = state[state.battingTeamKey]
  const battingColor = state.battingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
  const striker = batting.players[batting.currentBatsmanIndex]
  const nonStriker = batting.players[batting.nonStrikerIndex]

  return (
    <div className="pointer-events-auto flex flex-col items-center justify-center rounded-lg bg-background/85 p-1.5 backdrop-blur-sm w-[72px]">
      {/* Innings indicator */}
      <span className="font-sans text-[7px] text-muted-foreground/70 mb-0.5">
        Inn {state.currentInnings}
      </span>

      {/* Striker */}
      {striker && !striker.isOut && (
        <div className="flex flex-col items-center">
          <span className="font-sans text-[7px] text-muted-foreground truncate max-w-[60px]">
            {striker.name}*
          </span>
          <span className="font-mono text-sm font-semibold leading-tight" style={{ color: battingColor }}>
            {striker.runs}
            <span className="text-[7px] text-muted-foreground">({striker.ballsFaced})</span>
          </span>
        </div>
      )}

      {/* Non-striker */}
      {nonStriker && !nonStriker.isOut && nonStriker.id !== striker?.id && (
        <div className="flex flex-col items-center mt-0.5 opacity-70">
          <span className="font-sans text-[6px] text-muted-foreground/60 truncate max-w-[60px]">
            {nonStriker.name}
          </span>
          <span className="font-mono text-[9px] text-muted-foreground">
            {nonStriker.runs}({nonStriker.ballsFaced})
          </span>
        </div>
      )}
    </div>
  )
}

/* Combined scoreboard for backward compatibility */
export function Scoreboard({ state }: ScoreboardProps) {
  return (
    <>
      <ScoreboardLeft state={state} />
      <ScoreboardRight state={state} />
    </>
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
