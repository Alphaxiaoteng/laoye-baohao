import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  chapterById,
  entries as allEntries,
  entryHref,
  recipes,
  storyActionKind,
  storyChapters,
} from '../lib/content'
import { useProgressStore } from '../store/progress'
import VerifyBadge from '../components/VerifyBadge'
import { usePageContext, usePageTitle } from '../lib/usePageContext'
import FormationDiagram from '../components/figures/FormationDiagram'
import ProcessionDiagram from '../components/figures/ProcessionDiagram'
import { BeatTap } from '../components/interactions/YinggeInteractive'
import TeaPour from '../components/interactions/TeaPour'

const ACTION_MODULE: Record<string, { module: string; moduleTitle: string; label: string }> = {
  formation: { module: 'yingge', moduleTitle: '英歌舞', label: '阵形示意' },
  beat: { module: 'yingge', moduleTitle: '英歌舞', label: '节拍体验' },
  pour: { module: 'tea', moduleTitle: '工夫茶', label: '斟茶示意' },
  recipe: { module: 'food', moduleTitle: '潮汕美食', label: '食谱界面' },
  cards: { module: 'yinglaoye', moduleTitle: '营老爷·游神', label: '队伍示意' },
  none: { module: '', moduleTitle: '故事', label: '阅读' },
}

export default function StoryChapterPage() {
  const { chapter } = useParams<{ chapter: string }>()
  const navigate = useNavigate()
  const chapters = useProgressStore((s) => s.chaptersExperienced)
  const markChapter = useProgressStore((s) => s.markChapter)

  const current = chapterById(chapter)
  const index = current ? storyChapters.findIndex((c) => c.id === current.id) : -1
  const action = storyActionKind(current?.action)
  const meta = ACTION_MODULE[action] ?? ACTION_MODULE.none

  usePageTitle(current?.title ?? '故事')
  usePageContext({
    module: meta.module || undefined,
    moduleTitle: meta.moduleTitle,
    stepLabel: current?.title,
  })

  if (!current) {
    return (
      <div className="card">
        <h1 className="font-serif text-xl text-ink">没有找到这一章</h1>
        <p className="mt-2 text-sm text-ink-soft">
          可能章节 id 写错了。你可以回到故事目录重新选择。
        </p>
        <div className="mt-4">
          <Link to="/story" className="btn-primary">
            回到故事目录
          </Link>
        </div>
      </div>
    )
  }

  const related = allEntries.filter((e) => (current.entryIds ?? []).includes(e.id))
  const prev = index > 0 ? storyChapters[index - 1] : undefined
  const next =
    index >= 0 && index < storyChapters.length - 1 ? storyChapters[index + 1] : undefined
  const experienced = chapters.includes(current.id)

  function finish(): void {
    markChapter(current!.id, 'experienced')
    if (next) navigate(`/story/${next.id}`)
    else navigate('/journal')
  }

  function skip(): void {
    markChapter(current!.id, 'skipped')
    if (next) navigate(`/story/${next.id}`)
    else navigate('/journal')
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/story" className="link-inline">
          故事目录
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>{current.title}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="chip">
            第 {index + 1} / {storyChapters.length} 站
          </span>
          {current.fiction ? <span className="chip">原创虚构串联</span> : null}
          {experienced ? <span className="chip border-ink/25 bg-ink/10 text-ink">已体验</span> : null}
        </div>
        <h1 className="font-serif text-3xl leading-snug text-ink">{current.title}</h1>
        <p className="rounded-xl border border-line bg-white/60 px-3 py-2 text-xs leading-5 text-muted">
          本故事为原创虚构串联，不对应某地完整仪式流程。章节里的文化信息来自页面下方标注的条目与来源。
        </p>
      </header>

      {current.narrative ? <p className="body-text">{current.narrative}</p> : null}

      <section className="card space-y-4" aria-labelledby="action-title">
        <div className="flex items-center justify-between gap-2">
          <h2 id="action-title" className="section-title">
            这一站可以做的事：{meta.label}
          </h2>
          {meta.module ? (
            <Link to={`/museum/${meta.module}`} className="link-inline text-sm">
              去{meta.moduleTitle}
            </Link>
          ) : (
            <Link to="/museum" className="link-inline text-sm">
              去文化馆
            </Link>
          )}
        </div>

        {action === 'formation' ? (
          <div className="space-y-3">
            <FormationDiagram variant="square" />
            <p className="text-sm text-ink-soft">
              上面只是几何示意。想看另外两种排布，去英歌模块的「轻互动」里切换。
            </p>
          </div>
        ) : null}

        {action === 'beat' ? <BeatTap /> : null}
        {action === 'pour' ? <TeaPour /> : null}

        {action === 'cards' ? (
          <div className="space-y-3">
            <ProcessionDiagram />
            <p className="text-sm text-ink-soft">
              队伍组成、称呼与地区案例请到营老爷模块逐条查看，每个案例都会标注地区与年份。
            </p>
          </div>
        ) : null}

        {action === 'recipe' ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">
              这一站对应美食模块的食谱界面。展馆里翻步骤只是"了解制作"，不等于真的做了这道菜。
            </p>
            <ul className="flex flex-wrap gap-2">
              {recipes.map((r) => (
                <li key={r.id}>
                  <Link to={`/recipe/${r.id}`} className="btn-secondary !min-h-[40px] !text-sm">
                    {r.name || r.id}
                  </Link>
                </li>
              ))}
              {recipes.length === 0 ? (
                <li className="text-sm text-muted">食谱待登记（content/recipes.json 还没有内容）。</li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {action === 'none' ? (
          <p className="text-sm text-ink-soft">这一站以阅读为主，没有需要操作的内容。</p>
        ) : null}
      </section>

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="space-y-3">
          <h2 id="related-title" className="section-title">
            本章提到的条目
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {related.map((entry) => (
              <li key={entry.id}>
                <Link
                  to={entryHref(entry)}
                  className="card block h-full no-underline hover:border-brick/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-base text-ink">{entry.title}</h3>
                    <VerifyBadge verify={entry.verify} compact />
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">
                    {entry.summary || entry.body || '内容待补充可靠来源'}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
        {prev ? (
          <Link to={`/story/${prev.id}`} className="btn-quiet">
            返回上一章
          </Link>
        ) : (
          <Link to="/story" className="btn-quiet">
            返回目录
          </Link>
        )}
        <button type="button" className="btn-secondary" onClick={skip}>
          跳过这一章
        </button>
        <button type="button" className="btn-primary" onClick={finish}>
          {next ? '继续下一站' : '完成故事，打开手记'}
        </button>
      </div>
      <p className="text-xs text-muted">
        跳过不会阻断后续章节，手记里会记成"未体验（已跳过）"。任何时候都可以回来补看。
      </p>
    </article>
  )
}
