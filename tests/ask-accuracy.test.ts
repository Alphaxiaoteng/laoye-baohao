import { describe, expect, it } from 'vitest'
import {
  buildSystemPrompt,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  redactSecrets,
  sanitizeAnswer,
  verifyLabel,
  type AskRequest,
} from '../server/ask'
import { createRetriever, expandQuery } from '../server/ask-index'
import type { ContentBundle } from '../src/types/content'

/**
 * 这组用例只针对本轮新增的检索与校验行为：
 * 俗称展开、跨模块覆盖、相关度下限、核验状态转写、全角引用与脱敏。
 */
const content: ContentBundle = {
  entries: [
    {
      id: 'yingge-roles',
      module: 'yingge',
      title: '英歌槌与脸谱',
      summary: '槌与脸谱因队伍而异。',
      body: '英歌槌是一对短木槌，脸谱因队伍而异。',
      region: '潮阳',
      sourceIds: ['S1'],
      verify: 'verified',
    },
    {
      id: 'ylr-name',
      module: 'yinglaoye',
      title: '老爷与营',
      summary: '两个词在潮州话里的用法。',
      body: '潮州话里“营老爷”指村里的巡境活动，营是环绕、周游。',
      region: '潮州',
      sourceIds: ['S4'],
      verify: 'draft-needs-local-review',
    },
    {
      id: 'beef',
      module: 'food',
      title: '手打牛肉丸',
      summary: '把牛肉打成浆再挤成丸。',
      body: '把牛肉打成浆再挤成丸。',
      region: '汕头',
      sourceIds: ['S7'],
      verify: 'verified',
    },
    {
      id: 'noise',
      module: 'tea',
      title: '无关条目',
      summary: '只出现一个牛字。',
      body: '这里只出现一个牛字。',
      region: '',
      sourceIds: ['S2'],
      verify: 'pending-source',
    },
  ],
  story: [],
  recipes: [],
  audio: [],
  sources: [
    { id: 'S1', title: '英歌来源', org: '机构甲', url: 'https://example.org/1', verify: 'fetched' },
    { id: 'S2', title: '茶来源', org: '机构乙', url: '', verify: 'fetched' },
    { id: 'S4', title: '营老爷来源', org: '机构丁', url: 'https://example.org/4', verify: 'reference-only' },
    { id: 'S7', title: '美食来源', org: '机构庚', url: 'https://example.org/7', verify: 'fetched' },
  ],
  media: [],
}

function req(partial: Partial<AskRequest>): AskRequest {
  return { question: '这个条目讲了什么？', context: {}, history: [], ...partial }
}

describe('检索召回增强', () => {
  it('俗称会展开成内容里的正式词', () => {
    const expanded = expandQuery('迎神活动一般在什么时候')
    expect(expanded).toContain('营老爷')
    expect(expanded).toContain('巡境')
    expect(expandQuery('英歌槌怎么握')).toBe('英歌槌怎么握')
  })

  it('「迎神」能召回只写了「营老爷」的条目', () => {
    const plan = createRetriever(content).retrieve(req({ question: '迎神活动是什么？' }))
    expect(plan.docs.some((item) => item.doc.refId === 'ylr-name')).toBe(true)
  })

  it('跨模块问题会补齐被点名但没被分词命中的模块', () => {
    const plan = createRetriever(content).retrieve(
      req({
        question: '英歌和美食有什么关系？',
        context: { module: 'yingge', entryId: 'yingge-roles' },
      }),
    )
    expect(plan.intent).toBe('cross')
    expect(plan.docs.some((item) => item.doc.refId === 'beef' && item.mode === 'full')).toBe(true)
  })

  it('只靠单字命中的噪声文档会被相关度下限挡掉', () => {
    const plan = createRetriever(content).retrieve(req({ question: '牛肉丸怎么做？' }))
    const refs = plan.docs.map((item) => item.doc.refId)
    expect(refs).toContain('beef')
    expect(refs).not.toContain('noise')
  })
})

describe('提示词与核验状态', () => {
  it('核验枚举会转成中文，并写进提示词', () => {
    expect(verifyLabel('draft-needs-local-review')).toBe('待本地核验')
    expect(verifyLabel('pending-source')).toBe('待补可靠来源')
    expect(verifyLabel('verified')).toBe('已核验')

    const prompt = buildSystemPrompt(
      req({ question: '这个条目能采信吗？', context: { module: 'yinglaoye', entryId: 'ylr-name' } }),
      content,
    )
    expect(prompt).toContain('核验状态：待本地核验')
    expect(prompt).not.toContain('核验状态：draft-needs-local-review')
  })

  it('提示词约束覆盖纯文本、来源一致与不编造网址', () => {
    const prompt = buildSystemPrompt(
      req({ question: '这个条目讲了什么？', context: { module: 'yingge', entryId: 'yingge-roles' } }),
      content,
    )
    expect(prompt).toContain('Markdown')
    expect(prompt).toContain('必须与所依据资料「来源」行一致')
    expect(prompt).toContain('电话号码、票价、门牌地址或年份')
    expect(prompt).toContain('核验：待本地核验')
  })
})

describe('引用与导航校验补强', () => {
  it('全角括号里的真实来源会被归一化并保留', () => {
    const result = sanitizeAnswer('名录信息【S4】。', content)
    expect(result.text).toContain('[S4]')
    expect(result.citations.map((c) => c.id)).toEqual(['S4'])
  })

  it('全角冒号与全角方括号的导航仍走白名单', () => {
    const result = sanitizeAnswer('可以看［［nav：ylr-name］］。', content)
    expect(result.navs).toEqual([
      { entryId: 'ylr-name', title: '老爷与营', path: '/museum/yinglaoye/ylr-name' },
    ])
    expect(result.text).not.toContain('nav')
  })

  it('没闭合的导航标记不会留在正文里', () => {
    const result = sanitizeAnswer('可以看 [[nav:ylr-name', content)
    expect(result.text).not.toContain('[[nav')
    expect(result.navs).toEqual([])
  })

  it('资料未提及也会被识别为不确定', () => {
    expect(sanitizeAnswer('资料未提及今年的安排。', content).uncertain).toBe(true)
    expect(sanitizeAnswer('这一条标注为待核验。', content).uncertain).toBe(true)
  })
})

describe('密钥与上游配置', () => {
  it('默认使用 14 号供应商的模型与地址', () => {
    expect(DEFAULT_BASE_URL).toBe('https://api.openai-next.com/v1')
    expect(DEFAULT_MODEL).toBe('deepseek-v4-1-flash-261017')
  })

  it('错误信息里的 Bearer / sk- 凭据会被脱敏', () => {
    const redacted = redactSecrets(
      'upstream failed, authorization: Bearer sk-live-abcdef123456 and api_key=plain-secret',
    )
    expect(redacted).not.toContain('sk-live-abcdef123456')
    expect(redacted).not.toContain('plain-secret')
    expect(redacted).toContain('***')
  })
})
