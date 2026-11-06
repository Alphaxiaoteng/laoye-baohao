import { describe, expect, test } from 'vitest'
import {
  classifyGesture,
  classifyStaticGesture,
  gestureFromHands,
  isHeartShape,
  type Gesture,
} from '../src/features/tea/gestures'

type Pt = { x: number; y: number }

const COL = { index: 0.44, middle: 0.5, ring: 0.56, pinky: 0.62 }

function finger(x: number, extended: boolean): Pt[] {
  const mcp = { x, y: 0.62 }
  const pip = { x, y: 0.5 }
  if (extended) {
    return [mcp, pip, { x, y: 0.38 }, { x, y: 0.24 }]
  }
  return [mcp, pip, { x, y: 0.6 }, { x, y: 0.66 }]
}

interface HandOpts {
  index: boolean
  middle: boolean
  ring: boolean
  pinky: boolean
  thumb: Pt[]
  indexOverride?: Pt[]
}

function makeHand(o: HandOpts): Pt[] {
  const wrist: Pt = { x: 0.5, y: 0.9 }
  const idx = o.indexOverride ?? finger(COL.index, o.index)
  return [
    wrist,
    ...o.thumb,
    ...idx,
    ...finger(COL.middle, o.middle),
    ...finger(COL.ring, o.ring),
    ...finger(COL.pinky, o.pinky),
  ]
}

const THUMB_FOLDED: Pt[] = [
  { x: 0.4, y: 0.78 },
  { x: 0.37, y: 0.7 },
  { x: 0.4, y: 0.62 },
  { x: 0.43, y: 0.56 },
]
const THUMB_UP: Pt[] = [
  { x: 0.38, y: 0.78 },
  { x: 0.35, y: 0.66 },
  { x: 0.32, y: 0.48 },
  { x: 0.29, y: 0.3 },
]
const THUMB_OUT: Pt[] = [
  { x: 0.38, y: 0.8 },
  { x: 0.32, y: 0.72 },
  { x: 0.26, y: 0.58 },
  { x: 0.2, y: 0.46 },
]
const THUMB_PINCH: Pt[] = [
  { x: 0.4, y: 0.78 },
  { x: 0.38, y: 0.7 },
  { x: 0.4, y: 0.55 },
  { x: 0.41, y: 0.45 },
]
const INDEX_PINCH: Pt[] = [
  { x: 0.44, y: 0.62 },
  { x: 0.44, y: 0.5 },
  { x: 0.42, y: 0.46 },
  { x: 0.4, y: 0.44 },
]

const cases: Array<{ name: string; hand: Pt[]; expect: Gesture }> = [
  {
    name: 'OPEN_HAND — all fingers extended',
    hand: makeHand({ index: true, middle: true, ring: true, pinky: true, thumb: THUMB_OUT }),
    expect: 'OPEN_HAND',
  },
  {
    name: 'FIST — all fingers curled, thumb tucked',
    hand: makeHand({ index: false, middle: false, ring: false, pinky: false, thumb: THUMB_FOLDED }),
    expect: 'FIST',
  },
  {
    name: 'ONE_FINGER — only index extended',
    hand: makeHand({ index: true, middle: false, ring: false, pinky: false, thumb: THUMB_FOLDED }),
    expect: 'ONE_FINGER',
  },
  {
    name: 'TWO_FINGER_DOWN — index + middle extended, others folded',
    hand: makeHand({ index: true, middle: true, ring: false, pinky: false, thumb: THUMB_FOLDED }),
    expect: 'TWO_FINGER_DOWN',
  },
  {
    name: 'PINCH — thumb meets index, others folded',
    hand: makeHand({
      index: false,
      middle: false,
      ring: false,
      pinky: false,
      thumb: THUMB_PINCH,
      indexOverride: INDEX_PINCH,
    }),
    expect: 'PINCH',
  },
  {
    name: 'THUMBS_UP — fingers folded, thumb raised on top',
    hand: makeHand({ index: false, middle: false, ring: false, pinky: false, thumb: THUMB_UP }),
    expect: 'THUMBS_UP',
  },
]

describe('tea gestures', () => {
  for (const c of cases) {
    test(c.name, () => {
      expect(classifyStaticGesture(c.hand)).toBe(c.expect)
    })
  }

  test('empty / malformed input returns NONE', () => {
    expect(classifyStaticGesture([])).toBe('NONE')
  })

  test('legacy classifyGesture still maps to static gesture', () => {
    expect(
      classifyGesture(
        makeHand({ index: true, middle: true, ring: true, pinky: true, thumb: THUMB_OUT }),
      ),
    ).toBe('OPEN_HAND')
  })

  test('HEART — two open hands facing each other', () => {
    const left: Pt[] = [
      { x: 0.35, y: 0.6 },
      { x: 0.3, y: 0.55 },
      { x: 0.28, y: 0.48 },
      { x: 0.26, y: 0.4 },
      { x: 0.28, y: 0.35 },
      { x: 0.4, y: 0.52 },
      { x: 0.4, y: 0.38 },
      { x: 0.41, y: 0.28 },
      { x: 0.42, y: 0.18 },
      { x: 0.46, y: 0.5 },
      { x: 0.48, y: 0.36 },
      { x: 0.49, y: 0.25 },
      { x: 0.5, y: 0.16 },
      { x: 0.52, y: 0.52 },
      { x: 0.55, y: 0.4 },
      { x: 0.58, y: 0.32 },
      { x: 0.6, y: 0.24 },
      { x: 0.58, y: 0.56 },
      { x: 0.62, y: 0.46 },
      { x: 0.66, y: 0.38 },
      { x: 0.69, y: 0.31 },
    ]
    const right: Pt[] = left.map((p) => ({ x: 1 - p.x, y: p.y }))
    expect(isHeartShape([left, right])).toBe(true)
    expect(gestureFromHands([left, right])).toBe('HEART')
  })

  test('HEART — false when only one hand', () => {
    expect(
      isHeartShape([
        makeHand({ index: true, middle: true, ring: true, pinky: true, thumb: THUMB_OUT }),
      ]),
    ).toBe(false)
  })

  test('gestureFromHands returns NONE when no hands', () => {
    expect(gestureFromHands([])).toBe('NONE')
  })
})
