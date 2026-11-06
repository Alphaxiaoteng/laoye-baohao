import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  CASES,
  CASE_READING_NOTES,
  INTRO_CARDS,
  INTRO_SENTENCE,
  PROCESSION_PARTS,
} from '../src/features/yinglaoye/data'

interface RawEntry {
  id: string
  module: string
  title: string
  summary?: string
  body?: string
  region?: string
  sourceIds?: string[]
  verify?: string
}

interface RawSource {
  id: string
  url?: string
  verify?: string
}

const root = process.cwd()
const entries = JSON.parse(
  readFileSync(resolve(root, 'content/entries.yinglaoye.json'), 'utf8'),
) as RawEntry[]
const sources = JSON.parse(
  readFileSync(resolve(root, 'content/sources.yinglaoye.json'), 'utf8'),
) as RawSource[]

const entryById = new Map(entries.map((entry) => [entry.id, entry]))
const sourceIds = new Set(sources.map((source) => source.id))

const featureDir = resolve(root, 'src/features/yinglaoye')

function listFeatureFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const full = resolve(dir, item.name)
    return item.isDirectory() ? listFeatureFiles(full) : [full]
  })
}

function featureCopy(): string {
  return listFeatureFiles(featureDir)
    .filter((name) => name.endsWith('.ts') || name.endsWith('.tsx'))
    .map((name) => readFileSync(name, 'utf8'))
    .join('\n')
}

describe('营老爷模块：首页知识卡', () => {
  it('每张卡都指向真实条目，并写明地区与年份', () => {
    expect(INTRO_CARDS.length).toBeGreaterThanOrEqual(3)
    for (const card of INTRO_CARDS) {
      const entry = entryById.get(card.entryId)
      expect(entry, `卡片引用了不存在的条目 ${card.entryId}`).toBeDefined()
      expect(entry?.module).toBe('yinglaoye')
      expect(card.regionLabel.trim()).not.toBe('')
      expect(card.years).toMatch(/\d{4}/)
    }
  })

  it('入门解释只描述来源范围，不写超自然或运势承诺', () => {
    expect(INTRO_SENTENCE).toContain('一些村镇')
    expect(INTRO_SENTENCE).not.toMatch(/保平安|运势|神谕|有求必应/)
  })
})

describe('营老爷模块：地区案例', () => {
  it('至少覆盖普宁、潮州与元巷村，且来源可解析', () => {
    const ids = CASES.map((item) => item.entryId)
    expect(ids).toContain('ylr-case-puning')
    expect(ids).toContain('ylr-case-chaozhou')
    expect(ids).toContain('ylr-case-yuanxiang')
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每条案例都有地区、原文年份、要点与存在的来源', () => {
    for (const item of CASES) {
      const entry = entryById.get(item.entryId)
      expect(entry, `案例引用了不存在的条目 ${item.entryId}`).toBeDefined()
      expect(item.region.trim()).not.toBe('')
      expect(item.time).toMatch(/(18|19|20)\d{2}/)
      expect(item.points.length).toBeGreaterThanOrEqual(3)
      expect(item.sourceIds.length).toBeGreaterThan(0)

      for (const id of item.sourceIds) {
        expect(sourceIds.has(id), `来源 ${id} 不在 sources.yinglaoye.json`).toBe(true)
      }
      for (const id of item.sourceIds) {
        expect(entry?.sourceIds).toContain(id)
      }
      expect(entry?.region?.trim()).not.toBe('')
      expect(entry?.body?.trim()).not.toBe('')
      // 条目仍待本地审核；这里防止把案例误标成已核验
      expect(entry?.verify).not.toBe('verified')
    }
  })

  it('案例时间不写成「今年」这类实时表述', () => {
    for (const item of CASES) {
      expect(item.time).not.toMatch(/今年|今年度|最新日程|即将举行/)
    }
  })

  it('对照提示逐条可读，不空泛', () => {
    expect(CASE_READING_NOTES.length).toBeGreaterThanOrEqual(3)
    for (const note of CASE_READING_NOTES) {
      expect(note.trim().length).toBeGreaterThan(10)
    }
  })
})

describe('营老爷模块：队伍示意', () => {
  it('标旗、仪仗、神轿、鼓乐都在，且至少两项标注「有的地方才有」', () => {
    const labels = PROCESSION_PARTS.map((part) => part.label)
    for (const expected of ['标旗', '仪仗', '神轿', '鼓乐']) {
      expect(labels).toContain(expected)
    }
    expect(PROCESSION_PARTS.filter((part) => part.optional).length).toBeGreaterThanOrEqual(2)
  })

  it('每个部分都引用真实条目，条目挂了来源', () => {
    for (const part of PROCESSION_PARTS) {
      expect(part.entries.length).toBeGreaterThan(0)
      expect(part.blurb.trim().length).toBeGreaterThan(10)
      for (const id of part.entries) {
        const entry = entryById.get(id)
        expect(entry, `${part.label} 引用了不存在的条目 ${id}`).toBeDefined()
        expect((entry?.sourceIds ?? []).length).toBeGreaterThan(0)
      }
    }
  })

  it('英歌部分明确写成「有时」，避免当成各地通例', () => {
    const yingge = PROCESSION_PARTS.find((part) => part.id === 'yingge')
    expect(yingge).toBeDefined()
    expect(yingge?.optional).toBe(true)
    expect(yingge?.blurb).toContain('有时')
  })
})

describe('营老爷模块：文案红线', () => {
  it('模块代码里不出现运势、神谕或 AI 人设名', () => {
    const copy = featureCopy()
    for (const banned of ['保平安', '运势', '神谕', '阿潮', '有求必应']) {
      expect(copy.includes(banned), `模块文案出现禁用词：${banned}`).toBe(false)
    }
  })

  it('新增条目都保留来源与待审核状态', () => {
    for (const id of ['ylr-case-puning', 'ylr-case-yuanxiang', 'ylr-case-shantou']) {
      const entry = entryById.get(id)
      expect(entry, `缺少新增条目 ${id}`).toBeDefined()
      expect((entry?.sourceIds ?? []).length).toBeGreaterThan(0)
      expect(entry?.verify).toBe('draft-needs-local-review')
    }
  })
})
