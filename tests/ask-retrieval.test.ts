import { describe, expect, it } from 'vitest'
import {
  buildSystemPrompt,
  prepareAsk,
  sanitizeAnswer,
  validateAskRequest,
  type AskRequest,
} from '../server/ask'
import { createRetriever, tokenizeText } from '../server/ask-index'
import type { ContentBundle } from '../src/types/content'

const content: ContentBundle = {
  entries: [
    {
      id: 'tea-intro',
      module: 'tea',
      title: '潮州工夫茶艺名录',
      summary: '名录信息与申报地区。',
      body: '茶条目的正文：2008 年列入第二批国家级非遗名录。',
      region: '潮州市',
      sourceIds: ['S2'],
      verify: 'draft-needs-local-review',
    },
    {
      id: 'tea-steps',
      module: 'tea',
      title: '冲泡环节',
      summary: '从净手到闻香的二十余个环节。',
      body: '茶步骤正文：茶具讲示、净手、生火煮水、热罐温盅、纳茶洗茶、高冲、刮沫、分茶。',
      region: '潮州市',
      sourceIds: ['S2'],
      verify: 'draft-needs-local-review',
    },
    {
      id: 'tea-ware',
      module: 'tea',
      title: '茶具',
      summary: '泥炉、砂铫、榄炭、茶罐、茶盅、壶与杯。',
      body: '茶具正文：页面只列器物名称，没有尺寸与容量规格。',
      region: '潮州市',
      sourceIds: ['S2'],
      verify: 'draft-needs-local-review',
    },
    {
      id: 'yingge-intro',
      module: 'yingge',
      title: '英歌入门',
      summary: '先看一场完整表演。',
      body: '英歌独有正文：英歌是国家级非遗，站点建议先看完整表演。',
      region: '未标注',
      sourceIds: ['S1'],
      verify: 'draft-needs-local-review',
    },
    {
      id: 'ylr-name',
      module: 'yinglaoye',
      title: '老爷与营',
      summary: '潮州话里“老爷”指神，“营”是环绕、周游。',
      body: '营老爷独有正文：潮州话里老爷为神，营是环绕周游。',
      region: '潮州',
      sourceIds: ['S2'],
      verify: 'draft-needs-local-review',
    },
  ],
  story: [
    {
      id: 'prologue',
      title: '序章｜灯亮之前',
      fiction: true,
      narrative: '本故事为原创虚构串联，不对应某地完整仪式流程。',
      entryIds: [],
    },
  ],
  recipes: [
    {
      id: 'recipe-a',
      name: '示例食谱',
      region: '潮汕',
      ingredients: [{ name: '水', amount: '适量' }],
      tools: ['锅'],
      steps: [
        { n: 1, text: '第一步：净手' },
        { n: 2, text: '第二步：生火' },
        { n: 3, text: '第三步：下料' },
        { n: 4, text: '第四步：分装' },
      ],
      safety: ['注意烫伤'],
      sourceIds: ['S2'],
      verify: 'pending-source',
    },
  ],
  audio: [
    {
      id: 'audio-1',
      category: 'greeting',
      text: '食饱未',
      meaning: '吃饭了吗',
      accent: '潮州',
      sourceIds: ['S2'],
    },
  ],
  sources: [
    { id: 'S1', title: '英歌来源', org: '机构甲', url: 'https://example.org/1', verify: 'reference-only' },
    { id: 'S2', title: '茶来源', org: '机构乙', url: '', verify: 'fetched' },
  ],
  media: [],
}

function req(partial: Partial<AskRequest>): AskRequest {
  return {
    question: '这个条目主要讲了什么？',
    context: {},
    history: [],
    ...partial,
  }
}

describe('检索加权', () => {
  it('当前条目排第一，且用全文而不是摘要', () => {
    const plan = createRetriever(content).retrieve(
      req({ question: '冲泡环节包括哪些？', context: { module: 'tea', entryId: 'tea-intro' } }),
    )
    expect(plan.current?.refId).toBe('tea-intro')
    expect(plan.docs[0]?.doc.refId).toBe('tea-intro')
    expect(plan.docs[0]?.mode).toBe('full')
    expect(plan.docs[0]?.excerpt).toContain('2008 年')
  })

  it('当前模块的条目获得加权，其他模块只给摘要', () => {
    const plan = createRetriever(content).retrieve(
      req({ question: '要准备哪些器物？', context: { module: 'tea', entryId: 'tea-ware' } }),
    )
    const otherKinds = plan.docs.filter((d) => d.doc.refId !== 'tea-ware')
    expect(otherKinds.every((d) => d.mode === 'summary' || d.doc.kind !== 'entry')).toBe(true)
    expect(plan.docs.some((d) => d.doc.refId === 'yingge-intro' && d.mode === 'full')).toBe(false)
  })

  it('跨模块问题会召回其他模块的节选', () => {
    const plan = createRetriever(content).retrieve(
      req({
        question: '英歌和营老爷有什么联系？',
        context: { module: 'yingge', entryId: 'yingge-intro' },
      }),
    )
    expect(plan.intent).toBe('cross')
    expect(plan.crossModules).toEqual(expect.arrayContaining(['yingge', 'yinglaoye']))
    expect(plan.docs.some((d) => d.doc.refId === 'ylr-name' && d.mode === 'full')).toBe(true)
  })

  it('中文单字 + 二字切分能命中内容', () => {
    expect(tokenizeText('工夫茶')).toEqual(
      expect.arrayContaining(['工', '工夫', '夫', '夫茶', '茶']),
    )
  })
})

describe('上下文消歧', () => {
  it('「这一步」跟当前步骤走，不会串到别的模块', () => {
    const teaPlan = prepareAsk(
      req({
        question: '这一步为什么要这样做？',
        context: { module: 'tea', entryId: 'tea-steps', step: 4 },
      }),
      content,
    )
    const teaPrompt = teaPlan.messages[0]?.content ?? ''
    expect(teaPlan.plan.current?.refId).toBe('tea-steps')
    expect(teaPrompt).toContain('第 4 步')
    expect(teaPrompt).toContain('茶步骤正文')
    expect(teaPrompt).not.toContain('英歌独有正文')

    const yinggePlan = prepareAsk(
      req({
        question: '这一步为什么要这样做？',
        context: { module: 'yingge', entryId: 'yingge-intro', step: 1 },
      }),
      content,
    )
    const yinggePrompt = yinggePlan.messages[0]?.content ?? ''
    expect(yinggePlan.plan.current?.refId).toBe('yingge-intro')
    expect(yinggePrompt).toContain('英歌独有正文')
    expect(yinggePrompt).not.toContain('茶步骤正文')
  })

  it('食谱页按当前步骤给出步骤原文', () => {
    const plan = prepareAsk(
      req({ question: '这一步要注意什么？', context: { module: 'food', step: 4 } }),
      content,
    )
    // 没有 entryId 时只能靠页面标题/历史，不能凭空认定某一份食谱
    expect(plan.plan.current).toBeUndefined()

    const withTitle = createRetriever(content).retrieve({
      question: '这一步要注意什么？',
      context: { module: 'food', entryTitle: '示例食谱', step: 4 },
      history: [],
    })
    expect(withTitle.current?.refId).toBe('recipe-a')
    expect(withTitle.stepText).toContain('第四步：分装')
  })

  it('「刚才看的」可以用 history 里的标题消歧', () => {
    const plan = createRetriever(content).retrieve(
      req({
        question: '刚才看的那个茶具条目讲了什么？',
        context: {},
        history: [
          { role: 'user', content: '我想了解茶具' },
          { role: 'assistant', content: '可以看看《茶具》这一条。' },
        ],
      }),
    )
    expect(plan.current?.refId).toBe('tea-ware')
  })

  it('没有任何上下文时，纯指代问题先澄清而不猜', () => {
    const plan = createRetriever(content).retrieve(req({ question: '这个是什么？', context: {} }))
    expect(plan.direct?.kind).toBe('clarify')
    expect(plan.direct?.navs.length).toBeGreaterThan(0)
    expect(plan.direct?.text).toContain('哪一条')
  })

  it('没有步骤号时问「这一步」会先追问（即使已在条目页）', () => {
    const plan = createRetriever(content).retrieve(
      req({ question: '这一步为什么？', context: { module: 'tea', entryId: 'tea-steps' } }),
    )
    expect(plan.direct?.kind).toBe('clarify')
    expect(plan.direct?.text).toContain('哪一步')
    expect(plan.direct?.navs[0]?.entryId).toBe('tea-steps')
  })
})

describe('会话回顾只基于 visited', () => {
  it('只列真实打开过的条目，不编造', () => {
    const plan = createRetriever(content).retrieve(
      req({ question: '我刚才看过哪些条目？', context: { visited: ['tea-intro'] } }),
    )
    expect(plan.direct?.kind).toBe('recall')
    expect(plan.direct?.text).toContain('潮州工夫茶艺名录')
    expect(plan.direct?.text).not.toContain('英歌入门')
    expect(plan.direct?.navs.map((n) => n.entryId)).toEqual(['tea-intro'])
  })

  it('没有浏览记录时直接说明没有', () => {
    const plan = createRetriever(content).retrieve(
      req({ question: '我之前打开过什么？', context: { visited: [] } }),
    )
    expect(plan.direct?.kind).toBe('recall')
    expect(plan.direct?.text).toContain('还没有打开过')
    expect(plan.direct?.navs).toEqual([])
  })

  it('带内容的「刚才看过这个」不当作纯回顾，仍按条目回答', () => {
    const plan = createRetriever(content).retrieve(
      req({
        question: '我刚才看过这个茶具条目，它讲了什么？',
        context: { module: 'tea', visited: ['tea-ware'] },
      }),
    )
    expect(plan.direct).toBeUndefined()
    expect(plan.current?.refId).toBe('tea-ware')
  })

  it('提示词里的浏览记录只来自 visited', () => {
    const prompt = buildSystemPrompt(
      req({
        question: '这个是什么？',
        context: { entryId: 'tea-intro', visited: ['tea-intro', 'ghost'] },
      }),
      content,
    )
    expect(prompt).toContain('潮州工夫茶艺名录（tea-intro）')
    expect(prompt).not.toContain('英歌入门（yingge-intro）')
    expect(prompt).not.toContain('ghost')
  })
})

describe('确定性路由', () => {
  it('未知实时活动直接说不确定，不调用模型', () => {
    const plan = prepareAsk(
      req({ question: '现在人多不多？几点开始？', context: { module: 'yinglaoye', entryId: 'ylr-name' } }),
      content,
    )
    expect(plan.direct?.kind).toBe('realtime')
    expect(plan.messages).toEqual([])
    expect(plan.direct?.text).toContain('不确定')
    expect(plan.direct?.text).toContain('没有实时')
  })

  it('点名条目的导航问题直接返回白名单路径', () => {
    const plan = prepareAsk(req({ question: '英歌入门这一条在哪里看？', context: { module: 'yingge' } }), content)
    expect(plan.direct?.kind).toBe('navigate')
    expect(plan.direct?.navs).toEqual([
      { entryId: 'yingge-intro', title: '英歌入门', path: '/museum/yingge/yingge-intro' },
    ])
  })

  it('导航只返回站内路径，不返回外部链接', () => {
    const plan = prepareAsk(req({ question: '示例食谱在哪里？', context: { module: 'food' } }), content)
    expect(plan.direct?.kind).toBe('navigate')
    expect(plan.direct?.navs[0]?.path).toBe('/recipe/recipe-a')
    expect(plan.direct?.navs.every((n) => n.path.startsWith('/'))).toBe(true)
  })
})

describe('提示词边界', () => {
  it('未知实时活动要求明确说不确定', () => {
    const prompt = buildSystemPrompt(
      req({
        question: '今年正月初六前沟乡几点开始游神？',
        context: { module: 'yinglaoye', entryId: 'ylr-name' },
      }),
      content,
    )
    expect(prompt).toContain('本站没有实时数据')
    expect(prompt).toContain('不确定')
    expect(prompt).toContain('旧日期')
    expect(prompt).toContain('不可信数据')
  })

  it('没有资料时不把无关正文塞进提示词', () => {
    const prompt = buildSystemPrompt(
      req({ question: '完全不相关的问题 xyz', context: { module: 'tea', entryId: 'tea-intro' } }),
      content,
    )
    expect(prompt).toContain('茶条目的正文')
    expect(prompt).not.toContain('英歌独有正文')
    expect(prompt).not.toContain('营老爷独有正文')
  })
})

describe('引用与导航校验', () => {
  it('剔除不存在的来源编号，保留真实编号', () => {
    const result = sanitizeAnswer('真的 [S2]，假的 [S9]。', content)
    expect(result.text).toBe('真的 [S2]，假的。')
    expect(result.citations).toEqual([{ id: 'S2', title: '茶来源', url: '' }])
  })

  it('来源没有 URL 时返回空字符串，交给前端决定不显示链接', () => {
    const result = sanitizeAnswer('有来源 [S2]。', content)
    expect(result.citations[0]?.url).toBe('')
  })

  it('导航白名单包含条目与食谱，非法 id 被删除', () => {
    const result = sanitizeAnswer(
      '看 [[nav:tea-intro]]、[[nav:recipe-a]]、[[nav:ghost]]、[[nav:../etc/passwd]]。',
      content,
    )
    expect(result.navs).toEqual([
      { entryId: 'tea-intro', title: '潮州工夫茶艺名录', path: '/museum/tea/tea-intro' },
      { entryId: 'recipe-a', title: '示例食谱', path: '/recipe/recipe-a' },
    ])
    expect(result.text).not.toContain('[[nav:')
    expect(result.text).not.toContain('ghost')
  })

  it('空格异常的引用标记会被归一化或删除', () => {
    const result = sanitizeAnswer('格式 [ S2 ] 与 [ S8 ]。', content)
    expect(result.text).toContain('[S2]')
    expect(result.text).not.toContain('S8')
    expect(result.citations.map((c) => c.id)).toEqual(['S2'])
  })
})

describe('请求校验', () => {
  it('history 最多 12 条，visited 只保留字符串', () => {
    const result = validateAskRequest({
      question: '这个是什么？',
      context: { visited: ['tea-intro', 3, 'tea-steps'] },
      history: Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `第 ${i} 条`,
      })),
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.value.history).toHaveLength(12)
    expect(result.value.context.visited).toEqual(['tea-intro', 'tea-steps'])
  })
})
