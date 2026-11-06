import MiniSearch from 'minisearch'
import type { AudioItem, ContentBundle, Entry, GuideItem, Recipe, StoryChapter } from '../src/types/content'

/**
 * 轻量站内检索：只用 content/*.json 建索引，不引入向量库与外部服务。
 * 中文用「单字 + 相邻二字」切分，交给 MiniSearch 打分；再按当前页面上下文加权。
 * 参考资料始终按不可信数据处理，检索本身只负责「挑哪几段给模型看」。
 */

export type DocKind = 'entry' | 'recipe' | 'audio' | 'story' | 'guide'

export interface IndexDoc {
  id: string
  kind: DocKind
  /** 站内可识别的 id：条目 id / 食谱 id / 音频 id / 故事章节 id */
  refId: string
  module: string
  title: string
  summary: string
  body: string
  region: string
  verify: string
  sourceIds: string[]
  /** 站内路径；不存在可跳转页面时为空字符串 */
  path: string
  /** 允许模型用 [[nav:...]] 指向的 id；音频/故事为 undefined */
  navId?: string
}

export interface RetrievedDoc {
  doc: IndexDoc
  score: number
  mode: 'full' | 'summary'
  excerpt: string
}

export interface NavLike {
  entryId: string
  title: string
  path: string
}

export type RetrievalIntent = 'current' | 'step' | 'cross' | 'navigate' | 'lookup' | 'recall'

export interface RetrievalPlan {
  intent: RetrievalIntent
  current?: IndexDoc
  docs: RetrievedDoc[]
  step?: number
  stepText?: string
  crossModules: string[]
  /** 不需要调用模型的确定性回答（澄清 / 浏览回顾 / 导航 / 实时问题） */
  direct?: {
    text: string
    navs: NavLike[]
    kind: 'clarify' | 'recall' | 'navigate' | 'realtime'
  }
}

export interface RetrieveRequest {
  question: string
  context: {
    module?: string
    entryId?: string
    step?: number
    visited?: string[]
    /** 页面标题（前端不上传，服务端可由条目/食谱反查；保留以便测试） */
    entryTitle?: string
  }
  history: { role: string; content: string }[]
}

const MODULE_LABELS: Record<string, string> = {
  yingge: '英歌舞',
  tea: '工夫茶',
  food: '潮汕美食',
  yinglaoye: '营老爷·游神',
  story: '故事线',
  listen: '听潮',
  guide: '潮汕攻略',
}

const MODULE_HINTS: { module: string; re: RegExp }[] = [
  { module: 'yingge', re: /英歌|英歌舞/ },
  { module: 'tea', re: /工夫茶|功夫茶|茶艺|茶具|斟茶|泡茶/ },
  { module: 'food', re: /潮汕美食|美食|菜谱|食谱|做菜|菜品/ },
  { module: 'yinglaoye', re: /营老爷|游神|老爷|巡境|队伍/ },
  { module: 'story', re: /故事|章节/ },
  { module: 'listen', re: /听潮|潮州话|读音|方言/ },
  { module: 'guide', re: /攻略|行程|几天几夜|路线|打卡|自由行/ },
]

/**
 * 口语与异写归一：只用于检索召回，不改写提示词里的用户原文。
 * 内容标题用的是正式词（营老爷、工夫茶、英歌），用户常说的是俗称。
 */
const QUERY_SYNONYMS: { re: RegExp; terms: string }[] = [
  { re: /拜老爷|迎老爷|迎神|游神|绕境|巡游|巡境/, terms: '营老爷 巡境 游神' },
  { re: /营老爷|老爷/, terms: '营老爷 巡境 老爷' },
  { re: /功夫茶|工夫茶|茶艺|泡茶|冲茶|斟茶/, terms: '工夫茶 冲泡 茶具 茶艺' },
  { re: /英歌|英歌舞/, terms: '英歌 英歌舞' },
  { re: /脸谱|面具|花脸|勾脸/, terms: '脸谱 头饰 角色' },
  { re: /双槌|木槌|英歌槌|槌/, terms: '槌 器物 双槌' },
  { re: /阵形|队形|阵法/, terms: '阵形 路线' },
  { re: /什么时候|几月|几号|日期|时间/, terms: '时间 日期 农历' },
  { re: /锣鼓|鼓点|节奏|快板|慢板|中板|打击乐/, terms: '锣鼓 节奏 板' },
  { re: /牛肉丸|牛丸/, terms: '牛肉丸 手打' },
  { re: /粿条|河粉/, terms: '粿条 汤' },
  { re: /卤鹅|卤水鹅/, terms: '卤鹅 卤水' },
  { re: /潮州话|潮汕话|潮语|方言|读音|怎么念/, terms: '潮州话 读音 潮语' },
  { re: /标旗|仪仗|花队|队伍/, terms: '队伍 标旗 仪仗' },
]

/** 把俗称展开成内容里使用的正式词，避免「拜老爷」搜不到「营老爷」 */
export function expandQuery(input: string): string {
  const text = String(input ?? '')
  if (!text) return ''
  const extras: string[] = []
  for (const { re, terms } of QUERY_SYNONYMS) {
    if (!re.test(text)) continue
    const [primary, ...rest] = terms.split(/\s+/)
    // 已经说了正式词就不用再展开，避免把泛词塞进查询
    if (!primary || text.includes(primary)) continue
    for (const term of [primary, ...rest]) {
      if (term && !text.includes(term) && !extras.includes(term)) extras.push(term)
    }
  }
  return extras.length > 0 ? `${text} ${extras.join(' ')}` : text
}

const ANAPHORA = /这个|这条|这项|这件|这本|这一步|这步|这里|它|刚才|刚刚|上面|前面|那个|那条/
const STEP_QUESTION = /这一步|这步|第\s*\d+\s*步|步骤|环节/
const STEP_ANAPHORA = /这一步|这步|当前这一步|这个步骤/
const PURE_DEMONSTRATIVE =
  /^(?:请问)?(?:这个|这条|这项|这件|这里|它|那个|那条)(?:条目|页面|东西)?(?:是)?(?:什么|啥|什么意思|干嘛的|是什么东西)?[？?。！!]*$/
const RECALL_QUESTION =
  /^(?:请问)?(?:我的)?(?:我)?(?:刚才|刚刚|之前|前面)?(?:都)?(?:看过|看了|浏览过|打开过|去过)(?:哪些|什么|哪几个|哪几条)(?:条目|页面|地方|内容)?[？?。！!]*$/
const RECALL_HISTORY = /^(?:看看|查看|我的)?浏览记录[？?。！!]*$/
const NAVIGATE_QUESTION = /在哪|哪里|怎么去|想去|带我|导航|入口|有没有.*(?:条目|页面)|看看.*条目/
const REALTIME_TIME =
  /今天|明天|后天|今年|(?<!出)现在|实时|此刻|最近|本周|这个周末|几点|票价|门票|多少钱|价格|收费|人多|人流|天气|直播/
const REALTIME_EVENT =
  /游神|巡游|营老爷|老爷|请神|迎神|巡境|英歌|表演|活动|庙会|排队|开始|几点|票价|门票|多少钱|价格|收费|人多|人流|天气|直播|开门|举办/

const STOP_PHRASES = [
  '请问',
  '是什么',
  '什么意思',
  '为什么',
  '怎么样',
  '怎么',
  '哪些',
  '哪几个',
  '一下',
  '这个',
  '那个',
  '这条',
  '那条',
  '这一步',
  '这步',
  '刚才',
  '上面',
  '前面',
  '我们',
  '你们',
  '它们',
  '他们',
  '可以',
  '能不能',
  '有没有',
  '告诉我',
  '我想问',
  '问一下',
]

/** 中文按单字 + 相邻二字切分，英文数字按词切分 */
export function tokenizeText(input: string): string[] {
  const text = String(input ?? '').toLowerCase()
  const tokens: string[] = []
  for (const run of text.match(/[\u3400-\u9fff]+/g) ?? []) {
    for (let i = 0; i < run.length; i += 1) {
      tokens.push(run[i]!)
      if (i + 1 < run.length) tokens.push(run.slice(i, i + 2))
    }
  }
  for (const word of text.match(/[a-z0-9]+/g) ?? []) tokens.push(word)
  return tokens
}

function cleanQuery(query: string): string {
  let text = query.replace(/\s+/g, ' ').trim()
  for (const phrase of STOP_PHRASES) text = text.split(phrase).join(' ')
  return text.trim() || query.trim()
}

function normalizeTitle(value: string): string {
  return value.replace(/[\s·・:：,，。.、（）()「」“”"']/g, '').toLowerCase()
}

/** 问句里直接点名标题（或标题里「：」前的短名）时，给一个确定性的匹配分 */
function titleMatchScore(doc: IndexDoc, question: string): number {
  if (!doc.title || doc.title.length < 2) return 0
  if (question.includes(doc.title)) return 3200 + doc.title.length * 20
  let best = 0
  for (const segment of doc.title.split(/[：:，,、/｜|（）()·\s]+/)) {
    if (segment.length < 2) continue
    // 标题词命中要压过正文碎片匹配：这是「问巡境就该先给巡境那条」的关键
    if (question.includes(segment)) best = Math.max(best, 2400 + segment.length * 60)
  }
  return best
}

function recipeStepTexts(recipe: Recipe): string[] {
  const steps = Array.isArray(recipe.steps) ? recipe.steps : []
  return steps
    .map((step) => {
      if (typeof step === 'string') return step
      if (!step || typeof step !== 'object') return ''
      const text = step.text ?? step.title ?? step.description ?? ''
      return typeof text === 'string' ? text : ''
    })
    .map((text, i) => `第 ${i + 1} 步：${text.trim() || '（本步骤内容待补充）'}`)
}

function ingredientText(recipe: Recipe): string {
  const list = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  return list
    .map((ing) => {
      if (typeof ing === 'string') return ing
      if (!ing || typeof ing !== 'object') return ''
      const amount = ing.amount ? ` ${ing.amount}` : ''
      const note = ing.note ? `（${ing.note}）` : ''
      return `${ing.name ?? ''}${amount}${note}`.trim()
    })
    .filter(Boolean)
    .join('、')
}

function entryDoc(entry: Entry): IndexDoc {
  return {
    id: `entry:${entry.id}`,
    kind: 'entry',
    refId: entry.id,
    module: entry.module || 'unknown',
    title: entry.title || entry.id,
    summary: entry.summary || '',
    body: entry.body || '',
    region: entry.region || '',
    verify: entry.verify || '',
    sourceIds: Array.isArray(entry.sourceIds) ? entry.sourceIds : [],
    path: `/museum/${entry.module || 'unknown'}/${entry.id}`,
    navId: entry.id,
  }
}

function recipeDoc(recipe: Recipe): IndexDoc {
  const steps = recipeStepTexts(recipe).join('\n')
  const body = [
    recipe.summary ? `简介：${recipe.summary}` : '',
    ingredientText(recipe) ? `用料：${ingredientText(recipe)}` : '',
    Array.isArray(recipe.tools) && recipe.tools.length > 0 ? `器具：${recipe.tools.join('、')}` : '',
    steps ? `步骤：\n${steps}` : '',
    Array.isArray(recipe.safety) && recipe.safety.length > 0
      ? `安全提示：${recipe.safety.join('；')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    id: `recipe:${recipe.id}`,
    kind: 'recipe',
    refId: recipe.id,
    module: 'food',
    title: recipe.name || recipe.id,
    summary: recipe.summary || (steps ? '含分步制作界面' : ''),
    body,
    region: recipe.region || '',
    verify: recipe.verify || '',
    sourceIds: Array.isArray(recipe.sourceIds) ? recipe.sourceIds : [],
    path: `/recipe/${recipe.id}`,
    navId: recipe.id,
  }
}

function audioDoc(item: AudioItem): IndexDoc {
  return {
    id: `audio:${item.id}`,
    kind: 'audio',
    refId: item.id,
    module: 'listen',
    title: item.text || `听潮词条 ${item.id}`,
    summary: item.meaning || '',
    body: [item.category, item.accent, item.meaning, item.pinyin].filter(Boolean).join(' · '),
    region: item.accent || '',
    verify: item.license ? 'licensed' : '',
    sourceIds: Array.isArray(item.sourceIds) ? item.sourceIds : [],
    path: '/listen',
  }
}

function guideDoc(item: GuideItem): IndexDoc {
  return {
    id: `guide:${item.id}`,
    kind: 'guide',
    refId: item.id,
    module: 'guide',
    title: item.title || item.id,
    summary: item.excerpt || '',
    body: [
      item.detail || item.excerpt,
      item.detail && item.excerpt ? `要点：${item.excerpt}` : '',
      `城市：${item.city}`,
      `类型：${item.kind === 'guide' ? '行程攻略' : item.kind === 'food' ? '美食合集' : '家常做法'}`,
      item.author ? `作者：${item.author}` : '',
      item.publishedAt ? `发布：${item.publishedAt}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    region: item.city === '潮汕' ? '广东省潮汕地区' : `广东省${item.city}市`,
    verify: item.verify || 'reference-only',
    sourceIds: Array.isArray(item.sourceIds) ? item.sourceIds : [],
    path: '/guide',
  }
}

function storyDoc(chapter: StoryChapter): IndexDoc {
  return {
    id: `story:${chapter.id}`,
    kind: 'story',
    refId: chapter.id,
    module: 'story',
    title: chapter.title || chapter.id,
    summary: chapter.narrative ? chapter.narrative.slice(0, 80) : '',
    body: chapter.narrative || '',
    region: chapter.region || '',
    verify: chapter.fiction ? 'fiction' : '',
    sourceIds: [],
    path: `/story/${chapter.id}`,
  }
}

export interface Retriever {
  docs: IndexDoc[]
  search: (query: string) => { doc: IndexDoc; score: number }[]
  retrieve: (req: RetrieveRequest) => RetrievalPlan
  navFor: (id: string) => NavLike | undefined
}

export function createRetriever(content: ContentBundle): Retriever {
  const entryDocs = (content.entries ?? []).filter((e) => e && e.id).map(entryDoc)
  const recipeDocs = (content.recipes ?? []).filter((r) => r && r.id).map(recipeDoc)
  const audioDocs = (content.audio ?? []).filter((a) => a && a.id).map(audioDoc)
  const storyDocs = (content.story ?? []).filter((s) => s && s.id).map(storyDoc)
  const guideDocs = (content.guides ?? []).filter((g) => g && g.id).map(guideDoc)
  const docs = [...entryDocs, ...recipeDocs, ...audioDocs, ...storyDocs, ...guideDocs]

  const byId = new Map(docs.map((doc) => [doc.id, doc]))
  const navById = new Map<string, NavLike>()
  for (const doc of docs) {
    if (doc.navId && doc.path && !navById.has(doc.navId)) {
      navById.set(doc.navId, { entryId: doc.navId, title: doc.title, path: doc.path })
    }
  }

  const stepMap = new Map<string, string[]>()
  for (const recipe of content.recipes ?? []) {
    if (recipe && recipe.id) stepMap.set(recipe.id, recipeStepTexts(recipe))
  }

  const mini = new MiniSearch<IndexDoc>({
    idField: 'id',
    fields: ['title', 'summary', 'body', 'region'],
    storeFields: [],
    tokenize: tokenizeText,
    processTerm: (term) => term,
    searchOptions: {
      boost: { title: 5, summary: 2.5, body: 1, region: 0.5 },
      combineWith: 'OR',
      prefix: true,
      fuzzy: false,
    },
  })
  try {
    mini.addAll(docs)
  } catch {
    // 内容为空或字段异常时检索降级为空结果，问答仍可基于当前条目作答
  }

  function search(query: string): { doc: IndexDoc; score: number }[] {
    const cleaned = cleanQuery(query)
    if (!cleaned) return []
    const queryTerms = expandQuery(cleaned)
    const hits: { doc: IndexDoc; score: number }[] = []
    try {
      for (const hit of mini.search(queryTerms)) {
        const doc = byId.get(String(hit.id))
        if (doc) hits.push({ doc, score: hit.score })
      }
    } catch {
      /* 检索失败时走下面的包含匹配兜底 */
    }

    const direct = cleaned.replace(/\s+/g, '')
    if (hits.length === 0 && direct.length >= 2) {
      for (const doc of docs) {
        const title = doc.title.replace(/\s+/g, '')
        if (title && (title.includes(direct) || direct.includes(title))) {
          hits.push({ doc, score: 20 })
        }
      }
    }
    return hits
  }

  function resolveCurrent(
    req: RetrieveRequest,
    questionHasAnaphora: boolean,
  ): IndexDoc | undefined {
    const ctx = req.context ?? {}
    if (ctx.entryId) {
      const hit = docs.find((doc) => doc.refId === ctx.entryId && doc.kind !== 'audio' && doc.kind !== 'story')
      if (hit) return hit
    }
    if (ctx.entryTitle) {
      const wanted = normalizeTitle(ctx.entryTitle)
      if (wanted) {
        const hit = docs.find((doc) => normalizeTitle(doc.title) === wanted)
        if (hit) return hit
      }
    }
    if (!questionHasAnaphora) return undefined

    // 「刚才看的 / 这个」：从最近的历史消息里找标题；找不到再用真实浏览记录的最后一条
    for (let i = req.history.length - 1; i >= 0; i -= 1) {
      const content = req.history[i]?.content ?? ''
      if (!content) continue
      const mentioned = docs
        .filter((doc) => doc.navId && doc.title.length >= 2 && content.includes(doc.title))
        .sort((a, b) => b.title.length - a.title.length)
      if (mentioned[0]) return mentioned[0]
    }
    const visited = Array.isArray(ctx.visited) ? ctx.visited : []
    for (let i = visited.length - 1; i >= 0; i -= 1) {
      const doc = docs.find((d) => d.refId === visited[i] && d.kind === 'entry')
      if (doc) return doc
    }
    return undefined
  }

  function detectCrossModules(question: string): string[] {
    const found: string[] = []
    for (const hint of MODULE_HINTS) {
      if (hint.re.test(question) && !found.includes(hint.module)) found.push(hint.module)
    }
    return found
  }

  function adjustScore(
    doc: IndexDoc,
    base: number,
    req: RetrieveRequest,
    current: IndexDoc | undefined,
    crossModules: string[],
  ): number {
    const ctx = req.context ?? {}
    const visited = Array.isArray(ctx.visited) ? ctx.visited : []
    let score = base
    if (current && doc.id === current.id) score += 500
    if (doc.module === ctx.module) score += 12
    if (crossModules.includes(doc.module)) score += 26
    if (visited.includes(doc.refId)) score += 3
    score += titleMatchScore(doc, req.question)
    // 有正文的条目比只有摘要的更值得给模型看
    if (!doc.body) score -= 2
    return score
  }

  /**
   * 跨模块问题里，如果问句点到了某个模块但检索没召回它的文档，
   * 补上该模块里正文最完整的一条，避免「英歌和营老爷」只答一边。
   */
  function ensureCrossCoverage(
    crossModules: string[],
    scored: { doc: IndexDoc; score: number }[],
    current: IndexDoc | undefined,
  ): void {
    for (const module of crossModules) {
      if (module === current?.module) continue
      if (scored.some((item) => item.doc.module === module)) continue
      const candidates = docs
        .filter((doc) => doc.module === module && doc.kind !== 'audio' && doc.kind !== 'story')
        .sort((a, b) => b.body.length - a.body.length || b.summary.length - a.summary.length)
      const best = candidates[0]
      if (best) scored.push({ doc: best, score: 18 })
    }
  }

  function toNavs(docsIn: IndexDoc[]): NavLike[] {
    const out: NavLike[] = []
    for (const doc of docsIn) {
      if (!doc.navId || !doc.path) continue
      if (out.some((n) => n.entryId === doc.navId)) continue
      out.push({ entryId: doc.navId, title: doc.title, path: doc.path })
    }
    return out
  }

  function clarifyPlan(
    req: RetrieveRequest,
    current: IndexDoc | undefined,
    stepQuestion: boolean,
    hits: { doc: IndexDoc; score: number }[],
  ): RetrievalPlan {
    const ctx = req.context ?? {}
    let options: IndexDoc[] = []
    if (current) options = [current]
    else {
      const merged = hits
        .map((hit) => hit.doc)
        .filter((doc) => doc.kind === 'entry' || doc.kind === 'recipe')
      options = merged.slice(0, 4)
    }

    let navs = toNavs(options)
    if (navs.length === 0) {
      navs = Object.entries(MODULE_LABELS)
        .slice(0, 4)
        .map(([module, title]) => ({
          entryId: `module:${module}`,
          title,
          path: module === 'story' ? '/story' : module === 'listen' ? '/listen' : `/museum/${module}`,
        }))
    }

    const text = stepQuestion
      ? '你想问哪一条、哪一步？当前页面没有指定具体步骤，我先不猜。可以先打开分步页面，或补充条目名与第几步。'
      : '你想问的是哪一条？当前页面没有指定具体条目，我先不猜。可以从下面选一个，或补充模块 / 条目名。'

    return {
      intent: stepQuestion ? 'step' : 'current',
      current,
      docs: [],
      step: typeof ctx.step === 'number' ? ctx.step : undefined,
      crossModules: [],
      direct: { text, navs, kind: 'clarify' },
    }
  }

  function recallPlan(req: RetrieveRequest): RetrievalPlan {
    const ctx = req.context ?? {}
    const visited = Array.isArray(ctx.visited) ? ctx.visited : []
    const unique: string[] = []
    for (const id of visited) {
      if (typeof id === 'string' && id && !unique.includes(id)) unique.push(id)
    }
    const visitedDocs = unique
      .map((id) => docs.find((doc) => doc.refId === id && doc.kind === 'entry'))
      .filter((doc): doc is IndexDoc => Boolean(doc))

    if (visitedDocs.length === 0) {
      return {
        intent: 'recall',
        docs: [],
        crossModules: [],
        direct: {
          text: '本次会话里你还没有打开过文化馆条目，我不会替你编造浏览记录。可以先去文化馆看一条，再回来问。',
          navs: [],
          kind: 'recall',
        },
      }
    }

    const lines = visitedDocs.map((doc, i) => `${i + 1}. ${doc.title}${doc.region ? `（${doc.region}）` : ''}`)
    return {
      intent: 'recall',
      docs: [],
      crossModules: [],
      direct: {
        text: `本次会话你打开过这些条目：\n${lines.join('\n')}\n以上只来自本次会话的真实浏览记录，没提到的条目我不会补。`,
        navs: toNavs(visitedDocs.slice(-6)),
        kind: 'recall',
      },
    }
  }

  function navigatePlan(
    req: RetrieveRequest,
    current: IndexDoc | undefined,
    hits: { doc: IndexDoc; score: number }[],
  ): RetrievalPlan | null {
    const matches = hits
      .map((hit) => ({
        doc: hit.doc,
        match: titleMatchScore(hit.doc, req.question),
        score: adjustScore(hit.doc, hit.score, req, current, []),
      }))
      .filter((item) => item.match > 0 && (item.doc.kind === 'entry' || item.doc.kind === 'recipe'))
      .sort((a, b) => b.match - a.match || b.score - a.score)

    if (matches.length === 0) return null
    // 只保留和最佳匹配同一量级的候选，避免「英歌角色」把泛泛的「英歌」条目也带出来
    const top = matches[0]!
    const cutoff = Math.max(44, top.match - 15)
    const picked = matches
      .filter((item) => item.match >= cutoff)
      .slice(0, 3)
      .map((item) => item.doc)
    const navs = toNavs(picked)
    if (navs.length === 0) return null

    const text =
      navs.length === 1
        ? `你想看的是《${navs[0]!.title}》，下面的站内链接可以直接打开。`
        : '你说的可能是这几条，先看下面的站内链接；如果不是，再补充模块或条目名。'

    return {
      intent: 'navigate',
      current,
      docs: [],
      crossModules: [],
      direct: { text, navs, kind: 'navigate' },
    }
  }

  function realtimePlan(
    req: RetrieveRequest,
    current: IndexDoc | undefined,
    hits: { doc: IndexDoc; score: number }[],
  ): RetrievalPlan | null {
    const question = req.question
    // 价格类问题本身就是实时信息，不要求句子里再出现活动词
    const priceQuestion = /门票|票价|多少钱|价格|收费/.test(question)
    if (!priceQuestion && (!REALTIME_TIME.test(question) || !REALTIME_EVENT.test(question))) return null

    const candidates = current ? [current] : hits.slice(0, 2).map((hit) => hit.doc)
    return {
      intent: 'lookup',
      current,
      docs: [],
      crossModules: [],
      direct: {
        kind: 'realtime',
        text: '本站没有实时活动数据，无法确认今天或今年的具体时间、人流、票价，也不确定现场安排。资料里只有过去报道的日期，不能当作今年的安排；具体信息请以当地官方发布为准。',
        navs: toNavs(candidates),
      },
    }
  }

  function retrieve(req: RetrieveRequest): RetrievalPlan {
    const question = (req.question ?? '').trim()
    const ctx = req.context ?? {}
    const anaphora = ANAPHORA.test(question)
    const stepQuestion = STEP_QUESTION.test(question)
    const current = resolveCurrent(req, anaphora)
    const crossModules = detectCrossModules(question)

    if (RECALL_QUESTION.test(question) || RECALL_HISTORY.test(question)) return recallPlan(req)

    const hits = search(question)

    // 「今天几点 / 今年什么时候 / 现在人多不多」：本站没有实时数据，直接确定性回答
    const realtime = realtimePlan(req, current, hits)
    if (realtime) return realtime

    const pureDemonstrative = PURE_DEMONSTRATIVE.test(question.replace(/\s+/g, ''))
    const stepNeedsClarify = STEP_ANAPHORA.test(question) && typeof ctx.step !== 'number'
    if ((pureDemonstrative && !current) || stepNeedsClarify) {
      return clarifyPlan(req, current, stepQuestion, hits)
    }

    let intent: RetrievalIntent = 'lookup'
    if (stepQuestion || typeof ctx.step === 'number') intent = 'step'
    else if (crossModules.length >= 2 || crossModules.some((m) => m !== ctx.module)) intent = 'cross'
    else if (NAVIGATE_QUESTION.test(question)) intent = 'navigate'
    else if (current) intent = 'current'

    // 「带我去 / 在哪看」且问句点名了标题：直接给白名单内的站内路径，不用模型猜
    if (intent === 'navigate') {
      const nav = navigatePlan(req, current, hits)
      if (nav) return nav
    }

    // 攻略是行程参考，只在问句明确要「行程/路线/怎么玩」时才参与排序，
    // 避免「过节吃什么」被小红书笔记挤掉正式条目。
    const travelIntent =
      /攻略|行程|路线|怎么玩|一日游|两日游|三日游|几日游|几天|打卡|自由行|去哪|游玩|旅游|好玩|推荐|怎么去|值得去|去哪玩|怎么吃|逛吃/.test(question)
    const scored = hits
      .filter((hit) => travelIntent || hit.doc.kind !== 'guide')
      .map((hit) => ({
        doc: hit.doc,
        score: adjustScore(hit.doc, hit.score, req, current, crossModules),
      }))

    if (current && !scored.some((item) => item.doc.id === current.id)) {
      scored.push({ doc: current, score: 1000 })
    }
    // 问句里直接点名了某个标题（或「：」前的短名）时，即使分词没命中也要带上
    for (const doc of docs) {
      if (!travelIntent && doc.kind === 'guide') continue
      const match = titleMatchScore(doc, question)
      if (match <= 0) continue
      if (!scored.some((item) => item.doc.id === doc.id)) {
        scored.push({ doc, score: match })
      }
    }

    if (intent === 'cross') ensureCrossCoverage(crossModules, scored, current)

    scored.sort((a, b) => b.score - a.score)

    // 相关度下限：只保留和最佳候选同一量级的文档，避免单字命中把噪声塞进提示词。
    // 跨模块回答需要覆盖每个被点名的模块，因此不做截断。
    const bestOther = scored.find((item) => !current || item.doc.id !== current.id)?.score ?? 0
    const floor = intent === 'cross' ? 0 : bestOther * 0.12
    const seen = new Set<string>()
    const picked: { doc: IndexDoc; score: number }[] = []
    if (current) {
      seen.add(current.id)
      picked.push({ doc: current, score: 1000 })
    }
    const limit = intent === 'cross' ? 4 : 3
    for (const item of scored) {
      if (picked.length >= limit + 1) break
      if (seen.has(item.doc.id)) continue
      // 相关度明显低于最佳候选、又不是问句点名的文档，不给模型看
      if (
        item.doc.id !== current?.id &&
        item.score < floor &&
        titleMatchScore(item.doc, question) === 0
      ) {
        continue
      }
      // 页面上下文明确时，不把无关模块的正文/摘要挤进提示词
      if (
        current &&
        intent !== 'cross' &&
        item.doc.module !== current.module &&
        titleMatchScore(item.doc, question) === 0
      ) {
        continue
      }
      if (current && item.doc.kind === 'story' && intent !== 'cross') continue
      seen.add(item.doc.id)
      picked.push(item)
    }

    // 结果被相关度下限全部过滤时，至少保留最佳的一条，避免检索完全落空
    if (picked.length === 0 && scored.length > 0) {
      const fallback = scored.find((item) => item.doc.kind !== 'story') ?? scored[0]
      if (fallback) picked.push(fallback)
    }

    const docsOut: RetrievedDoc[] = picked.map((item, index) => {
      const isCurrent = Boolean(current && item.doc.id === current.id)
      const body = item.doc.body || ''
      // 首条给正文：只给摘要会让「切多厚 / 卤多久」这类细节问题答不出来。
      // 其余条目仍给摘要，控制提示词长度。
      const full = isCurrent || intent === 'cross' || index === 0
      const excerpt = full
        ? isCurrent
          ? body || item.doc.summary || '（该条目暂无正文）'
          : body.slice(0, 1200) || item.doc.summary || '（该条目暂无正文）'
        : item.doc.summary || body.slice(0, 160) || '（该条目暂无摘要）'
      return {
        doc: item.doc,
        score: item.score,
        mode: full ? 'full' : 'summary',
        excerpt,
      }
    })

    const step = typeof ctx.step === 'number' ? ctx.step : undefined
    const stepText =
      current && step && step > 0 ? stepMap.get(current.refId)?.[step - 1] : undefined

    return {
      intent,
      current,
      docs: docsOut,
      step,
      stepText,
      crossModules,
    }
  }

  return {
    docs,
    search,
    retrieve,
    navFor: (id: string) => navById.get(id),
  }
}

const retrieverCache = new WeakMap<ContentBundle, Retriever>()

export function retrieverFor(content: ContentBundle): Retriever {
  const cached = retrieverCache.get(content)
  if (cached) return cached
  const created = createRetriever(content)
  retrieverCache.set(content, created)
  return created
}

/** 模块中文名，写提示词时用 */
export function moduleLabel(module: string | undefined): string {
  if (!module) return '未指定'
  return MODULE_LABELS[module] ?? module
}
