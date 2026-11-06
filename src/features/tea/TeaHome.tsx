import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { entryById } from '../../lib/content'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { useProgressStore } from '../../store/progress'
import TeaScene from './TeaScene'
import SoundToggle from './SoundToggle'
import { useBrewFlow } from './useBrewFlow'
import { useBrewKeyboard } from './useBrewKeyboard'
import { BREW_STEPS, STEP_COUNT, stepLabel } from './steps'

const CULTURE = [
  { id: 'tea-intro', label: '名录' },
  { id: 'tea-spread', label: '流传' },
  { id: 'tea-ware', label: '茶具' },
  { id: 'tea-steps', label: '环节' },
  { id: 'tea-pour', label: '分茶' },
] as const

/** 器物热区：点哪个器物就跳到那一步，并接管（暂停）自动演示 */
const HOTSPOTS = [
  { part: 'leaf', className: 'hot-leaf', target: 1 },
  { part: 'pot', className: 'hot-pot', target: 2 },
  { part: 'cups', className: 'hot-cups', target: 3 },
]

/**
 * /museum/tea 单页演示。
 * 一键「开始演示」后五步自己走完，不再一步一步点；中间可以暂停 / 继续 / 重置。
 * 茶壶、茶荷、茶杯上仍有点击热区，点器物就直接跳到那一步并停下，交给用户自己看。
 */
export default function TeaHome() {
  const visitModule = useProgressStore((s) => s.visitModule)
  const flow = useBrewFlow('tea:brew')
  const [cultureId, setCultureId] = useState<(typeof CULTURE)[number]['id']>('tea-intro')
  const started = useRef(false)

  usePageTitle('工夫茶')
  usePageContext({
    module: 'tea',
    moduleTitle: '工夫茶',
    step: flow.done ? STEP_COUNT : flow.stepIndex + 1,
    stepLabel: stepLabel(flow.stepIndex, flow.done),
  })
  useBrewKeyboard(flow.next, flow.prev, flow.reset)

  useEffect(() => {
    visitModule('tea')
  }, [visitModule])

  useEffect(() => {
    if (started.current) return
    started.current = true
    flow.startAuto()
  }, [flow.startAuto])

  // 只给当前步骤真正在动的器物加提示柔光，避免三个热区同时闪
  const hintParts =
    flow.stepIndex <= 1 ? ['pot', 'leaf'] : flow.stepIndex === 2 ? ['pot'] : flow.stepIndex === 3 ? ['pot', 'cups'] : ['cups']
  const hint = (part: string) => (hintParts.includes(part) ? 'is-hint' : '')

  const primaryLabel = flow.done
    ? '再演一次'
    : flow.auto
      ? '暂停'
      : flow.stepIndex === 0
        ? '开始演示'
        : '继续演示'

  return (
    <div className="space-y-10">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/museum" className="link-inline">
          文化馆
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>工夫茶</span>
      </nav>

      <header className="max-w-xl">
        <h1 className="font-serif text-[30px] font-semibold leading-tight text-ink sm:text-[40px]">工夫茶</h1>
        <p className="mt-3 text-[15px] leading-7 text-muted">
          进页面就走完五步，点器物可跳步。
          <Link to="/docs#doc-tea" className="link-inline ml-2">
            考据在历史介绍
          </Link>
        </p>
      </header>

      <section aria-label="冲茶演示" className="tea-single">
        <div className="tea-layout">
          <div className="tea-stage-panel">
            <div className="tea-interactive-wrap">
            <TeaScene
              step={flow.step}
              stepIndex={flow.stepIndex}
              done={flow.done}
              look="real"
              showTitle={false}
            />
            {HOTSPOTS.map((spot) => (
              <button
                key={spot.part}
                type="button"
                className={`tea-hotspot ${spot.className} ${hint(spot.part)}`}
                onClick={() => flow.gotoStep(spot.target)}
                aria-label={`跳到第 ${spot.target + 1} 步：${BREW_STEPS[spot.target].title}`}
              />
            ))}
            </div>
          </div>
        </div>

        <div className="tea-panel tea-dock">
          <div className="tea-dock-row">
            <button
              type="button"
              className="tea-btn tea-btn-primary tea-dock-play"
              onClick={flow.toggleAuto}
              aria-pressed={flow.auto}
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              className="tea-btn tea-btn-ghost"
              onClick={flow.reset}
              disabled={flow.stepIndex === 0 && !flow.done && !flow.auto}
            >
              重置
            </button>
            <div
              className="tea-progress"
              role="img"
              aria-label={flow.done ? '五步已走完' : `第 ${flow.stepIndex + 1} 步，共 ${STEP_COUNT} 步`}
            >
              {BREW_STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={[
                    'tea-progress-dot',
                    flow.done || i < flow.stepIndex ? 'is-done' : i === flow.stepIndex ? 'is-current' : '',
                  ].join(' ')}
                />
              ))}
            </div>
            <div role="status" aria-live="polite" className="tea-dock-status">
              <h2 className="tea-dock-title">{flow.done ? '五步演示完成' : flow.step.title}</h2>
              {flow.done ? null : <p className="tea-dock-tip">{flow.step.tip}</p>}
            </div>
          </div>

          <div className="tea-dock-sound">
            <SoundToggle quiet />
          </div>
        </div>
      </section>

      <TeaCulture activeId={cultureId} onChange={setCultureId} />
    </div>
  )
}

function TeaCulture({
  activeId,
  onChange,
}: {
  activeId: (typeof CULTURE)[number]['id']
  onChange: (id: (typeof CULTURE)[number]['id']) => void
}) {
  const active = entryById(activeId)
  return (
    <section aria-labelledby="tea-culture-title" className="tea-culture">
      <h2 id="tea-culture-title" className="section-title">
        茶文化
      </h2>
      <div className="tea-culture-tabs" role="tablist" aria-label="茶文化">
        {CULTURE.map((item) => {
          const on = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={on ? 'is-on' : undefined}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {active ? (
        <article className="tea-culture-panel" role="tabpanel">
          <h3>{active.title}</h3>
          {active.summary ? <p>{active.summary}</p> : null}
          <Link to="/docs#doc-tea" className="link-inline">
            在历史介绍里看原文
          </Link>
        </article>
      ) : null}
    </section>
  )
}
