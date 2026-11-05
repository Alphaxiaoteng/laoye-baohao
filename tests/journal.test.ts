import { describe, expect, it } from 'vitest'
import { buildJournal } from '../src/lib/journal'
import type { ProgressData } from '../src/store/progress'
import type { JournalData } from '../src/store/journal'
import type { AudioItem, Entry, Recipe, StoryChapter } from '../src/types/content'

const entries: Entry[] = [
  { id: 'tea-intro', module: 'tea', title: '茶条目', sourceIds: [], verify: 'draft-needs-local-review' },
  { id: 'yingge-intro', module: 'yingge', title: '英歌条目', sourceIds: [], verify: 'draft-needs-local-review' },
]

const chapters: StoryChapter[] = [
  { id: 'prologue', order: 1, title: '序章', fiction: true },
  { id: 'yingge', order: 2, title: '第一章', fiction: true },
]

const recipes: Recipe[] = [{ id: 'r1', name: '示例食谱', verify: 'pending-source' }]
const audio: AudioItem[] = [{ id: 'a1', category: 'greeting', text: '示例词句', file: '' }]

function progress(overrides: Partial<ProgressData> = {}): ProgressData {
  return {
    entriesVisited: [],
    modulesVisited: [],
    chaptersExperienced: [],
    chaptersSkipped: [],
    interactions: [],
    recipesViewed: [],
    audioPlayed: [],
    ...overrides,
  }
}

const journal: JournalData = { collected: [], notes: '' }

describe('手记只记录真实体验', () => {
  it('跳过的章节记成未体验，走过的章节记成已体验', () => {
    const report = buildJournal({
      progress: progress({ chaptersExperienced: ['prologue'], chaptersSkipped: ['yingge'] }),
      journal,
      entries,
      chapters,
      recipes,
      audio,
    })
    expect(report.chapters).toEqual([
      { title: '序章', state: '已体验' },
      { title: '第一章', state: '未体验' },
    ])
    expect(report.text).toContain('序章：已体验')
    expect(report.text).toContain('第一章：未体验')
  })

  it('只浏览食谱步骤时写"了解制作"，不写"亲手完成"', () => {
    const report = buildJournal({
      progress: progress({ recipesViewed: ['r1'] }),
      journal,
      entries,
      chapters,
      recipes,
      audio,
    })
    expect(report.text).toContain('了解制作《示例食谱》')
    expect(report.text).not.toContain('亲手')
    expect(report.text).not.toContain('实地到访')
  })

  it('没打开过的条目不会出现在浏览记录里', () => {
    const report = buildJournal({
      progress: progress({ entriesVisited: ['tea-intro'] }),
      journal,
      entries,
      chapters,
      recipes,
      audio,
    })
    expect(report.modules).toEqual([{ id: 'tea', entries: ['茶条目'] }])
    expect(report.text).not.toContain('英歌条目')
  })

  it('听潮记录只写"听过"，不写成已学会', () => {
    const report = buildJournal({
      progress: progress({ audioPlayed: ['a1'] }),
      journal,
      entries,
      chapters,
      recipes,
      audio,
    })
    expect(report.text).toContain('听过「示例词句」')
    expect(report.text).not.toContain('会说')
    expect(report.text).not.toContain('学会')
  })

  it('收藏与用户输入会如实汇总', () => {
    const report = buildJournal({
      progress: progress({ chaptersExperienced: ['prologue'] }),
      journal: { collected: ['tea-intro'], notes: '记住了温杯这一步' },
      entries,
      chapters,
      recipes,
      audio,
    })
    expect(report.collected).toEqual(['茶条目'])
    expect(report.text).toContain('记住了温杯这一步')
  })

  it('空状态时 isEmpty 为 true，且仍带免责说明', () => {
    const report = buildJournal({ progress: progress(), journal, entries, chapters, recipes, audio })
    expect(report.isEmpty).toBe(true)
    expect(report.text).toContain('还没有走过的章节')
    expect(report.text).toContain('不代表实地经历')
  })
})
