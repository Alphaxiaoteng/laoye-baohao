import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { audioItems, entries, recipes, storyChapters } from '../lib/content'
import { buildJournal } from '../lib/journal'
import { moduleTitle } from '../lib/modules'
import { useProgressStore } from '../store/progress'
import { useJournalStore } from '../store/journal'
import { usePageContext, usePageTitle } from '../lib/usePageContext'

export default function JournalPage() {
  usePageTitle('我的手记')
  usePageContext({ moduleTitle: '我的手记' })
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')

  const progress = useProgressStore()
  const journal = useJournalStore()

  const report = useMemo(
    () =>
      buildJournal({
        progress: {
          entriesVisited: progress.entriesVisited,
          modulesVisited: progress.modulesVisited,
          chaptersExperienced: progress.chaptersExperienced,
          chaptersSkipped: progress.chaptersSkipped,
          interactions: progress.interactions,
          recipesViewed: progress.recipesViewed,
          audioPlayed: progress.audioPlayed,
        },
        journal: { collected: journal.collected, notes: journal.notes },
        entries,
        chapters: storyChapters,
        recipes,
        audio: audioItems,
      }),
    [
      progress.entriesVisited,
      progress.modulesVisited,
      progress.chaptersExperienced,
      progress.chaptersSkipped,
      progress.interactions,
      progress.recipesViewed,
      progress.audioPlayed,
      journal.collected,
      journal.notes,
    ],
  )

  async function copy() {
    try {
      await navigator.clipboard.writeText(report.text)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
  }

  function resetAll() {
    const ok = window.confirm('清空手记和全部浏览进度？此操作不可撤销。')
    if (!ok) return
    progress.reset()
    journal.reset()
    setCopied('idle')
  }

  return (
    <div className="space-y-7">
      <header className="max-w-2xl space-y-3">
        <p className="text-xs tracking-[0.3em] text-brick">我的手记</p>
        <h1 className="font-serif text-3xl text-ink">这次看到的东西，留一份文字版</h1>
        <p className="text-[15px] leading-7 text-ink-soft">
          手记只汇总你在本站真实做过的操作，不做排行榜，也不上传任何内容。
          浏览食谱步骤只会写成"了解制作"，不会写成"亲手完成"。
        </p>
        <p className="text-xs text-muted">
          手记保存在本机浏览器；清除浏览器数据或换设备后会丢失。
        </p>
      </header>

      {report.isEmpty ? (
        <div className="card space-y-3">
          <p className="text-sm text-ink-soft">
            手记还是空的。你可以先走一条故事线，或者直接去文化馆打开一个条目。
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/story" className="btn-primary">
              跟故事走
            </Link>
            <Link to="/museum" className="btn-secondary">
              自由逛逛
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="card space-y-2">
              <h2 className="section-title">故事进度</h2>
              {report.chapters.length === 0 ? (
                <p className="text-sm text-muted">还没有走过的章节。</p>
              ) : (
                <ul className="space-y-1 text-sm text-ink-soft">
                  {report.chapters.map((row) => (
                    <li key={row.title} className="flex items-center justify-between gap-2">
                      <span>{row.title}</span>
                      <span className={row.state === '已体验' ? 'text-ink' : 'text-muted'}>
                        {row.state}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card space-y-2">
              <h2 className="section-title">文化馆浏览</h2>
              {report.modules.length === 0 ? (
                <p className="text-sm text-muted">还没有打开过条目。</p>
              ) : (
                <ul className="space-y-2 text-sm text-ink-soft">
                  {report.modules.map((mod) => (
                    <li key={mod.id}>
                      <span className="text-ink">{moduleTitle(mod.id)}</span>
                      <span className="block text-xs text-muted">{mod.entries.join('、')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card space-y-2">
              <h2 className="section-title">食谱</h2>
              {report.recipes.length === 0 ? (
                <p className="text-sm text-muted">还没有查看过食谱步骤。</p>
              ) : (
                <ul className="space-y-1 text-sm text-ink-soft">
                  {report.recipes.map((name) => (
                    <li key={name}>了解制作《{name}》</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card space-y-2">
              <h2 className="section-title">听潮</h2>
              {report.audio.length === 0 ? (
                <p className="text-sm text-muted">还没有播放过词句。</p>
              ) : (
                <ul className="space-y-1 text-sm text-ink-soft">
                  {report.audio.map((text) => (
                    <li key={text}>听过「{text}」</li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="card space-y-2">
            <h2 className="section-title">收藏</h2>
            {report.collected.length === 0 ? (
              <p className="text-sm text-muted">暂无收藏。条目、食谱和词句都可以收藏。</p>
            ) : (
              <ul className="flex flex-wrap gap-2 text-sm">
                {report.collected.map((name) => (
                  <li key={name} className="chip">
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section className="card space-y-3">
        <label htmlFor="journal-notes" className="section-title block">
          我记下的内容
        </label>
        <textarea
          id="journal-notes"
          value={journal.notes}
          onChange={(e) => journal.setNotes(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="写几句自己的记录（只保存在本机，不会上传）"
          className="w-full resize-y rounded-xl border border-line bg-white/80 px-3 py-2 text-sm leading-6 text-ink placeholder:text-muted/70 focus:border-brick/60 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-primary" onClick={copy} disabled={report.isEmpty}>
            复制手记文本
          </button>
          <button type="button" className="btn-quiet" onClick={resetAll}>
            清空手记与进度
          </button>
          <span className="text-xs text-muted" role="status">
            {copied === 'ok'
              ? '已复制到剪贴板'
              : copied === 'fail'
                ? '复制失败，可在下方文本框手动选择'
                : '本站不提供图片导出'}
          </span>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="section-title">文本预览</h2>
        <textarea
          readOnly
          value={report.text}
          rows={16}
          aria-label="手记文本预览"
          className="w-full rounded-xl border border-line bg-white/80 px-3 py-3 font-mono text-xs leading-6 text-ink-soft"
        />
        <p className="text-xs text-muted">
          来源与核验状态见
          <Link to="/sources" className="link-inline mx-1">
            资料来源
          </Link>
          页。
        </p>
      </section>
    </div>
  )
}
