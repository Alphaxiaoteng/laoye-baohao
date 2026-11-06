import { useEffect, useState } from 'react'
import gsap from 'gsap'

type HeroPreloaderProps = { panorama: string }

/**
 * 首屏揭幕 Loader。
 *
 * 构图参考 Imaginarium 的细金环 + UNESCO 的仪式感居中题签：
 * 旋转金砂环包住馆印，下面依次是馆名小字、品牌名、计数与底部细线进度。
 * 进度条只读 `progress`，不做额外状态；减少动态时由 CSS 整块隐藏，
 * SSR 阶段没有 window，直接不渲染任何遮罩。
 */
export default function HeroPreloader({ panorama }: HeroPreloaderProps) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || sessionStorage.getItem('laoye-hero-intro')) return
    setVisible(true)

    const overlay = document.querySelector<HTMLElement>('.hero-preloader')
    const img = new Image()
    img.src = panorama
    let finished = false
    const started = performance.now()
    const tick = window.setInterval(() => {
      setProgress((value) => Math.min(90, value + Math.max(1, (90 * (performance.now() - started)) / 2200 / 45)))
    }, 45)
    const dismiss = () => {
      if (finished) return
      finished = true
      window.clearInterval(tick)
      setProgress(100)
      sessionStorage.setItem('laoye-hero-intro', '1')
      if (overlay) {
        gsap.to(overlay, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.9,
          ease: 'cubic-bezier(.66,0,0,1)',
          onComplete: () => setVisible(false),
        })
      } else setVisible(false)
    }
    img.decode().catch(() => undefined).finally(() => {
      const remaining = Math.max(0, 650 - (performance.now() - started))
      window.setTimeout(dismiss, remaining)
    })
    const cap = window.setTimeout(dismiss, 2500)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(cap)
      finished = true
    }
  }, [panorama])

  if (!visible || typeof window === 'undefined') return null
  const percent = Math.min(100, Math.max(0, Math.round(progress)))
  return (
    <div className="hero-preloader" aria-label="正在开启展览" aria-live="polite">
      <div className="hero-preloader-ring" aria-hidden="true">
        <img src="/favicon.svg" alt="" width="48" height="48" />
      </div>
      <p>老爷保号</p>
      <span className="hero-preloader-museum">CHAOSHAN LIVING ARCHIVE · 潮汕文化互动馆</span>
      <span className="hero-preloader-count">{Math.round(progress)}</span>
      <div className="hero-preloader-bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
