export interface AskPayload {
  question: string
  context: {
    module?: string
    entryId?: string
    step?: number
    visited?: string[]
  }
  history: { role: 'user' | 'assistant'; content: string }[]
}

export interface Citation {
  id: string
  title: string
  url: string
}

export interface NavSuggestion {
  entryId: string
  title: string
  path: string
}

export type AskDone = {
  type: 'done'
  text: string
  citations: Citation[]
  navs: NavSuggestion[]
  uncertain: boolean
  /** 服务端确定性回答（浏览回顾 / 澄清），不需要引用 */
  direct?: boolean
  /** 服务端先追问澄清，而非直接作答 */
  clarify?: boolean
}

export type AskEvent =
  | { type: 'delta'; text: string }
  | AskDone
  | { type: 'error'; code: string; message: string }

export class AskHttpError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'AskHttpError'
    this.code = code
  }
}

/** 解析一个 SSE 事件块（data 行可能多行） */
export function parseEventBlock(block: string): AskEvent | null {
  let event = 'message'
  const dataLines: string[] = []
  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (!line) continue
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''))
  }
  if (dataLines.length === 0) return null
  let data: unknown
  try {
    data = JSON.parse(dataLines.join('\n'))
  } catch {
    return null
  }
  const bag = (data ?? {}) as Record<string, unknown>
  if (event === 'delta') {
    return { type: 'delta', text: typeof bag.text === 'string' ? bag.text : '' }
  }
  if (event === 'error') {
    const err = (bag.error ?? {}) as Record<string, unknown>
    return {
      type: 'error',
      code: typeof err.code === 'string' ? err.code : 'unknown',
      message: typeof err.message === 'string' ? err.message : '暂时无法回答',
    }
  }
  if (event === 'done') {
    const citations = Array.isArray(bag.citations)
      ? (bag.citations as Citation[])
          .filter(
            (c) =>
              c &&
              typeof c.id === 'string' &&
              typeof c.title === 'string' &&
              typeof c.url === 'string',
          )
          .map((c) => ({ id: c.id, title: c.title, url: c.url }))
      : []
    const navs = Array.isArray(bag.navs)
      ? (bag.navs as NavSuggestion[]).filter(
          (n) =>
            n &&
            typeof n.entryId === 'string' &&
            typeof n.title === 'string' &&
            typeof n.path === 'string' &&
            n.path.startsWith('/'),
        )
      : []
    return {
      type: 'done',
      text: typeof bag.text === 'string' ? bag.text : '',
      citations,
      navs,
      uncertain: bag.uncertain === true,
      direct: bag.direct === true,
      clarify: bag.clarify === true,
    }
  }
  return null
}

export interface AskHandlers {
  onDelta: (text: string) => void
  onDone: (done: AskDone) => void
  onError: (code: string, message: string) => void
}

/**
 * 调用 /api/ask 并读取 SSE。
 * 前端只带 content-type，不带 Authorization / X-modelscope-* / X-studio-* 头。
 */
export async function streamAsk(
  payload: AskPayload,
  handlers: AskHandlers,
  externalSignal?: AbortSignal,
  timeoutMs = 45_000,
): Promise<void> {
  const controller = new AbortController()
  let timedOut = false

  const onExternalAbort = () => controller.abort()
  externalSignal?.addEventListener('abort', onExternalAbort, { once: true })
  const timer =
    typeof setTimeout === 'function'
      ? setTimeout(() => {
          timedOut = true
          controller.abort()
        }, timeoutMs)
      : null

  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: 'same-origin',
    })

    if (!res.ok) {
      let code = 'upstream'
      let message = '暂时无法回答'
      try {
        const data = (await res.json()) as { error?: { code?: string; message?: string } }
        if (data?.error?.code) code = data.error.code
        if (data?.error?.message) message = data.error.message
      } catch {
        /* 响应不是 JSON 时保持默认码 */
      }
      handlers.onError(code, message)
      return
    }

    if (!res.body) {
      handlers.onError('upstream', '浏览器不支持流式响应')
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let sawDone = false
    let sawError = false

    const dispatch = (block: string) => {
      const event = parseEventBlock(block)
      if (!event) return
      if (event.type === 'delta') handlers.onDelta(event.text)
      else if (event.type === 'error') {
        sawError = true
        handlers.onError(event.code, event.message)
      }
      else {
        sawDone = true
        handlers.onDone(event)
      }
    }

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let cut = buffer.indexOf('\n\n')
      while (cut >= 0) {
        const block = buffer.slice(0, cut)
        buffer = buffer.slice(cut + 2)
        if (block.trim()) dispatch(block)
        cut = buffer.indexOf('\n\n')
      }
    }
    buffer += decoder.decode()
    if (buffer.trim()) dispatch(buffer)

    if (!sawDone && !sawError) handlers.onError('upstream', '连接意外中断')
  } catch (err) {
    if (timedOut) {
      handlers.onError('timeout', '等待回答超时')
    } else if (controller.signal.aborted) {
      // 用户主动取消，不当作错误弹提示
      return
    } else {
      handlers.onError('network', err instanceof Error ? err.message : '网络异常')
    }
  } finally {
    if (timer !== null) clearTimeout(timer)
    externalSignal?.removeEventListener('abort', onExternalAbort)
  }
}
