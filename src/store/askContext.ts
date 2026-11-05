import { create } from 'zustand'

/**
 * 悬浮问答的上下文：只包含当前模块 / 条目 / 步骤，不上传整页正文或浏览历史。
 */
export interface AskContextState {
  module?: string
  moduleTitle?: string
  entryId?: string
  entryTitle?: string
  /** 步骤序号，从 1 开始 */
  step?: number
  stepLabel?: string
  setContext: (ctx: {
    module?: string
    moduleTitle?: string
    entryId?: string
    entryTitle?: string
    step?: number
    stepLabel?: string
  }) => void
  clearContext: () => void
}

export const useAskContextStore = create<AskContextState>((set) => ({
  setContext: (ctx) =>
    set({
      module: ctx.module,
      moduleTitle: ctx.moduleTitle,
      entryId: ctx.entryId,
      entryTitle: ctx.entryTitle,
      step: ctx.step,
      stepLabel: ctx.stepLabel,
    }),
  clearContext: () =>
    set({
      module: undefined,
      moduleTitle: undefined,
      entryId: undefined,
      entryTitle: undefined,
      step: undefined,
      stepLabel: undefined,
    }),
}))

/** 生成"正在了解：工夫茶／斟茶／第 2 步"这类可见标签 */
export function contextLabel(ctx: {
  moduleTitle?: string
  entryTitle?: string
  step?: number
  stepLabel?: string
}): string {
  const parts: string[] = []
  if (ctx.moduleTitle) parts.push(ctx.moduleTitle)
  if (ctx.entryTitle) parts.push(ctx.entryTitle)
  if (typeof ctx.step === 'number' && ctx.step > 0) {
    parts.push(ctx.stepLabel ? `第 ${ctx.step} 步 · ${ctx.stepLabel}` : `第 ${ctx.step} 步`)
  }
  return parts.length ? parts.join('／') : '全站浏览'
}
