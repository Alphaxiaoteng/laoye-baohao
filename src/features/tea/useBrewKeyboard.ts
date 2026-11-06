import { useEffect } from 'react'

/**
 * 键盘兜底：空格 / → 下一步，← 上一步，R 重来。
 * 输入框、可选区与已聚焦的按钮/链接不拦截，避免和原生行为打架。
 */
export function useBrewKeyboard(
  next: () => void,
  prev: () => void,
  reset: () => void,
): void {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (target instanceof HTMLElement) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        if (target.isContentEditable) return
        if (
          (event.key === ' ' || event.key === 'Enter') &&
          (tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY')
        ) {
          // 让已聚焦的按钮/链接自己处理空格与回车，避免一次按键走两步
          return
        }
      }

      if (event.key === ' ' || event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        prev()
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault()
        reset()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, reset])
}
