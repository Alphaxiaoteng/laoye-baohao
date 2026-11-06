/**
 * 可选联网检索：只有配置了 WEB_SEARCH_URL 才启用，默认完全关闭。
 *
 * 支持两类常见返回：
 *   1. { results: [{ title, url, content | snippet }] }   （Brave / Tavily 风格）
 *   2. [{ title, url, snippet }]
 *
 * 结果一律视为「站外、未核验」，由提示词强制标注，不与站内 [S#] 混用。
 * 密钥只从环境变量读取，不写日志、不回传前端。
 */
export interface WebResult {
  title: string
  url: string
  snippet: string
}

const TIMEOUT_MS = 6000

export function webSearchEnabled(): boolean {
  return Boolean((process.env.WEB_SEARCH_URL || '').trim())
}

function pickResults(payload: unknown): WebResult[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { results?: unknown }).results)
      ? ((payload as { results: unknown[] }).results ?? [])
      : []

  const out: WebResult[] = []
  for (const raw of list.slice(0, 5)) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as Record<string, unknown>
    const url = typeof item.url === 'string' ? item.url : ''
    const title = typeof item.title === 'string' ? item.title : ''
    const snippetRaw = item.content ?? item.snippet ?? item.description ?? ''
    const snippet = typeof snippetRaw === 'string' ? snippetRaw : ''
    if (!url || !/^https?:\/\//i.test(url)) continue
    out.push({
      title: title.trim() || url,
      url,
      snippet: snippet.replace(/\s+/g, ' ').trim().slice(0, 400),
    })
  }
  return out
}

export async function webSearch(query: string): Promise<WebResult[]> {
  const base = (process.env.WEB_SEARCH_URL || '').trim()
  if (!base) return []

  const url = new URL(base)
  url.searchParams.set('q', query)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const headers: Record<string, string> = { Accept: 'application/json' }
    const key = (process.env.WEB_SEARCH_KEY || '').trim()
    if (key) headers.Authorization = `Bearer ${key}`
    const res = await fetch(url, { headers, signal: controller.signal })
    if (!res.ok) return []
    return pickResults(await res.json())
  } catch {
    // 联网失败必须静默降级：站内回答优先，不能因为外网挂了就答不了
    return []
  } finally {
    clearTimeout(timer)
  }
}

/** 把站外结果拼成提示词片段；调用方负责只在需要时追加 */
export function formatWebContext(results: WebResult[]): string {
  if (results.length === 0) return ''
  const lines = results.map(
    (item, i) => `[W${i + 1}] ${item.title}\n链接：${item.url}\n摘要：${item.snippet}`,
  )
  return `<站外检索结果（未核验）>
${lines.join('\n\n')}
</站外检索结果（未核验）>`
}
