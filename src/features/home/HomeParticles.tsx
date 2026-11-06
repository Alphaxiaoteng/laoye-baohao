import { useEffect, useRef, useState } from 'react'

const COUNT = 50
const SPEED = 0.12

/**
 * 暖纸底上的慢速墨色粒子。减少动态时不挂载 canvas。
 */
export default function HomeParticles() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setLive(true)
  }, [])

  useEffect(() => {
    if (!live) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    type Dot = { x: number; y: number; vx: number; vy: number; r: number; a: number }
    const dots: Dot[] = []
    for (let i = 0; i < COUNT; i += 1) {
      dots.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: 0.6 + Math.random() * 1.4,
        a: 0.04 + Math.random() * 0.08,
      })
    }

    let raf = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const parent = canvas.parentElement
      const w = parent?.clientWidth ?? window.innerWidth
      const h = parent?.clientHeight ?? window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const step = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w < 1 || h < 1) {
        raf = requestAnimationFrame(step)
        return
      }
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        d.x += d.vx / w
        d.y += d.vy / h
        if (d.x < 0) d.x += 1
        if (d.x > 1) d.x -= 1
        if (d.y < 0) d.y += 1
        if (d.y > 1) d.y -= 1
        ctx.beginPath()
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(36, 28, 23, ${d.a})`
        ctx.fill()
      }
      raf = requestAnimationFrame(step)
    }

    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [live])

  if (!live) return null

  return (
    <canvas
      ref={ref}
      className="home-particles"
      aria-hidden="true"
    />
  )
}
