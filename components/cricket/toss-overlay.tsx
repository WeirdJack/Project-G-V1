"use client"

import { useEffect, useRef, useState } from "react"
import type { GameState } from "@/lib/cricket-game/types"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"
import { playSound } from "@/lib/cricket-game/sound-engine"

interface TossOverlayProps {
  state: GameState
}

/* Cartoon cricket ball SVG */
function CricketBall({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 60 60"
      width="60"
      height="60"
      style={{ animation: spinning ? "ball-spin 0.6s linear infinite" : "ball-settle 0.5s ease-out" }}
    >
      <circle cx="30" cy="30" r="28" fill="#c0392b" stroke="#7b241c" strokeWidth="2" />
      {/* Seam */}
      <path d="M30,4 Q44,14 44,30 Q44,46 30,56" stroke="#f5f5dc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M30,4 Q16,14 16,30 Q16,46 30,56" stroke="#f5f5dc" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Seam stitches */}
      {[10,18,26,34,42,50].map((y, i) => (
        <line key={i} x1="28" y1={y} x2="32" y2={y} stroke="#f5f5dc" strokeWidth="1.5" strokeLinecap="round" />
      ))}
      {/* Shine */}
      <ellipse cx="22" cy="18" rx="7" ry="4" fill="#fff" opacity="0.18" transform="rotate(-20,22,18)" />
    </svg>
  )
}

/* A cartoon captain figure */
function Captain({ color, name, isWinner }: { color: string; name: string; isWinner: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 48 80" width="48" height="80" xmlns="http://www.w3.org/2000/svg">
        {/* Body shadow */}
        <ellipse cx="24" cy="78" rx="12" ry="3" fill="#000" opacity="0.15" />
        {/* Legs */}
        <rect x="13" y="52" width="8" height="20" rx="3" fill="#1a2a3a" stroke="#111" strokeWidth="1.5" />
        <rect x="27" y="52" width="8" height="20" rx="3" fill="#1a2a3a" stroke="#111" strokeWidth="1.5" />
        {/* Shoes */}
        <ellipse cx="17" cy="73" rx="7" ry="3" fill="#0a0a0a" />
        <ellipse cx="31" cy="73" rx="7" ry="3" fill="#0a0a0a" />
        {/* Jersey */}
        <rect x="10" y="26" width="28" height="28" rx="5" fill={color} stroke="#111" strokeWidth="2" />
        {/* Jersey number */}
        <text x="24" y="44" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="bold" fill="white" opacity="0.7">C</text>
        {/* Arms */}
        <line x1="10" y1="32" x2="2" y2="44" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="10" y1="32" x2="2" y2="44" stroke="#111" strokeWidth="1" strokeLinecap="round" />
        <line x1="38" y1="32" x2="46" y2="44" stroke={color} strokeWidth="6" strokeLinecap="round" />
        <line x1="38" y1="32" x2="46" y2="44" stroke="#111" strokeWidth="1" strokeLinecap="round" />
        {/* Hands */}
        <circle cx="2" cy="44" r="3.5" fill="#d4a96a" stroke="#111" strokeWidth="1" />
        <circle cx="46" cy="44" r="3.5" fill="#d4a96a" stroke="#111" strokeWidth="1" />
        {/* Neck */}
        <rect x="20" y="20" width="8" height="8" rx="3" fill="#d4a96a" stroke="#111" strokeWidth="1" />
        {/* Head */}
        <circle cx="24" cy="14" r="12" fill="#d4a96a" stroke="#111" strokeWidth="2" />
        {/* Ears */}
        <ellipse cx="12" cy="14" rx="3" ry="4" fill="#c4996a" stroke="#111" strokeWidth="1" />
        <ellipse cx="36" cy="14" rx="3" ry="4" fill="#c4996a" stroke="#111" strokeWidth="1" />
        {/* Eyes */}
        <circle cx="20" cy="13" r="2" fill="#222" />
        <circle cx="28" cy="13" r="2" fill="#222" />
        <circle cx="20.7" cy="12.3" r="0.7" fill="#fff" />
        <circle cx="28.7" cy="12.3" r="0.7" fill="#fff" />
        {/* Smile */}
        {isWinner
          ? <path d="M18,18 Q24,23 30,18" stroke="#5a2a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          : <line x1="19" y1="19" x2="29" y2="19" stroke="#5a2a1a" strokeWidth="1.5" strokeLinecap="round" />
        }
        {/* Helmet */}
        <path d="M12,10 Q12,1 24,1 Q36,1 36,10" fill={color} stroke="#111" strokeWidth="2" />
        <rect x="11" y="8" width="3" height="8" rx="1.5" fill={color} stroke="#111" strokeWidth="1" />
        {/* Winner star */}
        {isWinner && (
          <polygon
            points="24,1 25.5,5 30,5 26.5,7.5 28,12 24,9.5 20,12 21.5,7.5 18,5 22.5,5"
            fill="#ffd700"
            stroke="#b8860b"
            strokeWidth="0.5"
          />
        )}
      </svg>
      <span
        className="max-w-[72px] truncate text-center font-sans text-xs font-bold"
        style={{ color }}
      >
        {name}
      </span>
      <span className="font-sans text-[9px] uppercase tracking-wider text-muted-foreground">Captain</span>
    </div>
  )
}

/* Match referee in white */
function Referee() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox="0 0 40 80" width="40" height="80" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="20" cy="78" rx="10" ry="3" fill="#000" opacity="0.12" />
        {/* Legs */}
        <rect x="10" y="50" width="7" height="20" rx="3" fill="#2a2a4a" stroke="#111" strokeWidth="1.5" />
        <rect x="23" y="50" width="7" height="20" rx="3" fill="#2a2a4a" stroke="#111" strokeWidth="1.5" />
        <ellipse cx="13.5" cy="71" rx="6" ry="2.5" fill="#0a0a0a" />
        <ellipse cx="26.5" cy="71" rx="6" ry="2.5" fill="#0a0a0a" />
        {/* White coat */}
        <rect x="8" y="24" width="24" height="28" rx="5" fill="#f0ece0" stroke="#ccc" strokeWidth="1.5" />
        {/* Clipboard */}
        <rect x="24" y="28" width="10" height="14" rx="2" fill="#d4b896" stroke="#888" strokeWidth="1" />
        <line x1="26" y1="31" x2="32" y2="31" stroke="#555" strokeWidth="0.8" />
        <line x1="26" y1="34" x2="32" y2="34" stroke="#555" strokeWidth="0.8" />
        <line x1="26" y1="37" x2="32" y2="37" stroke="#555" strokeWidth="0.8" />
        <rect x="27" y="26" width="6" height="3" rx="1" fill="#b8966a" stroke="#666" strokeWidth="0.5" />
        {/* Left arm */}
        <line x1="8" y1="30" x2="2" y2="40" stroke="#f0ece0" strokeWidth="5" strokeLinecap="round" />
        <circle cx="2" cy="40" r="3" fill="#d4a96a" stroke="#aaa" strokeWidth="1" />
        {/* Neck + Head */}
        <rect x="17" y="18" width="6" height="7" rx="2.5" fill="#d4a96a" stroke="#aaa" strokeWidth="1" />
        <circle cx="20" cy="11" r="10" fill="#d4a96a" stroke="#aaa" strokeWidth="1.5" />
        <ellipse cx="10" cy="11" rx="2.5" ry="3" fill="#c4996a" stroke="#aaa" strokeWidth="1" />
        <ellipse cx="30" cy="11" rx="2.5" ry="3" fill="#c4996a" stroke="#aaa" strokeWidth="1" />
        {/* Glasses */}
        <rect x="13" y="8" width="6" height="4" rx="2" fill="none" stroke="#888" strokeWidth="1" />
        <rect x="21" y="8" width="6" height="4" rx="2" fill="none" stroke="#888" strokeWidth="1" />
        <line x1="19" y1="10" x2="21" y2="10" stroke="#888" strokeWidth="1" />
        {/* Mustache */}
        <path d="M15,15 Q17,17 20,15 Q23,17 25,15" stroke="#5a3a1a" strokeWidth="1.5" fill="none" />
        {/* Hat */}
        <ellipse cx="20" cy="3" rx="13" ry="3.5" fill="#f0ece0" stroke="#ccc" strokeWidth="1" />
        <rect x="14" y="-4" width="12" height="8" rx="2" fill="#f0ece0" stroke="#ccc" strokeWidth="1" />
        <rect x="14" y="1" width="12" height="2" rx="0.5" fill="#b8a080" />
      </svg>
      <span className="font-sans text-[10px] font-medium text-muted-foreground">Referee</span>
    </div>
  )
}

/* Fun animal mascot — a cricket (the insect!) */
function CricketMascot() {
  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{ animation: "mascot-bounce 1s ease-in-out infinite" }}
    >
      <svg viewBox="0 0 60 60" width="52" height="52" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <ellipse cx="30" cy="36" rx="16" ry="12" fill="#5a9a2a" stroke="#2a5a10" strokeWidth="2" />
        {/* Head */}
        <circle cx="30" cy="20" r="10" fill="#6ab030" stroke="#2a5a10" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="26" cy="18" r="3" fill="#fff" stroke="#2a5a10" strokeWidth="1" />
        <circle cx="34" cy="18" r="3" fill="#fff" stroke="#2a5a10" strokeWidth="1" />
        <circle cx="26.8" cy="18.5" r="1.5" fill="#111" />
        <circle cx="34.8" cy="18.5" r="1.5" fill="#111" />
        <circle cx="27.3" cy="18" r="0.5" fill="#fff" />
        <circle cx="35.3" cy="18" r="0.5" fill="#fff" />
        {/* Antennae */}
        <line x1="26" y1="11" x2="18" y2="3" stroke="#2a5a10" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="18" cy="3" r="2" fill="#ffdd44" stroke="#b8860b" strokeWidth="1" />
        <line x1="34" y1="11" x2="42" y2="3" stroke="#2a5a10" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="42" cy="3" r="2" fill="#ffdd44" stroke="#b8860b" strokeWidth="1" />
        {/* Smile */}
        <path d="M24,24 Q30,29 36,24" stroke="#2a5a10" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Cricket bat in hand */}
        <rect x="42" y="28" width="4" height="18" rx="2" fill="#d4a96a" stroke="#8a6a30" strokeWidth="1" transform="rotate(15,44,37)" />
        <rect x="43" y="42" width="3" height="6" rx="1" fill="#b8966a" stroke="#8a6a30" strokeWidth="0.8" transform="rotate(15,44,37)" />
        {/* Legs */}
        <line x1="18" y1="44" x2="10" y2="54" stroke="#2a5a10" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="46" x2="14" y2="56" stroke="#2a5a10" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="44" x2="46" y2="54" stroke="#2a5a10" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="46" x2="42" y2="56" stroke="#2a5a10" strokeWidth="2" strokeLinecap="round" />
        {/* Wing shimmer */}
        <ellipse cx="28" cy="30" rx="8" ry="4" fill="#88cc44" opacity="0.4" transform="rotate(-10,28,30)" />
      </svg>
      <span className="font-mono text-[9px] font-bold text-green-400">Krik the Mascot</span>
    </div>
  )
}

export function TossOverlay({ state }: TossOverlayProps) {
  const soundPlayedRef = useRef(false)
  const [spinning, setSpinning] = useState(true)

  useEffect(() => {
    if (state.toss && !soundPlayedRef.current) {
      playSound("coin-toss")
      soundPlayedRef.current = true
      // Ball stops spinning after reveal
      const t = setTimeout(() => setSpinning(false), 800)
      return () => clearTimeout(t)
    }
  }, [state.toss])

  if (!state.toss) return null

  const team1Name = state.team1.name
  const team2Name = state.team2.name
  const winnerIsTeam1 = state.toss.winner === "team1"
  const winnerColor = winnerIsTeam1 ? TEAM_1_COLOR : TEAM_2_COLOR
  const winnerName = winnerIsTeam1 ? team1Name : team2Name
  const battingTeamName = state[state.battingTeamKey].name
  const bowlingTeamName = state[state.bowlingTeamKey].name

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Pitch texture strip */}
      <div className="absolute inset-x-0 top-1/2 h-24 -translate-y-1/2 bg-gradient-to-b from-green-900/30 to-green-950/30" />

      <div
        className="relative z-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-card/95 px-6 py-6 shadow-2xl mx-4"
        style={{
          animation: "toss-in 0.45s cubic-bezier(0.34,1.3,0.64,1)",
          boxShadow: `0 0 48px ${winnerColor}33, 0 0 0 1px ${winnerColor}22`,
        }}
      >
        {/* Header */}
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Coin Toss
        </p>

        {/* Characters row: captain1 | referee+ball | captain2 */}
        <div className="flex w-full items-end justify-between px-2">
          <Captain color={TEAM_1_COLOR} name={team1Name} isWinner={winnerIsTeam1} />

          {/* Center: referee holding the ball aloft */}
          <div className="flex flex-col items-center gap-1">
            <div className="mb-1">
              <CricketBall spinning={spinning} />
            </div>
            <Referee />
          </div>

          <Captain color={TEAM_2_COLOR} name={team2Name} isWinner={!winnerIsTeam1} />
        </div>

        {/* Result banner */}
        <div
          className="w-full rounded-xl px-4 py-3 text-center"
          style={{ backgroundColor: `${winnerColor}18`, border: `1px solid ${winnerColor}44` }}
        >
          <p className="font-sans text-xs text-muted-foreground">Toss won by</p>
          <p className="font-sans text-xl font-bold" style={{ color: winnerColor }}>
            {winnerName}
          </p>
          <p className="font-sans text-sm text-muted-foreground">
            elected to <span className="font-semibold text-foreground">{state.toss.choice}</span>
          </p>
        </div>

        {/* Batting / Bowling */}
        <div className="flex w-full gap-3">
          <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-secondary/50 px-3 py-2">
            <span className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Batting</span>
            <span className="font-sans text-sm font-semibold text-foreground truncate max-w-full">{battingTeamName}</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-secondary/50 px-3 py-2">
            <span className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Bowling</span>
            <span className="font-sans text-sm font-semibold text-foreground truncate max-w-full">{bowlingTeamName}</span>
          </div>
        </div>

        {/* Mascot + starting prompt */}
        <div className="flex items-center gap-3">
          <CricketMascot />
          <p
            className="font-mono text-xs text-green-400"
            style={{ animation: "blink 1.2s step-start infinite" }}
          >
            Starting match...
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes toss-in {
          0%   { opacity: 0; transform: scale(0.75) translateY(24px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes ball-spin {
          0%   { transform: rotate(0deg)   scale(1);    }
          50%  { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(1);    }
        }
        @keyframes ball-settle {
          0%   { transform: scale(1.15); }
          60%  { transform: scale(0.92); }
          100% { transform: scale(1);    }
        }
        @keyframes mascot-bounce {
          0%, 100% { transform: translateY(0);    }
          50%       { transform: translateY(-5px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
