import type { ReactNode } from 'react'

interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  /** 图片区比例，例如 '4 / 5' */
  ratio?: string
  priority?: boolean
  className?: string
  imageClassName?: string
  caption?: ReactNode
  children?: ReactNode
}

/**
 * 展品框：细线内框 + 纸面底，图片只做等比填充。
 * 不负责来源署名（用 SourceMeta），也不做任何装饰性遮罩。
 */
export default function MediaFrame({
  src,
  alt,
  width,
  height,
  ratio = '4 / 5',
  priority = false,
  className = '',
  imageClassName = '',
  caption,
  children,
}: Props) {
  return (
    <figure className={`relative m-0 overflow-hidden rounded-card border border-line bg-surface ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' as const } : {})}
        style={{ aspectRatio: ratio }}
        className={`block h-full w-full object-cover ${imageClassName}`}
      />
      {children}
      {caption ? (
        <figcaption className="border-t border-line bg-paper/90 px-4 py-3 text-xs leading-5 text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
