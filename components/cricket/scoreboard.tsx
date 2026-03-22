"use client"

import type { GameState } from "@/lib/cricket-game/types"
import { getOverString } from "@/lib/cricket-game/game-engine"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"

interface ScoreboardProps {
  state: GameState
}

/* Top - Team score and overs */
export function ScoreboardTop({ state }: ScoreboardProps) {
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
    <div className="pointer-events-auto flex flex-col items-center justify-center rounded-md bg-background/85 p-2 backdrop-blur-sm min-h-[72px]">
      {/* Team name - bold and prominent */}
      <div className="flex items-center gap-1 mb-1">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: battingColor }}
        />
        <span 
          className="font-sans text-[10px] font-bold truncate max-w-[50px]"
          style={{ color: battingColor }}
        >
          {batting.name}
        </span>
      </div>

      {/* Main score */}
      <span className="font-mono text-xl font-bold text-foreground leading-none">
        {batting.totalRuns}/{batting.wickets}
      </span>

      {/* Overs */}
      <span className="font-mono text-[9px] text-muted-foreground mt-0.5">
        ({oversStr})
      </span>

      {/* Target chase */}
      {targetInfo && targetInfo.remaining > 0 && (
        <p className="font-sans text-[8px] text-accent text-center mt-0.5 font-medium">
          Need {targetInfo.remaining}
        </p>
      )}
    </div>
  )
}

/* Bottom - Batsmen info */
export function ScoreboardBottom({ state }: ScoreboardProps) {
  const batting = state[state.battingTeamKey]
  const battingColor = state.battingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
  const striker = batting.players[batting.currentBatsmanIndex]
  const nonStriker = batting.players[batting.nonStrikerIndex]

  return (
    <div className="pointer-events-auto flex flex-col items-center justify-center rounded-md bg-background/85 p-2 backdrop-blur-sm min-h-[72px]">
      {/* Innings indicator */}
      <span className="font-sans text-[8px] text-muted-foreground/80 mb-1">
        Innings {state.currentInnings}
      </span>

      {/* Striker */}
      {striker && !striker.isOut && (
        <div className="flex flex-col items-center">
          <span 
            className="font-sans text-[10px] font-bold truncate max-w-[55px]"
            style={{ color: battingColor }}
          >
            {striker.name}*
          </span>
          <span className="font-mono text-lg font-bold leading-none" style={{ color: battingColor }}>
            {striker.runs}
            <span className="text-[8px] text-muted-foreground font-normal">({striker.ballsFaced})</span>
          </span>
        </div>
      )}

      {/* Non-striker */}
      {nonStriker && !nonStriker.isOut && nonStriker.id !== striker?.id && (
        <div className="flex flex-col items-center mt-1 opacity-70">
          <span className="font-sans text-[8px] font-medium text-muted-foreground truncate max-w-[55px]">
            {nonStriker.name}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
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
      <ScoreboardTop state={state} />
      <ScoreboardBottom state={state} />
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
