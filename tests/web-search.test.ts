import { describe, expect, it } from 'vitest'
import { formatWebContext, webSearchEnabled } from '../server/web-search'

describe('站外检索（默认关闭）', () => {
  it('没有配置 WEB_SEARCH_URL 时视为关闭', () => {
    const prev = process.env.WEB_SEARCH_URL
    delete process.env.WEB_SEARCH_URL
    expect(webSearchEnabled()).toBe(false)
    if (prev !== undefined) process.env.WEB_SEARCH_URL = prev
  })

  it('站外结果带未核验标记，且独立编号 W#', () => {
    const text = formatWebContext([
      { title: '示例来源', url: 'https://example.com/a', snippet: '摘要内容' },
    ])
    expect(text).toContain('站外检索结果（未核验）')
    expect(text).toContain('[W1] 示例来源')
    expect(text).toContain('https://example.com/a')
    expect(text).not.toContain('[S1]')
  })

  it('空结果不生成上下文', () => {
    expect(formatWebContext([])).toBe('')
  })
})
