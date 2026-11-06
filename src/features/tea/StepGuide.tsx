import { Link } from 'react-router-dom'
import { GESTURE_LABELS, type Gesture } from './gestures'
import { BREW_STEPS, STEP_COUNT, type BrewStep } from './steps'

interface StepGuideProps {
  step: BrewStep
  stepIndex: number
  done: boolean
  onNext: () => void
  onPrev: () => void
  onReset: () => void
  /** 开启摄像头并识别后显示手势环 */
  gestureEnabled?: boolean
  /** 未开启摄像头时也提示可选手势 */
  showGestureHint?: boolean
  liveGesture?: Gesture
  holdProgress?: number
}

/**
 * 步骤说明与操作区。
 * 点击 / 触屏 / 键盘始终可以完成流程，摄像头与手势只是可选增强。
 * 视觉走 8787 深墨青底座：细线进度点、珊瑚色茶印、毛玻璃按钮。
 */
export default function StepGuide({
  step,
  stepIndex,
  done,
  onNext,
  onPrev,
  onReset,
  gestureEnabled = false,
  showGestureHint = false,
  liveGesture = 'NONE',
  holdProgress = 0,
}: StepGuideProps) {
  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="tea-seal" aria-hidden="true">
          茶
        </div>
        <h2 className="font-serif text-2xl text-ink">五步演示完成</h2>
        <p className="max-w-md text-sm leading-6 text-ink-soft">
          这只是把来源页记录的环节按顺序翻了一遍，不代表你已经完成一次真实冲泡。
        </p>
        <p className="max-w-md text-xs leading-5 text-muted">
          项目页把冲泡拆成二十余个环节；站内演示只选了其中五组，未给出时长、水温与次数。
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="tea-btn tea-btn-ghost" onClick={onReset}>
            再走一遍
          </button>
          <Link to="/museum/tea/tea-steps" className="tea-btn tea-btn-primary">
            看条目里的环节记录
          </Link>
        </div>
      </div>
    )
  }

  const ringDeg = Math.round(Math.min(1, Math.max(0, holdProgress)) * 360)
  const matched = gestureEnabled && liveGesture === step.gesture

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="tea-progress" aria-hidden="true">
        {BREW_STEPS.map((s, i) => (
          <span
            key={s.id}
            className={[
              'tea-progress-dot',
              i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : '',
            ].join(' ')}
            title={s.name}
          />
        ))}
      </div>

      <div role="status" aria-live="polite" className="space-y-2">
        <p className="text-xs tracking-[0.2em] text-muted">
          第 {stepIndex + 1} / {STEP_COUNT} 步
        </p>
        <h2 className="font-serif text-2xl text-ink">{step.title}</h2>
        <p className="mx-auto max-w-md text-sm leading-6 text-ink-soft">{step.tip}</p>
      </div>

      <p className="tea-source-note max-w-md">项目页对应环节：{step.sourceStage}</p>

      {gestureEnabled ? (
        <>
          <div
            className={`tea-gesture-ring${matched ? ' is-matched' : ''}`}
            style={{
              background: `conic-gradient(var(--brown) ${ringDeg}deg, rgba(255,255,255,0.16) ${ringDeg}deg)`,
            }}
          >
            <div className="tea-gesture-disc">
              <span className="tea-gesture-icon" aria-hidden="true">
                {step.gestureIcon}
              </span>
            </div>
          </div>
          <p className="text-base text-ink">{step.gestureName}</p>
          <p className="text-xs text-muted">{step.gestureExplain}</p>
          <p className="text-sm text-ink-soft" role="status" aria-live="polite">
            当前手势：
            <b className={matched ? 'text-ink' : 'text-muted'}>
              {GESTURE_LABELS[liveGesture]}
            </b>
            {matched ? ' · 保持约 1 秒' : ''}
          </p>
        </>
      ) : showGestureHint ? (
        <p className="text-xs text-muted">
          可选手势：{step.gestureName}（开启摄像头后可用；不开也能点击按钮）
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          className="tea-btn tea-btn-ghost"
          onClick={onPrev}
          disabled={stepIndex === 0}
        >
          上一步
        </button>
        <button type="button" className="tea-btn tea-btn-primary" onClick={onNext}>
          {stepIndex === STEP_COUNT - 1 ? '完成演示' : '下一步'}
        </button>
      </div>
      <p className="text-xs leading-5 text-muted">
        鼠标点击、触屏点按、键盘空格或方向键都可以操作，不需要摄像头。
      </p>
    </div>
  )
}
