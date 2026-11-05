import { Link } from 'react-router-dom'
import { sourceById } from '../lib/content'

interface Props {
  ids?: string[]
  className?: string
}

/**
 * 来源编号徽标。只显示 sources.json 里真实存在的条目，避免凭空生成引用。
 */
export function SourceBadges({ ids = [], className = '' }: Props) {
  const valid = ids
    .map((id) => sourceById(id))
    .filter((s): s is NonNullable<ReturnType<typeof sourceById>> => Boolean(s))
  if (valid.length === 0) return null
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="来源编号">
      {valid.map((source) => (
        <li key={source.id}>
          <Link
            to={`/sources#${source.id}`}
            className="chip no-underline hover:border-brick hover:text-brick"
            title={`${source.title}${source.org ? ` · ${source.org}` : ''}`}
          >
            <span className="font-medium">[{source.id}]</span>
            <span className="max-w-[14rem] truncate">{source.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** 来源清单：标题 / 机构 / 外链 / 访问日期 / 适用地区 */
export function SourceList({ ids = [] }: Props) {
  const valid = ids
    .map((id) => sourceById(id))
    .filter((s): s is NonNullable<ReturnType<typeof sourceById>> => Boolean(s))
  if (valid.length === 0) {
    return <p className="text-sm text-muted">该内容暂未登记来源，页面会显示「待核验」。</p>
  }
  return (
    <ul className="space-y-3">
      {valid.map((source) => (
        <li key={source.id} className="text-sm leading-6">
          <span className="mr-1 font-medium text-ink">[{source.id}]</span>
          {source.url ? (
            <a
              className="link-inline"
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {source.title}
            </a>
          ) : (
            <span>{source.title}</span>
          )}
          <span className="text-muted">
            {source.org ? ` · ${source.org}` : ''}
            {source.region ? ` · 适用范围：${source.region}` : ''}
            {source.accessDate ? ` · 访问日期：${source.accessDate}` : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}
