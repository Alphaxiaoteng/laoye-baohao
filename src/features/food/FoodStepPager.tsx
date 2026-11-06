import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Ingredient, RecipeStep } from '../../types/content'
import { isPlaceholderText } from '../../lib/content'
import { readJSON, removeKey, writeJSON } from '../../lib/storage'
import { stepImage } from './assets'
import { formatNumber, scaleAmount } from './lib/servings'
import {
  clampStepIndex,
  nextStepIndex,
  prevStepIndex,
  progressPercent,
  stepLabel,
  stepPosition,
} from './lib/steps'
import {
  formatClock,
  isStoredTimer,
  isTimerPaused,
  timerKey,
  timerPresets,
  timerRemainingSec,
  type StoredTimer,
} from './lib/timer'

interface Props {
  recipeId: string
  recipeName: string
  steps: RecipeStep[]
  /** 已按当前份量换算好的用料 */
  ingredients: Ingredient[]
  factor: number
  safety?: string[]
  allergens?: string[]
  onStepChange?: (index: number) => void
  onComplete?: () => void
}

const PRESET_HINT = '计时只是提醒，不代表食物已熟；请按实际熟度、汤温和口感判断。'

/**
 * 分步制作界面：顶部菜名与步数、主区示意图 + 短动作 + 本步食材、底部上一步/下一步与可选计时。
 * 计时以结束时间戳保存，刷新或切后台回来会按当前时间重算剩余秒数。
 */
export default function FoodStepPager({
  recipeId,
  recipeName,
  steps,
  ingredients,
  factor,
  safety = [],
  allergens = [],
  onStepChange,
  onComplete,
}: Props) {
  const total = steps.length
  const [index, setIndex] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [done, setDone] = useState(false)
  const [timerOpen, setTimerOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [timer, setTimer] = useState<StoredTimer | null>(() => {
    const stored = readJSON<unknown>(timerKey(recipeId), null)
    return isStoredTimer(stored) ? stored : null
  })

  const position = stepPosition(index, total)
  const step = steps[position.index]

  // 计时状态写回本地；组件卸载后仍然能恢复
  useEffect(() => {
    if (timer) writeJSON(timerKey(recipeId), timer)
    else removeKey(timerKey(recipeId))
  }, [recipeId, timer])

  // 只有计时在走时才每秒刷新；页面重新可见时立即按真实时间校准
  useEffect(() => {
    if (!timer || isTimerPaused(timer)) return undefined
    const tick = () => setNow(Date.now())
    const interval = window.setInterval(tick, 1000)
    const onVisible = () => tick()
    document.addEventListener('visibilitychange', onVisible)
    tick()
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [timer])

  const remainingSec = timerRemainingSec(timer, now)
  const paused = isTimerPaused(timer)
  const timerFinished = Boolean(timer) && remainingSec <= 0
  const timerStepLabel =
    timer && steps[timer.stepIndex] ? stepLabel(steps[timer.stepIndex]?.text, timer.stepIndex) : ''

  const amountByName = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of ingredients) {
      const scaled = scaleAmount(item.amount, factor)
      if (scaled) map.set(item.name, scaled)
    }
    return map
  }, [ingredients, factor])

  const image = stepImage(position.index)
  const stepPlaceholder = isPlaceholderText(step?.text)

  function goTo(next: number) {
    const safe = clampStepIndex(next, total)
    setIndex(safe)
    setDone(false)
    onStepChange?.(safe)
  }

  function startTimer(seconds: number) {
    const startedAt = Date.now()
    setNow(startedAt)
    setTimer({ stepIndex: position.index, endsAt: startedAt + seconds * 1000, durationSec: seconds })
    setTimerOpen(false)
  }

  function stopTimer() {
    setTimer(null)
    setNow(Date.now())
  }

  function handleNext() {
    if (position.isLast) {
      setDone(true)
      onComplete?.()
      return
    }
    goTo(nextStepIndex(position.index, total))
  }

  if (total === 0) {
    return (
      <div className="card">
        <p className="text-sm text-ink-soft">这份食谱还没有可展示的步骤。</p>
      </div>
    )
  }

  const presets = timerPresets(step?.durationSec)

  return (
    <div className="space-y-4">
      {/* 顶部：菜名 / 步数 / 返回 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-serif text-lg text-ink">{recipeName}</p>
          <p className="text-xs text-muted">
            第 <span className="font-medium text-ink">{position.human}</span> / {total} 步
            {timer && !timerFinished ? (
              <span className="ml-2 text-brick">
                {paused ? '已暂停' : '计时中'} · 剩 {formatClock(remainingSec)}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/museum/food" className="btn-quiet !min-h-[44px] !px-3 !text-sm">
            ← 返回美食
          </Link>
          <button
            type="button"
            className="btn-quiet !min-h-[44px] !px-3 !text-sm"
            aria-expanded={showAll}
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? '收起全部步骤' : '查看全部步骤'}
          </button>
        </div>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-line/70"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={position.human}
        aria-label={`${recipeName} 步骤进度`}
      >
        <div className="h-full rounded-full bg-brick transition-all" style={{ width: `${progressPercent(index, total)}%` }} />
      </div>

      {showAll ? (
        <ol className="card space-y-1 text-sm">
          {steps.map((item, i) => (
            <li key={i}>
              <button
                type="button"
                aria-current={i === position.index ? 'step' : undefined}
                className={
                  i === position.index
                    ? 'flex min-h-[44px] w-full items-center gap-2 rounded-lg bg-brick/10 px-2 text-left font-medium text-brick'
                    : 'flex min-h-[44px] w-full items-center gap-2 rounded-lg px-2 text-left text-ink-soft hover:bg-white/70'
                }
                onClick={() => goTo(i)}
              >
                <span className="w-6 shrink-0 text-xs text-muted">{i + 1}</span>
                <span className="min-w-0">{stepLabel(item.text, i)}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      {done ? (
        <section className="card space-y-3" role="status" aria-live="polite">
          <h3 className="section-title">已完成浏览</h3>
          <p className="text-sm leading-6 text-ink-soft">
            你查看了《{recipeName}》的全部 {total} 步。展馆里浏览步骤不等于真的做过这道菜，
            手记也只会记作「了解制作」。
          </p>
          {safety.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-ink">安全提醒</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {safety.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {allergens.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-ink">过敏原 / 饮食注意</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                {allergens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => goTo(0)}>
              再看一遍
            </button>
            <Link to="/museum/food/menu" className="btn-quiet">
              看看其他菜品
            </Link>
          </div>
        </section>
      ) : (
        <section className="card space-y-4" aria-live="polite">
          <h3 className="sr-only">
            第 {position.human} 步：{stepLabel(step?.text, position.index)}
          </h3>

          {image ? (
            <img
              src={image.src}
              alt={image.alt}
              width={480}
              height={300}
              loading="lazy"
              decoding="async"
              className="w-full rounded-xl border border-line bg-cream object-cover"
            />
          ) : null}

          {stepPlaceholder ? (
            <p className="rounded-xl border border-brick/30 bg-brick/5 px-3 py-2 text-sm text-brick">
              该步骤内容待补充可靠来源，不能据此操作。
            </p>
          ) : null}

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              第 {position.human} 步 · {stepLabel(step?.text, position.index)}
            </p>
            <p className="text-lg leading-8 text-ink">{step?.text}</p>
            {step?.note ? <p className="text-sm leading-6 text-muted">{step.note}</p> : null}
          </div>

          {step?.ingredients && step.ingredients.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">本步用料</p>
              <ul className="flex flex-wrap gap-2">
                {step.ingredients.map((name) => {
                  const amount = amountByName.get(name)
                  return (
                    <li key={name} className="chip">
                      {name}
                      {amount ? <span className="text-brick">· {amount}</span> : null}
                    </li>
                  )
                })}
              </ul>
              <p className="text-xs text-muted">
                用量按「×{formatNumber(factor)}」份量换算，工艺与火候不变。
              </p>
            </div>
          ) : null}
        </section>
      )}

      {/* 计时面板 */}
      {timer ? (
        <section
          className="rounded-2xl border border-line bg-white/70 px-4 py-3"
          aria-live="polite"
          aria-label="步骤计时"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-ink-soft">
                {timerFinished
                  ? '计时结束'
                  : `${paused ? '已暂停' : '计时中'} · 第 ${timer.stepIndex + 1} 步（${timerStepLabel}）`}
              </p>
              <p className="font-serif text-2xl text-brick">
                {timerFinished ? '0:00' : formatClock(remainingSec)}
              </p>
              <p className="text-xs text-muted">{PRESET_HINT}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!timerFinished ? (
                <button
                  type="button"
                  className="btn-secondary !min-h-[44px] !px-4 !text-sm"
                  onClick={() => {
                    const startedAt = Date.now()
                    setNow(startedAt)
                    if (paused) {
                      setTimer({
                        ...timer,
                        endsAt: startedAt + remainingSec * 1000,
                        pausedRemainingSec: undefined,
                      })
                    } else {
                      setTimer({ ...timer, pausedRemainingSec: remainingSec })
                    }
                  }}
                >
                  {paused ? '继续' : '暂停'}
                </button>
              ) : null}
              <button type="button" className="btn-quiet !min-h-[44px] !px-4 !text-sm" onClick={stopTimer}>
                结束计时
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* 底部操作栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => goTo(prevStepIndex(position.index, total))}
          disabled={position.isFirst || done}
        >
          上一步
        </button>
        <button type="button" className="btn-primary" onClick={handleNext} disabled={done}>
          {position.isLast ? '完成浏览' : '下一步'}
        </button>
        <button
          type="button"
          className={timer ? 'btn-secondary' : 'btn-quiet'}
          aria-expanded={timerOpen}
          onClick={() => setTimerOpen((value) => !value)}
        >
          {timer ? '重新计时' : '可选计时'}
        </button>
      </div>

      {!done ? <p className="text-xs leading-5 text-muted">{PRESET_HINT}</p> : null}

      {timerOpen ? (
        <section className="card space-y-3" aria-label="选择计时时长">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-serif text-base text-ink">计时提醒</h4>
            <button type="button" className="btn-quiet !min-h-[44px] !px-3 !text-sm" onClick={() => setTimerOpen(false)}>
              收起
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <li key={preset.seconds}>
                <button
                  type="button"
                  className="btn-secondary !min-h-[44px] !px-4 !text-sm"
                  onClick={() => startTimer(preset.seconds)}
                >
                  {preset.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-5 text-muted">
            {PRESET_HINT}
            {step?.durationSec
              ? ' 本步的「来源建议」是来源里写明的食用时限，不是熟度标准。'
              : ' 这里没有写死烹饪秒数，档位只是提醒，请按实际状态判断。'}
          </p>
        </section>
      ) : null}

      {safety.length > 0 && !done ? (
        <section className="rounded-xl border border-amber-600/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
          <p className="font-medium">安全提醒</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {safety.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
