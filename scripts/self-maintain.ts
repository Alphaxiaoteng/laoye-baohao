/**
 * 每日自维护体检（不调用模型、不产生费用）。
 *
 *   npm run maintain
 *
 * 做四件事：
 *   1. 跑内容校验（内容不合法就非零退出，线上应保留上一版）
 *   2. 检查来源与攻略的时效（超过阈值进报告，不自动删）
 *   3. 检查攻略封面是否真的落地在 public/media/guide
 *   4. 输出 docs/maintenance-report.json，便于定时任务与人工巡检
 *
 * 设计原则：自动发现问题，不自动改内容。
 * 需要模型参与「写新内容」时，由后续的 fetch + LLM 管线以 draft 形式写入，
 * 经审核后才进入 content/*.json，避免自维护把未经核验的内容推上线。
 */
import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadContent } from '../server/content'
import { validateContent } from './validate-content'

const ROOT = process.cwd()
const SOURCE_STALE_DAYS = 240
const GUIDE_STALE_DAYS = 365

function daysSince(date: string | undefined): number | null {
  if (!date) return null
  const t = Date.parse(date)
  if (Number.isNaN(t)) return null
  return Math.floor((Date.now() - t) / 86_400_000)
}

const content = loadContent()
const validation = validateContent(content)
const today = new Date().toISOString().slice(0, 10)

const staleSources = content.sources
  .map((source) => ({ id: source.id, title: source.title, age: daysSince(source.accessDate) }))
  .filter((item) => item.age !== null && item.age > SOURCE_STALE_DAYS)
  .sort((a, b) => (b.age ?? 0) - (a.age ?? 0))

const guideSources = content.sources.filter((source) => source.module === 'guide')
const staleGuides = guideSources
  .map((source) => ({ id: source.id, title: source.title, age: daysSince(source.accessDate) }))
  .filter((item) => item.age !== null && item.age > GUIDE_STALE_DAYS)

const guides = content.guides ?? []
const missingCovers = guides.filter((guide) => {
  if (!guide.cover) return false
  const file = guide.cover.replace(/^\//, '')
  return !existsSync(resolve(ROOT, 'public', file))
})

const report = {
  generatedAt: new Date().toISOString(),
  counts: {
    entries: content.entries.length,
    story: content.story.length,
    recipes: content.recipes.length,
    audio: content.audio.length,
    sources: content.sources.length,
    guides: guides.length,
  },
  validation: {
    errors: validation.errors,
    warnings: validation.warnings,
  },
  freshness: {
    thresholdDays: SOURCE_STALE_DAYS,
    staleSources,
    staleGuides,
  },
  assets: {
    missingGuideCovers: missingCovers.map((guide) => ({ id: guide.id, cover: guide.cover })),
  },
  nextActions: [] as string[],
}

if (validation.errors.length > 0) {
  report.nextActions.push('内容校验未通过：先修 content/*.json，再发布；线上保留上一版。')
}
if (missingCovers.length > 0) {
  report.nextActions.push('攻略封面缺失：重新运行 scripts/fetch-xhs-guide.mjs 补齐图片。')
}
if (staleSources.length > 0) {
  report.nextActions.push(`有 ${staleSources.length} 条来源访问日期超过 ${SOURCE_STALE_DAYS} 天，安排复核。`)
}
if (staleGuides.length > 0) {
  report.nextActions.push(`攻略数据超过 ${GUIDE_STALE_DAYS} 天未刷新，重新抓取并人工过一遍。`)
}
if (report.nextActions.length === 0) {
  report.nextActions.push('无需处理。')
}

const out = resolve(ROOT, 'docs/maintenance-report.json')
writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

console.log(`[maintain] ${today} 体检完成`)
console.log(
  `[maintain] 条目 ${report.counts.entries} · 食谱 ${report.counts.recipes} · 听潮 ${report.counts.audio} · 攻略 ${report.counts.guides} · 来源 ${report.counts.sources}`,
)
console.log(`[maintain] 校验错误 ${validation.errors.length} · 警告 ${validation.warnings.length}`)
console.log(`[maintain] 报告：docs/maintenance-report.json`)
for (const action of report.nextActions) console.log(`[maintain] → ${action}`)

if (validation.errors.length > 0) process.exitCode = 1
