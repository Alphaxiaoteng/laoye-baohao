import { Link } from 'react-router-dom'
import { MODULES } from '../lib/modules'
import { audioItems, entriesOfModule, hasAnyContent, recipes, storyChapters } from '../lib/content'
import { usePageTitle } from '../lib/usePageContext'

function HeroArt() {
  return (
    <svg
      viewBox="0 0 320 260"
      aria-hidden="true"
      className="h-auto w-full rounded-3xl border border-line bg-white/60"
    >
      <circle cx="160" cy="120" r="86" fill="none" stroke="#A63A2B" strokeWidth="1.5" opacity="0.35" />
      <circle cx="160" cy="120" r="64" fill="none" stroke="#2F4A3A" strokeWidth="1.5" opacity="0.35" />
      {/* 茶壶与杯的抽象剪影 */}
      <path d="M120 128 q40 -22 78 0 l-8 34 q-31 14 -62 0 z" fill="#2F4A3A" opacity="0.75" />
      <path d="M198 132 q18 5 15 19" stroke="#2F4A3A" strokeWidth="5" fill="none" />
      <rect x="141" y="106" width="34" height="12" rx="5" fill="#2F4A3A" opacity="0.85" />
      <path d="M62 196 h34 m-17 -9 v18" stroke="#A63A2B" strokeWidth="3" opacity="0.6" />
      <path d="M232 196 h34 m-17 -9 v18" stroke="#A63A2B" strokeWidth="3" opacity="0.6" />
      <path d="M96 218 h128" stroke="#D9CFBF" strokeWidth="2" strokeDasharray="6 6" />
      <text x="160" y="245" textAnchor="middle" fontSize="11" fill="#6B6156">
        自绘几何示意，不使用外部素材
      </text>
    </svg>
  )
}

export default function Home() {
  usePageTitle('')
  const anyContent = hasAnyContent
  const playableAudio = audioItems.filter((a) => (a.file ?? '').trim() !== '').length

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-8 pt-4 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs tracking-[0.35em] text-brick">潮汕文化互动馆</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">老爷保号</h1>
          <p className="mt-2 font-serif text-xl text-ink-soft">跟着故事，走进潮汕文化</p>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-ink-soft">
            看一场英歌，冲一泡茶，认识一个不止于标签的潮汕。用故事、轻互动和随时可问的解释，
            帮助第一次接触潮汕的人先走完一条完整的入门体验。
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/story" className="btn-primary">
              跟故事走
            </Link>
            <Link to="/museum" className="btn-secondary">
              自由逛逛
            </Link>
            <Link to="/listen" className="btn-quiet">
              先听听潮汕话
            </Link>
          </div>

          <p className="mt-5 max-w-xl text-xs leading-5 text-muted">
            故事为原创虚构串联，不对应某地完整仪式流程。所有文化内容标注来源与核验状态，
            未完成核验的会直接写明。本站不使用真人或神明形象素材，也不自动播放音频。
          </p>

          {!anyContent ? (
            <p className="mt-4 rounded-xl border border-amber-600/30 bg-amber-50/70 px-3 py-2 text-sm text-amber-900">
              内容准备中：还没有读取到 content/*.json，页面结构可用，条目会显示为空。
            </p>
          ) : null}
        </div>
        <HeroArt />
      </section>

      <section aria-labelledby="modules-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="modules-title" className="font-serif text-2xl text-ink">
            四个入口
          </h2>
          <Link to="/museum" className="link-inline text-sm">
            查看文化馆全貌
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {MODULES.map((mod) => {
            const list = entriesOfModule(mod.id)
            const verified = list.filter((e) => e.verify === 'verified').length
            return (
              <li key={mod.id}>
                <Link
                  to={`/museum/${mod.id}`}
                  className="card block h-full no-underline transition-colors hover:border-brick/50"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-serif text-xl text-ink">{mod.title}</h3>
                    <span className="text-xs text-muted">{list.length} 条内容</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{mod.intro}</p>
                  <p className="mt-3 text-xs text-muted">
                    {list.length === 0
                      ? '条目待登记'
                      : verified === list.length
                        ? '全部条目标注已核验'
                        : `${list.length - verified} 条仍待核验/待补充`}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card flex h-full flex-col justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-ink">听潮</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              独立的潮汕话词句播放页。没有取得授权的录音不会假装能播，卡片会直接写"音频待授权录制"。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/listen" className="btn-secondary">
              去听潮
            </Link>
            <span className="text-xs text-muted">
              {audioItems.length === 0
                ? '词条待登记'
                : `${playableAudio} / ${audioItems.length} 条有可播放音频`}
            </span>
          </div>
        </div>

        <div className="card flex h-full flex-col justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-ink">我的手记</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              只记录你真实做过的操作：走过哪一章、打开过哪个条目、听过哪句词。
              不把"浏览步骤"写成"亲手完成"。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/journal" className="btn-secondary">
              打开手记
            </Link>
            <span className="text-xs text-muted">
              {storyChapters.length} 章故事 · {recipes.length} 份食谱
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
