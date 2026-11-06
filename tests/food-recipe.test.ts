import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  factorLabel,
  formatNumber,
  parseAmount,
  parseServings,
  scaleAmount,
  servingsSummary,
} from '../src/features/food/lib/servings'
import {
  clampStepIndex,
  nextStepIndex,
  prevStepIndex,
  progressPercent,
  stepLabel,
  stepPosition,
} from '../src/features/food/lib/steps'
import {
  computeRemainingSec,
  formatClock,
  isStoredTimer,
  isTimerPaused,
  timerKey,
  timerPresets,
  timerRemainingSec,
  type StoredTimer,
} from '../src/features/food/lib/timer'

describe('份量换算：只做确定的整数/分数倍', () => {
  it('识别「数字 + 单位」的用量', () => {
    expect(parseAmount('50 g')).toEqual({ value: 50, unit: 'g' })
    expect(parseAmount('0.5 g')).toEqual({ value: 0.5, unit: 'g' })
    expect(parseAmount('200 mL')).toEqual({ value: 200, unit: 'mL' })
    expect(parseAmount('1 份')).toEqual({ value: 1, unit: '份' })
    expect(parseAmount('适量')).toBeNull()
    expect(parseAmount(undefined)).toBeNull()
  })

  it('整数倍换算', () => {
    expect(scaleAmount('50 g', 1)).toBe('50 g')
    expect(scaleAmount('50 g', 2)).toBe('100 g')
    expect(scaleAmount('200 mL', 3)).toBe('600 mL')
    expect(scaleAmount('2 g', 3)).toBe('6 g')
  })

  it('分数倍换算是准确的，不会出现浮点尾巴', () => {
    expect(scaleAmount('50 g', 0.5)).toBe('25 g')
    expect(scaleAmount('0.5 g', 0.5)).toBe('0.25 g')
    expect(scaleAmount('0.1 g', 0.5)).toBe('0.05 g')
    expect(scaleAmount('200 mL', 0.5)).toBe('100 mL')
  })

  it('没有数字的说明原样保留，不会凭空变成数字', () => {
    expect(scaleAmount('适量', 2)).toBe('适量')
    expect(scaleAmount('', 2)).toBe('')
    expect(scaleAmount('若干', 3)).toBe('若干')
  })

  it('份量摘要与倍数标签', () => {
    expect(parseServings(1)).toBe(1)
    expect(parseServings('2')).toBe(2)
    expect(parseServings(undefined)).toBe(1)
    expect(servingsSummary(1, 2)).toBe('约 2 人份')
    expect(servingsSummary(2, 0.5)).toBe('约 1 人份')
    expect(servingsSummary(3, 0.5)).toBe('约 1.5 人份')
    expect(factorLabel(0.5)).toBe('半份')
    expect(factorLabel(2)).toBe('两倍')
    expect(formatNumber(0.30000000000000004)).toBe('0.3')
  })
})

describe('步骤导航：边界与标签', () => {
  it('下标被夹在有效范围内', () => {
    expect(clampStepIndex(-3, 6)).toBe(0)
    expect(clampStepIndex(99, 6)).toBe(5)
    expect(clampStepIndex(2, 6)).toBe(2)
    expect(clampStepIndex(2, 0)).toBe(0)
  })

  it('上一步 / 下一步在首末步停住', () => {
    expect(prevStepIndex(0, 6)).toBe(0)
    expect(prevStepIndex(3, 6)).toBe(2)
    expect(nextStepIndex(5, 6)).toBe(5)
    expect(nextStepIndex(2, 6)).toBe(3)
  })

  it('位置信息与进度百分比', () => {
    expect(stepPosition(0, 6)).toMatchObject({ human: 1, isFirst: true, isLast: false })
    expect(stepPosition(5, 6)).toMatchObject({ human: 6, isFirst: false, isLast: true })
    expect(stepPosition(9, 6)).toMatchObject({ human: 6, isLast: true })
    expect(progressPercent(0, 4)).toBe(25)
    expect(progressPercent(3, 4)).toBe(100)
    expect(progressPercent(0, 0)).toBe(0)
  })

  it('步骤标签取冒号前的短动作，过长就退回序号', () => {
    expect(stepLabel('切配：牛肉切成约 0.2 cm 厚的片', 0)).toBe('切配')
    expect(stepLabel('烫粿条，捞出沥干', 2)).toBe('烫粿条')
    expect(stepLabel('把所有的东西都放进锅里然后用中火慢慢地煮到完全熟透为止', 3)).toBe('第 4 步')
    expect(stepLabel(undefined, 1)).toBe('第 2 步')
  })
})

describe('计时：以结束时间戳恢复，暂停改存剩余秒数', () => {
  const now = 1_700_000_000_000

  it('剩余秒数按绝对时间算，过期归零', () => {
    expect(computeRemainingSec(now + 120_000, now)).toBe(120)
    expect(computeRemainingSec(now + 1_500, now)).toBe(2)
    expect(computeRemainingSec(now - 60_000, now)).toBe(0)
    expect(computeRemainingSec(Number.NaN, now)).toBe(0)
  })

  it('刷新后按「现在」重算，而不是继续累计', () => {
    const timer: StoredTimer = { stepIndex: 2, endsAt: now + 300_000, durationSec: 300 }
    // 页面隐藏 2 分钟后重新可见
    expect(timerRemainingSec(timer, now + 120_000)).toBe(180)
    // 页面隐藏太久，回来已经结束
    expect(timerRemainingSec(timer, now + 400_000)).toBe(0)
  })

  it('暂停时不看时间戳，恢复后重新计算到期时间', () => {
    const paused: StoredTimer = {
      stepIndex: 0,
      endsAt: now + 60_000,
      durationSec: 60,
      pausedRemainingSec: 42,
    }
    expect(isTimerPaused(paused)).toBe(true)
    expect(timerRemainingSec(paused, now + 300_000)).toBe(42)
    const resumed: StoredTimer = { ...paused, endsAt: now + 42_000, pausedRemainingSec: undefined }
    expect(isTimerPaused(resumed)).toBe(false)
    expect(timerRemainingSec(resumed, now)).toBe(42)
  })

  it('本地存储里的脏数据不会被当成计时', () => {
    expect(isStoredTimer(null)).toBe(false)
    expect(isStoredTimer({ stepIndex: -1, endsAt: now, durationSec: 60 })).toBe(false)
    expect(isStoredTimer({ stepIndex: 0, endsAt: now, durationSec: 0 })).toBe(false)
    expect(isStoredTimer({ stepIndex: 0, endsAt: now, durationSec: 60 })).toBe(true)
    expect(
      isStoredTimer({ stepIndex: 0, endsAt: now, durationSec: 60, pausedRemainingSec: -1 }),
    ).toBe(false)
  })

  it('格式化与预设档位', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(75)).toBe('1:15')
    expect(formatClock(120)).toBe('2:00')
    expect(timerKey('recipe-x')).toBe('laoye.food.timer.v1:recipe-x')
    const withSuggestion = timerPresets(120)
    expect(withSuggestion[0]).toEqual({ label: '来源建议 2:00', seconds: 120 })
    expect(withSuggestion.filter((preset) => preset.seconds === 120)).toHaveLength(1)
    expect(timerPresets()[0]?.seconds).toBe(60)
  })
})

describe('内容文件与换算逻辑对得上', () => {
  const root = process.cwd()
  const recipes = JSON.parse(
    readFileSync(resolve(root, 'content/recipes.food.json'), 'utf8'),
  ) as {
    id: string
    verify?: string
    sourceIds?: string[]
    servings?: number | string
    ingredients?: { name: string; amount?: string }[]
    steps?: { text: string; ingredients?: string[] }[]
  }[]
  const sources = JSON.parse(
    readFileSync(resolve(root, 'content/sources.food.json'), 'utf8'),
  ) as { id: string }[]

  it('食谱用量都能被换算，说明文字不会被改成数字', () => {
    for (const recipe of recipes) {
      expect(parseServings(recipe.servings)).toBeGreaterThan(0)
      for (const ingredient of recipe.ingredients ?? []) {
        const scaled = scaleAmount(ingredient.amount, 2)
        expect(scaled.length).toBeGreaterThan(0)
        if (parseAmount(ingredient.amount)) {
          // 有数值的用量翻倍后必须变，且仍是「数字 + 单位」
          expect(scaled).not.toBe(ingredient.amount)
          expect(parseAmount(scaled)).not.toBeNull()
        }
      }
    }
  })

  it('步骤里引用的食材都在用料表里，引用的来源都真实存在', () => {
    const sourceIds = new Set(sources.map((source) => source.id))
    for (const recipe of recipes) {
      const names = new Set((recipe.ingredients ?? []).map((item) => item.name))
      for (const step of recipe.steps ?? []) {
        for (const name of step.ingredients ?? []) {
          expect(names.has(name), `${recipe.id} 步骤引用了未登记的食材「${name}」`).toBe(true)
        }
      }
      for (const id of recipe.sourceIds ?? []) {
        expect(sourceIds.has(id), `${recipe.id} 引用了不存在的来源「${id}」`).toBe(true)
      }
    }
  })
})
