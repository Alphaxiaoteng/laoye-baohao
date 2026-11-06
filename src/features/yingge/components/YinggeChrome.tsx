import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

const NAV: { to: string; label: string; end?: boolean }[] = [
  { to: '/museum/yingge', label: '模块首页', end: true },
  { to: '/museum/yingge/formations', label: '阵形' },
  { to: '/museum/yingge/roles', label: '角色器物' },
  { to: '/museum/yingge/watch', label: '影像' },
  { to: '/museum/yingge/sound', label: '锣鼓' },
]

/**
 * 模块内导航：替代通用模块页，只在 /museum/yingge 下出现。
 * 样式与全站顶栏一致：44px 触控高度、当前项用朱砂细线标记，不做色块填充。
 */
export function YinggeNav() {
  return (
    <nav aria-label="英歌模块导航" className="no-scrollbar -mx-1 overflow-x-auto">
      <ul className="flex items-center gap-0.5 whitespace-nowrap px-1">
        {NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'relative inline-flex min-h-[44px] items-center rounded-control px-3 text-sm no-underline transition-colors duration-200 ease-exhibit',
                  isActive
                    ? 'text-ink after:absolute after:inset-x-3 after:bottom-[10px] after:h-px after:bg-brick'
                    : 'text-muted hover:bg-hover hover:text-ink',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function YinggeBreadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="面包屑" className="text-sm text-muted">
      <Link to="/museum" className="link-inline">
        文化馆
      </Link>
      <span className="mx-2" aria-hidden="true">
        /
      </span>
      <Link to="/museum/yingge" className="link-inline">
        英歌舞
      </Link>
      <span className="mx-2" aria-hidden="true">
        /
      </span>
      <span>{current}</span>
    </nav>
  )
}

interface HeaderProps {
  kicker: string
  title: string
  lead: ReactNode
  current: string
}

export function YinggeHeader({ kicker, title, lead, current }: HeaderProps) {
  return (
    <header className="space-y-4">
      <YinggeBreadcrumb current={current} />
      <div className="max-w-3xl space-y-3">
        <p className="text-xs tracking-[0.3em] text-brick">{kicker}</p>
        <h1 className="font-serif text-3xl leading-snug text-ink">{title}</h1>
        <div className="text-base leading-8 text-ink-soft">{lead}</div>
      </div>
      <YinggeNav />
    </header>
  )
}

/** 来源展示已从产品 UI 移除；保留该导出以兼容既有模块边界。 */
export function SourceNote(_props: { children: ReactNode }) {
  return null
}

export function PageSection({
  id,
  title,
  intro,
  children,
}: {
  id?: string
  title: string
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id ? `${id}-title` : undefined} className="space-y-4">
      <div className="max-w-3xl space-y-2">
        <h2 id={id ? `${id}-title` : undefined} className="section-title">
          {title}
        </h2>
        {intro ? <p className="text-base leading-8 text-ink-soft">{intro}</p> : null}
      </div>
      {children}
    </section>
  )
}
