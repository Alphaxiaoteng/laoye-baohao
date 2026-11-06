import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision'
import { HandModelError, getHandLandmarker } from './handTracker'
import { gestureFromHands, type Gesture } from './gestures'

export type GestureStatus = 'idle' | 'requesting' | 'loading-model' | 'ready' | 'error'

const DEBOUNCE_FRAMES = 12
const MAX_CONSECUTIVE_ERRORS = 120

function describeGestureError(err: unknown): string {
  if (err instanceof HandModelError) return err.message
  if (typeof DOMException !== 'undefined' && err instanceof DOMException) {
    if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
      return '摄像头权限被拒绝，或当前页面不是 HTTPS。你仍然可以用下面的点击按钮走完全部步骤。'
    }
    if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
      return '没有找到可用的摄像头。你仍然可以用下面的点击按钮走完全部步骤。'
    }
    if (err.name === 'NotReadableError') {
      return '摄像头可能被其他程序占用。关闭占用后重试，或直接用点击按钮完成。'
    }
  }
  if (err instanceof Error) {
    if (err.message === 'MEDIA_UNSUPPORTED') {
      return '当前浏览器不支持摄像头接口（或页面不是 HTTPS）。可直接用点击按钮完成。'
    }
    if (err.message === 'NO_VIDEO') {
      return '视频画面初始化失败。可直接用点击按钮完成。'
    }
  }
  return '启动摄像头失败，可能是权限、设备或环境限制。可直接用点击按钮完成整套流程。'
}

interface UseHandGestureResult {
  status: GestureStatus
  error: string
  gesture: Gesture
  landmarks: HandLandmarkerResult | null
  start: () => void
  stop: () => void
}

/**
 * 摄像头 + 手势识别的生命周期管理。
 *
 * 只有调用 start()（由用户点击触发）才会请求权限；
 * 离开页面时一定会取消识别循环、停止轨道并清空 video.srcObject。
 * 视频帧只在本地内存里交给 MediaPipe，不上传。
 */
export function useHandGesture(videoRef: RefObject<HTMLVideoElement | null>): UseHandGestureResult {
  const [status, setStatus] = useState<GestureStatus>('idle')
  const [error, setError] = useState('')
  const [gesture, setGesture] = useState<Gesture>('NONE')
  const [landmarks, setLandmarks] = useState<HandLandmarkerResult | null>(null)

  const activeRef = useRef(false)
  const mountedRef = useRef(true)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastTsRef = useRef(0)
  const countsRef = useRef<Partial<Record<Gesture, number>>>({})
  const stableRef = useRef<Gesture>('NONE')

  const stopTracks = useCallback(() => {
    const video = videoRef.current
    const stream = streamRef.current ?? (video?.srcObject as MediaStream | null)
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    streamRef.current = null
    if (video) video.srcObject = null
  }, [videoRef])

  const stop = useCallback(() => {
    activeRef.current = false
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    stopTracks()
    countsRef.current = {}
    stableRef.current = 'NONE'
    if (mountedRef.current) {
      setGesture('NONE')
      setLandmarks(null)
      setStatus('idle')
      setError('')
    }
  }, [stopTracks])

  const start = useCallback(async () => {
    if (activeRef.current) return
    activeRef.current = true
    setError('')
    setGesture('NONE')
    setLandmarks(null)
    setStatus('requesting')

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('MEDIA_UNSUPPORTED')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      })
      if (!activeRef.current || !mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error('NO_VIDEO')
      video.srcObject = stream
      await video.play()
      if (!activeRef.current) return

      setStatus('loading-model')
      const landmarker = await getHandLandmarker()
      if (!activeRef.current || !mountedRef.current) return

      setStatus('ready')
      lastTsRef.current = 0
      let consecutiveErrors = 0

      const loop = () => {
        if (!activeRef.current) return
        const el = videoRef.current
        if (el && el.readyState >= 2) {
          try {
            let timestamp = performance.now()
            // MediaPipe 要求时间戳严格递增
            if (timestamp <= lastTsRef.current) timestamp = lastTsRef.current + 1
            lastTsRef.current = timestamp

            const result = landmarker.detectForVideo(el, timestamp)
            consecutiveErrors = 0
            if (mountedRef.current) setLandmarks(result)

            const hands = result.landmarks ?? []
            const detected = gestureFromHands(hands)

            const counts = countsRef.current
            for (const key of Object.keys(counts) as Gesture[]) {
              if (key !== detected) counts[key] = 0
            }
            const nextCount = (counts[detected] ?? 0) + 1
            counts[detected] = nextCount

            if (nextCount >= DEBOUNCE_FRAMES && stableRef.current !== detected) {
              stableRef.current = detected
              if (mountedRef.current) setGesture(detected)
            }
          } catch {
            consecutiveErrors += 1
            if (consecutiveErrors > MAX_CONSECUTIVE_ERRORS) {
              activeRef.current = false
              stopTracks()
              if (mountedRef.current) {
                setLandmarks(null)
                setStatus('error')
                setError('手势识别连续失败，可能是当前浏览器或显卡不支持。可直接用点击按钮完成。')
              }
              return
            }
          }
        }
        rafRef.current = requestAnimationFrame(loop)
      }

      rafRef.current = requestAnimationFrame(loop)
    } catch (err) {
      activeRef.current = false
      stopTracks()
      if (!mountedRef.current) return
      setGesture('NONE')
      setLandmarks(null)
      setStatus('error')
      setError(describeGestureError(err))
    }
  }, [stopTracks, videoRef])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      activeRef.current = false
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      stopTracks()
    }
  }, [stopTracks])

  return {
    status,
    error,
    gesture,
    landmarks,
    start,
    stop,
  }
}
