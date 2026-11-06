import { useCallback, useEffect, useRef, useState } from 'react'
import { TEMPOS, type TempoDef } from '../data'
import { useProgressStore } from '../../../store/progress'

type TempoId = TempoDef['id']

interface Engine {
  ctx: AudioContext
  master: GainNode
  noise: AudioBuffer
}

function createEngine(): Engine | null {
  const Ctor =
    typeof window === 'undefined'
      ? undefined
      : window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  const ctx = new Ctor()
  const master = ctx.createGain()
  master.gain.value = 0.5
  master.connect(ctx.destination)

  const length = Math.floor(ctx.sampleRate * 0.6)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1
  }
  return { ctx, master, noise: buffer }
}

/**
 * 全部音色由 Web Audio 现场合成：正弦轰炸 + 噪声模拟鼓、锣、钹与木槌，
 * 不对应任何真实录音，也不对应任何一支队伍的实际鼓谱。
 */
export function BeatGrid() {
  const [playing, setPlaying] = useState(false)
  const [tempoId, setTempoId] = useState<TempoId>('mid')
  const [beat, setBeat] = useState(-1)
  const engineRef = useRef<Engine | null>(null)
  const timerRef = useRef<number | null>(null)
  const indexRef = useRef(0)
  const tempoRef = useRef<TempoDef>(TEMPOS[1])
  const [unsupported, setUnsupported] = useState(false)
  const markInteraction = useProgressStore((s) => s.markInteraction)

  const tempo = TEMPOS.find((t) => t.id === tempoId) ?? TEMPOS[1]

  useEffect(() => {
    tempoRef.current = tempo
  }, [tempo])

  const ensureEngine = useCallback((): Engine | null => {
    if (engineRef.current) return engineRef.current
    const engine = createEngine()
    if (!engine) {
      setUnsupported(true)
      return null
    }
    engineRef.current = engine
    return engine
  }, [])

  const noiseBurst = useCallback(
    (engine: Engine, at: number, opts: { type: BiquadFilterType; freq: number; q: number; gain: number; decay: number }) => {
      const { ctx, master, noise } = engine
      const source = ctx.createBufferSource()
      source.buffer = noise
      const filter = ctx.createBiquadFilter()
      filter.type = opts.type
      filter.frequency.value = opts.freq
      filter.Q.value = opts.q
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(opts.gain, at)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + opts.decay)
      source.connect(filter).connect(gain).connect(master)
      source.start(at)
      source.stop(at + opts.decay + 0.02)
    },
    [],
  )

  const drum = useCallback(
    (at: number, accent: number) => {
      const engine = ensureEngine()
      if (!engine) return
      const { ctx, master } = engine
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(accent, at)
      osc.frequency.exponentialRampToValueAtTime(52, at + 0.24)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.95, at + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3)
      osc.connect(gain).connect(master)
      osc.start(at)
      osc.stop(at + 0.34)
      noiseBurst(engine, at, { type: 'lowpass', freq: 520, q: 0.8, gain: 0.22, decay: 0.09 })
    },
    [ensureEngine, noiseBurst],
  )

  const gong = useCallback(
    (at: number) => {
      const engine = ensureEngine()
      if (!engine) return
      const { ctx, master } = engine
      const freqs = [196, 293.7, 441.5]
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq * (1 + i * 0.002)
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.exponentialRampToValueAtTime(0.16 / (i + 1), at + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.5)
        osc.connect(gain).connect(master)
        osc.start(at)
        osc.stop(at + 1.55)
      })
      noiseBurst(engine, at, { type: 'bandpass', freq: 1400, q: 1.2, gain: 0.12, decay: 0.5 })
    },
    [ensureEngine, noiseBurst],
  )

  const cymbal = useCallback(
    (at: number, gain = 0.18) => {
      const engine = ensureEngine()
      if (!engine) return
      noiseBurst(engine, at, { type: 'highpass', freq: 3800, q: 0.7, gain, decay: 0.22 })
    },
    [ensureEngine, noiseBurst],
  )

  const club = useCallback(
    (at: number) => {
      const engine = ensureEngine()
      if (!engine) return
      const { ctx, master } = engine
      noiseBurst(engine, at, { type: 'bandpass', freq: 2100, q: 2.4, gain: 0.32, decay: 0.05 })
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.setValueAtTime(1080, at)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.07, at + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05)
      osc.connect(gain).connect(master)
      osc.start(at)
      osc.stop(at + 0.06)
    },
    [ensureEngine, noiseBurst],
  )

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const tick = useCallback(
    (index: number, def: TempoDef) => {
      const engine = engineRef.current
      if (!engine) return
      const at = engine.ctx.currentTime + 0.01
      drum(at, index === 0 ? 132 : 108)
      if (index === 0) gong(at)
      if (index === def.cycle - 1) cymbal(at)
      if (index % 2 === 1) club(at + 0.02)
    },
    [club, cymbal, drum, gong],
  )

  const startLoop = useCallback(() => {
    clearTimer()
    indexRef.current = 0
    setBeat(0)
    tick(0, tempoRef.current)
    timerRef.current = window.setInterval(() => {
      const def = tempoRef.current
      const next = (indexRef.current + 1) % def.cycle
      indexRef.current = next
      setBeat(next)
      tick(next, def)
    }, tempoRef.current.interval)
  }, [clearTimer, tick])

  const stop = useCallback(() => {
    clearTimer()
    setPlaying(false)
    setBeat(-1)
  }, [clearTimer])

  const start = useCallback(() => {
    const engine = ensureEngine()
    if (!engine) return
    void engine.ctx.resume?.()
    setPlaying(true)
    markInteraction('yingge:beat')
    startLoop()
  }, [ensureEngine, markInteraction, startLoop])

  // 播放中切换板式：立即按新间隔重启循环
  useEffect(() => {
    if (playing) startLoop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempoId])

  useEffect(
    () => () => {
      clearTimer()
      const engine = engineRef.current
      engineRef.current = null
      void engine?.ctx.close?.()
    },
    [clearTimer],
  )

  const preview = (kind: 'drum' | 'gong' | 'cymbal' | 'club') => {
    const engine = ensureEngine()
    if (!engine) return
    void engine.ctx.resume?.()
    markInteraction('yingge:beat')
    const at = engine.ctx.currentTime + 0.01
    if (kind === 'drum') drum(at, 132)
    else if (kind === 'gong') gong(at)
    else if (kind === 'cymbal') cymbal(at, 0.26)
    else club(at)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="选择板式">
        {TEMPOS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTempoId(item.id)}
            aria-pressed={item.id === tempoId}
            className={[
              'inline-flex min-h-[44px] min-w-[88px] flex-col items-start justify-center rounded-control border px-3 text-left transition-colors duration-200 ease-exhibit',
              item.id === tempoId
                ? 'border-brick bg-brick/[0.06] text-brick'
                : 'border-line bg-white/60 text-ink-soft hover:border-brick/40 hover:bg-hover',
            ].join(' ')}
          >
            <span className="text-sm font-medium">{item.name}</span>
            <span className="text-[11px] text-muted">{item.cycle} 下鼓点一循环</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className={playing ? 'btn-secondary' : 'btn-primary'}
          onClick={playing ? stop : start}
          disabled={unsupported}
        >
          {playing ? '停止' : '开始合成节拍'}
        </button>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: tempo.cycle }).map((_, i) => (
            <span
              key={i}
              className={[
                'h-3.5 w-3.5 rounded-full border transition-colors',
                playing && i === beat
                  ? 'border-brick bg-brick'
                  : 'border-line bg-white/60',
              ].join(' ')}
            />
          ))}
        </div>
        <p className="text-xs text-muted" role="status" aria-live="polite">
          {unsupported
            ? '当前浏览器不支持 Web Audio，无法播放合成节拍。'
            : playing
              ? `${tempo.name}示意 · 第 ${beat + 1} 下`
              : '点按开始后会循环合成节拍'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['drum', '鼓'],
            ['gong', '锣'],
            ['cymbal', '钹'],
            ['club', '木槌'],
          ] as const
        ).map(([kind, label]) => (
          <button
            key={kind}
            type="button"
            className="btn-secondary !px-4 !text-sm"
            onClick={() => preview(kind)}
          >
            试听合成音色：{label}
          </button>
        ))}
      </div>

      <p className="text-xs leading-6 text-muted">
        上面的循环长度只借用标准对「几下鼓点为一循环」的描述；速度、重音与音色都由本页临时合成，
        不是任何一支队伍的实录，也不能当成教学鼓谱。
      </p>
    </div>
  )
}
