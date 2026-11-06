import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollageMotion } from '../useCollageMotion'
import './YinggePanel.css'

const STILL = '/media/home/hero/panel-yingge.webp'
const MOTION = '/media/home/hero/yingge.gif'
const PERFORMANCE = '/media/photos/yingge-performance.jpg'
const PARADE = '/media/photos/yingge-parade.jpg'
const FACE_DETAIL = '/media/home/collage/yingge/yingge-face-detail.webp'
const CLUBS = '/media/yingge/objects/icon-clubs.webp'
/** 自托管于 gdstwhg（汕头市文化馆）的现场实拍，与上面两张 Commons 实拍同框慢淡切。 */
const STAGE = '/media/home/gdstwhg/yingge-stage.webp'
const VILLAGE = '/media/home/gdstwhg/yingge-village.webp'

/** 三条观察线索：标题与考据短句全部取自本段现有文案，不新增任何年份、人物与仪式细节。 */
const CUES = [
  { label: '双槌对击', note: '一人一对木槌，随锣鼓对击。' },
  { label: '头槌红面·二槌黑面', note: '红面红须的头槌与黑面黑须的二槌，常走在队形最前。' },
  { label: '汕头文化馆实拍', note: '实拍看队伍与鼓手；主视觉与动图为示意画面，不对应具体队伍。' },
]

/** 自动轮巡间隔：4.5s 一档，与共享运行时的 1.2s 慢淡切错开，不互相抢节奏。 */
const CUE_INTERVAL = 4500

/**
 * 首页「英歌」章节。
 *
 * 叙事：不是一张大图，而是一面画廊墙——4:5 的示意主视觉（悬停/聚焦叠播同构图动图）、
 * 一张横向实拍（两张同场照片慢淡切）、以及两块错位方片：脸谱裁自同场实拍，
 * 双槌用馆内器物图。裁切只是同一场演出的细节，不冒充另一张照片。
 *
 * 事实依据 content/entries.yingge.json（S100 项目页、S103 汕头市地方标准）：
 * 每人一对木槌配合锣鼓对击、红面红须的头槌与黑面黑须的二槌走在最前、骑马蹲裆提腿横跃。
 * 产品动作只讲 /museum/yingge 上真实存在的入口：阵形、角色器物、影像、锣鼓。
 */
export default function YinggePanel() {
  const ref = useCollageMotion<HTMLElement>()
  const [activeCue, setActiveCue] = useState(0)
  const [paused, setPaused] = useState(false)

  // 悬停 / 键盘聚焦在本章上时暂停自动轮巡；减少动态偏好下干脆不轮巡，只留手动切换。
  useEffect(() => {
    if (paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActiveCue((cue) => (cue + 1) % CUES.length), CUE_INTERVAL)
    return () => window.clearInterval(timer)
  }, [paused])

  return (
    <article
      ref={ref}
      className="collage-panel collage-yingge"
      aria-labelledby="home-yingge-title"
      data-spotlight={String(activeCue)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div className="yingge-wall">
        <header className="yingge-copy yingge-copy--lead" data-reveal>
          <span className="chapter-ghost-num" data-depth="-0.3" aria-hidden="true">
            01
          </span>

          <h2 id="home-yingge-title" className="yingge-title">
            英歌：
            <br />
            先看身体，再听鼓
          </h2>

          <p className="yingge-lede">
            一人一对木槌，随锣鼓对击；头槌红面、二槌黑面，常走在队形最前。
          </p>

          <p className="yingge-hint">馆内分阵形、角色器物、影像与锣鼓四路，任选一路。</p>

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

          <div className="yingge-copy-actions">
            <Link to="/museum/yingge" className="collage-cta">
              进入英歌舞
            </Link>
          </div>
        </header>

        <div className="yingge-mosaic" data-reveal>
          <div
            className="yingge-frame yingge-frame--main"
            data-depth="0.35"
            data-cue="0"
            onPointerEnter={() => setActiveCue(0)}
          >
            <figure className="yingge-plate" data-reveal>
              <div className="yingge-media">
                <img
                  className="yingge-media-still"
                  src={STILL}
                  alt="英歌舞者腾空，双手各执一根木槌对击的示意画面"
                  width="1536"
                  height="1024"
                />
                <img
                  className="yingge-media-motion"
                  src={MOTION}
                  alt=""
                  width="507"
                  height="336"
                  aria-hidden="true"
                />
              </div>
              <figcaption>示意画面 · 双槌对击的一瞬</figcaption>
            </figure>

            <div
              className="yingge-tile yingge-tile--face"
              data-depth="0.9"
              data-cue="1"
              onPointerEnter={() => setActiveCue(1)}
            >
              <div className="yingge-tile-turn">
                <figure className="yingge-plate" data-reveal>
                  <div className="yingge-media">
                    <img
                      src={FACE_DETAIL}
                      alt="画着脸谱的英歌队员面部细节"
                      width="400"
                      height="400"
                      loading="lazy"
                    />
                  </div>
                </figure>
              </div>
            </div>
          </div>

          <div
            className="yingge-frame yingge-frame--wide"
            data-depth="-0.22"
            data-cue="2"
            onPointerEnter={() => setActiveCue(2)}
          >
            <figure className="yingge-plate" data-reveal>
              <div className="yingge-media" data-crossfade>
                <img
                  src={PERFORMANCE}
                  alt="两名画着脸谱的英歌队员，右侧一人握鼓槌击鼓"
                  width="1920"
                  height="1080"
                />
                <img
                  src={PARADE}
                  alt="行进中的英歌队伍，队员手持木槌列队向前"
                  width="1920"
                  height="1080"
                />
                <img
                  src={STAGE}
                  alt="晚会舞台上成排的英歌队伍持槌列阵，圆台与背屏灯光打亮全场"
                  width="1080"
                  height="722"
                  loading="lazy"
                />
                <img
                  src={VILLAGE}
                  alt="航拍潮汕村落祠堂与天井里摆开的红桌宴席"
                  width="1080"
                  height="810"
                  loading="lazy"
                />
              </div>
              <figcaption>
                实拍：英歌队与鼓手 · 摄影 Zoemonday，CC BY-SA 4.0；后两帧为汕头市文化馆实拍
              </figcaption>
            </figure>
          </div>

          <div
            className="yingge-tile yingge-tile--clubs"
            data-depth="-0.6"
            data-cue="1"
            onPointerEnter={() => setActiveCue(1)}
          >
            <div className="yingge-tile-turn">
              <figure className="yingge-plate" data-reveal>
                <div className="yingge-media">
                  <img
                    src={CLUBS}
                    alt="英歌槌：两根深色木槌，槌头与握处缠红布"
                    width="256"
                    height="256"
                    loading="lazy"
                  />
                </div>
              </figure>
            </div>
          </div>
        </div>

        <p className="yingge-source yingge-source--footer" data-reveal>
          脸谱方片裁自同场实拍，双槌用馆内器物图；主视觉与动图为示意画面，不对应具体队伍。
        </p>
      </div>
    </article>
  )
}
