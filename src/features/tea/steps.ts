import type { Gesture } from './gestures'

/**
 * 工夫茶分步演示的五个步骤。
 *
 * 事实来源：content/entries.tea.json 的 `tea-steps` 条目
 * （S2 中国非物质文化遗产网·茶艺（潮州工夫茶艺）项目页）。
 * 这里只把该页列出的环节按顺序归并成五步，不补充水温、时长、次数等
 * 原文没有给出的信息，也不声称这是唯一标准程式。
 *
 * 手势只是可选增强，动作取自 TeaDemo 的演示设计，不对应任何仪式含义。
 */
export interface BrewStep {
  id: number
  /** 短名，用于进度点与问一问上下文 */
  name: string
  title: string
  tip: string
  /** 项目页原文中的对应环节，便于核对，必须能在 tea-steps 正文里找到 */
  sourceStage: string
  /** 可选手势（实验功能用） */
  gesture: Gesture
  gestureName: string
  gestureIcon: string
  gestureExplain: string
}

export const BREW_STEPS: BrewStep[] = [
  {
    id: 1,
    name: '温杯',
    title: '温杯热罐',
    tip: '把茶具摆开、净手煮水，再热罐温盅。',
    sourceStage: '茶具讲示、茶师净手、生火煮水、热罐温盅',
    gesture: 'OPEN_HAND',
    gestureName: '五指张开',
    gestureIcon: '✋',
    gestureExplain: '掌心向前，五指张开。',
  },
  {
    id: 2,
    name: '取茶',
    title: '纳茶洗茶',
    tip: '把茶叶放进壶或盖碗，再洗茶。',
    sourceStage: '纳茶与洗茶',
    gesture: 'PINCH',
    gestureName: '拇指食指捏合',
    gestureIcon: '🤏',
    gestureExplain: '拇指和食指捏在一起，像捏起一撮茶叶。',
  },
  {
    id: 3,
    name: '注水',
    title: '高冲注水',
    tip: '提铫高冲，刮沫淋盖。',
    sourceStage: '提铫高冲、刮沫淋盖',
    gesture: 'ONE_FINGER',
    gestureName: '食指竖起',
    gestureIcon: '☝️',
    gestureExplain: '竖起一根食指，指向上方。',
  },
  {
    id: 4,
    name: '出汤',
    title: '出汤分茶',
    tip: '烫杯滚杯后，低洒分茶。',
    sourceStage: '烫杯滚杯、低洒分茶',
    gesture: 'TWO_FINGER_DOWN',
    gestureName: '食指中指两指',
    gestureIcon: '✌️',
    gestureExplain: '伸出食指和中指（向下表示出汤）。',
  },
  {
    id: 5,
    name: '敬茶',
    title: '敬茶闻香',
    tip: '请客人品味，闻香，三嗅杯底。',
    sourceStage: '敬请品味、闻香与三嗅杯底',
    gesture: 'HEART',
    gestureName: '双手比心',
    gestureIcon: '🫶',
    gestureExplain: '两只手一起在胸前合成一个心形（演示用）。',
  },
]

export const STEP_COUNT = BREW_STEPS.length
export const LAST_STEP_INDEX = STEP_COUNT - 1

/** 自动演示每一步停留的时间范围：文案短就走快一点，长就多留一会儿 */
const DWELL_MIN_MS = 2500
const DWELL_MAX_MS = 4000
/** 字数窗口（标题 + 提示语），落在窗口内线性插值，超出就取上下限 */
const DWELL_SHORT_CHARS = 12
const DWELL_LONG_CHARS = 26

/**
 * 自动演示时这一步停留多久（毫秒）。
 * 用「标题 + 提示语」的字数在 2.5–4 秒之间插值，四舍五入到 100ms，
 * 保证单步不会快到看不清，也不会慢到让人等。
 */
export function stepDwellMs(step: BrewStep): number {
  const chars = [...`${step.title}${step.tip}`].length
  const ratio = (chars - DWELL_SHORT_CHARS) / (DWELL_LONG_CHARS - DWELL_SHORT_CHARS)
  const clamped = Math.min(1, Math.max(0, ratio))
  const ms = DWELL_MIN_MS + clamped * (DWELL_MAX_MS - DWELL_MIN_MS)
  return Math.round(ms / 100) * 100
}

/** 给「问一问」用的步骤标签 */
export function stepLabel(index: number, done: boolean): string {
  if (done) return '演示完成'
  const step = BREW_STEPS[Math.min(Math.max(index, 0), LAST_STEP_INDEX)]
  return step ? step.name : ''
}
