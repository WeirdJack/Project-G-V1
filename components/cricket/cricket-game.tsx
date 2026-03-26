"use client"

import { useState, useCallback, useEffect } from "react"
import { useCricketGame } from "@/hooks/use-cricket-game"
import { useGameSounds } from "@/hooks/use-game-sounds"
import { startBackgroundMusic, stopBackgroundMusic, unlockAudio } from "@/lib/cricket-game/sound-engine"
import { Volume2, VolumeX } from "lucide-react"
import { CricketFieldBg } from "./cricket-field-bg"
import { SplashScreen } from "./splash-screen"
import { MatchSetup } from "./match-setup"
import { TossOverlay } from "./toss-overlay"
import { GameBoard } from "./game-board"
import { Dice } from "./dice"
import { ScoreboardTeam, ScoreboardTarget, ScoreboardBatter, ScoreboardBowler, ThisOver } from "./scoreboard"
import { CommentaryFeed } from "./commentary-feed"
import { Umpire } from "./umpire"
import { InningsSummary } from "./innings-summary"
import { MatchResult } from "./match-result"
import { DuckWalk } from "./duck-walk"

export function CricketGame() {
  const { state, startMatch, rollDice, startNextInnings, restart } = useCricketGame()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
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

  const handleSplashComplete = useCallback(() => {
    // Unlock audio on first user interaction (required for iOS/Android)
    unlockAudio()
    setShowSplash(false)
  }, [])

  // Splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Setup phase
  if (state.phase === "setup") {
    return <MatchSetup onStart={startMatch} />
  }

  // Toss phase (overlay on top of batting layout)
  if (state.phase === "toss") {
    return <TossOverlay state={state} />
  }

  // Innings break
  if (state.phase === "innings-break") {
    return <InningsSummary state={state} onContinue={startNextInnings} />
  }

  // Match result
  if (state.phase === "result") {
    return <MatchResult state={state} onRestart={restart} />
  }

  // Batting phase - main game UI
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background" onClick={unlockAudio}>
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-border/30 px-4 py-2">
        <h1 className="font-sans text-sm font-semibold text-foreground">
          Kriklu
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className="flex items-center gap-1 font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="sr-only">{soundEnabled ? "Mute" : "Unmute"}</span>
          </button>
          <button
            onClick={restart}
            className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Quit Match
          </button>
        </div>
      </header>

      {/* Main game area - responsive spacing */}
      <div className="flex flex-1 flex-col items-center justify-start overflow-hidden gap-1.5 px-2 py-1 sm:justify-between sm:gap-2 sm:py-3">
        {/* Umpire + Commentary side by side at the top */}
        <div className="flex w-full items-stretch justify-center gap-1 sm:gap-3 shrink-0 sm:max-w-xl">
          <div className="flex shrink-0 flex-col items-center">
            <Umpire state={state} />
          </div>
          <div className="min-w-0 flex-1">
            <CommentaryFeed state={state} />
          </div>
        </div>

        {/* Game board in the middle — duck walk + field bg lives here */}
          <div className="relative w-full max-w-[min(100%,60vh)] sm:max-w-[min(100%,65vh)]">
            <CricketFieldBg />
            <GameBoard state={state} />
            {/* Duck walk overlay (golden duck) — sits over board */}
            <DuckWalk state={state} soundEnabled={soundEnabled} />
          </div>
        </div>

        {/* Bottom section: score left | This Over + Dice | score right */}
        <div className="w-full flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 sm:max-w-xl">
          <ThisOver state={state} />
          <div className="flex w-full items-start justify-between gap-2 px-1">
            {/* Left scores: team score + batter */}
            <div className="flex flex-col gap-1 items-start">
              <ScoreboardTeam state={state} />
              <ScoreboardBatter state={state} />
            </div>

            {/* Center: Dice */}
            <div className="flex shrink-0 items-center justify-center">
              <Dice state={state} onRoll={rollDice} />
            </div>

            {/* Right scores: target/innings + bowler */}
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
