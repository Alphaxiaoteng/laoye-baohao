import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { getConnInfo } from '@hono/node-server/conninfo'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  buildMessages,
  createLimiter,
  createRateLimiter,
  DEFAULT_MODEL,
  MAX_OUTPUT_CHARS,
  pendingTail,
  sanitizeAnswer,
  UPSTREAM_URL,
  validateAskRequest,
} from './ask'
import { loadContent } from './content'

const PORT = Number(process.env.PORT || 7860)
const HOST = '0.0.0.0'

const content = loadContent()
const limiter = createLimiter({ concurrency: 2, maxQueue: 10 })
const rateLimiter = createRateLimiter({ limit: 6, windowMs: 60_000 })

const app = new Hono()

function clientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim() || 'unknown'
  try {
    return getConnInfo(c).remote.address ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

interface SseWriter {
  writeSSE: (message: { event: string; data: string }) => Promise<void>
}

async function sendError(stream: SseWriter, code: string, message: string): Promise<void> {
  try {
    await stream.writeSSE({ event: 'error', data: JSON.stringify({ error: { code, message } }) })
  } catch {
    /* 客户端已断开 */
  }
}

function extractDelta(block: string): string {
  let out = ''
  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (!line.startsWith('data:')) continue
    const data = line.slice(5).trim()
    if (!data || data === '[DONE]') continue
    try {
      const json = JSON.parse(data) as {
        choices?: { delta?: { content?: string } }[]
      }
      const piece = json.choices?.[0]?.delta?.content
      if (typeof piece === 'string') out += piece
    } catch {
      /* 上游偶发心跳行，忽略 */
    }
  }
  return out
}

app.get('/api/health', (c) =>
  c.json({
    status: 'ok',
    service: 'laoye-baohao',
    time: new Date().toISOString(),
    ai: {
      keyConfigured: Boolean(process.env.MODELSCOPE_API_KEY),
      model: process.env.MODEL_ID || DEFAULT_MODEL,
    },
    content: {
      entries: content.entries.length,
      story: content.story.length,
      recipes: content.recipes.length,
      audio: content.audio.length,
      sources: content.sources.length,
    },
    limits: limiter.stats(),
  }),
)

app.post('/api/ask', async (c) => {
  const ip = clientIp(c)
  if (!rateLimiter.check(ip)) {
    return c.json(
      { error: { code: 'rate_limited', message: '提问有点频繁，请等一分钟再试' } },
      429,
    )
  }

  const declaredLength = Number(c.req.header('content-length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > 32 * 1024) {
    return c.json({ error: { code: 'invalid_question', message: '请求体过大' } }, 413)
  }

  let raw: unknown
  try {
    raw = await c.req.json()
  } catch {
    return c.json({ error: { code: 'invalid_question', message: '请求体不是合法 JSON' } }, 400)
  }

  const parsed = validateAskRequest(raw)
  if (!parsed.ok) {
    return c.json({ error: { code: parsed.code, message: parsed.message } }, 400)
  }
  const request = parsed.value

  const apiKey = process.env.MODELSCOPE_API_KEY?.trim()
  if (!apiKey) {
    // 无密钥也走 SSE，前端按同一套降级逻辑处理
    return streamSSE(c, async (stream) => {
      await sendError(stream, 'no_key', '服务端未配置模型密钥，问答暂不可用')
    })
  }

  const release = await limiter.acquire()
  if (!release) {
    return c.json(
      { error: { code: 'busy', message: '当前提问较多，请稍后再试' } },
      503,
    )
  }

  c.header('Cache-Control', 'no-cache, no-transform')
  c.header('X-Accel-Buffering', 'no')

  return streamSSE(c, async (stream) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20_000)
    let aborted = false
    stream.onAbort(() => {
      aborted = true
      controller.abort()
    })

    let buffer = ''
    let emitted = 0
    let truncated = false

    try {
      const upstream = await fetch(UPSTREAM_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.MODEL_ID || DEFAULT_MODEL,
          stream: true,
          temperature: 0.3,
          max_tokens: 900,
          messages: buildMessages(request, content),
        }),
        signal: controller.signal,
      })

      if (!upstream.ok) {
        const code = upstream.status === 429 ? 'upstream' : 'upstream'
        await sendError(stream, code, `上游返回 ${upstream.status}`)
        return
      }
      if (!upstream.body) {
        await sendError(stream, 'upstream', '上游没有返回流式内容')
        return
      }

      const reader = upstream.body.getReader()
      const decoder = new TextDecoder()
      let sse = ''
      let finished = false

      while (!finished) {
        const { done, value } = await reader.read()
        if (done) break
        sse += decoder.decode(value, { stream: true })

        let cut = sse.indexOf('\n\n')
        while (cut >= 0) {
          const block = sse.slice(0, cut)
          sse = sse.slice(cut + 2)
          const piece = extractDelta(block)
          if (piece) {
            buffer += piece
            if (buffer.length > MAX_OUTPUT_CHARS) {
              buffer = buffer.slice(0, MAX_OUTPUT_CHARS)
              truncated = true
              finished = true
              break
            }
            const holdback = pendingTail(buffer).length
            const safeEnd = buffer.length - holdback
            if (safeEnd > emitted) {
              const chunk = buffer.slice(emitted, safeEnd)
              emitted = safeEnd
              if (!aborted) {
                await stream.writeSSE({ event: 'delta', data: JSON.stringify({ text: chunk }) })
              }
            }
          }
          cut = sse.indexOf('\n\n')
        }
        if (finished) break
      }

      if (buffer.length > emitted && !aborted) {
        const tail = buffer.slice(emitted)
        emitted = buffer.length
        await stream.writeSSE({ event: 'delta', data: JSON.stringify({ text: tail }) })
      }

      const result = sanitizeAnswer(buffer, content)
      if (!result.text) {
        await sendError(stream, 'upstream', '上游没有返回内容')
        return
      }
      if (aborted) return

      await stream.writeSSE({
        event: 'done',
        data: JSON.stringify({
          text: result.text,
          citations: result.citations,
          navs: result.navs,
          uncertain: result.uncertain,
          truncated,
        }),
      })
    } catch (err) {
      if (aborted) return
      if (controller.signal.aborted) {
        await sendError(stream, 'timeout', '等待上游回答超时')
      } else {
        const message = err instanceof Error ? err.message : '上游请求失败'
        await sendError(stream, 'upstream', message)
      }
    } finally {
      clearTimeout(timeout)
      release()
    }
  })
})

app.all('/api/*', (c) => c.json({ error: { code: 'not_found', message: '接口不存在' } }, 404))

// 静态资源与 SPA fallback（dist/ 由 vite build 生成）
app.use('*', serveStatic({ root: './dist' }))

// 构建产物 hash 变了以后，旧页面来取旧资源要拿到 404，不能回退成 index.html
app.get('/assets/*', (c) => c.text('Not Found', 404))

app.get('*', async (c) => {
  try {
    // 不缓存 index.html：重新构建后立刻拿到新的资源 hash
    const html = await readFile(resolve(process.cwd(), 'dist', 'index.html'), 'utf8')
    c.header('Cache-Control', 'no-cache')
    return c.html(html)
  } catch {
    return c.text('前端尚未构建：请先执行 npm run build（或在开发时使用 npm run dev）。', 503)
  }
})

serve({ fetch: app.fetch, port: PORT, hostname: HOST }, (info) => {
  console.log(
    `[laoye-baohao] listening on http://${HOST}:${info.port} | key=${process.env.MODELSCOPE_API_KEY ? 'configured' : 'missing'} | entries=${content.entries.length} sources=${content.sources.length}`,
  )
})
