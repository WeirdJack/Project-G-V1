"use client"

import { useEffect, useState } from "react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter")

  useEffect(() => {
    // Enter animation
    const holdTimer = setTimeout(() => setPhase("hold"), 100)
    // Start exit after 2.5s
    const exitTimer = setTimeout(() => setPhase("exit"), 2500)
    // Complete after exit animation finishes
    const doneTimer = setTimeout(() => onComplete(), 3200)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 0.7s ease-out",
      }}
    >
      {/* Radial glow behind logo */}
      <div
        className="absolute"
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.75 0.18 145 / 0.15) 0%, transparent 70%)",
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "scale(0.5)" : "scale(1)",
          transition: "opacity 1s ease-out, transform 1s ease-out",
        }}
      />

      {/* Cricket ball icon */}
      <div
        style={{
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "scale(0.3) rotate(-180deg)" : "scale(1) rotate(0deg)",
          transition: "opacity 0.6s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          {/* Ball */}
          <circle cx="40" cy="40" r="36" fill="#cc3333" />
          <circle cx="40" cy="40" r="36" fill="url(#ballGrad)" />
          {/* Seam */}
          <path
            d="M20,25 Q30,40 20,55"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M60,25 Q50,40 60,55"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Stitch marks */}
          {[28, 33, 38, 43, 48, 53].map((y) => (
            <g key={`l${y}`}>
              <line x1="17" y1={y - 1} x2="21" y2={y + 1} stroke="#fff" strokeWidth="1" strokeLinecap="round" />
            </g>
          ))}
          {[28, 33, 38, 43, 48, 53].map((y) => (
            <g key={`r${y}`}>
              <line x1="59" y1={y - 1} x2="63" y2={y + 1} stroke="#fff" strokeWidth="1" strokeLinecap="round" />
            </g>
          ))}
          {/* Shine */}
          <ellipse cx="30" cy="28" rx="8" ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(-20,30,28)" />
          <defs>
            <radialGradient id="ballGrad" cx="35%" cy="35%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Title */}
      <h1
        className="mt-6 font-sans text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
        style={{
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "translateY(20px)" : "translateY(0)",
          transition: "opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s",
        }}
      >
        Kriklu
      </h1>

      {/* Tagline */}
      <p
        className="mt-2 font-sans text-sm text-muted-foreground"
        style={{
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "translateY(12px)" : "translateY(0)",
          transition: "opacity 0.5s ease-out 0.6s, transform 0.5s ease-out 0.6s",
        }}
      >
        Cricket Reimagined: The Flat-Lay Edition
      </p>

      {/* Loading dots */}
      <div
        className="mt-8 flex gap-2"
        style={{
          opacity: phase === "enter" ? 0 : phase === "exit" ? 0 : 1,
          transition: "opacity 0.4s ease-out 0.8s",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: "oklch(0.75 0.18 145)",
              animation: `splash-dot 1s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes splash-dot {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
