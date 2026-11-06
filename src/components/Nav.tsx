import { Link, NavLink } from 'react-router-dom'

/** 顶栏六入口：四个主演示 + 攻略 + 文献汇总；听潮收在右下角 Agent 里 */
const LINKS = [
  { to: '/museum/yingge', label: '英歌舞' },
  { to: '/museum/tea', label: '工夫茶' },
  { to: '/museum/food', label: '潮汕美食' },
  { to: '/museum/yinglaoye', label: '营老爷' },
  { to: '/guide', label: '攻略' },
  { to: '/docs', label: '文献汇总' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="glass mx-auto flex w-full max-w-exhibit flex-wrap items-center gap-2 rounded-2xl px-2.5 py-1.5 sm:flex-nowrap sm:gap-3 sm:px-3">
        <Link
          to="/"
          className="group flex min-h-[44px] min-w-0 shrink-0 items-center gap-2.5 rounded-xl px-1.5 no-underline"
          aria-label="老爷保号，回到首页"
        >
          <img
            src="/exhibits/yingge/assets/museum-mark-v3.svg"
            alt=""
            aria-hidden="true"
            className="h-8 w-8 shrink-0 transition-transform duration-200 ease-exhibit group-hover:scale-105"
          />
          <span className="flex min-w-0 flex-col justify-center leading-none">
            <span className="truncate font-serif text-[17px] font-semibold tracking-[0.03em] text-ink">
              老爷保号
            </span>
            <span className="mt-1 hidden text-[10.5px] leading-none tracking-[0.08em] text-faint md:block">
              跟着故事走进潮汕文化
            </span>
          </span>
        </Link>

        <nav
          aria-label="主导航"
          className="order-3 -mx-1 flex w-full basis-full items-center gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:order-none sm:mx-0 sm:w-auto sm:basis-auto sm:justify-end sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden"
        >
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  'relative inline-flex min-h-[44px] flex-none items-center whitespace-nowrap rounded-xl px-1.5 text-[12.5px] no-underline transition-colors duration-200 ease-exhibit sm:px-3 sm:text-[14px]',
                  isActive
                    ? 'bg-white/10 text-ink'
                    : 'text-muted hover:bg-white/[0.07] hover:text-ink',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <span className="ml-auto hidden sm:block" aria-hidden="true" />
      </div>
    </header>
  )
}
