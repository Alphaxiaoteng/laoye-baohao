/**
 * 继续扩充听潮：把 audio-source-cache.json 里尚未上线的真人发音补进来。
 * 只下载、转码与登记；不合成、不改读音。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const ROOT = process.cwd()
const DIR = path.join(ROOT, 'public/media/listen')
const AUDIO = path.join(ROOT, 'content/audio.listen.json')
const SOURCES = path.join(ROOT, 'content/sources.listen.json')
const CACHE = path.join(ROOT, 'scripts/audio-source-cache.json')

const MEANINGS = {
  後爿: ['culture', '后面、后边'],
  後來: ['culture', '后来'],
  無偌久: ['culture', '没有多久、不久'],
  '淒慘': ['culture', '凄惨、悲惨'],
  臺灣: ['culture', '台湾'],
  有所不知: ['culture', '有所不知'],
  查某: ['culture', '女性'],
  走囝: ['culture', '原录音页标注「走囝」'],
  諸娘: ['culture', '女性、妇女'],
  加拿大: ['culture', '加拿大'],
  廣州: ['culture', '广州'],
  新加坡: ['culture', '新加坡'],
  馬來西亞: ['culture', '马来西亚'],
  紅菜頭: ['tea-food', '红菜头'],
  火雞: ['tea-food', '火鸡'],
  火腿: ['tea-food', '火腿'],
  海鮮醬: ['tea-food', '海鲜酱'],
  旅行: ['culture', '旅行'],
  地圖: ['culture', '地图'],
  去: ['courtesy', '去、前往'],
  來: ['courtesy', '来'],
  行逷迌: ['culture', '散步、游玩'],
  泅水: ['culture', '游泳'],
  盛水: ['tea-food', '盛水、装水'],
  肉骨茶: ['tea-food', '肉骨茶'],
  雞卵粿: ['tea-food', '鸡卵粿'],
  麥粉粿: ['tea-food', '麦粉粿'],
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
const audio = readJson(AUDIO)
const sources = readJson(SOURCES)
const cache = readJson(CACHE)
mkdirSync(DIR, { recursive: true })

const usedText = new Set(audio.map((item) => item.text))
let seq = Math.max(...sources.map((s) => Number(/^S(\d+)$/.exec(s.id)?.[1] ?? 0))) + 1
const addedRows = []
let added = 0

function chineseOf(title) {
  const name = title.replace(/^File:/, '').replace(/\.(ogg|wav)$/i, '')
  const parts = [...name.matchAll(/[\u4e00-\u9fff]+/g)].map((m) => m[0])
  return parts.sort((a, b) => b.length - a.length)[0] ?? ''
}

for (const page of cache) {
  if (added >= 27) break
  const text = chineseOf(page.title)
  if (!text || usedText.has(text)) continue
  const info = page.imageinfo?.[0]
  if (!info) continue
  const [category, meaning] = MEANINGS[text] ?? ['culture', `原录音页标注「${text}」`]
  const slug = `more-${added + 1}-${text}`
  const file = path.join(DIR, `commons-${slug}.mp3`)
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(page.title.replace(/^File:/, ''))}`
  const tmp = path.join(DIR, `.tmp-${slug}`)

  let ok = false
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const status = execFileSync('curl', ['-sSL', '--max-time', '25', '-A', 'Mozilla/5.0', '-o', tmp, '-w', '%{http_code}', url], { encoding: 'utf8' }).trim()
      if (status !== '200') throw new Error(`HTTP ${status}`)
      if (!existsSync(tmp)) throw new Error('no file')
      execFileSync('ffmpeg', ['-y', '-i', tmp, '-ac', '1', '-b:a', '64k', file], { stdio: 'ignore' })
      const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' }).trim())
      if (!Number.isFinite(duration) || duration < 0.25) throw new Error(`时长 ${duration}`)
      const meta = info.extmetadata ?? {}
      const recorder = String(meta.Artist?.value ?? 'Wikimedia Commons').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      const license = meta.LicenseShortName?.value ?? 'CC BY-SA 4.0'
      const sourceId = `S${seq++}`
      const id = `audio-commons-${slug}`
      audio.push({ id, category, text, meaning, accent: page.title.startsWith('File:LL-') ? `潮州话 · Lingua Libre 母语者录音（${recorder}）` : '潮州话 · 普宁—潮阳混合口音（男声）', pinyin: '', file: `/media/listen/commons-${slug}.mp3`, recorder, license, sourceIds: [sourceId], durationSec: Math.round(duration * 100) / 100 })
      sources.push({ id: sourceId, title: `Wikimedia Commons 真人发音：${text}`, org: `Wikimedia Commons · ${recorder}`, url: info.descriptionurl, region: '潮州话（Teochew）', accessDate: '2026-11-07', verify: 'fetched', module: 'tingchao', note: `许可 ${license}。许可全文：https://creativecommons.org/licenses/by-sa/4.0/。署名：${recorder}, ${license}, via Wikimedia Commons。本站仅转码为单声道 MP3，未合成、未改动读音。` })
      addedRows.push(`| ${id} | \`commons-${slug}.mp3\` | ${info.descriptionurl} | ${recorder} | ${license} | ${duration.toFixed(2)}s |`)
      usedText.add(text)
      added += 1
      ok = true
      console.log(`OK ${text} ${duration.toFixed(2)}s`)
    } catch (error) {
      console.log(`retry ${text} #${attempt}: ${error.message.slice(0, 80)}`)
      await new Promise((resolve) => setTimeout(resolve, 3000 * attempt))
    }
  }
  try { execFileSync('rm', ['-f', tmp]) } catch { /* ignore */ }
  await new Promise((resolve) => setTimeout(resolve, 500))
}

writeFileSync(AUDIO, JSON.stringify(audio, null, 2) + '\n')
writeFileSync(SOURCES, JSON.stringify(sources, null, 2) + '\n')
if (addedRows.length > 0) {
  const file = path.join(DIR, 'ASSETS.md')
  writeFileSync(file, readFileSync(file, 'utf8') + `\n## 2026-11-07 继续补充（${addedRows.length} 条）\n\n| 词条 ID | 本地文件 | 原始文件页 | 录音者 | 许可 | 时长 |\n|---|---|---|---|---|---|\n${addedRows.join('\n')}\n`)
}
console.log(`新增 ${added} 条，听潮共 ${audio.length} 条。`)
