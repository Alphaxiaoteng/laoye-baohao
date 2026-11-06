import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { storyChapters } from '../lib/content'
import { useProgressStore } from '../store/progress'
import { usePageTitle } from '../lib/usePageContext'

const SCROLL_KEY = 'laoye:story-scroll'

interface ScrollMemo {
  path: string
  y: number
  id: string
}

function readMemo(): ScrollMemo | null {
  try {
    const raw = window.sessionStorage.getItem(SCROLL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ScrollMemo>
    if (typeof parsed?.y !== 'number' || typeof parsed?.path !== 'string') return null
    return { path: parsed.path, y: parsed.y, id: typeof parsed.id === 'string' ? parsed.id : '' }
  } catch {
    return null
  }
}

function firstSentence(text: string | undefined): string {
  const clean = (text ?? '').trim()
  if (!clean) return '这一站没有额外的叙述，进章节看条目。'
  const cut = clean.split(/(?<=[。！？])/)[0] ?? clean
  return cut.length > 54 ? `${cut.slice(0, 54)}…` : cut
}

export default function StoryIndex() {
  usePageTitle('跟故事走')
  const location = useLocation()
  const experienced = useProgressStore((s) => s.chaptersExperienced)
  const skipped = useProgressStore((s) => s.chaptersSkipped)
  const first = storyChapters[0]

  // 从章节页返回时回到原章节位置。
  // React 的 passive effect 可能晚于 requestAnimationFrame，这里延到下一轮宏任务再滚，
  // 保证不会被 App 的「回顶部」覆盖；StrictMode 重跑时因为还没删 memo，第二次仍然生效。
  useEffect(() => {
    const memo = readMemo()
    if (!memo) return undefined
    const timer = window.setTimeout(() => {
      const target = memo.id ? document.getElementById(`chapter-${memo.id}`) : null
      if (target) target.scrollIntoView({ block: 'center', behavior: 'instant' })
      else if (memo.path === location.pathname) window.scrollTo({ top: memo.y, left: 0, behavior: 'instant' })
      try {
        window.sessionStorage.removeItem(SCROLL_KEY)
      } catch {
        /* 忽略 */
      }
    }, 60)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  function remember(id: string): void {
    try {
      const memo: ScrollMemo = { path: location.pathname, y: window.scrollY, id }
      window.sessionStorage.setItem(SCROLL_KEY, JSON.stringify(memo))
    } catch {
      /* 隐私模式下不可写，忽略 */
    }
  }

  return (
    <div className="story-page page-x mx-auto max-w-exhibit">
      <header className="story-head">
        <p className="story-eyebrow">
          <span aria-hidden="true" className="story-eyebrow-num">01</span>
          STORY · 01—05
        </p>
        <h1>跟故事走</h1>
        <p className="story-lead">
          一条从巷口走到院子的入门路线。五章都可以直接点进去，也可以跳过；手记只记真实发生的
          体验。
        </p>
        <p className="story-note">
          本故事为原创虚构串联，不对应某地完整仪式流程；故事里的场景与人物都不是某地真实事件的记录。
        </p>
        <div className="story-actions">
          {first ? (
            <Link
              to={`/story/${first.id}`}
              className="btn-primary"
              onClick={() => remember(first.id)}
            >
              从序章开始
            </Link>
          ) : null}
          <Link to="/museum" className="btn-secondary">
            我直接去文化馆
          </Link>
        </div>
      </header>

      {storyChapters.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-soft">故事章节待登记（content/story.json 还没有内容）。</p>
        </div>
      ) : (
        <ol className="story-timeline">
          {storyChapters.map((chapter, index) => {
            const state = experienced.includes(chapter.id)
              ? '已体验'
              : skipped.includes(chapter.id)
                ? '已跳过'
                : '未体验'
            const tone = experienced.includes(chapter.id)
              ? 'is-done'
              : skipped.includes(chapter.id)
                ? 'is-skipped'
                : 'is-idle'
            return (
              <li key={chapter.id} id={`chapter-${chapter.id}`} className="story-timeline-item">
                <Link
                  to={`/story/${chapter.id}`}
                  className="story-timeline-row"
                  onClick={() => remember(chapter.id)}
                >
                  <span aria-hidden="true" className="story-timeline-num">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="story-timeline-main">
                    <strong>{chapter.title}</strong>
                    <span className="story-timeline-line">{firstSentence(chapter.narrative)}</span>
                  </span>
                  <span className={`story-timeline-status ${tone}`}>{state}</span>
                  <span className="story-timeline-enter">
                    进入
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
