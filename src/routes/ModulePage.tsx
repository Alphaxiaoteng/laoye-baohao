import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { entryHref, recipes, resolveModule, sourcesOfModule } from '../lib/content'
import { useProgressStore } from '../store/progress'
import VerifyBadge from '../components/VerifyBadge'
import { SourceList } from '../components/SourceBadge'
import ProcessionDiagram from '../components/figures/ProcessionDiagram'
import { BeatTap, FormationExplorer } from '../components/interactions/YinggeInteractive'
import TeaPour from '../components/interactions/TeaPour'
import { usePageContext, usePageTitle } from '../lib/usePageContext'

export default function ModulePage() {
  const { module: slug } = useParams<{ module: string }>()
  const { config, entries: list } = resolveModule(slug)
  const visitModule = useProgressStore((s) => s.visitModule)

  usePageTitle(config.title)
  usePageContext({ module: config.id, moduleTitle: config.title })

  useEffect(() => {
    if (config.id) visitModule(config.id)
  }, [config.id, visitModule])

  const recommended = list.slice(0, 3)
  const rest = list.slice(3)
  const modSources = sourcesOfModule(config.id)
  const isFood = config.id === 'food'
  const isYingge = config.id === 'yingge'
  const isTea = config.id === 'tea'
  const isDeity = config.id === 'yinglaoye'
  const regions = list.filter((e) => (e.region ?? '').trim() !== '')

  return (
    <div className="space-y-8">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/museum" className="link-inline">
          文化馆
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>{config.title}</span>
      </nav>

      <header className="max-w-3xl space-y-3">
        <h1 className="font-serif text-3xl text-ink">{config.title}</h1>
        <p className="text-[15px] leading-7 text-ink-soft">{config.intro}</p>
        <p className="text-xs text-muted">
          {list.length > 0
            ? `本模块共 ${list.length} 条内容，全部标注来源与核验状态。`
            : '本模块的条目还在整理中。'}
        </p>
      </header>

      {list.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-soft">
            这个模块还没有可展示的条目（content/entries.json 里没有对应 module 的内容）。
          </p>
          <div className="mt-4">
            <Link to="/sources" className="btn-secondary">
              先看资料来源
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section aria-labelledby="start-title" className="space-y-3">
            <h2 id="start-title" className="section-title">
              推荐入门
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {recommended.map((entry) => (
                <li key={entry.id}>
                  <Link
                    to={entryHref(entry)}
                    className="card block h-full no-underline hover:border-brick/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg text-ink">{entry.title}</h3>
                      <VerifyBadge verify={entry.verify} compact />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">
                      {entry.summary || '内容待补充可靠来源'}
                    </p>
                    {entry.region ? (
                      <p className="mt-3 text-xs text-muted">范围：{entry.region}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="interaction-title" className="space-y-3">
            <h2 id="interaction-title" className="section-title">
              轻互动
            </h2>

            {isYingge ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="card space-y-3">
                  <h3 className="font-serif text-lg text-ink">看阵形示意</h3>
                  <FormationExplorer />
                </div>
                <div className="card space-y-3">
                  <h3 className="font-serif text-lg text-ink">跟着点节拍</h3>
                  <BeatTap />
                </div>
              </div>
            ) : null}

            {isTea ? (
              <div className="card space-y-3">
                <h3 className="font-serif text-lg text-ink">斟茶示意</h3>
                <TeaPour />
              </div>
            ) : null}

            {isFood ? (
              <div className="card space-y-3">
                <h3 className="font-serif text-lg text-ink">制作步骤界面</h3>
                {recipes.length === 0 ? (
                  <p className="text-sm text-ink-soft">食谱待登记（content/recipes.json 还没有内容）。</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {recipes.map((r) => (
                      <li key={r.id}>
                        <Link to={`/recipe/${r.id}`} className="btn-secondary">
                          {r.name || r.id}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-muted">
                  展馆里翻步骤只是"了解制作"，不等于真的做过这道菜；计时也不代表食物已熟。
                </p>
              </div>
            ) : null}

            {isDeity ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="card space-y-3">
                  <h3 className="font-serif text-lg text-ink">队伍示意</h3>
                  <ProcessionDiagram />
                </div>
                <div className="card space-y-3">
                  <h3 className="font-serif text-lg text-ink">地区案例</h3>
                  {regions.length === 0 ? (
                    <p className="text-sm text-ink-soft">案例待登记。</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {regions.map((entry) => (
                        <li key={entry.id}>
                          <Link to={entryHref(entry)} className="link-inline">
                            {entry.title}
                          </Link>
                          <span className="block text-xs text-muted">范围：{entry.region}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-muted">
                    地名、主体与年份以来源原文表述为准；旧日期不能当作今年的日程。
                  </p>
                </div>
              </div>
            ) : null}

            {!isYingge && !isTea && !isFood && !isDeity ? (
              <div className="card">
                <p className="text-sm text-ink-soft">这个模块暂未配置互动，可直接阅读条目。</p>
              </div>
            ) : null}
          </section>

          {rest.length > 0 ? (
            <section aria-labelledby="more-title" className="space-y-3">
              <h2 id="more-title" className="section-title">
                相关内容
              </h2>
              <ul className="divide-y divide-line rounded-2xl border border-line bg-white/70">
                {rest.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      to={entryHref(entry)}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 no-underline hover:bg-cream-dark/40"
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="font-serif text-base text-ink">{entry.title}</span>
                        <span className="text-xs text-muted">
                          {entry.summary || '内容待补充可靠来源'}
                        </span>
                      </span>
                      <VerifyBadge verify={entry.verify} compact />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}

      <section aria-labelledby="sources-title" className="space-y-3">
        <h2 id="sources-title" className="section-title">
          本模块来源
        </h2>
        <div className="card">
          <SourceList ids={modSources.map((s) => s.id)} />
          <p className="mt-3 text-xs text-muted">
            完整来源表与核验状态见
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
