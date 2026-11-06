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
}

export function AgentStage({ busy = false, className = '' }: AgentStageProps) {
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

  return (
    <div
      className={`relative overflow-hidden border-b border-white/10 ${className}`}
      data-agent-stage={mode}
      style={{
        backgroundImage:
          'radial-gradient(120% 90% at 12% 0%, rgba(240,74,58,0.24), transparent 58%), linear-gradient(135deg, rgba(63,80,59,0.62), rgba(36,50,41,0.24))',
      }}
    >
      {/* 装饰线：珊瑚与鹿棕各一道，对应英歌槌的两端 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-3 h-px w-10 bg-coral/60"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-4 bottom-3 h-px w-10 bg-brown/60"
      />

      {/* 3D 挂载点始终保留尺寸，加载成功时淡入覆盖二维形象 */}
      <div
        ref={hostRef}
        className="absolute inset-0 transition-opacity duration-240 ease-exhibit"
        style={{ opacity: mode === '3d' ? 1 : 0 }}
        aria-hidden={mode === '3d' ? undefined : true}
      />

      {mode === '2d' ? (
        <div className="relative flex h-full items-center gap-3 px-4">
          <div className={`relative shrink-0 ${busy ? 'is-busy' : ''}`}>
            <XiaochuiSprite height={96} busy={busy} decorative={false} />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-[13px] font-semibold tracking-wide text-ink">
              英歌小槌
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              只依据本站资料作答，资料不足会直说“不确定”。
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-brown">
              <span aria-hidden="true" className="seal-dot !h-1 !w-1 !bg-brown" />
              {busy ? '正在翻站内资料…' : '按当前页面检索'}
            </p>
          </div>
          {mode === '2d' ? <span className="sr-only">三维形象暂不可用，已回退为二维形象。</span> : null}
        </div>
      ) : null}
    </div>
  )
}

export default AgentStage
