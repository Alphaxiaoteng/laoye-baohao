import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * 英歌模块的内容门禁：只检查模块自己的文件，
 * 重点是「不引用不存在的来源」「不出现原站标识」「媒体体积可控」。
 */
const root = resolve(__dirname, '..')
const contentDir = resolve(root, 'content')
const mediaDir = resolve(root, 'public/media/yingge')

interface AnyEntry {
  id: string
  module: string
  title: string
  body?: string
  summary?: string
  sourceIds?: string[]
  verify?: string
}

interface AnySource {
  id: string
  url: string
  verify?: string
}

function readJSON<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(contentDir, file), 'utf8')) as T
}

function allSourceIds(): Set<string> {
  const files = readdirSync(contentDir).filter((f) => /^sources(\.[\w-]+)?\.json$/.test(f))
  const ids = new Set<string>()
  for (const file of files) {
    for (const source of readJSON<AnySource[]>(file)) ids.add(source.id)
  }
  return ids
}

const yinggeSources = readJSON<AnySource[]>('sources.yingge.json')
const yinggeEntries = readJSON<AnyEntry[]>('entries.yingge.json')

describe('英歌来源', () => {
  it('来源 id 唯一且只用 S 编号', () => {
    const ids = yinggeSources.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^S\d+$/)
  })

  it('新来源从 S100 起，且不再保留原交互参考站 S1', () => {
    expect(yinggeSources.some((s) => s.id === 'S1')).toBe(false)
    const numeric = yinggeSources
      .map((s) => Number(s.id.slice(1)))
      .filter((n) => Number.isFinite(n))
    expect(Math.min(...numeric)).toBeGreaterThanOrEqual(100)
  })

  it('每条来源都是有访问日期的 http(s) 链接', () => {
    for (const source of yinggeSources) {
      expect(source.url).toMatch(/^https?:\/\//)
      const raw = readFileSync(resolve(contentDir, 'sources.yingge.json'), 'utf8')
      expect(raw).toContain('accessDate')
    }
  })
})

describe('英歌条目', () => {
  it('保留原有条目 id', () => {
    const ids = yinggeEntries.map((e) => e.id)
    for (const id of ['yingge-intro', 'yingge-watch', 'yingge-in-yinglaoye', 'yingge-role', 'yingge-formation']) {
      expect(ids).toContain(id)
    }
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('sourceIds 都指向真实存在的来源', () => {
    const known = allSourceIds()
    for (const entry of yinggeEntries) {
      for (const id of entry.sourceIds ?? []) expect(known.has(id)).toBe(true)
    }
  })

  it('verified 条目必须有正文与至少一条来源', () => {
    for (const entry of yinggeEntries) {
      if (entry.verify !== 'verified') continue
      expect((entry.body ?? '').trim().length).toBeGreaterThan(20)
      expect((entry.sourceIds ?? []).length).toBeGreaterThan(0)
    }
  })

  it('不再出现原站域名、站名与角色形象名', () => {
    const raw = readFileSync(resolve(contentDir, 'entries.yingge.json'), 'utf8')
    for (const banned of ['wenjian', '英歌舞数字博物馆', '英歌小槌', '小槌', 'S1\u0022']) {
      expect(raw.includes(banned)).toBe(false)
    }
  })
})

describe('英歌媒体', () => {
  const files = readdirSync(mediaDir, { recursive: true } as { recursive: true })
    .map((f) => String(f))
    .filter((f) => !f.startsWith('.') && statSync(resolve(mediaDir, f)).isFile())

  it('媒体目录里每个文件都非空', () => {
    expect(files.length).toBeGreaterThan(9)
    for (const file of files) {
      const full = resolve(mediaDir, file)
      expect(statSync(full).size).toBeGreaterThan(1024)
    }
  })

  it('视频在 5–25 MB 之间，并带封面', () => {
    const video = resolve(mediaDir, 'watch/yingge-square-720p.mp4')
    const size = statSync(video).size
    expect(size).toBeGreaterThan(5 * 1024 * 1024)
    expect(size).toBeLessThan(25 * 1024 * 1024)
    expect(statSync(resolve(mediaDir, 'watch/yingge-square-poster.webp')).size).toBeGreaterThan(0)
  })
})
