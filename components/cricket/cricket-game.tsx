"use client"

import { useState, useCallback, useEffect } from "react"
import { useCricketGame } from "@/hooks/use-cricket-game"
import { useGameSounds } from "@/hooks/use-game-sounds"
import { startBackgroundMusic, stopBackgroundMusic, unlockAudio } from "@/lib/cricket-game/sound-engine"
import { Volume2, VolumeX, Zap, ZapOff, RotateCcw, LogOut, ClipboardList } from "lucide-react"
import { CricketFieldBg } from "./cricket-field-bg"
import { SplashScreen } from "./splash-screen"
import { MatchSetup } from "./match-setup"
import { TossOverlay } from "./toss-overlay"
import { GameBoard } from "./game-board"
import { Dice } from "./dice"
import { ScoreboardTeam, ScoreboardTarget, ScoreboardBatter, ScoreboardBowler, ThisOver } from "./scoreboard"
import { CommentaryFeed } from "./commentary-feed"
import { Umpire } from "./umpire"
import { ScorecardModal } from "./scorecard"
import { MatchResult } from "./match-result"
import { InningsSummary } from "./innings-summary"
import { DuckWalk } from "./duck-walk"
import { ThunderEffect } from "./thunder-effect"

import type { GameMode } from "@/lib/cricket-game/types"

export function CricketGame() {
  const { state, startMatch, callToss, electChoice, rollDice, startNextInnings, restart, restartSameConfig } = useCricketGame()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [gameMode, setGameMode] = useState<GameMode>("local")
  const [autoComplete, setAutoComplete] = useState(false)
  const [scorecardOpen, setScorecardOpen] = useState(false)
  useGameSounds(state, soundEnabled)

  // Start bg music when on setup page, stop when match starts
  useEffect(() => {
    if (!showSplash && state.phase === "setup" && soundEnabled) {
      startBackgroundMusic()
    } else {
      stopBackgroundMusic()
    }
    return () => { stopBackgroundMusic() }
  }, [showSplash, state.phase, soundEnabled])

  const handleSplashComplete = useCallback((mode: GameMode) => {
    unlockAudio()
    setGameMode(mode)
    setShowSplash(false)
  }, [])

  const handleQuit = useCallback(() => {
    restart()
    setShowSplash(true)
  }, [restart])

  // Splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Setup phase
  if (state.phase === "setup") {
    return <MatchSetup onStart={startMatch} mode={gameMode} onQuit={() => setShowSplash(true)} />
  }

  // Toss phase
  if (state.phase === "toss") {
    return <TossOverlay state={state} onCall={callToss} onElect={electChoice} />
  }

  // Innings break
  if (state.phase === "innings-break") {
    return <InningsSummary state={state} onContinue={startNextInnings} />
  }

  // Match result
  if (state.phase === "result") {
    return <MatchResult state={state} onRestart={restartSameConfig} onQuit={handleQuit} />
  }

  const isCpu = state.config.mode === "cpu"

  // Batting phase - main game UI
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background" onClick={unlockAudio}>
      <ThunderEffect state={state} />
      {scorecardOpen && (
        <ScorecardModal state={state} defaultTeam={state.battingTeamKey} onClose={() => setScorecardOpen(false)} />
      )}
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-border/30 px-3 py-2">
        <h1 className="font-sans text-sm font-semibold text-foreground">Kriklu</h1>
        <div className="flex items-center gap-2">
          {/* Scorecard button */}
          <button
            onClick={() => setScorecardOpen(true)}
            title="View scorecard"
            className="flex h-7 items-center gap-1 rounded-md border border-border/40 px-2 font-sans text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Card</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Auto-complete toggle — CPU mode only */}
          {isCpu && (
            <button
              onClick={() => setAutoComplete((v) => !v)}
              title={autoComplete ? "Auto-complete ON — click to slow down" : "Auto-complete OFF — click to speed up CPU"}
              className="flex h-7 items-center gap-1 rounded-md px-2 font-sans text-xs font-medium transition-colors"
              style={{
                backgroundColor: autoComplete ? "#1a3a12" : "transparent",
                color: autoComplete ? "#8fda6a" : "#6b7280",
                border: `1px solid ${autoComplete ? "#4a8a3a" : "transparent"}`,
              }}
            >
              {autoComplete ? <Zap className="h-3.5 w-3.5" /> : <ZapOff className="h-3.5 w-3.5" />}
              <span>Auto</span>
            </button>
          )}

          {/* Restart — replays same match from toss */}
          <button
            onClick={restartSameConfig}
            title="Restart match with same teams"
            className="flex h-7 items-center gap-1 rounded-md border border-border/40 px-2 font-sans text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restart</span>
          </button>

          {/* Quit — goes to opening screen */}
          <button
            onClick={handleQuit}
            title="Quit to main menu"
            className="flex h-7 items-center gap-1 rounded-md px-2 font-sans text-xs font-semibold transition-colors"
            style={{
              backgroundColor: "#3a0a0a",
              color: "#f87171",
              border: "1px solid #7a2a2a",
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Quit</span>
          </button>
        </div>
      </header>

      {/* Main game area */}
      <div className="flex flex-1 flex-col items-center justify-start overflow-hidden gap-1.5 px-2 py-1 sm:justify-between sm:gap-2 sm:py-3">
        {/* Umpire + Commentary */}
        <div className="flex w-full items-stretch justify-center gap-1 sm:gap-3 shrink-0 sm:max-w-xl">
          <div className="flex shrink-0 flex-col items-center">
            <Umpire state={state} />
          </div>
          <div className="min-w-0 flex-1">
            <CommentaryFeed state={state} />
          </div>
        </div>

        {/* Game board */}
        <div className="flex items-center justify-center w-full min-h-0 shrink-0 sm:flex-1">
          <div className="relative w-full max-w-[min(100%,60vh)] sm:max-w-[min(100%,65vh)]">
            <CricketFieldBg />
            <GameBoard state={state} />
            <DuckWalk state={state} soundEnabled={soundEnabled} />
          </div>
        </div>

        {/* Bottom section */}
        <div className="w-full flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 sm:max-w-xl">
          <ThisOver state={state} />
          <div className="flex w-full items-start justify-between gap-2 px-1">
            <div className="flex flex-col gap-1 items-start">
              <ScoreboardTeam state={state} />
              <ScoreboardBatter state={state} />
            </div>
            <div className="flex shrink-0 items-center justify-center">
              <Dice state={state} onRoll={rollDice} autoComplete={autoComplete && isCpu} />
            </div>
            <div className="flex flex-col gap-1 items-end">
              <ScoreboardTarget state={state} />
              <ScoreboardBowler state={state} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
