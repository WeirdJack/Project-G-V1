import type {
  GameState,
  Player,
  BallEvent,
  Square,
  TossState,
  MatchConfig,
  TeamState,
  PlayerRole,
} from "./types"
import {
  BOARD_SQUARES,
  TOTAL_SQUARES,
  BALLS_PER_OVER,
  generateDefaultPlayerNames,
} from "./constants"

function createTeam(
  name: string,
  color: "team1" | "team2",
  teamIndex: 0 | 1,
  playerNames: string[],
  playersPerTeam: number,
  playerRoles: PlayerRole[]
): TeamState {
  const defaults = generateDefaultPlayerNames(teamIndex, playersPerTeam)
  const players: Player[] = Array.from({ length: playersPerTeam }, (_, i) => ({
    id: i,
    name: playerNames[i]?.trim() || defaults[i],
    role: (playerRoles[i] as PlayerRole | undefined) ?? "bat",
    runs: 0,
    ballsFaced: 0,
    isOut: false,
    howOut: "",
  }))

  return {
    name,
    color,
    players,
    totalRuns: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    currentBatsmanIndex: 0,
    nonStrikerIndex: playersPerTeam > 1 ? 1 : 0,
    currentBowlerIndex: 0,
    extras: { wides: 0, noBalls: 0 },
    ballEvents: [],
  }
}

export function createInitialState(config: MatchConfig): GameState {
  return {
    phase: "toss",
    config,
    team1: createTeam(config.team1Name, "team1", 0, config.team1PlayerNames, config.playersPerTeam, config.team1PlayerRoles ?? []),
    team2: createTeam(config.team2Name, "team2", 1, config.team2PlayerNames, config.playersPerTeam, config.team2PlayerRoles ?? []),
    currentInnings: 1,
    battingTeamKey: "team1",
    bowlingTeamKey: "team2",
    firstBattingTeamKey: "team1",
    tokenPosition: 0,
    dice: { value: 0, isRolling: false },
    tokenAnimation: {
      fromSquare: 0,
      toSquare: 0,
      progress: 1,
      isAnimating: false,
    },
    toss: null,
    target: null,
    result: null,
    lastSquareLanded: null,
    flashEffect: null,
  }
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function getTargetSquare(currentPos: number, diceValue: number): number {
  return (currentPos + diceValue) % TOTAL_SQUARES
}

export function getSquareAt(position: number): Square {
  return BOARD_SQUARES[position]
}

export function applySquareEffect(state: GameState): GameState {
  const battingTeam = { ...state[state.battingTeamKey] }
  const bowlingTeam = { ...state[state.bowlingTeamKey] }
  const square = getSquareAt(state.tokenPosition)

  const currentBatsman = { ...battingTeam.players[battingTeam.currentBatsmanIndex] }
  // Current bowler — a player from the bowling team
  const currentBowler = bowlingTeam.players[bowlingTeam.currentBowlerIndex]
  const bowlerName = currentBowler?.name ?? bowlingTeam.name
  let isLegalDelivery = true

  if (square.type === "wicket") {
    currentBatsman.isOut = true
    currentBatsman.howOut = "Caught"
    currentBatsman.ballsFaced += 1
    battingTeam.wickets += 1
    battingTeam.players = [...battingTeam.players]
    battingTeam.players[battingTeam.currentBatsmanIndex] = currentBatsman

    // Move to next batsman (max wickets = players - 1)
    const maxWickets = state.config.playersPerTeam - 1
    if (battingTeam.wickets < maxWickets) {
      // Find next available batsman who is not out and not the non-striker
      const nextBatsmanIndex = battingTeam.players.findIndex(
        (p, i) => !p.isOut && i !== battingTeam.nonStrikerIndex
      )
      if (nextBatsmanIndex !== -1) {
        battingTeam.currentBatsmanIndex = nextBatsmanIndex
      }
    }
  } else if (square.type === "wide") {
    battingTeam.totalRuns += 1
    battingTeam.extras = { ...battingTeam.extras, wides: battingTeam.extras.wides + 1 }
    isLegalDelivery = false
  } else if (square.type === "no-ball") {
    battingTeam.totalRuns += 1
    battingTeam.extras = { ...battingTeam.extras, noBalls: battingTeam.extras.noBalls + 1 }
    isLegalDelivery = false
  } else {
    // Normal run-scoring square
    battingTeam.totalRuns += square.runs
    currentBatsman.runs += square.runs
    currentBatsman.ballsFaced += 1
    battingTeam.players = [...battingTeam.players]
    battingTeam.players[battingTeam.currentBatsmanIndex] = currentBatsman

    // Swap batsmen on odd runs (1, 3)
    if (square.runs % 2 === 1) {
      const temp = battingTeam.currentBatsmanIndex
      battingTeam.currentBatsmanIndex = battingTeam.nonStrikerIndex
      battingTeam.nonStrikerIndex = temp
    }
  }

  // Update overs for legal deliveries
  if (isLegalDelivery) {
    battingTeam.balls += 1
    if (battingTeam.balls >= BALLS_PER_OVER) {
      battingTeam.balls = 0
      battingTeam.overs += 1
      // Swap batsmen at end of over
      const temp = battingTeam.currentBatsmanIndex
      battingTeam.currentBatsmanIndex = battingTeam.nonStrikerIndex
      battingTeam.nonStrikerIndex = temp
      // Rotate to next bowler (skip current bowler — same bowler can't bowl consecutive overs)
      const numPlayers = bowlingTeam.players.length
      let nextBowler = (bowlingTeam.currentBowlerIndex + 1) % numPlayers
      // Safety: don't exceed array bounds
      if (nextBowler >= numPlayers) nextBowler = 0
      bowlingTeam.currentBowlerIndex = nextBowler
    }
  }

  // Generate ball event
  const overNumber = battingTeam.overs
  const ballNumber = battingTeam.balls
  const event: BallEvent = {
    over: overNumber,
    ball: ballNumber,
    batsmanId: currentBatsman.id,
    batsmanName: currentBatsman.name,
    bowlerName,
    squareType: square.type,
    runs: square.type === "wicket" ? 0 : square.runs,
    isExtra: square.isExtra,
    isWicket: square.type === "wicket",
    commentary: generateCommentary(square, currentBatsman.name, state.dice.value),
  }
  battingTeam.ballEvents = [...battingTeam.ballEvents, event]

  // Determine flash effect
  let flashEffect: GameState["flashEffect"] = null
  if (square.type === "wicket") flashEffect = "wicket"
  else if (square.type === "boundary") flashEffect = "boundary"
  else if (square.type === "six") flashEffect = "six"

  return {
    ...state,
    [state.battingTeamKey]: battingTeam,
    [state.bowlingTeamKey]: bowlingTeam,
    lastSquareLanded: square,
    flashEffect,
  }
}

export function checkInningsEnd(state: GameState): boolean {
  const battingTeam = state[state.battingTeamKey]
  const maxWickets = state.config.playersPerTeam - 1

  // All out
  if (battingTeam.wickets >= maxWickets) return true

  // All overs bowled (test match has no overs limit -- end only on all out or target chased)
  if (state.config.overs !== "test" && battingTeam.overs >= state.config.overs) return true

  // 2nd innings: target chased
  if (state.currentInnings === 2 && state.target !== null) {
    if (battingTeam.totalRuns > state.target) return true
  }

  return false
}

export function switchInnings(state: GameState): GameState {
  const firstBattingTeam = state[state.firstBattingTeamKey]
  const target = firstBattingTeam.totalRuns

  const newBattingKey = state.bowlingTeamKey
  const newBowlingKey = state.battingTeamKey

  return {
    ...state,
    phase: "innings-break",
    currentInnings: 2,
    battingTeamKey: newBattingKey,
    bowlingTeamKey: newBowlingKey,
    target,
    tokenPosition: 0,
    dice: { value: 0, isRolling: false },
    tokenAnimation: { fromSquare: 0, toSquare: 0, progress: 1, isAnimating: false },
    lastSquareLanded: null,
    flashEffect: null,
  }
}

export function determineResult(state: GameState): string {
  const firstBatKey = state.firstBattingTeamKey
  const firstBat = state[firstBatKey]
  const secondBatKey = firstBatKey === "team1" ? "team2" : "team1"
  const secondBat = state[secondBatKey]
  const maxWickets = state.config.playersPerTeam - 1

  if (firstBat.totalRuns > secondBat.totalRuns) {
    const margin = firstBat.totalRuns - secondBat.totalRuns
    return `${firstBat.name} won by ${margin} run${margin !== 1 ? "s" : ""}!`
  } else if (secondBat.totalRuns > firstBat.totalRuns) {
    const wicketsLeft = maxWickets - secondBat.wickets
    return `${secondBat.name} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? "s" : ""}!`
  } else {
    return "Match Tied!"
  }
}

export function performToss(): TossState {
  const winner = Math.random() < 0.5 ? "team1" : "team2"
  const choice = Math.random() < 0.5 ? "bat" : "bowl"
  return { winner, choice, isAnimating: true }
}

export function applyToss(state: GameState, toss: TossState): GameState {
  let battingTeamKey: "team1" | "team2"
  let bowlingTeamKey: "team1" | "team2"

  if (toss.choice === "bat") {
    battingTeamKey = toss.winner
    bowlingTeamKey = toss.winner === "team1" ? "team2" : "team1"
  } else {
    bowlingTeamKey = toss.winner
    battingTeamKey = toss.winner === "team1" ? "team2" : "team1"
  }

  return {
    ...state,
    toss,
    battingTeamKey,
    bowlingTeamKey,
    firstBattingTeamKey: battingTeamKey,
  }
}

function generateCommentary(square: Square, batsmanName: string, _diceValue: number): string {
  switch (square.type) {
    case "single":
      return `${batsmanName} takes a quick single!`
    case "double":
      return `${batsmanName} pushes for 2 runs!`
    case "triple":
      return `Great running! ${batsmanName} picks up 3!`
    case "boundary":
      return `${batsmanName} smashes it to the BOUNDARY! FOUR!`
    case "six":
      return `${batsmanName} launches it! That's a massive SIX!`
    case "wide":
      return `Wide ball! 1 extra run to the batting side.`
    case "no-ball":
      return `No ball! Free hit coming up, 1 run added.`
    case "wicket":
      return `OUT! ${batsmanName} has to walk back!`
    default:
      return `${batsmanName} plays the delivery.`
  }
}

export function getOverString(overs: number, balls: number): string {
  return `${overs}.${balls}`
}

export function isCpuBatting(state: GameState): boolean {
  if (state.config.mode !== "cpu") return false
  return state.battingTeamKey === "team2"
}
