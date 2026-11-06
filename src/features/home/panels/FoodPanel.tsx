import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollageMotion } from '../useCollageMotion'
import './FoodPanel.css'

/** 由 public/media/photos/food-beef-ball-soup.jpg 裁出的 1:1 版本（ffmpeg crop 1100×1100），只收碗口与筷子。 */
const BOWL = '/media/home/collage/food/bowl-beef-ball.webp'
const GOOSE = '/media/photos/food-braised-goose.jpg'
const OMELETTE = '/media/photos/food-oyster-omelette.jpg'
const BEEF_KWAY = '/media/photos/food-beef-kway-teow.jpg'
const HOTPOT = '/media/home/chaoshan-cuisine3.webp'
const STEAM_STILL = '/media/home/hero/panel-food.webp'
const STEAM_GIF = '/media/home/hero/food.gif'
/** 自托管于 gdstwhg（汕头市文化馆）的非遗影像，接在粿条汤与火锅之后同框慢淡切。 */
const GD_BEEF = '/media/home/gdstwhg/food-beefball.webp'
const GD_GOOSE = '/media/home/gdstwhg/food-goose.webp'

/** 三条观察线索：标题与考据短句全部取自本段现有文案。 */
const CUES = [
  { label: '手打牛肉丸', note: '牛肉丸要把牛后腿肉捶成浆。' },
  { label: '潮州卤鹅吊汤', note: '卤鹅中途吊起沥汤、用卤油淋身。' },
  { label: '非遗实拍与粿条蚝烙', note: '实拍看质地，分步做法另开一页慢慢看。' },
]

/** 自动轮巡间隔：4.5s 一档，和慢淡切错开，不抢同一个节奏。 */
const CUE_INTERVAL = 4500

/**
 * 首页「潮汕美食」章节。
 *
 * 叙事：不放大图。右侧一只牛肉丸汤碗占住主位，左侧竖幅卤鹅自上垂下，
 * 中间小方块是铁板上的蚝烙；碗与鹅之间留白放标题和两句短文案，按钮跟着文案落地。
 * 下方一条窄幅慢淡切（牛肉粿条汤 / 牛肉火锅 / 汕头市文化馆非遗影像两帧），
 * 碗的右下方再落一只热气动图，六张图用四种比例错开，靠视差深度差而不是卡片堆叠。
 *
 * 文案事实来自 content/entries.food.json（S300—S306）：捶打成浆、米浆蒸条、
 * 吊汤淋油；产品动作只讲 /museum/food 真实存在的分步做法。
 * 照片均取自 public/media（作者与许可见 registry.json / ASSETS.md）。
 */
export default function FoodPanel() {
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
      className="collage-panel collage-food"
      aria-labelledby="home-food-title"
      data-spotlight={String(activeCue)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div className="food-layout">
        <header className="food-copy" data-reveal>
          <span className="chapter-ghost-num" data-depth="-0.3" aria-hidden="true">
            03
          </span>

          <h2 id="home-food-title" className="food-title">
            潮汕美食，
            <br />
            先看碗里
          </h2>
          <p className="food-lede">
            牛肉丸要把牛后腿肉捶成浆，粿条是米浆摊薄蒸熟再切条，卤鹅中途吊起沥汤、用卤油淋身。
            实拍看质地，做法另开一页慢慢看。
          </p>
          <p className="food-hint">牛肉丸、粿条、卤鹅、蚝烙各有分步做法，点开一步一步来。</p>

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

          <Link to="/museum/food" className="collage-cta">
            逛潮汕美食
          </Link>
        </header>

        <figure
          className="food-main"
          data-depth="0.35"
          data-reveal
          data-cue="0"
          onPointerEnter={() => setActiveCue(0)}
        >
          <div className="food-frame">
            <img
              src={BOWL}
              alt="一碗牛肉丸汤，清汤里漂着几颗牛肉丸和切碎的青菜"
              width="1100"
              height="1100"
              fetchPriority="high"
            />
          </div>
          <figcaption>牛肉丸汤 · 实拍</figcaption>
        </figure>

        <figure
          className="food-goose"
          data-depth="-0.9"
          data-reveal
          data-cue="1"
          onPointerEnter={() => setActiveCue(1)}
        >
          <div className="food-frame">
            <img
              src={GOOSE}
              alt="几只卤好的鹅并排挂在卤锅上方，表皮油亮"
              width="1920"
              height="2555"
              loading="lazy"
            />
          </div>
          <figcaption>卤鹅 · 出锅后凉挂收汁</figcaption>
        </figure>

        <figure
          className="food-omelette"
          data-depth="1.05"
          data-reveal
          data-cue="2"
          onPointerEnter={() => setActiveCue(2)}
        >
          <div className="food-frame">
            <img
              src={OMELETTE}
              alt="铁板上摊着一张刚定型的蚝烙，旁边是拿着铲子的手"
              width="1279"
              height="1706"
              loading="lazy"
            />
          </div>
          <figcaption>蚝烙 · 刚摊开的一张</figcaption>
        </figure>

        <figure
          className="food-crossfade"
          data-depth="-0.25"
          data-reveal
          data-cue="2"
          onPointerEnter={() => setActiveCue(2)}
        >
          <div className="food-frame" data-crossfade>
            <img
              src={BEEF_KWAY}
              alt="一碗牛肉粿条汤，牛肉片、牛肉丸和粿条浸在汤里"
              width="1920"
              height="1280"
              loading="lazy"
            />
            <img
              src={HOTPOT}
              alt="圆桌上的牛肉火锅，周围摆满一盘盘鲜切牛肉"
              width="1280"
              height="960"
              loading="lazy"
            />
            <img
              src={GD_BEEF}
              alt="一碗牛肉丸粿条汤的近景，牛肉丸与粿条浸在清汤里，旁边一碟辣酱"
              width="1080"
              height="720"
              loading="lazy"
            />
            <img
              src={GD_GOOSE}
              alt="汕头卤鹅制作技艺展示摊位，卤鹅挂在档口上方，观众在摊前停留"
              width="600"
              height="338"
              loading="lazy"
            />
          </div>
          <figcaption>
            慢淡切 · 牛肉粿条汤 / 牛肉火锅；后两帧为汕头市文化馆非遗影像
          </figcaption>
        </figure>

        <figure
          className="food-steam"
          data-depth="0.7"
          data-reveal
          data-cue="0"
          onPointerEnter={() => setActiveCue(0)}
        >
          <div className="food-frame">
            <img
              src={STEAM_STILL}
              alt="AI 绘制的青花碗牛肉粿条汤，热气从汤面升起"
              width="1536"
              height="1024"
              loading="lazy"
            />
            <img
              className="food-steam-motion"
              src={STEAM_GIF}
              alt=""
              width="506"
              height="337"
              aria-hidden="true"
              loading="lazy"
            />
          </div>
          <figcaption>
            AI 绘制的热气
            <span className="food-hover-hint"> · 悬停或聚焦播放</span>
          </figcaption>
        </figure>

        <p className="food-note" data-reveal>
          实拍照片来自 Wikimedia Commons：DragonSamYU、0754Hombee、水餃喵、N509FZ、沈澄心、Clarayyt（CC BY-SA 4.0 / CC0）。
          慢淡切后两帧为汕头市文化馆非遗影像。
          菜名与工序依据 content/entries.food.json、recipes.food.json；热气图为 AI 绘制，只作氛围。
        </p>
      </div>
    </article>
  )
}
