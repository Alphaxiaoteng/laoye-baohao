import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { entriesOfModule, entryHref } from '../lib/content'
import { moduleTitle } from '../lib/modules'
import { usePageContext, usePageTitle } from '../lib/usePageContext'
import { YINGGE_EXHIBIT_HOME, YINGGE_EXHIBITS } from '../features/yingge-static'
import { dishImage } from '../features/food/assets'
import { HOME_MODULE_MEDIA } from './homeMedia'
import './MuseumIndex.css'

/**
 * 文化馆首页：顶部按模块切换 + 内容单列。
 *
 * 版式约定：
 * - 每个模块先给一条「宽展项」横幅（真实照片为主体，标题 + 一句图注），
 *   再把它下面的条目逐条单列，左侧是图片/图谱，右侧压成标题 + 一句图注；
 * - 英歌舞不再复刻 React 版，横幅直达 8787 原生静态展 /exhibits/yingge/index.html；
 * - 切换只改 URL 上的 ?m=，原地过滤，不刷新页面、不改滚动位置。
 */

const TABS = [
  { id: 'all', label: '全部' },
  { id: 'yingge', label: '英歌舞' },
  { id: 'tea', label: '工夫茶' },
  { id: 'food', label: '潮汕美食' },
  { id: 'yinglaoye', label: '营老爷' },
] as const

type TabId = (typeof TABS)[number]['id']
type ModuleId = Exclude<TabId, 'all'>

/** 单列里每一行的左侧图形：照片 / 自绘插画 / 编号图谱 */
type Media =
  | { kind: 'photo'; src: string; alt: string; width: number; height: number }
  | { kind: 'art'; src: string; alt: string }
  | { kind: 'plate'; no: string; code: string }

interface Item {
  key: string
  href: string
  /** 原生静态页（8787 展），用 <a> 打开，不交给 SPA 路由 */
  native?: boolean
  title: string
  caption: string
  meta: string
  media: Media
}

interface Section {
  id: ModuleId
  /** 模块编号，如 01 */
  no: string
  title: string
  lead: Item
  items: Item[]
}

const PENDING = '内容待补充可靠来源'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function photoOf(id: ModuleId): Media {
  const media = HOME_MODULE_MEDIA[id]
  return {
    kind: 'photo',
    src: media.src,
    alt: media.alt,
    width: media.width,
    height: media.height,
  }
}

/** 条目尽量用自己的自绘图（美食有菜品插画），没有就退回编号图谱。 */
function entryMedia(entryId: string, no: string, code: string): Media {
  const art = dishImage(entryId)
  if (art) return { kind: 'art', src: art.src, alt: art.alt }
  return { kind: 'plate', no, code }
}

function buildSections(): Section[] {
  const yingge: Section = {
    id: 'yingge',
    no: '01',
    title: moduleTitle('yingge'),
    lead: {
      key: 'yingge-lead',
      href: YINGGE_EXHIBIT_HOME,
      native: true,
      title: '英歌舞 · 原生展',
      caption: '六个主题馆，原页原样打开',
      meta: '英歌舞 · 原生展',
      media: photoOf('yingge'),
    },
    items: YINGGE_EXHIBITS.map((hall, index) => ({
      key: `yingge-${hall.id}`,
      href: hall.href,
      native: true,
      title: hall.title,
      caption: hall.note,
      meta: `展馆 ${pad(index + 1)}`,
      media: { kind: 'plate', no: pad(index + 1), code: 'YINGGE' },
    })),
  }

  const tea: Section = {
    id: 'tea',
    no: '02',
    title: moduleTitle('tea'),
    lead: {
      key: 'tea-lead',
      href: '/museum/tea',
      title: '工夫茶',
      caption: '茶具、分步演示与斟茶示意',
      meta: '工夫茶 · 模块页',
      media: photoOf('tea'),
    },
    items: entriesOfModule('tea').map((entry, index) => ({
      key: `tea-${entry.id}`,
      href: entryHref(entry),
      title: entry.title,
      caption: entry.summary || PENDING,
      meta: `条目 ${pad(index + 1)}`,
      media: entryMedia(entry.id, pad(index + 1), 'TEA'),
    })),
  }

  const food: Section = {
    id: 'food',
    no: '03',
    title: moduleTitle('food'),
    lead: {
      key: 'food-lead',
      href: '/museum/food',
      title: '潮汕美食',
      caption: '菜品介绍与一道完整食谱',
      meta: '潮汕美食 · 模块页',
      media: photoOf('food'),
    },
    items: entriesOfModule('food').map((entry, index) => ({
      key: `food-${entry.id}`,
      href: entryHref(entry),
      title: entry.title,
      caption: entry.summary || PENDING,
      meta: `菜品 ${pad(index + 1)}`,
      media: entryMedia(entry.id, pad(index + 1), 'FOOD'),
    })),
  }

  const yinglaoye: Section = {
    id: 'yinglaoye',
    no: '04',
    title: moduleTitle('yinglaoye'),
    lead: {
      key: 'yinglaoye-lead',
      href: '/museum/yinglaoye',
      title: '营老爷·游神',
      caption: '称呼、巡境、队伍与地区案例',
      meta: '营老爷 · 模块页',
      media: photoOf('yinglaoye'),
    },
    items: entriesOfModule('yinglaoye').map((entry, index) => ({
      key: `yinglaoye-${entry.id}`,
      href: entryHref(entry),
      title: entry.title,
      caption: entry.summary || PENDING,
      meta: `条目 ${pad(index + 1)}`,
      media: entryMedia(entry.id, pad(index + 1), 'LAOYE'),
    })),
  }

  return [yingge, tea, food, yinglaoye]
}

function MediaBox({ media, className = '' }: { media: Media; className?: string }) {
  if (media.kind === 'photo') {
    return (
      <span className={`mz-media ${className}`}>
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          decoding="async"
        />
      </span>
    )
  }
  if (media.kind === 'art') {
    return (
      <span className={`mz-media mz-media-art ${className}`}>
        <img src={media.src} alt={media.alt} loading="lazy" decoding="async" />
      </span>
    )
  }
  return (
    <span className={`mz-media mz-plate ${className}`} aria-hidden="true">
      <span className="mz-plate-no">{media.no}</span>
      <span className="mz-plate-code">{media.code}</span>
      <span className="mz-plate-dot" />
    </span>
  )
}

function Row({ item }: { item: Item }) {
  const body = (
    <>
      <MediaBox media={item.media} />
      <span className="mz-row-copy">
        <h3 className="mz-row-title">{item.title}</h3>
      </span>
      <span className="mz-row-go" aria-hidden="true">
        →
      </span>
    </>
  )

  return (
    <li className="mz-row-item">
      {item.native ? (
        <a className="mz-row" href={item.href}>
          {body}
        </a>
      ) : (
        <Link className="mz-row" to={item.href}>
          {body}
        </Link>
      )}
    </li>
  )
}

function Banner({ section }: { section: Section }) {
  const { lead } = section
  const media = lead.media
  const inner = (
    <>
      {media.kind === 'photo' ? (
        <img
          className="mz-banner-img"
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <span className="mz-banner-shade" aria-hidden="true" />
      <span className="mz-banner-copy">
        <span className="mz-banner-meta">
          <span className="mz-banner-no">MOD. {section.no}</span>
          {lead.meta}
        </span>
        <h2 className="mz-banner-title">{lead.title}</h2>
        <span className="mz-banner-caption">{lead.caption}</span>
      </span>
      <span className="mz-banner-go" aria-hidden="true">
        →
      </span>
    </>
  )

  return lead.native ? (
    <a className="mz-banner" href={lead.href}>
      {inner}
    </a>
  ) : (
    <Link className="mz-banner" to={lead.href}>
      {inner}
    </Link>
  )
}

export default function MuseumIndex() {
  usePageTitle('文化馆')

  const [params, setParams] = useSearchParams()
  const raw = params.get('m')
  const active: TabId = TABS.some((t) => t.id === raw) ? (raw as TabId) : 'all'

  // 只在 tab 切到具体模块时上报上下文，供「问一问」使用
  usePageContext(
    active === 'all' ? {} : { module: active, moduleTitle: moduleTitle(active) },
  )

  const sections = useMemo(buildSections, [])
  const visible = active === 'all' ? sections : sections.filter((s) => s.id === active)

  // 原地过滤：只改 ?m=，不整页跳转，也不触发 App 的滚动归零
  const select = (id: TabId) => {
    const next = new URLSearchParams(params)
    if (id === 'all') next.delete('m')
    else next.set('m', id)
    setParams(next, { replace: true })
  }

  return (
    <div className="museum-page">
      <header className="museum-head">
        <p className="museum-eyebrow">
          <span aria-hidden="true" className="museum-eyebrow-rule" />
          MUSEUM · 四个模块
        </p>
        <h1 className="museum-title">文化馆</h1>
        <p className="museum-lead">先看图，再点进去。</p>
      </header>

      <div className="museum-tabs" role="group" aria-label="按模块筛选">
        {TABS.map((tab) => {
          const selected = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              className="museum-tab"
              aria-pressed={selected}
              onClick={() => select(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="museum-sections" aria-live="polite">
        {visible.map((section) => (
          <section key={section.id} className="museum-section" aria-label={section.title}>
            <Banner section={section} />

            {section.items.length > 0 ? (
              <ul className="mz-list">
                {section.items.map((item) => (
                  <Row key={item.key} item={item} />
                ))}
              </ul>
            ) : (
              <p className="mz-empty">这个模块的条目还在整理中，可以先到其他展馆看看。</p>
            )}
          </section>
        ))}
      </div>

      <p className="museum-note">照片已自托管，图示为示意图；地区与出处写在详情页。</p>
    </div>
  )
}
