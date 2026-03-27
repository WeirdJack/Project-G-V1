"use client"

import { useState } from "react"
import type { GameState, TeamState, BallEvent } from "@/lib/cricket-game/types"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"
import { getOverString } from "@/lib/cricket-game/game-engine"

// ── Helpers ──────────────────────────────────────────────────────────────────

interface BowlerRow {
  name: string
  overs: number
  balls: number
  runs: number
  wickets: number
  wides: number
  noBalls: number
}

function deriveBowlerStats(events: BallEvent[]): BowlerRow[] {
  const map = new Map<string, BowlerRow>()
  for (const e of events) {
    let row = map.get(e.bowlerName)
    if (!row) {
      row = { name: e.bowlerName, overs: 0, balls: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0 }
      map.set(e.bowlerName, row)
    }
    if (!e.isExtra || e.squareType === "no-ball") {
      // legal delivery counts toward overs
      row.balls++
      if (row.balls === 6) { row.overs++; row.balls = 0 }
    }
    if (e.squareType === "wide") row.wides++
    if (e.squareType === "no-ball") row.noBalls++
    row.runs += e.isExtra ? (e.squareType === "no-ball" ? 1 : 1) : e.runs
    if (e.isWicket) row.wickets++
  }
  return Array.from(map.values())
}

function strikeRate(runs: number, balls: number) {
  if (balls === 0) return "-"
  return ((runs / balls) * 100).toFixed(1)
}

function economy(runs: number, overs: number, balls: number) {
  const total = overs + balls / 6
  if (total === 0) return "-"
  return (runs / total).toFixed(2)
}

function fours(batsmanId: number, events: BallEvent[]) {
  return events.filter((e) => e.batsmanId === batsmanId && e.runs === 4 && !e.isExtra).length
}

function sixes(batsmanId: number, events: BallEvent[]) {
  return events.filter((e) => e.batsmanId === batsmanId && e.runs === 6 && !e.isExtra).length
}

// ── Batting table ─────────────────────────────────────────────────────────────

function BattingTable({ team, color }: { team: TeamState; color: string }) {
  const batters = team.players.filter((p) => p.ballsFaced > 0 || p.isOut)
  const totalExtras = team.extras.wides + team.extras.noBalls
  const dnb = team.players.filter((p) => p.ballsFaced === 0 && !p.isOut)

  return (
    <div className="flex flex-col gap-0">
      {/* Section header */}
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ backgroundColor: color + "22", borderBottom: `1px solid ${color}44` }}
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          Batting
        </span>
        <div className="flex gap-4">
          {["R", "B", "4s", "6s", "SR"].map((h) => (
            <span key={h} className="w-8 text-right font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Rows */}
      {batters.map((p, i) => (
        <div
          key={p.id}
          className="flex items-start justify-between px-3 py-1.5"
          style={{
            backgroundColor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className="font-sans text-[11px] font-semibold leading-tight"
                style={{ color: p.isOut ? "#ccc" : "#fff" }}
              >
                {p.name}
              </span>
              {!p.isOut && (
                <span
                  className="rounded-sm px-1 font-mono text-[8px] font-bold uppercase"
                  style={{ backgroundColor: color + "33", color }}
                >
                  not out
                </span>
              )}
            </div>
            {p.howOut && p.isOut && (
              <span className="font-mono text-[9px] leading-tight text-muted-foreground/70">
                {p.howOut}
              </span>
            )}
          </div>
          <div className="flex shrink-0 gap-4">
            <span className="w-8 text-right font-mono text-[11px] font-bold" style={{ color: p.runs >= 50 ? "#ffd700" : "#eee" }}>
              {p.runs}
            </span>
            <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">{p.ballsFaced}</span>
            <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">
              {fours(p.id, team.ballEvents)}
            </span>
            <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">
              {sixes(p.id, team.ballEvents)}
            </span>
            <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">
              {strikeRate(p.runs, p.ballsFaced)}
            </span>
          </div>
        </div>
      ))}

      {/* DNB */}
      {dnb.length > 0 && (
        <div className="px-3 py-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="font-mono text-[9px] text-muted-foreground/60">
            DNB: {dnb.map((p) => p.name).join(", ")}
          </span>
        </div>
      )}

      {/* Extras + Total */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="font-mono text-[10px] text-muted-foreground">
          Extras (W: {team.extras.wides}, NB: {team.extras.noBalls})
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">{totalExtras}</span>
      </div>
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: color + "14" }}
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground">Total</span>
        <span className="font-mono text-[13px] font-black" style={{ color }}>
          {team.totalRuns}/{team.wickets}{" "}
          <span className="text-[10px] font-normal text-muted-foreground">
            ({getOverString(team.overs, team.balls)} ov)
          </span>
        </span>
      </div>
    </div>
  )
}

// ── Bowling table ─────────────────────────────────────────────────────────────

function BowlingTable({ team, bowlingEvents, color }: { team: TeamState; bowlingEvents: BallEvent[]; color: string }) {
  const bowlers = deriveBowlerStats(bowlingEvents)
  if (bowlers.length === 0) return null

  return (
    <div className="flex flex-col gap-0">
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ backgroundColor: color + "22", borderBottom: `1px solid ${color}44` }}
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          Bowling
        </span>
        <div className="flex gap-4">
          {["O", "R", "W", "Econ"].map((h) => (
            <span key={h} className="w-8 text-right font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              {h}
            </span>
          ))}
        </div>
      </div>

      {bowlers.map((b, i) => (
        <div
          key={b.name}
          className="flex items-center justify-between px-3 py-1.5"
          style={{
            backgroundColor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <span className="font-sans text-[11px] font-semibold text-foreground/90">{b.name}</span>
          <div className="flex shrink-0 gap-4">
            <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">
              {getOverString(b.overs, b.balls)}
            </span>
            <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">{b.runs}</span>
            <span className="w-8 text-right font-mono text-[11px] font-bold" style={{ color: b.wickets > 0 ? color : "#aaa" }}>
              {b.wickets}
            </span>
            <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">
              {economy(b.runs, b.overs, b.balls)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Fall of Wickets ───────────────────────────────────────────────────────────

function FallOfWickets({ events }: { events: BallEvent[] }) {
  const fow = events
    .filter((e) => e.isWicket)
    .map((e, i) => `${i + 1}-${events.slice(0, events.indexOf(e) + 1).reduce((s, ev) => s + (ev.isExtra ? 0 : ev.runs), 0)} (${e.batsmanName}, ${getOverString(e.over, e.ball + 1)})`)
  if (fow.length === 0) return null

  return (
    <div className="px-3 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        Fall of wickets: {fow.join(" | ")}
      </span>
    </div>
  )
}

// ── Innings Card ──────────────────────────────────────────────────────────────

function InningsCard({
  battingTeam,
  bowlingTeam,
  inningsNum,
  color,
}: {
  battingTeam: TeamState
  bowlingTeam: TeamState
  inningsNum: 1 | 2
  color: string
}) {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ border: `1.5px solid ${color}44`, backgroundColor: "#0c1a0a" }}
    >
      {/* Innings header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: color + "22", borderBottom: `1.5px solid ${color}44` }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-mono text-[11px] font-black uppercase tracking-widest text-foreground">
            {battingTeam.name}
          </span>
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider"
            style={{ backgroundColor: color + "22", color }}
          >
            {inningsNum === 1 ? "1st Inn" : "2nd Inn"}
          </span>
        </div>
        <span className="font-mono text-sm font-black" style={{ color }}>
          {battingTeam.totalRuns}/{battingTeam.wickets}
        </span>
      </div>

      <BattingTable team={battingTeam} color={color} />
      <FallOfWickets events={battingTeam.ballEvents} />
      <BowlingTable team={bowlingTeam} bowlingEvents={battingTeam.ballEvents} color={color} />
    </div>
  )
}

// ── Scorecard Modal ───────────────────────────────────────────────────────────

interface ScorecardModalProps {
  state: GameState
  defaultTeam?: "team1" | "team2"
  onClose: () => void
}

export function ScorecardModal({ state, defaultTeam = "team1", onClose }: ScorecardModalProps) {
  const [tab, setTab] = useState<"team1" | "team2">(defaultTeam)
  const t1Color = TEAM_1_COLOR
  const t2Color = TEAM_2_COLOR
  const activeColor = tab === "team1" ? t1Color : t2Color

  const isTeam1First = state.firstBattingTeamKey === "team1"
  const inningsForTeam = (key: "team1" | "team2"): 1 | 2 =>
    (key === state.firstBattingTeamKey ? 1 : 2) as 1 | 2

  return (
    <div
      className="safe-top fixed inset-0 z-[60] flex flex-col"
      style={{ backgroundColor: "#060f05" }}
    >
      {/* CRT scanlines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 6px)",
          zIndex: 1,
        }}
      />

      {/* Header */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: activeColor + "44", backgroundColor: activeColor + "0d" }}
      >
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
            Full Scorecard
          </span>
          <span className="font-mono text-[11px] font-black uppercase tracking-wider" style={{ color: activeColor }}>
            {state.team1.name} vs {state.team2.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          x
        </button>
      </div>

      {/* Tab bar */}
      <div
        className="relative z-10 flex shrink-0 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {(["team1", "team2"] as const).map((key) => {
          const c = key === "team1" ? t1Color : t2Color
          const isActive = tab === key
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex flex-1 flex-col items-center gap-0.5 px-4 py-2.5 transition-colors"
              style={{
                borderBottom: isActive ? `2px solid ${c}` : "2px solid transparent",
                backgroundColor: isActive ? c + "12" : "transparent",
              }}
            >
              <span
                className="font-mono text-[10px] font-bold uppercase tracking-wider"
                style={{ color: isActive ? c : "#666" }}
              >
                {state[key].name}
              </span>
              <span className="font-mono text-[9px]" style={{ color: isActive ? c + "cc" : "#444" }}>
                {state[key].totalRuns}/{state[key].wickets} ({getOverString(state[key].overs, state[key].balls)})
              </span>
            </button>
          )
        })}
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-3">
        {tab === "team1" ? (
          <InningsCard
            battingTeam={state.team1}
            bowlingTeam={state.team2}
            inningsNum={inningsForTeam("team1")}
            color={t1Color}
          />
        ) : (
          <InningsCard
            battingTeam={state.team2}
            bowlingTeam={state.team1}
            inningsNum={inningsForTeam("team2")}
            color={t2Color}
          />
        )}
        <div className="pb-8" />
      </div>

      {/* Footer */}
      <div
        className="relative z-10 shrink-0 border-t px-4 py-2 text-center"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40">
          Kriklu Cricket Board &mdash; Official Scorecard
        </span>
      </div>
    </div>
  )
}

// ── Trigger button (used in scoreboard) ──────────────────────────────────────

export function ScorecardButton({
  state,
  defaultTeam,
  label,
  color,
}: {
  state: GameState
  defaultTeam: "team1" | "team2"
  label: string
  color: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors hover:opacity-80 active:scale-95"
        style={{ borderColor: color + "55", color, backgroundColor: color + "18" }}
      >
        {label}
      </button>
      {open && (
        <ScorecardModal state={state} defaultTeam={defaultTeam} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
