import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../../lib/usePageContext'
import './home.css'

/**
 * 首页 Hero：一整幅横屏画卷，四个热区。
 *
 * - 静态：4 栏共用同一张全景母图（CSS background-position 切片），拼起来是一幅画。
 * - 悬停：当前栏自动叠播 gpt-image-2.6-gif 动图、微展宽，其余栏压暗。
 * - 移动端：2×2，每栏直接放对应动图（横屏切片在小屏上太窄，不好看）。
 *
 * 素材由 scripts/gen-hero-assets.mjs 生成（gpt-image-2.6 / gpt-image-2.6-gif）。
 */

interface Panel {
  id: string
  name: string
  enter: string
  to: string
  /** 全景母图中的切片序号 0-3 */
  slice: number
  alt: string
}

const PANELS: Panel[] = [
  { id: 'yingge', name: '英歌', enter: '进入英歌舞演示', to: '/museum/yingge', slice: 0, alt: '英歌舞者击槌腾跃' },
  { id: 'tea', name: '工夫茶', enter: '进入工夫茶演示', to: '/museum/tea', slice: 1, alt: '朱泥壶高冲注茶' },
  { id: 'food', name: '潮汕味', enter: '进入潮汕美食', to: '/museum/food', slice: 2, alt: '牛肉丸粿条汤与卤鹅' },
  { id: 'yinglaoye', name: '营老爷', enter: '进入营老爷演示', to: '/museum/yinglaoye', slice: 3, alt: '夜间神轿巡游与灯火' },
]

export default function HomeHero() {
  usePageTitle('潮汕文化互动馆')
  /** 当前悬停的分栏：只在悬停时给该栏挂 GIF src，避免四张动图首屏全量下载 */
  const [active, setActive] = useState<string | null>(null)

  return (
    <section className="home-hero" aria-label="老爷保号首页">
      <div className="home-scroll">
        {PANELS.map((panel) => {
          const isActive = active === panel.id
          return (
            <Link
              key={panel.id}
              to={panel.to}
              aria-label={panel.enter}
              className={`hero-panel${isActive ? ' is-active' : ''}`}
              style={{ '--slice': panel.slice } as React.CSSProperties}
              onMouseEnter={() => setActive(panel.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(panel.id)}
              onBlur={() => setActive(null)}
            >
              {/* 静态画卷切片（桌面） */}
              <span className="hero-panel-static" aria-hidden="true" />
              {/* 悬停叠播动图：仅激活时挂 src */}
              {isActive ? (
                <img
                  className="hero-panel-gif"
                  src={`/media/home/hero/${panel.id}.gif`}
                  alt=""
                  aria-hidden="true"
                  onError={(e) => {
                    // 动图尚未生成或加载失败时退回静态画卷，不出破图
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : null}
              {/* 移动端：每栏直接放动图首帧（静图由 gif 自动播放） */}
              <img
                className="hero-panel-mobile"
                src={`/media/home/hero/${panel.id}.gif`}
                alt={panel.alt}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.visibility = 'hidden'
                }}
              />
              <span className="hero-panel-veil" aria-hidden="true" />
              <span className="hero-panel-caption">
                <span className="hero-panel-name">{panel.name}</span>
                <span className="hero-panel-arrow" aria-hidden="true">
                  ↗
                </span>
              </span>
            </Link>
          )
        })}
      </div>

      <p className="home-sign">老爷保号 · 潮汕文化互动馆</p>
    </section>
  )
}
