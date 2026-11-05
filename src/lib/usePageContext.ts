import { useEffect } from 'react'
import { useAskContextStore } from '../store/askContext'

export interface PageContext {
  module?: string
  moduleTitle?: string
  entryId?: string
  entryTitle?: string
  step?: number
  stepLabel?: string
}

/**
 * 把当前页面对象登记为「问一问」的上下文。
 * 只上报模块 / 条目 / 步骤这类结构信息，不上报整页正文。
 */
export function usePageContext(ctx: PageContext): void {
  const { module, moduleTitle, entryId, entryTitle, step, stepLabel } = ctx
  const setContext = useAskContextStore((s) => s.setContext)

  useEffect(() => {
    setContext({ module, moduleTitle, entryId, entryTitle, step, stepLabel })
  }, [setContext, module, moduleTitle, entryId, entryTitle, step, stepLabel])
}

/** 页面标题，避免所有页面显示同一个 <title> */
export function usePageTitle(title: string): void {
  useEffect(() => {
    const previous = document.title
    document.title = title ? `${title}｜老爷保号` : '老爷保号｜跟着故事，走进潮汕文化'
    return () => {
      document.title = previous
    }
  }, [title])
}
