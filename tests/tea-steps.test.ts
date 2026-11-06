import { describe, expect, test } from 'vitest'
import { BREW_STEPS, STEP_COUNT, stepLabel } from '../src/features/tea/steps'
import { GESTURE_LABELS } from '../src/features/tea/gestures'
import teaEntries from '../content/entries.tea.json'

interface TeaEntry {
  id: string
  title: string
  body?: string
  summary?: string
}

const entries = teaEntries as TeaEntry[]

function entry(id: string): TeaEntry | undefined {
  return entries.find((item) => item.id === id)
}

describe('tea brew steps', () => {
  test('has five ordered steps', () => {
    expect(STEP_COUNT).toBe(5)
    expect(BREW_STEPS.map((step) => step.id)).toEqual([1, 2, 3, 4, 5])
  })

  test('every step cites an exact stage from the verified tea-steps entry', () => {
    const source = entry('tea-steps')
    expect(source).toBeTruthy()
    const body = source?.body ?? ''
    for (const step of BREW_STEPS) {
      expect(body).toContain(step.sourceStage)
    }
  })

  test('every gesture has a human-readable label', () => {
    for (const step of BREW_STEPS) {
      expect(GESTURE_LABELS[step.gesture]).toBeTruthy()
    }
  })

  test('stepLabel reports the current step and completion', () => {
    expect(stepLabel(0, false)).toBe('温杯')
    expect(stepLabel(4, false)).toBe('敬茶')
    expect(stepLabel(4, true)).toBe('演示完成')
  })

  test('tea-pour entry does not present one pouring custom as the only standard', () => {
    const source = entry('tea-pour')
    expect(source).toBeTruthy()
    expect(source?.body ?? '').toContain('不作唯一标准')
  })
})
