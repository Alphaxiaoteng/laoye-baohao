/**
 * 四个首版模块的配置。这里只描述"本站有哪些模块、页面怎么称呼"，
 * 不含任何文化事实；模块详情一律来自 content/*.json。
 */
export interface ModuleConfig {
  id: string
  title: string
  /** 模块首页的一句入门解释（只描述本站内容状态，不复述文化事实） */
  intro: string
  /** 内容侧 module 字段的兼容写法 */
  aliases: string[]
}

export const MODULES: ModuleConfig[] = [
  {
    id: 'yingge',
    title: '英歌舞',
    intro: '整理英歌相关的入门条目、角色与阵形示意；未核验的内容会标注「待核验」。',
    aliases: ['yingge', 'yingge-dance', 'yingge_dance', 'ying-ge', 'yinggedance', 'ying'],
  },
  {
    id: 'tea',
    title: '工夫茶',
    intro: '茶具、分步演示与斟茶示意；操作只是理解用的演示，不是专业教学标准。',
    aliases: [
      'tea',
      'gongfu',
      'gongfucha',
      'gongfu-tea',
      'gongfu_tea',
      'kungfu-tea',
      'tea-ceremony',
      'chadao',
    ],
  },
  {
    id: 'food',
    title: '潮汕美食',
    intro: '菜品简介与一道完整食谱的分步界面；展馆里看步骤不等于真的做过这道菜。',
    aliases: ['food', 'cuisine', 'meishi', 'dishes', 'recipe'],
  },
  {
    id: 'yinglaoye',
    title: '营老爷·游神',
    intro: '称呼、巡境、队伍与地区案例的知识卡；事件信息一律标注地区与年份。',
    aliases: [
      'yinglaoye',
      'ying-laoye',
      'ying_laoye',
      'laoye',
      'deity',
      'procession',
      'you-shen',
      'youshen',
      'folk',
      'folk-custom',
    ],
  },
]

/** 来源页出现但不在四个体验模块里的分组（content/sources.json 的 module 取值） */
export const EXTRA_MODULE_LABELS: Record<string, string> = {
  tingchao: '听潮',
  opera: '潮剧与工艺（扩展）',
}

export function moduleConfig(slug: string | undefined): ModuleConfig | undefined {
  if (!slug) return undefined
  const key = slug.trim().toLowerCase()
  return MODULES.find(
    (m) => m.id.toLowerCase() === key || m.aliases.some((a) => a.toLowerCase() === key),
  )
}

export function moduleTitle(slug: string | undefined): string {
  const config = moduleConfig(slug)
  if (config) return config.title
  if (!slug) return '未分类'
  return EXTRA_MODULE_LABELS[slug] ?? slug
}
