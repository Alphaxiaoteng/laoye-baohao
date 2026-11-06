import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MODULES } from '../lib/modules'
import { entriesOfModule, hasAnyContent, storyChapters } from '../lib/content'
import { usePageTitle } from '../lib/usePageContext'
import { useProgressStore } from '../store/progress'
import { HOME_HERO, HOME_MODULE_MEDIA, HOME_RAW_PHOTOS } from './homeMedia'
import { YINGGE_EXHIBIT_HOME, YINGGE_EXHIBITS } from '../features/yingge-static'
import './Home.css'

/** 故事单列的滚动锚点：章节页返回时用同一批 key 还原现场。 */
const SCROLL_KEY = 'laoye:story-scroll'

interface ScrollMemo {
  path: string
  y: number
  id: string
}

function rememberStoryScroll(id: string, path: string): void {
  try {
    const memo: ScrollMemo = { path, y: window.scrollY, id }
    window.sessionStorage.setItem(SCROLL_KEY, JSON.stringify(memo))
  } catch {
    /* 隐私模式下 sessionStorage 可能不可写，忽略即可 */
  }
}

/** 取故事原文的第一句作为单列索引的一句简介，不改写内容。 */
function firstSentence(text: string | undefined): string {
  const clean = (text ?? '').trim()
  if (!clean) return '这一站没有额外的叙述，进章节看条目。'
  const cut = clean.split(/(?<=[。！？])/)[0] ?? clean
  return cut.length > 46 ? `${cut.slice(0, 46)}…` : cut
}

export default function Home() {
  usePageTitle('')
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const experienced = useProgressStore((s) => s.chaptersExperienced)
  const skipped = useProgressStore((s) => s.chaptersSkipped)
  const modulesVisited = useProgressStore((s) => s.modulesVisited)

  const nextChapter =
    storyChapters.find((chapter) => !experienced.includes(chapter.id)) ?? storyChapters[0]
  const hero = HOME_HERO
  const firstChapter = storyChapters[0]

  const rows = useMemo(() => {
    return storyChapters.map((chapter, index) => {
      const status = experienced.includes(chapter.id)
        ? '已体验'
        : skipped.includes(chapter.id)
          ? '已跳过'
          : '未体验'
      const tone = experienced.includes(chapter.id)
        ? 'is-done'
        : skipped.includes(chapter.id)
          ? 'is-skipped'
          : 'is-idle'
      return { chapter, index, status, tone, line: firstSentence(chapter.narrative) }
    })
  }, [experienced, skipped])

  // 从章节页回到落地页时，滚回刚才那一章（做法同 /story，见 StoryIndex）
  useEffect(() => {
    let memo: ScrollMemo | null = null
    try {
      const raw = window.sessionStorage.getItem(SCROLL_KEY)
      memo = raw ? (JSON.parse(raw) as ScrollMemo) : null
    } catch {
      memo = null
    }
    if (!memo) return undefined
    const timer = window.setTimeout(() => {
      const target = memo?.id ? document.getElementById(`home-chapter-${memo.id}`) : null
      if (target) target.scrollIntoView({ block: 'center', behavior: 'instant' })
      else if (memo?.path === location.pathname) window.scrollTo({ top: memo.y, left: 0, behavior: 'instant' })
      try {
        window.sessionStorage.removeItem(SCROLL_KEY)
      } catch {
        /* 忽略 */
      }
    }, 60)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  // 动效为可选增强：GSAP 加载失败或用户要求减少动效时，页面保持静态可读
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !rootRef.current) return undefined

    let cancelled = false
    let revert: (() => void) | undefined

    void (async () => {
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])
        if (cancelled) return
        gsap.registerPlugin(ScrollTrigger)
        const ctx = gsap.context(() => {
          gsap.from('.home-hero-copy > *', {
            y: 24,
            opacity: 0,
            duration: 0.85,
            stagger: 0.08,
            ease: 'power3.out',
          })
          gsap.fromTo(
            '.home-hero-media img',
            { scale: 1.07 },
            { scale: 1, duration: 1.6, ease: 'power2.out' },
          )
          // 只做位移视差：即使 ScrollTrigger 没触发，内容也不会被藏起来
          gsap.to('.home-hero-media img', {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: '.home-hero',
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          })
        }, rootRef)
        revert = () => ctx.revert()
      } catch {
        /* 动效不可用时静默降级为静态版式 */
      }
    })()

    return () => {
      cancelled = true
      revert?.()
    }
  }, [])

  return (
    <div className="home-page" ref={rootRef}>
      {/* ---------- 首屏：深墨青 + 左侧大字 + 右侧实拍 ---------- */}
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-media" aria-hidden={false}>
          <img
            src={hero.src}
            width={hero.width}
            height={hero.height}
            alt={hero.alt}
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="home-hero-shade" aria-hidden="true" />
        <div className="home-ambient" aria-hidden="true" />

        <div className="home-hero-inner page-x">
          <div className="home-hero-copy">
            <p className="home-kicker">
              <span aria-hidden="true" className="home-kicker-rule" />
              国家级非物质文化遗产 · 潮汕
            </p>
            <h1 id="home-title" className="home-hero-title">
              老爷保号
            </h1>
            <p className="home-hero-sub">跟着故事，走进潮汕文化</p>
            <p className="home-hero-body">
              一场英歌，一泡茶，一夜巡境。五个站点、约十分钟，先把「看见」变成「看懂」。
            </p>

            <div className="home-hero-actions">
              <Link
                to={firstChapter ? `/story/${firstChapter.id}` : '/story'}
                className="btn-primary"
                onClick={() => rememberStoryScroll(firstChapter?.id ?? 'story', location.pathname)}
              >
                {nextChapter && experienced.length > 0 ? '接着走故事' : '开始走故事'}
              </Link>
              <Link to="/museum" className="home-glass-btn">
                进入文化馆
              </Link>
            </div>

            <dl className="home-facts">
              <div>
                <dt>故事章节</dt>
                <dd>{storyChapters.length} 站</dd>
              </div>
              <div>
                <dt>入门体验</dt>
                <dd>约 10 分钟</dd>
              </div>
              <div>
                <dt>你的进度</dt>
                <dd>{experienced.length} 已体验</dd>
              </div>
              <div>
                <dt>开始条件</dt>
                <dd>无需登录</dd>
              </div>
            </dl>

            <p className="home-figcaption">
              主图为真实演出照片（{hero.creator} · {hero.license}）；站内图示与互动均为示意。
            </p>
          </div>
        </div>

        <p className="home-scroll-cue" aria-hidden="true">
          向下 · 从故事开始
        </p>
      </section>

      {/* ---------- 四个主题入口 ---------- */}
      <section id="modules" className="home-section page-x mx-auto max-w-exhibit" aria-labelledby="modules-title">
        <header className="home-section-head">
          <p className="home-eyebrow">
            <span aria-hidden="true" className="home-eyebrow-num">01</span>
            COLLECTION · 四个入口
          </p>
          <h2 id="modules-title">自由进馆</h2>
          <p className="home-section-desc">不必先走序章。想先看什么，就直接进哪个馆。</p>
        </header>

        <ul className="home-module-grid">
          {MODULES.map((module, index) => {
            const photo = HOME_MODULE_MEDIA[module.id]
            const count = entriesOfModule(module.id).length
            const visited = modulesVisited.includes(module.id)
            // 英歌直接进 8787 原生静态展；其余仍走 React 模块
            const href = module.id === 'yingge' ? YINGGE_EXHIBIT_HOME : `/museum/${module.id}`
            const external = module.id === 'yingge'

            return (
              <li key={module.id} className="home-module-card">
                <Link
                  to={href}
                  className="home-module-link"
                  {...(external ? { reloadDocument: true } : {})}
                >
                  {photo ? (
                    <img
                      className="home-module-img"
                      src={photo.src}
                      width={photo.width}
                      height={photo.height}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <span className="home-module-shade" aria-hidden="true" />
                  <span className="home-module-body">
                    <span className="home-module-no">Mod. {String(index + 1).padStart(2, '0')}</span>
                    <strong className="home-module-name">{module.title}</strong>
                    <span className="home-module-meta">
                      {external ? '原生展 · 7 个展馆' : `${count} 条 · ${visited ? '已进馆' : '未进馆'}`}
                    </span>
                  </span>
                  <span className="home-module-go" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* 8787 英歌原生展：静态页面原样挂载，React 只提供入口 */}
        <div className="home-exhibit-strip">
          <p className="home-exhibit-strip-label">
            英歌舞 · 原生展
            <span>7 个展馆，原页原样打开</span>
          </p>
          <ul>
            {YINGGE_EXHIBITS.map((item) => (
              <li key={item.id}>
                <a href={item.href} title={item.note}>
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- 故事单列：01–05 可跳转 ---------- */}
      <section id="story" className="home-section page-x mx-auto max-w-exhibit" aria-labelledby="story-title">
        <header className="home-section-head">
          <p className="home-eyebrow">
            <span aria-hidden="true" className="home-eyebrow-num">02</span>
            NIGHT PROCESSION · 01—05
          </p>
          <h2 id="story-title">一夜巡境</h2>
          <p className="home-section-desc">
            五章串成一条夜里的路。任何一章都能直接点进去，回来还停在原处。
          </p>
        </header>

        <ol className="home-timeline">
          {rows.map(({ chapter, index, status, tone, line }) => (
            <li key={chapter.id} id={`home-chapter-${chapter.id}`} className="home-timeline-item">
              <Link
                to={`/story/${chapter.id}`}
                className="home-timeline-row"
                onClick={() => rememberStoryScroll(chapter.id, location.pathname)}
              >
                <span aria-hidden="true" className="home-timeline-num">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="home-timeline-main">
                  <strong>{chapter.title}</strong>
                  <span className="home-timeline-line">{line}</span>
                </span>
                <span className={`home-timeline-status ${tone}`}>{status}</span>
                <span className="home-timeline-enter">
                  进入
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <p className="home-timeline-note">
          原创虚构串联，不对应某地完整仪式流程。章节里的文化信息都来自页内标注的条目与来源。
        </p>
      </section>

      {/* ---------- 悬浮 Agent：看到哪里就问哪里 ---------- */}
      <section className="home-section page-x mx-auto max-w-exhibit" aria-labelledby="ask-title">
        <div className="home-ask">
          <div className="home-ask-copy">
            <p className="home-eyebrow">
              <span aria-hidden="true" className="home-eyebrow-num">03</span>
              ASK · 上下文问答
            </p>
            <h2 id="ask-title">看到哪里，就问哪里</h2>
            <p className="home-section-desc">
              智能体会带上你当前所在的模块、条目和步骤，只依据站内资料回答，并给出可回看的来源。
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.dispatchEvent(new CustomEvent('laoye:ask-open'))}
            >
              打开问一问
            </button>
          </div>

          <div className="home-ask-panel glass">
            <p className="meta-label">可以现场这样问</p>
            <ul>
              <li>
                <span aria-hidden="true">?</span>
                这个角色是谁？
              </li>
              <li>
                <span aria-hidden="true">?</span>
                英歌和营老爷有什么联系？
              </li>
              <li>
                <span aria-hidden="true">?</span>
                这一步为什么这样做？
              </li>
              <li>
                <span aria-hidden="true">?</span>
                我刚才看了什么？
              </li>
            </ul>
            <p className="home-ask-note">资料不足时会直接说「不确定」，不编造现场信息。</p>
          </div>
        </div>
      </section>

      {!hasAnyContent ? (
        <p className="home-content-warning page-x mx-auto max-w-exhibit">
          内容还在准备中，页面结构可以先浏览。
        </p>
      ) : null}

      {/* ---------- 原始资料照片 ---------- */}
      <section className="home-section page-x mx-auto max-w-exhibit" aria-labelledby="raw-title">
        <details className="home-raw">
          <summary>
            <span className="exhibit-no">Archive · 原始资料照片</span>
            <span id="raw-title" className="home-raw-title">
              原始资料照片
            </span>
            <span className="meta-label">{HOME_RAW_PHOTOS.length} 张 · 点开看许可</span>
          </summary>

          <p className="home-raw-desc">这些实拍照片只作为授权资料记录，不承担首屏主视觉以外的叙事。</p>

          <ul className="home-raw-grid">
            {HOME_RAW_PHOTOS.map((media) => (
              <li key={media.id}>
                <figure className="home-raw-figure">
                  <img
                    src={media.src}
                    width={media.width}
                    height={media.height}
                    alt={media.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    <span className="text-[11px] text-muted">来源：</span>
                    <a href={media.page} target="_blank" rel="noopener noreferrer" className="link-inline">
                      {media.title}
                    </a>
                    <span>
                      {media.creator} ·{' '}
                      <a href={media.licenseUrl} target="_blank" rel="noopener noreferrer" className="link-inline">
                        {media.license}
                      </a>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>

          <p className="home-raw-note">
            照片来自 Wikimedia Commons，已自托管并做尺寸/格式优化；裁切版本沿用原许可。
          </p>
        </details>
      </section>
    </div>
  )
}
