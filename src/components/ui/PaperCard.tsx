import type { ReactNode } from 'react'

interface Props {
  as?: 'div' | 'article' | 'li'
  /** 悬停时描一层细线并上移 3px */
  interactive?: boolean
  /** 默认带 20px 内边距；图片卡可关掉自己排版 */
  padded?: boolean
  className?: string
  children: ReactNode
}

/**
 * 纸面卡片：8px 圆角、1px 细线、无阴影。
 * 交互态只做 outline + 位移，不做缩放。
 */
export default function PaperCard({
  as: Tag = 'div',
  interactive = false,
  padded = true,
  className = '',
  children,
}: Props) {
  return (
    <Tag
      className={[
        'card',
        padded ? '' : '!p-0',
        interactive ? 'card-link' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
