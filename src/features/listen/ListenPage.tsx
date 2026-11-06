import { audioItems } from '../../lib/content'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { LISTEN_CATEGORIES, groupListenItems, listenStats } from './catalog'
import { ListenPhraseList } from './ListenPhraseList'
import { ListenAttribution, ListenLicensingNote, ListenSourceCheck } from './ListenPanels'

export default function ListenFeaturePage() {
  usePageTitle('听潮')
  usePageContext({ module: 'tingchao', moduleTitle: '听潮' })

  const groups = groupListenItems(audioItems)
  const stats = listenStats(audioItems)

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.3em] text-brick">听潮</p>
        <h1 className="font-serif text-3xl text-ink">几句潮汕话</h1>
        <p className="text-sm leading-6 text-muted">
          真实录音，不做合成。点 ▶ 收听；新一条会停掉上一条。
        </p>
        <p className="text-[11px] leading-5 text-faint">
          共 {stats.total} 条（可播放 {stats.playable} 条）。拼音、口音与署名都在每条「信息」里。
        </p>
      </header>

      <nav aria-label="听潮分类" className="flex flex-wrap gap-2">
        {LISTEN_CATEGORIES.map((category) => (
          <a
            key={category.slug}
            href={`#cat-${category.slug}`}
            className="chip no-underline hover:border-brick hover:text-brick"
          >
            {category.label}
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        {groups.map(({ category, items }) => (
          <section
            key={category.slug}
            aria-labelledby={`cat-${category.slug}`}
            className="scroll-mt-24 space-y-3"
          >
            <h2 id={`cat-${category.slug}`} className="section-title">
              {category.label}
              <span className="ml-2 text-xs font-normal text-muted">{items.length} 条</span>
            </h2>
            {items.length === 0 ? (
              <p className="text-sm leading-6 text-ink-soft">
                这一类还没有取得授权录音，暂不填写未经核对的读音。
              </p>
            ) : (
              <ListenPhraseList items={items} />
            )}
          </section>
        ))}
      </div>

      <ListenSourceCheck />
      <ListenLicensingNote />
      <ListenAttribution />
    </div>
  )
}
