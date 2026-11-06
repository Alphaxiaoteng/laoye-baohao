import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { XiaochuiSprite } from './ask/XiaochuiSprite'

/** 顶栏：四个主演示 + 听潮 + 攻略 + 历史介绍 + Skill。听潮与英歌、工夫茶、文档同级，不进潮Bot。 */
const LINKS = [
  { to: '/museum/yingge', label: '英歌舞' },
  { to: '/museum/tea', label: '工夫茶' },
  { to: '/museum/food', label: '潮汕美食' },
  { to: '/museum/yinglaoye', label: '营老爷' },
  { to: '/listen', label: '听潮' },
  { to: '/guide', label: '攻略' },
  { to: '/docs', label: '历史介绍' },
  { to: '/skill', label: 'Skill' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="glass mx-auto flex w-full max-w-exhibit flex-row items-center gap-2 rounded-2xl px-3 py-2">
        <Link to="/" className="site-nav-lockup group" aria-label="老爷保号，回到首页">
          <img
            src="/exhibits/yingge/assets/museum-mark-v3.svg"
            alt=""
            aria-hidden="true"
            className="site-nav-emblem"
          />
          <span className="site-nav-lockup-rule" aria-hidden="true" />
          <span className="site-nav-lockup-type">
            <span className="site-nav-brand">老爷保号</span>
            <span className="site-nav-kicker">跟着故事走进潮汕文化</span>
          </span>
        </Link>

        <nav
          aria-label="主导航"
          className="site-nav-desktop flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  'site-nav-link',
                  link.to === '/skill' ? 'site-nav-link-en' : 'site-nav-link-cn',
                  isActive ? 'is-active' : '',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/admin"
          className={({ isActive }) => `site-nav-admin${isActive ? ' is-active' : ''}`}
          aria-label="切换到管理后台"
        >
          后台
        </NavLink>
        <button
          type="button"
          className="site-nav-bot"
          onClick={() => window.dispatchEvent(new CustomEvent('laoye:ask-open'))}
          aria-label="打开潮Bot"
        >
          <span aria-hidden="true" className="site-nav-bot-figure">
            <XiaochuiSprite height={26} decorative />
          </span>
          潮Bot
        </button>
        <span className="site-nav-menu-slot">
          <button
            ref={menuButtonRef}
            type="button"
            className="site-nav-menu-toggle"
            aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={menuOpen}
            aria-controls="site-nav-mobile-panel"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="site-nav-menu-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </span>
      </div>
      {menuOpen && (
        <div
          className="site-nav-mobile-layer"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMenuOpen(false)
          }}
        >
          <nav id="site-nav-mobile-panel" className="glass site-nav-mobile-panel" aria-label="主导航">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `site-nav-mobile-link${isActive ? ' is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `site-nav-mobile-link${isActive ? ' is-active' : ''}`}
            >
              管理后台
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  )
}
