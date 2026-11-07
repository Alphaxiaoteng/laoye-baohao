import { useEffect, useRef, useState } from 'react'
import TeaSetDiagram from '../figures/TeaSetDiagram'
import { useProgressStore } from '../../store/progress'

const CUPS = 3
/** 水线动画时长：播完就撤掉这一注 */
const STREAM_MS = 900

/**
 * 斟茶轻互动：点击茶壶依次向三只杯斟茶。
 * 只是"理解流程"的点击演示，不声称是标准手法，也不提供评分。
 */
export default function TeaPour() {
  const [poured, setPoured] = useState(0)
  const [pourIndex, setPourIndex] = useState(0)
  const [pouring, setPouring] = useState(false)
  const [pourKey, setPourKey] = useState(0)
  const timer = useRef<number | null>(null)
  const markInteraction = useProgressStore((s) => s.markInteraction)
  const done = poured >= CUPS

  // 用函数式更新，快速连点也不会丢计数；完成时记录一次互动
  useEffect(() => {
    if (poured >= CUPS) markInteraction('tea:pour')
  }, [poured, markInteraction])

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  function pour() {
    if (done) return
    setPourIndex(poured)
    setPoured((p) => Math.min(CUPS, p + 1))
    setPourKey((key) => key + 1)
    setPouring(true)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPouring(false), STREAM_MS)
  }

  function reset() {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setPouring(false)
    setPoured(0)
    setPourIndex(0)
  }

  return (
    <div className="space-y-3">
      <TeaSetDiagram poured={poured} pouring={pouring} pourKey={pourKey} pourIndex={pourIndex} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary" onClick={pour} disabled={done}>
          {done ? '完成体验' : `点击茶壶斟茶（${poured}/${CUPS}）`}
        </button>
        <button
          type="button"
          className="btn-quiet !min-h-[40px] !text-sm"
          onClick={reset}
          disabled={poured === 0}
        >
          重来
        </button>
      </div>
      <p className="text-sm text-ink-soft" role="status">
        {done
          ? '完成体验：你依次向三只杯做了斟茶示意。真实做法与说法以来源页资料为准。'
          : '点击茶壶，依次向三只杯斟茶；这只是示意操作，不代表标准手法。'}
      </p>
    </div>
  )
}
