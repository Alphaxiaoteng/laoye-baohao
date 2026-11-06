import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Entry } from '../../../types/content'
import { entryBodyState, entryHref } from '../../../lib/content'
import VerifyBadge from '../../../components/VerifyBadge'
import type { IntroCardMeta } from '../data'

interface Props {
  entry: Entry
  meta: IntroCardMeta
  defaultOpen?: boolean
}

/**
 * 首页知识卡：标题 / 摘要 / 地区 / 年份 常显，正文默认收起。
 * 展开用原生 button + aria-expanded，键盘可直接操作，不做自动动画。
 */
export default function KnowledgeCard({ entry, meta, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()
  const body = entryBodyState(entry)

  return (
    <article className="card flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-lg leading-snug text-ink">{entry.title}</h3>
        <VerifyBadge verify={entry.verify} compact />
      </div>

      <p className="mt-2 text-sm leading-6 text-ink-soft">
        {entry.summary || '内容待补充可靠来源'}
      </p>

      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="shrink-0 font-medium text-muted">地区</dt>
          <dd className="text-ink-soft">{meta.regionLabel}</dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="shrink-0 font-medium text-muted">原文年份</dt>
          <dd className="text-ink-soft">{meta.years}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="btn-quiet mt-3 self-start px-3 text-sm"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${open ? '收起' : '展开'}「${entry.title}」的说明`}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {open ? '−' : '+'}
        </span>
        {open ? '收起说明' : '展开说明'}
      </button>

      {open ? (
        <div
          id={panelId}
          className="mt-2 rounded-xl border border-line bg-cream-dark/40 p-3"
        >
          {body.placeholder ? (
            <p className="text-sm leading-6 text-brick">{body.text}</p>
          ) : (
            <p className="text-sm leading-7 text-ink-soft">{body.text}</p>
          )}
          <p className="mt-2 text-xs text-muted">
            年份与地区按来源原文表述；旧日期不能当作今年的活动日程。
          </p>
        </div>
      ) : null}

      <Link to={entryHref(entry)} className="mt-auto pt-3 text-sm link-inline">
        完整条目与来源 →
      </Link>
    </article>
  )
}
