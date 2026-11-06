import { useEffect, useRef, useState } from 'react'
import { XiaochuiSprite } from './XiaochuiSprite'

/**
 * 面板顶部的形象槽位。
 *
 * 现在渲染自绘的英歌二维形象；本地 3D API 准备好后，只要在页面注入：
 *
 *   window.LaoyeAgent3D = (host) => {
 *     // 把 canvas / WebGL 挂到 host 里，返回 { dispose } 供卸载时回收
 *     return { dispose() { ... } }
 *   }
 *
 * 挂载失败、超时（5s）或容器里没有实际内容时，自动回退到二维形象，
 * 不影响抽屉的提问、流式回答与焦点逻辑。
 */
export interface AgentStage3DHandle {
  dispose?: () => void
}

export type AgentStage3DMount = (
  host: HTMLElement,
) => AgentStage3DHandle | void | Promise<AgentStage3DHandle | void>

declare global {
  interface Window {
    LaoyeAgent3D?: AgentStage3DMount
  }
}

const MOUNT_TIMEOUT_MS = 5_000

export interface AgentStageProps {
  /** 正在检索/生成时给出状态文案，纯展示，不参与请求 */
  busy?: boolean
  className?: string
  /** 抽屉顶栏极简：只显示头像与「潮Bot」，长说明放到消息区 */
  compact?: boolean
}

export function AgentStage({ busy = false, className = '', compact = false }: AgentStageProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [mode, setMode] = useState<'2d' | '3d'>('2d')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const mount = typeof window === 'undefined' ? undefined : window.LaoyeAgent3D
    if (typeof mount !== 'function') return undefined

    let disposed = false
    let handle: AgentStage3DHandle | null = null
    const timer = window.setTimeout(() => {
      if (!disposed) setMode('2d')
    }, MOUNT_TIMEOUT_MS)

    void (async () => {
      try {
        handle = (await mount(host)) ?? null
        if (disposed) {
          handle?.dispose?.()
          return
        }
        window.clearTimeout(timer)
        // 空容器说明 3D 没有真正挂上，按失败处理
        if (host.childElementCount > 0) setMode('3d')
      } catch {
        if (!disposed) setMode('2d')
      }
    })()

    return () => {
      disposed = true
      window.clearTimeout(timer)
      handle?.dispose?.()
    }
  }, [])

  if (compact) {
    return (
      <div className={`relative flex min-h-0 min-w-0 flex-1 items-center gap-2 ${className}`} data-agent-stage={mode}>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line bg-cream/50">
          <div
            ref={hostRef}
            className="absolute inset-0 transition-opacity duration-240 ease-exhibit"
            style={{ opacity: mode === '3d' ? 1 : 0 }}
            aria-hidden={mode === '3d' ? undefined : true}
          />
          {mode === '2d' ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className={`relative scale-[0.92] ${busy ? 'is-busy' : ''}`}>
                <XiaochuiSprite height={40} busy={busy} decorative={false} />
              </div>
            </div>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-sm font-semibold leading-tight text-ink">潮Bot</p>
          {busy ? (
            <p className="mt-0.5 truncate text-[10px] leading-tight text-muted">正在翻站内资料…</p>
          ) : null}
        </div>
        {mode === '2d' ? (
          <span className="sr-only">
            潮Bot · 只依据本站资料作答，资料不足会直说「不确定」。按当前页面检索。三维形象暂不可用，已回退为二维形象。
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={`relative flex min-h-0 min-w-0 flex-1 items-center gap-2 ${className}`}
      data-agent-stage={mode}
    >
      {/* 顶栏左侧小头像槽位；3D 就绪后覆盖在同尺寸区域内 */}
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-line bg-cream/50">
        <div
          ref={hostRef}
          className="absolute inset-0 transition-opacity duration-240 ease-exhibit"
          style={{ opacity: mode === '3d' ? 1 : 0 }}
          aria-hidden={mode === '3d' ? undefined : true}
        />
        {mode === '2d' ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className={`relative ${busy ? 'is-busy' : ''}`}>
              <XiaochuiSprite height={44} busy={busy} decorative={false} />
            </div>
          </div>
        ) : null}
      </div>

      <p
        className="min-w-0 flex-1 truncate text-[11px] leading-snug text-muted"
        title={
          busy ? '正在翻站内资料…' : '潮Bot · 只依据本站资料作答，资料不足会直说「不确定」。按当前页面检索。'
        }
      >
        <span className="font-serif font-semibold text-ink">潮Bot</span>
        <span aria-hidden="true"> · </span>
        {busy ? <span>正在翻站内资料…</span> : <>只依据本站资料作答，不足会说「不确定」；按当前页面检索。</>}
      </p>
      {mode === '2d' ? (
        <span className="sr-only">三维形象暂不可用，已回退为二维形象。</span>
      ) : null}
    </div>
  )
}

export default AgentStage
