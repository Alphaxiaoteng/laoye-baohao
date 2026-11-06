import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageContext, usePageTitle } from '../../../lib/usePageContext'
import { entriesOfModule, sourcesOfModule } from '../../../lib/content'
import { SourceList } from '../../../components/SourceBadge'
import { BeatGrid } from '../components/BeatGrid'
import { FormationStage } from '../components/FormationStage'
import { MEDIA, OBJECTS, TEAM_ROLES } from '../data'
import './yingge-home.css'

/** 首屏五要素：对应下滑的五个演示段落 */
const ELEMENTS = [
  { id: 'body', label: '身体', sub: '脚步与重心', image: MEDIA.secondClub },
  { id: 'clubs', label: '双槌', sub: '对击与节奏', image: '/media/yingge/objects/icon-clubs.webp' },
  { id: 'drum', label: '锣鼓', sub: '鼓点带队', image: '/media/yingge/objects/icon-drum.webp' },
  { id: 'roles', label: '角色', sub: '谁在什么位置', image: '/media/yingge/objects/icon-painted-face.webp' },
  { id: 'formation', label: '阵形', sub: '队形怎么走', image: '/media/yingge/objects/icon-command-flag.webp' },
]

/** 下滑到视口时淡入：只切换 class，不做滚动劫持 */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (targets.length === 0) return
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'))
      return
    }
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (record.isIntersecting) {
            record.target.classList.add('is-in')
            observer.unobserve(record.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}

function ClubTap() {
  const [hits, setHits] = useState(0)
  const done = hits >= 8
  return (
    <div className="club-tap">
      <button
        key={hits}
        type="button"
        className={`club-pair ${done ? 'is-done' : ''}`}
        onClick={() => !done && setHits((h) => Math.min(8, h + 1))}
        aria-label={done ? '已完成一击组合' : `跟着点一下，第 ${hits + 1} 下`}
      >
        <span className="club club-left" aria-hidden="true" />
        <span className="club club-right" aria-hidden="true" />
        <span className="club-spark" aria-hidden="true" />
      </button>
      <div className="club-dots" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={i < hits ? 'is-on' : ''} />
        ))}
      </div>
      <p className="text-xs leading-6 text-muted" role="status">
        {done
          ? '点满了 8 下。这只是节奏示意，不评价动作标准。'
          : `点槌对击，${hits}/8。真实英歌是双槌随鼓点上下左右对击，不是各打各的。`}
      </p>
      {done ? (
        <button type="button" className="btn-quiet !min-h-[36px] !text-xs" onClick={() => setHits(0)}>
          再来一组
        </button>
      ) : null}
    </div>
  )
}

export default function YinggeHome() {
  usePageTitle('英歌舞')
  usePageContext({ module: 'yingge', moduleTitle: '英歌舞' })
  const revealRoot = useReveal<HTMLDivElement>()
  const [active, setActive] = useState('body')

  const entries = entriesOfModule('yingge')
  const sources = sourcesOfModule('yingge')
  const clubs = OBJECTS.find((o) => o.id === 'clubs')

  function go(id: string) {
    setActive(id)
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={revealRoot} className="yingge-home">
      <header className="yh-hero">
        <div className="yh-hero-copy" data-reveal>
          <p className="text-xs tracking-[0.3em] text-brick">老爷保号 · 英歌舞</p>
          <h1 className="mt-3 font-serif text-[30px] leading-[1.25] text-ink sm:text-[42px]">
            先看一场，
            <br className="hidden sm:block" />
            再看懂身体、双槌与锣鼓。
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-8 text-ink-soft">
            英歌是流传于广东、福建等地的民间广场舞蹈，2006 年以「英歌」列入第一批国家级非物质文化遗产名录（Ⅲ—8）。
            下面五块贴图对应五个演示，点一下会滚到那一段。
          </p>
        </div>

        <div className="yh-tiles" role="group" aria-label="英歌五要素">
          {ELEMENTS.map((el, index) => (
            <button
              key={el.id}
              type="button"
              className={`yh-tile ${active === el.id ? 'is-active' : ''}`}
              style={{ animationDelay: `${index * 120}ms` }}
              onClick={() => go(el.id)}
              aria-pressed={active === el.id}
            >
              <span className="yh-tile-img">
                <img src={el.image} alt="" aria-hidden="true" loading="eager" decoding="async" />
              </span>
              <span className="yh-tile-label">{el.label}</span>
              <span className="yh-tile-sub">{el.sub}</span>
            </button>
          ))}
        </div>

        <div className="yh-hint" aria-hidden="true">
          向下滚动，五段演示会自动展开
          <span className="yh-hint-line" />
        </div>
      </header>

      <section id="body" className="yh-section" data-reveal>
        <div className="yh-section-head">
          <span className="yh-index">01</span>
          <h2>身体：脚步先于槌</h2>
        </div>
        <div className="yh-split">
          <div className="space-y-3">
            <p className="text-[15px] leading-8 text-ink-soft">
              英歌的力量先来自下肢：半蹲、蹉步、提腿、转身，重心压低，队形才走得稳。
              双槌的动作是在脚步之上加出来的，不是站着挥胳膊。
            </p>
            <p className="text-xs leading-6 text-muted">
              下面这段是公开演出片段，看的时候注意队员的膝盖弯曲、落脚位置和队形间距，
              而不是只盯着槌。
            </p>
            <video
              className="yh-video"
              controls
              preload="none"
              playsInline
              poster={MEDIA.poster}
              src={MEDIA.video}
            >
              你的浏览器不支持视频播放。
            </video>
          </div>
          <figure className="yh-figure">
            <img src={MEDIA.performerAlley} alt="英歌队员在巷道中列队行进" loading="lazy" />
            <figcaption>参考素材：队员在巷道列队。人数与队形因队伍而异。</figcaption>
          </figure>
        </div>
      </section>

      <section id="clubs" className="yh-section" data-reveal>
        <div className="yh-section-head">
          <span className="yh-index">02</span>
          <h2>双槌：对击，不是各打各的</h2>
        </div>
        <div className="yh-split">
          <div className="space-y-3">
            <p className="text-[15px] leading-8 text-ink-soft">
              {clubs?.detail}
            </p>
            <ClubTap />
          </div>
          <figure className="yh-figure">
            <img src="/media/yingge/objects/objects-archive.webp" alt="英歌槌与器物参考图" loading="lazy" />
            <figcaption>器物图只作辨认参考，不代表任何一支队伍的实际配置。</figcaption>
          </figure>
        </div>
      </section>

      <section id="drum" className="yh-section" data-reveal>
        <div className="yh-section-head">
          <span className="yh-index">03</span>
          <h2>锣鼓：鼓点带队，不是伴奏</h2>
        </div>
        <p className="max-w-2xl text-[15px] leading-8 text-ink-soft">
          指挥用鼓点发号令，队伍跟着鼓点换速度、换队形。下面三种板式的节拍由浏览器现场合成，
          只示意循环结构，不对应任何真实鼓谱。
        </p>
        <div className="yh-panel">
          <BeatGrid />
        </div>
      </section>

      <section id="roles" className="yh-section" data-reveal>
        <div className="yh-section-head">
          <span className="yh-index">04</span>
          <h2>角色：先问他在队伍里做什么</h2>
        </div>
        <p className="max-w-2xl text-[15px] leading-8 text-ink-soft">
          许多英歌队借用《水浒传》英雄，但人数、角色、脸谱与道具因队伍而异。
          先看位置与功能，再核对器物与队伍资料。
        </p>
        <ul className="yh-roles">
          {TEAM_ROLES.map((role) => (
            <li key={role.name}>
              <strong>{role.name}</strong>
              <span>{role.duty}</span>
            </li>
          ))}
        </ul>
        <div className="yh-objects">
          {OBJECTS.slice(0, 6).map((obj) => (
            <figure key={obj.id}>
              <img src={obj.image} alt="" aria-hidden="true" loading="lazy" />
              <figcaption>{obj.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="formation" className="yh-section" data-reveal>
        <div className="yh-section-head">
          <span className="yh-index">05</span>
          <h2>阵形：点位是示意，不是复刻</h2>
        </div>
        <p className="max-w-2xl text-[15px] leading-8 text-ink-soft">
          七种基础队形来自汕头市地方标准（DB 4405/T 315—2025）的名称与走位要点；
          下面的点位是抽象坐标，只表达谁在谁的哪一侧、往哪走。
        </p>
        <div className="yh-panel">
          <FormationStage />
        </div>
      </section>

      <section className="yh-next" data-reveal>
        <div>
          <h2 className="font-serif text-2xl text-ink">还有第二页：完整叙事与数字馆</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-soft">
            看英歌怎么从历史、人物与队伍里长出来，以及一个可以自己点着走的英歌馆。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/museum/yingge/story" className="btn-primary">
            进入第二页
          </Link>
          <Link to="/docs#doc-yingge" className="btn-secondary">
            看考据文本
          </Link>
        </div>
      </section>

      {entries.length > 0 ? (
        <section className="yh-section" data-reveal>
          <div className="yh-section-head">
            <span className="yh-index">06</span>
            <h2>本模块条目</h2>
          </div>
          <ul className="yh-entries">
            {entries.map((entry) => (
              <li key={entry.id}>
                <Link to={`/museum/yingge/${entry.id}`}>
                  <span className="font-serif text-base text-ink">{entry.title}</span>
                  <span className="line-clamp-1 text-xs text-muted">{entry.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="yh-section" data-reveal>
        <div className="yh-section-head">
          <span className="yh-index">07</span>
          <h2>本模块来源</h2>
        </div>
        <div className="yh-panel space-y-3">
          <SourceList ids={sources.map((s) => s.id)} />
          <p className="text-xs leading-6 text-muted">
            页面里的阵形点位与合成节拍都是示意，不替代任何一支队伍的实际演练；完整来源表见
            <Link to="/sources" className="link-inline mx-1">
              资料来源
            </Link>
            。
          </p>
        </div>
      </section>
    </div>
  )
}
