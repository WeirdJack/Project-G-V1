"use client"

import { Trophy, Zap, Star } from "lucide-react"
import { LEVELS } from "@/hooks/use-snake-game"

interface ScorePanelProps {
  score: number
  highScore: number
  level: number
}

export function ScorePanel({ score, highScore, level }: ScorePanelProps) {
  const currentLevel = LEVELS[level]
  const nextLevel = LEVELS[level + 1]
  const progress = nextLevel
    ? ((score - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100
    : 100

  return (
    <div className="flex flex-col gap-4 w-full max-w-[480px]">
      <div className="flex items-center justify-between gap-4">
        {/* Score */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5">
          <Star className="h-4 w-4 text-accent" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Score
            </span>
            <span className="text-xl font-mono font-bold text-foreground tabular-nums leading-tight">
              {score}
            </span>
          </div>
        </div>

        {/* Level */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5">
          <Zap className={`h-4 w-4 ${currentLevel.color}`} />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Level
            </span>
            <span className={`text-sm font-mono font-bold leading-tight ${currentLevel.color}`}>
              {currentLevel.name}
            </span>
          </div>
        </div>

        {/* High Score */}
        <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5">
          <Trophy className="h-4 w-4 text-accent" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Best
            </span>
            <span className="text-xl font-mono font-bold text-accent tabular-nums leading-tight">
              {highScore}
            </span>
          </div>
        </div>
      </div>

      {/* Level progress bar */}
      {nextLevel && (
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
            Next: {nextLevel.name}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {nextLevel.minScore - score} to go
          </span>
        </div>
      )}
    </div>
  )
}
