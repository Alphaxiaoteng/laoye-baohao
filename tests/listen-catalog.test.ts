import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import audioJson from '../content/audio.listen.json'
import sourcesJson from '../content/sources.listen.json'
import type { AudioItem, Source } from '../src/types/content'
import {
  AUDIO_PENDING_LABEL,
  LISTEN_CATEGORIES,
  LISTEN_MANUAL_ORDER,
  groupListenItems,
  isListenCategory,
  listenStats,
  orderListenItems,
} from '../src/features/listen/catalog'

const audio = audioJson as unknown as AudioItem[]
const sources = sourcesJson as unknown as Source[]

/** 测试用的最小条目工厂，只填排序需要的字段 */
function item(id: string, category = 'greeting'): AudioItem {
  return { id, category, text: id, file: '', sourceIds: [] }
}

describe('听潮分类与手工排序', () => {
  it('四个分类顺序固定为 打招呼 / 喝茶吃饭 / 日常礼貌 / 文化词语', () => {
    expect(LISTEN_CATEGORIES.map((c) => c.slug)).toEqual([
      'greeting',
      'tea-food',
      'courtesy',
      'culture',
    ])
    expect(LISTEN_CATEGORIES.map((c) => c.label)).toEqual([
      '打招呼',
      '喝茶吃饭',
      '日常礼貌',
      '文化词语',
    ])
  })

  it('分类 slug 校验只认登记过的四类', () => {
    expect(isListenCategory('greeting')).toBe(true)
    expect(isListenCategory('culture')).toBe(true)
    expect(isListenCategory('opera')).toBe(false)
    expect(isListenCategory(undefined)).toBe(false)
  })

  it('手工排序优先于内容文件顺序', () => {
    const reversed = [...audio].reverse()
    for (const category of LISTEN_CATEGORIES) {
      const ordered = orderListenItems(reversed, category.slug).map((entry) => entry.id)
      const manual = (LISTEN_MANUAL_ORDER[category.slug] ?? []).filter((id) =>
        audio.some((entry) => entry.id === id),
      )
      expect(ordered.slice(0, manual.length)).toEqual(manual)
    }
  })

  it('未登记手序的新词条排在末尾，不会被丢弃', () => {
    const items = [item('c'), item('a'), item('b')]
    const ordered = orderListenItems(items, 'greeting', { greeting: ['b'] }).map(
      (entry) => entry.id,
    )
    expect(ordered).toEqual(['b', 'c', 'a'])
  })

  it('分组保留空分类，便于页面显示待授权状态', () => {
    const groups = groupListenItems([item('only-greeting')])
    expect(groups.map((group) => group.category.slug)).toEqual(
      LISTEN_CATEGORIES.map((category) => category.slug),
    )
    expect(groups.find((group) => group.category.slug === 'tea-food')?.items).toEqual([])
  })

  it('统计可播放与待授权数量', () => {
    const stats = listenStats([
      { ...item('a'), file: '/media/listen/a.mp3' },
      { ...item('b'), file: '' },
    ])
    expect(stats).toEqual({ total: 2, playable: 1, pending: 1 })
    expect(AUDIO_PENDING_LABEL).toBe('音频待授权录制')
  })
})

describe('听潮真实内容（content/audio.listen.json）', () => {
  it('四个分类都有词条，且 id 不重复', () => {
    for (const category of LISTEN_CATEGORIES) {
      expect(orderListenItems(audio, category.slug).length).toBeGreaterThan(0)
    }
    const ids = audio.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每条词句都有中文、释义、口音、来源，分类合法', () => {
    for (const entry of audio) {
      expect(isListenCategory(entry.category), `${entry.id} 分类`).toBe(true)
      expect((entry.text ?? '').trim(), `${entry.id} 词句`).not.toBe('')
      expect((entry.meaning ?? '').trim(), `${entry.id} 释义`).not.toBe('')
      expect((entry.accent ?? '').trim(), `${entry.id} 口音`).not.toBe('')
      expect(entry.sourceIds?.length ?? 0, `${entry.id} 来源`).toBeGreaterThan(0)
    }
  })

  it('可播放条目必须登记录音者与许可，且文件在 public 下真实存在', () => {
    for (const entry of audio) {
      const file = (entry.file ?? '').trim()
      if (!file) continue
      expect(file.startsWith('/media/listen/'), `${entry.id} 路径`).toBe(true)
      expect(file.endsWith('.mp3'), `${entry.id} 使用浏览器兼容的 mp3`).toBe(true)
      expect((entry.license ?? '').trim(), `${entry.id} license`).not.toBe('')
      expect((entry.recorder ?? '').trim(), `${entry.id} recorder`).not.toBe('')
      const abs = join(process.cwd(), 'public', file)
      expect(existsSync(abs), `${entry.id} 文件缺失：${file}`).toBe(true)
      expect(statSync(abs).size).toBeGreaterThan(1024)
    }
  })

  it('不借用测试纯音冒充潮汕话', () => {
    for (const entry of audio) {
      expect(entry.file ?? '').not.toContain('test-tone')
    }
  })

  it('sourceIds 都能在 sources.listen.json 找到，且记录了 CC BY-SA 4.0 与作者', () => {
    const byId = new Map(sources.map((source) => [source.id, source]))
    for (const entry of audio) {
      for (const id of entry.sourceIds ?? []) {
        const source = byId.get(id)
        expect(source, `${entry.id} 引用了不存在的来源 ${id}`).toBeTruthy()
        expect(source?.url.startsWith('https://commons.wikimedia.org/wiki/File:')).toBe(true)
        expect(source?.verify).toBe('fetched')
        const note = source?.note ?? ''
        expect(note).toContain('CC BY-SA 4.0')
        expect(note).toContain('creativecommons.org/licenses/by-sa/4.0')
        expect(note).toContain(entry.recorder ?? '')
      }
    }
  })

  it('来源 ID 从 S500 起，不与原有 S9–S13 冲突', () => {
    const newIds = sources.filter((source) => /^S\d+$/.test(source.id) && Number(source.id.slice(1)) >= 500)
    expect(newIds.length).toBeGreaterThanOrEqual(8)
    for (const source of newIds) {
      expect(Number(source.id.slice(1))).toBeGreaterThanOrEqual(500)
    }
  })
})
