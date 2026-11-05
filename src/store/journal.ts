import { create } from 'zustand'
import { readJSON, writeJSON } from '../lib/storage'

const STORAGE_KEY = 'laoye.journal.v1'

export interface JournalData {
  /** 收藏的条目 / 食谱 / 词条 id */
  collected: string[]
  /** 用户主动写的文字，仅本机保存 */
  notes: string
}

export interface JournalState extends JournalData {
  toggleCollect: (id: string) => void
  isCollected: (id: string) => boolean
  setNotes: (text: string) => void
  reset: () => void
}

export const EMPTY_JOURNAL: JournalData = { collected: [], notes: '' }

function load(): JournalData {
  const stored = readJSON<Partial<JournalData>>(STORAGE_KEY, {})
  return {
    collected: Array.isArray(stored.collected) ? stored.collected.filter((v) => typeof v === 'string') : [],
    notes: typeof stored.notes === 'string' ? stored.notes : '',
  }
}

function save(data: JournalData): void {
  writeJSON(STORAGE_KEY, data)
}

export const useJournalStore = create<JournalState>((set, get) => ({
  ...load(),
  toggleCollect: (id) => {
    set((s) => {
      const exists = s.collected.includes(id)
      const collected = exists ? s.collected.filter((v) => v !== id) : [...s.collected, id]
      save({ collected, notes: s.notes })
      return { collected }
    })
  },
  isCollected: (id) => get().collected.includes(id),
  setNotes: (text) => {
    const limited = text.slice(0, 2000)
    set({ notes: limited })
    save({ collected: get().collected, notes: limited })
  },
  reset: () => {
    set({ ...EMPTY_JOURNAL })
    save(EMPTY_JOURNAL)
  },
}))
