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
      <div className="w-full rounded-xl border border-border/30 bg-card/60 p-3">
        <p className="font-sans text-xs text-muted-foreground">
          Waiting for first delivery...
        </p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-1 rounded-xl border border-border/30 bg-card/60 p-3">
      <h3 className="mb-1 font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Commentary
      </h3>
      {recentEvents.map((event, i) => (
        <div
          key={`${event.over}-${event.ball}-${i}`}
          className="flex items-start gap-2 py-1"
          style={{
            opacity: 1 - i * 0.15,
            animation: i === 0 ? "slide-in 0.3s ease-out" : "none",
          }}
        >
          <span
            className="mt-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded font-mono text-xs font-medium"
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
          <p className="font-sans text-xs leading-relaxed text-muted-foreground">
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
