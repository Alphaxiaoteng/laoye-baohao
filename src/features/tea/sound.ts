type AudioContextCtor = typeof AudioContext

/**
 * 极简 Web Audio 合成音效。
 *
 * - 默认关闭，不自动播放，也不会在页面加载时创建 AudioContext。
 * - 只有用户主动把「合成音效」切到开，才会创建/恢复 AudioContext。
 * - 所有声音都是浏览器实时合成的，不加载任何音频文件。
 */
class TeaSoundManager {
  private ctx: AudioContext | null = null
  private enabled = false

  isEnabled(): boolean {
    return this.enabled
  }

  setEnabled(next: boolean): void {
    this.enabled = next
    if (!next) {
      if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend()
      return
    }
    const ctx = this.ensureCtx()
    if (ctx && ctx.state === 'suspended') void ctx.resume()
  }

  toggle(): boolean {
    this.setEnabled(!this.enabled)
    return this.enabled
  }

  private ensureCtx(): AudioContext | null {
    if (!this.enabled) return null
    if (!this.ctx) {
      const scope = window as unknown as { webkitAudioContext?: AudioContextCtor }
      const Ctor: AudioContextCtor | undefined = window.AudioContext ?? scope.webkitAudioContext
      if (!Ctor) return null
      try {
        this.ctx = new Ctor()
      } catch {
        return null
      }
    }
    return this.ctx
  }

  /** 翻到下一步时的短提示音 */
  playDing(): void {
    const ctx = this.ensureCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  }

  /** 注水声（带通滤波的白噪声） */
  playPour(duration = 1.2): void {
    const ctx = this.ensureCtx()
    if (!ctx) return
    const bufferSize = Math.floor(ctx.sampleRate * duration)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.5
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(900, ctx.currentTime)
    filter.frequency.linearRampToValueAtTime(1600, ctx.currentTime + duration)
    filter.Q.value = 0.8
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.1)
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + duration - 0.2)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    noise.connect(filter).connect(gain).connect(ctx.destination)
    noise.start()
    noise.stop(ctx.currentTime + duration)
  }

  /** 走完五步时的收尾和音 */
  playComplete(): void {
    const ctx = this.ensureCtx()
    if (!ctx) return
    const freqs = [523.25, 659.25, 783.99]
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = f
      const t0 = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0)
      osc.stop(t0 + 1.2)
    })
  }
}

export const teaSound = new TeaSoundManager()
