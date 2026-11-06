import { useEffect, useState, type RefObject } from 'react'

/** 首页四章的锚点与短名。文案与首屏跳转链一致，不另写一套说法。 */
export const HOME_CHAPTERS = [
  { id: 'home-yingge-title', label: '英歌' },
  { id: 'home-tea-title', label: '工夫茶' },
  { id: 'home-food-title', label: '美食' },
  { id: 'home-yinglaoye-title', label: '营老爷' },
] as const

/**
 * 首页节奏，只做两件事：
 * - 全景画在纸衬上揭开：图一解码（或到点）就揭，减少动态时立刻揭开。
 * - 视口中段只标出当前这一章，供进度条使用。
 *
 * 在 `<html>` 上挂 `data-home-pacing`，离开首页就摘掉，避免别的页面被吸附。
 */
export function useHomePacing(panoramaRef: RefObject<HTMLImageElement | null>) {
  const [ready, setReady] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.homePacing = 'true'

    const finish = () => setReady(true)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const img = panoramaRef.current
    if (reduced || (img?.complete && img.naturalWidth > 0)) finish()

    const onSettle = () => finish()
    img?.addEventListener('load', onSettle)
    img?.addEventListener('error', onSettle)
    const cap = window.setTimeout(finish, 1600)

    const ratios = new Map<Element, number>()
    const articles = HOME_CHAPTERS.map((chapter) =>
      document.getElementById(chapter.id)?.closest('article'),
    ).filter((node): node is HTMLElement => node instanceof HTMLElement)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0)
        }
        let best: Element | null = null
        let bestRatio = 0
        for (const [el, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = el
            bestRatio = ratio
          }
        }
        setCurrent(best?.getAttribute('aria-labelledby') ?? null)
      },
      {
        root: null,
        rootMargin: '-18% 0px -40% 0px',
        threshold: [0, 0.15, 0.3, 0.45, 0.6],
      },
    )
    for (const article of articles) observer.observe(article)

    return () => {
      window.clearTimeout(cap)
      img?.removeEventListener('load', onSettle)
      img?.removeEventListener('error', onSettle)
      observer.disconnect()
      delete root.dataset.homePacing
    }
  }, [panoramaRef])

  return { ready, current }
}
