import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageContext, usePageTitle } from '../../../lib/usePageContext'
import { sourcesOfModule } from '../../../lib/content'
import { SourceList } from '../../../components/SourceBadge'
import './yingge-story.css'

const MUGEDA_SRC = '/exhibits/yingge/mugeda/index.html'

const CHAPTERS = [
  {
    k: '历史',
    t: '从「捣珍」到广场',
    d: '英歌的形成有多个说法，可靠的做法是分开看：国家级名录确认了项目身份与申报地区，地方标准记录了当下的角色、器物与队形。不要把某个村镇的做法说成全潮汕通则。',
  },
  {
    k: '人物',
    t: '借《水浒》英雄，但各队不同',
    d: '头槌、二槌、引舞、指挥是位置与功能，不是固定人物；脸谱与服装因队伍而异。辨认时先看位置，再核对队伍资料。',
  },
  {
    k: '队伍',
    t: '同一个项目名，三个申报地区',
    d: '潮阳英歌、普宁英歌属 2006 年第一批；甲子英歌 2011 年作为扩展项目进入。名录能确认项目名称与保护单位，说不清某支队伍今天怎么跳。',
  },
]

export default function YinggeStory() {
  usePageTitle('英歌舞 · 第二页')
  usePageContext({ module: 'yingge', moduleTitle: '英歌舞' })
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const stageRef = useRef<HTMLDivElement | null>(null)

  // 数字馆资源多，8 秒还没出来就给一条“直接打开”的退路，避免一直转圈
  useEffect(() => {
    if (loaded) return undefined
    const timer = window.setTimeout(() => setSlow(true), 8000)
    return () => window.clearTimeout(timer)
  }, [loaded])
  const sources = sourcesOfModule('yingge')

  async function enterFullscreen() {
    const el = stageRef.current
    if (!el) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await el.requestFullscreen()
    } catch {
      // 浏览器拒绝全屏时不影响页面内浏览
    }
  }

  return (
    <div className="ys-page">
      <header className="ys-hero">
        <p className="text-xs tracking-[0.3em] text-brick">英歌舞 · 第二页</p>
        <h1 className="mt-3 font-serif text-[30px] leading-tight text-ink sm:text-[40px]">
          英歌怎么长出来的，自己走一遍
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-8 text-ink-soft">
          这一页只有两件事：先把历史、人物与队伍的来龙去脉说清；再把这支舞的完整数字馆嵌在页内，
          点进去就是展厅，不跳外站。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#museum" className="btn-primary">
            直接进数字馆
          </a>
          <Link to="/museum/yingge" className="btn-secondary">
            回到五要素
          </Link>
          <Link to="/docs#doc-yingge" className="btn-secondary">
            读考据文本
          </Link>
        </div>
      </header>

      <section className="ys-chapters" aria-label="三条线索">
        {CHAPTERS.map((c, i) => (
          <article key={c.t}>
            <span className="ys-k">{c.k}</span>
            <h2>{c.t}</h2>
            <p>{c.d}</p>
            <span className="ys-no" aria-hidden="true">
              0{i + 1}
            </span>
          </article>
        ))}
      </section>

      <section id="museum" className="ys-stage-section">
        <div className="ys-stage-head">
          <div>
            <h2 className="font-serif text-2xl text-ink">云游英歌舞</h2>
            <p className="mt-1 text-xs leading-6 text-muted">
              离线镜像自原发布页，全部资源已本地托管；展厅内的音效与动画需要点击后才播放。
            </p>
          </div>
          <button type="button" className="btn-secondary !min-h-[40px] !text-sm" onClick={enterFullscreen}>
            全屏观看
          </button>
        </div>

        <div ref={stageRef} className="ys-stage">
          {!loaded ? (
            <div className="ys-loading" role="status" aria-live="polite">
              <span className="ys-spinner" aria-hidden="true" />
              <span className="flex flex-col items-center gap-2">
                <span>数字馆加载中…</span>
                {slow ? (
                  <a
                    href={MUGEDA_SRC}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ys-fallback-link"
                  >
                    加载较慢？在新窗口打开
                  </a>
                ) : null}
              </span>
            </div>
          ) : null}
          <iframe
            src={MUGEDA_SRC}
            title="云游英歌舞"
            className={loaded ? 'is-loaded' : ''}
            onLoad={() => setLoaded(true)}
            allow="autoplay; fullscreen"
            loading="lazy"
          />
        </div>
        <p className="mt-2 text-[11.5px] leading-6 text-muted">
          展内内容与署名由原始项目提供。若长时间停在加载动画，点一下画面任意位置即可继续。
        </p>
      </section>

      <section className="ys-sources">
        <h2 className="section-title">本页依据</h2>
        <SourceList ids={sources.map((s) => s.id)} />
      </section>
    </div>
  )
}
