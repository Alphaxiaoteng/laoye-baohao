#!/usr/bin/env node
/**
 * 小红书攻略抓取管线（TikHub API）
 * ------------------------------------------------------------------
 * 仅服务端运行：密钥只从环境变量 / 本地 .env 读取，不写入仓库、不进前端。
 * 产出：
 *   content/guides.json          攻略条目（清洗后的要点 + 来源引用）
 *   content/sources.guide.json  逐条来源登记（作者/原帖链接/许可口径）
 *   public/media/guide/*.webp   封面图（自托管，避免外站 CDN 热链）
 *
 * 用法：
 *   TIKHUB_API_KEY=xxx node scripts/fetch-xhs-guide.mjs
 *   node scripts/fetch-xhs-guide.mjs --keyword "潮州攻略"   # 单关键词调试
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(process.cwd())
const OUT_GUIDE = resolve(ROOT, 'content/guides.json')
const OUT_SOURCES = resolve(ROOT, 'content/sources.guide.json')
const IMG_DIR = resolve(ROOT, 'public/media/guide')
const API = 'https://api.tikhub.io/api/v1/xiaohongshu/app_v2/search_notes'

const KEYWORDS = [
  { keyword: '潮州攻略', city: '潮州', kind: 'guide' },
  { keyword: '汕头攻略', city: '汕头', kind: 'guide' },
  { keyword: '揭阳攻略', city: '揭阳', kind: 'guide' },
  { keyword: '南澳岛攻略', city: '汕头', kind: 'guide' },
  { keyword: '潮汕美食攻略', city: '潮汕', kind: 'food' },
  { keyword: '潮汕菜做法', city: '潮汕', kind: 'recipe' },
]

const PER_KEYWORD = 8

function loadEnv() {
  if (process.env.TIKHUB_API_KEY) return process.env.TIKHUB_API_KEY.trim()
  const p = resolve(ROOT, '.env')
  if (!existsSync(p)) return ''
  const text = readFileSafeSync(p)
  const m = text.match(/^\s*TIKHUB_API_KEY\s*=\s*(.+)$/m)
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''
}

function readFileSafeSync(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    return ''
  }
}

/** 去噪：emoji、零宽字符、营销尾巴、多余空行 */
function cleanText(input) {
  let s = String(input || '')
  s = s.replace(/[\u200B-\u200F\uFEFF]/g, '')
  s = s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
  s = s.replace(/[ \t]+/g, ' ')
  s = s.replace(/\n{3,}/g, '\n\n')
  s = s.replace(/(私信|加微信|微信|VX|vx|wx|公众号|关注我|点赞收藏|码住)[^\n]{0,20}/g, '')
  return s.trim()
}

function excerpt(desc, limit = 240) {
  const s = cleanText(desc).replace(/\n+/g, ' ').trim()
  return s.length > limit ? `${s.slice(0, limit)}…` : s
}

function pickCover(note) {
  const list = Array.isArray(note.images_list) ? note.images_list : []
  const first = list[0]
  if (!first) return ''
  return first.url_size_large || first.url || ''
}

async function searchNotes(keyword) {
  const url = `${API}?keyword=${encodeURIComponent(keyword)}&page=1&note_type=${encodeURIComponent(
    '普通笔记',
  )}&sort_type=popularity_descending`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${loadEnv()}` } })
  if (!res.ok) throw new Error(`TikHub HTTP ${res.status}`)
  const json = await res.json()
  const items = json?.data?.data?.items ?? json?.data?.items ?? []
  return items.map((it) => it.note).filter(Boolean)
}

async function downloadCover(url, id) {
  if (!url) return ''
  const file = `${id}.webp`
  const dest = resolve(IMG_DIR, file)
  if (existsSync(dest)) return `/media/guide/${file}`
  const src = url.replace(/\/w\/\d+\//, '/w/900/')
  try {
    const res = await fetch(src)
    if (!res.ok) return ''
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length > 900 * 1024) return ''
    await writeFile(dest, buf)
    return `/media/guide/${file}`
  } catch {
    return ''
  }
}

async function main() {
  const key = loadEnv()
  if (!key) {
    console.error('[xhs] 缺少 TIKHUB_API_KEY（环境变量或 .env）')
    process.exit(1)
  }
  await mkdir(IMG_DIR, { recursive: true })

  const argv = process.argv.slice(2)
  const singleIdx = argv.indexOf('--keyword')
  const targets = singleIdx >= 0 ? [{ keyword: argv[singleIdx + 1], city: '潮汕', kind: 'guide' }] : KEYWORDS

  const seen = new Set()
  const guides = []
  let sourceSeq = 600

  for (const target of targets) {
    let notes = []
    try {
      notes = await searchNotes(target.keyword)
    } catch (err) {
      console.error(`[xhs] ${target.keyword} 抓取失败：${err.message}`)
      continue
    }
    let taken = 0
    for (const note of notes) {
      if (taken >= PER_KEYWORD) break
      const id = note.id
      const title = cleanText(note.title)
      if (!id || !title || seen.has(id)) continue
      seen.add(id)
      taken += 1

      const cover = await downloadCover(pickCover(note), id)
      const sourceId = `S${sourceSeq++}`
      guides.push({
        id: `guide-${id}`,
        city: target.city,
        kind: target.kind,
        title,
        excerpt: excerpt(note.desc),
        author: cleanText(note.user?.nickname) || '小红书用户',
        likes: Number(note.liked_count || note.nice_count || 0),
        collects: Number(note.collected_count || 0),
        comments: Number(note.comments_count || 0),
        publishedAt: note.timestamp ? new Date(note.timestamp * 1000).toISOString().slice(0, 10) : '',
        cover,
        noteUrl: `https://www.xiaohongshu.com/explore/${id}`,
        sourceIds: [sourceId],
        verify: 'reference-only',
      })
    }
    console.log(`[xhs] ${target.keyword}: ${taken} 条`)
  }

  guides.sort((a, b) => b.likes - a.likes)

  const sources = guides.map((g) => ({
    id: g.sourceIds[0],
    title: `${g.title}｜小红书作者 ${g.author}`,
    org: '小红书',
    url: g.noteUrl,
    region: g.city === '潮汕' ? '广东省潮汕地区' : `广东省${g.city}市`,
    accessDate: new Date().toISOString().slice(0, 10),
    verify: 'reference-only',
    module: 'guide',
    note: `内容为原帖要点摘录（非全文镜像），版权归作者 ${g.author} 所有；封面图仅作来源示意。`,
  }))

  await writeFile(OUT_GUIDE, `${JSON.stringify(guides, null, 2)}\n`, 'utf8')
  await writeFile(OUT_SOURCES, `${JSON.stringify(sources, null, 2)}\n`, 'utf8')
  const withCover = guides.filter((g) => g.cover).length
  console.log(`[xhs] 写入 ${guides.length} 条攻略（含封面 ${withCover} 张），来源 ${sources.length} 条`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
