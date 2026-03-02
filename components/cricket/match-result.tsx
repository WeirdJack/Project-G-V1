"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import type { GameState } from "@/lib/cricket-game/types"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"
import { getOverString } from "@/lib/cricket-game/game-engine"

interface MatchResultProps {
  state: GameState
  onRestart: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

export function MatchResult({ state, onRestart }: MatchResultProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])

  // Determine winner info
  const isTie = state.result?.includes("Tied")
  const winnerKey =
    state.team1.totalRuns > state.team2.totalRuns ? "team1" : "team2"
  const winnerColor = winnerKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR

  // Confetti particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const colors = [TEAM_1_COLOR, TEAM_2_COLOR, "#ffe066", "#ff6666", "#bb88ee"]
    const dpr = window.devicePixelRatio || 1

    function spawnParticles() {
      for (let i = 0; i < 60; i++) {
        particlesRef.current.push({
          x: Math.random() * (canvas?.clientWidth || 400),
          y: -10 - Math.random() * 50,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 3 + 1,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2,
        })
      }
    }

    spawnParticles()
    const spawnInterval = setInterval(spawnParticles, 2000)

    let frameId: number

    function animate() {
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, rect.width, rect.height)

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0)

      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.03
        p.vx *= 0.99
        p.life -= 0.005

        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.size, p.size * 1.5)
      }

      ctx.globalAlpha = 1
      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(frameId)
      clearInterval(spawnInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4">
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-border/50 bg-card/95 p-6 shadow-2xl backdrop-blur-sm"
        style={{
          animation: "result-in 0.6s ease-out",
          boxShadow: isTie ? undefined : `0 0 60px ${winnerColor}20`,
        }}
      >
        {/* Result text */}
        <div className="flex flex-col items-center gap-2">
          <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
            Match Result
          </p>
          <h2
            className="text-balance text-center font-sans text-xl font-bold sm:text-2xl"
            style={{ color: isTie ? undefined : winnerColor }}
          >
            {state.result}
          </h2>
        </div>

        {/* Both scorecards */}
        <div className="flex w-full flex-col gap-3">
          {(["team1", "team2"] as const).map((key) => {
            const team = state[key]
            const color = key === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
            const isFirst = key === state.firstBattingTeamKey

            return (
              <div
                key={key}
                className="flex flex-col gap-2 rounded-xl border border-border/30 bg-secondary/30 p-4"
                style={{ borderLeftColor: color, borderLeftWidth: 3 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-sans text-sm font-medium text-foreground">
                      {team.name}
                    </span>
                  </div>
                  <span className="font-sans text-xs text-muted-foreground">
                    {isFirst ? "1st Bat" : "2nd Bat"}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-foreground">
                    {team.totalRuns}/{team.wickets}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    ({getOverString(team.overs, team.balls)} ov)
                  </span>
                </div>

                {/* Top scorer */}
                {team.players.filter((p) => p.ballsFaced > 0).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {team.players
                      .filter((p) => p.ballsFaced > 0)
                      .sort((a, b) => b.runs - a.runs)
                      .slice(0, 3)
                      .map((p) => (
                        <span
                          key={p.id}
                          className="font-sans text-xs text-muted-foreground"
                        >
                          {p.name}{" "}
                          <span className="font-mono font-medium text-foreground">
                            {p.runs}
                          </span>
                          ({p.ballsFaced})
                        </span>
                      ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Play again */}
        <Button
          size="lg"
          onClick={onRestart}
          className="w-full bg-primary font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
        >
          Play Again
        </Button>
      </div>

      <style jsx>{`
        @keyframes result-in {
          0% { opacity: 0; transform: scale(0.85) translateY(30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
