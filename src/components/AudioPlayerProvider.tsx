import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { attachAudioSink, stopAudioOnNavigate, useAudioStore } from '../store/audio'

/**
 * 全局唯一 <audio> 元素：整个应用只创建一个播放器实例，
 * 切路由时停止，保证"新播停旧、切页停止"。
 */
export default function AudioPlayerProvider() {
  const elRef = useRef<HTMLAudioElement | null>(null)
  const location = useLocation()
  const handleEnded = useAudioStore((s) => s.handleEnded)
  const handleError = useAudioStore((s) => s.handleError)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return
    const el = new Audio()
    el.preload = 'none'
    elRef.current = el

    const onEnded = () => handleEnded()
    const onError = () => handleError()
    el.addEventListener('ended', onEnded)
    el.addEventListener('error', onError)

    attachAudioSink({
      play: async (file: string) => {
        el.src = file
        el.load()
        await el.play()
      },
      stop: () => {
        try {
          el.pause()
          el.currentTime = 0
        } catch {
          /* 元素尚未加载时忽略 */
        }
      },
    })

    return () => {
      attachAudioSink(null)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('error', onError)
      try {
        el.pause()
        el.removeAttribute('src')
        el.load()
      } catch {
        /* 忽略卸载异常 */
      }
      elRef.current = null
    }
  }, [handleEnded, handleError])

  // 切换页面停止播放（PRD 10.3）
  useEffect(() => {
    stopAudioOnNavigate()
  }, [location.pathname])

  return null
}
