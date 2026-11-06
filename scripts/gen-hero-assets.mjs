/**
 * 首页 Hero 生图管线：zexapi gpt-image-2.6 / gpt-image-2.6-gif。
 *
 *   ZEX_API_KEY=xxx node scripts/gen-hero-assets.mjs panorama   # 1 张横屏全景母图
 *   ZEX_API_KEY=xxx node scripts/gen-hero-assets.mjs gif        # 4 张分区动图（需先有全景）
 *
 * Key 只从环境变量读，不落盘；产物到 public/media/home/hero/。
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'

const BASE = 'https://zexapi.com'
const KEY = process.env.ZEX_API_KEY
const OUT = 'public/media/home/hero'
const MODE = process.argv[2] || 'panorama'

if (!KEY) {
  console.error('需要 ZEX_API_KEY 环境变量')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

/** 统一画风前缀：所有产物共用，保证四栏拼起来是一幅画 */
const STYLE =
  'New-Chinese-style heritage scroll illustration, intricate gongbi line work meets modern flat guochao poster art, ' +
  'deep ink-teal background (#243229), vermilion coral-red accents (#f04a3a), warm antique-gold highlights, ' +
  'subtle rice-paper grain, cinematic soft lighting, rich detail, no text, no watermark, no border. '

const PANORAMA_PROMPT =
  STYLE +
  'One continuous ultra-wide horizontal panorama of Chaoshan intangible cultural heritage, richly detailed and tasteful, four scenes flowing seamlessly left to right: ' +
  '(1) far left: Yingge dance — two heroic dancers in ornate opera face paint and embroidered costumes striking paired wooden sticks mid-leap, big framed drums, embroidered banners and a qilin; ' +
  '(2) center-left: Chaozhou gongfu tea — a vermilion clay teapot pouring a thin arc of tea into three small white porcelain cups on a carved wooden tea tray, a charcoal clay stove with glowing olive-pit coals, gentle steam; ' +
  '(3) center-right: Chaoshan cuisine — a bowl of beef-ball kway teow soup with rising steam, sliced braised goose on a blue-and-white porcelain plate, a golden oyster omelette on an iron griddle; ' +
  '(4) far right: Yinglaoye night procession — a gilded deity palanquin carried through an old arcade street at night, red lanterns, firecracker sparks, a bonfire and lion dancers. ' +
  'Background layered with Chaoshan arcade shophouses, paifang gates, porcelain-inlaid roof ridges, gold-lacquer wood carvings, drifting auspicious clouds and incense smoke, ' +
  'every corner filled with refined detail, museum-grade composition, the whole image reads as ONE painting, no panel dividers.'

/** 四张分区动图：与全景同风格、同题材，方便 hover 时叠播不突兀 */
const GIF_PANELS = [
  {
    id: 'yingge',
    prompt:
      STYLE +
      'Yingge dancers in ornate opera face paint striking paired wooden sticks, subtle looping motion: sticks clashing with tiny gold sparks, costume ribbons and pheasant feathers swaying, drumsticks bouncing. Dark ink-teal backdrop with vermilion banners.',
  },
  {
    id: 'tea',
    prompt:
      STYLE +
      'A vermilion clay teapot pouring a thin continuous arc of tea into three small white porcelain cups on a wooden tray, looping motion: tea stream flowing, steam curling upward slowly, tiny ripples in the cups. Dark ink-teal backdrop, warm gold light.',
  },
  {
    id: 'food',
    prompt:
      STYLE +
      'A bowl of Chaoshan beef-ball kway teow soup with sliced braised goose beside it, looping motion: gentle steam rising and swirling, soup surface shimmering, chopsticks lifting one beef ball slightly. Dark ink-teal backdrop, appetizing warm light.',
  },
  {
    id: 'yinglaoye',
    prompt:
      STYLE +
      'Yinglaoye night procession with a gilded deity palanquin and red lanterns, looping motion: bonfire flames flickering, lantern light swaying, firecracker sparks drifting up, incense smoke curling. Dark ink-teal night backdrop.',
  },
]

async function generate(model, prompt, size) {
  const res = await fetch(`${BASE}/v1/images/generations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, size, response_format: 'url' }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 300)}`)
  const json = JSON.parse(text)
  const url = json?.data?.[0]?.url
  if (!url) throw new Error(`无 url 返回: ${text.slice(0, 300)}`)
  return url
}

/** 图生图：以高清切片为参考，保证动图与静态画卷同构图、同风格 */
async function generateEdit(model, prompt, size, refImagePath) {
  const { readFileSync } = await import('node:fs')
  const base64 = readFileSync(refImagePath).toString('base64')
  const res = await fetch(`${BASE}/v1/images/edits`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      size,
      response_format: 'url',
      image: [`data:image/png;base64,${base64}`],
    }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 300)}`)
  const json = JSON.parse(text)
  const url = json?.data?.[0]?.url
  if (!url) throw new Error(`无 url 返回: ${text.slice(0, 300)}`)
  return url
}

async function download(url, path) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`下载失败 ${res.status}: ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(path, buf)
  console.log(`  保存 ${path} (${(buf.length / 1024) | 0}KB)`)
}

if (MODE === 'panorama') {
  console.log('生成高清全景母图 gpt-image-2.6 3024x1296 (21:9 2K)…')
  // 524 偶发上游超时：最多重试 3 次，间隔 20s
  let url = ''
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      url = await generate('gpt-image-2.6', PANORAMA_PROMPT, '3024x1296')
      break
    } catch (err) {
      console.error(`  第 ${attempt} 次失败:`, err.message.slice(0, 120))
      if (attempt === 3) throw err
      await new Promise((r) => setTimeout(r, 20000))
    }
  }
  console.log('  url:', url)
  await download(url, `${OUT}/panorama-master.png`)

  // 切成 4 片高清切片（每片 = 一个板块底图，拼起来还是整幅画）
  const { execSync } = await import('node:child_process')
  const dims = execSync(`sips -g pixelWidth -g pixelHeight ${OUT}/panorama-master.png`).toString()
  const W = Number(dims.match(/pixelWidth: (\d+)/)?.[1])
  const H = Number(dims.match(/pixelHeight: (\d+)/)?.[1])
  const sw = Math.floor(W / 4)
  console.log(`母图 ${W}x${H}，每片 ${sw}x${H}`)
  for (let i = 0; i < 4; i++) {
    execSync(`ffmpeg -y -i ${OUT}/panorama-master.png -vf "crop=${sw}:${H}:${i * sw}:0" ${OUT}/slice-${i}.png 2>/dev/null`)
    execSync(`ffmpeg -y -i ${OUT}/slice-${i}.png -quality 85 ${OUT}/slice-${i}.webp 2>/dev/null`)
    console.log(`  slice-${i}.webp 完成`)
  }
} else if (MODE === 'gif') {
  for (const panel of GIF_PANELS) {
    if (existsSync(`${OUT}/${panel.id}.gif`)) {
      console.log(`跳过已存在 ${panel.id}.gif`)
      continue
    }
    console.log(`生成动图 ${panel.id} (gpt-image-2.6-gif 1280x720)…`)
    try {
      const url = await generate('gpt-image-2.6-gif', panel.prompt, '1280x720')
      console.log('  url:', url)
      await download(url, `${OUT}/${panel.id}.gif`)
    } catch (err) {
      console.error(`  ${panel.id} 失败:`, err.message)
    }
    // 串行 + 间隔，避免限流
    await new Promise((r) => setTimeout(r, 4000))
  }
} else {
  console.error('未知模式', MODE)
  process.exit(1)
}
console.log('完成', MODE)
