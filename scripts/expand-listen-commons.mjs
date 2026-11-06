/**
 * 扩充听潮：只收录 Wikimedia Commons / Lingua Libre 的真人发音。
 * 用法：node scripts/expand-listen-commons.mjs
 * 幂等：已有 audio id 跳过；新增音频、来源与授权登记一起落盘。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public/media/listen')
const AUDIO_FILE = path.join(ROOT, 'content/audio.listen.json')
const SOURCE_FILE = path.join(ROOT, 'content/sources.listen.json')
const ASSETS_FILE = path.join(OUT, 'ASSETS.md')
const UA = { 'User-Agent': 'Mozilla/5.0' }

const SPECS = [
  // Teochew pronunciation · Austin Zhang（原页有明确汉字与口音）
  ['ao6bain5', 'ao6 bain5', '後爿', 'culture', '后面、后边（原录音页标注「後爿」）', 'ao6 bain5'],
  ['ao6lai5', 'Ao6 lai5', '後來', 'culture', '后来', 'ao6 lai5'],
  ['bho5rioh8gu2', 'Bho5 rioh8 gu2', '無偌久', 'culture', '没有多久、不久', 'bho5 rioh8 gu2'],
  ['buygoose', 'bhoi2 gho5 lai7 ziah8', '買鵝來食', 'tea-food', '买鹅来吃（原录音页英文释义：buy geese to eat）', 'bhoi2 gho5 lai7 ziah8'],
  ['ceng1ki3', 'cêng1 ki3.ogg', '清氣', 'culture', '清爽、凉快（原录音页标注「清氣」）', 'cêng1 ki3'],
  ['ci1cam2', 'ci1 cam2', '淒慘', 'culture', '凄惨、悲惨', 'ci1 cam2'],
  ['diam7', 'Diam7 diam7', '惦惦', 'culture', '安静地、静静地（原录音页标注「惦惦」）', 'diam7 diam7'],
  ['china', 'Dong1-gog4.ogg', '中國', 'culture', '中国（地名）', 'dong1 gog4'],
  ['gang1dang1', 'gang1 dang1', '共同', 'culture', '共同、一起（原录音页标注「共同」）', 'gang1 dang1'],
  ['gang1kou2', 'gang1 kou2', '艱苦', 'culture', '艰苦', 'gang1 kou2'],
  ['geng2dang1', 'geng2 dang1', '廣東', 'culture', '广东（地名）', 'geng2 dang1'],
  ['gig4ion5', 'gig4 ion5', '揭陽', 'culture', '揭阳（地名）', 'gig4 ion5'],
  ['mog8ceng5', 'mog8 cêng5', '疫情', 'culture', '疫情', 'mog8 cêng5'],
  ['pou2leng5', 'pou2 lêng5', '普寧', 'culture', '普宁（地名）', 'pou2 lêng5'],
  ['si3suan3dan3', 'si3 suan3 dan3', '四散呾', 'culture', '随口说、乱说（原录音页标注「四散呾」）', 'si3 suan3 dan3'],
  ['tai5uang1', 'tai5 uang1', '臺灣', 'culture', '台湾（地名）', 'tai5 uang1'],
  ['u6so2bug4zai1', 'U6 so2 bug4 zai1', '有所不知', 'culture', '有所不知（原录音页标注）', 'u6 so2 bug4 zai1'],
  ['za1bhou2', 'za1 bhou2', '查某', 'culture', '女性（原录音页标注「查某」）', 'za1 bhou2'],
  ['zao2gian2', 'zao2 gian2', '走囝', 'culture', '原录音页标注「走囝」', 'zao2 gian2'],
  ['zu1nio5', 'zu1 nio5', '諸娘', 'culture', '女性、妇女（原录音页标注「諸娘」）', 'zu1 nio5'],
  ['canada', '加拿大.ogg', '加拿大', 'culture', '加拿大（地名）', ''],
  ['guangzhou', '廣州.ogg', '廣州', 'culture', '广州（地名）', ''],
  ['singapore', '新加坡.ogg', '新加坡', 'culture', '新加坡（地名）', ''],
  ['malaysia', '馬來西亞.ogg', '馬來西亞', 'culture', '马来西亚（地名）', ''],
  ['ang5cai3tao5', 'ang5 cai3 tao5', '紅菜頭', 'tea-food', '红菜头（原录音页未附普通话释义）', 'ang5 cai3 tao5'],

  // Lingua Libre · Assassas77 / Apsaltini / Ah Mean（真实母语者录音）
  ['ll-you', 'Assassas77-你.wav', '你', 'courtesy', '你', ''],
  ['ll-me', 'Assassas77-我.wav', '我', 'courtesy', '我', ''],
  ['ll-good', 'Assassas77-好.wav', '好', 'courtesy', '好', ''],
  ['ll-big', 'Assassas77-大.wav', '大', 'culture', '大', ''],
  ['ll-water', 'Assassas77-水.wav', '水', 'tea-food', '水', ''],
  ['ll-eat', 'Assassas77-食.wav', '食', 'tea-food', '吃、食', ''],
  ['ll-rice', 'Assassas77-飯.wav', '飯', 'tea-food', '饭', ''],
  ['ll-congee', 'Assassas77-粥.wav', '粥', 'tea-food', '粥', ''],
  ['ll-beef', 'Assassas77-牛肉.wav', '牛肉', 'tea-food', '牛肉', ''],
  ['ll-kueh', 'Assassas77-粿.wav', '粿', 'tea-food', '粿（米制粿品称法）', ''],
  ['ll-tea', 'Assassas77-茶米.wav', '茶米', 'tea-food', '茶叶（原录音页标注「茶米」）', ''],
  ['ll-bakuteh', 'Assassas77-肉骨茶.wav', '肉骨茶', 'tea-food', '肉骨茶', ''],
  ['ll-eggkueh', 'Assassas77-雞卵粿.wav', '雞卵粿', 'tea-food', '鸡卵粿（原录音页标注）', ''],
  ['ll-wheatkueh', 'Assassas77-麥粉粿.wav', '麥粉粿', 'tea-food', '麦粉粿（原录音页标注）', ''],
  ['ll-turkey', 'Assassas77-火雞.wav', '火雞', 'tea-food', '火鸡', ''],
  ['ll-ham', 'Assassas77-火腿.wav', '火腿', 'tea-food', '火腿', ''],
  ['ll-hoisin', 'Assassas77-hai2(6)_chin1_jion3_海鲜醬', '海鮮醬', 'tea-food', '海鲜酱', 'hai2 chin1 jion3'],
  ['ll-travel', 'Apsaltini-li2(6)_gian5_旅行', '旅行', 'culture', '旅行', 'li2 gian5'],
  ['ll-map', 'Apsaltini-di7_dou5_地圖', '地圖', 'culture', '地图', 'di7 dou5'],
  ['ll-go', 'Apsaltini-keu3_去_-aller', '去', 'courtesy', '去、前往', 'keu3'],
  ['ll-come', 'Assassas77-lai5_來_-to_come', '來', 'courtesy', '来', 'lai5'],
  ['ll-walk', 'Apsaltini-gian5(7)_tik4(8)_to5_行逷迌', '行逷迌', 'culture', '散步、游玩（原录音页标注「行逷迌」）', 'gian5 tik4 to5'],
  ['ll-swim', 'Apsaltini-siu5(7)_jui2_泅水', '泅水', 'culture', '游泳（原录音页标注「泅水」）', 'siu5 jui2'],
  ['ll-fillwater', 'Ah_Mean_(Kitkatmaw)-seng5(7)_jui2_盛水', '盛水', 'tea-food', '盛水、装水', 'seng5 jui2'],
]

function readJson(file) { return JSON.parse(readFileSync(file, 'utf8')) }
function writeJson(file, data) { writeFileSync(file, JSON.stringify(data, null, 2) + '\n') }
function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }
async function download(url, attempt = 1) {
  const response = await fetch(url, { headers: UA })
  if (response.status === 429 && attempt <= 6) {
    await sleep(5000 * attempt)
    return download(url, attempt + 1)
  }
  return response
}
function stripHtml(value = '') { return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() }

async function api(params, attempt = 1) {
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ format: 'json', ...params })}`
  const response = await fetch(url, { headers: UA })
  if (response.status === 429 && attempt <= 5) {
    await sleep(5000 * attempt)
    return api(params, attempt + 1)
  }
  if (!response.ok) throw new Error(`Commons API ${response.status}`)
  return response.json()
}

async function details(titles) {
  const result = new Map()
  for (let i = 0; i < titles.length; i += 20) {
    const json = await api({ action: 'query', titles: titles.slice(i, i + 20).join('|'), prop: 'imageinfo', iiprop: 'url|extmetadata' })
    for (const page of Object.values(json.query?.pages ?? {})) result.set(page.title, page)
    await sleep(1200)
  }
  return result
}

const audio = readJson(AUDIO_FILE)
const sources = readJson(SOURCE_FILE)
mkdirSync(OUT, { recursive: true })

const CACHE_FILE = path.join(ROOT, 'scripts/audio-source-cache.json')
let catalog
if (existsSync(CACHE_FILE)) {
  catalog = readJson(CACHE_FILE)
} else {
  const category = await api({ action: 'query', generator: 'categorymembers', gcmtitle: 'Category:Teochew_pronunciation', gcmtype: 'file', gcmlimit: '100', prop: 'imageinfo', iiprop: 'url|extmetadata' })
  const ll = await api({ action: 'query', list: 'allimages', aiprefix: 'LL-Q36759-', ailimit: '500', aiprop: 'url|size' })
  const titles = [
    ...Object.values(category.query?.pages ?? {}).map((page) => page.title),
    ...(ll.query?.allimages ?? []).map((item) => `File:${item.name}`),
  ].filter((title) => SPECS.some(([, match]) => title.includes(match)))
  catalog = await details(titles)
  writeJson(CACHE_FILE, catalog)
}

let nextSource = Math.max(...sources.map((item) => /^S(\d+)$/.exec(item.id)?.[1] ? Number(/^S(\d+)$/.exec(item.id)[1]) : 0)) + 1
const assetRows = []
let added = 0

for (const [slug, match, text, categoryId, meaning, pinyin] of [...SPECS.slice(25), ...SPECS.slice(0, 25)]) {
  const id = `audio-commons-${slug}`
  if (audio.some((item) => item.id === id)) continue
  const page = catalog.find((item) => item.title.includes(match))
  if (!page) { console.error(`SKIP 找不到 ${text} / ${match}`); continue }
  const info = page.imageinfo?.[0]
  if (!info?.url) { console.error(`SKIP 无音频 URL ${text}`); continue }
  const meta = info.extmetadata ?? {}
  const license = meta.LicenseShortName?.value || 'CC BY-SA 4.0'
  if (!license.includes('CC')) { console.error(`SKIP 许可不明 ${text}: ${license}`); continue }
  const recorder = stripHtml(meta.Artist?.value).replace(/^Speaker:\s*/, '').split('Recorder:')[0].trim() || 'Wikimedia Commons 录音者'
  const sourceId = `S${nextSource++}`
  const file = `/media/listen/commons-${slug}.mp3`
  const tmp = path.join(OUT, `.download-${slug}`)
  const dest = path.join(OUT, `commons-${slug}.mp3`)

  try {
    const fileUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(page.title.replace(/^File:/, ''))}`
    const status = execFileSync('curl', ['-sSL', '--max-time', '20', '-A', 'Mozilla/5.0', '-o', tmp, '-w', '%{http_code}', fileUrl], { encoding: 'utf8' }).trim()
    if (status !== '200') throw new Error(`下载 ${status}`)
    const buf = readFileSync(tmp)
    if (buf.length < 1024) throw new Error(`文件过小 ${buf.length}`)
    writeFileSync(tmp, buf)
    execFileSync('ffmpeg', ['-y', '-i', tmp, '-ac', '1', '-b:a', '64k', dest], { stdio: 'ignore' })
    const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', dest], { encoding: 'utf8' }).trim()
    const durationSec = Number(probe)
    if (!Number.isFinite(durationSec) || durationSec < 0.25) throw new Error(`时长异常 ${probe}`)
    audio.push({ id, category: categoryId, text, meaning, accent: page.title.startsWith('File:LL-') ? `潮州话 · Lingua Libre 母语者录音（${recorder}）` : '潮州话 · 普宁—潮阳混合口音（男声）', pinyin, file, recorder, license, sourceIds: [sourceId], durationSec: Math.round(durationSec * 100) / 100 })
    sources.push({ id: sourceId, title: `Wikimedia Commons 真人发音：${text}`, org: `Wikimedia Commons · ${recorder}`, url: info.descriptionurl, region: '潮州话（Teochew）', accessDate: '2026-11-07', verify: 'fetched', module: 'tingchao', note: `许可 ${license}。本站仅转码为单声道 MP3，未合成、未改动读音。` })
    assetRows.push(`| ${id} | \`commons-${slug}.mp3\` | ${info.descriptionurl} | ${recorder} | ${license} | ${durationSec.toFixed(2)}s |`)
    added += 1
    console.log(`OK ${text} ${durationSec.toFixed(2)}s ${recorder}`)
  } catch (error) {
    console.error(`FAIL ${text}: ${error.message}`)
  } finally {
    try { execFileSync('rm', ['-f', tmp]) } catch { /* ignore */ }
  }
  await sleep(400)
}

writeJson(AUDIO_FILE, audio)
writeJson(SOURCE_FILE, sources)
if (assetRows.length > 0) {
  const block = `\n## 2026-11-07 新增 Commons / Lingua Libre 真人发音（${assetRows.length} 条）\n\n| 词条 ID | 本地文件 | 原始文件页 | 录音者 | 许可 | 时长 |\n|---|---|---|---|---|---|\n${assetRows.join('\n')}\n`
  writeFileSync(ASSETS_FILE, readFileSync(ASSETS_FILE, 'utf8') + block)
}
console.log(`完成：新增 ${added}，总计 ${audio.length} 条。`)
