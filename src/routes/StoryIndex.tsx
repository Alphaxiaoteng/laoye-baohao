import { Link } from 'react-router-dom'
import { storyChapters } from '../lib/content'
import { useProgressStore } from '../store/progress'
import { usePageTitle } from '../lib/usePageContext'

export default function StoryIndex() {
  usePageTitle('跟故事走')
  const experienced = useProgressStore((s) => s.chaptersExperienced)
  const skipped = useProgressStore((s) => s.chaptersSkipped)
  const first = storyChapters[0]

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="text-xs tracking-[0.3em] text-brick">跟故事走</p>
        <h1 className="mt-2 font-serif text-3xl text-ink">一条从巷口走到院子的入门路线</h1>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">
          主线按「序章 → 英歌 → 茶 → 美食 → 巡境终章」推进。每一章都可以返回补看，也可以直接跳过；
          手记会如实记下"已体验"或"未体验"。你也可以完全不走故事，从文化馆自由浏览。
        </p>
        <p className="mt-3 rounded-xl border border-line bg-white/60 px-3 py-2 text-sm text-muted">
          本故事为原创虚构串联，不对应某地完整仪式流程；故事里的场景与人物都不是某地真实事件的记录。
        </p>
      </header>

      {storyChapters.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-soft">故事章节待登记（content/story.json 还没有内容）。</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            {first ? (
              <Link to={`/story/${first.id}`} className="btn-primary">
                从序章开始
              </Link>
            ) : null}
            <Link to="/museum" className="btn-secondary">
              我直接去文化馆
            </Link>
          </div>

          <ol className="space-y-3">
            {storyChapters.map((chapter, i) => {
              const state = experienced.includes(chapter.id)
                ? '已体验'
                : skipped.includes(chapter.id)
                  ? '未体验（已跳过）'
                  : '未体验'
              return (
                <li key={chapter.id}>
                  <Link
                    to={`/story/${chapter.id}`}
                    className="card flex flex-wrap items-center justify-between gap-3 no-underline hover:border-brick/50"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-serif text-sm text-muted">第 {i + 1} 站</span>
                      <span className="font-serif text-lg text-ink">{chapter.title}</span>
                    </span>
                    <span
                      className={
                        state === '已体验'
                          ? 'chip border-ink/25 bg-ink/10 text-ink'
                          : 'chip'
                      }
                    >
                      {state}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}
