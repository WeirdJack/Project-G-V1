"use client"

import { useEffect, useCallback } from "react"
import { useSnakeGame, type Direction } from "@/hooks/use-snake-game"
import { GameBoard } from "@/components/game-board"
import { GameOverlay } from "@/components/game-overlay"
import { ScorePanel } from "@/components/score-panel"
import { Pause } from "lucide-react"

export function SnakeGame() {
  const {
    snake,
    food,
    direction,
    gameState,
    score,
    highScore,
    level,
    ateFood,
    startGame,
    togglePause,
    changeDirection,
  } = useSnakeGame()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
      }

      if (keyMap[e.key]) {
        e.preventDefault()
        if (gameState === "PLAYING") {
          changeDirection(keyMap[e.key])
        }
      }

      if (e.key === " " || e.key === "Escape") {
        e.preventDefault()
        if (gameState === "PLAYING") {
          togglePause()
        } else if (gameState === "PAUSED") {
          togglePause()
        } else if (gameState === "GAME_OVER" || gameState === "IDLE") {
          startGame()
        }
      }

      if (e.key === "Enter") {
        e.preventDefault()
        if (gameState === "GAME_OVER" || gameState === "IDLE") {
          startGame()
        }
      }
    },
    [gameState, changeDirection, togglePause, startGame]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-4">
      <header className="flex flex-col items-center gap-1">
        <h1 className="text-2xl font-bold font-mono text-primary tracking-widest">
          SNAKE
        </h1>
        <p className="text-xs font-mono text-muted-foreground">
          Arrow keys to move &middot; Space to pause
        </p>
      </header>

      <ScorePanel score={score} highScore={highScore} level={level} />

      <div className="relative">
        <GameBoard snake={snake} food={food} ateFood={ateFood} />
        <GameOverlay
          gameState={gameState}
          score={score}
          highScore={highScore}
          level={level}
          onStart={startGame}
          onTogglePause={togglePause}
        />
      </div>

      <footer className="flex items-center gap-4">
        {gameState === "PLAYING" && (
          <button
            onClick={togglePause}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-mono text-muted-foreground transition-all hover:text-foreground hover:border-primary/30"
          >
            <Pause className="h-3.5 w-3.5" />
            Pause
          </button>
        )}
        <p className="text-[10px] font-mono text-muted-foreground">
          WASD also works &middot; Snake length: {snake.length}
        </p>
      </footer>
    </main>
  )
}
