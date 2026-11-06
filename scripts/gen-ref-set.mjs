/**
 * 参考图版本 V4–V6 · 每版 10 张预览
 *
 *   node scripts/gen-ref-set.mjs v4
 *   node scripts/gen-ref-set.mjs v5
 *   node scripts/gen-ref-set.mjs v6
 *
 * 图生图（/v1/images/edits），每版锁一张真实参考图；
 * 提示词极短，只写主体 + 留白。
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const API = process.env.AINEXT_BASE || 'http://127.0.0.1:8791/v1'
const MODEL = process.env.GEN_MODEL || 'gpt-image-2.6'
const ROOT = path.resolve('public/media/sets-v4v6')
const CONC = Number(process.env.GEN_CONCURRENCY || 2)
const FORCE = process.argv.includes('--force')
const AIR = ', minimal, lots of empty space.'

const SETS = {
  v4: {
    dir: 'v4-yingge',
    ref: 'public/media/home/gdstwhg/yingge-stage.webp',
    shots: [
      ['01-leap', 'A dancer leaping, two wooden sticks.'],
      ['02-red-face', 'A painted red face, close.'],
      ['03-sticks', 'Two worn wooden sticks crossed.'],
      ['04-drum', 'A drum head from above.'],
      ['05-black-face', 'A dancer crouched, black painted face.'],
      ['06-crowd', 'A crowd of dancers, distant.'],
      ['07-hand', 'A hand gripping a stick.'],
      ['08-sash', 'A silk sash flying.'],
      ['09-formation', 'Small figures in two curving lines.'],
      ['10-dust', 'Sparks and dust in a shaft of light.'],
    ],
  },
  v5: {
    dir: 'v5-food',
    ref: 'public/media/photos/food-braised-goose.jpg',
    shots: [
      ['01-hanging', 'Braised geese hanging in a row.'],
      ['02-sliced', 'Sliced goose on a plain plate.'],
      ['03-broth', 'Dark braising broth, surface.'],
      ['04-spices', 'Whole spices scattered.'],
      ['05-cleaver', 'A cleaver resting on a chopping block.'],
      ['06-steam', 'Steam rising over a pot.'],
      ['07-skin', 'Glazed skin, tight close-up.'],
      ['08-rice', 'A bowl of plain rice.'],
      ['09-sauce', 'One small dish of dark sauce.'],
      ['10-hook', 'An empty iron hook.'],
    ],
  },
  v6: {
    dir: 'v6-yinglaoye',
    ref: 'public/media/photos/yinglaoye-chaoyang-sedan.jpg',
    shots: [
      ['01-palanquin', 'A gilded wooden palanquin.'],
      ['02-lanterns', 'Two red lanterns on carrying poles.'],
      ['03-crowd', 'A crowd at night, distant.'],
      ['04-fire', 'A bonfire, sparks rising.'],
      ['05-lion', 'A painted lion mask.'],
      ['06-gong', 'A huge bronze gong.'],
      ['07-incense', 'Three thin smoke lines.'],
      ['08-street', 'A stone street at night.'],
      ['09-banners', 'Tall banners in a row.'],
      ['10-candle', 'A single candle on a step.'],
    ],
  },
}

function dataUrl(file) {
  const ext = path.extname(file).toLowerCase()
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.png' ? 'image/png' : 'image/webp'
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`
}

async function once(refUrl, prompt, size) {
  const r = await fetch(`${API}/images/edits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, size, response_format: 'url', image: [refUrl] }),
  })
  const txt = await r.text()
  if (!r.ok) {
    const err = new Error(`HTTP ${r.status}: ${txt.slice(0, 140)}`)
    err.status = r.status
    throw err
  }
  const item = ((JSON.parse(txt).data || [])[0]) || {}
  if (item.b64_json) return Buffer.from(item.b64_json, 'base64')
  if (item.url) {
    const d = await fetch(item.url)
    if (!d.ok) throw new Error(`dl ${d.status}`)
    return Buffer.from(await d.arrayBuffer())
  }
  throw new Error('no image')
}

async function genOne(key, outDir, refUrl, id, brief, idx, total) {
  mkdirSync(outDir, { recursive: true })
  const out = path.join(outDir, `${id}.webp`)
  if (!FORCE && existsSync(out)) {
    console.log(`[${key}] (${idx}/${total}) skip ${id}`)
    return true
  }
  const prompt = brief + AIR
  for (let a = 1; a <= 3; a++) {
    try {
      let size = '1536x1536'
      let buf
      try {
        buf = await once(refUrl, prompt, size)
      } catch (e) {
        if (e.status === 400) {
          size = '1024x1024'
          buf = await once(refUrl, prompt, size)
        } else throw e
      }
      const tmp = path.join(outDir, `${id}.tmp.png`)
      writeFileSync(tmp, buf)
      execFileSync('ffmpeg', ['-y', '-i', tmp, '-q:v', '92', out], { stdio: 'ignore' })
      try { execFileSync('rm', ['-f', tmp]) } catch {}
      console.log(`[${key}] (${idx}/${total}) ok ${id} ${size}`)
      return true
    } catch (e) {
      console.error(`[${key}] (${idx}/${total}) fail ${id} #${a}: ${e.message}`)
      if (a === 3) return false
      await new Promise((r) => setTimeout(r, 4000 * a))
    }
  }
}

const key = process.argv[2]
const cfg = SETS[key]
if (!cfg) {
  console.error('用法: node scripts/gen-ref-set.mjs [v4|v5|v6]')
  process.exit(1)
}
const outDir = path.join(ROOT, cfg.dir)
const refUrl = dataUrl(cfg.ref)
console.log(`=== ${key} · ${cfg.shots.length} 张 · ref=${cfg.ref} ===`)
let cursor = 0
const results = []
async function worker() {
  while (cursor < cfg.shots.length) {
    const i = cursor++
    const [id, brief] = cfg.shots[i]
    results.push(await genOne(key, outDir, refUrl, id, brief, i + 1, cfg.shots.length))
  }
}
await Promise.all(Array.from({ length: CONC }, () => worker()))
const ok = results.filter(Boolean).length
console.log(`=== ${key} 完成 ${ok}/${cfg.shots.length} → ${outDir} ===`)
