import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageContext, usePageTitle } from '../../lib/usePageContext'
import { useProgressStore } from '../../store/progress'
import GesturePanel from './GesturePanel'
import SoundToggle from './SoundToggle'
import StepGuide from './StepGuide'
import TeaScene from './TeaScene'
import type { Gesture } from './gestures'
import type { GestureStatus } from './useHandGesture'
import { STEP_COUNT, stepLabel } from './steps'
import { useBrewFlow } from './useBrewFlow'
import { useBrewKeyboard } from './useBrewKeyboard'

const HOLD_TICK_MS = 50
const HOLD_STEP = 0.05
const HOLD_DECAY = 0.08

/**
 * /museum/tea/gesture：可选摄像头手势增强。
 * 摄像头必须先由用户点击开启；拒绝、无设备或模型加载失败时，
 * 点击按钮仍能完成整套流程，页面不会白屏。
 */
export default function TeaGesture() {
  const flow = useBrewFlow('tea:gesture')
  const visitModule = useProgressStore((s) => s.visitModule)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<GestureStatus>('idle')
  const [liveGesture, setLiveGesture] = useState<Gesture>('NONE')
  const [hold, setHold] = useState(0)
  const liveRef = useRef<Gesture>('NONE')
  const holdRef = useRef(0)

  usePageTitle('手势体验')
  usePageContext({
    module: 'tea',
    moduleTitle: '工夫茶',
    step: flow.done ? STEP_COUNT : flow.stepIndex + 1,
    stepLabel: stepLabel(flow.stepIndex, flow.done),
  })
  useBrewKeyboard(flow.next, flow.prev, flow.reset)

  useEffect(() => {
    visitModule('tea')
  }, [visitModule])

  const handleGesture = useCallback((gesture: Gesture) => {
    liveRef.current = gesture
    setLiveGesture(gesture)
  }, [])

  // 每一步开始时清空保持进度
  useEffect(() => {
    holdRef.current = 0
    setHold(0)
  }, [flow.stepIndex, flow.done])

  // 完成演示后自动关闭摄像头
  useEffect(() => {
    if (flow.done) setCameraEnabled(false)
  }, [flow.done])

  // 手势保持约 1 秒自动前进；只在摄像头开启时运行
  useEffect(() => {
    if (!cameraEnabled || flow.done) return
    const expected = flow.step.gesture
    const timer = window.setInterval(() => {
      if (liveRef.current === expected) {
        holdRef.current = Math.min(1, holdRef.current + HOLD_STEP)
      } else {
        holdRef.current = Math.max(0, holdRef.current - HOLD_DECAY)
      }

      if (holdRef.current >= 1) {
        holdRef.current = 0
        setHold(0)
        flow.next()
        return
      }
      setHold(holdRef.current)
    }, HOLD_TICK_MS)

    return () => window.clearInterval(timer)
  }, [cameraEnabled, flow.done, flow.step.gesture, flow.next])

  return (
    <div className="space-y-7">
      <nav aria-label="面包屑" className="text-sm text-muted">
        <Link to="/museum" className="link-inline">
          文化馆
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <Link to="/museum/tea" className="link-inline">
          工夫茶
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span>手势体验</span>
      </nav>

      <header className="max-w-3xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm tracking-[0.2em] text-brick">五步演示</p>
          <span className="chip text-brown">实验功能</span>
        </div>
        <h1 className="font-serif text-3xl text-ink">手势体验</h1>
        <p className="text-[15px] leading-7 text-ink-soft">
          同一套五步流程，加上可选的手势翻页。手势动作只用于演示互动，不对应仪式含义；
          不开摄像头也能用点击、触屏或键盘完成。
        </p>
        <p className="text-xs leading-5 text-muted">
          摄像头权限只会在你主动点击「开启摄像头」后请求；识别在本机浏览器运行，视频帧不上传。
          识别结果可能受光线、距离和摄像头影响，失败不影响点击流程。
        </p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="tea-stage-panel">
          <TeaScene step={flow.step} stepIndex={flow.stepIndex} done={flow.done} />
        </div>

        <div className="tea-panel">
          <StepGuide
            step={flow.step}
            stepIndex={flow.stepIndex}
            done={flow.done}
            onNext={flow.next}
            onPrev={flow.prev}
            onReset={flow.reset}
            gestureEnabled={cameraStatus === 'ready' && !flow.done}
            showGestureHint
            liveGesture={liveGesture}
            holdProgress={hold}
          />
        </div>
      </div>

      {!flow.done ? (
        <section aria-labelledby="camera-title" className="tea-panel space-y-3">
          <h2 id="camera-title" className="section-title">
            摄像头与手势（可选）
          </h2>
          <GesturePanel
            enabled={cameraEnabled}
            onEnabledChange={setCameraEnabled}
            onGesture={handleGesture}
            onStatusChange={setCameraStatus}
          />
        </section>
      ) : (
        <p className="rounded-xl border border-line bg-deep2/60 px-4 py-3 text-sm leading-6 text-ink-soft">
          演示结束后摄像头已关闭。想再来一次可以点上面的「再走一遍」；手势与镜头不是完成流程的必要条件。
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
        <SoundToggle />
        <div className="flex flex-wrap gap-2">
          <Link to="/museum/tea/brew" className="btn-quiet !min-h-[40px] !text-sm">
            只用点击流程
          </Link>
          <Link to="/museum/tea" className="btn-quiet !min-h-[40px] !text-sm">
            回到工夫茶首页
          </Link>
        </div>
      </div>
    </div>
  )
}
