import { describe, expect, it } from 'vitest'
import { buildSystemPrompt, pendingTail, sanitizeAnswer, validateAskRequest } from '../server/ask'
import type { ContentBundle } from '../src/types/content'

const content: ContentBundle = {
  entries: [
    {
      id: 'tea-intro',
      module: 'tea',
      title: '茶条目',
      summary: '摘要',
      body: '正文内容',
      region: '示例地区',
      sourceIds: ['S2'],
      verify: 'draft-needs-local-review',
    },
    {
      id: 'yingge-intro',
      module: 'yingge',
      title: '英歌条目',
      summary: '摘要',
      body: '正文内容',
      region: '示例地区',
      sourceIds: ['S1'],
      verify: 'draft-needs-local-review',
    },
  ],
  story: [],
  recipes: [],
  audio: [],
  sources: [
    { id: 'S1', title: '英歌来源', org: '机构甲', url: 'https://example.org/1', verify: 'reference-only' },
    { id: 'S2', title: '茶来源', org: '机构乙', url: 'https://example.org/2', verify: 'fetched' },
  ],
  media: [],
}

describe('引用校验 sanitizeAnswer', () => {
  it('保留真实来源编号并生成 citations', () => {
    const result = sanitizeAnswer('工夫茶有明确的名录信息 [S2]。', content)
    expect(result.text).toContain('[S2]')
    expect(result.citations).toEqual([
      { id: 'S2', title: '茶来源', url: 'https://example.org/2' },
    ])
  })

  it('剔除不存在的来源编号', () => {
    const result = sanitizeAnswer('这条是编的 [S9]，这条是真的 [S2]。', content)
    expect(result.text).not.toContain('[S9]')
    expect(result.text).toContain('[S2]')
    expect(result.citations.map((c) => c.id)).toEqual(['S2'])
  })

  it('多来源编号只保留真实项并去重', () => {
    const result = sanitizeAnswer('先看 A [S1,S2]，再看 B [S2]。', content)
    expect(result.citations.map((c) => c.id)).toEqual(['S1', 'S2'])
    expect(result.text).toContain('[S1][S2]')
  })

  it('保留存在的站内导航，删除不存在的导航与标记本身', () => {
    const result = sanitizeAnswer('可以看看 [[nav:tea-intro]]，别去 [[nav:ghost]]。', content)
    expect(result.navs).toEqual([
      { entryId: 'tea-intro', title: '茶条目', path: '/museum/tea/tea-intro' },
    ])
    expect(result.text).not.toContain('[[nav:')
    expect(result.text).toContain('可以看看')
  })

  it('识别不确定回答', () => {
    const unknown = sanitizeAnswer('资料里没有今年巡游的具体时间，不确定。', content)
    expect(unknown.uncertain).toBe(true)
    const sure = sanitizeAnswer('该条目登记在名录里 [S2]。', content)
    expect(sure.uncertain).toBe(false)
  })

  it('不会输出编造的引用', () => {
    const result = sanitizeAnswer('英歌是国家级非遗 [S12]。', content)
    expect(result.citations).toEqual([])
    expect(result.text).toBe('英歌是国家级非遗。')
  })
})

describe('流式切割 pendingTail', () => {
  it('扣住未写完的引用标记', () => {
    expect(pendingTail('你好 [S')).toBe('[S')
    expect(pendingTail('你好 [[nav:tea')).toBe('[[nav:tea')
    expect(pendingTail('已经写完 [S2]')).toBe('')
    expect(pendingTail('普通文本')).toBe('')
  })
})

describe('请求校验', () => {
  it('拒绝空问题', () => {
    const result = validateAskRequest({ question: '   ' })
    expect(result.ok).toBe(false)
  })

  it('拒绝超过 300 字的问题', () => {
    const result = validateAskRequest({ question: 'a'.repeat(301) })
    expect(result.ok).toBe(false)
  })

  it('history 最多保留 12 条，context 只保留结构字段', () => {
    const history = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `第 ${i} 条`,
    }))
    const result = validateAskRequest({
      question: '这一步为什么这样做？',
      context: { module: 'tea', entryId: 'tea-intro', step: 2, visited: ['a', 3, 'b'], secret: 'x' },
      history,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.history).toHaveLength(12)
    expect(result.value.context.visited).toEqual(['a', 'b'])
    expect(result.value.context.step).toBe(2)
    expect(JSON.stringify(result.value.context)).not.toContain('secret')
  })
})

describe('提示词', () => {
  it('包含当前条目正文、来源表与防注入规则', () => {
    const prompt = buildSystemPrompt(
      { question: '这是什么？', context: { module: 'tea', entryId: 'tea-intro', visited: [] }, history: [] },
      content,
    )
    expect(prompt).toContain('正文内容')
    expect(prompt).toContain('[S2] 茶来源')
    expect(prompt).toContain('不可信数据')
    expect(prompt).toContain('[[nav:entryId]]')
    expect(prompt).not.toContain('MODELSCOPE_API_KEY=')
  })
})
