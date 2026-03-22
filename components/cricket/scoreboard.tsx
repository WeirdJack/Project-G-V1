"use client"

import type { GameState } from "@/lib/cricket-game/types"
import { getOverString } from "@/lib/cricket-game/game-engine"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"

interface ScoreboardProps {
  state: GameState
}

/* Top-Left: Team Score */
export function ScoreboardTeam({ state }: ScoreboardProps) {
  const batting = state[state.battingTeamKey]
  const battingColor = state.battingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
  const oversStr = getOverString(batting.overs, batting.balls)

  return (
    <div 
      className="absolute top-0 left-0 pointer-events-auto flex flex-col items-start rounded-md bg-background/90 px-2 py-1.5 backdrop-blur-sm border"
      style={{ borderColor: battingColor }}
    >
      <div className="flex items-center gap-1">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: battingColor }}
        />
        <span 
          className="font-sans text-[11px] font-bold"
          style={{ color: battingColor }}
        >
          {batting.name}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-lg font-bold text-foreground leading-tight">
          {batting.totalRuns}/{batting.wickets}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">
          ({oversStr})
        </span>
      </div>
    </div>
  )
}

/* Top-Right: Target (only in 2nd innings) */
export function ScoreboardTarget({ state }: ScoreboardProps) {
  const batting = state[state.battingTeamKey]
  const isTest = state.config.overs === "test"
  
  // Only show in 2nd innings when chasing
  if (state.currentInnings !== 2 || state.target === null) {
    return (
      <div className="absolute top-0 right-0 pointer-events-auto flex flex-col items-end rounded-md bg-background/90 px-2 py-1.5 backdrop-blur-sm border border-cyan-500/60">
        <span className="font-sans text-[9px] text-muted-foreground">Innings</span>
        <span className="font-mono text-sm font-bold text-foreground">{state.currentInnings}</span>
      </div>
    )
  }

  const remaining = state.target - batting.totalRuns + 1
  const ballsLeft = isTest
    ? null
    : (state.config.overs as number) * 6 - (batting.overs * 6 + batting.balls)

  return (
    <div className="absolute top-0 right-0 pointer-events-auto flex flex-col items-end rounded-md bg-background/90 px-2 py-1.5 backdrop-blur-sm border border-amber-500/70">
      <span className="font-sans text-[9px] text-muted-foreground">Target</span>
      <span className="font-mono text-sm font-bold text-amber-400 leading-tight">
        {remaining > 0 ? `Need ${remaining}` : "Won!"}
      </span>
      {ballsLeft !== null && remaining > 0 && (
        <span className="font-mono text-[8px] text-muted-foreground">
          from {ballsLeft} balls
        </span>
      )}
    </div>
  )
}

/* Bottom-Left: Batter Info */
export function ScoreboardBatter({ state }: ScoreboardProps) {
  const batting = state[state.battingTeamKey]
  const battingColor = state.battingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
  const striker = batting.players[batting.currentBatsmanIndex]
  const nonStriker = batting.players[batting.nonStrikerIndex]

  return (
    <div 
      className="absolute bottom-0 left-0 pointer-events-auto flex flex-col items-start rounded-md bg-background/90 px-2 py-1.5 backdrop-blur-sm border"
      style={{ borderColor: battingColor }}
    >
      {/* Striker */}
      {striker && !striker.isOut && (
        <div className="flex items-center gap-1.5">
          <span 
            className="font-sans text-[10px] font-bold truncate max-w-[45px]"
            style={{ color: battingColor }}
          >
            {striker.name}*
          </span>
          <span className="font-mono text-sm font-bold leading-none" style={{ color: battingColor }}>
            {striker.runs}
            <span className="text-[8px] text-muted-foreground font-normal">({striker.ballsFaced})</span>
          </span>
        </div>
      )}
      {/* Non-striker */}
      {nonStriker && !nonStriker.isOut && nonStriker.id !== striker?.id && (
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="font-sans text-[8px] text-muted-foreground truncate max-w-[40px]">
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

/* Bottom-Right: Bowler Info */
export function ScoreboardBowler({ state }: ScoreboardProps) {
  const bowling = state[state.bowlingTeamKey]
  const bowlingColor = state.bowlingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
  
  // For now, show team name - we don't track individual bowlers yet
  // In a full implementation, this would show current bowler stats

  return (
    <div 
      className="absolute bottom-0 right-0 pointer-events-auto flex flex-col items-end rounded-md bg-background/90 px-2 py-1.5 backdrop-blur-sm border"
      style={{ borderColor: bowlingColor }}
    >
      <span className="font-sans text-[9px] text-muted-foreground">Bowling</span>
      <span 
        className="font-sans text-[10px] font-bold"
        style={{ color: bowlingColor }}
      >
        {bowling.name}
      </span>
    </div>
  )
}

/* Combined scoreboard with all 4 corners */
export function Scoreboard({ state }: ScoreboardProps) {
  return (
    <>
      <ScoreboardTeam state={state} />
      <ScoreboardTarget state={state} />
      <ScoreboardBatter state={state} />
      <ScoreboardBowler state={state} />
    </>
  )
}

/* Separate "This Over" component to be used full-width */
export function ThisOver({ state }: ScoreboardProps) {
  const batting = state[state.battingTeamKey]
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
