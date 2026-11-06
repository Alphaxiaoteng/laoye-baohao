import raw from '../../../content/guides.json'

/**
 * 小红书攻略数据。
 * 抓取管线见 scripts/fetch-xhs-guide.mjs；这里只做归一化，
 * 不在前端保存任何密钥，也不直连第三方接口。
 */
export interface GuideItem {
  id: string
  /** 城市归属：潮州 / 汕头 / 揭阳 / 潮汕（跨市） */
  city: string
  /** guide=行程攻略 food=美食合集 recipe=家常做法 */
  kind: 'guide' | 'food' | 'recipe'
  title: string
  excerpt: string
  author: string
  likes: number
  collects: number
  comments: number
  publishedAt: string
  /** 自托管封面；缺图时为空字符串 */
  cover: string
  noteUrl: string
  sourceIds: string[]
  verify: string
}

const list = Array.isArray(raw) ? (raw as GuideItem[]) : []

export const guideItems: GuideItem[] = list.filter(
  (item) => item && typeof item.id === 'string' && typeof item.title === 'string' && item.title.trim() !== '',
)

export const GUIDE_CITIES = ['全部', '潮州', '汕头', '揭阳', '潮汕'] as const

export const GUIDE_KINDS: { id: 'all' | GuideItem['kind']; label: string }[] = [
  { id: 'all', label: '全部类型' },
  { id: 'guide', label: '行程攻略' },
  { id: 'food', label: '美食合集' },
  { id: 'recipe', label: '家常做法' },
]
