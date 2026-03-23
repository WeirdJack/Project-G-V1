"use client"

import type { GameState } from "@/lib/cricket-game/types"

interface CommentaryFeedProps {
  state: GameState
}

export function CommentaryFeed({ state }: CommentaryFeedProps) {
  const batting = state[state.battingTeamKey]
  const recentEvents = batting.ballEvents.slice(-5).reverse()

  if (recentEvents.length === 0) {
    return (
      <div className="flex h-full max-h-[138px] w-full items-center justify-center rounded-xl border border-border/30 bg-card/60 p-2">
        <p className="font-sans text-[10px] text-muted-foreground">
          Waiting for first delivery...
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full max-h-[138px] w-full flex-col gap-1 overflow-hidden rounded-xl border border-border/30 bg-card/60 p-2">
      <h3 className="font-sans text-[8px] font-medium uppercase tracking-wider text-muted-foreground">
        Commentary
      </h3>
      {recentEvents.slice(0, 3).map((event, i) => (
        <div
          key={`${event.over}-${event.ball}-${i}`}
          className="flex items-start gap-1.5 py-0.5"
          style={{
            opacity: 1 - i * 0.15,
            animation: i === 0 ? "slide-in 0.3s ease-out" : "none",
          }}
        >
          <span
            className="inline-flex h-4 min-w-[16px] items-center justify-center rounded font-mono text-[9px] font-medium"
            style={{
              backgroundColor: event.isWicket
                ? "#7a2a2a"
                : event.isExtra
                  ? "#4a2a6a"
                  : event.runs >= 4
                    ? "#8a6a10"
                    : "#1a2a3a",
              color: event.isWicket
                ? "#ff6666"
                : event.isExtra
                  ? "#bb88ee"
                  : event.runs >= 4
                    ? "#ffe066"
                    : "#8ffff0",
            }}
          >
            {event.isWicket ? "W" : event.isExtra ? "+1" : event.runs}
          </span>
          <p className="font-sans text-[9px] leading-tight text-muted-foreground line-clamp-2">
            {event.commentary}
          </p>
        </div>
      ))}

      <style jsx>{`
        @keyframes slide-in {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
