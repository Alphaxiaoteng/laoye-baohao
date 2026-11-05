import { describe, expect, it } from 'vitest'
import invalid from './fixtures/content-invalid.json'
import valid from './fixtures/content-valid.json'
import { validateContent } from '../scripts/validate-content'
import type { ContentBundle } from '../src/types/content'

const validBundle = valid as unknown as ContentBundle
const invalidBundle = invalid as unknown as ContentBundle

describe('validate-content 门禁', () => {
  it('合法内容没有阻断性错误', () => {
    const result = validateContent(validBundle)
    expect(result.errors).toEqual([])
    expect(result.counts.entries).toBe(2)
    expect(result.counts.sources).toBe(2)
  })

  it('重复 id 会报错', () => {
    const result = validateContent(invalidBundle)
    expect(result.errors.some((e) => e.includes('重复 id「dup」'))).toBe(true)
    expect(result.errors.some((e) => e.includes('重复 id「S1」'))).toBe(true)
  })

  it('sourceIds 必须存在于 sources.json', () => {
    const result = validateContent(invalidBundle)
    expect(result.errors.some((e) => e.includes('不存在的来源「S99」'))).toBe(true)
    expect(result.errors.some((e) => e.includes('不存在的来源「S404」'))).toBe(true)
  })

  it('verified 条目必须有来源，且不能正文为空', () => {
    const result = validateContent(invalidBundle)
    expect(
      result.errors.some((e) => e.includes('verify=verified 必须至少挂 1 条来源')),
    ).toBe(true)
    expect(result.errors.some((e) => e.includes('verify=verified 但正文为空'))).toBe(true)
  })

  it('有音频文件必须有 license', () => {
    const result = validateContent(invalidBundle)
    expect(result.errors.some((e) => e.includes('有音频文件但没有登记 license'))).toBe(true)
  })

  it('来源 url 必须是 http(s)', () => {
    const result = validateContent(invalidBundle)
    expect(result.errors.some((e) => e.includes('url 必须是 http(s) 链接'))).toBe(true)
  })

  it('缺字段为错误，未知枚举为警告', () => {
    const result = validateContent(invalidBundle)
    expect(result.errors.some((e) => e.includes('缺少 title'))).toBe(true)
    expect(result.warnings.some((w) => w.includes('unknown-module'))).toBe(true)
    expect(result.warnings.some((w) => w.includes('action'))).toBe(true)
    expect(result.warnings.some((w) => w.includes('不存在的条目「missing-entry」'))).toBe(true)
  })
})
