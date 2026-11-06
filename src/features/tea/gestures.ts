/**
 * 手部关键点分类（纯函数，无 DOM 依赖）。
 *
 * 移植自 TeaDemo 的 src/utils/gestures.ts（该仓库根目录没有 LICENSE 文件，
 * 许可证状态未声明；详见本目录 ASSETS.md）。
 * 逻辑只做几何判断，不包含任何文化事实。
 */
export type Gesture =
  | 'OPEN_HAND'
  | 'PINCH'
  | 'ONE_FINGER'
  | 'TWO_FINGER_DOWN'
  | 'FIST'
  | 'THUMBS_UP'
  | 'HEART'
  | 'NONE'

export const GESTURE_LABELS: Record<Gesture, string> = {
  OPEN_HAND: '五指张开',
  PINCH: '拇指食指捏合',
  ONE_FINGER: '食指竖起',
  TWO_FINGER_DOWN: '食指中指两指',
  FIST: '握拳',
  THUMBS_UP: '竖拇指',
  HEART: '双手比心',
  NONE: '未检测到手',
}

interface Pt {
  x: number
  y: number
  z?: number
}

const WRIST = 0
const THUMB_TIP = 4
const INDEX_MCP = 5
const INDEX_PIP = 6
const INDEX_TIP = 8
const MIDDLE_PIP = 10
const MIDDLE_TIP = 12
const RING_PIP = 14
const RING_TIP = 16
const PINKY_PIP = 18
const PINKY_TIP = 20

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

// Finger extended if its tip is higher (smaller y) than its PIP joint.
// Assumes the hand is held roughly upright in a webcam selfie view.
export function isFingerExtended(lm: Pt[], tipIdx: number, pipIdx: number): boolean {
  return lm[tipIdx].y < lm[pipIdx].y
}

/**
 * Static classification for a single hand.
 * For TWO_FINGER_DOWN we only check shape (index+middle up, ring+pinky folded).
 * The downward motion is not tracked; the page only needs the shape.
 */
export function classifyStaticGesture(lm: Pt[]): Gesture {
  if (!lm || lm.length < 21) return 'NONE'

  const indexExt = isFingerExtended(lm, INDEX_TIP, INDEX_PIP)
  const middleExt = isFingerExtended(lm, MIDDLE_TIP, MIDDLE_PIP)
  const ringExt = isFingerExtended(lm, RING_TIP, RING_PIP)
  const pinkyExt = isFingerExtended(lm, PINKY_TIP, PINKY_PIP)
  const extendedCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length

  const wrist = lm[WRIST]
  const scale = dist(wrist, lm[INDEX_MCP]) || 1e-6

  // PINCH: thumb tip meets index tip, index is reaching out, other fingers folded.
  const pinchDist = dist(lm[THUMB_TIP], lm[INDEX_TIP]) / scale
  const indexReaching = dist(lm[INDEX_TIP], wrist) > dist(lm[INDEX_MCP], wrist)
  if (pinchDist < 0.5 && indexReaching && !middleExt && !ringExt && !pinkyExt) {
    return 'PINCH'
  }

  // THUMBS_UP: all fingers folded, thumb is the topmost point and clearly raised.
  const topmost = lm.reduce((m, p) => (p.y < m.y ? p : m), lm[0])
  const thumbIsTop = topmost === lm[THUMB_TIP]
  const thumbRaised = lm[INDEX_MCP].y - lm[THUMB_TIP].y > 0.6 * scale
  if (extendedCount === 0 && thumbIsTop && thumbRaised) {
    return 'THUMBS_UP'
  }

  // TWO_FINGER_DOWN shape: index + middle extended, ring + pinky folded.
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    return 'TWO_FINGER_DOWN'
  }

  if (extendedCount === 0) return 'FIST'
  if (extendedCount === 1 && indexExt) return 'ONE_FINGER'
  if (extendedCount >= 3) return 'OPEN_HAND'

  return 'NONE'
}

/**
 * Determine if two hands together form a HEART shape.
 * Heuristic: both hands are OPEN_HAND and their wrists are roughly symmetric
 * with the fingertips pointing toward each other.
 */
export function isHeartShape(hands: Pt[][]): boolean {
  if (!hands || hands.length !== 2) return false
  const [a, b] = hands
  const ga = classifyStaticGesture(a)
  const gb = classifyStaticGesture(b)
  if (ga !== 'OPEN_HAND' || gb !== 'OPEN_HAND') return false

  const aCenter = a[9] // middle finger MCP as palm center proxy
  const bCenter = b[9]
  const centerDist = dist(aCenter, bCenter)
  const aSize = dist(a[0], aCenter)
  const bSize = dist(b[0], bCenter)
  const avgSize = (aSize + bSize) / 2

  // Hands should be reasonably close, not too far apart.
  if (centerDist > avgSize * 3.5) return false

  // Fingertips of both hands should roughly point toward each other.
  const aTipX = (a[INDEX_TIP].x + a[PINKY_TIP].x) / 2
  const bTipX = (b[INDEX_TIP].x + b[PINKY_TIP].x) / 2
  const aCenterX = aCenter.x
  const bCenterX = bCenter.x

  const aPointsRight = aTipX > aCenterX
  const bPointsLeft = bTipX < bCenterX
  return aPointsRight && bPointsLeft
}

/** 单手法分类（保留 TeaDemo 的旧接口名，便于对照） */
export function classifyGesture(lm: Pt[]): Gesture {
  return classifyStaticGesture(lm)
}

/** 把双手结果折叠成一个手势；比心优先 */
export function gestureFromHands(hands: Pt[][]): Gesture {
  if (!hands || hands.length === 0) return 'NONE'
  if (hands.length === 2 && isHeartShape(hands)) return 'HEART'
  return classifyStaticGesture(hands[0])
}
