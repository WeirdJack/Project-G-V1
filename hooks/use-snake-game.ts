"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export const GRID_SIZE = 20
export const CELL_SIZE = 24

export type Position = { x: number; y: number }
export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
export type GameState = "IDLE" | "PLAYING" | "PAUSED" | "GAME_OVER"

export interface GameLevel {
  name: string
  speed: number
  minScore: number
  color: string
}

export const LEVELS: GameLevel[] = [
  { name: "Beginner", speed: 150, minScore: 0, color: "text-primary" },
  { name: "Easy", speed: 130, minScore: 5, color: "text-primary" },
  { name: "Medium", speed: 110, minScore: 15, color: "text-accent" },
  { name: "Fast", speed: 90, minScore: 30, color: "text-accent" },
  { name: "Expert", speed: 70, minScore: 50, color: "text-destructive" },
  { name: "Insane", speed: 50, minScore: 80, color: "text-destructive" },
]

function getRandomPosition(snake: Position[]): Position {
  let pos: Position
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y))
  return pos
}

function getCurrentLevel(score: number): number {
  let level = 0
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].minScore) {
      level = i
      break
    }
  }
  return level
}

const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
]

export function useSnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>({ x: 15, y: 10 })
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [gameState, setGameState] = useState<GameState>("IDLE")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [level, setLevel] = useState(0)
  const [ateFood, setAteFood] = useState(false)

  const directionRef = useRef<Direction>("RIGHT")
  const snakeRef = useRef<Position[]>(INITIAL_SNAKE)
  const foodRef = useRef<Position>({ x: 15, y: 10 })
  const scoreRef = useRef(0)
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const directionQueueRef = useRef<Direction[]>([])

  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
      gameLoopRef.current = null
    }
  }, [])

  const gameOver = useCallback(() => {
    stopGameLoop()
    setGameState("GAME_OVER")
    setHighScore((prev) => Math.max(prev, scoreRef.current))
  }, [stopGameLoop])

  const moveSnake = useCallback(() => {
    // Process direction queue
    if (directionQueueRef.current.length > 0) {
      const nextDir = directionQueueRef.current.shift()!
      directionRef.current = nextDir
      setDirection(nextDir)
    }

    const currentSnake = snakeRef.current
    const head = currentSnake[0]
    const dir = directionRef.current

    let newHead: Position
    switch (dir) {
      case "UP":
        newHead = { x: head.x, y: head.y - 1 }
        break
      case "DOWN":
        newHead = { x: head.x, y: head.y + 1 }
        break
      case "LEFT":
        newHead = { x: head.x - 1, y: head.y }
        break
      case "RIGHT":
        newHead = { x: head.x + 1, y: head.y }
        break
    }

    // Wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      gameOver()
      return
    }

    // Self collision
    if (currentSnake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      gameOver()
      return
    }

    const currentFood = foodRef.current
    const ate = newHead.x === currentFood.x && newHead.y === currentFood.y

    let newSnake: Position[]
    if (ate) {
      newSnake = [newHead, ...currentSnake]
      const newScore = scoreRef.current + 1
      scoreRef.current = newScore
      setScore(newScore)
      setAteFood(true)
      setTimeout(() => setAteFood(false), 200)

      const newLevel = getCurrentLevel(newScore)
      setLevel(newLevel)

      const newFood = getRandomPosition(newSnake)
      foodRef.current = newFood
      setFood(newFood)

      // Update speed based on new level
      if (newLevel !== getCurrentLevel(newScore - 1)) {
        stopGameLoop()
        gameLoopRef.current = setInterval(moveSnake, LEVELS[newLevel].speed)
      }
    } else {
      newSnake = [newHead, ...currentSnake.slice(0, -1)]
    }

    snakeRef.current = newSnake
    setSnake(newSnake)
  }, [gameOver, stopGameLoop])

  const startGame = useCallback(() => {
    const initialSnake = [...INITIAL_SNAKE]
    const initialFood = getRandomPosition(initialSnake)

    snakeRef.current = initialSnake
    foodRef.current = initialFood
    directionRef.current = "RIGHT"
    scoreRef.current = 0
    directionQueueRef.current = []

    setSnake(initialSnake)
    setFood(initialFood)
    setDirection("RIGHT")
    setScore(0)
    setLevel(0)
    setAteFood(false)
    setGameState("PLAYING")

    stopGameLoop()
    gameLoopRef.current = setInterval(moveSnake, LEVELS[0].speed)
  }, [moveSnake, stopGameLoop])

  const togglePause = useCallback(() => {
    if (gameState === "PLAYING") {
      stopGameLoop()
      setGameState("PAUSED")
    } else if (gameState === "PAUSED") {
      setGameState("PLAYING")
      gameLoopRef.current = setInterval(
        moveSnake,
        LEVELS[getCurrentLevel(scoreRef.current)].speed
      )
    }
  }, [gameState, moveSnake, stopGameLoop])

  const changeDirection = useCallback(
    (newDir: Direction) => {
      if (gameState !== "PLAYING") return

      const currentDir =
        directionQueueRef.current.length > 0
          ? directionQueueRef.current[directionQueueRef.current.length - 1]
          : directionRef.current

      const opposites: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      }

      if (newDir === currentDir || newDir === opposites[currentDir]) return
      if (directionQueueRef.current.length < 2) {
        directionQueueRef.current.push(newDir)
      }
    },
    [gameState]
  )

  useEffect(() => {
    return () => stopGameLoop()
  }, [stopGameLoop])

  return {
    snake,
    food,
    direction,
    gameState,
    score,
    highScore,
    level,
    ateFood,
    startGame,
    togglePause,
    changeDirection,
  }
}
