import { useEffect, useState } from 'react'
import type { RecipeStep } from '../types/content'
import { isPlaceholderText } from '../lib/content'

interface Props {
  recipeName: string
  steps: RecipeStep[]
  safety?: string[]
  /** 步骤变化回调，用于同步"问一问"的上下文 */
  onStepChange?: (index: number) => void
  onComplete?: () => void
}

function mmss(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * 食谱分步 GUI：上一步 / 下一步 / 可选计时。
 * 计时只是提示，不代表食物已熟；占位步骤不允许当作操作指导。
 */
export default function StepPager({ recipeName, steps, safety = [], onStepChange, onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const total = steps.length
  const step = steps[index]
  const isLast = index === total - 1

  useEffect(() => {
    setRemaining(null)
  }, [index])

  useEffect(() => {
    if (remaining === null || remaining <= 0) return undefined
    const timer = setTimeout(() => {
      setRemaining((r) => (r === null ? null : r - 1))
    }, 1000)
    return () => clearTimeout(timer)
  }, [remaining])

  if (total === 0) {
    return (
      <div className="card">
        <p className="text-sm text-ink-soft">该食谱还没有可展示的步骤。</p>
      </div>
    )
  }

  function goPrev() {
    if (index === 0) return
    const next = index - 1
    setIndex(next)
    onStepChange?.(next)
  }

  function goNext() {
    if (isLast) {
      setDone(true)
      onComplete?.()
      return
    }
    const next = index + 1
    setIndex(next)
    onStepChange?.(next)
  }

  const stepPlaceholder = isPlaceholderText(step?.text)
  const timerReady = !stepPlaceholder && typeof step?.durationSec === 'number' && step.durationSec > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          第 <span className="font-medium text-ink">{index + 1}</span> / {total} 步
        </p>
        <button type="button" className="btn-quiet !min-h-[38px] !px-3 !text-sm" onClick={() => setShowAll((v) => !v)}>
          {showAll ? '收起全部步骤' : '查看全部步骤'}
        </button>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-line/70"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label={`${recipeName} 步骤进度`}
      >
        <div
          className="h-full rounded-full bg-brick transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {showAll ? (
        <ol className="card list-decimal space-y-1 pl-8 text-sm text-ink-soft">
          {steps.map((s, i) => (
            <li key={i} aria-current={i === index ? 'step' : undefined}>
              <button
                type="button"
                className={i === index ? 'font-medium text-brick underline' : 'hover:underline'}
                onClick={() => {
                  setIndex(i)
                  onStepChange?.(i)
                }}
              >
                {s.text}
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      {done ? (
        <div className="card space-y-3" role="status">
          <h3 className="section-title">已完成浏览</h3>
          <p className="text-sm leading-6 text-ink-soft">
            你查看了《{recipeName}》的全部 {total} 步。展馆里浏览步骤不等于真的做过这道菜，手记也只会记成"了解制作"。
          </p>
          {safety.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-ink">安全提醒</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {safety.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-sm text-ink-soft">
            想追问某一步为什么这样做，可以打开右下角的「问一问」。
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDone(false)
                setIndex(0)
                onStepChange?.(0)
              }}
            >
              再看一遍
            </button>
          </div>
        </div>
      ) : (
        <div className="card space-y-4" aria-live="polite">
          <h3 className="sr-only">第 {index + 1} 步</h3>

          {stepPlaceholder ? (
            <p className="rounded-xl border border-brick/30 bg-brick/5 px-3 py-2 text-sm text-brick">
              该步骤内容待补充可靠来源，不能据此操作。
            </p>
          ) : null}

          <p className="text-lg leading-8 text-ink">{step?.text}</p>

          {step?.note ? <p className="text-sm text-muted">{step.note}</p> : null}

          {step?.ingredients && step.ingredients.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">本步食材：</span>
              {step.ingredients.map((name) => (
                <span key={name} className="chip">
                  {name}
                </span>
              ))}
            </div>
          ) : null}

          {timerReady ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className={remaining !== null && remaining > 0 ? 'btn-secondary' : 'btn-primary'}
                  onClick={() => {
                    if (remaining !== null && remaining > 0) {
                      setRemaining(null)
                    } else {
                      setRemaining(step?.durationSec ?? 0)
                    }
                  }}
                >
                  {remaining === null
                    ? `开始计时（${mmss(step?.durationSec ?? 0)}）`
                    : remaining > 0
                      ? `停止计时（剩 ${mmss(remaining)}）`
                      : '计时结束'}
                </button>
                {remaining !== null ? (
                  <span className="text-sm text-ink-soft" aria-live="polite">
                    剩余 {mmss(Math.max(remaining, 0))}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted">
                计时仅作提示，不代表食物已熟；请按实际火候、熟度与温度判断。
                {remaining === 0 ? ' 计时结束，也请继续检查熟度。' : ''}
              </p>
            </div>
          ) : null}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-secondary" onClick={goPrev} disabled={index === 0 || done}>
          上一步
        </button>
        <button type="button" className="btn-primary" onClick={goNext} disabled={done}>
          {isLast ? '查看完成提示' : '下一步'}
        </button>
      </div>

      {safety.length > 0 && !done ? (
        <div className="rounded-xl border border-amber-600/30 bg-amber-50/60 px-3 py-2 text-sm text-amber-900">
          <span className="font-medium">安全提醒：</span>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {safety.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
