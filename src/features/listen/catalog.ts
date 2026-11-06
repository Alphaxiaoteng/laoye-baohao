import type { AudioItem } from '../../types/content'

/** 听潮分类：顺序即页面与导航的展示顺序，slug 同时是 /listen/:category 的参数 */
export interface ListenCategory {
  slug: string
  label: string
  /** 只描述本站收录范围，不复述方言事实 */
  intro: string
}

export const LISTEN_CATEGORIES: ListenCategory[] = [
  { slug: 'greeting', label: '打招呼', intro: '见面时的招呼与祝语。' },
  { slug: 'tea-food', label: '喝茶吃饭', intro: '桌上最常说的几句。' },
  { slug: 'courtesy', label: '日常礼貌', intro: '道谢、谦让与回应。' },
  { slug: 'culture', label: '文化词语', intro: '称呼、地名与常用表达。' },
]

/**
 * 手工排序：数组顺序就是页面顺序。
 * 内容文件里新增、但没登记在这里的词条，按原顺序排在末尾（不会被隐藏）。
 */
export const LISTEN_MANUAL_ORDER: Record<string, string[]> = {
  greeting: ['audio-greeting-1', 'audio-greeting-3', 'audio-greeting-2'],
  'tea-food': [
    'audio-tea-food-1',
    'audio-tea-food-2',
    'audio-tea-food-3',
    'audio-tea-food-4',
    'audio-tea-food-5',
  ],
  courtesy: [
    'audio-courtesy-1',
    'audio-courtesy-2',
    'audio-courtesy-3',
    'audio-courtesy-4',
    'audio-courtesy-5',
  ],
  culture: [
    'audio-culture-1',
    'audio-culture-2',
    'audio-culture-3',
    'audio-culture-4',
    'audio-culture-5',
    'audio-culture-6',
    'audio-culture-7',
    'audio-culture-8',
  ],
}

/**
 * 主界面只显示一句话释义：取释义里第一个全角括号之前的部分。
 * 完整释义（含「字面」拆解）留在详情里，不删任何已核对的信息。
 */
export function shortMeaning(meaning: string | undefined): string {
  const raw = (meaning ?? '').trim()
  if (!raw) return ''
  const cut = raw.indexOf('（')
  const head = cut >= 0 ? raw.slice(0, cut).trim() : raw
  return head || raw
}

export function isListenCategory(slug: string | undefined): slug is string {
  return Boolean(slug) && LISTEN_CATEGORIES.some((c) => c.slug === slug)
}

export function listenCategory(slug: string | undefined): ListenCategory | undefined {
  return LISTEN_CATEGORIES.find((c) => c.slug === slug)
}

/** 同一分类内按手工顺序排列；未登记的 id 保持内容文件里的相对顺序 */
export function orderListenItems(
  items: AudioItem[],
  category: string,
  manualOrder: Record<string, string[]> = LISTEN_MANUAL_ORDER,
): AudioItem[] {
  const order = manualOrder[category] ?? []
  const rank = new Map(order.map((id, index) => [id, index]))
  return items
    .filter((item) => (item.category ?? '') === category)
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const rankA = rank.get(a.item.id) ?? Number.MAX_SAFE_INTEGER
      const rankB = rank.get(b.item.id) ?? Number.MAX_SAFE_INTEGER
      if (rankA !== rankB) return rankA - rankB
      return a.index - b.index
    })
    .map((entry) => entry.item)
}

/** 按分类顺序分组，空分类也保留，页面据此显示「音频待授权录制」 */
export function groupListenItems(
  items: AudioItem[],
): { category: ListenCategory; items: AudioItem[] }[] {
  return LISTEN_CATEGORIES.map((category) => ({
    category,
    items: orderListenItems(items, category.slug),
  }))
}

export function listenStats(items: AudioItem[]): {
  total: number
  playable: number
  pending: number
} {
  const playable = items.filter((item) => (item.file ?? '').trim() !== '').length
  return { total: items.length, playable, pending: items.length - playable }
}

/** 播放失败/无文件时使用的固定提示，避免各处文案漂移 */
export const AUDIO_PENDING_LABEL = '音频待授权录制'
