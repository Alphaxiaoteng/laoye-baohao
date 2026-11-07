/** 补齐最后一批带明确汉字标注的潮州话真人发音。 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const ROOT = process.cwd()
const DIR = path.join(ROOT, 'public/media/listen')
const audio = JSON.parse(readFileSync(path.join(ROOT, 'content/audio.listen.json'), 'utf8'))
const sources = JSON.parse(readFileSync(path.join(ROOT, 'content/sources.listen.json'), 'utf8'))
const cache = JSON.parse(readFileSync(path.join(ROOT, 'scripts/audio-source-cache.json'), 'utf8'))

const SPECS = [
  ['ao6 bain5', '後爿', 'culture', '后面、后边'],
  ['Ao6 lai5', '後來', 'culture', '后来'],
  ['Bho5 rioh8 gu2', '無偌久', 'culture', '没有多久、不久'],
  ['ci1 cam2', '淒慘', 'culture', '凄惨、悲惨'],
  ['tai5 uang1', '臺灣', 'culture', '台湾'],
  ['U6 so2 bug4 zai1', '有所不知', 'culture', '有所不知'],
  ['za1 bhou2', '查某', 'culture', '女性'],
  ['zao2 gian2', '走囝', 'culture', '原录音页标注「走囝」'],
  ['zu1 nio5', '諸娘', 'culture', '女性、妇女'],
  ['ang5 cai3 tao5', '紅菜頭', 'tea-food', '红菜头'],
]

let seq = Math.max(...sources.map((s) => Number(/^S(\d+)$/.exec(s.id)?.[1] ?? 0))) + 1
const rows = []
let added = 0

for (const [match, text, category, meaning] of SPECS) {
  if (audio.some((item) => item.text === text)) continue
  const page = cache.find((item) => item.title.includes(match))
  const info = page?.imageinfo?.[0]
  if (!info) { console.log('SKIP 无来源', text); continue }
  const slug = `final-${text}`
  const file = path.join(DIR, `commons-${slug}.mp3`)
  const tmp = path.join(DIR, `.tmp-${slug}`)
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(page.title.replace(/^File:/, ''))}`
  try {
    const status = execFileSync('curl', ['-sSL', '--max-time', '25', '-A', 'Mozilla/5.0', '-o', tmp, '-w', '%{http_code}', url], { encoding: 'utf8' }).trim()
    if (status !== '200' || !existsSync(tmp)) throw new Error(`HTTP ${status}`)
    execFileSync('ffmpeg', ['-y', '-i', tmp, '-ac', '1', '-b:a', '64k', file], { stdio: 'ignore' })
    const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' }).trim())
    const meta = info.extmetadata ?? {}
    const recorder = String(meta.Artist?.value ?? 'Austin Zhang').replace(/<[^>]*>/g, '').trim()
    const license = meta.LicenseShortName?.value ?? 'CC BY-SA 4.0'
    const sourceId = `S${seq++}`
    const id = `audio-commons-${slug}`
    audio.push({ id, category, text, meaning, accent: '潮州话 · 普宁—潮阳混合口音（男声）', pinyin: match, file: `/media/listen/commons-${slug}.mp3`, recorder, license, sourceIds: [sourceId], durationSec: Math.round(duration * 100) / 100 })
    sources.push({ id: sourceId, title: `Wikimedia Commons 真人发音：${text}`, org: `Wikimedia Commons · ${recorder}`, url: info.descriptionurl, region: '潮州话（Teochew）', accessDate: '2026-11-07', verify: 'fetched', module: 'tingchao', note: `许可 ${license}。许可全文：https://creativecommons.org/licenses/by-sa/4.0/。署名：${recorder}, ${license}, via Wikimedia Commons。本站仅转码为单声道 MP3，未合成、未改动读音。` })
    rows.push(`| ${id} | \`commons-${slug}.mp3\` | ${info.descriptionurl} | ${recorder} | ${license} | ${duration.toFixed(2)}s |`)
    added += 1
    console.log('OK', text, duration.toFixed(2) + 's')
  } catch (error) {
    console.log('FAIL', text, error.message.slice(0, 80))
  }
  try { execFileSync('rm', ['-f', tmp]) } catch { /* ignore */ }
}

writeFileSync(path.join(ROOT, 'content/audio.listen.json'), JSON.stringify(audio, null, 2) + '\n')
writeFileSync(path.join(ROOT, 'content/sources.listen.json'), JSON.stringify(sources, null, 2) + '\n')
if (rows.length > 0) {
  const assets = path.join(DIR, 'ASSETS.md')
  writeFileSync(assets, readFileSync(assets, 'utf8') + `\n## 2026-11-07 最后补录（${rows.length} 条）\n\n| 词条 ID | 本地文件 | 原始文件页 | 录音者 | 许可 | 时长 |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n`)
}
console.log(`新增 ${added}，听潮共 ${audio.length} 条。`)
