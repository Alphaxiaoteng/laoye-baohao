import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { contextLabel, useAskContextStore } from '../store/askContext'
import { useProgressStore } from '../store/progress'
import { streamAsk, type AskDone, type Citation, type NavSuggestion } from '../lib/askClient'

type Role = 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: Role
  content: string
  citations: Citation[]
  navs: NavSuggestion[]
  uncertain: boolean
  pending: boolean
  error?: { code: string; message: string }
}

const ERROR_TEXT: Record<string, string> = {
  no_key: '本站暂未配置模型密钥，问答功能不可用。你仍可继续浏览，或到「资料来源」页查看原文。',
  busy: '当前提问的人较多，请稍后再试。你仍可继续浏览。',
  rate_limited: '提问有点频繁，请等一分钟再试。你仍可继续浏览。',
  timeout: '暂时无法回答，你仍可继续浏览。',
  upstream: '暂时无法回答，你仍可继续浏览。',
  network: '网络似乎断开了，暂时无法回答。你仍可继续浏览。',
  invalid_question: '问题格式不正确（最多 300 字），请修改后重试。',
}

function errorText(code: string): string {
  return ERROR_TEXT[code] ?? '暂时无法回答，你仍可继续浏览。'
}

let seq = 0
function uid(): string {
  seq += 1
  return `m${Date.now().toString(36)}${seq}`
}

const EXAMPLES = ['这个角色是谁？', '这一步为什么要这样做？', '英歌和营老爷有什么联系？']

/**
 * 全站悬浮"问一问"。
 * 桌面为右侧栏，移动端为底部抽屉；关闭只收起并把焦点还给触发按钮。
 */
export default function AskDrawer() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const ctx = useAskContextStore()
  const label = contextLabel(ctx)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
    return undefined
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streaming])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const patch = useCallback((id: string, updater: (m: ChatMessage) => ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)))
  }, [])

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim().slice(0, 300)
      if (!question || streaming) return

      const history = messages
        .filter((m) => m.content.trim() !== '' && !m.error)
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))

      const assistantId = uid()
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'user',
          content: question,
          citations: [],
          navs: [],
          uncertain: false,
          pending: false,
        },
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          citations: [],
          navs: [],
          uncertain: false,
          pending: true,
        },
      ])
      setInput('')
      setStreaming(true)

      const visited = useProgressStore.getState().entriesVisited.slice(-20)
      const controller = new AbortController()
      abortRef.current = controller

      await streamAsk(
        {
          question,
          context: {
            module: ctx.module,
            entryId: ctx.entryId,
            step: typeof ctx.step === 'number' ? ctx.step : undefined,
            visited,
          },
          history,
        },
        {
          onDelta: (text) => {
            if (!text) return
            patch(assistantId, (m) => ({ ...m, content: m.content + text }))
          },
          onDone: (done: AskDone) => {
            patch(assistantId, (m) => ({
              ...m,
              content: done.text || m.content,
              citations: done.citations,
              navs: done.navs,
              uncertain: done.uncertain,
              pending: false,
            }))
          },
          onError: (code, message) => {
            patch(assistantId, (m) => ({
              ...m,
              pending: false,
              error: { code, message: message || errorText(code) },
            }))
          },
        },
        controller.signal,
      )

      setStreaming(false)
      if (open) setTimeout(() => inputRef.current?.focus(), 20)
    },
    [ctx.entryId, ctx.module, ctx.step, messages, open, patch, streaming],
  )

  function handleClear() {
    if (messages.length === 0) return
    const ok = window.confirm('清空本次对话？清空后无法恢复。')
    if (!ok) return
    abortRef.current?.abort()
    setStreaming(false)
    setMessages([])
  }

  function retryLast() {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    void send(lastUser.content)
  }

  return (
    <>
      {!open ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-ink px-5 py-3 text-cream shadow-card transition-colors hover:bg-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brick"
          aria-expanded={false}
          aria-controls="ask-drawer"
        >
          <span aria-hidden="true">💬</span>
          问一问
        </button>
      ) : null}

      <section
        id="ask-drawer"
        role="dialog"
        aria-modal="false"
        aria-label="问一问：站内文化解释助手"
        className={[
          'fixed z-50 flex flex-col border border-line bg-cream shadow-card',
          'inset-x-0 bottom-0 max-h-[82vh] rounded-t-2xl safe-bottom',
          'md:inset-y-auto md:bottom-4 md:left-auto md:right-4 md:top-20 md:max-h-none md:w-[380px] md:rounded-2xl md:pb-0',
          open ? '' : 'hidden',
        ].join(' ')}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 className="font-serif text-base font-semibold text-ink">问一问 · 文化解释助手</h2>
            <p className="mt-1 text-xs text-muted" aria-live="polite">
              正在了解：{label}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-full px-2 py-1 text-xs text-muted hover:bg-white/70 hover:text-ink"
              onClick={handleClear}
              disabled={messages.length === 0}
            >
              清空
            </button>
            <button
              type="button"
              className="inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full text-lg text-ink-soft hover:bg-white/70 hover:text-ink"
              onClick={() => {
                setOpen(false)
                triggerRef.current?.focus()
              }}
              aria-label="收起问答窗口"
            >
              ✕
            </button>
          </div>
        </header>

        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          aria-live="polite"
          aria-busy={streaming}
        >
          {messages.length === 0 ? (
            <div className="space-y-3 text-sm text-ink-soft">
              <p className="leading-6">
                这里按当前页面给你解释，回答会标注站内来源编号；资料不足时会直接说“不确定”。
              </p>
              <p className="text-xs text-muted">可以这样问（示例）：</p>
              <ul className="flex flex-col gap-2">
                {EXAMPLES.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      className="w-full rounded-xl border border-line bg-white/70 px-3 py-2 text-left text-sm hover:border-brick/50 hover:text-brick"
                      onClick={() => void send(q)}
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {messages.map((m) =>
            m.role === 'user' ? (
              <p
                key={m.id}
                className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-3.5 py-2 text-sm text-cream"
              >
                {m.content}
              </p>
            ) : (
              <div key={m.id} className="max-w-full rounded-2xl rounded-bl-sm border border-line bg-white/80 px-3.5 py-3">
                {m.pending && !m.content ? (
                  <p className="text-sm text-muted">正在查资料…</p>
                ) : null}

                {m.content ? (
                  <p className="whitespace-pre-line text-sm leading-7 text-ink-soft">{m.content}</p>
                ) : null}

                {m.pending && m.content ? (
                  <p className="mt-1 text-xs text-muted" aria-hidden="true">
                    生成中…
                  </p>
                ) : null}

                {m.error ? (
                  <div className="mt-2 space-y-2 text-sm">
                    <p className="text-brick">{errorText(m.error.code)}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" className="btn-secondary !min-h-[36px] !px-3 !text-sm" onClick={retryLast}>
                        重试
                      </button>
                      <Link to="/sources" className="link-inline text-sm">
                        查看资料来源
                      </Link>
                    </div>
                  </div>
                ) : null}

                {!m.pending && !m.error && m.citations.length === 0 && !m.uncertain && m.content ? (
                  <p className="mt-2 text-xs text-amber-800">本回答未找到可引用资料，请谨慎参考。</p>
                ) : null}

                {m.citations.length > 0 ? (
                  <ul className="mt-2 space-y-1 border-t border-line/70 pt-2 text-xs">
                    {m.citations.map((c) => (
                      <li key={c.id}>
                        <span className="mr-1 font-medium text-ink">[{c.id}]</span>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-inline"
                        >
                          {c.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {m.navs.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2 text-xs">
                    {m.navs.map((n) => (
                      <li key={n.entryId}>
                        <Link
                          to={n.path}
                          className="chip no-underline hover:border-brick hover:text-brick"
                        >
                          {n.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ),
          )}
        </div>

        <form
          className="border-t border-line bg-cream/95 px-3 py-3"
          onSubmit={(e) => {
            e.preventDefault()
            void send(input)
          }}
        >
          <label htmlFor="ask-input" className="sr-only">
            输入你的问题，最多 300 字
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id="ask-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 300))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  void send(input)
                }
              }}
              rows={2}
              maxLength={300}
              placeholder="问一个和当前页面有关的问题…"
              className="min-h-[48px] w-full resize-none rounded-xl border border-line bg-white/80 px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-brick/60 focus:outline-none"
            />
            <button type="submit" className="btn-primary !px-4" disabled={streaming || input.trim() === ''}>
              {streaming ? '回答中' : '发送'}
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted">
            <span>回答只依据站内资料；涉及具体年份、地点时会说明资料范围。</span>
            <span>{input.length}/300</span>
          </div>
        </form>
      </section>
    </>
  )
}
