import { create } from 'zustand'

/**
 * 听潮播放器：全局单例状态。
 * 真正的 <audio> 元素由 AudioPlayerProvider 注入（AudioSink），
 * 这里只维护"谁在播 / 谁失败"，因此可以在无 DOM 的测试里验证单例行为。
 */
export interface AudioSink {
  play: (file: string) => Promise<void> | void
  stop: () => void
}

let sink: AudioSink | null = null

export function attachAudioSink(next: AudioSink | null): void {
  sink = next
}

export interface AudioState {
  playingId: string | null
  currentFile: string | null
  failedId: string | null
  /** 播放某条词句；file 为空表示未取得授权录音，直接拒绝播放 */
  requestPlay: (id: string, file?: string | null) => Promise<boolean>
  stop: () => void
  handleEnded: (id?: string) => void
  handleError: (id?: string) => void
  retry: (id: string, file?: string | null) => Promise<boolean>
}

export const useAudioStore = create<AudioState>((set, get) => ({
  playingId: null,
  currentFile: null,
  failedId: null,
  requestPlay: async (id, file) => {
    const src = (file ?? '').trim()
    if (!id || !src) return false
    // 单例：先停掉上一条，再起新的
    if (get().playingId || get().currentFile) {
      try {
        sink?.stop()
      } catch {
        /* 忽略元素状态异常 */
      }
    }
    set({ playingId: id, currentFile: src, failedId: null })
    try {
      await sink?.play(src)
      return true
    } catch {
      if (get().playingId === id) {
        set({ playingId: null, currentFile: null, failedId: id })
      }
      return false
    }
  },
  stop: () => {
    try {
      sink?.stop()
    } catch {
      /* 忽略 */
    }
    set({ playingId: null, currentFile: null })
  },
  handleEnded: (id) => {
    const current = get().playingId
    if (!current) return
    if (id && id !== current) return
    set({ playingId: null, currentFile: null })
  },
  handleError: (id) => {
    const current = get().playingId
    if (id && current && id !== current) return
    try {
      sink?.stop()
    } catch {
      /* 忽略 */
    }
    set({ playingId: null, currentFile: null, failedId: id ?? current })
  },
  retry: async (id, file) => {
    set({ failedId: null })
    return get().requestPlay(id, file)
  },
}))

/** 页面切换时停止播放（路由变化由 Provider 触发） */
export function stopAudioOnNavigate(): void {
  const state = useAudioStore.getState()
  if (state.playingId || state.currentFile) state.stop()
}
