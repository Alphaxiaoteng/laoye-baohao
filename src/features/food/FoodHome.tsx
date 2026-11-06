import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgressStore } from '../../store/progress'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { buildFoodStage, type FoodDish } from './foodStage'
import { stepLabel } from './lib/steps'
import './food-home.css'

const STEP_MS = 3200

function frameOf(dish: FoodDish, index: number) {
  return dish.frames[index] ?? null
}

/** 美食模块专属首页：/museum/food */
export default function FoodHome() {
  const visitModule = useProgressStore((s) => s.visitModule)
  const dishes = useMemo(() => buildFoodStage(), [])
  const [activeId, setActiveId] = useState(dishes[0]?.id ?? '')
  const [step, setStep] = useState(0)
  const [held, setHeld] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [stepFocused, setStepFocused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const remaining = useRef(STEP_MS)
  const active = dishes.find((dish) => dish.id === activeId) ?? dishes[0]
  const activeIndex = Math.max(0, dishes.findIndex((dish) => dish.id === active?.id))
  const total = active?.frames.length ?? 0
  const frame = active && total > 0 ? frameOf(active, step) : null
  const showStill = reduceMotion && !held
  const picture = active
    ? showStill
      ? { src: active.still, alt: active.alt, text: '' }
      : frame
        ? { src: frame.src, alt: frame.text, text: frame.text }
        : { src: active.still, alt: active.alt, text: '' }
    : null
  const playing = Boolean(active) && total > 1 && !reduceMotion && !held && !hovering && !stepFocused

  usePageTitle('潮汕美食')
  usePageContext({
    module: 'food',
    moduleTitle: '潮汕美食',
    entryId: active?.id,
    entryTitle: active?.title,
    step: frame && !showStill ? step + 1 : undefined,
    stepLabel: frame && !showStill ? stepLabel(frame.text, step) : undefined,
  })

  useEffect(() => {
    visitModule('food')
  }, [visitModule])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      remaining.current = STEP_MS
      setHeld(false)
      setStep(0)
    }
  }, [reduceMotion])

  useEffect(() => {
    const thumb = document.getElementById(`food-thumb-${activeId}`)
    const scroller = thumb?.parentElement
    if (!thumb || !scroller) return
    const left = thumb.offsetLeft - scroller.clientWidth / 2 + thumb.clientWidth / 2
    scroller.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [activeId, reduceMotion])

  useEffect(() => {
    remaining.current = STEP_MS
  }, [active?.id])

  useEffect(() => {
    if (!playing || !active) return undefined
    const wait = remaining.current > 0 ? remaining.current : STEP_MS
    const started = performance.now()
    let finished = false
    const id = window.setTimeout(() => {
      finished = true
      remaining.current = STEP_MS
      setStep((current) => (current + 1) % active.frames.length)
    }, wait)
    return () => {
      window.clearTimeout(id)
      if (!finished) remaining.current = Math.max(48, wait - (performance.now() - started))
    }
  }, [playing, active, step])

  function selectDish(id: string) {
    remaining.current = STEP_MS
    setActiveId(id)
    setStep(0)
    setHeld(false)
  }

  function stepDish(delta: number) {
    const next = dishes[activeIndex + delta]
    if (!next) return
    selectDish(next.id)
    document.getElementById(`food-thumb-${next.id}`)?.focus()
  }

  function pinStep(index: number) {
    remaining.current = STEP_MS
    setStep(index)
    setHeld(true)
  }

  const meterClass = held ? 'is-held' : playing ? 'is-run' : 'is-paused'

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/museum" className="link-inline">
          文化馆
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>潮汕美食</span>
      </nav>

      <h1 className="mt-4 font-serif text-2xl font-semibold text-ink">潮汕美食</h1>

      {dishes.length === 0 || !active || !picture ? (
        <p className="card mt-6 text-sm text-ink-soft">暂无可展示的菜品。</p>
      ) : (
        <>
          <div
            className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="菜品"
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
              event.preventDefault()
              stepDish(event.key === 'ArrowRight' ? 1 : -1)
            }}
          >
            {dishes.map((dish) => {
              const selected = dish.id === active.id
              return (
                <button
                  key={dish.id}
                  id={`food-thumb-${dish.id}`}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectDish(dish.id)}
                  className="w-24 shrink-0 text-center"
                >
                  <span
                    className={[
                      'block overflow-hidden rounded-xl bg-white p-1',
                      selected ? 'ring-2 ring-coral' : 'ring-1 ring-white/20',
                    ].join(' ')}
                  >
                    <img src={dish.still} alt="" className="aspect-square w-full object-contain" />
                  </span>
                  <span
                    className={[
                      'mt-1 line-clamp-2 text-xs leading-4',
                      selected ? 'text-ink' : 'text-muted',
                    ].join(' ')}
                  >
                    {dish.title}
                  </span>
                </button>
              )
            })}
          </div>

          <figure
            className="mx-auto mt-5 w-full max-w-[min(640px,70vh)]"
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setHovering(true)
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') setHovering(false)
            }}
          >
            <img
              key={picture.src}
              src={picture.src}
              alt={picture.alt}
              width={1248}
              height={1248}
              className="food-stage-img aspect-square w-full rounded-[28px] bg-white object-contain"
            />
            {total > 1 && !showStill ? (
              <div
                className="food-step-meter mt-3"
                style={{ ['--food-step-ms' as string]: `${STEP_MS}ms` }}
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={total}
                aria-valuenow={step + 1}
                aria-label={`${active.title} 步骤进度`}
              >
                <span key={`${active.id}-${step}`} className={meterClass} />
              </div>
            ) : null}
            <figcaption className="mt-3 text-center font-serif text-xl text-ink">{active.title}</figcaption>
          </figure>

          {picture.text ? (
            <p className="mx-auto mt-3 max-w-[640px] text-center text-sm leading-6 text-ink-soft">{picture.text}</p>
          ) : null}

          {total > 1 && !reduceMotion ? (
            <div className="mt-3 text-center">
              <button
                type="button"
                className="btn-quiet !min-h-[44px] !px-4 !text-sm"
                aria-pressed={held}
                onClick={() => {
                  remaining.current = STEP_MS
                  setHeld((value) => !value)
                }}
              >
                {held ? '继续' : '暂停'}
              </button>
            </div>
          ) : null}

          {total > 0 ? (
            <div
              className="mx-auto mt-4 flex max-w-[640px] gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label={`${active.title}的步骤`}
              onFocus={() => setStepFocused(true)}
              onBlur={(event) => {
                const next = event.relatedTarget
                if (next instanceof Node && event.currentTarget.contains(next)) return
                setStepFocused(false)
              }}
            >
              {active.frames.map((item, index) => {
                const selected = !showStill && step === index
                return (
                  <button
                    key={item.src}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`第 ${index + 1} 步：${item.text}`}
                    onClick={() => pinStep(index)}
                    className={[
                      'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white p-1',
                      selected ? 'ring-2 ring-coral' : 'ring-1 ring-white/15',
                    ].join(' ')}
                  >
                    <img src={item.src} alt="" className="h-full w-full object-contain" />
                    <span className="absolute bottom-1 left-1 rounded bg-ink/80 px-1 text-[10px] leading-4 text-white">
                      {index + 1}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
