import { Link } from 'react-router-dom'
import { entryById, entryHref } from '../../../lib/content'
import { PHOTO_NOTE, type CityCase } from '../data'

interface Props {
  item: CityCase
}

/**
 * 三城案例卡：实拍图在上、城市名 / 原文时间 / 一句要点在下。
 * 整张卡是一个链接，点任意位置都进对应条目详情；图片 hover 只轻微放大。
 * 图上不写文化结论，时间与年份照来源原文，避免被当成今年的日程。
 */
export default function CityCaseCard({ item }: Props) {
  const entry = entryById(item.entryId)
  if (!entry) return null

  return (
    <Link
      to={entryHref(entry)}
      className="card-link group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white/5 no-underline"
    >
      <img
        src={item.image}
        alt={item.alt}
        width={item.width}
        height={item.height}
        loading="lazy"
        style={item.focus ? { objectPosition: item.focus } : undefined}
        className="aspect-[4/3] w-full object-cover transition-transform duration-200 ease-exhibit group-hover:scale-[1.03]"
      />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs tracking-[0.18em] text-brick">地方案例</p>
        <h3 className="font-serif text-xl leading-snug text-ink">{item.city}</h3>
        <p className="text-xs text-muted">
          {item.time} · {item.year}
        </p>
        <p className="text-sm leading-6 text-ink-soft">{item.point}</p>
        <p className="mt-auto pt-1 text-xs leading-5 text-muted">{PHOTO_NOTE}</p>
        <span className="text-sm link-inline">看条目与来源 →</span>
      </div>
    </Link>
  )
}
