"use client"

import { useEffect, useRef, useState } from "react"
import type { GameState } from "@/lib/cricket-game/types"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"
import { getOverString } from "@/lib/cricket-game/game-engine"
import { ScorecardModal } from "./scorecard"

interface MatchResultProps {
  state: GameState
  onRestart: () => void
  onQuit: () => void
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; color: string; size: number; shape: "rect" | "circle"
}

// ── Cricket Trophy SVG ───────────────────────────────────────────────────────

function CricketTrophy({ color, isTie }: { color: string; isTie: boolean }) {
  const c = isTie ? "#aaa" : color
  return (
    <div style={{ animation: "trophy-drop 0.8s cubic-bezier(0.34,1.4,0.64,1) both" }}>
      <svg viewBox="0 0 110 120" width="100" height="110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="55" cy="60" rx="45" ry="50" fill={c} opacity="0.08" />
        <rect x="28" y="100" width="54" height="10" rx="4" fill={c} stroke="#111" strokeWidth="2" />
        <rect x="34" y="96" width="42" height="6" rx="2" fill={c} stroke="#111" strokeWidth="1.5" />
        <rect x="44" y="82" width="22" height="16" rx="3" fill={c} stroke="#111" strokeWidth="2" />
        <path d="M20,14 Q15,56 36,76 Q44,84 55,84 Q66,84 74,76 Q95,56 90,14 Z"
          fill={c} stroke="#111" strokeWidth="3" />
        <path d="M34,22 Q36,52 42,72" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.25" />
        <path d="M76,14 Q85,50 76,72 Q68,80 60,82" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.1" />
        <path d="M20,22 Q6,34 8,54 Q10,68 26,74" stroke={c} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M20,22 Q6,34 8,54 Q10,68 26,74" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
        <path d="M90,22 Q104,34 102,54 Q100,68 84,74" stroke={c} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M90,22 Q104,34 102,54 Q100,68 84,74" stroke="#111" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
        <circle cx="55" cy="14" r="12" fill="#c0392b" stroke="#111" strokeWidth="2" />
        <path d="M50,6 Q54,14 50,22" stroke="#f5f5dc" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M60,6 Q56,14 60,22" stroke="#f5f5dc" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="48" cy="10" rx="4" ry="2" fill="#fff" opacity="0.15" transform="rotate(-20,48,10)" />
        <polygon points="55,30 57.5,38 66,38 59,43 61.5,52 55,47 48.5,52 51,43 44,38 52.5,38"
          fill="#fff" opacity={isTie ? 0.3 : 0.9} />
        <g style={{ animation: "sparkle 1.6s ease-in-out infinite" }}>
          <line x1="12" y1="10" x2="12" y2="2"  stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
          <line x1="8"  y1="14" x2="2"  y2="14" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
          <line x1="98" y1="10" x2="98" y2="2"  stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
          <line x1="102" y1="14" x2="108" y2="14" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
          <line x1="55" y1="2" x2="55" y2="-3" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

// ── Scorebook row ─────────────────────────────────────────────────────────────

function ScorebookCard({
  teamKey, state, isFirst,
}: { teamKey: "team1" | "team2"; state: GameState; isFirst: boolean }) {
  const team = state[teamKey]
  const color = teamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
  const [showScorecard, setShowScorecard] = useState(false)
  const topBatters = team.players
    .filter((p) => p.ballsFaced > 0)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 3)

  return (
    <>
      <div
        className="flex flex-col gap-2 overflow-hidden rounded-xl"
        style={{
          border: `1.5px solid ${color}44`,
          backgroundColor: `${color}08`,
          boxShadow: `inset 3px 0 0 ${color}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-sans text-sm font-bold text-foreground">{team.name}</span>
            <span className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
              style={{ backgroundColor: color + "20", color }}>
              {isFirst ? "1st Innings" : "2nd Innings"}
            </span>
          </div>
          <button
            onClick={() => setShowScorecard(true)}
            className="rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider transition-colors hover:opacity-80"
            style={{ borderColor: color + "55", color, backgroundColor: color + "18" }}
          >
            Scorecard
          </button>
        </div>

        {/* Score line */}
        <div className="flex items-baseline gap-2 px-4">
          <span className="font-mono text-3xl font-black tracking-tight text-foreground">
            {team.totalRuns}/{team.wickets}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            ({getOverString(team.overs, team.balls)} ov)
          </span>
        </div>

        {/* Top batters */}
        {topBatters.length > 0 && (
          <div className="flex flex-col gap-0 px-4 pb-2">
            <div className="mb-1 flex items-center gap-2">
              <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${color}44, transparent)` }} />
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color }}>Top Batters</span>
            </div>
            {topBatters.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-xs text-foreground">{p.name}</span>
                  {p.isOut && (
                    <span className="rounded font-mono text-[8px] uppercase tracking-wide"
                      style={{ color: "#ff6666", backgroundColor: "#ff666618" }}>out</span>
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-foreground">
                  {p.runs}
                  <span className="font-normal text-muted-foreground"> ({p.ballsFaced})</span>
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t pt-1" style={{ borderColor: color + "22" }}>
              <span className="font-mono text-[10px] text-muted-foreground">Extras</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                W:{team.extras.wides} NB:{team.extras.noBalls}
              </span>
            </div>
          </div>
        )}
      </div>
      {showScorecard && (
        <ScorecardModal state={state} defaultTeam={teamKey} onClose={() => setShowScorecard(false)} />
      )}
    </>
  )
}

// ── Wickets graphic for result page ─────────────────────────────────────────

function ResultWickets({ hit }: { hit: boolean }) {
  return (
    <svg viewBox="0 0 80 40" width="64" height="32" aria-hidden="true">
      {[14, 40, 66].map((x, i) => (
        <g key={x}
          style={hit && i === 1 ? { animation: "wicket-fall 0.6s ease-out 0.4s both" } : undefined}
        >
          <rect x={x - 3} y="4" width="6" height="26" rx="3" fill="#d4c08a" stroke="#8a7a40" strokeWidth="1.5" />
          <rect x={x - 6} y="2" width="12" height="5" rx="2.5" fill="#d4c08a" stroke="#8a7a40" strokeWidth="1.5" />
        </g>
      ))}
      <rect x="10" y="4" width="12" height="2" rx="1" fill={hit ? "#888" : "#f0d060"} />
      <rect x="58" y="4" width="12" height="2" rx="1" fill="#f0d060" />
      <rect x="0" y="30" width="80" height="4" rx="2" fill="#3a5a2a" />
      <rect x="0" y="30" width="80" height="2" rx="1" fill="#4a7a3a" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function MatchResult({ state, onRestart, onQuit }: MatchResultProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])

  const isTie = state.result?.includes("Tied") || state.result?.includes("Tie")
  const winnerKey = state.team1.totalRuns >= state.team2.totalRuns ? "team1" : "team2"
  const winnerColor = isTie ? "#aaaaaa" : (winnerKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR)

  // Confetti effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const colors = [TEAM_1_COLOR, TEAM_2_COLOR, "#ffe066", "#ff6666", "#88ddff", "#ccff88"]
    const dpr = window.devicePixelRatio || 1

    function spawn() {
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * (canvas?.clientWidth || 400),
          y: -10 - Math.random() * 40,
          vx: (Math.random() - 0.5) * 5,
          vy: Math.random() * 3 + 1.5,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 5 + 2,
          shape: Math.random() > 0.5 ? "rect" : "circle",
        })
      }
    }
    spawn()
    const spawnInterval = setInterval(spawn, 2000)
    let frameId: number

    function animate() {
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, rect.width, rect.height)
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0.02)
      for (const p of particlesRef.current) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.vx *= 0.99; p.life -= 0.006
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        if (p.shape === "circle") {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(p.x, p.y, p.size, p.size * 1.6)
        }
      }
      ctx.globalAlpha = 1
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(frameId); clearInterval(spawnInterval) }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: "#070e06" }}
    >
      {/* Confetti */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 h-full w-full" />

      {/* Scanlines */}
      <div className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 6px)" }} />

      {/* Safe-area spacer + content */}
      <div className="safe-top relative z-10 flex justify-center px-4 pb-8">
        <div
          className="flex w-full max-w-md flex-col items-center gap-5"
          style={{ animation: "result-rise 0.55s ease-out both" }}
        >
        {/* Header bar */}
        <div className="flex w-full items-center justify-center gap-3 rounded-xl border px-5 py-3"
          style={{ borderColor: winnerColor + "44", backgroundColor: winnerColor + "10" }}>
          <ResultWickets hit={!isTie} />
          <div className="flex flex-col items-center gap-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: winnerColor }}>
              Match Result
            </span>
            <h1 className="text-balance text-center font-sans text-lg font-black sm:text-xl"
              style={{ color: isTie ? "#ddd" : winnerColor, textShadow: `0 0 20px ${winnerColor}44` }}>
              {state.result}
            </h1>
          </div>
          <ResultWickets hit={false} />
        </div>

        {/* Trophy */}
        <CricketTrophy color={winnerColor} isTie={!!isTie} />

        {/* Scorebooks */}
        <div className="flex w-full flex-col gap-3">
          {(["team1", "team2"] as const).map((key) => (
            <ScorebookCard
              key={key}
              teamKey={key}
              state={state}
              isFirst={key === state.firstBattingTeamKey}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onRestart}
            className="flex-1 rounded-xl border py-3.5 font-mono text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderColor: "#4a8a3a",
              backgroundColor: "#1a3a12",
              color: "#8fda6a",
              boxShadow: "0 0 20px #3a7a2a22",
            }}
          >
            Play Again
          </button>
          <button
            onClick={onQuit}
            className="rounded-xl border px-5 py-3.5 font-mono text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              borderColor: "#7a2a2a",
              backgroundColor: "#3a0a0a",
              color: "#f87171",
            }}
          >
            Quit
          </button>
        </div>

        {/* Footer tag */}
        <p className="pb-2 font-mono text-[9px] uppercase tracking-widest" style={{ color: "#2a4a2a" }}>
          Kriklu Cricket Board Game &mdash; 2025
        </p>
        </div>{/* end max-w-md */}
      </div>{/* end safe-top wrapper */}
    </div>
  )
}
