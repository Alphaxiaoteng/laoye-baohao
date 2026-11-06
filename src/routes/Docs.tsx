import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  content,
  entries,
  entryBodyState,
  recipes,
  sources,
  storyChapters,
  normalizeIngredients,
  normalizeSteps,
} from '../lib/content'
import { MODULES } from '../lib/modules'
import VerifyBadge from '../components/VerifyBadge'
import { SourceBadges } from '../components/SourceBadge'
import { usePageTitle } from '../lib/usePageContext'
import './docs.css'

/**
 * 文献汇总：全站文本的唯一集中页。
 * 主演示页只保留互动，考据、释义、完整步骤与出处统一放到这里，避免在演示里堆长文。
 */
export default function DocsPage() {
  usePageTitle('文献汇总')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const matchedEntries = useMemo(
    () =>
      entries.filter((entry) => {
        if (!q) return true
        return [entry.title, entry.summary, entry.body, entry.region]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(q))
      }),
    [q],
  )

  const matchedChapters = useMemo(
    () =>
      storyChapters.filter((chapter) => {
        if (!q) return true
        return [chapter.title, chapter.narrative].filter(Boolean).some((text) =>
          String(text).toLowerCase().includes(q),
        )
      }),
    [q],
  )

  const matchedRecipes = useMemo(
    () =>
      recipes.filter((recipe) => {
        if (!q) return true
        return [recipe.name, recipe.summary, recipe.region]
          .filter(Boolean)
          .some((text) => String(text).toLowerCase().includes(q))
      }),
    [q],
  )

  const grouped = MODULES.map((mod) => ({
    ...mod,
    items: matchedEntries.filter((entry) => entry.module === mod.id),
  })).filter((group) => group.items.length > 0)

  const otherEntries = matchedEntries.filter(
    (entry) => !MODULES.some((mod) => mod.id === entry.module),
  )

  const guideCount = (content.guides ?? []).length

  const totalChars =
    entries.reduce((sum, e) => sum + (e.body?.length ?? 0), 0) +
    recipes.reduce((sum, r) => sum + (r.summary?.length ?? 0), 0)

  const toc = [
    ...grouped.map((g) => ({ id: `doc-${g.id}`, label: g.title })),
    ...(matchedRecipes.length > 0 ? [{ id: 'doc-recipes', label: '食谱' }] : []),
    ...(matchedChapters.length > 0 ? [{ id: 'doc-story', label: '故事线' }] : []),
    ...(guideCount > 0 ? [{ id: 'doc-guide', label: '攻略' }] : []),
  ]

  return (
    <div className="space-y-8">
      <header className="docs-hero">
        <p className="text-xs tracking-[0.3em] text-brick">文献汇总</p>
        <h1 className="mt-3 font-serif text-[30px] leading-tight text-ink sm:text-[38px]">
          所有考据、释义与出处，集中在这一页
        </h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-ink-soft">
          主演示页只负责看与点，完整文字放在这里。每条内容都标来源编号与核验状态，
          未核验的会明确写出来，不用推测补全。
        </p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-faint">条目</dt>
            <dd className="mt-1 font-serif text-xl text-ink">{entries.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-faint">故事章节</dt>
            <dd className="mt-1 font-serif text-xl text-ink">{storyChapters.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-faint">食谱</dt>
            <dd className="mt-1 font-serif text-xl text-ink">{recipes.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-faint">来源</dt>
            <dd className="mt-1 font-serif text-xl text-ink">{sources.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-faint">正文规模</dt>
            <dd className="mt-1 font-serif text-xl text-ink">{(totalChars / 1000).toFixed(1)} 千字</dd>
          </div>
        </dl>
      </header>

      <div className="docs-controls">
        <label className="docs-search">
          <span className="sr-only">在文献里搜索</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索条目、地区、关键词…"
          />
        </label>
        <nav aria-label="页面目录" className="docs-toc">
          {toc.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
          <a href="#doc-sources">来源表</a>
        </nav>
      </div>

      {matchedEntries.length === 0 && matchedRecipes.length === 0 && matchedChapters.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-soft">没有匹配「{query}」的段落，换个关键词试试。</p>
        </div>
      ) : null}

      {grouped.map((group) => (
        <section key={group.id} id={`doc-${group.id}`} className="docs-section">
          <h2 className="docs-section-title">
            {group.title}
            <span>{group.items.length} 条</span>
          </h2>
          <div className="docs-list">
            {group.items.map((entry) => {
              const body = entryBodyState(entry)
              return (
                <article key={entry.id} className="docs-entry">
                  <div className="docs-entry-head">
                    <h3>{entry.title}</h3>
                    <VerifyBadge verify={entry.verify} compact />
                  </div>
                  {entry.region ? <p className="docs-region">范围：{entry.region}</p> : null}
                  {entry.summary ? <p className="docs-summary">{entry.summary}</p> : null}
                  {body.text ? (
                    <div className="docs-body">
                      {body.text.split(/\n{2,}/).map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="docs-placeholder">内容待补充可靠来源。</p>
                  )}
                  <div className="docs-entry-foot">
                    <SourceBadges ids={entry.sourceIds ?? []} />
                    <Link to={`/museum/${entry.module}/${entry.id}`} className="docs-jump">
                      在文化馆看这一条 ↗
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}

      {otherEntries.length > 0 ? (
        <section id="doc-other" className="docs-section">
          <h2 className="docs-section-title">
            其他条目<span>{otherEntries.length} 条</span>
          </h2>
          <div className="docs-list">
            {otherEntries.map((entry) => (
              <article key={entry.id} className="docs-entry">
                <h3>{entry.title}</h3>
                {entry.body ? <p className="docs-body">{entry.body}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {matchedRecipes.length > 0 ? (
        <section id="doc-recipes" className="docs-section">
          <h2 className="docs-section-title">
            食谱<span>{matchedRecipes.length} 道</span>
          </h2>
          <div className="docs-list">
            {matchedRecipes.map((recipe) => {
              const ingredients = normalizeIngredients(recipe)
              const steps = normalizeSteps(recipe)
              return (
                <article key={recipe.id} className="docs-entry">
                  <div className="docs-entry-head">
                    <h3>{recipe.name}</h3>
                    <VerifyBadge verify={recipe.verify} compact />
                  </div>
                  {recipe.summary ? <p className="docs-summary">{recipe.summary}</p> : null}
                  <div className="docs-recipe-grid">
                    <div>
                      <h4>用料</h4>
                      <ul>
                        {ingredients.map((ing) => (
                          <li key={ing.name}>
                            {ing.name}
                            {ing.amount ? ` ${ing.amount}` : ''}
                            {ing.note ? <em>（{ing.note}）</em> : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4>步骤</h4>
                      <ol>
                        {steps.map((step, i) => (
                          <li key={i}>
                            {step.text}
                            {step.note ? <em> {step.note}</em> : null}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  <div className="docs-entry-foot">
                    <SourceBadges ids={recipe.sourceIds ?? []} />
                    <Link to={`/recipe/${recipe.id}`} className="docs-jump">
                      看分步演示 ↗
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ) : null}

      {matchedChapters.length > 0 ? (
        <section id="doc-story" className="docs-section">
          <h2 className="docs-section-title">
            故事线<span>{matchedChapters.length} 章</span>
          </h2>
          <div className="docs-list">
            {matchedChapters.map((chapter) => (
              <article key={chapter.id} className="docs-entry">
                <h3>{chapter.title}</h3>
                {chapter.narrative ? <p className="docs-body">{chapter.narrative}</p> : null}
                <div className="docs-entry-foot">
                  <Link to={`/story/${chapter.id}`} className="docs-jump">
                    读这一章 ↗
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section id="doc-guide" className="docs-section">
        <h2 className="docs-section-title">
          潮汕攻略<span>{guideCount} 条</span>
        </h2>
        <p className="docs-summary">
          小红书图文经清洗后单独放在
          <Link to="/guide" className="link-inline mx-1">
            攻略页
          </Link>
          ，保留原作者与原帖链接；这里不重复正文，只做入口。
        </p>
        <Link to="/guide" className="btn-secondary mt-3 inline-flex">
          打开潮汕攻略
        </Link>
      </section>

      <section id="doc-sources" className="docs-section">
        <h2 className="docs-section-title">
          来源表<span>{sources.length} 条</span>
        </h2>
        <p className="docs-summary">
          所有来源逐条登记在
          <Link to="/sources" className="link-inline mx-1">
            资料来源
          </Link>
          页，包含机构、访问日期、适用地区与许可口径；外部链接只作署名与核对入口。
        </p>
        <ul className="docs-source-list">
          {sources.slice(0, 12).map((source) => (
            <li key={source.id}>
              <Link to={`/sources#${source.id}`}>
                [{source.id}] {source.title}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/sources" className="btn-secondary mt-4 inline-flex">
          查看全部 {sources.length} 条来源
        </Link>
      </section>
    </div>
  )
}
