"use client"

import { Play, RotateCcw, Pause, Trophy } from "lucide-react"
import { type GameState, LEVELS } from "@/hooks/use-snake-game"

interface GameOverlayProps {
  gameState: GameState
  score: number
  highScore: number
  level: number
  onStart: () => void
  onTogglePause: () => void
}

export function GameOverlay({
  gameState,
  score,
  highScore,
  level,
  onStart,
  onTogglePause,
}: GameOverlayProps) {
  if (gameState === "PLAYING") return null

  const isNewHighScore = gameState === "GAME_OVER" && score >= highScore && score > 0

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 text-center px-8">
        {gameState === "IDLE" && (
          <>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-4xl font-bold font-mono text-primary tracking-tight">
                SNAKE
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
                Use arrow keys to move
              </p>
            </div>
            <button
              onClick={onStart}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-mono font-semibold text-primary-foreground transition-all hover:opacity-90 hover:scale-105 active:scale-95"
            >
              <Play className="h-4 w-4" />
              Start Game
            </button>
            <div className="flex gap-6 mt-2">
              <div className="flex flex-col items-center gap-1">
                <kbd className="flex h-8 w-8 items-center justify-center rounded border border-border bg-secondary text-xs font-mono text-foreground">
                  {"↑"}
                </kbd>
                <div className="flex gap-1">
                  <kbd className="flex h-8 w-8 items-center justify-center rounded border border-border bg-secondary text-xs font-mono text-foreground">
                    {"←"}
                  </kbd>
                  <kbd className="flex h-8 w-8 items-center justify-center rounded border border-border bg-secondary text-xs font-mono text-foreground">
                    {"↓"}
                  </kbd>
                  <kbd className="flex h-8 w-8 items-center justify-center rounded border border-border bg-secondary text-xs font-mono text-foreground">
                    {"→"}
                  </kbd>
                </div>
              </div>
            </div>
          </>
        )}

        {gameState === "PAUSED" && (
          <>
            <h2 className="text-3xl font-bold font-mono text-foreground tracking-tight">
              PAUSED
            </h2>
            <button
              onClick={onTogglePause}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-mono font-semibold text-primary-foreground transition-all hover:opacity-90 hover:scale-105 active:scale-95"
            >
              <Play className="h-4 w-4" />
              Resume
            </button>
            <p className="text-xs text-muted-foreground font-mono">
              Press Space to resume
            </p>
          </>
        )}

        {gameState === "GAME_OVER" && (
          <>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-3xl font-bold font-mono text-destructive tracking-tight">
                GAME OVER
              </h2>
              {isNewHighScore && (
                <div className="flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 animate-pulse">
                  <Trophy className="h-4 w-4 text-accent" />
                  <span className="text-sm font-mono font-bold text-accent">
                    New High Score!
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-5xl font-bold font-mono text-foreground tabular-nums">
                {score}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Level: {LEVELS[level].name}
              </span>
            </div>

            <button
              onClick={onStart}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-mono font-semibold text-primary-foreground transition-all hover:opacity-90 hover:scale-105 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Play Again
            </button>
            <p className="text-xs text-muted-foreground font-mono">
              Press Space or Enter to restart
            </p>
          </>
        )}
      </div>
    </div>
  )
}
