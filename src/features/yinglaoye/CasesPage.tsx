import { Link } from 'react-router-dom'
import { entryById, entryHref } from '../../lib/content'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { SourceBadges } from '../../components/SourceBadge'
import VerifyBadge from '../../components/VerifyBadge'
import Breadcrumb from './components/Breadcrumb'
import CityCaseCard from './components/CityCaseCard'
import PhotoCredits from './components/PhotoCredits'
import { CASES, CASE_READING_NOTES, CITY_CASES, PHOTO_NOTE } from './data'

const MODULE_TITLE = '营老爷·游神'

/**
 * /museum/yinglaoye/cases
 * 三城案例（潮州 / 汕头 / 揭阳，图在上、信息在下）+ 四处记录的逐条对照。
 * 对照字段固定为地区 / 时间（原文年份）/ 活动要点 / 来源，桌面用表格，窄屏改为卡片。
 */
export default function CasesPage() {
  usePageTitle('地区案例对照')
  usePageContext({ module: 'yinglaoye', moduleTitle: MODULE_TITLE })

  const rows = CASES.flatMap((meta) => {
    const entry = entryById(meta.entryId)
    return entry ? [{ meta, entry }] : []
  })

  return (
    <div className="space-y-8">
      <Breadcrumb current="地区案例" />

      <header className="max-w-3xl space-y-3">
        <p className="text-xs tracking-[0.2em] text-brick">地区案例</p>
        <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
          三城各一例：潮州 · 汕头 · 揭阳
        </h1>
        <p className="text-[15px] leading-7 text-ink-soft">
          潮州、汕头、揭阳各取一份已有记录，配一张潮汕营老爷实拍；
          再往下是四处记录的逐条对照（含潮州元巷村）。他们不是完整名录，也不构成一套统一流程。
        </p>
        <p className="rounded-xl border border-brick/30 bg-brick/5 px-3 py-2 text-sm leading-6 text-brick">
          旧日期只代表当时记录的那一年，不能当作今年的活动日程。当年的日期请查当地公告。
        </p>
      </header>

      <section aria-labelledby="city-title" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="city-title" className="section-title">
            每城一卡
          </h2>
          <p className="text-xs text-muted">点整张卡进条目全文与来源编号</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CITY_CASES.map((item) => (
            <li key={item.city} className="h-full">
              <CityCaseCard item={item} />
            </li>
          ))}
        </ul>
        <p className="text-xs leading-6 text-muted">
          {PHOTO_NOTE}；图片授权见页末「图片来源与授权」。
        </p>
      </section>

      <section aria-labelledby="table-title" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="table-title" className="section-title">
            逐条对照（四处记录）
          </h2>
          <p className="text-xs text-muted">地区 / 时间（原文年份）/ 活动要点 / 来源</p>
        </div>

        {rows.length === 0 ? (
          <div className="card">
            <p className="text-sm text-ink-soft">案例条目还没有登记，请先看模块首页与来源页。</p>
          </div>
        ) : (
          <>
            {/* 桌面：并排表格 */}
            <div className="hidden overflow-hidden rounded-2xl border border-line bg-white/70 lg:block">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  营老爷地区案例对照：地区、原文时间、活动要点与来源
                </caption>
                <thead>
                  <tr className="bg-cream-dark/60 text-xs text-muted">
                    <th scope="col" className="w-[18%] px-4 py-3 font-medium">
                      地区
                    </th>
                    <th scope="col" className="w-[22%] px-4 py-3 font-medium">
                      时间（原文年份）
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      活动要点
                    </th>
                    <th scope="col" className="w-[16%] px-4 py-3 font-medium">
                      来源
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ meta, entry }) => (
                    <tr key={entry.id} className="border-t border-line align-top">
                      <th scope="row" className="px-4 py-4 font-normal">
                        <Link to={entryHref(entry)} className="link-inline font-serif text-base">
                          {meta.region}
                        </Link>
                        <span className="mt-2 block">
                          <VerifyBadge verify={entry.verify} compact />
                        </span>
                      </th>
                      <td className="px-4 py-4 text-xs leading-6 text-ink-soft">{meta.time}</td>
                      <td className="px-4 py-4">
                        <ul className="list-disc space-y-1.5 pl-4 text-sm leading-6 text-ink-soft">
                          {meta.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                        <Link to={entryHref(entry)} className="mt-2 inline-block text-xs link-inline">
                          条目全文与说明 →
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <SourceBadges ids={meta.sourceIds} className="flex-col items-start" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 窄屏：竖排卡片，字段齐全 */}
            <ul className="space-y-4 lg:hidden">
              {rows.map(({ meta, entry }) => (
                <li key={entry.id} className="card space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-serif text-lg leading-snug text-ink">{meta.region}</h3>
                    <VerifyBadge verify={entry.verify} compact />
                  </div>

                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-medium text-muted">时间（原文年份）</dt>
                      <dd className="mt-1 leading-6 text-ink-soft">{meta.time}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted">活动要点</dt>
                      <dd className="mt-1">
                        <ul className="list-disc space-y-1.5 pl-5 leading-6 text-ink-soft">
                          {meta.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-muted">来源</dt>
                      <dd className="mt-1">
                        <SourceBadges ids={meta.sourceIds} />
                      </dd>
                    </div>
                  </dl>

                  <Link to={entryHref(entry)} className="inline-block text-sm link-inline">
                    条目全文与说明 →
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="notes-title" className="card space-y-2">
        <h2 id="notes-title" className="section-title">
          对照时注意
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-ink-soft">
          {CASE_READING_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <PhotoCredits />

      <nav aria-label="继续浏览" className="flex flex-wrap gap-3 border-t border-line pt-5">
        <Link to="/museum/yinglaoye" className="btn-secondary">
          回模块首页
        </Link>
        <Link to="/museum/yinglaoye/procession" className="btn-quiet">
          看队伍示意
        </Link>
        <Link to="/sources" className="btn-quiet">
          全部来源
        </Link>
      </nav>
    </div>
  )
}
