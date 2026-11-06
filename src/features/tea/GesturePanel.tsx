import { useEffect, useRef } from 'react'
import { GESTURE_LABELS, type Gesture } from './gestures'
import { useHandGesture, type GestureStatus } from './useHandGesture'
const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
  [5, 0],
]

const HAND_COLORS = ['#A63A2B', '#2F4A3A']

const STATUS_TEXT: Record<GestureStatus, string> = {
  idle: '摄像头未开启。开启后可用手势翻页；不开启也能用按钮完成。',
  requesting: '正在请求摄像头权限…',
  'loading-model': '摄像头已连接，正在加载本地手势模型（首次较慢）…',
  ready: '识别中。把手放进画面，保持手势约 1 秒。',
  error: '摄像头或模型启动失败，下面的点击按钮仍然可用。',
}

interface GesturePanelProps {
  enabled: boolean
  onEnabledChange: (next: boolean) => void
  onGesture: (gesture: Gesture) => void
  onStatusChange?: (status: GestureStatus) => void
}

/**
 * 可选的手势增强面板。
 * 只有用户点击「开启摄像头」后才会请求权限；拒绝或无摄像头时页面不白屏，
 * 点击流程始终留在同一页面上。
 */
export default function GesturePanel({
  enabled,
  onEnabledChange,
  onGesture,
  onStatusChange,
}: GesturePanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { status, error, gesture, landmarks, start, stop } = useHandGesture(videoRef)

  useEffect(() => {
    if (enabled) {
      start()
    } else {
      stop()
    }
  }, [enabled, start, stop])

  useEffect(() => {
    onGesture(gesture)
  }, [gesture, onGesture])

  useEffect(() => {
    onStatusChange?.(status)
  }, [status, onStatusChange])

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas) return

    const width = video?.videoWidth || 640
    const height = video?.videoHeight || 480
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    if (!landmarks) return

    landmarks.landmarks.forEach((hand, index) => {
      const color = HAND_COLORS[index % HAND_COLORS.length]
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.beginPath()
      for (const [a, b] of HAND_CONNECTIONS) {
        const pa = hand[a]
        const pb = hand[b]
        if (!pa || !pb) continue
        ctx.moveTo(pa.x * width, pa.y * height)
        ctx.lineTo(pb.x * width, pb.y * height)
      }
      ctx.stroke()

      ctx.fillStyle = color
      for (const point of hand) {
        ctx.beginPath()
        ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }, [landmarks])

  const busy = status === 'requesting' || status === 'loading-model'

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">点按钮就能翻步。要改用手势，先开摄像头。</p>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-deep">
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
            enabled && status === 'ready' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full transition-opacity ${
            enabled && status === 'ready' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: 'scaleX(-1)' }}
          aria-hidden="true"
        />
        {!enabled || status !== 'ready' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-ink">
            <span aria-hidden="true" className="text-3xl">
              ◉
            </span>
            <p className="text-sm">{STATUS_TEXT[status]}</p>
            {busy ? (
              <p className="text-xs text-muted" role="status">
                请稍候，正在使用本站本地文件，不会上传画面。
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {status === 'ready' ? (
        <p className="text-sm text-ink-soft" role="status" aria-live="polite">
          当前手势：<b className="text-ink">{GESTURE_LABELS[gesture]}</b>
        </p>
      ) : null}

      {status === 'error' ? (
        <p role="alert" className="rounded-xl border border-brick/30 bg-brick/5 px-3 py-2 text-sm leading-6 text-brick">
          {error || STATUS_TEXT.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {!enabled ? (
          <button type="button" className="btn-secondary" onClick={() => onEnabledChange(true)}>
            开启摄像头
          </button>
        ) : (
          <>
            {status === 'error' ? (
              <button type="button" className="btn-secondary" onClick={() => start()}>
                重试
              </button>
            ) : null}
            <button type="button" className="btn-quiet !min-h-[40px] !text-sm" onClick={() => onEnabledChange(false)}>
              关闭摄像头
            </button>
          </>
        )}
      </div>

      <p className="text-xs leading-5 text-muted">
        手势识别只在当前浏览器本地运行，视频帧不会上传。首次需加载本站
        public/media/tea/models 下的模型与 wasm（模型约 7.5 MB，SIMD wasm 约 9.1 MB），
        旧浏览器会再取 non-SIMD 版本。离开页面会自动停止摄像头与识别循环。
      </p>
    </div>
  )
}
