import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollageMotion } from '../useCollageMotion'
import './YinglaoyePanel.css'

/**
 * 首页「营老爷」章节。
 *
 * 不是一张大图：右侧 3:4 神轿、左侧偏低的横向巡游、中缝的慢淡切竖片，
 * 加两块从原图裁出的灯笼与英歌小方片；鼠标移动时各层有克制的深度差（data-depth）。
 * 悬停整块时神轿叠播同源实拍动图（/media/yinglaoye/hero.gif），减少动态偏好下保持静图。
 *
 * 文案全部来自 content/entries.yinglaoye.json 与 sources.yinglaoye.json：
 * 年份是来源发表或记录的时间，不当成今年的日程。
 */

/** 自托管于 gdstwhg（汕头市文化馆）的夜巡实拍，接在 Commons 现场照之后慢淡切。 */
const GD_NIGHT = '/media/home/gdstwhg/parade-float.webp'

const CITIES = [
  {
    city: '潮州',
    note: '青龙古庙全城巡游，队伍一千多人，踩街约四小时。',
    time: '2025 年 2 月文章所述',
  },
  {
    city: '汕头',
    note: '澄海前沟乡，老爷像走在队伍中间，有时请英歌队。',
    time: '2017 年正月初六记录',
  },
  {
    city: '揭阳',
    note: '普宁夜里抬八抬大轿，走遍村里的大路小巷。',
    time: '2021 年 11 月发布',
  },
]

/** 三条观察线索：标题与考据短句全部取自本段现有文案，不新增年份、人物与仪式细节。 */
const CUES = [
  { label: '潮阳双忠神轿', note: '队伍抬着神轿绕村或绕城走一圈。' },
  { label: '夜间游神与古庙巡游', note: '有在夜里，有在午后，日期多在农历正月至二月，各村不同。' },
  { label: '三城正月游神记录', note: '三城的年份是来源发表或记录的时间，不是今年的日程。' },
]

/** 自动轮巡间隔：4.5s 一档，和慢淡切错开，不抢同一个节奏。 */
const CUE_INTERVAL = 4500

export default function YinglaoyePanel() {
  const ref = useCollageMotion<HTMLElement>()
  const [activeCue, setActiveCue] = useState(0)
  const [paused, setPaused] = useState(false)

  // 悬停 / 聚焦暂停轮巡；减少动态偏好下只保留手动切换。
  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActiveCue((cue) => (cue + 1) % CUES.length), CUE_INTERVAL)
    return () => window.clearInterval(timer)
  }, [paused])

  return (
    <article
      ref={ref}
      className="collage-panel collage-yinglaoye"
      aria-labelledby="home-yinglaoye-title"
      data-spotlight={String(activeCue)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div className="yl-stage">
        <header className="yl-copy" data-reveal>
          <span className="chapter-ghost-num" data-depth="-0.3" aria-hidden="true">
            04
          </span>

          <h2 id="home-yinglaoye-title">
            营老爷
            <br />
            神轿走过长街
          </h2>
          <p className="yl-lead">
            潮州话里“老爷”指神，“营”是环绕、周游的意思。来源记录里，队伍抬着神轿绕村或绕城走一圈；
            有在夜里，有在午后，日期多在农历正月至二月，各村不同。
          </p>

          <div className="clue-rail" role="tablist" aria-label="本章观察线索">
            {CUES.map((cue, index) => (
              <button
                type="button"
                role="tab"
                key={cue.label}
                aria-selected={activeCue === index}
                aria-pressed={activeCue === index}
                className="clue-pill"
                onClick={() => setActiveCue(index)}
              >
                <span className="clue-pill-num" aria-hidden="true">
                  {`0${index + 1}`}
                </span>
                {cue.label}
              </button>
            ))}
          </div>

          <div className="museum-plaque" aria-live="polite">
            <p className="museum-plaque-title">{CUES[activeCue].label}</p>
            <p className="museum-plaque-note">{CUES[activeCue].note}</p>
          </div>

          <div className="yl-actions">
            <Link to="/museum/yinglaoye" className="collage-cta">
              进入营老爷
            </Link>
            <Link to="/museum/yinglaoye/cases" className="yl-secondary">
              看三城案例
            </Link>
          </div>

          <blockquote className="yl-quote">
            <p>“游神正二月”</p>
            <cite>当地俗语，转引自 2025 年《人民日报》文章（潮州）</cite>
          </blockquote>
        </header>

        <div
          className="yl-cities-block"
          data-reveal
          data-cue="2"
          onPointerEnter={() => setActiveCue(2)}
        >
          <dl className="yl-cities">
            {CITIES.map((item) => (
              <div className="yl-city" key={item.city}>
                <dt>{item.city}</dt>
                <dd>
                  {item.note}
                  <span className="yl-city-year">{item.time}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="yl-cities-note">三城的年份是来源发表或记录的时间，不是今年的日程。</p>
        </div>

        <figure
          className="yl-figure yl-sedan"
          data-depth="0.26"
          data-reveal
          data-cue="0"
          onPointerEnter={() => setActiveCue(0)}
        >
          <div className="yl-sedan-frame">
            <img
              className="yl-sedan-still"
              src="/media/photos/yinglaoye-chaoyang-sedan.jpg"
              alt="潮阳双忠营老爷实拍：神轿与抬轿的人"
              width="1803"
              height="2400"
              loading="lazy"
              decoding="async"
            />
            <img
              className="yl-sedan-gif"
              src="/media/yinglaoye/hero.gif"
              alt=""
              aria-hidden="true"
              width="720"
              height="539"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>
            潮阳双忠，神轿 · 摄影 0754Hombee
            <span className="yl-hint">悬停看动图</span>
          </figcaption>

          <div
            className="yl-detail yl-detail--lantern"
            data-depth="1.1"
            data-cue="0"
            aria-hidden="true"
          >
            <img
              src="/media/home/collage/yinglaoye/lantern.webp"
              alt=""
              width="720"
              height="720"
              loading="lazy"
              decoding="async"
            />
          </div>
        </figure>

        <figure
          className="yl-figure yl-procession"
          data-depth="-0.4"
          data-reveal
          data-cue="2"
          onPointerEnter={() => setActiveCue(2)}
        >
          <img
            src="/media/photos/yinglaoye-procession.jpg"
            alt="巡游队伍中的鼓手与挂在架子上的灯笼"
            width="1920"
            height="1080"
            loading="lazy"
            decoding="async"
          />
          <figcaption>队伍里的大鼓与灯笼 · 摄影 Zoemonday</figcaption>

          <div className="yl-detail yl-detail--yingge" data-depth="-1.05" aria-hidden="true">
            <img
              src="/media/home/collage/yinglaoye/yingge-face.webp"
              alt=""
              width="720"
              height="720"
              loading="lazy"
              decoding="async"
            />
          </div>
        </figure>

        <figure
          className="yl-figure yl-crossfade"
          data-depth="0.58"
          data-reveal
          data-cue="1"
          onPointerEnter={() => setActiveCue(1)}
        >
          <div className="yl-crossfade-frame" data-crossfade>
            <img
              src="/media/photos/yinglaoye-chaoyang-walk.jpg"
              alt="巡游队伍抬着神轿走过街道"
              width="1600"
              height="2400"
              loading="lazy"
              decoding="async"
            />
            <img
              src="/media/photos/yinglaoye-annual.jpg"
              alt="年度游神节上穿戏服的队伍"
              width="1080"
              height="1920"
              loading="lazy"
              decoding="async"
            />
            <img
              src="/media/photos/yinglaoye-fire-jump.jpg"
              alt="夜间营老爷现场，一名参与者跃过火堆"
              width="1920"
              height="1440"
              loading="lazy"
              decoding="async"
            />
            <img
              src={GD_NIGHT}
              alt="夜间游神现场：街道两侧挤满观众，队伍举着点燃的香与火把经过"
              width="600"
              height="338"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>同一组现场：行进、游神节、跳火堆；末帧为汕头市文化馆夜巡实拍</figcaption>
        </figure>
      </div>

      <p className="yl-credit">
        实拍图来自 Wikimedia Commons，CC BY-SA 4.0：
        <a
          href="https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E9%98%B3%E5%8F%8C%E5%BF%A0%E8%90%A5%E8%80%81%E7%88%B72.jpg"
          target="_blank"
          rel="noreferrer"
        >
          0754Hombee
        </a>
        <span aria-hidden="true">、</span>
        <a
          href="https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E8%90%A5%E8%80%81%E7%88%B7.jpg"
          target="_blank"
          rel="noreferrer"
        >
          Zoemonday
        </a>
        <span aria-hidden="true">、</span>
        <a
          href="https://commons.wikimedia.org/wiki/File:%E6%BD%AE%E6%B1%95%E8%90%A5%E8%80%81%E7%88%B7%E8%B7%B3%E7%81%AB%E5%A0%86.jpg"
          target="_blank"
          rel="noreferrer"
        >
          陈异1
        </a>
        。慢淡切末帧为汕头市文化馆夜巡实拍。图片只作地区示例，不特指某村某场。
      </p>
    </article>
  )
}
