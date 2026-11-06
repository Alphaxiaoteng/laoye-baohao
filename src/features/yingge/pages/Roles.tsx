import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageContext, usePageTitle } from '../../../lib/usePageContext'
import { SourceBadges, SourceList } from '../../../components/SourceBadge'
import { MEDIA, OBJECTS, TEAM_ROLES } from '../data'
import { PageSection, YinggeHeader, SourceNote } from '../components/YinggeChrome'

export default function YinggeRoles() {
  usePageTitle('英歌舞 · 角色与器物')
  usePageContext({
    module: 'yingge',
    moduleTitle: '英歌舞',
    entryId: 'yingge-role',
    entryTitle: '队伍里的角色与位置',
  })

  const [selectedId, setSelectedId] = useState(OBJECTS[0].id)
  const selected = OBJECTS.find((item) => item.id === selectedId) ?? OBJECTS[0]

  return (
    <div className="space-y-8">
      <YinggeHeader
        current="角色器物"
        kicker="角色与器物 · ROLES & OBJECTS"
        title="先问「他在队伍里做什么」"
        lead={
          <>
            许多英歌队借用《水浒传》英雄，但人数、角色、脸谱与道具因队伍而异。辨认时先看队列位置与功能，
            再核对器物与队伍资料；下面的整理主要来自汕头市地方标准对潮阳英歌的记录。
          </>
        }
      />

      <PageSection
        id="team"
        title="一支队伍里的位置"
        intro="地方标准把潮阳英歌队分成这些角色；其他地区与队伍的设置可能不同。先看两帧实拍，再看职责。"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <figure className="space-y-2">
            <img
              src={MEDIA.secondClub}
              alt="实拍画面：黑面黑须的英歌队员举起英歌槌"
              width={1280}
              height={559}
              loading="lazy"
              decoding="async"
              className="w-full rounded-card border border-line object-cover"
            />
            <figcaption className="text-xs leading-5 text-muted">
              实拍帧：黑面黑须、黑髯的队员举起英歌槌。与标准描述的二槌形象接近，但仅凭画面不能确认身份。
            </figcaption>
          </figure>
          <figure className="space-y-2">
            <img
              src={MEDIA.performerAlley}
              alt="实拍画面：身穿红色戏服的队员在巷道中挥槌转身"
              width={1280}
              height={559}
              loading="lazy"
              decoding="async"
              className="w-full rounded-card border border-line object-cover"
            />
            <figcaption className="text-xs leading-5 text-muted">
              实拍帧：巷道中的挥槌动作。服饰与动作只提供线索，人物身份仍以队伍资料为准。
            </figcaption>
          </figure>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="card space-y-2">
            <h3 className="font-serif text-base text-ink">头槌与二槌</h3>
            <p className="text-sm leading-6 text-ink-soft">
              领舞两人，站在队伍最前两边：红面红须的头槌多扮秦明或关胜，黑面黑须的二槌多扮李逵；
              同一人物在不同流派中脸谱可能不同。
            </p>
            <SourceBadges ids={['S103']} />
          </div>
          <div className="card space-y-2">
            <h3 className="font-serif text-base text-ink">引舞与指挥</h3>
            <p className="text-sm leading-6 text-ink-soft">
              引舞开路、打场并协助指挥，最常见由耍蛇的时迁担任；指挥用鼓点发号令，执令者因队伍而异。
            </p>
            <SourceBadges ids={['S103']} />
          </div>
        </div>

        <details className="card">
          <summary className="flex min-h-[44px] cursor-pointer items-center text-sm font-medium text-brick">
            队伍构成：8 个位置（展开职责表）
          </summary>
          <div className="mt-3 overflow-hidden rounded-card border border-line bg-white/60">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">潮阳英歌队伍构成（S103）</caption>
              <thead>
                <tr className="border-b border-line bg-cream-dark/50 text-left">
                  <th scope="col" className="px-4 py-2.5 font-medium text-ink">
                    名称
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-ink">
                    主要职责
                  </th>
                </tr>
              </thead>
              <tbody>
                {TEAM_ROLES.map((role) => (
                  <tr key={role.name} className="border-b border-line/70 last:border-b-0">
                    <th
                      scope="row"
                      className="w-[9.5rem] px-4 py-2.5 text-left align-top font-medium text-ink"
                    >
                      {role.name}
                    </th>
                    <td className="px-4 py-2.5 align-top leading-6 text-ink-soft">{role.duty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </PageSection>

      <PageSection
        id="objects"
        title="六件器物，逐个看"
        intro="点选一件看它的形制与用法；图为参考项目的概念器物图，不是某一支队伍的文物档案。"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
            {OBJECTS.map((item) => {
              const active = item.id === selected.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    aria-pressed={active}
                    className={[
                      'flex h-full w-full flex-col gap-2 rounded-card border p-3 text-left transition-colors duration-200 ease-exhibit',
                      active
                        ? 'border-brick/60 bg-brick/[0.05]'
                        : 'border-line bg-white/60 hover:border-brick/40 hover:bg-hover',
                    ].join(' ')}
                  >
                    <span className="flex h-20 items-center justify-center overflow-hidden rounded-card bg-cream-dark/60">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain p-1"
                      />
                    </span>
                    <span className="font-serif text-sm text-ink">{item.name}</span>
                    <span className="text-xs leading-5 text-muted">{item.summary}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <article key={selected.id} aria-live="polite" className="card space-y-3 lg:sticky lg:top-24">
            <div className="flex flex-col gap-1.5">
              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.24em] text-brick">{selected.imageKind}</p>
                <h3 className="mt-1 font-serif text-xl text-ink">{selected.name}</h3>
              </div>
              <SourceBadges ids={selected.sourceIds} />
            </div>
            <img
              src={selected.image}
              alt={selected.name}
              width={220}
              height={220}
              className="mx-auto h-44 w-auto object-contain"
            />
            <details className="border-t border-line pt-3">
              <summary className="flex min-h-[44px] cursor-pointer items-center text-sm font-medium text-brick">
                形制与用法
              </summary>
              <p className="mt-2 text-base leading-8 text-ink-soft">{selected.detail}</p>
            </details>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {selected.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11px] tracking-widest text-muted">{fact.label}</dt>
                  <dd className="mt-0.5 leading-6 text-ink-soft">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>

        <SourceNote>
          器物名称、形制与使用方式摘录自汕头市地方标准（S103）；英歌槌长度一条另见国家级项目页（S100），
          两处数字并不一致，页面已如实列出。想看器物放在一起的样子，可读
          <Link to="/museum/yingge/yingge-objects" className="link-inline mx-1">
            器物与服饰条目
          </Link>
          。
        </SourceNote>
      </PageSection>

      <PageSection id="boundary" title="为什么不一开口就报人物名">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-center">
          <p className="text-base leading-8 text-ink-soft">
            脸谱提供线索，却不能单独确认身份：标准写明，一般只有队伍前几位表演者有特定的、为人熟悉的水浒英雄形象，
            其余多不确定。本页因此把「位置与职能」放在最前，把「他可能是谁」放在最后；看不清的，就说看不清。
          </p>
          <figure className="space-y-2">
            <img
              src={MEDIA.objectsArchive}
              alt="概念器物图：鼓、双槌、锣、头饰与戏服摆放在纸面上"
              width={1400}
              height={788}
              loading="lazy"
              decoding="async"
              className="w-full rounded-card border border-line object-cover"
            />
            <figcaption className="text-xs leading-5 text-muted">
              参考项目的概念器物图：大鼓、双槌、锣、头冠与戏服。用作组合关系示意，不是具体队伍的器物档案。
            </figcaption>
          </figure>
        </div>
      </PageSection>

      <PageSection id="sources" title="来源">
        <div className="card">
          <SourceList ids={['S103', 'S101', 'S100']} />
        </div>
      </PageSection>
    </div>
  )
}
