"use client"

import { useEffect, useRef } from "react"
import type { GameState } from "@/lib/cricket-game/types"
import { playSound, speakCommentary, stopAllSounds, unlockAudio } from "@/lib/cricket-game/sound-engine"

/**
 * Watches game state and triggers sounds + spoken commentary
 * whenever a new ball event is added.
 */
export function useGameSounds(state: GameState, enabled: boolean = true) {
  const prevEventCountRef = useRef(0)
  const prevPhaseRef = useRef(state.phase)
  const diceWasRollingRef = useRef(false)

  // Track total ball events across both teams
  const totalEvents = state.team1.ballEvents.length + state.team2.ballEvents.length

  // Play dice roll sound when dice starts rolling
  useEffect(() => {
    if (!enabled) return
    if (state.dice.isRolling && !diceWasRollingRef.current) {
      unlockAudio() // Ensure audio is unlocked on iOS
      playSound("dice-roll")
    }
    diceWasRollingRef.current = state.dice.isRolling
  }, [state.dice.isRolling, enabled])

  // Play SFX + commentary when a new ball event is added
  useEffect(() => {
    if (!enabled) return
    if (totalEvents <= prevEventCountRef.current) {
      prevEventCountRef.current = totalEvents
      return
    }
    prevEventCountRef.current = totalEvents

    // Get the latest ball event from the batting team
    const battingTeam = state[state.battingTeamKey]
    const latestEvent = battingTeam.ballEvents[battingTeam.ballEvents.length - 1]
    if (!latestEvent) return

    // Ensure audio is unlocked on iOS before playing
    unlockAudio()
    
    // Play the matching sound effect
    playSound(latestEvent.squareType)

    // Speak the commentary with a short delay so SFX plays first
    setTimeout(() => {
      speakCommentary(latestEvent.commentary)
    }, 300)
  }, [totalEvents, enabled, state])

  // Stop speech on phase change (innings break, result, restart)
  useEffect(() => {
    if (state.phase !== prevPhaseRef.current) {
      if (state.phase === "innings-break" || state.phase === "result" || state.phase === "setup") {
        stopAllSounds()
      }
      prevPhaseRef.current = state.phase
    }
  }, [state.phase])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSounds()
    }
  }, [])
}
