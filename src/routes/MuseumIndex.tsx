import { Link } from 'react-router-dom'
import { MODULES } from '../lib/modules'
import { entriesOfModule, sources, sourcesOfModule } from '../lib/content'
import { usePageTitle } from '../lib/usePageContext'

export default function MuseumIndex() {
  usePageTitle('文化馆')

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="text-xs tracking-[0.3em] text-brick">文化馆</p>
        <h1 className="mt-2 font-serif text-3xl text-ink">四个模块，按兴趣自由浏览</h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">
          不要求先走故事。每个模块都有一个可以完成的入门体验；条目详情会标出地区、来源与核验状态。
          图示全部为自绘示意图，非某地标准。
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {MODULES.map((mod) => {
          const list = entriesOfModule(mod.id)
          const modSources = sourcesOfModule(mod.id)
          return (
            <li key={mod.id}>
              <Link
                to={`/museum/${mod.id}`}
                className="card block h-full no-underline transition-colors hover:border-brick/50"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-serif text-xl text-ink">{mod.title}</h2>
                  <span className="text-xs text-muted">{list.length} 条</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{mod.intro}</p>
                <p className="mt-3 text-xs text-muted">
                  {modSources.length > 0 ? `${modSources.length} 条来源` : '来源待登记'}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>

      <section className="card space-y-2">
        <h2 className="section-title">扩展展区</h2>
        <p className="text-sm leading-6 text-ink-soft">
          潮剧与工艺（P1）本期只在
          <Link to="/sources" className="link-inline mx-1">
            资料来源
          </Link>
          页列出，不单独做体验页，避免用未核验内容撑门类。
        </p>
        <p className="text-xs text-muted">本站共登记 {sources.length} 条来源。</p>
      </section>
    </div>
  )
}
