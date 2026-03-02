"use client"

import { Button } from "@/components/ui/button"
import type { GameState } from "@/lib/cricket-game/types"
import { TEAM_1_COLOR, TEAM_2_COLOR } from "@/lib/cricket-game/constants"
import { getOverString } from "@/lib/cricket-game/game-engine"

interface InningsSummaryProps {
  state: GameState
  onContinue: () => void
}

export function InningsSummary({ state, onContinue }: InningsSummaryProps) {
  const firstBattingTeam = state[state.firstBattingTeamKey]
  const firstBattingColor = state.firstBattingTeamKey === "team1" ? TEAM_1_COLOR : TEAM_2_COLOR
  const target = (state.target ?? 0) + 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm">
      <div
        className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-border/50 bg-card/95 p-6 shadow-2xl"
        style={{
          animation: "summary-in 0.5s ease-out",
          boxShadow: `0 0 40px ${firstBattingColor}15`,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
            End of 1st Innings
          </p>
          <h2
            className="font-sans text-2xl font-bold"
            style={{ color: firstBattingColor }}
          >
            {firstBattingTeam.name}
          </h2>
          <p className="font-mono text-4xl font-bold text-foreground">
            {firstBattingTeam.totalRuns}/{firstBattingTeam.wickets}
          </p>
          <p className="font-mono text-sm text-muted-foreground">
            ({getOverString(firstBattingTeam.overs, firstBattingTeam.balls)} overs)
          </p>
        </div>

        {/* Scorecard table */}
        <div className="max-h-60 overflow-y-auto rounded-lg bg-secondary/30 p-3">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="pb-2 text-left font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Batsman
                </th>
                <th className="pb-2 text-right font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  R
                </th>
                <th className="pb-2 text-right font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  B
                </th>
                <th className="pb-2 text-right font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {firstBattingTeam.players
                .filter((p) => p.ballsFaced > 0 || p.isOut)
                .map((player) => (
                  <tr key={player.id} className="border-b border-border/10">
                    <td className="py-1.5 font-sans text-xs text-foreground">
                      {player.name}
                    </td>
                    <td className="py-1.5 text-right font-mono text-xs font-medium text-foreground">
                      {player.runs}
                    </td>
                    <td className="py-1.5 text-right font-mono text-xs text-muted-foreground">
                      {player.ballsFaced}
                    </td>
                    <td className="py-1.5 text-right font-sans text-xs">
                      {player.isOut ? (
                        <span className="text-destructive">{player.howOut}</span>
                      ) : (
                        <span className="text-primary">not out</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Extras */}
          <div className="mt-2 flex items-center justify-between border-t border-border/30 pt-2">
            <span className="font-sans text-xs text-muted-foreground">Extras</span>
            <span className="font-mono text-xs text-muted-foreground">
              {firstBattingTeam.extras.wides + firstBattingTeam.extras.noBalls}
              {" "}
              <span className="text-[10px]">
                (Wd {firstBattingTeam.extras.wides}, NB {firstBattingTeam.extras.noBalls})
              </span>
            </span>
          </div>
        </div>

        {/* Target */}
        <div className="flex flex-col items-center gap-2 rounded-lg bg-primary/10 p-3">
          <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
            Target
          </p>
          <p className="font-mono text-3xl font-bold text-primary">{target}</p>
          <p className="font-sans text-xs text-muted-foreground">
            {state[state.battingTeamKey].name} needs {target} runs to win
          </p>
        </div>

        <Button
          size="lg"
          onClick={onContinue}
          className="w-full bg-primary font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
        >
          Start 2nd Innings
        </Button>
      </div>

      <style jsx>{`
        @keyframes summary-in {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
