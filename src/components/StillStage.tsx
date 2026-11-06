import { useEffect, useMemo, useState } from 'react'
import './StillStage.css'
import type { StillFrame } from './StillStage.types'

export type { StillFrame } from './StillStage.types'

const AUTO_MS = 4200

function useSlidesPerView() {
  const [n, setN] = useState(3)
  useEffect(() => {
    const q = window.matchMedia('(max-width: 640px)')
    const sync = () => setN(q.matches ? 1 : 3)
    sync()
    q.addEventListener('change', sync)
    return () => q.removeEventListener('change', sync)
  }, [])
  return n
}

/**
 * 横向实拍带：大屏一屏三列，小屏单列；自动向左换列；左右按钮；悬停或减少动态时暂停。
 */
export default function StillStage({
  frames,
  onChange,
}: {
  frames: StillFrame[]
  onChange?: (frame: StillFrame) => void
}) {
  const slidesPerView = useSlidesPerView()
  const [hover, setHover] = useState(false)
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [trackIndex, setTrackIndex] = useState(0)
  const [noTrans, setNoTrans] = useState(false)

  const n = frames.length
  const slidePct = 100 / slidesPerView

  const loopFrames = useMemo(() => {
    if (n < 2) return frames
    return [...frames, ...frames, ...frames]
  }, [frames, n])

  useEffect(() => {
    if (n < 2) {
      setTrackIndex(0)
      return
    }
    setTrackIndex(n)
  }, [n, frames, slidesPerView])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (n < 2 || reduced || hover) return undefined
    const id = window.setInterval(() => {
      setTrackIndex((i) => i + 1)
    }, AUTO_MS)
    return () => clearInterval(id)
  }, [n, reduced, hover])

  const logical = n >= 2 ? trackIndex % n : 0
  useEffect(() => {
    if (frames[logical]) onChange?.(frames[logical]!)
  }, [logical, frames, onChange])

  const onTransEnd = () => {
    if (n < 2) return
    if (trackIndex >= n * 2) {
      setNoTrans(true)
      setTrackIndex((i) => i - n)
      requestAnimationFrame(() => setNoTrans(false))
    } else if (trackIndex < n) {
      setNoTrans(true)
      setTrackIndex((i) => i + n)
      requestAnimationFrame(() => setNoTrans(false))
    }
  }

  function step(delta: number) {
    if (n < 2) return
    setTrackIndex((i) => i + delta)
  }

  if (n === 0) return null

  if (n === 1) {
    const only = frames[0]!
    return (
      <div className="still-film still-film--single">
        <div className="still-film-viewport">
          <div className="still-film-track still-film-track--single">
            <div className="still-film-slide">
              <img src={only.src} alt={only.alt} style={{ objectPosition: only.focus ?? 'center' }} />
              <p className="still-film-cap">{only.caption}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const offsetPct = trackIndex * slidePct

  return (
    <div
      className="still-film"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="still-film-chrome">
        <button type="button" className="still-film-nav" aria-label="上一列" onClick={() => step(-1)}>
          ‹
        </button>
        <button type="button" className="still-film-nav" aria-label="下一列" onClick={() => step(1)}>
          ›
        </button>
      </div>
      <div className="still-film-viewport">
        <div
          className={['still-film-track', noTrans ? 'is-no-trans' : ''].filter(Boolean).join(' ')}
          style={{ transform: `translate3d(-${offsetPct}%,0,0)` }}
          onTransitionEnd={onTransEnd}
        >
          {loopFrames.map((frame, i) => (
            <div
              key={`${frame.id}-${i}`}
              className="still-film-slide"
              style={{ flexBasis: `${slidePct}%` }}
            >
              <img
                src={frame.src}
                alt={frame.alt}
                style={{ objectPosition: frame.focus ?? 'center' }}
                loading="lazy"
              />
              <p className="still-film-cap">{frame.caption}</p>
            </div>
          ))}
        </div>
      </div>
      {reduced ? (
        <p className="still-film-note" role="status">
          系统设置了减少动态，不自动换列；可用左右按钮切换。
        </p>
      ) : null}
    </div>
  )
}
