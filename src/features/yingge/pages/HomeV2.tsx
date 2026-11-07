import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePageContext, usePageTitle } from '../../../lib/usePageContext'
import { FormationStage } from '../components/FormationStage'
import { TEAM_ROLES } from '../data'
import './yingge-home.css'
import './yingge-story.css'

/** 下滑导航：锚点仍在，便于旧链接与会话记忆跳段 */
const QUICK_NAV = [
  { href: '#museum', label: '数字馆' },
  { href: '#formation', label: '阵形' },
  { href: '#roles', label: '角色' },
]

/** 下滑到视口时淡入：只切换 class，不做滚动劫持 */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (targets.length === 0) return
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) {
            record.target.classList.add('is-in')
            observer.unobserve(record.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

/** 点「开启」之后的展厅页。播放器读父页面的这个值，从该页起始帧直接播放。 */
const MUGEDA_ENTRY_PAGE = '15otp1rcl1u'
const MUGEDA_PAGE = '/exhibits/yingge/mugeda/index.html'
const MUGEDA_SRC = '/exhibits/yingge/mugeda/index.html?embed=1'

type MugedaParentWindow = Window & { mugedaEntryPage?: string }

type LaoyeTour = {
  ready: () => boolean
  count: () => number
  index: () => number
  go: (index: number) => boolean
}

function readTour(frame: HTMLIFrameElement | null) {
  try {
    const tour = (frame?.contentWindow as (Window & { laoyeTour?: LaoyeTour }) | null)?.laoyeTour
    return tour?.ready() ? tour : null
  } catch {
    return null
  }
}

function YinggeMuseum() {
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const [src, setSrc] = useState<string | null>(null)
  const [tourIndex, setTourIndex] = useState(0)
  const [tourCount, setTourCount] = useState(0)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<HTMLIFrameElement | null>(null)

  if (typeof window !== 'undefined') {
    ;(window as MugedaParentWindow).mugedaEntryPage = MUGEDA_ENTRY_PAGE
  }

  useEffect(() => {
    ;(window as MugedaParentWindow).mugedaEntryPage = MUGEDA_ENTRY_PAGE
    setSrc(MUGEDA_SRC)
    return () => {
      delete (window as MugedaParentWindow).mugedaEntryPage
    }
  }, [])

  useEffect(() => {
    if (loaded) return undefined
    const timer = window.setTimeout(() => setSlow(true), 8000)
    return () => window.clearTimeout(timer)
  }, [loaded])

  useEffect(() => {
    if (!loaded) return undefined
    const sync = () => {
      const tour = readTour(frameRef.current)
      if (!tour) return
      setTourCount(tour.count())
      setTourIndex(tour.index())
    }
    sync()
    const timer = window.setInterval(sync, 400)
    return () => window.clearInterval(timer)
  }, [loaded])

  function moveTour(index: number) {
    const tour = readTour(frameRef.current)
    if (!tour) return
    const next = Math.max(0, Math.min(tour.count() - 1, index))
    if (!tour.go(next)) return
    setTourIndex(next)
    setTourCount(tour.count())
  }

  function stepTour(direction: -1 | 1) {
    const tour = readTour(frameRef.current)
    if (!tour) return
    moveTour(tour.index() + direction)
  }

  async function enterFullscreen() {
    const el = stageRef.current
    if (!el) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await el.requestFullscreen()
    } catch {
      // 浏览器拒绝全屏时不影响页面内浏览
    }
  }

  return (
    <>
      <section id="museum" className="ys-stage-section" data-reveal>
        <div className="ys-stage-head">
          <div>
            <h2 className="font-serif text-2xl text-ink">云游英歌舞</h2>
            <p className="mt-1 text-xs leading-6 text-muted">
              离线镜像自原发布页，全部资源已本地托管。进入后直接播放展厅。浏览器若拦截有声自动播放，只影响声音。
            </p>
          </div>
          <button type="button" className="btn-secondary !min-h-[40px] !text-sm" onClick={enterFullscreen}>
            全屏观看
          </button>
        </div>

        <div ref={stageRef} className="ys-stage">
          {!loaded ? (
            <div className="ys-loading" role="status" aria-live="polite">
              <span className="ys-spinner" aria-hidden="true" />
              <span className="flex flex-col items-center gap-2">
                <span>数字馆加载中…</span>
                {slow ? (
                  <a href={MUGEDA_PAGE} target="_blank" rel="noopener noreferrer" className="ys-fallback-link">
                    加载较慢？在新窗口打开
                  </a>
                ) : null}
              </span>
            </div>
          ) : null}
          {src ? (
            <iframe
              ref={frameRef}
              src={src}
              title="云游英歌舞"
              className={loaded ? 'is-loaded' : ''}
              onLoad={() => setLoaded(true)}
              allow="autoplay; fullscreen"
            />
          ) : null}
          <div className="ys-stage-nav">
            <button type="button" onClick={() => stepTour(-1)} disabled={tourCount === 0 || tourIndex <= 0}>
              后退
            </button>
            <button type="button" onClick={() => moveTour(0)} disabled={tourCount === 0}>
              返回
            </button>
            <button type="button" onClick={() => stepTour(1)} disabled={tourCount === 0 || tourIndex >= tourCount - 1}>
              前进
            </button>
          </div>
        </div>
        <p className="mt-2 text-[11.5px] leading-6 text-muted">
          展内内容与署名由原始项目提供。
        </p>
      </section>
    </>
  )
}

const ROLE_ICONS = [
  { id: 'captain', src: '/media/yingge/objects/icon-command-flag.webp' },
  { id: 'coach', src: '/media/yingge/objects/icon-clubs.webp' },
  { id: 'makeup', src: '/media/yingge/objects/icon-painted-face.webp' },
  { id: 'director', src: '/media/yingge/objects/icon-drum.webp' },
  { id: 'lead', src: '/media/yingge/objects/icon-gong.webp' },
  { id: 'baton', src: '/media/yingge/roles/second-club.webp' },
  { id: 'troupe', src: '/media/yingge/roles/performer-alley.webp' },
  { id: 'band', src: '/media/yingge/objects/icon-gong.webp' },
] as const

function RolesSwitcher() {
  const [index, setIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const count = TEAM_ROLES.length

  function step(direction: number) {
    setIndex((current) => (current + direction + count) % count)
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    let lockedUntil = 0
    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (Math.abs(delta) < 4) return
      event.preventDefault()
      const now = performance.now()
      if (now < lockedUntil) return
      lockedUntil = now + 280
      step(delta > 0 ? 1 : -1)
    }
    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [count])

  const role = TEAM_ROLES[index]
  const icon = ROLE_ICONS[index]

  return (
    <div ref={rootRef} className="yh-role-switch" role="region" aria-label="队伍角色，左右切换">
      <button type="button" className="yh-role-arrow" onClick={() => step(-1)} aria-label="上一个角色">
        上一个
      </button>
      <figure className="yh-role-frame">
        <img src={icon?.src ?? '/media/yingge/objects/icon-command-flag.webp'} alt="" />
        <figcaption>{role?.name}</figcaption>
      </figure>
      <button type="button" className="yh-role-arrow" onClick={() => step(1)} aria-label="下一个角色">
        下一个
      </button>
    </div>
  )
}

export default function YinggeHome() {
  usePageTitle('英歌舞')
  usePageContext({ module: 'yingge', moduleTitle: '英歌舞' })
  const location = useLocation()
  const navigate = useNavigate()
  const revealRoot = useReveal<HTMLDivElement>()

  useEffect(() => {
    const id = location.hash.replace(/^#/, '')
    if (id === 'story') {
      navigate('/docs#doc-yingge-story', { replace: true })
      return undefined
    }
    if (!id) return undefined
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'auto' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, navigate])

  return (
    <div ref={revealRoot} className="yingge-home">
      <header className="yh-hero">
        <div className="yh-hero-copy" data-reveal>
          <h1 className="font-serif text-[30px] font-semibold leading-tight text-ink sm:text-[40px]">英歌舞</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted">
            英歌是流传于广东、福建等地的民间广场舞蹈，2006 年以「英歌」列入第一批国家级非物质文化遗产名录（Ⅲ—8）。
          </p>
          <nav className="yh-quicknav" aria-label="本页段落">
            {QUICK_NAV.map((item) => (
              <a key={item.href} href={item.href} className="yh-quicknav-a">
                {item.label}
              </a>
            ))}
            <Link to="/docs#doc-yingge-story" className="yh-quicknav-a">
              叙事线索
            </Link>
          </nav>
        </div>
      </header>

      {/* 01 数字馆 */}
      <YinggeMuseum />

      <section id="formation" className="yh-section" data-reveal>
        <div className="yh-section-head">
          <span className="yh-index">02</span>
          <h2>阵形</h2>
        </div>
        <div className="yh-panel">
          <FormationStage tall />
        </div>
      </section>

      <section id="roles" className="yh-section" data-reveal>
        <div className="yh-section-head">
          <span className="yh-index">03</span>
          <h2>角色</h2>
        </div>
        <RolesSwitcher />
      </section>

      <section className="ys-sources" data-reveal>
        <h2 className="section-title">继续探索</h2>
        <p>阵形、角色、影像与锣鼓可以在本站继续查看。</p>
      </section>
    </div>
  )
}
