import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCollageMotion } from '../useCollageMotion'
import './TeaPanel.css'

const POUR = '/media/home/hero/panel-tea.webp'
const TRAY = '/media/home/teochew-kanghu-tea.webp'
const POUR_GIF = '/media/home/hero/tea.gif'
/** 自托管于 gdstwhg（汕头市文化馆）的工夫茶非遗沙龙实拍，与 Commons 茶盘实拍同框慢淡切。 */
const SALON = '/media/home/gdstwhg/tea-salon.webp'

/** 三条观察线索：标题与考据短句全部取自本段现有文案。 */
const CUES = [
  { label: '提壶高冲', note: '高冲注水是五步里的一步，水线与蒸汽都在这一帧。' },
  { label: '壶嘴·小杯·茶盘', note: '壶嘴、小杯、茶盘是同一张示意图裁出的三个景别，不是三张照片。' },
  { label: '文化馆茶艺沙龙', note: '茶盘与沙龙为实拍照片，插图与动图为示意画面。' },
]

/** 自动轮巡间隔：4.5s 一档，和慢淡切错开，不抢同一个节奏。 */
const CUE_INTERVAL = 4500

/**
 * 首页「工夫茶」章节。
 *
 * 叙事：这张茶席不是一张大图，而是把同一张示意图里的壶嘴、水线、小杯、
 * 蒸汽与茶盘裁成不同景别，左侧低位错落拼在一张横向茶席旁；
 * 另用一张 Wikimedia Commons 实拍茶盘（Kandukuru Nagarjun，CC BY 2.0）
 * 与汕头市文化馆的工夫茶沙龙实拍做慢淡切，明确区分「示意」与「实拍」，
 * 不让裁切冒充多张照片。
 *
 * 产品动作只讲 /museum/tea 真实存在的：一键自动演示、暂停、重置、点器物跳步。
 * 事实依据 content/entries.tea.json 的 tea-steps（S2 中国非物质文化遗产网项目页）。
 */
export default function TeaPanel() {
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
      className="collage-panel collage-tea"
      aria-labelledby="home-tea-title"
      data-spotlight={String(activeCue)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false)
      }}
    >
      <div className="tea-layout">
        <header className="tea-copy" data-reveal>
          <span className="chapter-ghost-num" data-depth="-0.3" aria-hidden="true">
            02
          </span>

          <h2 id="home-tea-title" className="tea-title">
            工夫茶，
            <br />
            一键走完五步
          </h2>
          <p className="tea-lede">
            点开始，温杯热罐、纳茶洗茶、高冲注水、出汤分茶、敬茶闻香会自己往下走。
            中途可以暂停，也可以重置回第一步。
          </p>
          <p className="tea-hint">点茶壶、茶荷或小杯，也能直接跳到那一步。</p>

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

          <Link to="/museum/tea" className="collage-cta">
            开始工夫茶演示
          </Link>
        </header>

        <figure
          className="tea-main"
          data-depth="0.3"
          data-reveal
          data-cue="0"
          onPointerEnter={() => setActiveCue(0)}
        >
          <div className="tea-frame">
            <img
              src={POUR}
              alt="茶汤从茶壶倒进小杯的茶席示意图"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <span className="tea-steam" data-depth="0.42" aria-hidden="true">
              <img src={POUR} alt="" width="1536" height="1024" />
            </span>
          </div>
          <figcaption>茶席示意 · 提壶高冲</figcaption>
        </figure>

        <div className="tea-details">
          <figure
            className="tea-detail tea-detail--pot"
            data-depth="-0.95"
            data-reveal
            data-cue="1"
            onPointerEnter={() => setActiveCue(1)}
          >
            <div className="tea-frame">
              <span className="tea-crop tea-crop--pot" aria-hidden="true" />
            </div>
            <figcaption>壶嘴与高冲水线</figcaption>
          </figure>

          <figure
            className="tea-detail tea-detail--cup"
            data-depth="-0.55"
            data-reveal
            data-cue="1"
            onPointerEnter={() => setActiveCue(1)}
          >
            <div className="tea-frame">
              <span className="tea-crop tea-crop--cup" aria-hidden="true" />
            </div>
            <figcaption>小杯落在茶盘上</figcaption>
          </figure>

          <figure
            className="tea-detail tea-detail--tray"
            data-depth="-0.35"
            data-reveal
            data-cue="1"
            onPointerEnter={() => setActiveCue(1)}
          >
            <div className="tea-frame">
              <span className="tea-crop tea-crop--tray" aria-hidden="true" />
            </div>
            <figcaption>实拍茶盘 · 木格纹理</figcaption>
          </figure>
        </div>

        <div className="tea-evidence">
          <figure
            className="tea-crossfade"
            data-depth="0.15"
            data-reveal
            data-cue="2"
            onPointerEnter={() => setActiveCue(2)}
          >
            <div className="tea-frame" data-crossfade>
              <img
                src={TRAY}
                alt="俯视实拍茶盘，紫砂壶、茶托与四只小白杯"
                width="1440"
                height="900"
              />
              <img
                src={SALON}
                alt="茶艺沙龙现场：一人奉茶，桌上摆着紫砂壶与小杯"
                width="600"
                height="338"
                loading="lazy"
              />
            </div>
            <figcaption>
              实拍茶盘：紫砂壶、茶托与四只小白杯 · 摄影 Kandukuru Nagarjun，CC BY 2.0；
              另一帧为汕头市文化馆茶艺沙龙实拍
            </figcaption>
          </figure>

          <figure
            className="tea-gif"
            data-depth="0.65"
            data-reveal
            data-cue="0"
            onPointerEnter={() => setActiveCue(0)}
          >
            <div className="tea-frame">
              <img
                src={POUR}
                alt="壶嘴注茶的示意静止画面"
                width="1536"
                height="1024"
              />
              <img
                className="tea-gif-motion"
                src={POUR_GIF}
                alt=""
                width="508"
                height="337"
                aria-hidden="true"
              />
            </div>
            <figcaption>悬停或聚焦时播放动图 · 高冲的一瞬</figcaption>
          </figure>
        </div>

        <p className="tea-source" data-reveal>
          演示按项目页记录的环节顺序归并为五步，仅作流程示意，不作唯一标准。
          插图与动图为示意画面，茶盘与茶艺沙龙为实拍照片。
        </p>
      </div>
    </article>
  )
}
