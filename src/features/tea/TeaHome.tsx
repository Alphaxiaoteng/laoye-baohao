import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  entriesOfModule,
  entryById,
  entryHref,
  moduleConfig,
  sourcesOfModule,
} from '../../lib/content'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { useProgressStore } from '../../store/progress'
import VerifyBadge from '../../components/VerifyBadge'
import { SourceList } from '../../components/SourceBadge'
import TeaScene from './TeaScene'
import SoundToggle from './SoundToggle'
import { useBrewFlow } from './useBrewFlow'
import { useBrewKeyboard } from './useBrewKeyboard'
import { BREW_STEPS, STEP_COUNT, stepLabel } from './steps'

const FOCUS_ENTRY_IDS = ['tea-ware', 'tea-steps', 'tea-pour']

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
  const config = moduleConfig('tea')
  const list = entriesOfModule('tea')
  const modSources = sourcesOfModule('tea')
  const visitModule = useProgressStore((s) => s.visitModule)
  const flow = useBrewFlow('tea:brew')

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

  const focus = FOCUS_ENTRY_IDS.map((id) => entryById(id)).filter(
    (entry): entry is NonNullable<typeof entry> => Boolean(entry),
  )

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

      <header className="space-y-4">
        <div className="max-w-3xl space-y-3">
          <p className="text-sm tracking-[0.2em] text-brick">潮州工夫茶艺</p>
          <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">工夫茶</h1>
          <p className="max-w-2xl text-[15px] leading-7 text-ink-soft">{config?.intro}</p>
          <p className="text-xs leading-6 text-muted">
            点一下「开始演示」，五步会自己按顺序走完；想细看某一步，点茶壶、茶荷或茶杯就能跳过去。
            茶具与环节只取自条目里登记的来源；来源没给的规格、时长与温度，这里不补。
          </p>
        </div>
      </header>

      <section aria-label="冲茶演示" className="tea-single">
        <div className="space-y-3">
          <div className="tea-playbar">
            <button
              type="button"
              className="tea-btn tea-btn-primary tea-play-btn"
              onClick={flow.toggleAuto}
              aria-pressed={flow.auto}
            >
              {primaryLabel}
            </button>
            {flow.stepIndex > 0 || flow.done ? (
              <button type="button" className="tea-btn tea-btn-ghost" onClick={flow.reset}>
                重置
              </button>
            ) : null}
          </div>

          <div className="tea-stage-panel tea-interactive-wrap relative">
            <TeaScene step={flow.step} stepIndex={flow.stepIndex} done={flow.done} />
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

        <div className="tea-panel">
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

          <div role="status" aria-live="polite" className="mt-4 space-y-2">
            {flow.done ? (
              <>
                <h2 className="font-serif text-2xl text-ink">五步演示完成</h2>
                <p className="text-sm leading-6 text-ink-soft">
                  这只是把来源页记录的环节按顺序翻了一遍，不代表你已经完成一次真实冲泡。
                </p>
                <p className="text-xs leading-5 text-muted">
                  项目页把冲泡拆成二十余个环节；站内演示只选了其中五组，未给出时长、水温与次数。
                </p>
              </>
            ) : (
              <>
                <h2 className="font-serif text-2xl text-ink">{flow.step.title}</h2>
                <p className="text-sm leading-6 text-ink-soft">{flow.step.tip}</p>
                <p className="tea-source-note">项目页对应环节：{flow.step.sourceStage}</p>
              </>
            )}
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <SoundToggle />
          </div>
        </div>
      </section>

      <p className="text-xs leading-5 text-muted">
        演示步骤依据条目
        <Link to="/museum/tea/tea-steps" className="link-inline mx-1">
          「冲泡环节示例（据项目页）」
        </Link>
        （来源 S2）；未给出时长、水温与次数。想用摄像头手势体验，可到
        <Link to="/museum/tea/gesture" className="link-inline mx-1">
          手势实验页
        </Link>
        ，完全可选。
      </p>

      {focus.length > 0 ? (
        <section aria-labelledby="focus-title" className="space-y-3">
          <h2 id="focus-title" className="section-title">
            茶具与步骤
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {focus.map((entry) => (
              <article key={entry.id} className="card flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base text-ink">{entry.title}</h3>
                  <VerifyBadge verify={entry.verify} compact />
                </div>
                <p className="flex-1 text-sm leading-6 text-ink-soft">
                  {entry.summary || '内容待补充可靠来源'}
                </p>
                {entry.region ? <p className="text-xs text-muted">范围：{entry.region}</p> : null}
                <Link to={entryHref(entry)} className="link-inline text-sm">
                  读这一条
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="entries-title" className="space-y-3">
        <h2 id="entries-title" className="section-title">
          本模块条目
        </h2>
        {list.length === 0 ? (
          <div className="card">
            <p className="text-sm text-ink-soft">
              这个模块还没有可展示的条目（content/entries.tea.json 里没有内容）。
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line">
            {list.map((entry) => (
              <li key={entry.id}>
                <Link
                  to={entryHref(entry)}
                  className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 no-underline transition-colors hover:bg-hover"
                >
                  <span className="max-w-2xl">
                    <span className="block font-serif text-base text-ink">{entry.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      {entry.summary || '内容待补充可靠来源'}
                    </span>
                  </span>
                  <VerifyBadge verify={entry.verify} compact />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted">
          每条内容都标注来源编号与核验状态；未完成本地文化审核的条目会显示相应徽标。
        </p>
      </section>

      <section aria-labelledby="sources-title" className="space-y-3">
        <h2 id="sources-title" className="section-title">
          本模块来源
        </h2>
        <div className="card">
          <SourceList ids={modSources.map((source) => source.id)} />
          <p className="mt-3 text-xs text-muted">
            完整来源表与访问日期见
            <Link to="/sources" className="link-inline mx-1">
              资料来源
            </Link>
            页。
          </p>
        </div>
      </section>
    </div>
  )
}
