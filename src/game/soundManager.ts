/**
 * SoundManager — thin Web Audio API wrapper.
 * Reads `canasta_prefs` from localStorage to respect the sound on/off toggle.
 * All functions are no-ops when sound is disabled or AudioContext is unavailable.
 */

const PREFS_KEY = 'canasta_prefs'

function isSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) {
      const prefs = JSON.parse(raw) as { sound?: boolean }
      return prefs.sound !== false
    }
  } catch { /* ignore */ }
  return true
}

type AudioContextCtor = typeof AudioContext

function getAudioContext(): AudioContext | null {
  try {
    const Ctor: AudioContextCtor | undefined =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
    if (!Ctor) return null
    return new Ctor()
  } catch {
    return null
  }
}

function playTone(
  freq: number,
  type: OscillatorType,
  duration: number,
  volume = 0.25,
): void {
  if (!isSoundEnabled()) return
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
    osc.addEventListener('ended', () => { void ctx.close() })
  } catch { /* AudioContext not available in this environment */ }
}

function playSequence(
  notes: Array<{ freq: number; type: OscillatorType; delay: number; duration: number }>,
): void {
  notes.forEach(({ freq, type, delay, duration }) => {
    setTimeout(() => playTone(freq, type, duration), delay)
  })
}

/** Short click — card dealt or drawn */
export function playDeal(): void {
  playTone(880, 'sine', 0.08, 0.2)
}

/** Soft thud — card discarded */
export function playDiscard(): void {
  playTone(330, 'triangle', 0.15, 0.2)
}

/** Bright chime — meld placed */
export function playMeld(): void {
  playTone(523, 'sine', 0.2, 0.3)
}

/** Ascending arpeggio — canasta completed */
export function playCanasta(): void {
  playSequence([
    { freq: 523, type: 'sine', delay: 0, duration: 0.25 },
    { freq: 659, type: 'sine', delay: 100, duration: 0.25 },
    { freq: 784, type: 'sine', delay: 200, duration: 0.35 },
  ])
}

/** Triumphant fanfare — going out */
export function playGoOut(): void {
  playSequence([
    { freq: 523, type: 'sine', delay: 0, duration: 0.2 },
    { freq: 659, type: 'sine', delay: 120, duration: 0.2 },
    { freq: 784, type: 'sine', delay: 240, duration: 0.2 },
    { freq: 1047, type: 'sine', delay: 360, duration: 0.4 },
  ])
}

/** Low buzz — invalid move */
export function playInvalid(): void {
  playTone(180, 'sawtooth', 0.15, 0.15)
}
