import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FORMATIONS, type FormationId } from '../data'
import { useProgressStore } from '../../../store/progress'

const COUNT = 48
const TAU = Math.PI * 2

interface Point {
  x: number
  z: number
}

/**
 * 队形点位。数值是抽象坐标，只表达「谁在谁的哪一侧、间距多大、往哪走」，
 * 不复刻任何一支队伍的人数、路线长度或槌路。
 * 七种队形的名称与走位要点来自 S103（汕头市地方标准 DB 4405/T 315—2025）。
 */
function targetsFor(id: FormationId, phase: number): Point[] {
  const out: Point[] = []
  for (let i = 0; i < COUNT; i += 1) {
    if (id === 'double') {
      const row = Math.floor(i / 2)
      const rows = Math.ceil(COUNT / 2)
      const u = row / Math.max(1, rows - 1)
      out.push({ x: i % 2 ? 2.6 : -2.6, z: -12 + u * 24 })
    } else if (id === 'square') {
      const lane = i % 4
      const rows = Math.ceil(COUNT / 4)
      const row = Math.floor(i / 4)
      const u = row / Math.max(1, rows - 1)
      out.push({ x: (lane - 1.5) * 2.05, z: -11.5 + u * 23 })
    } else if (id === 'dragon') {
      const lane = i % 4
      const rows = Math.ceil(COUNT / 4)
      const row = Math.floor(i / 4)
      const u = row / Math.max(1, rows - 1)
      const side = lane < 2 ? -1 : 1
      const inner = lane % 2 ? 0.55 : -0.55
      const open = Math.sin(u * Math.PI) * 5.7 + u * 4.2
      out.push({
        x: side * (1.8 + open) + inner,
        z: -11.5 + u * 23 + Math.sin(u * Math.PI * 2 + phase * 0.65) * 1.4,
      })
    } else if (id === 'spiral') {
      const u = i / Math.max(1, COUNT - 1)
      const angle = u * Math.PI * 5.2 + phase * 0.22
      const radius = 0.6 + u * 10.6
      out.push({ x: Math.cos(angle) * radius, z: Math.sin(angle) * radius })
    } else if (id === 'wheat') {
      const strand = i % 2
      const index = Math.floor(i / 2)
      const size = Math.ceil(COUNT / 2)
      const direction = strand === 0 ? 1 : -1
      const angle =
        (index / size) * TAU + (strand * Math.PI) / size + direction * phase * 0.2
      const weave = Math.sin(angle * 9 + strand * Math.PI) * 0.72
      const radius = 9.15 + weave
      out.push({ x: Math.cos(angle) * radius, z: Math.sin(angle) * radius })
    } else if (id === 'seas') {
      const size = Math.ceil(COUNT / 4)
      const g = Math.min(3, Math.floor(i / size))
      const j = i - g * size
      const centers = [
        [-5.8, -5.8],
        [5.8, -5.8],
        [-5.8, 5.8],
        [5.8, 5.8],
      ]
      const center = centers[g]
      const angle = (j / Math.max(1, size)) * TAU + phase * (g % 2 ? -0.22 : 0.22)
      out.push({ x: center[0] + Math.cos(angle) * 3.5, z: center[1] + Math.sin(angle) * 3.5 })
    } else {
      const outer = Math.round(COUNT * 0.43)
      const inner = Math.round(COUNT * 0.31)
      if (i < outer) {
        const angle = (i / outer) * TAU + phase * 0.14
        out.push({ x: Math.cos(angle) * 10.8, z: Math.sin(angle) * 10.8 })
      } else if (i < outer + inner) {
        const angle = -((i - outer) / inner) * TAU - phase * 0.18
        out.push({ x: Math.cos(angle) * 7.2, z: Math.sin(angle) * 7.2 })
      } else {
        const total = COUNT - outer - inner
        const u = (i - outer - inner) / Math.max(1, total - 1)
        const v = u * 2 - 1
        out.push({ x: Math.sin(v * Math.PI + phase * 0.18) * 4.3, z: v * 6.4 })
      }
    }
  }
  return out
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches)
    if (query.addEventListener) {
      query.addEventListener('change', handler)
      return () => query.removeEventListener('change', handler)
    }
    return undefined
  }, [])
  return reduced
}
interface AnimState {
  mode: FormationId
  auto: boolean
  visible: boolean
  dragging: boolean
  progress: number
  starts: Point[]
  current: Point[]
  rotY: number
  targetRotY: number
  tilt: number
  targetTilt: number
  autoIndex: number
}

export function FormationStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const stateRef = useRef<AnimState>({
    mode: 'double',
    auto: true,
    visible: true,
    dragging: false,
    progress: 1,
    starts: [],
    current: [],
    rotY: -0.18,
    targetRotY: -0.18,
    tilt: 0.62,
    targetTilt: 0.62,
    autoIndex: 0,
  })
  const [mode, setMode] = useState<FormationId>('double')
  const [auto, setAuto] = useState(true)
  const [moving, setMoving] = useState(false)
  const reduced = usePrefersReducedMotion()
  const markInteraction = useProgressStore((s) => s.markInteraction)

  const active = useMemo(
    () => FORMATIONS.find((f) => f.id === mode) ?? FORMATIONS[0],
    [mode],
  )

  const select = useCallback(
    (id: FormationId, manual = false) => {
      const s = stateRef.current
      if (id === s.mode && s.progress < 1) return
      s.starts = s.current.map((p) => ({ ...p }))
      s.mode = id
      s.progress = reduced ? 1 : 0
      s.autoIndex = Math.max(0, FORMATIONS.findIndex((f) => f.id === id))
      if (manual) {
        s.auto = false
        setAuto(false)
        markInteraction('yingge:formation')
      }
      setMode(id)
      setMoving(!reduced)
    },
    [markInteraction, reduced],
  )

  useEffect(() => {
    if (!moving) return
    const timer = window.setTimeout(() => setMoving(false), 1000)
    return () => window.clearTimeout(timer)
  }, [moving])

  // 自动巡演：只在画布可见、没有拖动、用户没有手动选择时前进
  useEffect(() => {
    const timer = window.setInterval(() => {
      const s = stateRef.current
      if (!s.auto || !s.visible || s.dragging) return
      const next = FORMATIONS[(s.autoIndex + 1) % FORMATIONS.length]
      select(next.id)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [select])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const s = stateRef.current
    s.current = targetsFor(s.mode, 0)
    s.starts = s.current.map((p) => ({ ...p }))

    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      width = Math.max(280, rect.width)
      height = Math.max(220, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }
    resize()

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    resizeObserver?.observe(wrap)
    window.addEventListener('resize', resize)

    let raf = 0
    let last = performance.now()
    let clock = 0

    const draw = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      if (!reduced) clock += dt / 1000

      // 平滑视角
      s.rotY += (s.targetRotY - s.rotY) * 0.12
      s.tilt += (s.targetTilt - s.tilt) * 0.12

      if (s.progress < 1) {
        s.progress = Math.min(1, s.progress + dt / 900)
      }

      const phase = reduced ? 0 : clock
      const targets = targetsFor(s.mode, phase)
      if (s.current.length !== COUNT) {
        s.current = targets
        s.starts = targets.map((p) => ({ ...p }))
      }
      for (let i = 0; i < COUNT; i += 1) {
        const target = targets[i]
        if (s.progress < 1) {
          const t = easeInOutCubic(s.progress)
          const start = s.starts[i] ?? target
          s.current[i] = {
            x: start.x + (target.x - start.x) * t,
            z: start.z + (target.z - start.z) * t,
          }
        } else {
          const cur = s.current[i]
          const k = reduced ? 1 : 0.16
          cur.x += (target.x - cur.x) * k
          cur.z += (target.z - cur.z) * k
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      // 与 8787 深墨青底座一致；浅色画布会在深色站里像一块贴上去的白纸
      ctx.fillStyle = '#1f2d25'
      ctx.fillRect(0, 0, width, height)

      const scale = Math.min(width / 29, height / 18)
      const cx = width / 2
      const cy = height / 2 + height * 0.03
      const cos = Math.cos(s.rotY)
      const sin = Math.sin(s.rotY)
      const toScreen = (p: Point) => {
        const rx = p.x * cos - p.z * sin
        const rz = p.x * sin + p.z * cos
        return { x: cx + rx * scale, y: cy + rz * scale * s.tilt, depth: rz }
      }

      // 地面网格
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      for (let g = -12; g <= 12; g += 4) {
        const a = toScreen({ x: g, z: -13 })
        const b = toScreen({ x: g, z: 13 })
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
        const c = toScreen({ x: -13, z: g })
        const d = toScreen({ x: 13, z: g })
        ctx.beginPath()
        ctx.moveTo(c.x, c.y)
        ctx.lineTo(d.x, d.y)
        ctx.stroke()
      }

      const screen = s.current.map((p) => toScreen(p))
      const order = screen
        .map((p, i) => ({ i, depth: p.depth }))
        .sort((a, b) => a.depth - b.depth)
        .map((entry) => entry.i)

      // 走位连线：只连接相邻的点，队形里横跨两组的长线不画，避免读成「路线」
      ctx.strokeStyle = 'rgba(255,255,255,0.10)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      for (let i = 0; i < screen.length - 1; i += 1) {
        const a = s.current[i]
        const b = s.current[i + 1]
        if (Math.hypot(a.x - b.x, a.z - b.z) > 1.9) continue
        ctx.moveTo(screen[i].x, screen[i].y)
        ctx.lineTo(screen[i + 1].x, screen[i + 1].y)
      }
      ctx.stroke()

      for (const i of order) {
        const { x, y } = screen[i]
        const depth = 1 + screen[i].depth / 90
        const bob = reduced ? 0 : Math.abs(Math.sin(phase * 4.2 + i * 0.48)) * scale * 0.16
        const bw = scale * 0.34 * depth
        const baseY = y - bob

        ctx.fillStyle = 'rgba(0,0,0,0.32)'
        ctx.beginPath()
        ctx.ellipse(x, y + 1, bw * 1.25, bw * 0.5, 0, 0, TAU)
        ctx.fill()

        // 槌：两根短线，摆动只表示「手上有动作」，不是槌法示意
        const swing = reduced ? 0.5 : Math.sin(phase * 5.4 + i * 0.62) * 0.7
        ctx.strokeStyle = '#cfd8c9'
        ctx.lineWidth = Math.max(1.2, scale * 0.045)
        ctx.lineCap = 'round'
        for (const side of [-1, 1] as const) {
          // 从肩部斜向外上方甩出，别穿过头部，否则小尺寸下会像“触须”
          const angle = side * (0.95 + swing * 0.3)
          const ox = x + Math.sin(angle) * bw * 0.55
          const oy = baseY - bw * 0.55
          ctx.beginPath()
          ctx.moveTo(ox, oy)
          ctx.lineTo(ox + Math.sin(angle) * scale * 0.5, oy - Math.cos(angle) * scale * 0.5)
          ctx.stroke()
        }

        // 身体：一个圆点，避免被读成具体人物造型
        ctx.fillStyle = '#f04a3a'
        ctx.beginPath()
        ctx.arc(x, baseY, bw, 0, TAU)
        ctx.fill()
        ctx.strokeStyle = 'rgba(240,74,58,0.85)'
        ctx.lineWidth = Math.max(1, scale * 0.035)
        ctx.stroke()

        // 头：小一号的米白圆点，示意朝向不明确，只标记「人在这里」
        ctx.fillStyle = '#f2f1ea'
        ctx.beginPath()
        ctx.arc(x, baseY - bw * 0.95, bw * 0.5, 0, TAU)
        ctx.fill()
        ctx.strokeStyle = '#243229'
        ctx.lineWidth = Math.max(0.8, scale * 0.03)
        ctx.stroke()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    let lastPointer: { x: number; y: number } | null = null
    const onPointerDown = (event: PointerEvent) => {
      s.dragging = true
      s.auto = false
      setAuto(false)
      canvas.setPointerCapture?.(event.pointerId)
      lastPointer = { x: event.clientX, y: event.clientY }
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!s.dragging || !lastPointer) return
      const dx = event.clientX - lastPointer.x
      const dy = event.clientY - lastPointer.y
      s.targetRotY += dx * 0.006
      s.targetTilt = Math.min(0.95, Math.max(0.32, s.targetTilt + dy * 0.0035))
      lastPointer = { x: event.clientX, y: event.clientY }
    }
    const endDrag = () => {
      s.dragging = false
      lastPointer = null
    }
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', endDrag)
    canvas.addEventListener('pointercancel', endDrag)
    canvas.addEventListener('pointerleave', endDrag)

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              s.visible = entries[0]?.isIntersecting ?? true
            },
            { threshold: 0.05 },
          )
        : null
    observer?.observe(canvas)

    const onVisibility = () => {
      s.visible = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      resizeObserver?.disconnect()
      observer?.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endDrag)
      canvas.removeEventListener('pointercancel', endDrag)
      canvas.removeEventListener('pointerleave', endDrag)
    }
  }, [reduced])

  const toggleAuto = () => {
    const next = !stateRef.current.auto
    stateRef.current.auto = next
    setAuto(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="切换阵形示意">
          {FORMATIONS.map((formation) => (
            <button
              key={formation.id}
              type="button"
              onClick={() => select(formation.id, true)}
              aria-pressed={formation.id === mode}
              className={[
                'inline-flex min-h-[44px] items-center rounded-control border px-3.5 text-sm transition-colors duration-200 ease-exhibit',
                formation.id === mode
                  ? 'border-brick bg-brick text-paper'
                  : 'border-line bg-white/60 text-ink-soft hover:border-brick/40 hover:bg-hover hover:text-brick',
              ].join(' ')}
            >
              {formation.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAuto}
            aria-pressed={auto}
            className={[
              'inline-flex min-h-[44px] items-center rounded-control border px-3.5 text-sm transition-colors duration-200 ease-exhibit',
              auto
                ? 'border-line bg-hover text-ink'
                : 'border-line bg-white/60 text-muted hover:bg-hover hover:text-ink',
            ].join(' ')}
          >
            {auto ? '自动巡演：开' : '自动巡演：关'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div
          ref={wrapRef}
          className="relative h-[300px] overflow-hidden rounded-card border border-line bg-paper sm:h-[380px] lg:h-[420px]"
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`${active.name}互动示意：队员以点位表示，可拖动旋转视角`}
            className="block h-full w-full touch-pan-y"
          />
          <p className="pointer-events-none absolute left-3 top-3 rounded-[4px] border border-line bg-paper/95 px-2 py-1 text-[11px] text-muted">
            拖动可旋转视角
          </p>
        </div>

        <div className="card space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif text-lg text-ink">{active.name}</h3>
            <span
              className="text-xs text-muted"
              role="status"
              aria-live="polite"
            >
              {moving ? '变阵中' : '行进中'}
            </span>
          </div>
          <p className="text-sm leading-6 text-ink-soft">{active.summary}</p>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs tracking-widest text-muted">走位</dt>
              <dd className="mt-0.5 leading-6 text-ink-soft">{active.route}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-muted">来源</dt>
              <dd className="mt-0.5 text-xs text-muted">
                {active.sourceIds.join('、')} · 潮阳英歌地方标准
              </dd>
            </div>
          </dl>
          <p className="border-t border-line pt-3 text-xs leading-5 text-muted">
            点位与连线只表示空间关系，人数、间距与路线均为示意，不对应某支队伍的固定套路。
          </p>
        </div>
      </div>
    </div>
  )
}
