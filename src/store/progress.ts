import { create } from 'zustand'
import { readJSON, writeJSON } from '../lib/storage'

const STORAGE_KEY = 'laoye.progress.v1'

export interface ProgressData {
  /** 真实打开过的条目 */
  entriesVisited: string[]
  /** 真实进入过的模块 */
  modulesVisited: string[]
  /** 完整走完（点过"继续/完成"）的章节 */
  chaptersExperienced: string[]
  /** 明确跳过（点过"跳过"）的章节 */
  chaptersSkipped: string[]
  /** 完成过的轻互动，键形如 yingge:beat / tea:pour */
  interactions: string[]
  /** 打开过食谱步骤页的菜谱 */
  recipesViewed: string[]
  /** 成功播放过的听潮词条 */
  audioPlayed: string[]
}

export interface ProgressState extends ProgressData {
  visitEntry: (id: string, moduleId?: string) => void
  visitModule: (id: string) => void
  markChapter: (id: string, status: 'experienced' | 'skipped') => void
  markInteraction: (key: string) => void
  markRecipe: (id: string) => void
  markAudio: (id: string) => void
  reset: () => void
}

export const EMPTY_PROGRESS: ProgressData = {
  entriesVisited: [],
  modulesVisited: [],
  chaptersExperienced: [],
  chaptersSkipped: [],
  interactions: [],
  recipesViewed: [],
  audioPlayed: [],
}

function add(list: string[] | undefined, value: string): string[] {
  const base = Array.isArray(list) ? list : []
  if (!value || base.includes(value)) return base
  return [...base, value]
}

function load(): ProgressData {
  const stored = readJSON<Partial<ProgressData>>(STORAGE_KEY, {})
  return {
    entriesVisited: Array.isArray(stored.entriesVisited) ? stored.entriesVisited : [],
    modulesVisited: Array.isArray(stored.modulesVisited) ? stored.modulesVisited : [],
    chaptersExperienced: Array.isArray(stored.chaptersExperienced) ? stored.chaptersExperienced : [],
    chaptersSkipped: Array.isArray(stored.chaptersSkipped) ? stored.chaptersSkipped : [],
    interactions: Array.isArray(stored.interactions) ? stored.interactions : [],
    recipesViewed: Array.isArray(stored.recipesViewed) ? stored.recipesViewed : [],
    audioPlayed: Array.isArray(stored.audioPlayed) ? stored.audioPlayed : [],
  }
}

function save(state: ProgressState): void {
  const data: ProgressData = {
    entriesVisited: state.entriesVisited,
    modulesVisited: state.modulesVisited,
    chaptersExperienced: state.chaptersExperienced,
    chaptersSkipped: state.chaptersSkipped,
    interactions: state.interactions,
    recipesViewed: state.recipesViewed,
    audioPlayed: state.audioPlayed,
  }
  writeJSON(STORAGE_KEY, data)
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...load(),
  visitEntry: (id, moduleId) => {
    set((s) => ({
      entriesVisited: add(s.entriesVisited, id),
      modulesVisited: moduleId ? add(s.modulesVisited, moduleId) : s.modulesVisited,
    }))
    save(get())
  },
  visitModule: (id) => {
    set((s) => ({ modulesVisited: add(s.modulesVisited, id) }))
    save(get())
  },
  markChapter: (id, status) => {
    set((s) => {
      if (status === 'experienced') {
        return {
          chaptersExperienced: add(s.chaptersExperienced, id),
          chaptersSkipped: s.chaptersSkipped.filter((c) => c !== id),
        }
      }
      return {
        chaptersSkipped: add(s.chaptersSkipped, id),
        chaptersExperienced: s.chaptersExperienced.filter((c) => c !== id),
      }
    })
    save(get())
  },
  markInteraction: (key) => {
    set((s) => ({ interactions: add(s.interactions, key) }))
    save(get())
  },
  markRecipe: (id) => {
    set((s) => ({ recipesViewed: add(s.recipesViewed, id) }))
    save(get())
  },
  markAudio: (id) => {
    set((s) => ({ audioPlayed: add(s.audioPlayed, id) }))
    save(get())
  },
  reset: () => {
    set({ ...EMPTY_PROGRESS })
    save(get())
  },
}))

export function chapterStatus(id: string): 'experienced' | 'skipped' | 'none' {
  const s = useProgressStore.getState()
  if (s.chaptersExperienced.includes(id)) return 'experienced'
  if (s.chaptersSkipped.includes(id)) return 'skipped'
  return 'none'
}
