import type { AudioItem, Entry, Recipe, StoryChapter } from '../types/content'
import type { ProgressData } from '../store/progress'
import type { JournalData } from '../store/journal'
import { moduleTitle } from '../lib/modules'

export interface JournalInput {
  progress: ProgressData
  journal: JournalData
  entries: Entry[]
  chapters: StoryChapter[]
  recipes: Recipe[]
  audio: AudioItem[]
}

export interface JournalReport {
  /** 纯文本版本，供复制 */
  text: string
  chapters: { title: string; state: '已体验' | '未体验' }[]
  modules: { id: string; entries: string[] }[]
  recipes: string[]
  audio: string[]
  collected: string[]
  notes: string
  isEmpty: boolean
}

/**
 * 手记只汇总真实状态：打开过就写"已浏览"，跳过就写"未体验"，
 * 食谱一律写"了解制作"，不写"亲手完成"。
 */
export function buildJournal(input: JournalInput): JournalReport {
  const { progress, journal, entries, chapters, recipes, audio } = input

  const chapterRows = chapters
    .filter(
      (c) =>
        progress.chaptersExperienced.includes(c.id) || progress.chaptersSkipped.includes(c.id),
    )
    .map((c) => ({
      title: c.title || c.id,
      state: progress.chaptersExperienced.includes(c.id)
        ? ('已体验' as const)
        : ('未体验' as const),
    }))

  const moduleMap = new Map<string, string[]>()
  for (const id of progress.entriesVisited) {
    const entry = entries.find((e) => e.id === id)
    if (!entry) continue
    const key = entry.module || '未分类'
    const list = moduleMap.get(key) ?? []
    list.push(entry.title || entry.id)
    moduleMap.set(key, list)
  }
  const modules = Array.from(moduleMap.entries()).map(([id, list]) => ({ id, entries: list }))

  const recipeRows = progress.recipesViewed
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is Recipe => Boolean(r))
    .map((r) => r.name || r.id)

  const audioRows = progress.audioPlayed
    .map((id) => audio.find((a) => a.id === id))
    .filter((a): a is AudioItem => Boolean(a))
    .map((a) => a.text || a.id)

  const collected = journal.collected.map((id) => {
    const entry = entries.find((e) => e.id === id)
    if (entry) return entry.title || entry.id
    const recipe = recipes.find((r) => r.id === id)
    if (recipe) return recipe.name || recipe.id
    const item = audio.find((a) => a.id === id)
    if (item) return item.text || item.id
    return id
  })

  const notes = journal.notes.trim()

  const lines: string[] = ['老爷保号 · 我的文化手记', '']

  lines.push('故事进度：')
  if (chapterRows.length === 0) {
    lines.push('- 还没有走过的章节')
  } else {
    for (const row of chapterRows) lines.push(`- ${row.title}：${row.state}`)
  }

  lines.push('', '文化馆浏览：')
  if (modules.length === 0) {
    lines.push('- 还没有打开过条目')
  } else {
    for (const mod of modules) {
      lines.push(`- ${moduleTitle(mod.id)}：${mod.entries.join('、')}`)
    }
  }

  lines.push('', '食谱：')
  if (recipeRows.length === 0) {
    lines.push('- 还没有查看过食谱步骤')
  } else {
    for (const name of recipeRows) lines.push(`- 了解制作《${name}》`)
  }

  lines.push('', '听潮：')
  if (audioRows.length === 0) {
    lines.push('- 还没有播放过词句')
  } else {
    for (const text of audioRows) lines.push(`- 听过「${text}」`)
  }

  lines.push('', '收藏：')
  if (collected.length === 0) {
    lines.push('- 暂无收藏')
  } else {
    for (const name of collected) lines.push(`- ${name}`)
  }

  if (notes) {
    lines.push('', '我记下的内容：', notes)
  }

  lines.push(
    '',
    '说明：本手记只记录你在本站的真实操作，不代表实地经历，也不代表已掌握某项技艺。',
    '内容来源与核验状态见「资料来源」页。',
  )

  const isEmpty =
    chapterRows.length === 0 &&
    modules.length === 0 &&
    recipeRows.length === 0 &&
    audioRows.length === 0 &&
    collected.length === 0 &&
    !notes

  return {
    text: lines.join('\n'),
    chapters: chapterRows,
    modules,
    recipes: recipeRows,
    audio: audioRows,
    collected,
    notes,
    isEmpty,
  }
}
