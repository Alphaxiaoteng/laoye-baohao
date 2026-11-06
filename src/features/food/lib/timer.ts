/**
 * 步骤计时。
 * 计时以「结束时间戳」为准：刷新、切后台、页面隐藏都不会让倒计时漂移，
 * 重新进入时按当前时间重算剩余秒数即可恢复。暂停时改存「剩余秒数」。
 * 计时只是提醒，不代表食物已熟。
 */

export interface StoredTimer {
  /** 计时属于哪一步（从 0 开始） */
  stepIndex: number
  /** 结束时间戳（毫秒）；暂停时这个值不再用于计算 */
  endsAt: number
  /** 本次计时总时长（秒），用于显示进度 */
  durationSec: number
  /** 暂停时保留的剩余秒数；存在即表示已暂停 */
  pausedRemainingSec?: number
}

export const TIMER_KEY_PREFIX = 'laoye.food.timer.v1'

export function timerKey(recipeId: string): string {
  return `${TIMER_KEY_PREFIX}:${recipeId || 'unknown'}`
}

/** 按结束时间戳算剩余秒数；已过期返回 0，不会出现负数 */
export function computeRemainingSec(endsAt: number, now: number): number {
  if (!Number.isFinite(endsAt) || !Number.isFinite(now)) return 0
  return Math.max(0, Math.ceil((endsAt - now) / 1000))
}

/** 运行中按时间戳算，暂停时直接用存下的剩余秒数 */
export function timerRemainingSec(timer: StoredTimer | null | undefined, now: number): number {
  if (!timer) return 0
  if (typeof timer.pausedRemainingSec === 'number') {
    return Math.max(0, Math.round(timer.pausedRemainingSec))
  }
  return computeRemainingSec(timer.endsAt, now)
}

export function isTimerPaused(timer: StoredTimer | null | undefined): boolean {
  return typeof timer?.pausedRemainingSec === 'number'
}

/** 秒数 → m:ss */
export function formatClock(totalSec: number): string {
  const safe = Number.isFinite(totalSec) ? Math.max(0, Math.round(totalSec)) : 0
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** 从本地存储读出来的任意值是否是可以恢复的计时 */
export function isStoredTimer(value: unknown): value is StoredTimer {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<StoredTimer>
  const baseOk =
    typeof candidate.stepIndex === 'number' &&
    Number.isInteger(candidate.stepIndex) &&
    candidate.stepIndex >= 0 &&
    typeof candidate.endsAt === 'number' &&
    Number.isFinite(candidate.endsAt) &&
    typeof candidate.durationSec === 'number' &&
    Number.isFinite(candidate.durationSec) &&
    candidate.durationSec > 0
  if (!baseOk) return false
  if (candidate.pausedRemainingSec === undefined) return true
  return (
    typeof candidate.pausedRemainingSec === 'number' &&
    Number.isFinite(candidate.pausedRemainingSec) &&
    candidate.pausedRemainingSec >= 0
  )
}

/** 预设时长（秒）。第一个是来源里写明的建议，其余是通用提醒档位 */
export function timerPresets(suggestedSec?: number): { label: string; seconds: number }[] {
  const presets: { label: string; seconds: number }[] = []
  if (typeof suggestedSec === 'number' && suggestedSec > 0) {
    presets.push({ label: `来源建议 ${formatClock(suggestedSec)}`, seconds: suggestedSec })
  }
  for (const seconds of [60, 120, 180, 300, 600]) {
    if (presets.some((preset) => preset.seconds === seconds)) continue
    presets.push({ label: formatClock(seconds), seconds })
  }
  return presets
}
