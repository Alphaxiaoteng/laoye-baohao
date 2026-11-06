import type { ReactNode } from 'react'

interface Props {
  /** 章节编号，如 01 */
  index?: string
  /** 小号英文标签 */
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  id?: string
  className?: string
}

/**
 * 分区标题：细线上沿 + 编号 + 标题 + 说明，右侧可放一个文字入口。
 */
export default function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  action,
  id,
  className = '',
}: Props) {
  return (
    <div className={`flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10 ${className}`}>
      <div className="min-w-0">
        <p className="flex items-center gap-3">
          {index ? <span className="font-mono text-xs tracking-[0.16em] text-brick">{index}</span> : null}
          {eyebrow ? <span className="exhibit-no">{eyebrow}</span> : null}
        </p>
        <h2
          id={id}
          className="mt-2 font-serif text-[clamp(1.9rem,3.6vw,3rem)] font-semibold leading-tight tracking-[-0.02em] text-ink"
        >
          {title}
        </h2>
        {description ? <p className="mt-2 max-w-[42rem] text-base leading-7 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
