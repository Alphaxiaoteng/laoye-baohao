import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { contextLabel, useAskContextStore } from '../store/askContext'
import { useAudioStore } from '../store/audio'
import { useProgressStore } from '../store/progress'
import { streamAsk, type AskDone, type Citation, type NavSuggestion } from '../lib/askClient'
import { ListenAgentPanel } from '../features/listen/ListenAgentPanel'
import { AgentStage } from './ask/AgentStage'
import { XiaochuiSprite } from './ask/XiaochuiSprite'

type Role = 'user' | 'assistant'

/** 抽屉里的两个视图：问一问（问答）/ 听潮（真实录音词句） */
type AgentTab = 'ask' | 'listen'

const FAB_MARGIN = 16

/**
 * 右下角悬浮球可拖拽：拖到哪停哪，松手吸附到最近的左右边缘，位置记在本地。
 * 只在指针移动超过 4px 时才算拖拽，避免和「点一下打开」冲突。
 */
function useDraggableFab() {
  const ref = useRef<HTMLButtonElement | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const state = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    width: 0,
    height: 0,
  })

  const clamp = useCallback((x: number, y: number) => {
    const w = state.current.width || 150
    const h = state.current.height || 56
    const maxX = Math.max(FAB_MARGIN, window.innerWidth - w - FAB_MARGIN)
    const maxY = Math.max(FAB_MARGIN, window.innerHeight - h - FAB_MARGIN)
    return {
      x: Math.min(Math.max(FAB_MARGIN, x), maxX),
      y: Math.min(Math.max(FAB_MARGIN, y), maxY),
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('laoye:agent-pos')
      if (!raw) return
      const parsed = JSON.parse(raw) as { x?: number; y?: number }
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        setPos(clamp(parsed.x, parsed.y))
      }
    } catch {
      // 本地存储不可用时退回默认右下角
    }
  }, [clamp])

  useEffect(() => {
    function onResize() {
      setPos((current) => (current ? clamp(current.x, current.y) : current))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clamp])

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    state.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      width: rect.width,
      height: rect.height,
    }
    el.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const s = state.current
    if (!s.active) return
    const dx = event.clientX - s.startX
    const dy = event.clientY - s.startY
    if (!s.moved && Math.hypot(dx, dy) < 4) return
    s.moved = true
    setPos(clamp(s.originX + dx, s.originY + dy))
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const s = state.current
    if (!s.active) return
    s.active = false
    ref.current?.releasePointerCapture(event.pointerId)
    setDragging(false)
    if (!s.moved) return
    // 吸附到最近的左右边缘
    setPos((current) => {
      if (!current) return current
      const center = current.x + s.width / 2
      const snappedX =
        center < window.innerWidth / 2
          ? FAB_MARGIN
          : window.innerWidth - s.width - FAB_MARGIN
      const next = clamp(snappedX, current.y)
      try {
        localStorage.setItem('laoye:agent-pos', JSON.stringify(next))
      } catch {
        // 忽略隐私模式下的写入失败
      }
      return next
    })
  }

  return { ref, pos, dragging, moved: () => state.current.moved, onPointerDown, onPointerMove, onPointerUp }
}

interface ChatMessage {
  id: string
  role: Role
  content: string
  citations: Citation[]
  navs: NavSuggestion[]
  uncertain: boolean
  pending: boolean
  direct?: boolean
  clarify?: boolean
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

function exampleQuestions(ctx: { entryTitle?: string; step?: number }): string[] {
  if (typeof ctx.step === 'number' && ctx.step > 0) {
    return ['这一步为什么要这样做？', '这一步和整个流程是什么关系？', '这个条目还有哪些相关条目？']
  }
  if (ctx.entryTitle) {
    return ['这个条目主要讲了什么？', '它和别的模块有什么联系？', '相关条目在哪里看？']
  }
  return ['工夫茶和英歌有什么联系？', '营老爷一般在什么时候？', '我刚才看过哪些条目？']
}

/**
 * 全站悬浮「问一问」：上下文知识问答。
 * 桌面为右侧栏，移动端为底部抽屉；关闭只是收起，并把焦点还给触发按钮。
 */
export default function AskDrawer() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<AgentTab>('ask')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const fab = useDraggableFab()

  const ctx = useAskContextStore()
  const label = contextLabel(ctx)
  const stopAudio = useAudioStore((s) => s.stop)

  const close = useCallback(() => {
    // 收起抽屉时同时停掉听潮音频，避免后台继续发声
    stopAudio()
    setOpen(false)
    // 等按钮重新可见后再还焦点，保证键盘用户不会丢失位置
    setTimeout(() => triggerRef.current?.focus(), 0)
  }, [stopAudio])

  // 切视图先停音频：听潮播放时不占用问答输入（问答表单在听潮视图下收起）
  const switchTab = useCallback(
    (next: AgentTab) => {
      stopAudio()
      setTab(next)
    },
    [stopAudio],
  )

  useEffect(() => {
    if (open && tab === 'ask') {
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
    return undefined
  }, [open, tab])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, open])

  // 顶栏「问一问」与页面内入口都通过同一个事件唤起抽屉，不额外引入全局 store
  // 事件可带 detail.tab（'ask' | 'listen'），默认打开问答视图
  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ tab?: AgentTab }>).detail
      if (detail?.tab === 'listen') {
        stopAudio()
        setTab('listen')
      } else {
        setTab('ask')
      }
      setOpen(true)
    }
    window.addEventListener('laoye:ask-open', onOpen)
    return () => window.removeEventListener('laoye:ask-open', onOpen)
  }, [stopAudio])

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
        .filter((m) => !m.pending && !m.error && m.content.trim() !== '')
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))

      // 发送那一刻再取上下文，避免用户切页后仍用上一页的旧值
      const latest = useAskContextStore.getState()

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
            module: latest.module,
            entryId: latest.entryId,
            step: typeof latest.step === 'number' ? latest.step : undefined,
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
              direct: done.direct === true,
              clarify: done.clarify === true,
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
    [messages, open, patch, streaming],
  )

  function handleClear() {
    if (messages.length === 0) return
    const ok = window.confirm('清空本次对话？清空后无法恢复。')
    if (!ok) return
    abortRef.current?.abort()
    setStreaming(false)
    setMessages([])
    setTimeout(() => inputRef.current?.focus(), 20)
  }

  function retryLast() {
    if (streaming) return
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return
    void send(lastUser.content)
  }

  const examples = exampleQuestions(ctx)
  const placeholder = ctx.entryTitle
    ? `问一个和「${ctx.entryTitle}」有关的问题…`
    : '问一个和当前页面有关的问题…'

  return (
    <>
      <button
        ref={(node) => {
          triggerRef.current = node
          fab.ref.current = node
        }}
        type="button"
        onPointerDown={fab.onPointerDown}
        onPointerMove={fab.onPointerMove}
        onPointerUp={fab.onPointerUp}
        onPointerCancel={fab.onPointerUp}
        onClick={() => {
          if (fab.moved()) return
          switchTab('ask')
          setOpen(true)
        }}
        style={
          fab.pos
            ? { left: fab.pos.x, top: fab.pos.y, right: 'auto', bottom: 'auto', touchAction: 'none' }
            : { touchAction: 'none' }
        }
        className={
          open
            ? 'sr-only'
            : [
                'agent-fab group fixed bottom-4 right-4 z-40 inline-flex cursor-grab items-center rounded-full p-0 transition-transform duration-200 ease-exhibit hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                fab.dragging ? 'is-dragging cursor-grabbing' : '',
                streaming ? 'is-busy' : '',
              ].join(' ')
        }
        aria-expanded={open}
        aria-controls="ask-drawer"
        tabIndex={open ? -1 : undefined}
        title="按住可拖动，松手吸附到边缘"
      >
        <XiaochuiSprite height={92} busy={streaming} decorative />
      </button>

      <section
        id="ask-drawer"
        role="dialog"
        aria-modal="false"
        aria-label="老爷保号 Agent：问一问与听潮"
        className={[
          'glass agent-panel fixed z-50 flex flex-col overflow-hidden',
          'inset-x-0 bottom-0 max-h-[88vh] rounded-t-[24px] safe-bottom',
          'md:inset-y-auto md:bottom-4 md:left-auto md:right-4 md:top-[84px] md:max-h-[calc(100vh-104px)] md:w-[392px] md:rounded-[24px] md:pb-0',
          tab === 'listen' ? 'h-[84vh] md:h-[min(680px,calc(100vh-104px))]' : '',
          open ? '' : 'hidden',
        ].join(' ')}
      >
        {/* 顶部形象槽位：现在放自绘二维英歌形象，3D 就绪后在这里挂载。
            听潮视图不显示「按当前页面检索」文案，换成紧凑标签栏。 */}
        {tab === 'ask' ? (
          <AgentStage busy={streaming} className="h-[104px] shrink-0 md:h-[124px]" />
        ) : null}

        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
          <div role="tablist" aria-label="Agent 视图" className="flex min-w-0 items-center gap-1">
            {(
              [
                { id: 'ask', label: '问一问' },
                { id: 'listen', label: '听潮' },
              ] as { id: AgentTab; label: string }[]
            ).map((entry) => {
              const current = tab === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  id={`agent-tab-${entry.id}`}
                  aria-selected={current}
                  aria-controls={`agent-panel-${entry.id}`}
                  onClick={() => switchTab(entry.id)}
                  className={[
                    'inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 font-serif text-[13px] transition-colors duration-200 ease-exhibit',
                    current
                      ? 'bg-white/[0.13] text-ink'
                      : 'text-muted hover:bg-white/[0.06] hover:text-ink',
                  ].join(' ')}
                >
                  {current ? <span aria-hidden="true" className="seal-dot !h-1.5 !w-1.5" /> : null}
                  {entry.label}
                </button>
              )
            })}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {tab === 'ask' ? (
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center rounded-full px-2.5 text-xs text-muted transition-colors duration-200 ease-exhibit hover:bg-white/[0.08] hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                onClick={handleClear}
                disabled={messages.length === 0}
              >
                清空
              </button>
            ) : null}
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-lg text-muted transition-colors duration-200 ease-exhibit hover:bg-white/[0.08] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
              onClick={close}
              aria-label="收起窗口"
            >
              ✕
            </button>
          </div>
        </header>

        {tab === 'ask' ? (
          <p
            className="shrink-0 truncate border-b border-white/[0.06] px-4 py-1.5 text-[11px] text-muted"
            aria-live="polite"
            title={label}
          >
            正在了解：{label}
          </p>
        ) : null}

        {tab === 'listen' ? (
          <div
            role="tabpanel"
            id="agent-panel-listen"
            aria-labelledby="agent-tab-listen"
            className="flex min-h-0 flex-1 flex-col"
          >
            <ListenAgentPanel />
          </div>
        ) : null}

        {tab === 'ask' ? (
          <div
            role="tabpanel"
            id="agent-panel-ask"
            aria-labelledby="agent-tab-ask"
            className="flex min-h-0 flex-1 flex-col"
          >
            <div
              ref={listRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
              aria-live="polite"
              aria-busy={streaming}
            >
              {messages.length === 0 ? (
                <div className="space-y-3 text-sm text-ink-soft">
                  <p className="leading-6">
                    这里按当前页面检索站内资料作答，事实句会标出来源编号；资料不足时会直接说“不确定”。
                  </p>
                  <p className="text-xs text-muted">可以这样问（示例）：</p>
                  <ul className="flex flex-col gap-2">
                    {examples.map((q) => (
                      <li key={q}>
                        <button
                          type="button"
                          className="w-full rounded-[12px] border border-white/12 bg-white/[0.04] px-3 py-2.5 text-left text-sm transition-colors duration-200 ease-exhibit hover:border-coral/55 hover:bg-white/[0.07] hover:text-ink"
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
                    className="ml-auto w-fit max-w-[85%] whitespace-pre-line rounded-[16px] rounded-br-[4px] bg-coral px-3.5 py-2 text-sm leading-6 text-white shadow-[0_10px_24px_rgba(240,74,58,0.22)]"
                  >
                    {m.content}
                  </p>
                ) : (
                  <div
                    key={m.id}
                    className="max-w-full rounded-[16px] rounded-bl-[4px] border border-white/12 bg-white/[0.055] px-3.5 py-3"
                  >
                    {m.pending && !m.content ? (
                      <p className="text-sm text-muted">正在查站内资料…</p>
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
                          <button
                            type="button"
                            className="btn-secondary !min-h-[44px] !px-3 !text-sm"
                            onClick={retryLast}
                            disabled={streaming}
                          >
                            重试
                          </button>
                          <Link to="/sources" className="link-inline text-sm">
                            查看资料来源
                          </Link>
                        </div>
                      </div>
                    ) : null}

                    {!m.pending &&
                    !m.error &&
                    !m.direct &&
                    !m.clarify &&
                    m.citations.length === 0 &&
                    !m.uncertain &&
                    m.content ? (
                      <p className="mt-2 text-xs text-brown">本回答未找到可引用资料，请谨慎参考。</p>
                    ) : null}

                    {!m.pending && !m.error && !m.direct && !m.clarify && m.content ? (
                      <button
                        type="button"
                        className="btn-quiet mt-2 !min-h-[44px] !px-2 !text-xs"
                        onClick={() =>
                          void send('请把上一条回答再展开说明，仍然只依据站内资料。')
                        }
                        disabled={streaming}
                      >
                        再详细一点
                      </button>
                    ) : null}

                    {m.citations.length > 0 ? (
                      <div className="mt-2 border-t border-white/10 pt-2">
                        <p className="text-xs font-medium text-muted">参考来源</p>
                        <ul className="mt-1 space-y-1 text-xs">
                          {m.citations.map((c) => (
                            <li key={c.id} className="flex gap-1.5 leading-6">
                              <span className="shrink-0 font-medium text-ink">[{c.id}]</span>
                              {c.url ? (
                                <a
                                  href={c.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="link-inline min-w-0 break-words [overflow-wrap:anywhere]"
                                >
                                  {c.title}
                                </a>
                              ) : (
                                <span className="min-w-0 break-words text-ink-soft [overflow-wrap:anywhere]">
                                  {c.title}（站内登记，暂无链接）
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {m.navs.length > 0 ? (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-muted">
                          {m.clarify ? '请选择你想问的条目' : '可以继续看'}
                        </p>
                        <ul className="mt-1 flex flex-wrap gap-2 text-xs">
                          {m.navs.map((n) => (
                            <li key={`${n.entryId}-${n.path}`}>
                              <Link
                                to={n.path}
                                className="chip no-underline hover:border-brick hover:text-brick"
                              >
                                {n.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ),
              )}
            </div>

            <form
              className="border-t border-white/10 bg-deep/70 px-3 py-3 backdrop-blur"
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
                  placeholder={placeholder}
                  className="min-h-[48px] min-w-0 flex-1 resize-none rounded-[12px] border border-white/14 bg-white/[0.06] px-3 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-coral/70 focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-primary shrink-0 whitespace-nowrap !px-4"
                  disabled={streaming || input.trim() === ''}
                >
                  {streaming ? '回答中' : '发送'}
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted">
                <span>只依据当前页面与站内资料；检索不到时会说“不确定”。</span>
                <span>{input.length}/300</span>
              </div>
            </form>
          </div>
        ) : null}
      </section>
    </>
  )
}
