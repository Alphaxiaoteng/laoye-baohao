import { useState } from 'react'
import { Link } from 'react-router-dom'
import { entryById, entryHref } from '../../lib/content'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { SourceBadges } from '../../components/SourceBadge'
import VerifyBadge from '../../components/VerifyBadge'
import Breadcrumb from './components/Breadcrumb'
import ProcessionFigure from './components/ProcessionFigure'
import { PROCESSION_PARTS } from './data'

const MODULE_TITLE = '营老爷·游神'

/**
 * /museum/yinglaoye/procession
 * 队伍示意：SVG 可点，配同一组按钮；每个部分只展示已登记来源的条目。
 */
export default function ProcessionPage() {
  const [selectedId, setSelectedId] = useState(PROCESSION_PARTS[0]?.id ?? '')
  const selectedIndex = Math.max(
    0,
    PROCESSION_PARTS.findIndex((p) => p.id === selectedId),
  )
  const part = PROCESSION_PARTS[selectedIndex] ?? PROCESSION_PARTS[0]
  const partEntries = (part?.entries ?? []).flatMap((id) => {
    const entry = entryById(id)
    return entry ? [entry] : []
  })
  const partSourceIds = Array.from(new Set(partEntries.flatMap((e) => e.sourceIds ?? [])))

  usePageTitle('队伍示意')
  usePageContext({
    module: 'yinglaoye',
    moduleTitle: MODULE_TITLE,
    step: selectedIndex + 1,
    stepLabel: part?.label,
  })

  return (
    <div className="space-y-8">
      <Breadcrumb current="队伍示意" />

      <header className="max-w-3xl space-y-3">
        <p className="text-xs tracking-[0.2em] text-brick">队伍示意</p>
        <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
          队伍可能由哪些部分组成
        </h1>
        <p className="text-[15px] leading-7 text-ink-soft">
          下面这张图是本站自绘的示例组合，不是某一村的标准队列，也不按真实先后排列。
          点图中的部分，或点下方的按钮，看来源里对应的写法。
        </p>
        <p className="rounded-xl border border-brick/30 bg-brick/5 px-3 py-2 text-sm leading-6 text-brick">
          示例组合，不代表各地都有英歌或相同顺序；组成和次序因村、因年份而异。
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div className="card min-w-0 space-y-4">
          <ProcessionFigure selectedId={selectedId} onSelect={setSelectedId} />

          <div role="group" aria-label="选择队伍组成部分" className="flex flex-wrap gap-2">
            {PROCESSION_PARTS.map((item) => {
              const active = item.id === selectedId
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedId(item.id)}
                  className={[
                    'inline-flex min-h-[44px] items-center gap-1 rounded-full border px-4 py-2 text-sm transition-colors',
                    active
                      ? 'border-brick bg-brick text-cream'
                      : 'border-line bg-white/70 text-ink-soft hover:border-brick/50 hover:text-brick',
                  ].join(' ')}
                >
                  {item.label}
                  {item.optional ? (
                    <span
                      className={[
                        'rounded-full px-1.5 text-[11px] leading-5',
                        active ? 'bg-cream/20' : 'bg-line/60 text-muted',
                      ].join(' ')}
                    >
                      有的地方
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
          <p className="text-xs leading-6 text-muted">
            键盘操作：Tab 到上面的按钮，按 Enter 或空格切换；图形本身不参与 Tab 顺序。页面没有自动播放或动画。
          </p>
        </div>

        <section
          aria-labelledby="part-title"
          aria-live="polite"
          className="card min-w-0 space-y-3 lg:sticky lg:top-4"
        >
          <p className="text-xs text-muted">
            第 {selectedIndex + 1} / {PROCESSION_PARTS.length} 项 · 点击切换
          </p>
          <h2 id="part-title" className="section-title">
            {part?.label ?? '队伍组成'}
            {part?.optional ? (
              <span className="ml-2 align-middle text-xs font-normal text-muted">有的地方才有</span>
            ) : null}
          </h2>
          <p className="text-sm leading-7 text-ink-soft">{part?.blurb}</p>

          <h3 className="pt-1 text-sm font-semibold text-ink">相关条目</h3>
          {partEntries.length === 0 ? (
            <p className="text-sm text-muted">这一部分还没有已登记来源的条目，暂时只保留示意。</p>
          ) : (
            <ul className="space-y-3">
              {partEntries.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-line bg-white/60 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Link to={entryHref(entry)} className="link-inline font-serif text-base">
                      {entry.title}
                    </Link>
                    <VerifyBadge verify={entry.verify} compact />
                  </div>
                  {entry.region ? (
                    <p className="mt-1 text-xs text-muted">范围：{entry.region}</p>
                  ) : null}
                  <p className="mt-1 text-sm leading-6 text-ink-soft">
                    {entry.summary || '内容待补充可靠来源'}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {partSourceIds.length > 0 ? (
            <div className="space-y-2 border-t border-line pt-3">
              <SourceBadges ids={partSourceIds} />
            </div>
          ) : null}

          <p className="text-xs leading-6 text-muted">
            条目都已挂来源，但仍标注「待本地审核」；页面对队伍的描述只到来源写到的程度，不补画细节。
          </p>
        </section>
      </div>

      <nav aria-label="继续浏览" className="flex flex-wrap gap-3 border-t border-line pt-5">
        <Link to="/museum/yinglaoye" className="btn-secondary">
          回模块首页
        </Link>
        <Link to="/museum/yinglaoye/cases" className="btn-quiet">
          对照地区案例
        </Link>
        <Link to="/museum/yinglaoye/ylr-team" className="btn-quiet">
          看「队伍」条目
        </Link>
      </nav>
    </div>
  )
}
