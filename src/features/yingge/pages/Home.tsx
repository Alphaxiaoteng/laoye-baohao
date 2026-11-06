import { Link } from 'react-router-dom'
import { usePageContext, usePageTitle } from '../../../lib/usePageContext'
import { entriesOfModule, entryHref, sourcesOfModule } from '../../../lib/content'
import { SourceList } from '../../../components/SourceBadge'
import { MEDIA } from '../data'
import { PageSection, YinggeNav, SourceNote } from '../components/YinggeChrome'

const ENTRIES = [
  {
    to: '/museum/yingge/formations',
    kicker: '01',
    title: '阵形',
    text: '七种基础队形的点位与走位示意，可切换、可旋转视角。',
    image: '/media/yingge/objects/icon-clubs.webp',
  },
  {
    to: '/museum/yingge/roles',
    kicker: '02',
    title: '角色与器物',
    text: '头槌、二槌、引舞、指挥各做什么；槌、旗、鼓、锣钹、头饰、脸谱怎么看。',
    image: '/media/yingge/objects/icon-headpiece.webp',
  },
  {
    to: '/museum/yingge/watch',
    kicker: '03',
    title: '影像',
    text: '一段真实演出片段，加上观看时该留意的身体、双槌、节拍与队形。',
    image: '/media/yingge/watch/yingge-square-poster.webp',
  },
  {
    to: '/museum/yingge/sound',
    kicker: '04',
    title: '锣鼓',
    text: '鼓、锣、钹与木槌的合成节拍示意，以及值得反复听的四个层次。',
    image: '/media/yingge/objects/icon-drum.webp',
  },
]

export default function YinggeHome() {
  usePageTitle('英歌舞')
  usePageContext({ module: 'yingge', moduleTitle: '英歌舞' })

  const list = entriesOfModule('yingge')
  const sources = sourcesOfModule('yingge')

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <nav aria-label="面包屑" className="text-sm text-muted">
          <Link to="/museum" className="link-inline">
            文化馆
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span>英歌舞</span>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs tracking-[0.3em] text-brick">老爷保号 · 英歌舞</p>
            <h1 className="font-serif text-3xl leading-snug text-ink">
              先看一场，
              <br className="hidden sm:block" />
              再看懂阵形、角色与锣鼓。
            </h1>
            <p className="max-w-xl text-base leading-8 text-ink-soft">
              英歌是流传于广东、福建等地的民间广场舞蹈，2006 年以「英歌」列入第一批国家级非物质文化遗产名录（Ⅲ—8）。
              这个模块把可核对的资料拆成四块：阵形、角色与器物、影像、锣鼓。
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/museum/yingge/formations" className="btn-primary">
                从阵形开始
              </Link>
              <Link to="/museum/yingge/watch" className="btn-secondary">
                先看影像
              </Link>
            </div>
          </div>

          <figure className="space-y-2">
            <div className="overflow-hidden rounded-card border border-line bg-cream-dark">
              <img
                src={MEDIA.thailand}
                alt="英歌队在户外广场演出，队员身穿彩色戏服、手执英歌槌"
                width={1400}
                height={789}
                className="h-auto w-full"
                loading="eager"
                decoding="async"
              />
            </div>
            <figcaption className="text-xs leading-5 text-muted">
              参考项目素材：户外演出现场。文件名标注为 2024 年泰国场次，具体队伍与场合待核验。
            </figcaption>
          </figure>
        </div>

        <YinggeNav />
      </header>

      <section aria-labelledby="parts-title" className="space-y-4">
        <h2 id="parts-title" className="section-title">
          四个入口
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {ENTRIES.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="card card-link flex h-full items-start gap-4 no-underline"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-card border border-line bg-cream-dark">
                  <img
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="space-y-1">
                  <span className="block text-[11px] tracking-[0.24em] text-brick">{item.kicker}</span>
                  <span className="block font-serif text-lg text-ink">{item.title}</span>
                  <span className="block text-sm leading-6 text-ink-soft">{item.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <PageSection
        id="projects"
        title="同一个项目名，三个申报地区"
        intro="国家级名录能确认项目身份，说明不了某支队伍怎么跳。下面三条是最常被混为一谈的对象。"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              name: '英歌（潮阳英歌）',
              meta: '2006 年第一批 · 广东省汕头市',
              note: '保护单位为汕头市潮阳区文化馆；按节奏分慢板、中板、快板。',
              href: 'https://www.ihchina.cn/project_details/12901.html',
              sid: 'S100',
            },
            {
              name: '英歌（普宁英歌）',
              meta: '2006 年第一批 · 广东省揭阳市',
              note: '项目页记录队伍人数与双龙出海、猛虎下山、麦穗花、田螺圈等队列图形。',
              href: 'https://www.ihchina.cn/project_details/12902.html',
              sid: 'S101',
            },
            {
              name: '英歌（甲子英歌）',
              meta: '2011 年第三批扩展项目 · 广东省汕尾市',
              note: '流传于陆丰市甲子镇，队列分义旗、舞英歌、演小戏、扛大旗四大行列。',
              href: 'https://www.ihchina.cn/project_details/12903.html',
              sid: 'S102',
            },
          ].map((project) => (
            <article key={project.sid} className="card flex flex-col gap-2">
              <h3 className="font-serif text-base text-ink">{project.name}</h3>
              <p className="text-xs text-muted">{project.meta}</p>
              <p className="text-sm leading-6 text-ink-soft">{project.note}</p>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-inline mt-auto text-sm"
              >
                来源：查看项目页 [{project.sid}] ↗
              </a>
            </article>
          ))}
        </div>
        <SourceNote>
          以上三张卡只复述项目页可核对的信息。同一个称呼在不同村镇可能指不同的组织方式，
          想在展馆里比较，请先看清条目里写的地区与来源。
        </SourceNote>
      </PageSection>

      {list.length > 0 ? (
        <PageSection
          id="entries"
          title="本模块条目"
          intro="每条都标注来源编号与核验状态，点开可读正文。"
        >
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white/60">
            {list.map((entry) => (
              <li key={entry.id}>
                <Link
                  to={entryHref(entry)}
                  className="flex flex-col gap-1 px-4 py-3 no-underline transition-colors hover:bg-cream-dark/40 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <span className="font-serif text-base text-ink">{entry.title}</span>
                  <span className="line-clamp-1 text-xs text-muted sm:max-w-[55%] sm:text-right">
                    {entry.summary}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </PageSection>
      ) : null}

      <PageSection id="sources" title="本模块来源">
        <div className="card space-y-3">
          <SourceList ids={sources.map((s) => s.id)} />
          <p className="text-xs leading-6 text-muted">
            页面里的互动（阵形点位、合成节拍）都是示意，不替代任何一支队伍的实际演练；
            完整来源表见
            <Link to="/sources" className="link-inline mx-1">
              资料来源
            </Link>
            页。
          </p>
        </div>
      </PageSection>
    </div>
  )
}
