"use client"

import { useEffect, useState, useCallback } from "react"
import { playSound, unlockAudio } from "@/lib/cricket-game/sound-engine"
import type { GameMode } from "@/lib/cricket-game/types"

interface SplashScreenProps {
  onComplete: (mode: GameMode) => void
}

function PixelBatter() {
  return (
    <svg viewBox="0 0 48 72" width="64" height="96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ imageRendering: "pixelated" }}>
      <rect x="14" y="2" width="20" height="4" fill="#e8e0b0" />
      <rect x="12" y="6" width="24" height="10" fill="#e8e0b0" />
      <rect x="10" y="8" width="4" height="6" fill="#e8e0b0" />
      <rect x="10" y="12" width="6" height="2" fill="#888" />
      <rect x="10" y="14" width="6" height="2" fill="#aaa" />
      <rect x="14" y="16" width="16" height="8" fill="#d4a96a" />
      <rect x="16" y="18" width="4" height="2" fill="#1a1a1a" />
      <rect x="26" y="18" width="4" height="2" fill="#1a1a1a" />
      <rect x="12" y="24" width="24" height="28" fill="#f0ece0" />
      <rect x="12" y="28" width="24" height="4" fill="#2266cc" />
      <rect x="4" y="24" width="8" height="6" fill="#d4a96a" />
      <rect x="2" y="30" width="8" height="6" fill="#d4a96a" />
      <rect x="36" y="24" width="8" height="6" fill="#f0ece0" />
      <rect x="38" y="30" width="8" height="6" fill="#f0ece0" />
      <rect x="0" y="28" width="4" height="20" fill="#c8a050" />
      <rect x="0" y="46" width="6" height="10" fill="#c8a050" />
      <rect x="12" y="52" width="10" height="16" fill="#f0ece0" />
      <rect x="26" y="52" width="10" height="16" fill="#f0ece0" />
      <rect x="10" y="66" width="12" height="4" fill="#222" />
      <rect x="26" y="66" width="12" height="4" fill="#222" />
      <rect x="12" y="52" width="10" height="14" fill="#e8e4d0" />
      <rect x="26" y="52" width="10" height="14" fill="#e8e4d0" />
    </svg>
  )
}

function PixelWickets() {
  return (
    <svg viewBox="0 0 64 40" width="80" height="50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ imageRendering: "pixelated" }}>
      {[12, 32, 52].map((x) => (
        <g key={x}>
          <rect x={x - 2} y="8" width="4" height="24" fill="#d4c080" />
          <rect x={x - 4} y="6" width="8" height="4" fill="#d4c080" />
        </g>
      ))}
      <rect x="8" y="8" width="12" height="2" fill="#ffcc00" />
      <rect x="42" y="8" width="12" height="2" fill="#ffcc00" />
      <rect x="0" y="32" width="64" height="4" fill="#2a4a1a" />
      <rect x="0" y="32" width="64" height="2" fill="#3a6a2a" />
    </svg>
  )
}

function PixelBall({ x, y, size = 14 }: { x: number; y: number; size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", left: x, top: y, imageRendering: "pixelated" }} aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="#cc2222" />
      <path d="M5,7 Q8,10 5,13" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M15,7 Q12,10 15,13" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 137.508) % 100,
  y: (i * 97.31) % 100,
  size: i % 5 === 0 ? 2 : 1,
  opacity: 0.3 + (i % 4) * 0.15,
}))

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "ready" | "mode-select" | "exit">("enter")
  const [blinkOn, setBlinkOn] = useState(true)
  const [ballPos, setBallPos] = useState(0)

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("hold"), 100)
    const readyTimer = setTimeout(() => setPhase("ready"), 1200)
    return () => { clearTimeout(holdTimer); clearTimeout(readyTimer) }
  }, [])

  useEffect(() => {
    if (phase !== "ready") return
    const id = setInterval(() => setBlinkOn((v) => !v), 600)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    let frame: number
    let t = 0
    function tick() { t += 0.025; setBallPos(t); frame = requestAnimationFrame(tick) }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleTap = useCallback(() => {
    if (phase === "exit" || phase === "mode-select") return
    if (phase !== "ready") return
    unlockAudio()
    playSound("stumps-hit")
    setPhase("mode-select")
  }, [phase])

  const handleModeSelect = useCallback((mode: GameMode) => {
    setPhase("exit")
    setTimeout(() => onComplete(mode), 500)
  }, [onComplete])

  const ballX = Math.round(50 + 40 * Math.sin(ballPos))
  const ballY = Math.round(24 + 16 * Math.abs(Math.sin(ballPos * 1.5)))

  return (
    <div
      className="fixed inset-0 z-50 select-none overflow-hidden"
      style={{ backgroundColor: "#050a14", opacity: phase === "exit" ? 0 : 1, transition: "opacity 0.5s ease-out" }}
      onClick={phase === "ready" ? handleTap : undefined}
    >
      {/* Stars */}
      <div className="absolute inset-0">
        {STARS.map((star, i) => (
          <div key={i} className="absolute rounded-sm"
            style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, backgroundColor: "#fff", opacity: star.opacity }} />
        ))}
      </div>

      {/* CRT scanlines */}
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)", zIndex: 10 }} />
      {/* CRT vignette */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)", zIndex: 11 }} />

      <div className="relative z-20 flex h-full flex-col items-center justify-between px-4 py-8">
        {/* Studio tag */}
        <div className="flex items-center gap-2 rounded px-3 py-1"
          style={{ opacity: phase === "enter" ? 0 : 1, transition: "opacity 0.4s ease-out 0.1s", backgroundColor: "#1a2a1a", border: "1px solid #2a4a2a" }}>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#6a9a5a" }}>Kriklu Studios</span>
          <span className="font-mono text-[9px]" style={{ color: "#3a5a3a" }}>presents</span>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center gap-6"
          style={{ opacity: phase === "enter" ? 0 : 1, transform: phase === "enter" ? "translateY(20px)" : "translateY(0)", transition: "opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s" }}>

          {/* Bouncing ball */}
          <div className="relative h-16 w-32">
            <PixelBall x={ballX - 7} y={ballY - 7} size={14} />
            <div className="absolute bottom-0 rounded-full"
              style={{ left: ballX - 6, width: 12, height: 3, backgroundColor: "#000", opacity: 0.3 + 0.4 * (1 - Math.abs(Math.sin(ballPos * 1.5))) }} />
          </div>

          {/* Title */}
          <div className="flex flex-col items-center gap-0">
            <div className="relative">
              <h1 className="select-none font-mono font-black uppercase" aria-hidden="true"
                style={{ fontSize: "clamp(3rem,14vw,5rem)", letterSpacing: "0.08em", color: "#1a4a1a", position: "absolute", top: 4, left: 4 }}>
                KRIKLU
              </h1>
              <h1 className="select-none font-mono font-black uppercase"
                style={{ fontSize: "clamp(3rem,14vw,5rem)", letterSpacing: "0.08em", color: "#8fda6a", textShadow: "0 0 30px #4a9a2a, 0 0 60px #2a6a1a", position: "relative" }}>
                KRIKLU
              </h1>
            </div>
            <div className="px-4 py-0.5" style={{ backgroundColor: "#8fda6a", marginTop: 2 }}>
              <span className="font-mono text-xs font-black uppercase tracking-widest" style={{ color: "#0a1208" }}>Cricket Board Game</span>
            </div>
          </div>

          {/* Scene */}
          <div className="flex items-end gap-3">
            <PixelWickets />
            <PixelBatter />
          </div>

          {/* Press start / mode select */}
          {phase !== "mode-select" ? (
            <div className="font-mono text-sm font-bold uppercase tracking-widest"
              style={{ color: "#ffcc00", opacity: phase === "ready" && blinkOn ? 1 : 0, transition: "opacity 0.15s", textShadow: "0 0 10px #ffcc0088", minHeight: "1.4em" }}>
              &#9654; Press Start &#9664;
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3"
              style={{ animation: "mode-in 0.35s cubic-bezier(0.34,1.4,0.64,1) both" }}>
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "#ffcc00" }}>Select Mode</p>
              <div className="flex gap-3">
                {([["local", "2 Players", "#4ade80"], ["cpu", "vs CPU", "#22d3ee"]] as [GameMode, string, string][]).map(([mode, label, col]) => (
                  <button key={mode} onClick={() => handleModeSelect(mode)}
                    className="cursor-pointer rounded px-5 py-2.5 font-mono text-sm font-black uppercase tracking-wider transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: col + "18", border: `2px solid ${col}`, color: col, boxShadow: `0 0 12px ${col}44` }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-1"
          style={{ opacity: phase === "enter" ? 0 : 1, transition: "opacity 0.5s ease-out 0.8s" }}>
          <div className="flex gap-6">
            {["1 PLAYER", "2 PLAYERS"].map((label) => (
              <span key={label} className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#3a6a5a" }}>{label}</span>
            ))}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#2a4a2a" }}>
            &copy; 2025 Kriklu Games &mdash; All rights reserved
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes mode-in {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
