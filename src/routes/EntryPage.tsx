import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  entryBodyState,
  entryById,
  entryHref,
  entriesOfModule,
  moduleConfig,
  recipes,
  resolveModule,
  PENDING_SOURCE_TEXT,
} from '../lib/content'
import { useProgressStore } from '../store/progress'
import VerifyBadge from '../components/VerifyBadge'
import CollectButton from '../components/CollectButton'
import { Prose } from '../components/Prose'
import FormationDiagram from '../components/figures/FormationDiagram'
import ProcessionDiagram from '../components/figures/ProcessionDiagram'
import { BeatTap, FormationExplorer } from '../components/interactions/YinggeInteractive'
import TeaPour from '../components/interactions/TeaPour'
import { usePageContext, usePageTitle } from '../lib/usePageContext'

export default function EntryPage() {
  const { module: slug, entry: entryId } = useParams<{ module: string; entry: string }>()
  const entry = entryById(entryId)
  const { config } = resolveModule(slug ?? entry?.module)
  const visitEntry = useProgressStore((s) => s.visitEntry)

  usePageTitle(entry?.title ?? config.title)
  usePageContext({
    module: entry?.module ?? config.id,
    moduleTitle: config.title,
    entryId: entry?.id,
    entryTitle: entry?.title,
  })

  useEffect(() => {
    if (entry) visitEntry(entry.id, entry.module)
  }, [entry, visitEntry])

  if (!entry) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-10">
        <h1 className="font-serif text-2xl text-ink">没有找到这个条目</h1>
        <p className="text-sm text-ink-soft">
          条目 id「{entryId}」不在 content/entries.json 里。可能是链接过期，或者内容还没登记。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to={`/museum/${slug ?? ''}`} className="btn-primary">
            回到模块
          </Link>
          <Link to="/museum" className="btn-secondary">
            去文化馆
          </Link>
        </div>
      </div>
    )
  }

  const body = entryBodyState(entry)
  const moduleId = entry.module
  const currentConfig = moduleConfig(moduleId) ?? config
  const isYingge = moduleId === 'yingge'
  const isTea = moduleId === 'tea'
  const isFood = moduleId === 'food'
  const isDeity = moduleId === 'yinglaoye'

  const siblings = entriesOfModule(moduleId)
  const pos = siblings.findIndex((e) => e.id === entry.id)
  const prev = pos > 0 ? siblings[pos - 1] : undefined
  const next = pos >= 0 && pos < siblings.length - 1 ? siblings[pos + 1] : undefined

  return (
    <article className="mx-auto max-w-3xl space-y-7">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/museum" className="link-inline">
          文化馆
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <Link to={`/museum/${moduleId}`} className="link-inline">
          {currentConfig.title}
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>{entry.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <VerifyBadge verify={entry.verify} />
          {entry.region ? <span className="chip">范围：{entry.region}</span> : null}
        </div>
        <h1 className="font-serif text-3xl leading-snug text-ink">{entry.title}</h1>
        {entry.summary ? <p className="body-text">{entry.summary}</p> : null}
      </header>

      <section aria-labelledby="body-title" className="card space-y-3">
        <h2 id="body-title" className="section-title">
          条目说明
        </h2>
        {body.placeholder ? (
          <>
            <p className="rounded-xl border border-brick/30 bg-brick/5 px-3 py-2 text-sm text-brick">
              {PENDING_SOURCE_TEXT}
            </p>
            <p className="text-sm leading-6 text-ink-soft">
              这一条还在整理中，本站不凭印象补写。你可以先阅读同模块的其他条目，
              或在右下角「问一问」里继续提问。
            </p>
          </>
        ) : (
          <Prose className="body-text" text={body.text} />
        )}
        <p className="text-xs text-muted">
          未完成本地文化审核的条目会标注「待本地审核」。
        </p>
      </section>

      {isYingge ? (
        <section aria-labelledby="yingge-inter" className="space-y-3">
          <h2 id="yingge-inter" className="section-title">
            轻互动：看阵形、点节拍
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="card space-y-3">
              <FormationExplorer />
            </div>
            <div className="card space-y-3">
              <BeatTap />
            </div>
          </div>
          <FormationDiagram variant="double" />
        </section>
      ) : null}

      {isTea ? (
        <section aria-labelledby="tea-inter" className="space-y-3">
          <h2 id="tea-inter" className="section-title">
            轻互动：斟茶示意
          </h2>
          <div className="card">
            <TeaPour />
          </div>
        </section>
      ) : null}

      {isFood ? (
        <section aria-labelledby="food-recipe" className="space-y-3">
          <h2 id="food-recipe" className="section-title">
            制作步骤界面
          </h2>
          <div className="card space-y-3">
            <p className="text-sm leading-6 text-ink-soft">
              展馆里翻步骤只是"了解制作"，不等于真的做过这道菜，手记也不会写成"亲手完成"。
            </p>
            {recipes.length === 0 ? (
              <p className="text-sm text-muted">食谱待登记。</p>
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
          </div>
        </section>
      ) : null}

      {isDeity ? (
        <section aria-labelledby="deity-inter" className="space-y-3">
          <h2 id="deity-inter" className="section-title">
            轻互动：队伍示意
          </h2>
          <div className="card">
            <ProcessionDiagram />
            <p className="mt-3 text-sm text-ink-soft">
              队伍组成因村、因年份而异。详细案例见同模块的其他条目，每条都带地区与年份。
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {siblings
                .filter((e) => e.id !== entry.id && (e.region ?? '').trim() !== '')
                .slice(0, 4)
                .map((e) => (
                  <li key={e.id}>
                    <Link to={entryHref(e)} className="link-inline">
                      {e.title}
                    </Link>
                    <span className="ml-2 text-xs text-muted">（{e.region}）</span>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <CollectButton id={entry.id} />
        {prev ? (
          <Link to={entryHref(prev)} className="btn-quiet">
            上一条：{prev.title}
          </Link>
        ) : null}
        {next ? (
          <Link to={entryHref(next)} className="btn-quiet">
            下一条：{next.title}
          </Link>
        ) : null}
      </div>
    </article>
  )
}
