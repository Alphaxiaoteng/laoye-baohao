import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'

// TODO calibration: validate these crop centers against the source panorama in the browser.
const TOUR_STOPS = [0, 38, 62, 100] as const
const TOUR_INTERVAL = 4000

export function useHeroTour(rootRef: RefObject<HTMLElement | null>) {
  const [index, setIndex] = useState(0)
  const [position, setPosition] = useState<number>(TOUR_STOPS[0])
  const timeline = useRef<gsap.core.Tween | null>(null)
  const pauseTimer = useRef<number | null>(null)
  const intervalTimer = useRef<number | null>(null)
  const interactionPause = useRef(false)
  const reducedMotion = useRef(false)

  const clearTimers = useCallback(() => {
    if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current)
    if (intervalTimer.current !== null) window.clearInterval(intervalTimer.current)
    pauseTimer.current = null
    intervalTimer.current = null
  }, [])

  const select = useCallback((next: number) => {
    const safeIndex = Math.max(0, Math.min(TOUR_STOPS.length - 1, next))
    setIndex(safeIndex)
    const img = rootRef.current?.querySelector<HTMLImageElement>('.home-intro-panorama img')
    timeline.current?.kill()
    if (img && !reducedMotion.current) {
      timeline.current = gsap.to(img, {
        '--tour-x': `${TOUR_STOPS[safeIndex]}%`,
        duration: 1.5,
        ease: 'cubic-bezier(.66,0,0,1)',
        onUpdate: () => setPosition(TOUR_STOPS[safeIndex]),
      })
    }
    setPosition(TOUR_STOPS[safeIndex])
  }, [rootRef])

  const pause = useCallback(() => {
    interactionPause.current = true
    clearTimers()
    timeline.current?.pause()
  }, [clearTimers])

  const resumeLater = useCallback(() => {
    interactionPause.current = true
    clearTimers()
    pauseTimer.current = window.setTimeout(() => {
      interactionPause.current = false
      timeline.current?.resume()
    }, 6000)
  }, [clearTimers])

  useEffect(() => {
    const root = rootRef.current
    const img = root?.querySelector<HTMLImageElement>('.home-intro-panorama img')
    if (!root || !img) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.current = media.matches
    img.style.setProperty('--tour-x', `${TOUR_STOPS[0]}%`)
    img.style.objectPosition = 'var(--tour-x) 50%'
    if (media.matches) return

    let disposed = false
    const tick = () => {
      if (disposed || interactionPause.current || document.hidden) return
      setIndex((current) => {
        const next = (current + 1) % TOUR_STOPS.length
        timeline.current?.kill()
        timeline.current = gsap.to(img, {
          '--tour-x': `${TOUR_STOPS[next]}%`,
          duration: 1.5,
          ease: 'cubic-bezier(.66,0,0,1)',
          onUpdate: () => setPosition(TOUR_STOPS[next]),
        })
        setPosition(TOUR_STOPS[next])
        return next
      })
    }
    intervalTimer.current = window.setInterval(tick, TOUR_INTERVAL)
    const visibility = () => {
      if (document.hidden) {
        clearTimers()
        timeline.current?.pause()
      } else if (!interactionPause.current) {
        timeline.current?.resume()
        intervalTimer.current = window.setInterval(tick, TOUR_INTERVAL)
      }
    }
    const hover = () => pause()
    const leave = () => resumeLater()
    root.addEventListener('pointerenter', hover)
    root.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      disposed = true
      clearTimers()
      timeline.current?.kill()
      timeline.current = null
      root.removeEventListener('pointerenter', hover)
      root.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [clearTimers, pause, resumeLater, rootRef])

  return { index, select, progressKey: `${index}-${position}`, position, pause, resumeLater }
}
