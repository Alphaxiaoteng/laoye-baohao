/**
 * 步骤导航的纯函数。
 * 单独抽出来是为了能直接跑单元测试：边界、首步/末步、跳步都只走这一份逻辑。
 */

export interface StepPosition {
  /** 从 0 开始的当前下标 */
  index: number
  /** 总步数 */
  total: number
  /** 展示用的第几步（从 1 开始，空步骤时为 0） */
  human: number
  isFirst: boolean
  isLast: boolean
}

export function clampStepIndex(index: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0
  if (!Number.isFinite(index)) return 0
  return Math.min(Math.max(Math.trunc(index), 0), total - 1)
}

export function stepPosition(index: number, total: number): StepPosition {
  const safe = clampStepIndex(index, total)
  return {
    index: safe,
    total,
    human: total > 0 ? safe + 1 : 0,
    isFirst: safe === 0,
    isLast: total > 0 && safe === total - 1,
  }
}

/** 上一步：已在首步就停住，返回同一个下标 */
export function prevStepIndex(index: number, total: number): number {
  return clampStepIndex(clampStepIndex(index, total) - 1, total)
}

/** 下一步：已在末步就停住，由界面决定是否弹「完成」 */
export function nextStepIndex(index: number, total: number): number {
  return clampStepIndex(clampStepIndex(index, total) + 1, total)
}

/**
 * 从步骤文本里取一个短标签，用于「问一问」的上下文与步骤标题。
 * 只取冒号/逗号/句号前的第一段，过长就退回「第 n 步」。
 */
export function stepLabel(text: string | undefined, index: number): string {
  const head = (text ?? '').split(/[：:，,。；;]/)[0]?.trim() ?? ''
  if (head && head.length <= 12) return head
  return `第 ${index + 1} 步`
}

export function progressPercent(index: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0
  const { human } = stepPosition(index, total)
  return Math.round((human / total) * 100)
}
