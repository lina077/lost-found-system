export function useNotificationSound() {
  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const playTone = (freq, start, duration, vol = 0.3) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, start)
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(vol, start + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
        osc.start(start)
        osc.stop(start + duration)
      }
      const now = ctx.currentTime
      playTone(880, now,       0.25, 0.3)
      playTone(660, now + 0.2, 0.35, 0.25)
      setTimeout(() => ctx.close(), 800)
    } catch {}
  }
  return { playSound }
}