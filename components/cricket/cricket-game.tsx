"use client"

import { useState, useCallback, useEffect } from "react"
import { useCricketGame } from "@/hooks/use-cricket-game"
import { useGameSounds } from "@/hooks/use-game-sounds"
import { startBackgroundMusic, stopBackgroundMusic, unlockAudio } from "@/lib/cricket-game/sound-engine"
import { Volume2, VolumeX } from "lucide-react"
import { SplashScreen } from "./splash-screen"
import { MatchSetup } from "./match-setup"
import { TossOverlay } from "./toss-overlay"
import { GameBoard } from "./game-board"
import { Dice } from "./dice"
import { Scoreboard, ThisOver } from "./scoreboard"
import { CommentaryFeed } from "./commentary-feed"
import { Umpire } from "./umpire"
import { InningsSummary } from "./innings-summary"
import { MatchResult } from "./match-result"

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
    <div className="flex min-h-svh w-full flex-col bg-background" onClick={unlockAudio}>
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
        <div className="flex w-full items-stretch justify-center gap-1 sm:gap-3 shrink-0">
          <div className="flex shrink-0 flex-col items-center">
            <Umpire state={state} />
          </div>
          <div className="min-w-0 flex-1">
            <CommentaryFeed state={state} />
          </div>
        </div>

        {/* Game board in the middle with scoreboard inside */}
        <div className="flex items-center justify-center w-full min-h-0 shrink-0 sm:flex-1">
          <GameBoard state={state}>
            <Scoreboard state={state} />
          </GameBoard>
        </div>

        {/* Bottom section: This Over + Dice */}
        <div className="w-full flex flex-col items-center gap-0.5 sm:gap-2 shrink-0">
          <ThisOver state={state} />
          <div className="flex items-center justify-center">
            <Dice state={state} onRoll={rollDice} />
          </div>
        </div>
      </div>
    </div>
  )
}
