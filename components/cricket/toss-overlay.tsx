"use client"

import { useEffect, useRef, useState } from "react"
import type { GameState } from "@/lib/cricket-game/types"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"
import { playSound } from "@/lib/cricket-game/sound-engine"

interface TossOverlayProps {
  state: GameState
  onCall?: (call: "heads" | "tails") => void
}

// ── Cartoonish coin ─────────────────────────────────────────────────────────

function CartoonCoin({ phase }: { phase: "idle" | "spinning" | "landed"; result?: "heads" | "tails" }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 80,
        height: 80,
        position: "relative",
        perspective: 600,
      }}
    >
      <div style={{
        width: "100%",
        height: "100%",
        position: "relative",
        transformStyle: "preserve-3d",
        animation: phase === "spinning"
          ? "coin-flip 0.35s linear infinite"
          : phase === "landed"
          ? "coin-land 0.5s ease-out both"
          : "coin-idle 2s ease-in-out infinite",
      }}>
        {/* Heads face */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
          <svg viewBox="0 0 80 80" width="80" height="80">
            {/* Coin body */}
            <circle cx="40" cy="40" r="38" fill="#f5c518" stroke="#b8860b" strokeWidth="3" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="#d4a017" strokeWidth="2" />
            {/* Face features */}
            <circle cx="40" cy="34" r="14" fill="#e8b010" stroke="#b8860b" strokeWidth="2" />
            {/* Eyes */}
            <ellipse cx="35" cy="31" rx="3" ry="3.5" fill="#1a1a00" />
            <ellipse cx="45" cy="31" rx="3" ry="3.5" fill="#1a1a00" />
            <circle cx="36" cy="29.5" r="1" fill="#fff" />
            <circle cx="46" cy="29.5" r="1" fill="#fff" />
            {/* Crown */}
            <path d="M28,26 L31,18 L35,22 L40,16 L45,22 L49,18 L52,26 Z" fill="#f5c518" stroke="#b8860b" strokeWidth="1.5" />
            {/* Smile */}
            <path d="M33,38 Q40,44 47,38" stroke="#7a4a00" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Cheeks */}
            <circle cx="32" cy="37" r="3" fill="#ffaa44" opacity="0.4" />
            <circle cx="48" cy="37" r="3" fill="#ffaa44" opacity="0.4" />
            {/* Shine */}
            <ellipse cx="30" cy="25" rx="6" ry="3" fill="#fff" opacity="0.2" transform="rotate(-30,30,25)" />
            {/* HEADS text */}
            <text x="40" y="60" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#7a4a00" letterSpacing="1">HEADS</text>
          </svg>
        </div>
        {/* Tails face */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <svg viewBox="0 0 80 80" width="80" height="80">
            <circle cx="40" cy="40" r="38" fill="#e8a800" stroke="#b8860b" strokeWidth="3" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="#d4a017" strokeWidth="2" />
            {/* Wicket design */}
            {[28, 40, 52].map((x) => (
              <g key={x}>
                <rect x={x - 2.5} y="22" width="5" height="24" rx="2.5" fill="#7a4a00" stroke="#5a3000" strokeWidth="1" />
                <rect x={x - 5} y="20" width="10" height="4" rx="2" fill="#7a4a00" stroke="#5a3000" strokeWidth="1" />
              </g>
            ))}
            <rect x="24" y="22" width="10" height="2" rx="1" fill="#ffdd44" />
            <rect x="46" y="22" width="10" height="2" rx="1" fill="#ffdd44" />
            <ellipse cx="30" cy="25" rx="5" ry="3" fill="#fff" opacity="0.15" transform="rotate(-30,30,25)" />
            <text x="40" y="60" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#5a3000" letterSpacing="1">TAILS</text>
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes coin-idle {
          0%, 100% { transform: rotateY(0deg) translateY(0); }
          50% { transform: rotateY(20deg) translateY(-4px); }
        }
        @keyframes coin-flip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes coin-land {
          0% { transform: rotateY(720deg) translateY(-20px); }
          70% { transform: rotateY(${Math.random() < 0.5 ? "0deg" : "180deg"}) translateY(4px); }
          85% { transform: rotateY(${Math.random() < 0.5 ? "0deg" : "180deg"}) translateY(-2px); }
          100% { transform: rotateY(0deg) translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ── Cartoonish captain ──────────────────────────────────────────────────────

function CartoonCaptain({ color, name, isWinner, side }: { color: string; name: string; isWinner: boolean; side: "left" | "right" }) {
  const flip = side === "right" ? "scale(-1,1)" : undefined
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 52 90" width="52" height="90" xmlns="http://www.w3.org/2000/svg" style={{ transform: flip }}>
        {/* Shadow */}
        <ellipse cx="26" cy="88" rx="13" ry="3" fill="#000" opacity="0.12" />
        {/* Legs */}
        <rect x="14" y="56" width="9" height="22" rx="4" fill="#1a2a3a" stroke="#0a1a2a" strokeWidth="2" />
        <rect x="29" y="56" width="9" height="22" rx="4" fill="#1a2a3a" stroke="#0a1a2a" strokeWidth="2" />
        {/* Shoes */}
        <ellipse cx="18.5" cy="79" rx="8" ry="3.5" fill="#111" />
        <ellipse cx="33.5" cy="79" rx="8" ry="3.5" fill="#111" />
        {/* Jersey */}
        <path d="M10,28 Q9,56 12,60 L40,60 Q43,56 42,28 Z" fill={color} stroke="#111" strokeWidth="2.5" />
        {/* Jersey stripes */}
        <line x1="10" y1="36" x2="42" y2="36" stroke="#fff" strokeWidth="1.5" opacity="0.2" />
        {/* Captain badge */}
        <circle cx="26" cy="44" r="7" fill={color} stroke="#fff" strokeWidth="1.5" />
        <text x="26" y="47.5" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#fff">C</text>
        {/* Left arm */}
        <line x1="10" y1="34" x2="2" y2="48" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <line x1="10" y1="34" x2="2" y2="48" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="2" cy="48" r="5" fill="#d4a96a" stroke="#0a0a0a" strokeWidth="1.5" />
        {/* Right arm — bat */}
        <line x1="42" y1="34" x2="50" y2="46" stroke={color} strokeWidth="8" strokeLinecap="round" />
        <line x1="42" y1="34" x2="50" y2="46" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="46" r="5" fill="#d4a96a" stroke="#0a0a0a" strokeWidth="1.5" />
        {/* Bat in hand */}
        <rect x="46" y="38" width="5" height="20" rx="2" fill="#c8a060" stroke="#7a5a20" strokeWidth="1.5" transform="rotate(15,48,48)" />
        <rect x="45.5" y="55" width="6" height="5" rx="1" fill="#b89050" stroke="#7a5a20" strokeWidth="1" transform="rotate(15,48,58)" />
        {/* Neck */}
        <rect x="21" y="22" width="10" height="8" rx="4" fill="#d4a96a" stroke="#0a0a0a" strokeWidth="1.5" />
        {/* Head — big cartoon */}
        <circle cx="26" cy="14" r="14" fill="#d4a96a" stroke="#0a0a0a" strokeWidth="2.5" />
        {/* Ears */}
        <ellipse cx="12" cy="14" rx="4" ry="5" fill="#c4996a" stroke="#0a0a0a" strokeWidth="1.5" />
        <ellipse cx="40" cy="14" rx="4" ry="5" fill="#c4996a" stroke="#0a0a0a" strokeWidth="1.5" />
        {/* Eyes — big cartoon */}
        <circle cx="21" cy="12" r="4" fill="#fff" stroke="#0a0a0a" strokeWidth="1.5" />
        <circle cx="31" cy="12" r="4" fill="#fff" stroke="#0a0a0a" strokeWidth="1.5" />
        <circle cx="22" cy="12" r="2" fill="#222" />
        <circle cx="32" cy="12" r="2" fill="#222" />
        <circle cx="22.8" cy="11" r="0.8" fill="#fff" />
        <circle cx="32.8" cy="11" r="0.8" fill="#fff" />
        {/* Expression */}
        {isWinner
          ? <path d="M19,19 Q26,25 33,19" stroke="#7a3a00" strokeWidth="2" fill="none" strokeLinecap="round" />
          : <path d="M19,20 Q26,18 33,20" stroke="#7a3a00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        }
        {/* Blush if winner */}
        {isWinner && <>
          <circle cx="17" cy="17" r="4" fill="#ff8866" opacity="0.35" />
          <circle cx="35" cy="17" r="4" fill="#ff8866" opacity="0.35" />
        </>}
        {/* Helmet */}
        <path d="M12,10 Q12,0 26,0 Q40,0 40,10" fill={color} stroke="#0a0a0a" strokeWidth="2.5" />
        <rect x="11" y="8" width="4" height="10" rx="2" fill={color} stroke="#0a0a0a" strokeWidth="1.5" />
        {/* Helmet grill */}
        <line x1="11" y1="12" x2="15" y2="12" stroke="#888" strokeWidth="1" />
        <line x1="11" y1="15" x2="15" y2="15" stroke="#888" strokeWidth="1" />
        {/* Winner star above head */}
        {isWinner && (
          <polygon points="26,-2 27.5,2 32,2 28.5,4.5 30,9 26,6.5 22,9 23.5,4.5 20,2 24.5,2"
            fill="#ffd700" stroke="#b8860b" strokeWidth="0.8"
            style={{ animation: "star-pulse 0.8s ease-in-out infinite" }}
          />
        )}
      </svg>
      <span className="max-w-[72px] truncate text-center font-sans text-xs font-bold" style={{ color }}>{name}</span>
      <span className="font-sans text-[9px] uppercase tracking-wider text-muted-foreground">Captain</span>
      <style jsx>{`
        @keyframes star-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// ── Cartoonish referee ──────────────────────────────────────────────────────

function CartoonReferee() {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 46 88" width="46" height="88" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="23" cy="86" rx="11" ry="3" fill="#000" opacity="0.1" />
        {/* Legs */}
        <rect x="12" y="54" width="8" height="22" rx="4" fill="#1a1a3a" stroke="#0a0a2a" strokeWidth="1.5" />
        <rect x="26" y="54" width="8" height="22" rx="4" fill="#1a1a3a" stroke="#0a0a2a" strokeWidth="1.5" />
        <ellipse cx="16" cy="77" rx="7" ry="3" fill="#0a0a0a" />
        <ellipse cx="30" cy="77" rx="7" ry="3" fill="#0a0a0a" />
        {/* White coat */}
        <path d="M8,28 Q7,54 10,58 L36,58 Q39,54 38,28 Z" fill="#f0ece0" stroke="#ccc" strokeWidth="2" />
        {/* Coat lapels */}
        <path d="M23,28 L18,36 L23,38 Z" fill="#ddd" stroke="#bbb" strokeWidth="1" />
        {/* Clipboard in right hand */}
        <rect x="33" y="32" width="12" height="18" rx="2" fill="#d4b896" stroke="#888" strokeWidth="1.5" />
        <rect x="35" y="36" width="8" height="1.5" rx="0.5" fill="#666" />
        <rect x="35" y="39" width="8" height="1.5" rx="0.5" fill="#666" />
        <rect x="35" y="42" width="8" height="1.5" rx="0.5" fill="#666" />
        <rect x="36" y="30" width="7" height="4" rx="1.5" fill="#b8966a" stroke="#777" strokeWidth="1" />
        {/* Left arm raised */}
        <line x1="8" y1="34" x2="1" y2="26" stroke="#f0ece0" strokeWidth="7" strokeLinecap="round" />
        <line x1="8" y1="34" x2="1" y2="26" stroke="#ccc" strokeWidth="2" strokeLinecap="round" />
        <circle cx="1" cy="26" r="4" fill="#d4a96a" stroke="#aaa" strokeWidth="1.5" />
        {/* Right arm (holding clipboard) */}
        <line x1="38" y1="34" x2="39" y2="42" stroke="#f0ece0" strokeWidth="7" strokeLinecap="round" />
        {/* Neck */}
        <rect x="19" y="22" width="8" height="8" rx="3.5" fill="#d4a96a" stroke="#aaa" strokeWidth="1.5" />
        {/* Head */}
        <circle cx="23" cy="13" r="12" fill="#d4a96a" stroke="#aaa" strokeWidth="2" />
        <ellipse cx="11" cy="13" rx="3.5" ry="4.5" fill="#c4996a" stroke="#aaa" strokeWidth="1.5" />
        <ellipse cx="35" cy="13" rx="3.5" ry="4.5" fill="#c4996a" stroke="#aaa" strokeWidth="1.5" />
        {/* Glasses */}
        <rect x="14" y="9" width="7" height="5" rx="2.5" fill="none" stroke="#666" strokeWidth="1.5" />
        <rect x="25" y="9" width="7" height="5" rx="2.5" fill="none" stroke="#666" strokeWidth="1.5" />
        <line x1="21" y1="11.5" x2="25" y2="11.5" stroke="#666" strokeWidth="1.5" />
        {/* Eyes behind glasses */}
        <circle cx="17.5" cy="12" r="1.5" fill="#333" />
        <circle cx="28.5" cy="12" r="1.5" fill="#333" />
        {/* Mustache */}
        <path d="M17,18 Q20,21 23,18 Q26,21 29,18" stroke="#5a3a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* White hat */}
        <ellipse cx="23" cy="3" rx="15" ry="4" fill="#f0ece0" stroke="#ccc" strokeWidth="1.5" />
        <rect x="15" y="-5" width="16" height="9" rx="3" fill="#f0ece0" stroke="#ccc" strokeWidth="1.5" />
        <rect x="15" y="1" width="16" height="3" rx="0.5" fill="#c8b090" />
      </svg>
      <span className="font-sans text-[10px] font-medium text-muted-foreground">Referee</span>
    </div>
  )
}

// ── Mascot ──────────────────────────────────────────────────────────────────

function KrikMascot() {
  return (
    <div className="flex flex-col items-center" style={{ animation: "mascot-bounce 1s ease-in-out infinite" }}>
      <svg viewBox="0 0 60 60" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="36" rx="16" ry="12" fill="#5a9a2a" stroke="#2a5a10" strokeWidth="2" />
        <circle cx="30" cy="20" r="10" fill="#6ab030" stroke="#2a5a10" strokeWidth="2" />
        <circle cx="26" cy="18" r="3.5" fill="#fff" stroke="#2a5a10" strokeWidth="1" />
        <circle cx="34" cy="18" r="3.5" fill="#fff" stroke="#2a5a10" strokeWidth="1" />
        <circle cx="27" cy="18.5" r="1.8" fill="#111" />
        <circle cx="35" cy="18.5" r="1.8" fill="#111" />
        <circle cx="27.6" cy="17.8" r="0.6" fill="#fff" />
        <circle cx="35.6" cy="17.8" r="0.6" fill="#fff" />
        <line x1="26" y1="11" x2="18" y2="3" stroke="#2a5a10" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="18" cy="3" r="2.2" fill="#ffdd44" stroke="#b8860b" strokeWidth="1" />
        <line x1="34" y1="11" x2="42" y2="3" stroke="#2a5a10" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="42" cy="3" r="2.2" fill="#ffdd44" stroke="#b8860b" strokeWidth="1" />
        <path d="M24,24 Q30,29 36,24" stroke="#2a5a10" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="18" cy="18" r="3" fill="#ff8844" opacity="0.35" />
        <circle cx="42" cy="18" r="3" fill="#ff8844" opacity="0.35" />
        <rect x="42" y="28" width="4" height="18" rx="2" fill="#d4a96a" stroke="#8a6a30" strokeWidth="1" transform="rotate(15,44,37)" />
        <rect x="43" y="42" width="3" height="6" rx="1" fill="#b8966a" stroke="#8a6a30" strokeWidth="0.8" transform="rotate(15,44,37)" />
        <line x1="18" y1="44" x2="10" y2="55" stroke="#2a5a10" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="46" x2="14" y2="57" stroke="#2a5a10" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="44" x2="46" y2="55" stroke="#2a5a10" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="46" x2="42" y2="57" stroke="#2a5a10" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="28" cy="30" rx="8" ry="4" fill="#88cc44" opacity="0.35" transform="rotate(-10,28,30)" />
      </svg>
      <span className="font-mono text-[9px] font-bold" style={{ color: "#8fda6a" }}>Krik</span>
      <style jsx>{`
        @keyframes mascot-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export function TossOverlay({ state, onCall }: TossOverlayProps) {
  const soundPlayedRef = useRef(false)
  const [coinPhase, setCoinPhase] = useState<"idle" | "spinning" | "landed">("idle")
  const [userCall, setUserCall] = useState<"heads" | "tails" | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [blinkOn, setBlinkOn] = useState(true)

  // Determine if we need the user to call first (toss not yet decided)
  const needsCall = !state.toss

  // When toss result arrives, animate the coin
  useEffect(() => {
    if (!state.toss || soundPlayedRef.current) return
    soundPlayedRef.current = true
    setCoinPhase("spinning")
    playSound("coin-toss")
    setTimeout(() => {
      setCoinPhase("landed")
      setTimeout(() => setRevealed(true), 400)
    }, 1600)
  }, [state.toss])

  // Blink "starting" text
  useEffect(() => {
    if (!revealed) return
    const id = setInterval(() => setBlinkOn((v) => !v), 600)
    return () => clearInterval(id)
  }, [revealed])

  if (!state.toss && !needsCall) return null

  // ── Pre-toss: ask user to call ───────────────────────────────────────────
  if (!state.toss) {
    const team1Name = state.team1.name
    return (
      <div className="safe-top fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
        <div
          className="relative z-10 mx-4 flex w-full max-w-xs flex-col items-center gap-5 rounded-2xl border border-white/10 bg-card/95 px-6 py-7 shadow-2xl"
          style={{ animation: "toss-in 0.45s cubic-bezier(0.34,1.3,0.64,1)" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Coin Toss</p>
          <CartoonCoin phase="idle" />
          <div className="flex flex-col items-center gap-1">
            <p className="font-sans text-sm font-semibold text-foreground">{team1Name} calls...</p>
            <p className="font-sans text-xs text-muted-foreground">What&apos;s your call?</p>
          </div>
          <div className="flex w-full gap-3">
            {(["heads", "tails"] as const).map((side) => (
              <button
                key={side}
                onClick={() => { setUserCall(side); onCall?.(side) }}
                className="flex-1 rounded-xl border py-3 font-mono text-sm font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                style={{
                  borderColor: side === "heads" ? "#f5c518" : "#e8a800",
                  backgroundColor: side === "heads" ? "#f5c51812" : "#e8a80012",
                  color: side === "heads" ? "#f5c518" : "#e8a800",
                }}
              >
                {side}
              </button>
            ))}
          </div>
          <KrikMascot />
        </div>
        <style jsx>{`
          @keyframes toss-in {
            0% { opacity: 0; transform: scale(0.75) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    )
  }

  // ── Post-toss: show result ────────────────────────────────────────────────
  const team1Name = state.team1.name
  const team2Name = state.team2.name
  const winnerIsTeam1 = state.toss.winner === "team1"
  const winnerColor = winnerIsTeam1 ? TEAM_1_COLOR : TEAM_2_COLOR
  const winnerName = winnerIsTeam1 ? team1Name : team2Name
  const battingTeamName = state[state.battingTeamKey].name
  const bowlingTeamName = state[state.bowlingTeamKey].name
  const coinResult: "heads" | "tails" = state.toss.winner === "team1" ? "heads" : "tails"

  return (
    <div className="safe-top fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div
        className="relative z-10 mx-4 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-white/10 bg-card/95 px-5 py-5 shadow-2xl"
        style={{
          animation: "toss-in 0.45s cubic-bezier(0.34,1.3,0.64,1)",
          boxShadow: revealed ? `0 0 48px ${winnerColor}33, 0 0 0 1px ${winnerColor}22` : undefined,
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Coin Toss</p>

        {/* Characters */}
        <div className="flex w-full items-end justify-between px-1">
          <CartoonCaptain color={TEAM_1_COLOR} name={team1Name} isWinner={winnerIsTeam1 && revealed} side="left" />
          <div className="flex flex-col items-center gap-2">
            <CartoonCoin phase={coinPhase} result={coinResult} />
            <CartoonReferee />
          </div>
          <CartoonCaptain color={TEAM_2_COLOR} name={team2Name} isWinner={!winnerIsTeam1 && revealed} side="right" />
        </div>

        {/* Result */}
        {revealed && (
          <div
            className="w-full rounded-xl px-4 py-3 text-center"
            style={{ backgroundColor: `${winnerColor}18`, border: `1px solid ${winnerColor}44`, animation: "result-pop 0.4s cubic-bezier(0.34,1.4,0.64,1) both" }}
          >
            {userCall && (
              <p className="font-sans text-[10px] text-muted-foreground">
                {coinResult === userCall ? "Correct call!" : "Wrong call!"} — {coinResult.toUpperCase()}
              </p>
            )}
            <p className="font-sans text-xs text-muted-foreground">Toss won by</p>
            <p className="font-sans text-xl font-bold" style={{ color: winnerColor }}>{winnerName}</p>
            <p className="font-sans text-sm text-muted-foreground">
              elected to <span className="font-semibold text-foreground">{state.toss.choice}</span>
            </p>
          </div>
        )}

        {/* Batting / Bowling */}
        {revealed && (
          <div className="flex w-full gap-2">
            {[["Batting", battingTeamName], ["Bowling", bowlingTeamName]].map(([label, name]) => (
              <div key={label} className="flex flex-1 flex-col items-center gap-0.5 rounded-lg bg-secondary/50 px-2 py-2">
                <span className="font-sans text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
                <span className="max-w-full truncate font-sans text-xs font-semibold text-foreground">{name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Mascot + starting */}
        <div className="flex items-center gap-3">
          <KrikMascot />
          {revealed && (
            <p className="font-mono text-xs text-green-400" style={{ opacity: blinkOn ? 1 : 0 }}>
              Starting match...
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes toss-in {
          0% { opacity: 0; transform: scale(0.75) translateY(24px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes result-pop {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
