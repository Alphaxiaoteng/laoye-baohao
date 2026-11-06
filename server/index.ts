import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { getConnInfo } from '@hono/node-server/conninfo'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  createLimiter,
  createRateLimiter,
  MAX_OUTPUT_CHARS,
  pendingTail,
  prepareAsk,
  redactSecrets,
  sanitizeAnswer,
  llmApiKey,
  llmBaseHost,
  llmChatUrl,
  llmModel,
  validateAskRequest,
} from './ask'
import { loadContent } from './content'
import { loadLocalEnv } from './ask-env'
import { formatWebContext, webSearch, webSearchEnabled } from './web-search'

// 本地开发时读取项目根目录 .env（仅服务端；不打印、不回传任何值）
loadLocalEnv()

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
    // 上游错误可能夹带 Authorization / key，对外统一脱敏
    await stream.writeSSE({
      event: 'error',
      data: JSON.stringify({ error: { code, message: redactSecrets(message) } }),
    })
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
      keyConfigured: Boolean(llmApiKey()),
      model: llmModel(),
      // 只暴露上游主机名，方便排障；不含路径、查询参数或任何凭据
      endpoint: llmBaseHost(),
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

  const prepared = prepareAsk(request, content)
  if (prepared.direct) {
    c.header('Cache-Control', 'no-cache, no-transform')
    c.header('X-Accel-Buffering', 'no')
    return streamSSE(c, async (stream) => {
      await stream.writeSSE({
        event: 'done',
        data: JSON.stringify({
          text: prepared.direct?.text ?? '',
          citations: [],
          navs: prepared.direct?.navs ?? [],
          // 实时活动问题属于「资料里没有」，前端可据此显示谨慎提示
          uncertain: prepared.direct?.kind === 'realtime',
          truncated: false,
          direct: true,
          clarify: prepared.direct?.kind === 'clarify',
        }),
      })
    })
  }

  const apiKey = llmApiKey()
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

  // 站内检索不足时才补站外检索（需配置 WEB_SEARCH_URL；默认关闭）
  if (webSearchEnabled() && prepared.plan.docs.length < 2) {
    const results = await webSearch(request.question)
    if (results.length > 0) {
      const last = prepared.messages[prepared.messages.length - 1]
      if (last && last.role === 'user') {
        last.content = `${last.content}\n\n${formatWebContext(results)}`
      }
    }
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
      const upstream = await fetch(llmChatUrl(), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: llmModel(),
          stream: true,
          temperature: 0.3,
          max_tokens: 900,
          messages: prepared.messages,
        }),
        signal: controller.signal,
      })

      if (!upstream.ok) {
        const code = upstream.status === 429 ? 'rate_limited' : 'upstream'
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

// 展内自带 AI/语音后端未挂载，降级提示（原站 8787 服务，当前未部署；需在 /api/* 兜底之前注册）
app.all('/api/agent', (c) =>
  c.json({ error: { code: 'not_available', message: '展内智能问答暂未开放，请使用站内「问一问」' } }, 503),
)
app.all('/api/agent/*', (c) =>
  c.json({ error: { code: 'not_available', message: '展内智能问答暂未开放，请使用站内「问一问」' } }, 503),
)
app.all('/api/voice', (c) =>
  c.json({ error: { code: 'not_available', message: '展内语音功能暂未开放' } }, 503),
)
app.all('/api/voice/*', (c) =>
  c.json({ error: { code: 'not_available', message: '展内语音功能暂未开放' } }, 503),
)
app.all('/api/site-content', (c) =>
  c.json({ error: { code: 'not_available', message: '展内内容服务暂未开放' } }, 503),
)

app.all('/api/*', (c) => c.json({ error: { code: 'not_found', message: '接口不存在' } }, 404))

// 英歌原生展的绝对路径资源重写（原站 8787 部署在站点根，挂载到 /exhibits/yingge/ 后需前缀映射）
app.get('/_next/*', serveStatic({ root: './public/exhibits/yingge' }))
app.get('/images/*', serveStatic({ root: './public/exhibits/yingge' }))
app.get('/favicon.*', serveStatic({ root: './public/exhibits/yingge' }))
app.get('/apple-touch-icon.png', serveStatic({ root: './public/exhibits/yingge' }))
app.get('/site.webmanifest', serveStatic({ root: './public/exhibits/yingge' }))

// 静态资源与 SPA fallback（dist/ 由 vite build 生成）
app.use('*', serveStatic({ root: './dist' }))

// 构建产物 hash 变了以后，旧页面来取旧资源要拿到 404，不能回退成 index.html
app.get('/assets/*', (c) => c.text('Not Found', 404))

app.get('*', async (c) => {
  // 带扩展名的静态资源缺失时直接 404，不伪装成 200 HTML
  if (/\.[a-z0-9]+$/i.test(c.req.path)) {
    return c.text('Not Found', 404)
  }
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
  // 只打印模型、上游主机名与是否配置密钥；永远不打印 key 或 Authorization
  console.log(
    `[laoye-baohao] listening on http://${HOST}:${info.port} | model=${llmModel()} | endpoint=${llmBaseHost()} | key=${llmApiKey() ? 'configured' : 'missing'} | entries=${content.entries.length} sources=${content.sources.length}`,
  )
})
