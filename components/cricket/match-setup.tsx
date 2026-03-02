"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  const [showTeam1Players, setShowTeam1Players] = useState(false)
  const [showTeam2Players, setShowTeam2Players] = useState(false)

  const handlePlayersChange = useCallback(
    (count: number) => {
      setPlayersPerTeam(count)
      setTeam1PlayerNames((prev) => {
        const defaults = generateDefaultPlayerNames(0, count)
        return Array.from({ length: count }, (_, i) => prev[i] ?? defaults[i])
      })
      setTeam2PlayerNames((prev) => {
        const defaults = generateDefaultPlayerNames(1, count)
        return Array.from({ length: count }, (_, i) => prev[i] ?? defaults[i])
      })
    },
    []
  )

  const updatePlayerName = useCallback(
    (team: 1 | 2, index: number, name: string) => {
      if (team === 1) {
        setTeam1PlayerNames((prev) => {
          const next = [...prev]
          next[index] = name
          return next
        })
      } else {
        setTeam2PlayerNames((prev) => {
          const next = [...prev]
          next[index] = name
          return next
        })
      }
    },
    []
  )

  function handleStart() {
    onStart({
      overs,
      mode,
      team1Name: team1Name.trim() || DEFAULT_TEAM_NAMES.team1,
      team2Name: team2Name.trim() || DEFAULT_TEAM_NAMES.team2,
      playersPerTeam,
      team1PlayerNames,
      team2PlayerNames,
    })
  }

  function oversLabel(o: OversOption): string {
    if (o === "test") return "Test Match"
    return `${o} Overs`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        {/* Title */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-balance text-center font-sans text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Kriklu
          </h1>
          <p className="text-center font-sans text-sm text-muted-foreground">
            Ludo meets Cricket on a neon board
          </p>
        </div>

        <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col gap-6 p-6">
            {/* Game Mode */}
            <div className="flex flex-col gap-2">
              <Label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Game Mode
              </Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("local")}
                  className={`flex-1 rounded-lg border px-4 py-3 font-sans text-sm font-medium transition-all ${
                    mode === "local"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  2 Players
                </button>
                <button
                  onClick={() => setMode("cpu")}
                  className={`flex-1 rounded-lg border px-4 py-3 font-sans text-sm font-medium transition-all ${
                    mode === "cpu"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  vs CPU
                </button>
              </div>
            </div>

            {/* Overs + Players per team row */}
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-2">
                <Label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Match Format
                </Label>
                <Select
                  value={String(overs)}
                  onValueChange={(v) => setOvers(v === "test" ? "test" : Number(v) as OversOption)}
                >
                  <SelectTrigger className="bg-secondary/50 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OVERS_OPTIONS.map((o) => (
                      <SelectItem key={String(o)} value={String(o)}>
                        {oversLabel(o as OversOption)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Players / Team
                </Label>
                <Select
                  value={String(playersPerTeam)}
                  onValueChange={(v) => handlePlayersChange(Number(v))}
                >
                  <SelectTrigger className="bg-secondary/50 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAYERS_PER_TEAM_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} Players
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Team 1 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: TEAM_1_COLOR }}
                  />
                  Team 1
                </Label>
                <Input
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder={DEFAULT_TEAM_NAMES.team1}
                  className="bg-secondary/50 font-sans"
                  maxLength={20}
                />
              </div>
              <button
                onClick={() => setShowTeam1Players((v) => !v)}
                className="flex items-center gap-1 font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {showTeam1Players ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showTeam1Players ? "Hide" : "Edit"} Player Names
              </button>
              {showTeam1Players && (
                <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-lg border border-border/30 bg-secondary/20 p-3">
                  {team1PlayerNames.slice(0, playersPerTeam).map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
                        {i + 1}.
                      </span>
                      <Input
                        value={name}
                        onChange={(e) => updatePlayerName(1, i, e.target.value)}
                        className="h-8 bg-secondary/50 font-sans text-xs"
                        maxLength={20}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: TEAM_2_COLOR }}
                  />
                  {mode === "cpu" ? "CPU Team" : "Team 2"}
                </Label>
                <Input
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder={DEFAULT_TEAM_NAMES.team2}
                  className="bg-secondary/50 font-sans"
                  maxLength={20}
                  disabled={mode === "cpu"}
                />
              </div>
              <button
                onClick={() => setShowTeam2Players((v) => !v)}
                className="flex items-center gap-1 font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {showTeam2Players ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showTeam2Players ? "Hide" : "Edit"} Player Names
              </button>
              {showTeam2Players && (
                <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-lg border border-border/30 bg-secondary/20 p-3">
                  {team2PlayerNames.slice(0, playersPerTeam).map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
                        {i + 1}.
                      </span>
                      <Input
                        value={name}
                        onChange={(e) => updatePlayerName(2, i, e.target.value)}
                        className="h-8 bg-secondary/50 font-sans text-xs"
                        maxLength={20}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Button */}
            <Button
              size="lg"
              onClick={handleStart}
              className="w-full bg-primary font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]"
            >
              Start Match
            </Button>
          </CardContent>
        </Card>

        {/* Board legend */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { label: "1", color: "#2a5a5a" },
            { label: "2", color: "#2a6a5a" },
            { label: "3", color: "#2a7a5a" },
            { label: "4", color: "#8a6a10" },
            { label: "6", color: "#aa7a00" },
            { label: "W", color: "#7a2a2a" },
            { label: "Wd", color: "#5a3a7a" },
            { label: "NB", color: "#4a2a6a" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5"
            >
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-mono text-xs text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
