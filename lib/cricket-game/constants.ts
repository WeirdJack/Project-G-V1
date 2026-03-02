import type { Square, SquareType } from "./types"

// Board layout: 24 squares distributed around the circular track
// Carefully balanced so hazards and bonuses are spread evenly
const SQUARE_DEFS: { type: SquareType; label: string; runs: number; isExtra: boolean }[] = [
  { type: "single",   label: "1",       runs: 1, isExtra: false },
  { type: "boundary", label: "FOUR",    runs: 4, isExtra: false },
  { type: "double",   label: "2",       runs: 2, isExtra: false },
  { type: "wicket",   label: "OUT",     runs: 0, isExtra: false },
  { type: "single",   label: "1",       runs: 1, isExtra: false },
  { type: "six",      label: "SIX",     runs: 6, isExtra: false },
  { type: "triple",   label: "3",       runs: 3, isExtra: false },
  { type: "wide",     label: "WIDE",    runs: 1, isExtra: true  },
  { type: "double",   label: "2",       runs: 2, isExtra: false },
  { type: "single",   label: "1",       runs: 1, isExtra: false },
  { type: "boundary", label: "FOUR",    runs: 4, isExtra: false },
  { type: "wicket",   label: "OUT",     runs: 0, isExtra: false },
  { type: "triple",   label: "3",       runs: 3, isExtra: false },
  { type: "no-ball",  label: "NO BALL", runs: 1, isExtra: true  },
  { type: "single",   label: "1",       runs: 1, isExtra: false },
  { type: "double",   label: "2",       runs: 2, isExtra: false },
  { type: "six",      label: "SIX",     runs: 6, isExtra: false },
  { type: "wicket",   label: "OUT",     runs: 0, isExtra: false },
  { type: "single",   label: "1",       runs: 1, isExtra: false },
  { type: "wide",     label: "WIDE",    runs: 1, isExtra: true  },
  { type: "triple",   label: "3",       runs: 3, isExtra: false },
  { type: "boundary", label: "FOUR",    runs: 4, isExtra: false },
  { type: "double",   label: "2",       runs: 2, isExtra: false },
  { type: "no-ball",  label: "NO BALL", runs: 1, isExtra: true  },
]

export const BOARD_SQUARES: Square[] = SQUARE_DEFS.map((def, i) => ({
  id: i,
  ...def,
}))

export const TOTAL_SQUARES = 24
export const OVERS_OPTIONS = [2, 5, 10, 20, "test"] as const
export const PLAYERS_PER_TEAM_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const
export const BALLS_PER_OVER = 6
export const DEFAULT_PLAYERS_PER_TEAM = 11

export const SQUARE_COLORS: Record<SquareType, { bg: string; text: string; glow: string }> = {
  single:   { bg: "#2a5a5a", text: "#8ffff0", glow: "#2a5a5a88" },
  double:   { bg: "#2a6a5a", text: "#8ffff0", glow: "#2a6a5a88" },
  triple:   { bg: "#2a7a5a", text: "#8ffff0", glow: "#2a7a5a88" },
  boundary: { bg: "#8a6a10", text: "#ffe066", glow: "#8a6a1088" },
  six:      { bg: "#aa7a00", text: "#ffdd33", glow: "#aa7a0088" },
  wide:     { bg: "#5a3a7a", text: "#cc99ff", glow: "#5a3a7a88" },
  "no-ball":{ bg: "#4a2a6a", text: "#bb88ee", glow: "#4a2a6a88" },
  wicket:   { bg: "#7a2a2a", text: "#ff6666", glow: "#7a2a2a88" },
}

export const TEAM_1_COLOR = "#4ade80"
export const TEAM_2_COLOR = "#22d3ee"

export const DEFAULT_TEAM_NAMES = {
  team1: "Thunder XI",
  team2: "Storm XI",
}

export const PLAYER_NAMES_POOL_TEAM1 = [
  "Sharma", "Kohli", "Gill", "Pant", "Jadeja",
  "Rahul", "Iyer", "Pandya", "Bumrah", "Siraj",
  "Ashwin",
]

export const PLAYER_NAMES_POOL_TEAM2 = [
  "Warner", "Smith", "Labuschagne", "Head",
  "Carey", "Green", "Cummins", "Starc", "Hazlewood",
  "Lyon", "Williamson",
]

export function generateDefaultPlayerNames(teamIndex: 0 | 1, count: number): string[] {
  const pool = teamIndex === 0 ? PLAYER_NAMES_POOL_TEAM1 : PLAYER_NAMES_POOL_TEAM2
  const names: string[] = []
  for (let i = 0; i < count; i++) {
    names.push(pool[i % pool.length] ?? `Player ${i + 1}`)
  }
  return names
}
