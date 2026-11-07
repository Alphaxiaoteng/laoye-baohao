/**
 * 把 public/media/listen/commons-*.mp3 登记回 content/audio.listen.json。
 * 幂等：同 id 已存在则跳过。只写元数据，不改音频。
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const ROOT = process.cwd()
const AUDIO = path.join(ROOT, 'content/audio.listen.json')
const SOURCES = path.join(ROOT, 'content/sources.listen.json')
const CACHE = path.join(ROOT, 'scripts/audio-source-cache.json')
const DIR = path.join(ROOT, 'public/media/listen')

const MAP = {
  buygoose: ['bhoi2 gho5 lai7 ziah8', '買鵝來食', 'tea-food', '买鹅来吃'],
  ceng1ki3: ['cêng1 ki3', '清氣', 'culture', '清爽、干净'],
  china: ['Dong1-gog4', '中國', 'culture', '中国'],
  diam7: ['Diam7 diam7', '惦惦', 'culture', '安静地、静静地'],
  gang1dang1: ['gang1 dang1', '共同', 'culture', '共同、一起'],
  geng2dang1: ['geng2 dang1', '廣東', 'culture', '广东'],
  gig4ion5: ['gig4 ion5', '揭陽', 'culture', '揭阳'],
  mog8ceng5: ['mog8 cêng5', '疫情', 'culture', '疫情'],
  pou2leng5: ['pou2 lêng5', '普寧', 'culture', '普宁'],
  si3suan3dan3: ['si3 suan3 dan3', '四散呾', 'culture', '随口说、乱说'],
  'll-beef': ['', '牛肉', 'tea-food', '牛肉'],
  'll-big': ['', '大', 'culture', '大'],
  'll-congee': ['', '粥', 'tea-food', '粥'],
  'll-eat': ['', '食', 'tea-food', '吃、食'],
  'll-good': ['', '好', 'courtesy', '好'],
  'll-kueh': ['', '粿', 'tea-food', '粿（米制粿品）'],
  'll-me': ['', '我', 'courtesy', '我'],
  'll-rice': ['', '飯', 'tea-food', '饭'],
  'll-tea': ['', '茶米', 'tea-food', '茶叶'],
  'll-water': ['', '水', 'tea-food', '水'],
  'll-you': ['', '你', 'courtesy', '你'],
}

function readJson(file) { return JSON.parse(readFileSync(file, 'utf8')) }
const audio = readJson(AUDIO)
const sources = readJson(SOURCES)
const cache = readJson(CACHE)
let seq = Math.max(...sources.map((s) => Number(/^S(\d+)$/.exec(s.id)?.[1] ?? 0))) + 1

const slugs = readdirSync(DIR).filter((f) => f.startsWith('commons-') && f.endsWith('.mp3')).map((f) => f.slice(8, -4)).sort()
let added = 0

for (const slug of slugs) {
  const id = `audio-commons-${slug}`
  if (audio.some((item) => item.id === id)) continue
  const spec = MAP[slug]
  if (!spec) { console.error('SKIP 未映射', slug); continue }
  const [pinyin, text, category, meaning] = spec
  const page = cache.find((item) => item.title.includes(text) || item.title.includes(slug))
  const info = page?.imageinfo?.[0]
  const meta = info?.extmetadata ?? {}
  const license = meta.LicenseShortName?.value || 'CC BY-SA 4.0'
  const recorder = String(meta.Artist?.value || 'Wikimedia Commons').replace(/<[^>]*>/g, '').trim()
  const url = info?.descriptionurl || 'https://commons.wikimedia.org/'
  const file = path.join(DIR, `commons-${slug}.mp3`)
  const durationSec = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' }).trim())
  const sourceId = `S${seq++}`
  audio.push({ id, category, text, meaning, accent: page?.title.startsWith('File:LL-') ? `潮州话 · Lingua Libre 母语者录音（${recorder}）` : '潮州话 · 普宁—潮阳混合口音（男声）', pinyin, file: `/media/listen/commons-${slug}.mp3`, recorder, license, sourceIds: [sourceId], durationSec: Math.round(durationSec * 100) / 100 })
  sources.push({ id: sourceId, title: `Wikimedia Commons 真人发音：${text}`, org: `Wikimedia Commons · ${recorder}`, url, region: '潮州话（Teochew）', accessDate: '2026-11-07', verify: 'fetched', module: 'tingchao', note: `许可 ${license}。本站仅转码为单声道 MP3，未合成、未改动读音。` })
  added += 1
}

writeFileSync(AUDIO, JSON.stringify(audio, null, 2) + '\n')
writeFileSync(SOURCES, JSON.stringify(sources, null, 2) + '\n')
console.log(`新增 ${added} 条，听潮共 ${audio.length} 条，来源 ${sources.length} 条。`)
