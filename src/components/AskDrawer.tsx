import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { contextLabel, useAskContextStore } from '../store/askContext'
import { useAudioStore } from '../store/audio'
import { useProgressStore } from '../store/progress'
import { streamAsk, type AskClip, type AskDone, type Citation, type NavSuggestion } from '../lib/askClient'
import { AgentStage } from './ask/AgentStage'
import { AskPhraseClip } from './ask/AskPhraseClip'
import { XiaochuiSprite } from './ask/XiaochuiSprite'

type Role = 'user' | 'assistant'

const FAB_MARGIN = 16
const DRAG_THRESHOLD = 4
const POS_KEY = 'laoye:agent-pos'

/**
 * 右下角悬浮球可拖拽：指针到哪就停在哪，松手不回弹、不吸边。
 * 位置用 translate3d 写在元素上，移动过程走 rAF，不改 left/top，避免布局重排。
 * 位移超过 4px 才算拖拽，避免和「点一下打开」冲突；拖拽中挡住背后的点击。
 */
function useDraggableFab() {
  const ref = useRef<HTMLButtonElement | null>(null)
  const posRef = useRef<{ x: number; y: number } | null>(null)
  const customRef = useRef(false)
  const sizeRef = useRef({ w: 72, h: 96 })
  const drag = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    raf: 0,
    nextX: 0,
    nextY: 0,
  })
  const clickGuard = useRef<((event: MouseEvent) => void) | null>(null)
  const [phase, setPhase] = useState<'idle' | 'hold' | 'drag'>('idle')

  const clamp = useCallback((x: number, y: number, w: number, h: number) => {
    const maxX = Math.max(FAB_MARGIN, window.innerWidth - w - FAB_MARGIN)
    const maxY = Math.max(FAB_MARGIN, window.innerHeight - h - FAB_MARGIN)
    return {
      x: Math.min(Math.max(FAB_MARGIN, x), maxX),
      y: Math.min(Math.max(FAB_MARGIN, y), maxY),
    }
  }, [])

  const pinOrigin = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.left = '0px'
    el.style.top = '0px'
    el.style.right = 'auto'
    el.style.bottom = 'auto'
  }, [])

  const writeTransform = useCallback((x: number, y: number) => {
    const el = ref.current
    if (!el) return
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }, [])

  const lockPage = useCallback((locked: boolean) => {
    // 拖拽过程中挡住背后的链接；松手后的 click 还在同一轮事件里，下一拍再放开
    document.body.style.pointerEvents = locked ? 'none' : ''
    document.documentElement.style.cursor = locked ? 'grabbing' : ''
    const el = ref.current
    if (el) el.style.pointerEvents = locked ? 'auto' : ''
  }, [])

  const readSize = useCallback(() => {
    const el = ref.current
    if (!el) return sizeRef.current
    const rect = el.getBoundingClientRect()
    // 抽屉打开时按钮是 sr-only，尺寸会塌成 1px，沿用上次的真实尺寸
    if (rect.width >= 24 && rect.height >= 24) {
      sizeRef.current = { w: rect.width, h: rect.height }
    }
    return sizeRef.current
  }, [])

  useLayoutEffect(() => {
    const { w, h } = readSize()
    let x = window.innerWidth - w - FAB_MARGIN
    let y = window.innerHeight - h - FAB_MARGIN
    try {
      const raw = localStorage.getItem(POS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: number; y?: number }
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          x = parsed.x
          y = parsed.y
          customRef.current = true
        }
      }
    } catch {
      // 本地存储不可用时停在右下角
    }
    const next = clamp(x, y, w, h)
    posRef.current = next
    pinOrigin()
    writeTransform(next.x, next.y)
  }, [clamp, pinOrigin, readSize, writeTransform])

  useEffect(() => {
    function onResize() {
      const { w, h } = readSize()
      const base =
        customRef.current && posRef.current
          ? posRef.current
          : {
              x: window.innerWidth - w - FAB_MARGIN,
              y: window.innerHeight - h - FAB_MARGIN,
            }
      const next = clamp(base.x, base.y, w, h)
      posRef.current = next
      writeTransform(next.x, next.y)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (drag.current.raf) cancelAnimationFrame(drag.current.raf)
      document.body.style.pointerEvents = ''
      document.documentElement.style.cursor = ''
      if (clickGuard.current) {
        document.removeEventListener('click', clickGuard.current, true)
        clickGuard.current = null
      }
    }
  }, [clamp, readSize, writeTransform])

  const finish = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const s = drag.current
      if (!s.active) return
      s.active = false
      if (s.raf) {
        cancelAnimationFrame(s.raf)
        s.raf = 0
      }
      if (s.moved) {
        const next = { x: s.nextX, y: s.nextY }
        posRef.current = next
        writeTransform(next.x, next.y)
        customRef.current = true
        try {
          localStorage.setItem(POS_KEY, JSON.stringify(next))
        } catch {
          // 忽略隐私模式下的写入失败
        }
        const guard = clickGuard.current
        window.setTimeout(() => {
          lockPage(false)
          if (guard) {
            document.removeEventListener('click', guard, true)
            if (clickGuard.current === guard) clickGuard.current = null
          }
          // click 已在这一拍之前处理完，清掉标记，避免键盘再激活时被当成拖拽
          s.moved = false
        }, 0)
      }
      const el = ref.current
      if (el?.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId)
      }
      setPhase('idle')
    },
    [lockPage, writeTransform],
  )

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    const el = ref.current
    if (!el) return
    event.stopPropagation()
    const { w, h } = readSize()
    const origin = posRef.current ?? {
      x: window.innerWidth - w - FAB_MARGIN,
      y: window.innerHeight - h - FAB_MARGIN,
    }
    drag.current.active = true
    drag.current.moved = false
    drag.current.startX = event.clientX
    drag.current.startY = event.clientY
    drag.current.originX = origin.x
    drag.current.originY = origin.y
    drag.current.nextX = origin.x
    drag.current.nextY = origin.y
    el.setPointerCapture(event.pointerId)
    setPhase('hold')
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const s = drag.current
    if (!s.active) return
    const dx = event.clientX - s.startX
    const dy = event.clientY - s.startY
    if (!s.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      s.moved = true
      lockPage(true)
      if (!clickGuard.current) {
        const guard = (clickEvent: MouseEvent) => {
          if (!drag.current.moved) return
          clickEvent.preventDefault()
          clickEvent.stopPropagation()
        }
        clickGuard.current = guard
        document.addEventListener('click', guard, true)
      }
      setPhase('drag')
    }
    event.preventDefault()
    const { w, h } = sizeRef.current
    const next = clamp(s.originX + dx, s.originY + dy, w, h)
    s.nextX = next.x
    s.nextY = next.y
    if (s.raf) return
    s.raf = requestAnimationFrame(() => {
      s.raf = 0
      posRef.current = { x: s.nextX, y: s.nextY }
      writeTransform(s.nextX, s.nextY)
    })
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    finish(event)
  }

  return {
    ref,
    dragging: phase !== 'idle',
    blocking: phase === 'drag',
    moved: () => drag.current.moved,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
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
  /** 对上的听潮录音；只在回答到达且抽屉仍开着时自动播一次 */
  clip?: AskClip
  autoplay?: boolean
  error?: { code: string; message: string }
}

const ERROR_TEXT: Record<string, string> = {
  no_key: '本站暂未配置模型密钥，问答功能不可用。你仍可继续浏览，或到「历史介绍」页阅读站内条目。',
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
 * 桌面与窄屏均为右侧通高栏（窄屏全宽），打开时全屏遮罩压暗页面并锁定滚动；关闭收起并把焦点还给触发按钮。
 */
export default function AskDrawer() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const [examples, setExamples] = useState<string[]>(() => exampleQuestions(useAskContextStore.getState()))

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  /** 清空后递增。飞回来的回答对不上这一轮就丢掉，避免写回已清掉的记录。 */
  const epochRef = useRef(0)
  const fab = useDraggableFab()
  const setFabNode = useCallback((node: HTMLButtonElement | null) => {
    triggerRef.current = node
    fab.ref.current = node
  }, [fab.ref])

  const ctx = useAskContextStore()
  const label = contextLabel(ctx)
  const stopAudio = useAudioStore((s) => s.stop)
  const openRef = useRef(false)
  openRef.current = open

  const close = useCallback(() => {
    // 收起抽屉时停掉正在播的听潮录音，避免后台继续发声
    stopAudio()
    setOpen(false)
    // 等按钮重新可见后再还焦点，保证键盘用户不会丢失位置
    setTimeout(() => triggerRef.current?.focus(), 0)
  }, [stopAudio])

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
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, open])

  useEffect(() => {
    if (!open) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  // 专注模式：打开时在根节点打标，让顶栏与主内容一起变暗退后；关闭或卸载时清除
  useEffect(() => {
    if (!open) return undefined
    const root = document.documentElement
    root.setAttribute('data-agent-focus', 'true')
    return () => root.removeAttribute('data-agent-focus')
  }, [open])

  // 每次打开按当前页重算建议问题。不改 messages，关掉再开对话还在。
  const openDrawer = useCallback(() => {
    setExamples(exampleQuestions(useAskContextStore.getState()))
    setOpen(true)
  }, [])

  // 顶栏潮Bot与页面内入口都通过同一个事件唤起抽屉，不额外引入全局 store
  useEffect(() => {
    const onOpen = () => openDrawer()
    window.addEventListener('laoye:ask-open', onOpen)
    return () => window.removeEventListener('laoye:ask-open', onOpen)
  }, [openDrawer])

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

      const epoch = epochRef.current
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
            if (epochRef.current !== epoch || !text) return
            patch(assistantId, (m) => ({ ...m, content: m.content + text }))
          },
          onDone: (done: AskDone) => {
            if (epochRef.current !== epoch) return
            patch(assistantId, (m) => ({
              ...m,
              content: done.text || m.content,
              citations: done.citations,
              navs: done.navs,
              uncertain: done.uncertain,
              direct: done.direct === true,
              clarify: done.clarify === true,
              clip: done.clip,
              autoplay: Boolean(done.clip) && openRef.current,
              pending: false,
            }))
          },
          onError: (code, message) => {
            if (epochRef.current !== epoch) return
            patch(assistantId, (m) => ({
              ...m,
              pending: false,
              error: { code, message: message || errorText(code) },
            }))
          },
        },
        controller.signal,
      )

      if (epochRef.current !== epoch) return
      setStreaming(false)
      if (open) setTimeout(() => inputRef.current?.focus(), 20)
    },
    [messages, open, patch, streaming],
  )

  function handleClear() {
    if (messages.length === 0) return
    const ok = window.confirm('清空本次对话？清空后无法恢复。')
    if (!ok) return
    epochRef.current += 1
    abortRef.current?.abort()
    stopAudio()
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

  const placeholder = ctx.entryTitle
    ? `问一个和「${ctx.entryTitle}」有关的问题…`
    : '问一个和当前页面有关的问题…'

  return (
    <>
      {fab.blocking ? (
        <div
          className="fixed inset-0 z-[39] cursor-grabbing"
          style={{ touchAction: 'none' }}
          aria-hidden="true"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        />
      ) : null}
      <button
        ref={setFabNode}
        type="button"
        onPointerDown={fab.onPointerDown}
        onPointerMove={fab.onPointerMove}
        onPointerUp={fab.onPointerUp}
        onPointerCancel={fab.onPointerUp}
        onDragStart={(event) => event.preventDefault()}
        onClick={(event) => {
          if (fab.moved()) {
            event.preventDefault()
            event.stopPropagation()
            return
          }
          openDrawer()
        }}
        style={{ touchAction: 'none' }}
        className={
          open
            ? 'sr-only'
            : [
                'agent-fab group fixed bottom-4 right-4 z-40 inline-flex select-none items-center rounded-full p-0',
                fab.dragging ? 'is-dragging' : '',
                streaming ? 'is-busy' : '',
              ].join(' ')
        }
        aria-expanded={open}
        aria-controls="ask-drawer"
        tabIndex={open ? -1 : undefined}
        title="按住可拖动，松手停在原地"
      >
        <XiaochuiSprite height={92} busy={streaming} decorative />
      </button>

      {open ? (
        <button
          type="button"
          className="agent-panel-backdrop fixed inset-0 z-[99] cursor-default border-0 p-0"
          aria-label="关闭潮Bot"
          onClick={close}
        />
      ) : null}

      <section
        id="ask-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="潮Bot：问一问"
        className={[
          'agent-panel fixed top-0 right-0 z-[100] flex h-[100dvh] max-h-[100dvh] w-full max-w-none flex-col overflow-hidden sm:max-w-[500px] lg:max-w-[540px] safe-bottom',
          open ? '' : 'hidden',
        ].join(' ')}
      >
        <div className="flex shrink-0 flex-col border-b border-line">
          <header className="flex items-center gap-2 px-3 py-2">
            <AgentStage busy={streaming} compact className="min-w-0 flex-1" />
            <span className="focus-chip hidden shrink-0 items-center gap-1.5 rounded-full border border-ink/25 px-2.5 py-0.5 font-serif text-[11px] leading-5 tracking-[0.08em] text-ink-soft sm:inline-flex">
              <span aria-hidden="true" className="seal-dot !h-1 !w-1" />
              专注问答
            </span>
            <button
              type="button"
              className="inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-full text-lg text-ink transition-colors duration-200 ease-exhibit hover:bg-hover hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
              onClick={close}
              aria-label="关闭潮Bot"
            >
              ✕
            </button>
          </header>
          <div
            role="tablist"
            aria-label="潮Bot 视图"
            className="flex flex-wrap items-center gap-1 border-t border-line px-2 py-1.5"
          >
            <button
              type="button"
              role="tab"
              id="agent-tab-ask"
              aria-selected="true"
              aria-controls="agent-panel-ask"
              className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-pressed px-2.5 font-serif text-[12px] text-ink"
            >
              <span aria-hidden="true" className="seal-dot !h-1.5 !w-1.5" />
              问一问
            </button>
          </div>
        </div>

        <p
          className="shrink-0 truncate border-b border-line px-3 py-1 text-[10px] leading-tight text-ink-soft"
          aria-live="polite"
          title={label}
        >
          正在了解：{label}
        </p>

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
                    className="agent-bubble max-w-full rounded-[16px] rounded-bl-[4px] border border-ink/30 bg-[var(--paper)] px-3.5 py-3 text-ink"
                  >
                    {m.pending && !m.content ? (
                      <p className="text-sm text-ink">正在查站内资料…</p>
                    ) : null}

                    {m.content ? (
                      <p className="agent-answer whitespace-pre-line text-sm leading-7 text-ink">{m.content.replace(/\s*\[(?:S|W)\d+\]/g, '')}</p>
                    ) : null}

                    {!m.pending && m.clip ? (
                      <AskPhraseClip messageId={m.id} clip={m.clip} autoplay={m.autoplay === true} />
                    ) : null}

                    {m.pending && m.content ? (
                      <p className="mt-1 text-xs text-ink-soft" aria-hidden="true">
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
                          <Link to="/docs" className="link-inline text-sm">
                            阅读历史介绍
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
                      <p className="mt-1.5 text-[10px] leading-tight text-brown">
                        本回答未找到可引用资料，请谨慎参考。
                      </p>
                    ) : null}

                    {!m.pending && !m.error && !m.direct && !m.clarify && m.content ? (
                      <button
                        type="button"
                        className="btn-quiet mt-2 !min-h-[44px] !px-2 !text-xs text-ink"
                        onClick={() =>
                          void send('请把上一条回答再展开说明，仍然只依据站内资料。')
                        }
                        disabled={streaming}
                      >
                        再详细一点
                      </button>
                    ) : null}

                    {m.navs.length > 0 ? (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-ink">
                          {m.clarify ? '请选择你想问的条目' : '可以继续看'}
                        </p>
                        <ul className="mt-1 flex flex-wrap gap-2 text-xs">
                          {m.navs.map((n) => (
                            <li key={`${n.entryId}-${n.path}`}>
                              <Link
                                to={n.path}
                                className="chip no-underline border-ink/40 bg-[var(--paper-surface)] text-ink hover:border-brick hover:text-brick"
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

            <div className="agent-composer shrink-0 border-t border-line px-3 pb-3 pt-2">
              <p className="text-[11px] leading-snug text-ink-soft">
                按当前页资料回答，不足会说「不确定」。
              </p>
              <div className="agent-suggest" role="group" aria-label="建议问题">
                {examples.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="agent-prompt min-h-[36px] rounded-control border border-ink/30 bg-[var(--paper)] px-3 py-1.5 text-left text-[12px] leading-snug text-ink transition-colors duration-200 ease-exhibit hover:border-coral/45 hover:bg-hover hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                    title={q}
                    onClick={() => void send(q)}
                    disabled={streaming}
                  >
                    {q}
                  </button>
                ))}
              </div>
            <form
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
                  className="min-h-[48px] min-w-0 flex-1 resize-none rounded-[12px] border border-line bg-cream px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-coral/70 focus:outline-none"
                />
                <button
                  type="submit"
                  className="btn-primary shrink-0 whitespace-nowrap !px-4"
                  disabled={streaming || input.trim() === ''}
                >
                  {streaming ? '回答中' : '发送'}
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-ink-soft">
                <button
                  type="button"
                  className="agent-clear"
                  onClick={handleClear}
                  disabled={messages.length === 0}
                >
                  清空
                </button>
                <span>{input.length}/300</span>
              </div>
            </form>
            </div>
          </div>
      </section>
    </>
  )
}
