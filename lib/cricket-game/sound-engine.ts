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
  | "stumps-hit"
  | "coin-toss"

let audioCtx: AudioContext | null = null
let audioUnlocked = false

function getCtx(): AudioContext {
  if (!audioCtx) {
    // Use webkit prefix for older iOS
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  return audioCtx
}

/**
 * Call this SYNCHRONOUSLY on user tap/click to unlock audio on iOS physical devices.
 * Must be called in the same call stack as the user gesture - not in setTimeout/Promise.
 */
export function unlockAudio() {
  try {
    const ctx = getCtx()
    
    // Resume suspended context - MUST happen synchronously in user gesture
    if (ctx.state === "suspended") {
      ctx.resume()
    }
    
    if (audioUnlocked) return
    
    // Play a silent buffer to unlock (required for iOS WebKit on physical devices)
    const buffer = ctx.createBuffer(1, 1, 22050)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start(0)
    
    // Create oscillator immediately (helps unlock on physical iOS)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    gain.gain.value = 0.001 // Near-silent but not zero
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(0)
    osc.stop(ctx.currentTime + 0.01)
    
    audioUnlocked = true
  } catch {
    // Silently fail
  }
}

/**
 * Ensure audio context is ready before playing sounds.
 * Call this before any playSound() call.
 */
function ensureAudioReady() {
  const ctx = getCtx()
  if (ctx.state === "suspended") {
    ctx.resume()
  }
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

function playStumpsHit() {
  // Ball hitting stumps - dramatic impact with wooden clatter
  // Initial ball impact
  playNoise(0.08, 0.25)
  playTone(1200, 0.08, "square", 0.15)
  // Stumps breaking/flying
  playTone(800, 0.1, "triangle", 0.12, 0.05)
  playTone(600, 0.12, "triangle", 0.1, 0.1)
  playTone(400, 0.15, "triangle", 0.08, 0.15)
  // Wooden clatter of bails falling
  for (let i = 0; i < 4; i++) {
    const freq = 1500 + Math.random() * 800
    playTone(freq, 0.06, "triangle", 0.06, 0.2 + i * 0.08)
  }
  // Reverb tail
  playTone(200, 0.4, "sine", 0.04, 0.4)
}

function playCoinToss() {
  // Realistic coin flip - thumb flick, spinning in air, catching, and slap reveal
  const ctx = getCtx()
  
  // Initial thumb flick - sharp metallic ping
  playTone(4000, 0.03, "square", 0.12)
  playTone(3200, 0.04, "triangle", 0.08, 0.02)
  
  // Coin spinning in air - rapid metallic shimmers that slow down
  const spins = 12
  for (let i = 0; i < spins; i++) {
    const delay = 0.06 + i * 0.055 + (i * i * 0.003) // accelerating gaps as it slows
    const freq = 2800 + Math.sin(i * 0.8) * 400 // wobbling pitch
    const gain = 0.06 - (i * 0.003) // fading volume
    playTone(freq, 0.025, "triangle", gain, delay)
  }
  
  // Catch in palm - soft thud
  playNoise(0.04, 0.1, 0.75)
  playTone(300, 0.06, "sine", 0.08, 0.75)
  
  // Slap onto hand for reveal - sharp impact
  playNoise(0.03, 0.12, 0.95)
  playTone(500, 0.05, "triangle", 0.1, 0.95)
  
  // Final ring of the coin settling
  const ringOsc = ctx.createOscillator()
  const ringGain = ctx.createGain()
  ringOsc.type = "sine"
  ringOsc.frequency.setValueAtTime(2400, ctx.currentTime + 1.0)
  ringOsc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 1.3)
  ringGain.gain.setValueAtTime(0.06, ctx.currentTime + 1.0)
  ringGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4)
  ringOsc.connect(ringGain)
  ringGain.connect(ctx.destination)
  ringOsc.start(ctx.currentTime + 1.0)
  ringOsc.stop(ctx.currentTime + 1.4)
}

/* ─── Public API ─── */

export function playSound(type: SquareSound) {
  try {
    ensureAudioReady()
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
      case "stumps-hit":
        playStumpsHit()
        break
      case "coin-toss":
        playCoinToss()
        break
    }
  } catch {
    // Silently fail if audio is not available
  }
}

/* ─── Spoken Commentary ─── */

let isSpeaking = false
const speechQueue: string[] = []
let voicesLoaded = false
let speechSupported: boolean | null = null

// Check if speech synthesis is actually supported and working
function checkSpeechSupport(): boolean {
  if (speechSupported !== null) return speechSupported
  if (typeof window === "undefined" || !window.speechSynthesis) {
    speechSupported = false
    return false
  }
  // Android WebView may have speechSynthesis but it doesn't always work
  const isAndroid = /android/i.test(navigator.userAgent)
  const isCapacitor = typeof (window as unknown as {Capacitor?: unknown}).Capacitor !== "undefined"
  
  // On Android Capacitor, speech synthesis is unreliable - disable it
  if (isAndroid && isCapacitor) {
    speechSupported = false
    return false
  }
  
  speechSupported = true
  return true
}

// Preload voices on mobile (needed for Android)
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!checkSpeechSupport()) {
      resolve([])
      return
    }
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      voicesLoaded = true
      resolve(voices)
      return
    }
    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      voicesLoaded = true
      resolve(window.speechSynthesis.getVoices())
    }
    // Timeout fallback
    setTimeout(() => {
      const v = window.speechSynthesis?.getVoices() || []
      voicesLoaded = v.length > 0
      resolve(v)
    }, 1000)
  })
}

// Initialize voices early
if (typeof window !== "undefined") {
  loadVoices()
}

function processQueue() {
  if (isSpeaking || speechQueue.length === 0) return
  if (!checkSpeechSupport()) {
    speechQueue.length = 0
    return
  }

  const text = speechQueue.shift()!
  isSpeaking = true

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.0
  utterance.pitch = 1.0
  utterance.volume = 1.0

  // Try to pick an English voice - prefer local/offline voices
  const voices = window.speechSynthesis.getVoices()
  const localEnglish = voices.find(
    (v) => v.lang.startsWith("en") && v.localService === true
  )
  const anyEnglish = voices.find((v) => v.lang.startsWith("en"))
  const defaultVoice = voices[0]
  utterance.voice = localEnglish || anyEnglish || defaultVoice || null

  utterance.onend = () => {
    isSpeaking = false
    setTimeout(processQueue, 100)
  }
  utterance.onerror = () => {
    isSpeaking = false
    setTimeout(processQueue, 100)
  }

  // Cancel any existing speech and speak
  window.speechSynthesis.cancel()
  setTimeout(() => {
    window.speechSynthesis.speak(utterance)
  }, 20)
}

export function speakCommentary(text: string) {
  try {
    if (!checkSpeechSupport()) return
    // Cancel any pending speech if queue is long
    if (speechQueue.length > 2) {
      window.speechSynthesis.cancel()
      isSpeaking = false
      speechQueue.length = 0
    }
    speechQueue.push(text)
    // Ensure voices are loaded before speaking
    if (!voicesLoaded) {
      loadVoices().then(() => processQueue())
    } else {
      processQueue()
    }
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
