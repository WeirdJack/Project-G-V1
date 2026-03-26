"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MatchConfig, GameMode, OversOption } from "@/lib/cricket-game/types"
import type { PlayerRole } from "@/lib/cricket-game/types"
import {
  DEFAULT_TEAM_NAMES,
  OVERS_OPTIONS,
  PLAYERS_PER_TEAM_OPTIONS,
  DEFAULT_PLAYERS_PER_TEAM,
  generateDefaultPlayerNames,
  TEAM_1_COLOR,
  TEAM_2_COLOR,
} from "@/lib/cricket-game/constants"
import { ChevronDown, ChevronUp } from "lucide-react"

interface MatchSetupProps {
  onStart: (config: MatchConfig) => void
}

// ── Role icon SVGs ──────────────────────────────────────────────────────────

function BatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="9" y="1" width="4" height="12" rx="1.5" fill="currentColor" />
      <rect x="8.5" y="11" width="5" height="6" rx="1" fill="currentColor" opacity="0.7" />
      <line x1="11" y1="13" x2="11" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

function BallIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" fill="currentColor" />
      <path d="M5,7 Q8,10 5,13" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M15,7 Q12,10 15,13" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

function GlovesIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4,13 Q3,8 5,6 Q7,4 9,5 L9,11 Q8,13 7,14 Q6,15 4,13Z" fill="currentColor" />
      <path d="M16,13 Q17,8 15,6 Q13,4 11,5 L11,11 Q12,13 13,14 Q14,15 16,13Z" fill="currentColor" />
      <rect x="7" y="14" width="6" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
      {/* Finger splits */}
      <line x1="7" y1="5.5" x2="7" y2="9" stroke="white" strokeWidth="0.8" opacity="0.4" />
      <line x1="13" y1="5.5" x2="13" y2="9" stroke="white" strokeWidth="0.8" opacity="0.4" />
    </svg>
  )
}

function AllRounderIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {/* Mini bat */}
      <rect x="3" y="2" width="3" height="9" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="2.5" y="9" width="4" height="4" rx="0.8" fill="currentColor" opacity="0.6" />
      {/* Mini ball */}
      <circle cx="14" cy="13" r="4.5" fill="currentColor" />
      <path d="M11,11 Q13,13 11,15" stroke="white" strokeWidth="0.9" fill="none" opacity="0.6" />
      <path d="M17,11 Q15,13 17,15" stroke="white" strokeWidth="0.9" fill="none" opacity="0.6" />
    </svg>
  )
}

// ── Role config ─────────────────────────────────────────────────────────────

const ROLE_OPTIONS: {
  value: PlayerRole
  label: string
  icon: React.FC<{ size?: number }>
  color: string
  activeColor: string
}[] = [
  { value: "bat",  label: "Batter",         icon: BatIcon,         color: "#4ade80", activeColor: "#16a34a" },
  { value: "bowl", label: "Bowler",          icon: BallIcon,        color: "#22d3ee", activeColor: "#0891b2" },
  { value: "wk",   label: "Wicket-keeper",  icon: GlovesIcon,      color: "#fbbf24", activeColor: "#d97706" },
  { value: "all",  label: "All-rounder",    icon: AllRounderIcon,  color: "#c084fc", activeColor: "#9333ea" },
]

function RolePicker({
  value,
  onChange,
}: {
  value: PlayerRole
  onChange: (r: PlayerRole) => void
}) {
  return (
    <div className="flex gap-1">
      {ROLE_OPTIONS.map((r) => {
        const Icon = r.icon
        const isSelected = value === r.value
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange(r.value)}
            title={r.label}
            className="flex h-7 w-7 items-center justify-center rounded transition-all"
            style={{
              backgroundColor: isSelected ? r.color + "25" : "transparent",
              color: isSelected ? r.color : "#555",
              border: `1.5px solid ${isSelected ? r.color : "#3a3a2a"}`,
              boxShadow: isSelected ? `0 0 6px ${r.color}44` : "none",
            }}
            aria-pressed={isSelected}
            aria-label={r.label}
          >
            <Icon size={14} />
          </button>
        )
      })}
    </div>
  )
}

// ── Cricket-themed section header ────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1" style={{ background: "linear-gradient(to right, #3a5a2a, transparent)" }} />
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: "#6a9a5a" }}>
        {children}
      </span>
      <div className="h-px flex-1" style={{ background: "linear-gradient(to left, #3a5a2a, transparent)" }} />
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function MatchSetup({ onStart }: MatchSetupProps) {
  const [mode, setMode] = useState<GameMode>("local")
  const [overs, setOvers] = useState<OversOption>(5)
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(DEFAULT_PLAYERS_PER_TEAM)
  const [team1Name, setTeam1Name] = useState(DEFAULT_TEAM_NAMES.team1)
  const [team2Name, setTeam2Name] = useState(DEFAULT_TEAM_NAMES.team2)
  const [team1PlayerNames, setTeam1PlayerNames] = useState<string[]>(() =>
    generateDefaultPlayerNames(0, DEFAULT_PLAYERS_PER_TEAM)
  )
  const [team2PlayerNames, setTeam2PlayerNames] = useState<string[]>(() =>
    generateDefaultPlayerNames(1, DEFAULT_PLAYERS_PER_TEAM)
  )
  const [team1PlayerRoles, setTeam1PlayerRoles] = useState<PlayerRole[]>(() =>
    Array.from({ length: DEFAULT_PLAYERS_PER_TEAM }, (_, i) =>
      i === 0 ? "wk" : i >= DEFAULT_PLAYERS_PER_TEAM - 3 ? "bowl" : "bat"
    )
  )
  const [team2PlayerRoles, setTeam2PlayerRoles] = useState<PlayerRole[]>(() =>
    Array.from({ length: DEFAULT_PLAYERS_PER_TEAM }, (_, i) =>
      i === 0 ? "wk" : i >= DEFAULT_PLAYERS_PER_TEAM - 3 ? "bowl" : "bat"
    )
  )
  const [showTeam1Players, setShowTeam1Players] = useState(false)
  const [showTeam2Players, setShowTeam2Players] = useState(false)

  const handlePlayersChange = useCallback((count: number) => {
    setPlayersPerTeam(count)
    setTeam1PlayerNames((prev) => {
      const defaults = generateDefaultPlayerNames(0, count)
      return Array.from({ length: count }, (_, i) => prev[i] ?? defaults[i])
    })
    setTeam2PlayerNames((prev) => {
      const defaults = generateDefaultPlayerNames(1, count)
      return Array.from({ length: count }, (_, i) => prev[i] ?? defaults[i])
    })
    setTeam1PlayerRoles((prev) =>
      Array.from({ length: count }, (_, i) =>
        (prev[i] as PlayerRole | undefined) ?? (i === 0 ? "wk" : i >= count - 3 ? "bowl" : "bat")
      )
    )
    setTeam2PlayerRoles((prev) =>
      Array.from({ length: count }, (_, i) =>
        (prev[i] as PlayerRole | undefined) ?? (i === 0 ? "wk" : i >= count - 3 ? "bowl" : "bat")
      )
    )
  }, [])

  const updatePlayerName = useCallback((team: 1 | 2, index: number, name: string) => {
    if (team === 1) {
      setTeam1PlayerNames((prev) => { const n = [...prev]; n[index] = name; return n })
    } else {
      setTeam2PlayerNames((prev) => { const n = [...prev]; n[index] = name; return n })
    }
  }, [])

  const updatePlayerRole = useCallback((team: 1 | 2, index: number, role: PlayerRole) => {
    if (team === 1) {
      setTeam1PlayerRoles((prev) => { const n = [...prev]; n[index] = role; return n })
    } else {
      setTeam2PlayerRoles((prev) => { const n = [...prev]; n[index] = role; return n })
    }
  }, [])

  function handleStart() {
    onStart({
      overs,
      mode,
      team1Name: team1Name.trim() || DEFAULT_TEAM_NAMES.team1,
      team2Name: team2Name.trim() || DEFAULT_TEAM_NAMES.team2,
      playersPerTeam,
      team1PlayerNames,
      team2PlayerNames,
      team1PlayerRoles,
      team2PlayerRoles,
    })
  }

  function oversLabel(o: OversOption): string {
    if (o === "test") return "Test Match"
    return `${o} Overs`
  }

  function renderPlayerList(team: 1 | 2) {
    const names = team === 1 ? team1PlayerNames : team2PlayerNames
    const roles = team === 1 ? team1PlayerRoles : team2PlayerRoles

    return (
      <div
        className="flex max-h-64 flex-col gap-0 overflow-y-auto rounded-lg border"
        style={{ borderColor: "#2a3a1a", backgroundColor: "#0d1a0a" }}
      >
        {/* Scorecard header */}
        <div
          className="sticky top-0 flex items-center gap-2 border-b px-3 py-1.5"
          style={{ borderColor: "#2a3a1a", backgroundColor: "#111a0d" }}
        >
          <span className="flex-1 font-mono text-[9px] uppercase tracking-widest" style={{ color: "#6a9a5a" }}>
            Player
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#6a9a5a" }}>
            Role
          </span>
        </div>
        {names.slice(0, playersPerTeam).map((name, i) => (
          <div
            key={i}
            className="flex items-center gap-2 border-b px-3 py-1.5 last:border-b-0"
            style={{ borderColor: "#1a2a12" }}
          >
            <span className="w-5 shrink-0 font-mono text-[10px]" style={{ color: "#4a6a3a" }}>
              {i + 1}
            </span>
            <Input
              value={name}
              onChange={(e) => updatePlayerName(team, i, e.target.value)}
              className="h-7 flex-1 border-0 bg-transparent font-mono text-[11px] text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ color: "#d4e8c4" }}
              maxLength={20}
            />
            <RolePicker
              value={(roles[i] as PlayerRole | undefined) ?? "bat"}
              onChange={(r) => updatePlayerRole(team, i, r)}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen items-start justify-center overflow-y-auto p-4 sm:items-center"
      style={{ backgroundColor: "#0a1208" }}
    >
      <div className="flex w-full max-w-md flex-col gap-5 py-4">

        {/* Title block */}
        <div className="flex flex-col items-center gap-1">
          {/* Wickets graphic */}
          <svg width="48" height="32" viewBox="0 0 48 32" fill="none" aria-hidden="true" className="mb-1">
            {[10, 24, 38].map((x) => (
              <g key={x}>
                <rect x={x - 1} y="2" width="2" height="20" rx="1" fill="#d4c08a" />
                <rect x={x - 3} y="0" width="6" height="3" rx="1" fill="#d4c08a" />
              </g>
            ))}
            {/* Bails */}
            <rect x="7" y="2.5" width="10" height="1.5" rx="0.7" fill="#f0d060" />
            <rect x="31" y="2.5" width="10" height="1.5" rx="0.7" fill="#f0d060" />
            {/* Ground */}
            <rect x="0" y="22" width="48" height="2" rx="1" fill="#3a5a2a" />
          </svg>
          <h1
            className="text-balance text-center font-sans text-4xl font-black tracking-tight"
            style={{ color: "#e8f0d8", textShadow: "0 2px 12px #4a8a3a44" }}
          >
            Kriklu
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "#6a9a5a" }}>
            Match Setup
          </p>
        </div>

        {/* Main form card */}
        <div
          className="flex flex-col gap-5 rounded-xl border p-5"
          style={{ borderColor: "#2a4a1a", backgroundColor: "#0f1a0c" }}
        >
          {/* Game Mode */}
          <div className="flex flex-col gap-2">
            <SectionHeader>Game Mode</SectionHeader>
            <div className="flex gap-2">
              {(["local", "cpu"] as GameMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 rounded-lg border py-2.5 font-mono text-sm font-semibold transition-all"
                  style={{
                    borderColor: mode === m ? "#4a8a3a" : "#2a3a1a",
                    backgroundColor: mode === m ? "#1a3a12" : "transparent",
                    color: mode === m ? "#8fda6a" : "#5a7a4a",
                  }}
                >
                  {m === "local" ? "2 Players" : "vs CPU"}
                </button>
              ))}
            </div>
          </div>

          {/* Format + Players */}
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <SectionHeader>Format</SectionHeader>
              <Select
                value={String(overs)}
                onValueChange={(v) => setOvers(v === "test" ? "test" : (Number(v) as OversOption))}
              >
                <SelectTrigger
                  className="h-10 border font-mono text-sm"
                  style={{ borderColor: "#2a3a1a", backgroundColor: "#0a1208", color: "#8fda6a" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OVERS_OPTIONS.map((o) => (
                    <SelectItem key={String(o)} value={String(o)} className="font-mono">
                      {oversLabel(o as OversOption)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <SectionHeader>Squad Size</SectionHeader>
              <Select
                value={String(playersPerTeam)}
                onValueChange={(v) => handlePlayersChange(Number(v))}
              >
                <SelectTrigger
                  className="h-10 border font-mono text-sm"
                  style={{ borderColor: "#2a3a1a", backgroundColor: "#0a1208", color: "#8fda6a" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAYERS_PER_TEAM_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)} className="font-mono">
                      {n} Players
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team 1 */}
          <div className="flex flex-col gap-2">
            <SectionHeader>Team 1</SectionHeader>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: TEAM_1_COLOR }}
              />
              <Input
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                placeholder={DEFAULT_TEAM_NAMES.team1}
                className="h-10 border font-mono text-sm"
                style={{ borderColor: "#2a3a1a", backgroundColor: "#0a1208", color: "#d4e8c4" }}
                maxLength={20}
              />
            </div>
            <button
              onClick={() => setShowTeam1Players((v) => !v)}
              className="flex items-center gap-1 font-mono text-[11px] transition-colors"
              style={{ color: showTeam1Players ? "#8fda6a" : "#4a6a3a" }}
            >
              {showTeam1Players ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showTeam1Players ? "Hide" : "Edit"} Squad
            </button>
            {showTeam1Players && renderPlayerList(1)}
          </div>

          {/* Team 2 */}
          <div className="flex flex-col gap-2">
            <SectionHeader>{mode === "cpu" ? "CPU Team" : "Team 2"}</SectionHeader>
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: TEAM_2_COLOR }}
              />
              <Input
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                placeholder={DEFAULT_TEAM_NAMES.team2}
                className="h-10 border font-mono text-sm disabled:opacity-40"
                style={{ borderColor: "#2a3a1a", backgroundColor: "#0a1208", color: "#d4e8c4" }}
                maxLength={20}
                disabled={mode === "cpu"}
              />
            </div>
            <button
              onClick={() => setShowTeam2Players((v) => !v)}
              className="flex items-center gap-1 font-mono text-[11px] transition-colors"
              style={{ color: showTeam2Players ? "#8fda6a" : "#4a6a3a" }}
            >
              {showTeam2Players ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showTeam2Players ? "Hide" : "Edit"} Squad
            </button>
            {showTeam2Players && renderPlayerList(2)}
          </div>

          {/* Role legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {ROLE_OPTIONS.map((r) => {
              const Icon = r.icon
              return (
                <div key={r.value} className="flex items-center gap-1.5">
                  <span style={{ color: r.color }}>
                    <Icon size={13} />
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: "#6a9a5a" }}>
                    {r.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            className="relative w-full overflow-hidden rounded-lg border py-3 font-mono text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderColor: "#4a8a3a",
              backgroundColor: "#1a3a12",
              color: "#8fda6a",
              boxShadow: "0 0 20px #3a7a2a22, inset 0 1px 0 #4a8a3a44",
            }}
          >
            {/* Green shimmer line */}
            <span
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{ background: "linear-gradient(180deg, #4a8a3a22 0%, transparent 60%)" }}
            />
            Toss the Coin
          </button>
        </div>

        {/* Board legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {[
            { label: "1 run", color: "#2a5a5a" },
            { label: "2 runs", color: "#2a6a5a" },
            { label: "3 runs", color: "#2a7a5a" },
            { label: "FOUR", color: "#8a6a10" },
            { label: "SIX", color: "#aa7a00" },
            { label: "WICKET", color: "#7a2a2a" },
            { label: "WIDE", color: "#5a3a7a" },
            { label: "NO BALL", color: "#4a2a6a" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: "#4a6a3a" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
