/**
 * 卡片文案：只从原文里取一句短描述，不新写内容。
 * 规则：按中文标点切成小句，能拼到 max 字以内就拼，拼不下就退回第一句；
 * 第一句本身超长时才截断加省略号。
 */
export function shortDescription(text: string | undefined, max = 20): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim()
  if (!clean) return ''

  const clauses = clean
    .split(/[，,。；;：:、]/)
    .map((clause) => clause.trim())
    .filter(Boolean)

  let picked = ''
  for (const clause of clauses) {
    const next = picked ? `${picked}，${clause}` : clause
    if (Array.from(next).length > max) break
    picked = next
  }
  if (picked) return picked

  const chars = Array.from(clean)
  if (chars.length <= max) return clean
  return `${chars.slice(0, max - 1).join('')}…`
}
