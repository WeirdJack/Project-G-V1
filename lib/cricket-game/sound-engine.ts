/**
 * Sound engine using Web Audio API for cricket SFX
 * and SpeechSynthesis API for spoken commentary.
 */

type SquareSound =
  | "single"
  | "double"
  | "triple"
  | "boundary"
  | "six"
  | "wide"
  | "no-ball"
  | "wicket"
  | "dice-roll"

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume()
  }
  return audioCtx
}

/* ─── Utility oscillator helper ─── */
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.15,
  delay = 0
) {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(gain, ctx.currentTime + delay)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(ctx.currentTime + delay)
  osc.stop(ctx.currentTime + delay + duration)
}

function playNoise(duration: number, gain = 0.08, delay = 0) {
  const ctx = getCtx()
  const bufferSize = ctx.sampleRate * duration
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, ctx.currentTime + delay)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
  const filter = ctx.createBiquadFilter()
  filter.type = "highpass"
  filter.frequency.value = 3000
  src.connect(filter)
  filter.connect(g)
  g.connect(ctx.destination)
  src.start(ctx.currentTime + delay)
}

/* ─── Sound effects per event type ─── */

function playSingle() {
  // Gentle "tock" - bat on ball
  playTone(800, 0.12, "triangle", 0.12)
  playTone(600, 0.08, "sine", 0.06, 0.05)
}

function playDouble() {
  // Two quick taps
  playTone(850, 0.1, "triangle", 0.13)
  playTone(900, 0.1, "triangle", 0.13, 0.12)
}

function playTriple() {
  // Three ascending taps
  playTone(800, 0.09, "triangle", 0.12)
  playTone(900, 0.09, "triangle", 0.12, 0.1)
  playTone(1000, 0.09, "triangle", 0.12, 0.2)
}

function playBoundary() {
  // Satisfying crack + rising fanfare
  playNoise(0.08, 0.15)
  playTone(523, 0.2, "square", 0.1, 0.05)
  playTone(659, 0.2, "square", 0.1, 0.15)
  playTone(784, 0.3, "square", 0.12, 0.25)
  // Crowd murmur
  playNoise(0.6, 0.04, 0.2)
}

function playSix() {
  // Big hit crack + epic ascending fanfare + crowd roar
  playNoise(0.1, 0.2)
  playTone(523, 0.15, "sawtooth", 0.08, 0.05)
  playTone(659, 0.15, "sawtooth", 0.08, 0.13)
  playTone(784, 0.15, "sawtooth", 0.08, 0.21)
  playTone(1047, 0.4, "sawtooth", 0.1, 0.29)
  // Crowd roar
  playNoise(0.8, 0.06, 0.25)
}

function playWide() {
  // Descending "boo" tone
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(500, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.3)
  g.gain.setValueAtTime(0.1, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.35)
}

function playNoBall() {
  // Short buzzer
  playTone(200, 0.15, "sawtooth", 0.1)
  playTone(180, 0.15, "sawtooth", 0.08, 0.08)
}

function playWicket() {
  // Dramatic stumps hit + descending doom
  playNoise(0.12, 0.2)
  playTone(600, 0.15, "square", 0.12, 0.05)
  playTone(400, 0.2, "square", 0.1, 0.15)
  playTone(250, 0.3, "square", 0.1, 0.3)
  playTone(150, 0.4, "sawtooth", 0.08, 0.5)
}

function playDiceRoll() {
  // Quick rattle
  for (let i = 0; i < 6; i++) {
    const freq = 2000 + Math.random() * 2000
    playTone(freq, 0.04, "triangle", 0.04, i * 0.05)
  }
}

/* ─── Public API ─── */

export function playSound(type: SquareSound) {
  try {
    switch (type) {
      case "single":
        playSingle()
        break
      case "double":
        playDouble()
        break
      case "triple":
        playTriple()
        break
      case "boundary":
        playBoundary()
        break
      case "six":
        playSix()
        break
      case "wide":
        playWide()
        break
      case "no-ball":
        playNoBall()
        break
      case "wicket":
        playWicket()
        break
      case "dice-roll":
        playDiceRoll()
        break
    }
  } catch {
    // Silently fail if audio is not available
  }
}

/* ─── Spoken Commentary ─── */

let isSpeaking = false
const speechQueue: string[] = []

function processQueue() {
  if (isSpeaking || speechQueue.length === 0) return
  if (typeof window === "undefined" || !window.speechSynthesis) return

  const text = speechQueue.shift()!
  isSpeaking = true

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.1
  utterance.pitch = 1.0
  utterance.volume = 0.8

  // Try to pick an English voice
  const voices = window.speechSynthesis.getVoices()
  const english = voices.find(
    (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("male")
  ) || voices.find((v) => v.lang.startsWith("en"))
  if (english) utterance.voice = english

  utterance.onend = () => {
    isSpeaking = false
    processQueue()
  }
  utterance.onerror = () => {
    isSpeaking = false
    processQueue()
  }

  window.speechSynthesis.speak(utterance)
}

export function speakCommentary(text: string) {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    // Cancel any pending speech if queue is long
    if (speechQueue.length > 2) {
      window.speechSynthesis.cancel()
      isSpeaking = false
      speechQueue.length = 0
    }
    speechQueue.push(text)
    processQueue()
  } catch {
    // Silently fail
  }
}

export function stopAllSounds() {
  try {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    isSpeaking = false
    speechQueue.length = 0
  } catch {
    // Silently fail
  }
}

/* ─── Background Music Loop ─── */

let bgGain: GainNode | null = null
let bgOscillators: OscillatorNode[] = []
let bgPlaying = false

// A mellow, ambient cricket-stadium vibe using layered oscillators
export function startBackgroundMusic() {
  if (bgPlaying) return
  try {
    const ctx = getCtx()
    bgGain = ctx.createGain()
    bgGain.gain.setValueAtTime(0, ctx.currentTime)
    bgGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5)
    bgGain.connect(ctx.destination)

    // Chord pad: C-E-G ambient major chord
    const notes = [130.81, 164.81, 196.00, 261.63]
    bgOscillators = notes.map((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = i < 2 ? "sine" : "triangle"
      osc.frequency.value = freq
      // Subtle detuning for warmth
      osc.detune.value = (Math.random() - 0.5) * 8
      const oscGain = ctx.createGain()
      oscGain.gain.value = i === 3 ? 0.015 : 0.025
      osc.connect(oscGain)
      oscGain.connect(bgGain!)
      osc.start()
      return osc
    })

    // Add a slow LFO to modulate volume for a breathing feel
    const lfo = ctx.createOscillator()
    lfo.type = "sine"
    lfo.frequency.value = 0.15 // very slow
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.012
    lfo.connect(lfoGain)
    lfoGain.connect(bgGain!.gain)
    lfo.start()
    bgOscillators.push(lfo)

    bgPlaying = true
  } catch {
    // Silently fail
  }
}

export function stopBackgroundMusic() {
  if (!bgPlaying) return
  try {
    if (bgGain) {
      const ctx = getCtx()
      bgGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8)
    }
    setTimeout(() => {
      bgOscillators.forEach((osc) => {
        try { osc.stop() } catch { /* already stopped */ }
      })
      bgOscillators = []
      bgGain = null
      bgPlaying = false
    }, 900)
  } catch {
    // Silently fail
  }
}

export function isBackgroundMusicPlaying() {
  return bgPlaying
}
