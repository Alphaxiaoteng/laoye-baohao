/**
 * 内容模型：字段定义与 PLAN.md「目录」一节保持一致。
 * 前端与后端都只通过 content/*.json 读取文化内容，组件里不写死文化事实。
 */

/** 核验状态。内容侧可能出现的取值：verified / pending-source / draft-needs-local-review / fetch-failed */
export type VerifyStatus = string

/** 文化模块。首版四模块；示例数据里若出现别的 module 值，前端按原值兜底展示。 */
export type ModuleId = 'yingge' | 'tea' | 'food' | 'deity'

export interface Source {
  id: string
  title: string
  org?: string
  url: string
  /** 适用地区 / 适用范围 */
  region?: string
  /** 访问日期，ISO 或 YYYY-MM-DD */
  accessDate?: string
  verify?: VerifyStatus
  /** 该来源主要服务的模块，可选 */
  module?: string
  note?: string
}

export interface Entry {
  id: string
  module: string
  title: string
  summary?: string
  body?: string
  region?: string
  sourceIds?: string[]
  verify?: VerifyStatus
}

export type StoryAction =
  | string
  | {
      label?: string
      text?: string
      to?: string
      type?: string
      entryId?: string
    }

export interface StoryChapter {
  id: string
  order?: number
  title: string
  /** 故事为原创虚构串联；章节里 fiction: true 用于前端提示 */
  fiction?: boolean
  narrative?: string
  entryIds?: string[]
  action?: StoryAction
  region?: string
}

export interface Ingredient {
  name: string
  amount?: string
  note?: string
}

export type IngredientLike = string | Ingredient

export interface RecipeStep {
  /** 原始序号（content 里可能写成 n） */
  n?: number
  /** 短动作说明 */
  text: string
  note?: string
  /** 可选计时，单位秒；仅为提示，不代表已熟 */
  durationSec?: number
  /** 该步骤相关食材 */
  ingredients?: string[]
}

export type RecipeStepLike =
  | string
  | {
      n?: number
      text?: string
      title?: string
      description?: string
      note?: string
      durationSec?: number
      timerSec?: number
      seconds?: number
      ingredients?: string[]
    }

export interface Recipe {
  id: string
  name: string
  region?: string
  servings?: string | number
  ingredients?: IngredientLike[]
  tools?: string[]
  steps?: RecipeStepLike[]
  safety?: string[]
  sourceIds?: string[]
  verify?: VerifyStatus
  summary?: string
  /** 过敏原提示 */
  allergens?: string[]
  prepTime?: string
  cookTime?: string
  difficulty?: string
}

export interface AudioItem {
  id: string
  category: string
  /** 中文词句 */
  text: string
  /** 普通话释义 */
  meaning?: string
  accent?: string
  /** 拼音未经校对可缺省 */
  pinyin?: string
  /** 本地音频路径；为空表示未取得授权录音 */
  file?: string
  recorder?: string
  license?: string
  sourceIds?: string[]
  durationSec?: number
}

export interface MediaItem {
  id: string
  file?: string
  type?: string
  author?: string
  license?: string
  alt?: string
  caption?: string
  /** 媒体来源（外链） */
  sourceIds?: string[]
}

export interface ContentBundle {
  entries: Entry[]
  story: StoryChapter[]
  recipes: Recipe[]
  audio: AudioItem[]
  sources: Source[]
  media: MediaItem[]
}

export const EMPTY_CONTENT: ContentBundle = {
  entries: [],
  story: [],
  recipes: [],
  audio: [],
  sources: [],
  media: [],
}
