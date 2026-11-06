import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FORMATIONS, type FormationId } from '../data'
import { useProgressStore } from '../../../store/progress'

const COUNT = 48
const TAU = Math.PI * 2
const DANCER_URL = '/media/yingge/models/dancer.glb'

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

interface DancerStage {
  sync: (rotY: number, tilt: number, points: Point[], phase: number, width: number, height: number) => void
  pick: (clientX: number, clientY: number) => boolean
  dispose: () => void
}

/** 把模型脚底放到原点，身高约 1.65 个阵形单位。 */
function fitMatrix(root: THREE.Object3D): THREE.Matrix4 {
  root.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(root)
  const height = Math.max(0.001, box.max.y - box.min.y)
  const scale = 1.65 / height
  const cx = (box.min.x + box.max.x) / 2
  const cz = (box.min.z + box.max.z) / 2
  return new THREE.Matrix4()
    .makeTranslation(-cx * scale, -box.min.y * scale, -cz * scale)
    .multiply(new THREE.Matrix4().makeScale(scale, scale, scale))
}

function mountDancers(gltfScene: THREE.Object3D, host: HTMLElement, width: number, height: number): DancerStage | null {
  const fit = fitMatrix(gltfScene)
  const parts: THREE.InstancedMesh[] = []
  gltfScene.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const geo = mesh.geometry.clone()
    geo.applyMatrix4(fit.clone().multiply(mesh.matrixWorld))
    const source = mesh.material
    const material = Array.isArray(source) ? source[0] : source
    const inst = new THREE.InstancedMesh(geo, material, COUNT)
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    inst.frustumCulled = false
    parts.push(inst)
  })
  if (parts.length === 0) return null

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.domElement.className = 'block h-full w-full touch-pan-y'
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#1f2d25')
  scene.add(new THREE.AmbientLight('#ffffff', 0.75))
  const sun = new THREE.DirectionalLight('#fff2e0', 1.35)
  sun.position.set(8, 14, 6)
  scene.add(sun)
  const fill = new THREE.DirectionalLight('#9bb8a8', 0.4)
  fill.position.set(-6, 5, -8)
  scene.add(fill)
  scene.add(new THREE.GridHelper(26, 13, 0x4a5e54, 0x314239))
  for (const part of parts) scene.add(part)

  const camera = new THREE.PerspectiveCamera(32, width / Math.max(1, height), 0.1, 200)
  const dummy = new THREE.Object3D()
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

  return {
    sync(rotY, tilt, points, phase, w, h) {
      const pitch = 0.28 + (tilt - 0.32) * 0.85
      const dist = 34
      camera.aspect = w / Math.max(1, h)
      camera.updateProjectionMatrix()
      camera.position.set(
        Math.sin(rotY) * dist * Math.cos(pitch),
        1.2 + Math.sin(pitch) * 16,
        Math.cos(rotY) * dist * Math.cos(pitch),
      )
      camera.lookAt(0, 0.7, 0)
      renderer.setSize(w, h)
      const stepPhase = phase * 8.4
      const arm = Math.sin(stepPhase) * 0.55
      for (let i = 0; i < COUNT; i += 1) {
        const p = points[i]
        const bob = Math.abs(Math.sin(phase * 4.2 + i * 0.48)) * 0.08
        dummy.position.set(p?.x ?? 0, bob, p?.z ?? 0)
        const side = i % 2 ? 1 : -1
        dummy.rotation.set(side * arm * 0.35 + Math.sin(stepPhase + i * 0.2) * 0.08, 0, side * arm * 0.12)
        dummy.updateMatrix()
        for (const part of parts) part.setMatrixAt(i, dummy.matrix)
      }
      for (const part of parts) part.instanceMatrix.needsUpdate = true
      renderer.render(scene, camera)
    },
    pick(clientX, clientY) {
      const rect = renderer.domElement.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      return raycaster.intersectObjects(parts, false).length > 0
    },
    dispose() {
      renderer.dispose()
      renderer.domElement.remove()
      for (const part of parts) part.geometry.dispose()
      scene.clear()
    },
  }
}

function DancerZoom({ onClose }: { onClose: () => void }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.domElement.className = 'block h-full w-full'
    host.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#1f2d25')
    scene.add(new THREE.AmbientLight('#ffffff', 0.8))
    const sun = new THREE.DirectionalLight('#fff2e0', 1.4)
    sun.position.set(2, 4, 3)
    scene.add(sun)
    const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 50)
    let yaw = 0.5
    let pitch = 0.25
    let dist = 4.2
    const place = () => {
      camera.position.set(
        Math.sin(yaw) * dist * Math.cos(pitch),
        0.85 + Math.sin(pitch) * dist * 0.55,
        Math.cos(yaw) * dist * Math.cos(pitch),
      )
      camera.lookAt(0, 0.8, 0)
    }
    place()
    const resize = () => {
      const rect = host.getBoundingClientRect()
      const w = Math.max(1, rect.width)
      const h = Math.max(1, rect.height)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    resize()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    observer?.observe(host)

    let dragging = false
    let last = { x: 0, y: 0 }
    const down = (event: PointerEvent) => {
      dragging = true
      last = { x: event.clientX, y: event.clientY }
      renderer.domElement.setPointerCapture(event.pointerId)
    }
    const move = (event: PointerEvent) => {
      if (!dragging) return
      yaw += (event.clientX - last.x) * 0.008
      pitch = Math.min(1.15, Math.max(-0.15, pitch + (event.clientY - last.y) * 0.005))
      last = { x: event.clientX, y: event.clientY }
      place()
    }
    const up = () => {
      dragging = false
    }
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      dist = Math.min(9, Math.max(1.6, dist + event.deltaY * 0.004))
      place()
    }
    renderer.domElement.addEventListener('pointerdown', down)
    renderer.domElement.addEventListener('pointermove', move)
    renderer.domElement.addEventListener('pointerup', up)
    renderer.domElement.addEventListener('pointercancel', up)
    renderer.domElement.addEventListener('wheel', wheel, { passive: false })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    const loader = new GLTFLoader()
    loader.load(DANCER_URL, (gltf) => {
      if (disposed) return
      const root = gltf.scene
      root.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(root)
      const height = Math.max(0.001, box.max.y - box.min.y)
      const scale = 1.7 / height
      root.scale.setScalar(scale)
      root.updateMatrixWorld(true)
      const fitted = new THREE.Box3().setFromObject(root)
      root.position.set(
        -((fitted.min.x + fitted.max.x) / 2),
        -fitted.min.y,
        -((fitted.min.z + fitted.max.z) / 2),
      )
      scene.add(root)
    })

    let raf = 0
    const loop = () => {
      renderer.render(scene, camera)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer?.disconnect()
      document.removeEventListener('keydown', onKey)
      renderer.domElement.removeEventListener('pointerdown', down)
      renderer.domElement.removeEventListener('pointermove', move)
      renderer.domElement.removeEventListener('pointerup', up)
      renderer.domElement.removeEventListener('pointercancel', up)
      renderer.domElement.removeEventListener('wheel', wheel)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [onClose])

  if (typeof document === 'undefined') return null
  // 页面入场动画带 transform，fixed 留在里面会跟着滚出视口。
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="英歌角色，可拖动旋转，滚轮放大"
        className="relative h-[min(78vh,720px)] w-[min(960px,94vw)] overflow-hidden rounded-card border border-line"
        onClick={(event) => event.stopPropagation()}
      >
        <div ref={hostRef} className="h-full w-full" />
        <button
          type="button"
          className="absolute right-3 top-3 min-h-[44px] rounded-control border border-line bg-paper px-3 text-sm text-ink"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </div>,
    document.body,
  )
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

export function FormationStage({ tall = false }: { tall?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const glRef = useRef<HTMLDivElement | null>(null)
  const openZoomRef = useRef(() => {})
  const [modelOn, setModelOn] = useState(false)
  const [zoomOpen, setZoomOpen] = useState(false)
  const closeZoom = useCallback(() => setZoomOpen(false), [])
  openZoomRef.current = () => setZoomOpen(true)
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
    let dancer: DancerStage | null = null
    let disposed = false

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

      if (dancer) {
        dancer.sync(s.rotY, s.tilt, s.current, phase, width, height)
        raf = requestAnimationFrame(draw)
        return
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

    const glHost = glRef.current
    const loader = new GLTFLoader()
    loader.load(
      DANCER_URL,
      (gltf) => {
        if (disposed || !glHost) return
        dancer = mountDancers(gltf.scene, glHost, width, height)
        if (!dancer) return
        canvas.style.visibility = 'hidden'
        canvas.style.pointerEvents = 'none'
        setModelOn(true)
      },
      undefined,
      () => {
        /* 模型还没落盘时继续画圆点 */
      },
    )

    let lastPointer: { x: number; y: number } | null = null
    let downAt: { x: number; y: number } | null = null
    let moved = false
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      s.dragging = true
      moved = false
      downAt = { x: event.clientX, y: event.clientY }
      wrap.setPointerCapture?.(event.pointerId)
      lastPointer = { x: event.clientX, y: event.clientY }
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!s.dragging || !lastPointer || !downAt) return
      const dx = event.clientX - lastPointer.x
      const dy = event.clientY - lastPointer.y
      if (Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) > 6) {
        moved = true
        s.auto = false
        setAuto(false)
      }
      s.targetRotY += dx * 0.006
      s.targetTilt = Math.min(0.95, Math.max(0.32, s.targetTilt + dy * 0.0035))
      lastPointer = { x: event.clientX, y: event.clientY }
    }
    const endDrag = (event: PointerEvent) => {
      const open = s.dragging && !moved && event.type === 'pointerup' && dancer?.pick(event.clientX, event.clientY)
      s.dragging = false
      lastPointer = null
      downAt = null
      if (open) openZoomRef.current()
    }
    wrap.addEventListener('pointerdown', onPointerDown)
    wrap.addEventListener('pointermove', onPointerMove)
    wrap.addEventListener('pointerup', endDrag)
    wrap.addEventListener('pointercancel', endDrag)
    wrap.addEventListener('pointerleave', endDrag)

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              s.visible = entries[0]?.isIntersecting ?? true
            },
            { threshold: 0.05 },
          )
        : null
    observer?.observe(wrap)

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
      disposed = true
      dancer?.dispose()
      wrap.removeEventListener('pointerdown', onPointerDown)
      wrap.removeEventListener('pointermove', onPointerMove)
      wrap.removeEventListener('pointerup', endDrag)
      wrap.removeEventListener('pointercancel', endDrag)
      wrap.removeEventListener('pointerleave', endDrag)
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
                  ? 'border-brick bg-brick text-cream'
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

      <div
        ref={wrapRef}
        className={
          tall
            ? 'yh-formation-tall relative overflow-hidden rounded-card border border-line bg-paper'
            : 'relative h-[300px] overflow-hidden rounded-card border border-line bg-paper sm:h-[380px] lg:h-[420px]'
        }
      >
        <div ref={glRef} className="absolute inset-0" />
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={
            modelOn
              ? `${active.name}互动示意：可拖动旋转视角，点一下角色放大`
              : `${active.name}互动示意：队员以点位表示，可拖动旋转视角`
          }
          className="absolute inset-0 block h-full w-full touch-pan-y"
        />
        <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex flex-wrap items-start justify-between gap-2">
          <p className="rounded-[4px] border border-line bg-paper/95 px-2 py-1 text-[11px] text-muted">
            {modelOn ? '拖动转视角，点一下放大' : '拖动可旋转视角'}
          </p>
          <div className="flex items-baseline gap-2 rounded-[4px] border border-line bg-paper/95 px-2 py-1">
            <h3 className="font-serif text-base text-ink">{active.name}</h3>
            <span className="text-[11px] text-muted" role="status" aria-live="polite">
              {moving ? '变阵中' : '行进中'}
            </span>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 z-10 w-[min(44%,200px)] overflow-hidden rounded-md border border-line bg-black/20 p-1">
          <img
            src="/media/yingge/anim/club-swing-demo.gif"
            alt=""
            className="block h-auto w-full opacity-95"
            loading="lazy"
            width={200}
            height={200}
          />
        </div>
      </div>
      {zoomOpen ? <DancerZoom onClose={closeZoom} /> : null}
    </div>
  )
}
