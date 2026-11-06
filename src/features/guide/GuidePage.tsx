import { useMemo, useState } from 'react'
import { GUIDE_CITIES, GUIDE_KINDS, guideItems, type GuideItem } from './guideData'
import { usePageTitle } from '../../lib/usePageContext'
import './guide.css'

const KIND_LABEL: Record<GuideItem['kind'], string> = {
  guide: '行程攻略',
  food: '美食合集',
  recipe: '家常做法',
}

/** 三个主流城市分区展示；跨市的「潮汕」攻略单独一个区 */
const CITY_SECTIONS: { key: string; title: string; blurb: string }[] = [
  { key: '潮州', title: '潮州', blurb: '广济桥、牌坊街与青龙古庙一线' },
  { key: '汕头', title: '汕头', blurb: '小公园开埠区、南澳岛与牛肉火锅' },
  { key: '揭阳', title: '揭阳', blurb: '进贤门、揭阳学宫与普宁英歌' },
  { key: '潮汕', title: '跨市连线', blurb: '一次跑两三个城市的长线行程' },
]

function formatCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n >= 10000) return `${(n / 10000).toFixed(1)} 万`
  return String(n)
}

export default function GuidePage() {
  usePageTitle('潮汕攻略')
  const [city, setCity] = useState<(typeof GUIDE_CITIES)[number]>('全部')
  const [kind, setKind] = useState<'all' | GuideItem['kind']>('all')

  const filtered = useMemo(
    () =>
      guideItems.filter(
        (item) => (city === '全部' || item.city === city) && (kind === 'all' || item.kind === kind),
      ),
    [city, kind],
  )

  /** 默认视图：按三城 + 跨市分区；用户筛了具体城市就只显示该区 */
  const sections = useMemo(() => {
    if (city !== '全部') {
      return [{ key: city, title: city, blurb: '', items: filtered }]
    }
    return CITY_SECTIONS.map((s) => ({
      ...s,
      items: filtered.filter((item) => item.city === s.key),
    })).filter((s) => s.items.length > 0)
  }, [city, filtered])

  return (
    <div className="space-y-8">
      <header className="guide-hero">
        <p className="text-xs tracking-[0.3em] text-brick">潮汕攻略</p>
        <h1 className="mt-3 font-serif text-[26px] leading-[1.3] text-ink sm:text-[38px]">
          潮州 · 汕头 · 揭阳，别人走过的路
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink-soft">
          这些行程来自小红书上真实发布的图文，经过去广告、去软文与要点摘录后收录；
          每条保留原作者、原帖链接与发布时间，只作路线参考，不代表本站核验过店家的实时营业状态。
        </p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-faint">收录篇数</dt>
            <dd className="mt-1 font-serif text-xl text-ink">{guideItems.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-faint">覆盖地区</dt>
            <dd className="mt-1 font-serif text-xl text-ink">
              {new Set(guideItems.map((g) => g.city)).size}
            </dd>
          </div>
          <div aria-live="polite">
            <dt className="text-xs text-faint">当前筛选</dt>
            <dd className="mt-1 font-serif text-xl text-ink">{filtered.length}</dd>
          </div>
        </dl>
      </header>

      <section aria-label="筛选" className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-faint">城市</span>
          {GUIDE_CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCity(c)}
              aria-pressed={city === c}
              className={`guide-chip ${city === c ? 'is-active' : ''}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-faint">类型</span>
          {GUIDE_KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              aria-pressed={kind === k.id}
              className={`guide-chip ${kind === k.id ? 'is-active' : ''}`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </section>

      {sections.length === 0 ? (
        <div className="card">
          <p className="text-sm text-ink-soft">这个组合下还没有收录的攻略，换个城市或类型看看。</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.key} aria-label={section.title}>
              <header className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 className="font-serif text-xl text-ink sm:text-2xl">{section.title}</h2>
                {section.blurb ? (
                  <p className="text-xs text-faint">{section.blurb}</p>
                ) : null}
                <span className="ml-auto text-xs text-muted">{section.items.length} 篇</span>
              </header>
              <ul className="guide-grid">
                {section.items.map((item, index) => (
                  <li key={item.id} style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}>
                    <article className="guide-card">
                      <div className="guide-cover">
                        {item.cover ? (
                          <img
                            src={item.cover}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            width={900}
                            height={675}
                            onError={(event) => {
                              // 图片缺失时保留深色底，不要让破图标破坏卡片
                              event.currentTarget.style.visibility = 'hidden'
                            }}
                          />
                        ) : (
                          <span className="guide-cover-fallback" aria-hidden="true">
                            老爷保号
                          </span>
                        )}
                        <span className="guide-city">{item.city}</span>
                        <span className="guide-kind">{KIND_LABEL[item.kind]}</span>
                      </div>
                      <div className="guide-body">
                        <h2 className="guide-title">{item.title}</h2>
                        <p className="guide-excerpt">{item.excerpt || '原帖以图片为主，点开原帖查看完整行程。'}</p>
                        <div className="guide-meta">
                          <span>♡ {formatCount(item.likes)}</span>
                          <span>☆ {formatCount(item.collects)}</span>
                          <span>{item.publishedAt || '日期不详'}</span>
                        </div>
                        <div className="guide-foot">
                          <span className="guide-author">@{item.author}</span>
                          <a
                            href={item.noteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="guide-link"
                          >
                            来源：小红书原帖 ↗
                          </a>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <section className="guide-note">
        <h2 className="section-title">关于这些攻略</h2>
        <p>
          内容为原帖要点摘录，不是全文镜像；版权归各原作者所有。封面图仅作来源示意，已自托管以避免热链。
          行程里的价格、营业时间、门票与交通随时会变，出发前请以商家与官方公告为准。
        </p>
        <p>
          想看有出处、经过核验的文化条目，请到{' '}
          <a href="/docs" className="link-inline">
            文献汇总
          </a>{' '}
          或{' '}
          <a href="/sources" className="link-inline">
            资料来源
          </a>
          。
        </p>
      </section>
    </div>
  )
}
