import { Link } from 'react-router-dom'
import { usePageContext, usePageTitle } from '../../../lib/usePageContext'
import { SourceList } from '../../../components/SourceBadge'
import { FORMATIONS } from '../data'
import { FormationStage } from '../components/FormationStage'
import { PageSection, YinggeHeader, SourceNote } from '../components/YinggeChrome'

const READING: { title: string; text: string }[] = [
  { title: '看位置', text: '纵横间距、内外圈层与对称关系。' },
  { title: '看路线', text: '分行、合拢、穿插与回旋的走线。' },
  { title: '看信号', text: '转向或分合的时刻，对齐鼓点与指挥动作。' },
  { title: '看边界', text: '名称取自潮阳英歌基础队形，别处可能另有叫法。' },
]

export default function YinggeFormations() {
  usePageTitle('英歌舞 · 阵形')
  usePageContext({
    module: 'yingge',
    moduleTitle: '英歌舞',
    entryId: 'yingge-formation',
    entryTitle: '阵形：名称、路线与边界',
  })

  return (
    <div className="space-y-8">
      <YinggeHeader
        current="阵形"
        kicker="阵形 · FORMATIONS"
        title="队伍如何在空间里移动"
        lead={
          <>
            队形是某一时刻队员之间的空间关系，变阵是队伍从一种关系转入另一种关系的过程。
            下面用抽象点位呈现汕头市地方标准列出的七种潮阳英歌基础队形；其他地区与队伍可能另有名称。
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)]">
        <div className="rounded-card border border-brick/30 bg-brick/[0.05] px-4 py-3 text-base leading-8 text-ink-soft">
          <strong className="font-medium text-brick">互动示意，不代表某地标准阵形。</strong>
          点位只表达「谁在谁的哪一侧、大致间距多大」，48 个点与任何队伍的实际阵容无关；
          演练路线、槌路与鼓点以具体队伍资料为准。
        </div>
      </div>

      <FormationStage />

      <PageSection
        id="reading"
        title="如何读懂一次变阵"
        intro="记住阵名只是第一步，更值得看的是队伍从哪里进入、怎样保持距离、在什么信号后转向。"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {READING.map((item) => (
            <article key={item.title} className="card space-y-2">
              <h3 className="font-serif text-base text-ink">{item.title}</h3>
              <p className="text-sm leading-6 text-ink-soft">{item.text}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection
        id="names"
        title="七个名字，两种来源"
        intro="七种队形的名称与走位要点出自汕头市地方标准；普宁英歌的项目页另列出几个相近或不同的名字。"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FORMATIONS.map((formation) => (
            <article key={formation.id} className="card space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-serif text-base text-ink">{formation.name}</h3>
                <span className="text-[11px] text-muted">{formation.sourceIds.join(' · ')}</span>
              </div>
              <p className="text-sm leading-6 text-ink-soft">{formation.summary}</p>
            </article>
          ))}
        </div>
        <SourceNote>
          普宁英歌项目页写作「双龙出海」「猛虎下山」「麦穗花」「田螺圈」，与地方标准的「双龙出海」「麦穗花阵」
          「田螺阵」并不完全一致。这说明同一类空间关系在不同地区的资料里可能换名字，也可能同名而走法不同。
          <Link to="/museum/yingge/yingge-formation" className="link-inline ml-1">
            读阵形条目
          </Link>
        </SourceNote>
      </PageSection>

      <PageSection id="sources" title="来源">
        <div className="card">
          <SourceList ids={['S103', 'S101']} />
        </div>
      </PageSection>
    </div>
  )
}
