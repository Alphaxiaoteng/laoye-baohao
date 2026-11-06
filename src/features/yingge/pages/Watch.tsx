import { Link } from 'react-router-dom'
import { usePageContext, usePageTitle } from '../../../lib/usePageContext'
import { SourceBadges, SourceList } from '../../../components/SourceBadge'
import { MEDIA } from '../data'
import { PageSection, YinggeHeader, SourceNote } from '../components/YinggeChrome'

const WATCH_POINTS = [
  { label: '身体', title: '重心怎么移动', text: '看重心、提腿、横移与转身时的支撑。' },
  { label: '双槌', title: '力量怎么传到手腕', text: '留意挥、旋、击的差别。' },
  { label: '节拍', title: '动作什么时候发生', text: '鼓点、槌击与吆喝一起建立时间感。' },
  { label: '队形', title: '队员怎么彼此配合', text: '朝向、间距与路线，比单人动作更能说明问题。' },
]

const STRUCTURE = [
  {
    name: '前棚',
    text: '挥槌与打击乐伴奏的表演主体，今天谈潮阳英歌多指前棚。',
  },
  { name: '中棚', text: '地方戏曲片段、小戏或杂技，如今较少见。' },
  { name: '后棚', text: '以武术表演为主，当代演出中不常出现。' },
]

export default function YinggeWatch() {
  usePageTitle('英歌舞 · 影像')
  usePageContext({
    module: 'yingge',
    moduleTitle: '英歌舞',
    entryId: 'yingge-watch',
    entryTitle: '看英歌时留意什么',
  })

  return (
    <div className="space-y-8">
      <YinggeHeader
        current="影像"
        kicker="影像 · WATCH"
        title="动作、声音与队形，同时发生"
        lead={
          <>
            先从一段真实演出开始：看清人物、姿态与装束，再看整支队伍如何彼此配合。
            照片与短片只覆盖一个片刻，速度、路线与完整变阵仍要回到具体队伍。
          </>
        }
      />

      <section aria-labelledby="film-title" className="space-y-3">
        <h2 id="film-title" className="section-title">
          演出片段
        </h2>
        <div className="overflow-hidden rounded-card border border-line bg-cream-dark">
          <video
            controls
            preload="metadata"
            playsInline
            poster={MEDIA.poster}
            aria-label="英歌演出片段：街区巡游与祠堂前广场列队，26 秒，无对白字幕"
            className="block aspect-[1648/720] w-full bg-ink object-cover"
          >
            <source src={MEDIA.video} type="video/mp4" />
            当前浏览器无法播放这段视频，可改用支持 MP4（H.264）的浏览器。
          </video>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span>1648 × 720 · 26 秒</span>
          <span>无对白字幕</span>
          <span>节选已去除原片角标与原声</span>
          <span>素材出处见下方说明</span>
        </div>
        <SourceNote>
          这段画面节选自参考项目的纪实短片，保留了真实队员的演出片段，裁去原片角标与字幕区，
          并去掉原声，只作画面观察。它不是完整影片，也不代表某一地区英歌的标准流程。
          页面没有播放字幕，也没有为画面补写台词。
        </SourceNote>
      </section>

      <PageSection id="points" title="看动作，不只看敲槌" intro="把注意力分给四个层面，比盯着一个人的手更容易看懂。">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WATCH_POINTS.map((point) => (
            <article key={point.label} className="card space-y-2">
              <p className="text-[11px] tracking-[0.24em] text-brick">{point.label}</p>
              <h3 className="font-serif text-base leading-6 text-ink">{point.title}</h3>
              <p className="text-sm leading-6 text-ink-soft">{point.text}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection
        id="stills"
        title="两张静帧"
        intro="静帧能看清装束与器物，却看不出速度与路线；两种材料要一起用。"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <figure className="space-y-2">
            <img
              src={MEDIA.thailand}
              alt="英歌队在户外广场演出，队员分散站位、手执英歌槌"
              width={1400}
              height={789}
              loading="lazy"
              decoding="async"
              className="w-full rounded-card border border-line object-cover"
            />
            <figcaption className="text-xs leading-5 text-muted">
              户外演出现场：可以看清队形展开后的间距与方向。文件名标注为 2024 年泰国场次，具体队伍与场合待核验。
            </figcaption>
          </figure>
          <figure className="space-y-2">
            <img
              src={MEDIA.poster}
              alt="演出片段中的一个画面：队员在祠堂前广场列队起舞"
              width={1280}
              height={558}
              loading="lazy"
              decoding="async"
              className="w-full rounded-card border border-line object-cover"
            />
            <figcaption className="text-xs leading-5 text-muted">
              片段截图：祠堂前广场上的列队。画面来自上方的节选视频，不作单独引用。
            </figcaption>
          </figure>
        </div>
      </PageSection>

      <PageSection
        id="structure"
        title="一场表演由什么组成"
        intro="潮阳传统英歌队伍分前棚、中棚、后棚三段，但今天最常见到的只是前棚。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {STRUCTURE.map((part) => (
            <article key={part.name} className="card space-y-2">
              <h3 className="font-serif text-lg text-ink">{part.name}</h3>
              <p className="text-sm leading-6 text-ink-soft">{part.text}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SourceBadges ids={['S103']} />
          <span className="text-xs text-muted">
            地方标准同时注明，中棚与后棚如今已较少见到，标准只涉及前棚内容。
          </span>
        </div>
      </PageSection>

      <PageSection
        id="boundary"
        title="为什么不提供一套万能动作名称"
        intro="同名动作可能因队伍、板式与师承而不同，要连着画面、队伍与资料看。"
      >
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            '同一个词，在不同资料里可能指不同的动作幅度。',
            '同一个人物，在不同流派里可能有不同脸谱。',
            '同一段鼓点，在不同队伍里可能对应不同的走位。',
            '同一支队伍，在不同场合也可能调整时长与段落。',
          ].map((line) => (
            <li key={line} className="rounded-card border border-line bg-white/60 px-4 py-3 text-sm leading-6 text-ink-soft">
              {line}
            </li>
          ))}
        </ul>
        <p className="text-base leading-8 text-muted">
          想继续核对名称与来源，可读
          <Link to="/museum/yingge/yingge-formation" className="link-inline mx-1">
            阵形条目
          </Link>
          与
          <Link to="/museum/yingge/yingge-schools" className="link-inline mx-1">
            板式条目
          </Link>
          。
        </p>
      </PageSection>

      <PageSection id="sources" title="来源">
        <div className="card">
          <SourceList ids={['S103', 'S100', 'S101']} />
        </div>
      </PageSection>
    </div>
  )
}
