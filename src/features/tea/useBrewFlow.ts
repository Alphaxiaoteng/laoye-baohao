import { useCallback, useEffect, useState } from 'react'
import { BREW_STEPS, LAST_STEP_INDEX, stepDwellMs } from './steps'
import { teaSound } from './sound'
import { useProgressStore } from '../../store/progress'

/**
 * 五步演示的状态机，一键自动演示、点击流程和手势流程共用。
 *
 * - `auto` 为真时按 stepDwellMs 的间隔自动推进，暂停就清掉 timer；
 * - 用户手动切步（点击 / 键盘 / 手势 / 器物热区）都会接管，把 auto 关掉；
 * - 音效由 teaSound 单例统一处理，默认关闭，调用时自动 no-op。
 */
export function useBrewFlow(interactionKey = 'tea:brew') {
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [auto, setAuto] = useState(false)
  const markInteraction = useProgressStore((s) => s.markInteraction)

  /** 单纯往前走一步，不碰自动播放状态（自动演示的 timer 用这个） */
  const advance = useCallback(() => {
    if (done) return
    if (stepIndex >= LAST_STEP_INDEX) {
      setDone(true)
      setAuto(false)
      markInteraction(interactionKey)
      teaSound.playComplete()
      return
    }
    const target = stepIndex + 1
    setStepIndex(target)
    teaSound.playDing()
    if (target === 2) teaSound.playPour(1.4)
  }, [done, interactionKey, markInteraction, stepIndex])

  /** 手动切步：先接管，再往前走一步 */
  const next = useCallback(() => {
    setAuto(false)
    advance()
  }, [advance])

  const prev = useCallback(() => {
    setAuto(false)
    if (done) {
      setDone(false)
      setStepIndex(LAST_STEP_INDEX)
      return
    }
    setStepIndex((i) => Math.max(0, i - 1))
  }, [done])

  const reset = useCallback(() => {
    setAuto(false)
    setDone(false)
    setStepIndex(0)
  }, [])

  /** 器物热区：直接跳到某一步，并停掉自动播放让用户接手 */
  const gotoStep = useCallback((index: number) => {
    setAuto(false)
    setDone(false)
    setStepIndex(Math.min(Math.max(Math.round(index), 0), LAST_STEP_INDEX))
  }, [])

  const startAuto = useCallback(() => {
    setAuto(true)
    setDone(false)
    // 演完之后再点「再演一次」：回到第一步重放
    if (done) setStepIndex(0)
  }, [done])

  const pauseAuto = useCallback(() => {
    setAuto(false)
  }, [])

  const toggleAuto = useCallback(() => {
    if (auto) pauseAuto()
    else startAuto()
  }, [auto, pauseAuto, startAuto])

  // 自动推进：每一步单独挂一个 timeout，暂停 / 卸载 / 切步都会清掉
  useEffect(() => {
    if (!auto || done) return
    const timer = window.setTimeout(advance, stepDwellMs(BREW_STEPS[stepIndex]))
    return () => window.clearTimeout(timer)
  }, [advance, auto, done, stepIndex])

  return {
    step: BREW_STEPS[stepIndex],
    stepIndex,
    done,
    auto,
    next,
    prev,
    reset,
    gotoStep,
    startAuto,
    pauseAuto,
    toggleAuto,
  }
}
