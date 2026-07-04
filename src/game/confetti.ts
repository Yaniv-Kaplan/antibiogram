import confetti from 'canvas-confetti'

export function fireConfetti(kind: 'block' | 'big'): void {
  if (kind === 'block') {
    confetti({
      particleCount: 45,
      spread: 55,
      startVelocity: 32,
      origin: { y: 0.7 },
      scalar: 0.8,
      disableForReducedMotion: true,
    })
    return
  }
  // Big: a fuller two-sided burst for completing a whole antibiotic.
  const opts = { disableForReducedMotion: true, startVelocity: 45, ticks: 200 }
  confetti({ ...opts, particleCount: 120, spread: 90, origin: { x: 0.3, y: 0.65 } })
  confetti({ ...opts, particleCount: 120, spread: 90, origin: { x: 0.7, y: 0.65 } })
}
