import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
  AudioItem,
  ContentBundle,
  Entry,
  MediaItem,
  Recipe,
  Source,
  StoryChapter,
} from '../src/types/content'

export interface ValidationResult {
  errors: string[]
  warnings: string[]
  counts: Record<string, number>
}

const KNOWN_MODULES = ['yingge', 'tea', 'food', 'yinglaoye']
const ENTRY_VERIFY = ['verified', 'pending-source', 'draft-needs-local-review']
const SOURCE_VERIFY = ['fetched', 'fetch-failed', 'index-only', 'reference-only', 'verified']
const AUDIO_CATEGORIES = ['greeting', 'tea-food', 'courtesy', 'culture']
const STORY_ACTIONS = ['beat', 'formation', 'pour', 'recipe', 'cards', 'none']

function isNonEmpty(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== ''
}

function ids(items: { id?: string }[]): string[] {
  return (items ?? []).map((item) => (typeof item?.id === 'string' ? item.id : ''))
}

function duplicateIds(items: { id?: string }[], label: string, errors: string[]): void {
  const seen = new Set<string>()
  for (const id of ids(items)) {
    if (!id) continue
    if (seen.has(id)) errors.push(`${label}: 重复 id「${id}」`)
    seen.add(id)
  }
}

/**
 * 内容门禁（纯函数，便于测试）。
 * 硬错误 = exit 1；警告只打印，不阻断。
 */
export function validateContent(bundle: ContentBundle): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const entries = (Array.isArray(bundle.entries) ? bundle.entries : []) as Entry[]
  const story = (Array.isArray(bundle.story) ? bundle.story : []) as StoryChapter[]
  const recipes = (Array.isArray(bundle.recipes) ? bundle.recipes : []) as Recipe[]
  const audio = (Array.isArray(bundle.audio) ? bundle.audio : []) as AudioItem[]
  const sources = (Array.isArray(bundle.sources) ? bundle.sources : []) as Source[]
  const media = (Array.isArray(bundle.media) ? bundle.media : []) as MediaItem[]

  const sourceIds = new Set(ids(sources).filter(Boolean))
  const entryIds = new Set(ids(entries).filter(Boolean))

  // ---- 来源 ----
  duplicateIds(sources, 'sources.json', errors)
  for (const source of sources) {
    const label = `source ${source?.id || '(无 id)'}`
    if (!isNonEmpty(source?.id)) errors.push('sources.json: 缺少 id')
    if (!isNonEmpty(source?.title)) errors.push(`${label}: 缺少 title`)
    if (!isNonEmpty(source?.url)) {
      errors.push(`${label}: 缺少 url`)
    } else if (!/^https?:\/\//i.test(source.url)) {
      errors.push(`${label}: url 必须是 http(s) 链接（当前：${source.url}）`)
    }
    if (!/^S\d+$/.test(source?.id ?? '')) warnings.push(`${label}: id 建议使用 "S数字" 形式`)
    if (source?.verify && !SOURCE_VERIFY.includes(source.verify)) {
      warnings.push(`${label}: 未识别的 verify 值「${source.verify}」`)
    }
  }

  // ---- 条目 ----
  duplicateIds(entries, 'entries.json', errors)
  for (const entry of entries) {
    const label = `entry ${entry?.id || '(无 id)'}`
    if (!isNonEmpty(entry?.id)) errors.push('entries.json: 缺少 id')
    if (!isNonEmpty(entry?.title)) errors.push(`${label}: 缺少 title`)
    if (!isNonEmpty(entry?.module)) {
      errors.push(`${label}: 缺少 module`)
    } else if (!KNOWN_MODULES.includes(entry.module)) {
      warnings.push(`${label}: module「${entry.module}」不在首版四模块里`)
    }

    const refs = Array.isArray(entry?.sourceIds) ? entry.sourceIds : []
    for (const ref of refs) {
      if (!sourceIds.has(ref)) errors.push(`${label}: sourceIds 引用了不存在的来源「${ref}」`)
    }

    if (entry?.verify === 'verified' && refs.length === 0) {
      errors.push(`${label}: verify=verified 必须至少挂 1 条来源`)
    }
    if (entry?.verify && !ENTRY_VERIFY.includes(entry.verify)) {
      warnings.push(`${label}: 未识别的 verify 值「${entry.verify}」`)
    }
    if (entry?.verify === 'verified' && !isNonEmpty(entry?.body)) {
      errors.push(`${label}: verify=verified 但正文为空`)
    }
    if (entry?.verify === 'pending-source' && isNonEmpty(entry?.body)) {
      warnings.push(`${label}: 标注待补充来源但已有正文，请确认正文没有编造`)
    }
    if (entry?.verify !== 'pending-source' && !isNonEmpty(entry?.body)) {
      warnings.push(`${label}: 正文为空，页面会显示「内容待补充可靠来源」`)
    }
  }

  // ---- 故事 ----
  duplicateIds(story, 'story.json', errors)
  for (const chapter of story) {
    const label = `story ${chapter?.id || '(无 id)'}`
    if (!isNonEmpty(chapter?.id)) errors.push('story.json: 缺少 id')
    if (!isNonEmpty(chapter?.title)) errors.push(`${label}: 缺少 title`)
    if (chapter && chapter.fiction !== true) {
      warnings.push(`${label}: 故事章节应标记 fiction: true`)
    }
    if (chapter?.action !== undefined && !STORY_ACTIONS.includes(String(chapter.action))) {
      warnings.push(`${label}: 未识别的 action「${String(chapter.action)}」`)
    }
    for (const ref of chapter?.entryIds ?? []) {
      if (!entryIds.has(ref)) warnings.push(`${label}: entryIds 引用了不存在的条目「${ref}」`)
    }
  }

  // ---- 食谱 ----
  duplicateIds(recipes, 'recipes.json', errors)
  for (const recipe of recipes) {
    const label = `recipe ${recipe?.id || '(无 id)'}`
    if (!isNonEmpty(recipe?.id)) errors.push('recipes.json: 缺少 id')
    if (!isNonEmpty(recipe?.name)) errors.push(`${label}: 缺少 name`)
    const refs = Array.isArray(recipe?.sourceIds) ? recipe.sourceIds : []
    for (const ref of refs) {
      if (!sourceIds.has(ref)) errors.push(`${label}: sourceIds 引用了不存在的来源「${ref}」`)
    }
    if (recipe?.verify === 'verified' && refs.length === 0) {
      errors.push(`${label}: verify=verified 必须至少挂 1 条来源`)
    }
    if (!Array.isArray(recipe?.steps) || recipe.steps.length === 0) {
      warnings.push(`${label}: 没有可展示的步骤`)
    }
  }

  // ---- 听潮 ----
  duplicateIds(audio, 'audio.json', errors)
  for (const item of audio) {
    const label = `audio ${item?.id || '(无 id)'}`
    if (!isNonEmpty(item?.id)) errors.push('audio.json: 缺少 id')
    if (!isNonEmpty(item?.text)) warnings.push(`${label}: 词句文本为空，页面只显示占位`)
    if (item?.category && !AUDIO_CATEGORIES.includes(item.category)) {
      warnings.push(`${label}: 未识别的 category「${item.category}」`)
    }
    const refs = Array.isArray(item?.sourceIds) ? item.sourceIds : []
    for (const ref of refs) {
      if (!sourceIds.has(ref)) errors.push(`${label}: sourceIds 引用了不存在的来源「${ref}」`)
    }
    const hasFile = isNonEmpty(item?.file)
    if (hasFile && !isNonEmpty(item?.license)) {
      errors.push(`${label}: 有音频文件但没有登记 license`)
    }
    if (hasFile && !isNonEmpty(item?.recorder)) {
      warnings.push(`${label}: 有音频文件但没有登记 recorder`)
    }
    if (!hasFile) {
      warnings.push(`${label}: 没有音频文件，播放按钮会禁用（音频待授权录制）`)
    }
  }

  // ---- 媒体 ----
  duplicateIds(media, 'media.json', errors)
  for (const item of media) {
    const label = `media ${item?.id || '(无 id)'}`
    if (!isNonEmpty(item?.id)) errors.push('media.json: 缺少 id')
    if (isNonEmpty(item?.file) && !isNonEmpty(item?.license)) {
      warnings.push(`${label}: 有媒体文件但没有登记 license`)
    }
  }

  return {
    errors,
    warnings,
    counts: {
      entries: entries.length,
      story: story.length,
      recipes: recipes.length,
      audio: audio.length,
      sources: sources.length,
      media: media.length,
    },
  }
}

const FILES: { key: keyof ContentBundle; file: string }[] = [
  { key: 'entries', file: 'entries.json' },
  { key: 'story', file: 'story.json' },
  { key: 'recipes', file: 'recipes.json' },
  { key: 'audio', file: 'audio.json' },
  { key: 'sources', file: 'sources.json' },
  { key: 'media', file: 'media.json' },
]

async function readCollection(dir: string, file: string, key: string): Promise<unknown[]> {
  const raw = await readFile(resolve(dir, file), 'utf8')
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    throw new Error(`${file} 不是合法 JSON：${err instanceof Error ? err.message : String(err)}`)
  }
  if (Array.isArray(parsed)) return parsed
  if (parsed && typeof parsed === 'object') {
    const bag = parsed as Record<string, unknown>
    for (const candidate of [key, 'items', 'list', 'data']) {
      if (Array.isArray(bag[candidate])) return bag[candidate] as unknown[]
    }
  }
  throw new Error(`${file} 顶层必须是数组`)
}

export async function loadAndValidate(dir = resolve(process.cwd(), 'content')): Promise<{
  result: ValidationResult
  missing: string[]
}> {
  const bundle = {
    entries: [],
    story: [],
    recipes: [],
    audio: [],
    sources: [],
    media: [],
  } as unknown as ContentBundle
  const missing: string[] = []

  for (const { key, file } of FILES) {
    try {
      const list = await readCollection(dir, file, key)
      ;(bundle as unknown as Record<string, unknown[]>)[key] = list
    } catch (err) {
      missing.push(
        `${file}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }

  return { result: validateContent(bundle), missing }
}

async function main(): Promise<void> {
  const dir = resolve(process.cwd(), 'content')
  console.log(`[validate] 读取内容目录：${dir}`)

  const { result, missing } = await loadAndValidate(dir)

  if (missing.length > 0) {
    console.error('[validate] 内容文件缺失或无法解析：')
    for (const item of missing) console.error(`  - ${item}`)
    console.error('[validate] 请先在 content/ 下准备 entries/story/recipes/audio/sources/media 六个 JSON。')
    process.exit(1)
  }

  console.log(
    `[validate] 条目 ${result.counts.entries} · 故事 ${result.counts.story} · 食谱 ${result.counts.recipes} · 听潮 ${result.counts.audio} · 来源 ${result.counts.sources} · 媒体 ${result.counts.media}`,
  )

  if (result.warnings.length > 0) {
    console.log(`[validate] 警告 ${result.warnings.length} 条：`)
    for (const item of result.warnings) console.log(`  ! ${item}`)
  }

  if (result.errors.length > 0) {
    console.error(`[validate] 失败：${result.errors.length} 个错误`)
    for (const item of result.errors) console.error(`  x ${item}`)
    process.exit(1)
  }

  console.log('[validate] 通过：未发现阻断性内容问题')
  process.exit(0)
}

const invokedDirectly =
  typeof process.argv[1] === 'string' &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (invokedDirectly) {
  main().catch((err) => {
    console.error('[validate] 运行失败：', err)
    process.exit(1)
  })
}
