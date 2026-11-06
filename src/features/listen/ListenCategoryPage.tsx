import { Link, useParams } from 'react-router-dom'
import { audioItems } from '../../lib/content'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { AUDIO_PENDING_LABEL, LISTEN_CATEGORIES, listenCategory, listenStats, orderListenItems } from './catalog'
import { ListenPhraseList } from './ListenPhraseList'
import {
  ListenAttribution,
  ListenCategoryJump,
  ListenLicensingNote,
  ListenSourceCheck,
} from './ListenPanels'

export default function ListenCategoryPage() {
  const { category: slug } = useParams<{ category: string }>()
  const category = listenCategory(slug)
  const items = category ? orderListenItems(audioItems, category.slug) : []
  const stats = listenStats(items)

  usePageTitle(category ? `听潮·${category.label}` : '听潮')
  usePageContext({
    module: 'tingchao',
    moduleTitle: category ? `听潮·${category.label}` : '听潮',
  })

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs tracking-[0.3em] text-brick">听潮</p>
          <h1 className="font-serif text-3xl text-ink">这个分类还没有登记</h1>
          <p className="text-sm leading-6 text-muted">
            听潮只有打招呼、喝茶吃饭、日常礼貌、文化词语四类，地址里的分类名可能写错了。
          </p>
        </header>
        <ul className="flex flex-wrap gap-2">
          {LISTEN_CATEGORIES.map((entry) => (
            <li key={entry.slug}>
              <Link to={`/listen/${entry.slug}`} className="btn-secondary">
                {entry.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/listen" className="btn-primary">
          回到听潮首页
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <nav aria-label="面包屑" className="text-xs text-muted">
          <Link to="/listen" className="text-brick underline-offset-4 hover:underline">
            听潮
          </Link>
          <span aria-hidden="true"> / </span>
          <span>{category.label}</span>
        </nav>
        <h1 className="font-serif text-3xl text-ink">{category.label}</h1>
        <p className="text-sm leading-6 text-muted">
          {category.intro} 共 {stats.total} 条，点 ▶ 收听。
        </p>
      </header>

      {items.length === 0 ? (
        <div className="card space-y-2">
          <p className="text-sm leading-6 text-ink-soft">
            这一类还没有取得授权的真实录音，不拿合成音或来源不明的录音凑数。
          </p>
          <p className="inline-flex min-h-[44px] items-center text-sm text-brick">{AUDIO_PENDING_LABEL}</p>
        </div>
      ) : (
        <ListenPhraseList items={items} />
      )}

      <ListenCategoryJump current={category.slug} />
      <ListenSourceCheck />
      {items.length === 0 ? <ListenLicensingNote /> : null}
      <ListenAttribution />
    </div>
  )
}
