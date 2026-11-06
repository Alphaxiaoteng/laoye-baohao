import type { ReactNode } from 'react'

interface Props {
  /** 小号英文编号，如 EXHIBIT 00 */
  eyebrow?: string
  title: string
  subtitle?: string
  lead?: string
  actions?: ReactNode
  /** 右侧纸绘插画 / 展板 */
  aside?: ReactNode
  /** 标题下方的事实行、进度等 */
  children?: ReactNode
  titleId?: string
}

/**
 * 展览式首屏：左文右图，纸面底、细线分隔。
 * 只负责版式，不读取任何进度或内容状态。
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  lead,
  actions,
  aside,
  children,
  titleId = 'page-hero-title',
}: Props) {
  return (
    <section
      className="page-x mx-auto grid max-w-exhibit items-center gap-10 pb-12 pt-10 sm:gap-14 sm:pb-16 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] lg:gap-20 lg:pb-20 lg:pt-16"
      aria-labelledby={titleId}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="flex items-center gap-3">
            <span aria-hidden="true" className="seal-rule" />
            <span className="exhibit-no">{eyebrow}</span>
          </p>
        ) : null}

        <h1
          id={titleId}
          className="mt-6 font-serif text-[clamp(3.5rem,8.4vw,8rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink"
        >
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-5 font-serif text-[clamp(1.25rem,2.1vw,1.85rem)] leading-snug text-ink">
            {subtitle}
          </p>
        ) : null}

        {lead ? <p className="mt-5 max-w-[32rem] text-base leading-8 text-muted">{lead}</p> : null}

        {actions ? <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-5">{actions}</div> : null}

        {children}
      </div>

      {aside ? <div className="min-w-0">{aside}</div> : null}
    </section>
  )
}
