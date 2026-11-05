import { NavLink } from 'react-router-dom'

const LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: '首页', end: true },
  { to: '/story', label: '跟故事走' },
  { to: '/museum', label: '文化馆' },
  { to: '/listen', label: '听潮' },
  { to: '/journal', label: '我的手记' },
  { to: '/sources', label: '资料来源' },
  { to: '/about', label: '关于' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-content flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <NavLink to="/" className="flex items-baseline gap-2 no-underline" aria-label="老爷保号，回到首页">
          <span className="font-serif text-xl font-bold tracking-wide text-brick">老爷保号</span>
          <span className="hidden text-xs text-muted sm:inline">跟着故事，走进潮汕文化</span>
        </NavLink>

        <nav aria-label="主导航" className="-mx-1 overflow-x-auto">
          <ul className="flex items-center gap-1 whitespace-nowrap px-1">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    [
                      'inline-flex min-h-[44px] items-center rounded-full px-3 text-sm transition-colors no-underline',
                      isActive
                        ? 'bg-brick/10 font-medium text-brick'
                        : 'text-ink-soft hover:bg-white/70 hover:text-ink',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
