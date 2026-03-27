"use client"

import { useReducer, useCallback, useEffect, useRef } from "react"
import type { GameState, GameAction, MatchConfig } from "@/lib/cricket-game/types"
import {
  createInitialState,
  rollDice,
  getTargetSquare,
  applySquareEffect,
  checkInningsEnd,
  switchInnings,
  determineResult,
  performToss,
  applyToss,
  isCpuBatting,
} from "@/lib/cricket-game/game-engine"

const INITIAL_STATE: GameState = {
  phase: "setup",
  config: { overs: 5, mode: "local", team1Name: "", team2Name: "", playersPerTeam: 11, team1PlayerNames: [], team2PlayerNames: [], team1PlayerRoles: [], team2PlayerRoles: [] },
  team1: {
    name: "",
    color: "team1",
    players: [],
    totalRuns: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    currentBatsmanIndex: 0,
    nonStrikerIndex: 0,
    currentBowlerIndex: 0,
    extras: { wides: 0, noBalls: 0 },
    ballEvents: [],
  },
  team2: {
    name: "",
    color: "team2",
    players: [],
    totalRuns: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    currentBatsmanIndex: 0,
    nonStrikerIndex: 0,
    currentBowlerIndex: 0,
    extras: { wides: 0, noBalls: 0 },
    ballEvents: [],
  },
  currentInnings: 1,
  battingTeamKey: "team1",
  bowlingTeamKey: "team2",
  firstBattingTeamKey: "team1",
  tokenPosition: 0,
  dice: { value: 0, isRolling: false },
  tokenAnimation: { fromSquare: 0, toSquare: 0, progress: 1, isAnimating: false },
  toss: null,
  target: null,
  result: null,
  lastSquareLanded: null,
  flashEffect: null,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_MATCH": {
      const newState = createInitialState(action.config)
      return newState
    }

    case "SET_TOSS": {
      // Store toss winner but do NOT apply batting/bowling keys yet —
      // wait for winner to elect bat or field (ELECT_CHOICE)
      return { ...state, toss: { ...action.toss, isAnimating: true } }
    }

    case "ELECT_CHOICE": {
      if (!state.toss) return state
      const updatedToss = { ...state.toss, choice: action.choice }
      const withToss = applyToss(state, updatedToss)
      return { ...withToss, toss: updatedToss }
    }

    case "COMPLETE_TOSS": {
      return {
        ...state,
        phase: "batting",
        toss: state.toss ? { ...state.toss, isAnimating: false } : null,
      }
    }

    case "ROLL_DICE": {
      if (state.dice.isRolling || state.tokenAnimation.isAnimating) return state
      return {
        ...state,
        dice: { ...state.dice, isRolling: true },
      }
    }

    case "DICE_LANDED": {
      const targetSquare = getTargetSquare(state.tokenPosition, action.value)
      return {
        ...state,
        dice: { value: action.value, isRolling: false },
        tokenAnimation: {
          fromSquare: state.tokenPosition,
          toSquare: targetSquare,
          progress: 0,
          isAnimating: true,
        },
      }
    }

    case "MOVE_TOKEN": {
      return {
        ...state,
        tokenPosition: action.targetSquare,
        tokenAnimation: {
          ...state.tokenAnimation,
          progress: 1,
          isAnimating: false,
        },
      }
    }

    case "APPLY_SQUARE_EFFECT": {
      const newState = applySquareEffect(state)
      const inningsEnd = checkInningsEnd(newState)

      if (inningsEnd) {
        if (newState.currentInnings === 1) {
          return switchInnings(newState)
        } else {
          const result = determineResult(newState)
          return { ...newState, phase: "result", result }
        }
      }

      return newState
    }

    case "CLEAR_FLASH": {
      return { ...state, flashEffect: null, lastSquareLanded: null }
    }

    case "START_NEXT_INNINGS": {
      return { ...state, phase: "batting" }
    }

    case "RESTART": {
      return INITIAL_STATE
    }

    case "RESTART_SAME_CONFIG": {
      // Re-run setup with same config — goes back to toss phase
      const newState = createInitialState(state.config)
      return newState
    }

    default:
      return state
  }
}

export function useCricketGame() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)
  const animationRef = useRef<number | null>(null)
  const cpuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startMatch = useCallback((config: MatchConfig) => {
    dispatch({ type: "START_MATCH", config })
    // Toss is now triggered by user call via callToss()
  }, [])

  const callToss = useCallback((_call: "heads" | "tails") => {
    setTimeout(() => {
      const toss = performToss()
      dispatch({ type: "SET_TOSS", toss })
      // COMPLETE_TOSS now triggered after winner elects bat/field
    }, 400)
  }, [])

  const electChoice = useCallback((choice: "bat" | "bowl") => {
    dispatch({ type: "ELECT_CHOICE", choice })
    setTimeout(() => {
      dispatch({ type: "COMPLETE_TOSS" })
    }, 2200)
  }, [])

  const handleRollDice = useCallback(() => {
    if (state.dice.isRolling || state.tokenAnimation.isAnimating || state.phase !== "batting") return
    dispatch({ type: "ROLL_DICE" })

    // Simulate dice roll animation then land
    const value = rollDice()
    setTimeout(() => {
      dispatch({ type: "DICE_LANDED", value })
    }, 800)
  }, [state.dice.isRolling, state.tokenAnimation.isAnimating, state.phase])

  // Token animation effect
  useEffect(() => {
    if (!state.tokenAnimation.isAnimating) return

    const startTime = performance.now()
    const duration = 600 // ms

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      if (progress >= 1) {
        dispatch({ type: "MOVE_TOKEN", targetSquare: state.tokenAnimation.toSquare })
        // Apply square effect after token lands
        setTimeout(() => {
          dispatch({ type: "APPLY_SQUARE_EFFECT" })
          // Clear flash after a delay
          setTimeout(() => {
            dispatch({ type: "CLEAR_FLASH" })
          }, 1200)
        }, 200)
        return
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [state.tokenAnimation.isAnimating, state.tokenAnimation.toSquare])

  // CPU auto-play
  useEffect(() => {
    if (state.phase !== "batting") return
    if (!isCpuBatting(state)) return
    if (state.dice.isRolling || state.tokenAnimation.isAnimating) return
    if (state.flashEffect) return

    cpuTimeoutRef.current = setTimeout(() => {
      handleRollDice()
    }, 1200)

    return () => {
      if (cpuTimeoutRef.current) clearTimeout(cpuTimeoutRef.current)
    }
  }, [state, handleRollDice])

  const startNextInnings = useCallback(() => {
    dispatch({ type: "START_NEXT_INNINGS" })
  }, [])

  const restart = useCallback(() => {
    dispatch({ type: "RESTART" })
  }, [])

  const restartSameConfig = useCallback(() => {
    dispatch({ type: "RESTART_SAME_CONFIG" })
  }, [])

  return {
    state,
    startMatch,
    callToss,
    electChoice,
    rollDice: handleRollDice,
    startNextInnings,
    restart,
    restartSameConfig,
  }
}
