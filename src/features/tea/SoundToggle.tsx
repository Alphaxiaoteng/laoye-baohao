import { useState } from 'react'
import { teaSound } from './sound'

/** 合成音效开关。默认关闭；开启前不会创建 AudioContext。 */
export default function SoundToggle({ quiet = false }: { quiet?: boolean }) {
  const [enabled, setEnabled] = useState(() => teaSound.isEnabled())

  function toggle() {
    const next = teaSound.toggle()
    setEnabled(next)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn-quiet !min-h-[40px] !text-sm"
        aria-pressed={enabled}
        onClick={toggle}
      >
        合成音效：{enabled ? '开' : '关'}
      </button>
      {quiet ? null : (
        <span className="text-xs text-muted">
          {enabled ? '浏览器实时合成，不加载音频文件。' : '默认关闭，不自动播放。'}
        </span>
      )}
    </div>
  )
}
