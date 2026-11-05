/**
 * 本地存储封装：读写一律 try/catch。
 * 隐私模式 / 存储被禁用时降级为内存存储，并通过订阅把提示交给界面。
 */
const memory = new Map<string, string>()

type Listener = (available: boolean, reason: string) => void

const listeners = new Set<Listener>()

let available: boolean | null = null
let reason = ''

function probe(): boolean {
  if (available !== null) return available
  try {
    const key = '__laoye_probe__'
    window.localStorage.setItem(key, '1')
    window.localStorage.removeItem(key)
    available = true
  } catch (err) {
    available = false
    reason = err instanceof Error ? err.message : '浏览器本地存储不可用'
  }
  return available
}

export function storageAvailable(): boolean {
  if (typeof window === 'undefined') return false
  return probe()
}

export function storageReason(): string {
  return reason
}

export function onStorageFallback(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyFallback(): void {
  for (const listener of listeners) {
    try {
      listener(false, reason)
    } catch {
      /* 单个监听器异常不影响其他 */
    }
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw =
      typeof window !== 'undefined' && probe()
        ? window.localStorage.getItem(key)
        : (memory.get(key) ?? null)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    return parsed ?? fallback
  } catch {
    notifyFallback()
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): void {
  const payload = JSON.stringify(value)
  try {
    if (typeof window !== 'undefined' && probe()) {
      window.localStorage.setItem(key, payload)
      return
    }
  } catch {
    available = false
    reason = '写入本地存储失败'
    notifyFallback()
  }
  memory.set(key, payload)
}

export function removeKey(key: string): void {
  try {
    if (typeof window !== 'undefined' && probe()) window.localStorage.removeItem(key)
  } catch {
    notifyFallback()
  }
  memory.delete(key)
}

/** 测试用：重置探测结果 */
export function __resetStorageProbe(): void {
  available = null
  reason = ''
  memory.clear()
}
