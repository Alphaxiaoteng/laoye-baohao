import { Link } from 'react-router-dom'
import { entryById, entriesOfModule, entryHref } from '../../lib/content'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { SourceList } from '../../components/SourceBadge'
import VerifyBadge from '../../components/VerifyBadge'
import Breadcrumb from './components/Breadcrumb'
import CityCaseCard from './components/CityCaseCard'
import KnowledgeCard from './components/KnowledgeCard'
import PhotoCredits from './components/PhotoCredits'
import { CITY_CASES, HERO_PHOTO, INTRO_CARDS, INTRO_SENTENCE, PHOTO_NOTE } from './data'

const MODULE_TITLE = '营老爷·游神'

/**
 * /museum/yinglaoye 专属首页。
 * 顺序：一句入门解释 → 推荐知识卡 → 队伍 / 案例入口 → 读法说明 → 其余条目 → 来源。
 */
export default function YinglaoyeHome() {
  usePageTitle(MODULE_TITLE)
  usePageContext({ module: 'yinglaoye', moduleTitle: MODULE_TITLE })

  const all = entriesOfModule('yinglaoye')
  const cards = INTRO_CARDS.flatMap((meta) => {
    const entry = entryById(meta.entryId)
    return entry ? [{ meta, entry }] : []
  })
  const cardIds = new Set(INTRO_CARDS.map((c) => c.entryId))
  const rest = all.filter((e) => !cardIds.has(e.id))

  const sourceIds = Array.from(new Set(all.flatMap((e) => e.sourceIds ?? [])))

  return (
    <div className="space-y-9">
      <Breadcrumb current={MODULE_TITLE} />

      <figure className="relative overflow-hidden rounded-2xl border border-line">
        <img
          src={HERO_PHOTO.image}
          alt={HERO_PHOTO.alt}
          width={HERO_PHOTO.width}
          height={HERO_PHOTO.height}
          className="h-[220px] w-full object-cover object-center sm:h-[320px] lg:h-[420px]"
        />
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#16211a]/95 via-[#16211a]/45 to-transparent px-4 pb-3 pt-12">
          <span className="block text-xs tracking-[0.18em] text-brick">潮汕 · 营老爷</span>
          <span className="mt-1 block text-xs leading-5 text-muted">{PHOTO_NOTE}</span>
        </figcaption>
      </figure>

      <header className="max-w-3xl space-y-3">
        <p className="text-xs tracking-[0.2em] text-brick">文化馆 · 民俗</p>
        <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">{MODULE_TITLE}</h1>
        <p className="text-[15px] leading-7 text-ink-soft">{INTRO_SENTENCE}</p>
        <ul className="flex flex-wrap gap-2 pt-1">
          <li className="chip">按来源整理</li>
          <li className="chip">地区与年份常显</li>
          <li className="chip">配 CC 实拍图</li>
        </ul>
        <p className="text-xs leading-6 text-muted">
          本模块现有 {all.length} 条内容，全部挂来源编号与核验状态；未完成本地文化审核的会标注「待本地审核」。
          头图与下方城市卡片是潮汕营老爷的实拍照片，只作地区示例，不对应某一个村的某一场。
        </p>
      </header>

      <section aria-labelledby="cities-title" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="cities-title" className="section-title">
            三城各一例：潮州 · 汕头 · 揭阳
          </h2>
          <Link to="/museum/yinglaoye/cases" className="text-xs link-inline">
            看逐条对照 →
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CITY_CASES.map((item) => (
            <li key={item.city} className="h-full">
              <CityCaseCard item={item} />
            </li>
          ))}
        </ul>
        <p className="text-xs leading-6 text-muted">
          时间与年份照来源原文抄录，旧日期不是今年的日程；需要当天信息请查当地公告。
        </p>
      </section>

      <section aria-labelledby="cards-title" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="cards-title" className="section-title">
            推荐知识卡
          </h2>
          <p className="text-xs text-muted">点击「展开说明」看条目正文，地区与年份在卡片上直接标出。</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {cards.map(({ meta, entry }, index) => (
            <li key={entry.id} className="h-full">
              <KnowledgeCard entry={entry} meta={meta} defaultOpen={index === 0} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="explore-title" className="space-y-3">
        <h2 id="explore-title" className="section-title">
          看队伍，也看不同地方的做法
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="card flex h-full flex-col">
            <p className="text-xs tracking-[0.18em] text-muted">示意 · 点击查看条目</p>
            <h3 className="mt-1 font-serif text-xl text-ink">队伍示意</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              自绘的标旗、仪仗、神轿、鼓乐，以及只有部分地方才有的花队与英歌。
              点一点图中的组成，看来源怎么记。
            </p>
            <p className="mt-2 text-xs text-muted">示例组合，不代表各地的顺序相同，也不代表每处都有英歌。</p>
            <Link to="/museum/yinglaoye/procession" className="btn-primary mt-auto self-start">
              看队伍示意
            </Link>
          </article>

          <article className="card flex h-full flex-col">
            <p className="text-xs tracking-[0.18em] text-muted">对照 · 地区 / 时间 / 要点 / 来源</p>
            <h3 className="mt-1 font-serif text-xl text-ink">地区案例</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              潮州、汕头、揭阳三城各一例，配实拍图与原文时间；页底再把普宁、潮州青龙古庙、元巷村、汕头澄海前沟乡四处并排对照。
            </p>
            <p className="mt-2 text-xs text-muted">旧日期只代表来源记录的那一年，不是今年的日程。</p>
            <Link to="/museum/yinglaoye/cases" className="btn-secondary mt-auto self-start">
              看三城案例
            </Link>
          </article>
        </div>
      </section>

      <section aria-labelledby="reading-title" className="card space-y-2">
        <h2 id="reading-title" className="section-title">
          页面里的话怎么读
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-ink-soft">
          <li>写「民间认为」「祈愿」的地方，是在转述来源的说法；本站不主张任何超自然效果。</li>
          <li>不提供仪式操作指引，也不建议触摸神像；想看现场，请以当地公告与现场秩序为准。</li>
          <li>每张卡的地区与年份都照原文表述，不把某一村的做法推成整个潮汕的通则。</li>
        </ul>
      </section>

      {rest.length > 0 ? (
        <section aria-labelledby="more-title" className="space-y-3">
          <h2 id="more-title" className="section-title">
            其余条目
          </h2>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white/70">
            {rest.map((entry) => (
              <li key={entry.id}>
                <Link
                  to={entryHref(entry)}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 no-underline hover:bg-cream-dark/40"
                >
                  <span className="min-w-0">
                    <span className="block font-serif text-base text-ink">{entry.title}</span>
                    <span className="block text-xs text-muted">
                      {entry.region ? `${entry.region} · ` : ''}
                      {entry.summary || '内容待补充可靠来源'}
                    </span>
                  </span>
                  <VerifyBadge verify={entry.verify} compact />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PhotoCredits />

      <section aria-labelledby="sources-title" className="space-y-3">
        <h2 id="sources-title" className="section-title">
          本模块来源
        </h2>
        <div className="card">
          <SourceList ids={sourceIds} />
          <p className="mt-3 text-xs leading-6 text-muted">
            完整来源表、核验状态与仅作索引的条目见
            <Link to="/sources" className="link-inline mx-1">
              资料来源
            </Link>
            页。外链均在新标签页打开；页面实拍图来自 Wikimedia Commons，作者与许可证见上一节。
          </p>
        </div>
      </section>
    </div>
  )
}
