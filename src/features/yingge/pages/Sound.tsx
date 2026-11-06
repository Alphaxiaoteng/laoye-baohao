import { Link } from 'react-router-dom'
import { usePageContext, usePageTitle } from '../../../lib/usePageContext'
import { SourceBadges, SourceList } from '../../../components/SourceBadge'
import { INSTRUMENTS, MEDIA } from '../data'
import { BeatGrid } from '../components/BeatGrid'
import { PageSection, YinggeHeader, SourceNote } from '../components/YinggeChrome'

const LAYERS = [
  { name: '鼓', text: '定速度、给段落：慢板 3 下、中板 5 下、快板 7 下一循环。' },
  { name: '锣、钹、镲', text: '突出重音与层次，常在高潮处叠加；配器随板式调整。' },
  { name: '槌击', text: '双槌互击，让动作本身成为节奏。' },
  { name: '吆喝与号', text: '快板、中板常伴呼喊与螺号声，用于激发气氛。' },
]

const LISTENING = [
  { title: '先听整体', text: '不暂停画面，感受速度、强弱与段落变化：什么时候变快，什么时候停。' },
  { title: '再追鼓点', text: '只关注鼓点怎样循环、重音落在哪里，队伍怎样跟上同一个节拍。' },
  { title: '再听身体', text: '把槌击、脚步与吆喝同具体动作对齐，判断声音由谁产生。' },
  { title: '最后看空间', text: '在变阵前后找声音信号，比较方向、间距与路线的改变。' },
]

export default function YinggeSound() {
  usePageTitle('英歌舞 · 锣鼓')
  usePageContext({
    module: 'yingge',
    moduleTitle: '英歌舞',
    entryId: 'yingge-sound',
    entryTitle: '锣鼓与声音：节奏怎么组织队伍',
  })

  return (
    <div className="space-y-8">
      <YinggeHeader
        current="锣鼓"
        kicker="锣鼓 · RHYTHM"
        title="声音帮助队伍感知同一个节拍"
        lead={
          <>
            英歌的伴奏强调节奏、没有旋律：鼓、锣、钹、镲、双槌与吆喝各司其职。
            哪一拍对应哪个动作，仍要回到队伍与现场录像核对。
          </>
        }
      />

      <div className="rounded-card border border-brick/30 bg-brick/[0.05] px-4 py-3 text-base leading-8 text-ink-soft">
        <strong className="font-medium text-brick">合成节拍示意，不是真实锣鼓录音。</strong>
        本页没有任何现场录音，声音全部由浏览器实时合成；只借用标准里「慢板 3 下、中板 5 下、快板 7 下一循环」
        的循环长度，不对应任何队伍的鼓谱、速度或音色。
      </div>

      <section aria-labelledby="beat-title" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="beat-title" className="section-title">
            节拍互动
          </h2>
          <SourceBadges ids={['S103']} />
        </div>
        <div className="card">
          <BeatGrid />
        </div>
      </section>

      <PageSection
        id="layers"
        title="锣鼓不是背景音乐"
        intro="声音参与现场协作：提示速度、标记重音、组织段落。"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {LAYERS.map((layer) => (
            <article key={layer.name} className="card space-y-2">
              <h3 className="font-serif text-lg text-ink">{layer.name}</h3>
              <p className="text-sm leading-6 text-ink-soft">{layer.text}</p>
            </article>
          ))}
        </div>
        <SourceNote>
          上述划分是对资料的归纳，不是固定编制。标准写的是「乐器可根据每支英歌队的不同需求配置」，
          因此任何一支队伍的配器都可能与这里不同。
        </SourceNote>
      </PageSection>

      <PageSection
        id="instruments"
        title="常用乐器"
        intro="以下乐器名称与形制说明来自汕头市地方标准；图示为参考项目的概念器物图，不是实物档案。"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
          <ul className="grid gap-3 sm:grid-cols-2">
            {INSTRUMENTS.map((instrument) => (
              <li key={instrument.name} className="rounded-card border border-line bg-white/60 px-4 py-3">
                <h3 className="font-serif text-base text-ink">{instrument.name}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{instrument.note}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-4">
            <figure className="space-y-2">
              <img
                src={MEDIA.objectsArchive}
                alt="概念器物图：大鼓、双槌、锣与头饰摆放在纸面"
                width={1400}
                height={788}
                loading="lazy"
                decoding="async"
                className="w-full rounded-card border border-line object-cover"
              />
              <figcaption className="text-xs leading-5 text-muted">
                参考项目的概念器物图：鼓、双槌、锣、头冠与戏服。用于说明组合关系，不作为实物档案。
              </figcaption>
            </figure>
            <div className="card space-y-2">
              <h3 className="font-serif text-base text-ink">配器随板式变化</h3>
              <p className="text-sm leading-6 text-ink-soft">
                快板宜配大鼓、大锣、大钹、钦仔锣、牛角号与螺号；中板宜配一个中鼓、云锣与大小钹；
                慢板宜配大鼓、大锣、云锣与大小钹。标准同时说明这只是「宜」，各队可按需要调整。
              </p>
              <SourceBadges ids={['S103']} />
            </div>
          </div>
        </div>
      </PageSection>

      <PageSection
        id="listening"
        title="同一段表演，可以听四遍"
        intro="先感受整体，再分别听鼓点、槌击与变阵信号。"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LISTENING.map((item, index) => (
            <article key={item.title} className="card space-y-2">
              <p className="text-[11px] tracking-[0.24em] text-brick">第 {index + 1} 遍</p>
              <h3 className="font-serif text-base text-ink">{item.title}</h3>
              <p className="text-sm leading-6 text-ink-soft">{item.text}</p>
            </article>
          ))}
        </div>
        <p className="text-sm text-muted">
          想配合画面听，可先去
          <Link to="/museum/yingge/watch" className="link-inline mx-1">
            影像页
          </Link>
          看那段节选（该片段已去掉原声）。
        </p>
      </PageSection>

      <PageSection id="boundary" title="为什么不提供一套统一鼓谱">
        <div className="space-y-3 text-base leading-8 text-ink-soft">
          <p>
            不同地区、队伍与场合使用的乐器、节奏、速度与口令并不一样。一支队伍的鼓谱不能代表所有英歌，
            文字也替代不了录音；本页只做节拍循环长度的示意，不把合成音当成实录，也不写似真似假的「鼓谱」。
          </p>
          <p className="text-muted">
            想核对各地差异，可读
            <Link to="/museum/yingge/yingge-schools" className="link-inline mx-1">
              板式条目
            </Link>
            与
            <Link to="/museum/yingge/yingge-sound" className="link-inline mx-1">
              锣鼓条目
            </Link>
            。
          </p>
        </div>
      </PageSection>

      <PageSection id="sources" title="来源">
        <div className="card">
          <SourceList ids={['S103', 'S100', 'S101', 'S102']} />
        </div>
      </PageSection>
    </div>
  )
}
