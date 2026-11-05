import type {
  AudioItem,
  ContentBundle,
  Entry,
  Ingredient,
  MediaItem,
  Recipe,
  RecipeStep,
  Source,
  StoryChapter,
} from '../types/content'
import { moduleConfig, type ModuleConfig } from './modules'

/**
 * 内容读取层。
 * 所有文化内容都来自仓库根目录 content/*.json（构建时打包），
 * 文件缺失或字段不全时按空值兜底，页面显示"内容准备中"而不是崩掉。
 */
const rawFiles = import.meta.glob('../../content/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>

/** 合并 content/<name>.json 与按模块拆分的 content/<name>.<module>.json */
function pickFile(name: string): unknown {
  const pattern = new RegExp(`/content/${name}(\\.[\\w-]+)?\\.json$`)
  const hits = Object.keys(rawFiles)
    .filter((p) => pattern.test(p))
    .sort()
  if (hits.length === 0) return undefined
  return hits.flatMap((p) => asArray<unknown>(rawFiles[p], name))
}

function asArray<T>(value: unknown, key: string): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const bag = value as Record<string, unknown>
    for (const candidate of [key, 'items', 'list', 'data']) {
      if (Array.isArray(bag[candidate])) return bag[candidate] as T[]
    }
  }
  return []
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.trim() !== '')
}

/** 条目正文：空 / 字面量 pending-source 都视为"待补充可靠来源" */
export function normalizeEntry(raw: Entry): Entry {
  return {
    ...raw,
    id: text(raw?.id),
    module: text(raw?.module),
    title: text(raw?.title),
    summary: text(raw?.summary),
    body: text(raw?.body),
    region: text(raw?.region),
    sourceIds: stringList(raw?.sourceIds),
    verify: text(raw?.verify) || 'draft-needs-local-review',
  }
}

export function normalizeSource(raw: Source): Source {
  return {
    ...raw,
    id: text(raw?.id),
    title: text(raw?.title),
    org: text(raw?.org),
    url: text(raw?.url),
    region: text(raw?.region),
    accessDate: text(raw?.accessDate),
    verify: text(raw?.verify) || 'draft-needs-local-review',
    module: text(raw?.module),
    note: text(raw?.note),
  }
}

export function normalizeIngredients(recipe: Recipe): Ingredient[] {
  const list = Array.isArray(recipe?.ingredients) ? recipe.ingredients : []
  const out: Ingredient[] = []
  for (const item of list) {
    if (typeof item === 'string') {
      const trimmed = item.trim()
      if (trimmed) out.push({ name: trimmed })
      continue
    }
    if (item && typeof item === 'object') {
      const name = text((item as Ingredient).name).trim()
      if (name) {
        out.push({
          name,
          amount: text((item as Ingredient).amount),
          note: text((item as Ingredient).note),
        })
      }
    }
  }
  return out
}

export function normalizeSteps(recipe: Recipe): RecipeStep[] {
  const list = Array.isArray(recipe?.steps) ? recipe.steps : []
  const out: RecipeStep[] = []
  for (const item of list) {
    if (typeof item === 'string') {
      const trimmed = item.trim()
      if (trimmed) out.push({ text: trimmed })
      continue
    }
    if (item && typeof item === 'object') {
      const raw = item as Record<string, unknown>
      const body = text(raw.text) || text(raw.description) || text(raw.title)
      if (!body.trim()) continue
      const timerRaw = raw.durationSec ?? raw.timerSec ?? raw.seconds
      const durationSec =
        typeof timerRaw === 'number' && Number.isFinite(timerRaw) && timerRaw > 0
          ? Math.round(timerRaw)
          : undefined
      out.push({
        text: body,
        n: typeof raw.n === 'number' ? raw.n : undefined,
        note: text(raw.note),
        durationSec,
        ingredients: stringList(raw.ingredients),
      })
    }
  }
  return out
}

export function normalizeRecipe(raw: Recipe): Recipe {
  const recipe: Recipe = {
    ...raw,
    id: text(raw?.id),
    name: text(raw?.name),
    region: text(raw?.region),
    servings: typeof raw?.servings === 'number' ? String(raw.servings) : text(raw?.servings),
    tools: stringList(raw?.tools),
    safety: stringList(raw?.safety),
    allergens: stringList(raw?.allergens),
    sourceIds: stringList(raw?.sourceIds),
    summary: text(raw?.summary),
    prepTime: text(raw?.prepTime),
    cookTime: text(raw?.cookTime),
    difficulty: text(raw?.difficulty),
    verify: text(raw?.verify) || 'draft-needs-local-review',
  }
  return recipe
}

export function normalizeChapter(raw: StoryChapter): StoryChapter {
  return {
    ...raw,
    id: text(raw?.id),
    title: text(raw?.title),
    narrative: text(raw?.narrative),
    entryIds: stringList(raw?.entryIds),
    order: typeof raw?.order === 'number' ? raw.order : Number.MAX_SAFE_INTEGER,
  }
}

export function normalizeAudio(raw: AudioItem): AudioItem {
  return {
    ...raw,
    id: text(raw?.id),
    category: text(raw?.category) || '未分类',
    text: text(raw?.text),
    meaning: text(raw?.meaning),
    accent: text(raw?.accent),
    pinyin: text(raw?.pinyin),
    file: text(raw?.file),
    recorder: text(raw?.recorder),
    license: text(raw?.license),
    sourceIds: stringList(raw?.sourceIds),
  }
}

export const content: ContentBundle = {
  entries: asArray<Entry>(pickFile('entries'), 'entries').map(normalizeEntry),
  story: asArray<StoryChapter>(pickFile('story'), 'story')
    .map(normalizeChapter)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  recipes: asArray<Recipe>(pickFile('recipes'), 'recipes').map(normalizeRecipe),
  audio: asArray<AudioItem>(pickFile('audio'), 'audio').map(normalizeAudio),
  sources: asArray<Source>(pickFile('sources'), 'sources').map(normalizeSource),
  media: asArray<MediaItem>(pickFile('media'), 'media'),
}

export const entries = content.entries
export const storyChapters = content.story
export const recipes = content.recipes
export const audioItems = content.audio
export const sources = content.sources
export const mediaItems = content.media

/** 有任意内容可用（用于首页/模块页的"内容准备中"提示） */
export const hasAnyContent =
  entries.length > 0 || storyChapters.length > 0 || recipes.length > 0 || audioItems.length > 0

export function sourceById(id: string): Source | undefined {
  return sources.find((s) => s.id === id)
}

export function entryById(id: string | undefined): Entry | undefined {
  if (!id) return undefined
  return entries.find((e) => e.id === id)
}

export function chapterById(id: string | undefined): StoryChapter | undefined {
  if (!id) return undefined
  return storyChapters.find((s) => s.id === id)
}

export function recipeById(id: string | undefined): Recipe | undefined {
  if (!id) return undefined
  return recipes.find((r) => r.id === id)
}

export { moduleConfig } from './modules'

export function entriesOfModule(moduleId: string): Entry[] {
  const config = moduleConfig(moduleId)
  const known = (config ? [config.id, ...config.aliases] : [moduleId]).map((v) => v.toLowerCase())
  return entries.filter(
    (e) => known.includes((e.module ?? '').toLowerCase()) || e.module === moduleId,
  )
}

export function entryHref(entry: Pick<Entry, 'id' | 'module'>): string {
  return `/museum/${entry.module}/${entry.id}`
}

export function moduleHref(moduleId: string): string {
  return `/museum/${moduleId}`
}

/**
 * 正文是否可展示。verify 为 pending-source 或正文为空/字面量占位时，
 * 页面显示「内容待补充可靠来源」而不编造内容。
 */
export function entryBodyState(entry: Entry): { text: string; placeholder: boolean } {
  const body = (entry.body ?? '').trim()
  if (body === '' || isPlaceholderText(body) || body.length < 4) {
    return { text: PENDING_SOURCE_TEXT, placeholder: true }
  }
  const stub = (entry.verify ?? '') === 'pending-source'
  return { text: body, placeholder: stub }
}

export const PENDING_SOURCE_TEXT = '内容待补充可靠来源'

/** 条目核验状态（content/entries.json 的 verify） */
export const VERIFY_LABELS: Record<string, string> = {
  verified: '已核验',
  'pending-source': '待补充来源',
  'draft-needs-local-review': '待本地审核',
  'fetch-failed': '来源待核验',
  pending: '待核验',
}

/** 来源核验状态（content/sources.json 的 verify） */
export const SOURCE_VERIFY_LABELS: Record<string, string> = {
  fetched: '已抓取核对',
  'fetch-failed': '抓取失败',
  'index-only': '辅助索引',
  'reference-only': '仅作参考',
  verified: '已核验',
  'pending-source': '待补充来源',
  'draft-needs-local-review': '待本地审核',
}

/** 听潮分类（content/audio.json 的 category） */
export const AUDIO_CATEGORY_LABELS: Record<string, string> = {
  greeting: '打招呼',
  'tea-food': '喝茶吃饭',
  courtesy: '日常礼貌',
  culture: '文化词语',
}

export const AUDIO_CATEGORY_ORDER = ['greeting', 'tea-food', 'courtesy', 'culture']

/** 故事章节的互动类型（content/story.json 的 action） */
export type StoryActionKind = 'beat' | 'formation' | 'pour' | 'recipe' | 'cards' | 'none'

export const STORY_ACTION_KINDS: StoryActionKind[] = [
  'beat',
  'formation',
  'pour',
  'recipe',
  'cards',
  'none',
]

export function storyActionKind(action: unknown): StoryActionKind {
  if (typeof action === 'string' && (STORY_ACTION_KINDS as string[]).includes(action)) {
    return action as StoryActionKind
  }
  return 'none'
}

export function verifyLabel(verify: string | undefined): string {
  const key = (verify ?? '').trim()
  if (!key) return '待核验'
  return VERIFY_LABELS[key] ?? '待核验'
}

export function sourceVerifyLabel(verify: string | undefined): string {
  const key = (verify ?? '').trim()
  if (!key) return '待核验'
  return SOURCE_VERIFY_LABELS[key] ?? '待核验'
}

export function audioCategoryLabel(category: string | undefined): string {
  const key = (category ?? '').trim()
  if (!key) return '未分类'
  return AUDIO_CATEGORY_LABELS[key] ?? key
}

export function isVerified(verify: string | undefined): boolean {
  return (verify ?? '').trim() === 'verified'
}

/** 正文/步骤是否为"待补充可靠来源"占位，占位内容不得当作指导 */
export function isPlaceholderText(value: string | undefined): boolean {
  const text = (value ?? '').trim()
  if (text === '') return true
  if (text.toLowerCase() === 'pending-source') return true
  return text.includes('待补充可靠来源')
}

export type { ModuleConfig } from './modules'

/** 模块页兜底：内容里的 module 值不在已知别名里时，仍生成一个可用的模块配置 */
export function resolveModule(slug: string | undefined): {
  config: ModuleConfig
  entries: Entry[]
} {
  const found = moduleConfig(slug)
  const list = entriesOfModule(slug ?? '')
  if (found) return { config: found, entries: list }
  return {
    config: {
      id: slug ?? '',
      title: slug ? `模块：${slug}` : '未知模块',
      intro: '该模块的内容尚未登记，请到来源页查看资料状态。',
      aliases: [],
    },
    entries: list,
  }
}

/** 模块下所有来源（按条目引用聚合） */
export function sourcesOfModule(moduleId: string): Source[] {
  const ids = new Set<string>()
  for (const entry of entriesOfModule(moduleId)) {
    for (const id of entry.sourceIds ?? []) ids.add(id)
  }
  return sources.filter((s) => ids.has(s.id) || s.module === moduleId)
}
