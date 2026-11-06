import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../lib/usePageContext'
import { guideArticles, type GuideArticle } from './knowledge'
import FoodGlyph from './FoodGlyphs'
import RouteSketch from './RouteSketch'
import './guide.css'

/** 没有可靠实拍时用的头图：只是纸面上的结构示意，不冒充现场照片 */
function CoverArt() {
  return (
    <svg className="guide-cover-art" viewBox="0 0 320 200" aria-hidden="true" focusable="false">
      <path className="guide-cover-sea" d="M0 132c40-14 70 10 106-2s66-18 100-4 74 6 114-6v82H0z" />
      <path className="guide-cover-wave" d="M0 152c44-12 74 12 116 0s72-14 110 0 62 8 94-2" />
      <path className="guide-cover-wave" d="M0 168c44-12 74 12 116 0s72-14 110 0 62 8 94-2" />
      <circle className="guide-cover-sun" cx="246" cy="52" r="20" />
      <path className="guide-cover-beam" d="M60 132V96l16-12 16 12v36" />
      <path className="guide-cover-beam" d="M92 132V96" />
    </svg>
  )
}

function GuideCard({ article, onOpen }: { article: GuideArticle; onOpen: (id: string) => void }) {
  return (
    <article className="guide-card">
      <div className="guide-card-media">
        {article.cover ? (
          <img
            className="guide-card-img"
            src={article.cover.src}
            alt={article.cover.alt}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <CoverArt />
        )}
      </div>

      <div className="guide-card-body">
        <p className="guide-kicker">
          <span className="guide-kicker-city">{article.city}</span>
          <span>{article.theme}</span>
          <span>{article.eyebrow}</span>
        </p>
        <h2 className="guide-card-title">{article.title}</h2>
        <p className="guide-card-dek">{article.dek}</p>
        <p className="guide-card-meta">
          <span>{article.duration}</span>
          <span>{article.season}</span>
        </p>
        <button
          type="button"
          className="guide-open"
          onClick={() => onOpen(article.id)}
          aria-label={`阅读指南：${article.title}`}
        >
          读这篇
          <span className="guide-open-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </article>
  )
}

/** 阅读视图单独导出，方便渲染测试直接检查单篇内容 */
export function GuideReader({ article, onBack }: { article: GuideArticle; onBack: () => void }) {
  const routeHeadingId = `${article.id}-route`
  const foodHeadingId = `${article.id}-food`
  const cautionHeadingId = `${article.id}-cautions`
  const photoHeadingId = `${article.id}-photos`

  return (
    <article className="guide-reader">
      <button type="button" className="guide-back" onClick={onBack}>
        <span aria-hidden="true">←</span> 全部指南
      </button>

      <header className="guide-reader-head">
        <p className="guide-kicker">
          <span className="guide-kicker-city">{article.city}</span>
          <span>{article.theme}</span>
          <span>{article.eyebrow}</span>
        </p>
        <h1 className="guide-reader-title">{article.title}</h1>
        <p className="guide-reader-dek">{article.dek}</p>
        <dl className="guide-reader-meta">
          <div>
            <dt>时长</dt>
            <dd>{article.duration}</dd>
          </div>
          <div>
            <dt>季节</dt>
            <dd>{article.season}</dd>
          </div>
          <div>
            <dt>线索</dt>
            <dd>{article.route.segments.reduce((sum, seg) => sum + seg.stops.length, 0)} 个点位</dd>
          </div>
        </dl>
      </header>

      {article.cover ? (
        <figure className="guide-hero">
          <img
            className="guide-hero-img"
            src={article.cover.src}
            alt={article.cover.alt}
            loading="eager"
            decoding="async"
          />
          <figcaption>
            {article.cover.caption}
            <span className="guide-credit">{article.cover.credit}</span>
          </figcaption>
        </figure>
      ) : null}

      <section className="guide-facts" aria-labelledby={`${article.id}-facts`}>
        <h2 id={`${article.id}-facts`}>先记住这几件事</h2>
        <dl>
          {article.facts.map((fact) => (
            <div key={fact.label} className="guide-fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="guide-body">
        {article.sections.map((section) => (
          <section key={section.heading} className="guide-section">
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.link ? (
              <Link className="guide-inline-link" to={section.link.to}>
                {section.link.label}
                <span aria-hidden="true"> →</span>
              </Link>
            ) : null}
          </section>
        ))}
      </div>

      <section className="guide-block" aria-labelledby={routeHeadingId}>
        <h2 id={routeHeadingId}>路线</h2>
        <p className="guide-block-note">{article.route.intro}</p>
        {article.route.segments.map((segment, i) => (
          <RouteSketch
            key={segment.label}
            segment={segment}
            index={i}
            titleId={`${article.id}-route-${i}`}
          />
        ))}
      </section>

      {article.food.length > 0 ? (
        <section className="guide-block" aria-labelledby={foodHeadingId}>
          <h2 id={foodHeadingId}>吃的</h2>
          <p className="guide-block-note">
            下面是小图谱，只标种类与吃法，不是菜品照片；实拍在「现场」一栏。
          </p>
          <ul className="guide-food">
            {article.food.map((item) => (
              <li key={item.name} className="guide-food-item">
                <FoodGlyph kind={item.glyph} />
                <span className="guide-food-text">
                  <strong>{item.name}</strong>
                  <span>{item.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {article.photos.length > 0 ? (
        <section className="guide-block" aria-labelledby={photoHeadingId}>
          <h2 id={photoHeadingId}>现场</h2>
          <div className={`guide-photos${article.photos.length > 1 ? ' guide-photos--grid' : ''}`}>
            {article.photos.map((photo, i) => (
              <figure key={photo.src + i} className="guide-photo">
                <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
                <figcaption>
                  {photo.caption}
                  <span className="guide-credit">{photo.credit}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : (
        <p className="guide-block-note guide-block-note--solo">{article.photosNote}</p>
      )}

      <section className="guide-block guide-cautions" aria-labelledby={cautionHeadingId}>
        <h2 id={cautionHeadingId}>到现场要注意</h2>
        <ul>
          {article.cautions.map((caution) => (
            <li key={caution}>{caution}</li>
          ))}
        </ul>
        <p className="guide-block-note">
          日期、班次、开放与演出安排以现场公告为准；本文不提供实时信息。
        </p>
      </section>

      <button type="button" className="guide-back guide-back--foot" onClick={onBack}>
        <span aria-hidden="true">←</span> 回到全部指南
      </button>
    </article>
  )
}

export default function GuidePage() {
  const [activeId, setActiveId] = useState<string | null>(null)

  const active = useMemo(
    () => guideArticles.find((article) => article.id === activeId) ?? null,
    [activeId],
  )

  usePageTitle(active ? `${active.title} · 潮汕攻略` : '潮汕攻略')

  useEffect(() => {
    if (activeId) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [activeId])

  if (active) {
    return (
      <div className="guide-page">
        <GuideReader article={active} onBack={() => setActiveId(null)} />
      </div>
    )
  }

  return (
    <div className="guide-page">
      <header className="guide-lead">
        <p className="guide-kicker">潮汕 · {guideArticles.length} 篇</p>
        <h1>把潮汕走成一条线</h1>
        <p className="guide-dek">
          这里不放跳转链接。我们从公开攻略里把点位、顺序和吃的东西拆出来，重新排成能按天走的指南；
          路线用 SVG 画结构，现场用站内已登记的实拍，写不清的地方就留白。
        </p>
      </header>

      <section className="guide-grid" aria-label="指南列表">
        {guideArticles.map((article) => (
          <GuideCard key={article.id} article={article} onOpen={setActiveId} />
        ))}
      </section>
    </div>
  )
}
