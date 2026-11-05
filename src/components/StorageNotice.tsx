import { useEffect, useState } from 'react'
import { onStorageFallback, storageAvailable } from '../lib/storage'

/**
 * 本地存储不可用（隐私模式等）时的提示条。
 * 降级后功能仍可用，只是刷新页面会丢进度。
 */
export default function StorageNotice() {
  const [unavailable, setUnavailable] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setUnavailable(!storageAvailable())
    return onStorageFallback(() => setUnavailable(true))
  }, [])

  if (!unavailable || dismissed) return null

  return (
    <div
      role="status"
      className="border-b border-amber-300/60 bg-amber-100/70 px-4 py-2 text-center text-sm text-amber-900"
    >
      浏览器本地存储不可用（可能是隐私模式），本次浏览的进度和手记只保存在当前页面，刷新后会丢失。
      <button
        type="button"
        className="ml-2 underline underline-offset-4"
        onClick={() => setDismissed(true)}
      >
        知道了
      </button>
    </div>
  )
}
