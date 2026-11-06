/**
 * 首页 Hero 生图管线：zexapi gpt-image-2.6 / gpt-image-2.6-gif。
 *
 *   ZEX_API_KEY=xxx node scripts/gen-hero-assets.mjs panels   # 4 张板块独立图（极简二次元写实风）
 *   ZEX_API_KEY=xxx node scripts/gen-hero-assets.mjs gif      # 以板块图为参考生成 4 张同构图动图
 *
 * Key 只从环境变量读，不落盘；产物到 public/media/home/hero/。
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'

const BASE = 'https://zexapi.com'
const KEY = process.env.ZEX_API_KEY
const OUT = 'public/media/home/hero'
const MODE = process.argv[2] || 'panels'
const FORCE = process.argv.includes('--force')

if (!KEY) {
  console.error('需要 ZEX_API_KEY 环境变量')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

/** 统一画风：日系二次元场景插画 + 写实光影 + 极简留白（不要太密的工笔画） */
const PANEL_STYLE =
  'Japanese anime background art, realistic cinematic light and shadow with clean anime illustration (Makoto Shinkai inspired), ' +
  'minimalist composition with generous negative space, ONE clear subject, deep ink-teal palette (#243229) with subtle vermilion coral accents, ' +
  'soft warm rim light, calm tasteful mood, detailed subject against a simple uncluttered dark background, no text, no watermark, no border. '

/** 每个文化模块一张独立图 */
const STILL_PANELS = [
  {
    id: 'yingge',
    prompt:
      PANEL_STYLE +
      'A single Yingge dancer in ornate Chinese opera face paint and embroidered costume, frozen mid-leap striking two wooden sticks, ' +
      'dynamic heroic pose, placed slightly left of center, vast empty dark teal background with a faint drum silhouette and a few floating embers.',
  },
  {
    id: 'tea',
    prompt:
      PANEL_STYLE +
      'A vermilion clay teapot pouring a thin arc of tea into one small white porcelain cup on a simple dark wooden tea tray, ' +
      'gentle steam curling upward, quiet minimal tea setting, dark teal background, warm side light.',
  },
  {
    id: 'food',
    prompt:
      PANEL_STYLE +
      'A single bowl of Chaoshan beef-ball kway teow noodle soup, a few beef balls and chopped celery on top, gentle steam, ' +
      'on a plain dark wooden table, dark teal minimal background, appetizing soft light, lots of empty space around the bowl.',
  },
  {
    id: 'yinglaoye',
    prompt:
      PANEL_STYLE +
      'A gilded Chinese deity palanquin with glowing red lanterns at night in a quiet old street, a few silhouetted carriers, ' +
      'sparse drifting embers, dark teal night sky, minimal composition with wide empty space, warm lantern glow.',
  },
]

/** 动图仅加动态描述，构图沿用参考图 */
const GIF_MOTION = {
  yingge:
    'Subtle looping motion: the dancer strikes the two sticks with tiny gold sparks, costume ribbons swaying gently, embers drifting.',
  tea: 'Subtle looping motion: tea stream flowing continuously, steam curling upward slowly, tiny ripples in the cup.',
  food: 'Subtle looping motion: gentle steam rising and swirling, soup surface shimmering softly.',
  yinglaoye:
    'Subtle looping motion: lantern glow swaying, embers drifting up, faint smoke curling around the palanquin.',
}

async function callApi(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 200)}`)
  const url = JSON.parse(text)?.data?.[0]?.url
  if (!url) throw new Error(`无 url 返回: ${text.slice(0, 200)}`)
  return url
}

const generate = (model, prompt, size) =>
  callApi('/v1/images/generations', { model, prompt, size, response_format: 'url' })

/** 图生图：以板块图为参考，动图与静态底图同构图、同风格 */
function generateEdit(model, prompt, size, refImagePath) {
  const base64 = readFileSync(refImagePath).toString('base64')
  return callApi('/v1/images/edits', {
    model,
    prompt,
    size,
    response_format: 'url',
    image: [`data:image/png;base64,${base64}`],
  })
}

async function download(url, path) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`下载失败 ${res.status}: ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(path, buf)
  console.log(`  保存 ${path} (${(buf.length / 1024) | 0}KB)`)
}

/** 失败重试（524 上游超时常见） */
async function withRetry(fn, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fn()
    } catch (err) {
      console.error(`  ${label} 第 ${attempt} 次失败:`, err.message.slice(0, 120))
      if (attempt === 3) throw err
      await new Promise((r) => setTimeout(r, 15000))
    }
  }
}

if (MODE === 'panels') {
  for (const panel of STILL_PANELS) {
    if (!FORCE && existsSync(`${OUT}/panel-${panel.id}.webp`)) {
      console.log(`跳过已有板块图 panel-${panel.id}.webp（重生成请加 --force）`)
      continue
    }
    console.log(`生成板块图 ${panel.id} (gpt-image-2.6 1248x832)…`)
    try {
      const url = await withRetry(() => generate('gpt-image-2.6', panel.prompt, '1248x832'), panel.id)
      console.log('  url:', url)
      await download(url, `${OUT}/panel-${panel.id}.png`)
      execSync(`ffmpeg -y -i ${OUT}/panel-${panel.id}.png -quality 85 ${OUT}/panel-${panel.id}.webp 2>/dev/null`)
      console.log(`  panel-${panel.id}.webp 完成`)
    } catch (err) {
      console.error(`  ${panel.id} 放弃:`, err.message.slice(0, 150))
    }
    await new Promise((r) => setTimeout(r, 4000))
  }
} else if (MODE === 'gif') {
  for (const panel of STILL_PANELS) {
    if (!FORCE && existsSync(`${OUT}/${panel.id}.gif`)) {
      console.log(`跳过已有动图 ${panel.id}.gif（重生成请加 --force）`)
      continue
    }
    console.log(`生成同构图动图 ${panel.id} (gpt-image-2.6-gif edits)…`)
    try {
      const url = await withRetry(
        () => generateEdit('gpt-image-2.6-gif', PANEL_STYLE + GIF_MOTION[panel.id], '1248x832', `${OUT}/panel-${panel.id}.png`),
        panel.id,
      )
      console.log('  url:', url)
      await download(url, `${OUT}/${panel.id}.gif`)
    } catch (err) {
      console.error(`  ${panel.id} 放弃:`, err.message.slice(0, 150))
    }
    await new Promise((r) => setTimeout(r, 4000))
  }
} else {
  console.error('未知模式', MODE)
  process.exit(1)
}
console.log('完成', MODE)
