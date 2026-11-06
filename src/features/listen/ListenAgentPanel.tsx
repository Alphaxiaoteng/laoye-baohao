import { useState } from 'react'
import { audioItems } from '../../lib/content'
import { LISTEN_CATEGORIES, orderListenItems } from './catalog'
import { ListenPhraseList } from './ListenPhraseList'

const ALL = 'all'

/**
 * 悬浮 Agent 里的「听潮」视图：与问答共用抽屉外壳，只换内容区。
 * 默认列出全部词句，分类只做筛选；文案压到最低（大字词句 + 播放 + 一句释义），
 * 拼音、口音、录音者与许可都收进每条的「信息」。
 */
export function ListenAgentPanel() {
  const [active, setActive] = useState<string>(ALL)

  const ordered = LISTEN_CATEGORIES.flatMap((category) =>
    orderListenItems(audioItems, category.slug),
  )
  const items = active === ALL ? ordered : orderListenItems(audioItems, active)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="group"
        aria-label="听潮分类"
        className="flex shrink-0 flex-wrap gap-1 px-4 pb-2 pt-3"
      >
        {[{ slug: ALL, label: '全部' }, ...LISTEN_CATEGORIES].map((category) => {
          const current = active === category.slug
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActive(category.slug)}
              aria-pressed={current}
              className={[
                'inline-flex min-h-[30px] shrink-0 items-center rounded-full border px-2.5 text-[12px] transition-colors duration-200 ease-exhibit',
                current
                  ? 'border-coral/70 bg-coral/15 text-ink'
                  : 'border-white/14 bg-white/[0.04] text-muted hover:text-ink',
              ].join(' ')}
            >
              {category.label}
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <ListenPhraseList items={items} />
      </div>

      <p className="shrink-0 border-t border-white/10 px-4 py-2 text-[10.5px] leading-4 text-faint">
        真实录音 · Wikimedia Commons ·{' '}
        <a
          className="link-inline"
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY-SA 4.0
        </a>
        {' '}· 作者见每条「信息」
      </p>
    </div>
  )
}

export default ListenAgentPanel
