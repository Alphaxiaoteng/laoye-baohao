/**
 * 份量换算。
 * 只做确定的整数 / 分数倍乘，比例来自原始用量字符串本身；
 * 不改任何工艺参数（时间、火候、刀工），也不调用模型。
 */

/** 允许的份量倍数：半份、原份、两倍、三倍 */
export const SERVING_FACTORS = [0.5, 1, 2, 3] as const

export type ServingFactor = (typeof SERVING_FACTORS)[number]

export interface ParsedAmount {
  value: number
  /** 单位，可能为空字符串（例如「1 份」） */
  unit: string
}

/** 「50 g」「0.5 g」「200 mL」「1 份」「2 个」→ { value, unit } */
const AMOUNT_RE = /^\s*(\d+(?:\.\d+)?)\s*(.*?)\s*$/

export function parseAmount(raw: string | undefined): ParsedAmount | null {
  if (typeof raw !== 'string') return null
  const match = AMOUNT_RE.exec(raw)
  if (!match) return null
  const value = Number(match[1])
  if (!Number.isFinite(value)) return null
  return { value, unit: match[2] ?? '' }
}

/**
 * 数字格式化：最多三位小数，去掉无意义的尾随 0。
 * 0.1 × 0.5 = 0.05000000000000001 这类浮点误差会在这里被抹平。
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return ''
  const rounded = Math.round(value * 1000) / 1000
  if (Number.isInteger(rounded)) return String(rounded)
  return String(rounded)
}

/**
 * 按倍数换算一条用量；无法解析的数字（例如「适量」「若干」）原样返回，
 * 这样不会把没有数值的说明凭空变成数字。
 */
export function scaleAmount(raw: string | undefined, factor: number): string {
  if (typeof raw !== 'string' || raw.trim() === '') return raw ?? ''
  if (!Number.isFinite(factor) || factor <= 0) return raw
  const parsed = parseAmount(raw)
  if (!parsed) return raw
  const unit = parsed.unit ? ` ${parsed.unit}` : ''
  return `${formatNumber(parsed.value * factor)}${unit}`
}

/** 基础份量可能是字符串（"1"）或数字，统一成数字；解析失败按 1 份 */
export function parseServings(raw: string | number | undefined): number {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw
  if (typeof raw === 'string') {
    const parsed = parseAmount(raw)
    if (parsed && parsed.value > 0) return parsed.value
  }
  return 1
}

/** 「约 2 人份」；倍数带小数时保留小数，避免四舍五入编造份数 */
export function servingsSummary(base: number, factor: number): string {
  const total = parseServings(base) * factor
  return `约 ${formatNumber(total)} 人份`
}

/**
 * 份量的展示文案：纯数字补成「n 人份」；
 * 「按 1 kg 鲜牛肉计」这类工艺份量原样照抄，不折算成人份。
 */
export function servingsText(raw: string | number | undefined): string {
  const value = typeof raw === 'number' ? formatNumber(raw) : (raw ?? '').trim()
  if (!value) return servingsSummary(1, 1)
  return /^\d+(\.\d+)?$/.test(value) ? `${formatNumber(Number(value))} 人份` : value
}

/** 倍数按钮上的短标签 */
export function factorLabel(factor: number): string {
  if (factor === 0.5) return '半份'
  if (factor === 1) return '原份量'
  if (factor === 2) return '两倍'
  if (factor === 3) return '三倍'
  return `×${formatNumber(factor)}`
}
