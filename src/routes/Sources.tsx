import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { sourceVerifyLabel, sources } from '../lib/content'
import { EXTRA_MODULE_LABELS, MODULES } from '../lib/modules'
import { usePageTitle } from '../lib/usePageContext'

export default function SourcesPage() {
  usePageTitle('资料来源')
  const location = useLocation()

  const groups = useMemo(() => {
    const order = [...MODULES.map((m) => m.id), ...Object.keys(EXTRA_MODULE_LABELS)]
    const map = new Map<string, typeof sources>()
    for (const source of sources) {
      const key = (source.module ?? '').trim() || 'other'
      const list = map.get(key) ?? []
      list.push(source)
      map.set(key, list)
    }
    const ordered: { key: string; label: string; items: typeof sources }[] = []
    for (const key of order) {
      const list = map.get(key)
      if (list && list.length > 0) {
        const label =
          MODULES.find((m) => m.id === key)?.title ?? EXTRA_MODULE_LABELS[key] ?? key
        ordered.push({ key, label, items: list })
        map.delete(key)
      }
    }
    for (const [key, list] of map) {
      ordered.push({ key, label: key === 'other' ? '未分组' : key, items: list })
    }
    return ordered
  }, [])

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (!hash) return
    const el = document.getElementById(hash)
    if (el) el.scrollIntoView({ block: 'center', behavior: 'auto' })
  }, [location.hash])

  return (
    <div className="space-y-8">
      <header className="max-w-2xl space-y-3">
        <p className="text-xs tracking-[0.3em] text-brick">资料来源</p>
        <h1 className="font-serif text-3xl text-ink">每条内容对应的公开资料</h1>
        <p className="text-[15px] leading-7 text-ink-soft">
          文化条目只从下列来源提炼原创短说明，不复制原文大段。核验状态如实标注：抓取失败的来源、
          只作索引的来源，相关的条目不会写成确定事实。
        </p>
        <p className="text-xs leading-5 text-muted">
          外部链接只作来源署名与核对入口，不是内容终点：条目正文、图示与交互都在本站本地化。
          访问日期为整理当天的记录，页面内容可能已被来源方更新。
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-xs" aria-label="核验状态说明">
        {['fetched', 'index-only', 'reference-only', 'fetch-failed'].map((key) => (
          <span key={key} className="chip">
            {sourceVerifyLabel(key)}
          </span>
        ))}
      </div>

      {sources.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-soft">来源表待登记（content/sources.json 还没有内容）。</p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.key} aria-labelledby={`src-${group.key}`} className="space-y-3">
            <h2 id={`src-${group.key}`} className="section-title">
              {group.label}
              <span className="ml-2 text-xs font-normal text-muted">{group.items.length} 条</span>
            </h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/70">
              {group.items.map((source) => (
                <li key={source.id} id={source.id} className="scroll-mt-24 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <p className="leading-7">
                        <span className="mr-2 font-mono text-xs text-brick">[{source.id}]</span>
                        {source.url ? (
                          <>
                            <span className="mr-1 text-[11px] tracking-wide text-muted">来源：</span>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-serif text-base text-ink underline decoration-line hover:decoration-brick"
                            >
                              {source.title}
                              <span aria-hidden="true" className="text-xs text-muted">
                                {'\u00A0'}↗
                              </span>
                            </a>
                          </>
                        ) : (
                          <span className="font-serif text-base text-ink">{source.title}</span>
                        )}
                      </p>
                      <dl className="grid gap-x-4 gap-y-1 text-xs text-muted sm:grid-cols-2">
                        <div>
                          <dt className="inline">机构：</dt>
                          <dd className="inline">{source.org || '未标注'}</dd>
                        </div>
                        <div>
                          <dt className="inline">访问日期：</dt>
                          <dd className="inline">{source.accessDate || '未记录'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="inline">适用地区：</dt>
                          <dd className="inline">{source.region || '未标注'}</dd>
                        </div>
                        {source.note ? (
                          <div className="sm:col-span-2">
                            <dt className="inline">许可/署名：</dt>
                            <dd className="inline">{source.note}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                    <span
                      className={[
                        'shrink-0 rounded-full border px-2.5 py-0.5 text-xs',
                        source.verify === 'fetched'
                          ? 'border-ink/25 bg-ink/10 text-ink'
                          : source.verify === 'fetch-failed'
                            ? 'border-brick/40 bg-brick/10 text-brick'
                            : 'border-line bg-white/70 text-muted',
                      ].join(' ')}
                    >
                      {sourceVerifyLabel(source.verify)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <section className="card space-y-2">
        <h2 className="section-title">媒体说明</h2>
        <p className="text-sm leading-6 text-ink-soft">
          页面里的阵形、茶具与队伍图是本站自绘的几何示意图，标注「示意图，非某地标准」。
          首页与听潮使用的实拍照片、录音均自托管，来源与许可逐条登记在下方来源表。
        </p>
        <p className="text-sm leading-6 text-ink-soft">
          听潮词条音频来自 Wikimedia Commons（CC BY-SA 4.0），已转码为 MP3 并保留原始文件。
          作者与许可信息见每条「信息」展开区及下方来源表 S500–S520。
        </p>
        <p className="text-sm text-ink-soft">
          英歌原生展（
          <a href="/exhibits/yingge/index.html" className="link-inline">
            /exhibits/yingge/
          </a>
          ）为独立静态挂载，其内部媒体与署名由原始项目提供。
        </p>
      </section>
    </div>
  )
}
