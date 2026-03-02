export type SquareType =
  | "single"
  | "double"
  | "triple"
  | "boundary"
  | "six"
  | "wide"
  | "no-ball"
  | "wicket"

export interface Square {
  id: number
  type: SquareType
  label: string
  runs: number
  isExtra: boolean
}

export interface Player {
  id: number
  name: string
  runs: number
  ballsFaced: number
  isOut: boolean
  howOut: string
}

export interface BallEvent {
  over: number
  ball: number
  batsmanId: number
  batsmanName: string
  squareType: SquareType
  runs: number
  isExtra: boolean
  isWicket: boolean
  commentary: string
}

export interface TeamState {
  name: string
  color: "team1" | "team2"
  players: Player[]
  totalRuns: number
  wickets: number
  overs: number
  balls: number
  currentBatsmanIndex: number
  extras: {
    wides: number
    noBalls: number
  }
  ballEvents: BallEvent[]
}

export type GamePhase = "setup" | "toss" | "batting" | "innings-break" | "result"
export type GameMode = "local" | "cpu"

export interface DiceState {
  value: number
  isRolling: boolean
}

export interface TokenAnimation {
  fromSquare: number
  toSquare: number
  progress: number
  isAnimating: boolean
}

export type OversOption = 2 | 5 | 10 | 20 | "test"

export interface MatchConfig {
  overs: OversOption
  mode: GameMode
  team1Name: string
  team2Name: string
  playersPerTeam: number
  team1PlayerNames: string[]
  team2PlayerNames: string[]
}

export interface TossState {
  winner: "team1" | "team2"
  choice: "bat" | "bowl"
  isAnimating: boolean
}

export interface GameState {
  phase: GamePhase
  config: MatchConfig
  team1: TeamState
  team2: TeamState
  currentInnings: 1 | 2
  battingTeamKey: "team1" | "team2"
  bowlingTeamKey: "team1" | "team2"
  firstBattingTeamKey: "team1" | "team2"
  tokenPosition: number
  dice: DiceState
  tokenAnimation: TokenAnimation
  toss: TossState | null
  target: number | null
  result: string | null
  lastSquareLanded: Square | null
  flashEffect: "wicket" | "boundary" | "six" | null
}

export type GameAction =
  | { type: "START_MATCH"; config: MatchConfig }
  | { type: "SET_TOSS"; toss: TossState }
  | { type: "COMPLETE_TOSS" }
  | { type: "ROLL_DICE" }
  | { type: "DICE_LANDED"; value: number }
  | { type: "MOVE_TOKEN"; targetSquare: number }
  | { type: "APPLY_SQUARE_EFFECT" }
  | { type: "CLEAR_FLASH" }
  | { type: "END_INNINGS" }
  | { type: "START_NEXT_INNINGS" }
  | { type: "RESTART" }
