import type { ReactNode } from 'react'

interface Props {
  /** 资料类型，如「原始资料照片 · Wikimedia Commons」 */
  label: string
  href?: string
  /** 许可 / 作者等补充文本 */
  note?: string
  className?: string
  children: ReactNode
}

/**
 * 资料署名行：小号标签 + 标题/链接 + 许可说明。
 * 用于原始资料照片，许可信息必须完整显示。
 */
export default function SourceMeta({ label, href, note, className = '', children }: Props) {
  return (
    <p className={`flex flex-col gap-1 text-xs leading-5 text-muted sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2 ${className}`}>
      <span className="meta-label">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="link-inline break-words"
        >
          {children}
        </a>
      ) : (
        <span className="break-words text-ink">{children}</span>
      )}
      {note ? <span className="text-faint">{note}</span> : null}
    </p>
  )
}
