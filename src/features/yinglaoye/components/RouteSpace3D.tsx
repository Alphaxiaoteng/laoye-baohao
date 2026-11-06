import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const MODEL_URL = {
  carrier: '/media/yinglaoye/models/carrier.glb',
  sedan: '/media/yinglaoye/models/sedan.glb',
  lord: '/media/yinglaoye/models/lord.glb',
  flag: '/media/yinglaoye/models/flag.glb',
  lantern: '/media/yinglaoye/models/lantern.glb',
} as const

type ModelKey = keyof typeof MODEL_URL

type Placement = {
  key: ModelKey
  x: number
  z: number
  rot: number
  height: number
  lift?: number
}

/** 一支短队伍：旗与高灯在前后，轿夫抬着中间的神轿，老爷坐在轿里。 */
const PLACEMENT: Placement[] = [
  { key: 'flag', x: -5.6, z: -0.7, rot: 0.35, height: 2.7 },
  { key: 'lantern', x: -4.1, z: 0.75, rot: 0, height: 2.5 },
  { key: 'flag', x: -3.8, z: -0.95, rot: -0.2, height: 2.5 },
  { key: 'carrier', x: -1.55, z: 1.15, rot: Math.PI / 2, height: 1.68 },
  { key: 'carrier', x: -1.55, z: -1.15, rot: Math.PI / 2, height: 1.68 },
  { key: 'sedan', x: 0, z: 0, rot: 0, height: 2.2 },
  { key: 'lord', x: 0, z: 0.42, rot: Math.PI, height: 1.35, lift: 0.92 },
  { key: 'carrier', x: 1.65, z: 1.15, rot: Math.PI / 2, height: 1.68 },
  { key: 'carrier', x: 1.65, z: -1.15, rot: Math.PI / 2, height: 1.68 },
  { key: 'lantern', x: 3.5, z: -0.7, rot: 0, height: 2.45 },
  { key: 'flag', x: 5, z: 0.65, rot: 0.2, height: 2.65 },
]

function framed(source: THREE.Object3D, height: number, lift = 0) {
  const holder = new THREE.Group()
  const clone = source.clone(true)
  holder.add(clone)
  clone.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(clone)
  const size = box.getSize(new THREE.Vector3())
  const scale = height / Math.max(size.y, 1e-4)
  clone.scale.setScalar(scale)
  clone.updateMatrixWorld(true)
  const fitted = new THREE.Box3().setFromObject(clone)
  const center = fitted.getCenter(new THREE.Vector3())
  clone.position.set(-center.x, -fitted.min.y + lift, -center.z)
  return holder
}

function loadTemplates() {
  const loader = new GLTFLoader()
  const keys = Object.keys(MODEL_URL) as ModelKey[]
  return Promise.all(
    keys.map(
      (key) =>
        new Promise<[ModelKey, THREE.Object3D]>((resolve, reject) => {
          loader.load(
            MODEL_URL[key],
            (gltf) => resolve([key, gltf.scene]),
            undefined,
            () => reject(new Error(key)),
          )
        }),
    ),
  ).then((pairs) => {
    const templates = {} as Record<ModelKey, THREE.Object3D>
    for (const [key, scene] of pairs) templates[key] = scene
    return templates
  })
}

/** 一场油画模型。拖动换视角；没人拖时镜头慢慢绕一圈。 */
export function RouteSpace3D({ reduced }: { reduced: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf3ecdf)
    scene.add(new THREE.AmbientLight(0xfff6ea, 0.85))
    const sun = new THREE.DirectionalLight(0xfff1dc, 1.35)
    sun.position.set(6, 10, 5)
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0xd7c4a4, 0.35)
    fill.position.set(-5, 4, -3)
    scene.add(fill)

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.08, 4.6),
      new THREE.MeshStandardMaterial({ color: 0xc4b39a, roughness: 0.92 }),
    )
    ground.position.y = -0.04
    scene.add(ground)

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80)
    camera.position.set(8.2, 3.6, 9.4)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1.15, 0)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 4.5
    controls.maxDistance = 18
    controls.maxPolarAngle = Math.PI / 2.05
    controls.update()

    let held = false
    const onStart = () => {
      held = true
    }
    controls.addEventListener('start', onStart)

    let raf = 0
    let angle = Math.atan2(camera.position.x, camera.position.z)
    let last = performance.now()

    const resize = () => {
      const rect = host.getBoundingClientRect()
      const w = Math.max(280, rect.width)
      const h = Math.max(200, rect.height)
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    host.appendChild(renderer.domElement)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    ro?.observe(host)

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!held && !reducedRef.current) {
        angle += dt * 0.18
        camera.position.set(Math.sin(angle) * 11.2, 3.5, Math.cos(angle) * 11.2)
        controls.target.set(0, 1.15, 0)
      }
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    loadTemplates()
      .then((templates) => {
        if (disposed) return
        for (const piece of PLACEMENT) {
          const model = framed(templates[piece.key], piece.height, piece.lift ?? 0)
          model.position.set(piece.x, 0, piece.z)
          model.rotation.y = piece.rot
          scene.add(model)
        }
        setState('ready')
      })
      .catch(() => {
        if (!disposed) setState('error')
      })

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      controls.removeEventListener('start', onStart)
      controls.dispose()
      ro?.disconnect()
      renderer.dispose()
      renderer.domElement.remove()
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.geometry?.dispose()
        const material = mesh.material
        const list = Array.isArray(material) ? material : [material]
        for (const item of list) {
          if (!item) continue
          for (const value of Object.values(item)) {
            if (value instanceof THREE.Texture) value.dispose()
          }
          item.dispose()
        }
      })
      scene.clear()
    }
  }, [])

  return (
    <div className="yl-space-wrap">
      <div ref={hostRef} className="yl-space-host" role="img" aria-label="一场巡游示意，可拖动转换视角" />
      {state !== 'ready' ? (
        <p className="yl-space-status" role="status">
          {state === 'error' ? '这场模型没有载入。' : '一场模型载入中…'}
        </p>
      ) : null}
    </div>
  )
}
