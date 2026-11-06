/**
 * 极简提示词生图管线 · 三套独立批次（无风格锁，各自自由）
 *
 *   node scripts/gen-minimal-sets.mjs a
 *   node scripts/gen-minimal-sets.mjs b
 *   node scripts/gen-minimal-sets.mjs c
 *   node scripts/gen-minimal-sets.mjs all
 *
 * 规则：
 *  - 纯文生图（/v1/images/generations），不带参考图，避免构图被锁死
 *  - 1536×1536，不二次缩放
 *  - 提示词极短：主体 + 一句留白
 *  - 只输出图片，不写 json
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

const API = process.env.AINEXT_BASE || 'http://127.0.0.1:8791/v1'
const MODEL = process.env.GEN_MODEL || 'gpt-image-2.6'
const SIZE = process.env.GEN_SIZE || '1536x1536'
const ROOT = path.resolve('public/media/minimal-sets')
const CONC = Number(process.env.GEN_CONCURRENCY || 3)
const FORCE = process.argv.includes('--force')

/** 极简尾巴：只管留白，不锁风格 */
const AIR = ', minimal, lots of empty space.'

const SETS = {
  a: [
    ['01-home', 'seal-emblem', 'A carved stone seal stamp, single object'],
    ['01-home', 'gate', 'An old wooden temple door slightly open, one shaft of light'],
    ['01-home', 'bridge', 'A stone bridge pavilion over still water'],
    ['01-home', 'junk-boat', 'A red-bowed wooden sailing boat on calm water'],
    ['01-home', 'four-doors', 'Four simple wooden doors in a row'],
    ['01-home', 'lantern-single', 'One red paper lantern hanging'],
    ['01-home', 'roof-ridge', 'A curved tiled roof ridge against sky'],
    ['01-home', 'window-lattice', 'A carved wooden window lattice'],
    ['02-yingge', 'leap', 'A dancer leaping, two wooden sticks, red painted face'],
    ['02-yingge', 'black-face', 'A dancer with black painted face, crouched, two sticks'],
    ['02-yingge', 'snake-prop', 'A dancer holding a coiled cloth snake'],
    ['02-yingge', 'two-sticks', 'Two wooden drumsticks crossed'],
    ['02-yingge', 'drum', 'A large cowhide drum on a wooden stand'],
    ['02-yingge', 'gong', 'A bronze gong with a padded mallet'],
    ['02-yingge', 'face-paint', 'A painted opera face, frontal'],
    ['02-yingge', 'formation', 'Tiny dancers in two curving lines, seen from above'],
    ['02-yingge', 'spiral', 'Tiny dancers in a spiral, seen from above'],
    ['02-yingge', 'sash', 'A folded embroidered sash'],
    ['03-tea', 'pour', 'A small clay teapot pouring into one cup'],
    ['03-tea', 'three-cups', 'Three tiny white cups in a triangle'],
    ['03-tea', 'leaves', 'A wooden scoop of dark tea leaves'],
    ['03-tea', 'kettle', 'A clay kettle on a small charcoal stove'],
    ['03-tea', 'gaiwan', 'An open porcelain lidded bowl of tea'],
    ['03-tea', 'tray', 'A slotted wooden tea tray'],
    ['03-tea', 'steam', 'A single cup of tea with rising steam'],
    ['03-tea', 'branch', 'A tea branch with a few green leaves'],
    ['03-tea', 'cloth', 'A folded linen tea cloth'],
    ['03-tea', 'jar', 'A ceramic tea leaf jar'],
    ['04-food', 'beef-balls', 'A bowl of beef ball soup, steam'],
    ['04-food', 'mallet-meat', 'Two iron mallets on a chopping block'],
    ['04-food', 'kway-teow', 'A bowl of flat rice noodles with beef'],
    ['04-food', 'goose', 'Sliced braised goose on a plate'],
    ['04-food', 'spices', 'A few whole spices on a plain surface'],
    ['04-food', 'omelette', 'A round oyster omelette on a griddle'],
    ['04-food', 'pink-cake', 'A pink molded rice cake'],
    ['04-food', 'rice-sheet', 'A thin steamed rice sheet on a bamboo tray'],
    ['04-food', 'sauce-dish', 'One small dish of dark sauce'],
    ['04-food', 'porridge', 'A bowl of white rice porridge'],
    ['05-yinglaoye', 'palanquin', 'A gilded wooden palanquin'],
    ['05-yinglaoye', 'lanterns', 'Two red lanterns on carrying poles'],
    ['05-yinglaoye', 'banners', 'Tall embroidered silk banners'],
    ['05-yinglaoye', 'bonfire', 'A bonfire in a courtyard at night'],
    ['05-yinglaoye', 'lion', 'A painted lion dance mask'],
    ['05-yinglaoye', 'big-gong', 'A huge bronze gong in a wooden frame'],
    ['05-yinglaoye', 'incense', 'A bronze incense burner, three thin smoke lines'],
    ['05-yinglaoye', 'street-altar', 'A small street altar table'],
    ['06-agent', 'bot-figure', 'A young figure in a simple headband holding two small sticks'],
    ['06-agent', 'open-book', 'An open thread-bound book'],
    ['06-agent', 'sound-rings', 'Concentric rings spreading on dark water'],
    ['06-agent', 'courtyard', 'A quiet courtyard with a stone table'],
  ],
  b: [
    ['01-home', 'seal-dark', 'A stone seal stamp lit from above'],
    ['01-home', 'gate-dark', 'A temple doorway, deep shadow, thin light'],
    ['01-home', 'bridge-dark', 'A bridge pavilion in fog'],
    ['01-home', 'boat-dark', 'A wooden boat silhouette on dark water'],
    ['01-home', 'door-dark', 'One heavy wooden door, worn'],
    ['01-home', 'lantern-dark', 'A glowing lantern in darkness'],
    ['01-home', 'roof-dark', 'A roof ridge at dusk'],
    ['01-home', 'lattice-dark', 'Window lattice casting shadow'],
    ['02-yingge', 'leap-dark', 'A leaping dancer with two sticks, lit from one side'],
    ['02-yingge', 'black-face-dark', 'A masked dancer turning, harsh light'],
    ['02-yingge', 'sticks-dark', 'Two worn wooden sticks on a dark surface'],
    ['02-yingge', 'drum-dark', 'A drum head, close, raking light'],
    ['02-yingge', 'gong-dark', 'A bronze gong, single highlight'],
    ['02-yingge', 'face-dark', 'A painted face half in shadow'],
    ['02-yingge', 'crowd-dark', 'A dense crowd of dancers, silhouettes'],
    ['02-yingge', 'dust-dark', 'Dust and sparks in a shaft of light'],
    ['02-yingge', 'hand-dark', 'A hand gripping a stick, tight'],
    ['02-yingge', 'motion-dark', 'A dancer blurred in motion'],
    ['03-tea', 'pour-dark', 'Tea pouring in a dark room, one light'],
    ['03-tea', 'cups-dark', 'Three cups glowing on a dark tray'],
    ['03-tea', 'steam-dark', 'Steam caught in a narrow beam'],
    ['03-tea', 'pot-dark', 'A clay teapot, deep shadow'],
    ['03-tea', 'kettle-dark', 'Embers under a kettle'],
    ['03-tea', 'tray-dark', 'A wet tea tray, dark wood'],
    ['03-tea', 'leaf-dark', 'Dry tea leaves scattered'],
    ['03-tea', 'cup-dark', 'One cup, rim lit'],
    ['03-tea', 'hand-dark', 'A hand holding a tiny cup'],
    ['03-tea', 'cloth-dark', 'Folded cloth in low light'],
    ['03-tea', 'jar-dark', 'A ceramic jar, single highlight'],
    ['04-food', 'bowl-dark', 'A soup bowl steaming in the dark'],
    ['04-food', 'mallet-dark', 'Iron mallets, heavy shadow'],
    ['04-food', 'noodle-dark', 'Noodles lifted with chopsticks'],
    ['04-food', 'goose-dark', 'Glazed goose skin, tight close-up'],
    ['04-food', 'wok-dark', 'A wok over fire'],
    ['04-food', 'omelette-dark', 'An omelette sizzling, dark griddle'],
    ['04-food', 'steam-dark', 'Steam against black'],
    ['04-food', 'chopstick-dark', 'One chopstick on a bare table'],
    ['04-food', 'spice-dark', 'Spices in a dark bowl'],
    ['04-food', 'porridge-dark', 'Porridge, single spoon'],
    ['05-yinglaoye', 'palanquin-dark', 'A gilded palanquin at night'],
    ['05-yinglaoye', 'lantern-dark', 'A lantern flame, close'],
    ['05-yinglaoye', 'crowd-dark', 'A night procession, distant'],
    ['05-yinglaoye', 'fire-dark', 'Sparks rising from a bonfire'],
    ['05-yinglaoye', 'lion-dark', 'A lion mask in shadow'],
    ['05-yinglaoye', 'gong-dark', 'A huge gong, one glint'],
    ['05-yinglaoye', 'smoke-dark', 'Incense smoke in a dark hall'],
    ['05-yinglaoye', 'candle-dark', 'One candle on a stone step'],
    ['06-agent', 'figure-dark', 'A face half lit, calm'],
    ['06-agent', 'book-dark', 'A book open, one lamp'],
    ['06-agent', 'ripple-dark', 'Ripples catching light on black water'],
    ['06-agent', 'courtyard-dark', 'A courtyard at night, one window lit'],
  ],
  c: [
    ['01-home', 'seal-flat', 'A flat seal stamp silhouette'],
    ['01-home', 'arch-flat', 'A simple archway shape'],
    ['01-home', 'bridge-flat', 'A bridge as flat geometry'],
    ['01-home', 'boat-flat', 'A boat as a flat silhouette'],
    ['01-home', 'doors-flat', 'Four rectangles as doors'],
    ['01-home', 'lantern-flat', 'A lantern as a flat circle and tassel'],
    ['01-home', 'roof-flat', 'A roof curve as one line'],
    ['01-home', 'grid-flat', 'A lattice as a grid pattern'],
    ['02-yingge', 'leap-flat', 'A dancer leap as a flat figure'],
    ['02-yingge', 'sticks-flat', 'Two sticks crossing as an X'],
    ['02-yingge', 'drum-flat', 'A drum as flat circle and band'],
    ['02-yingge', 'face-flat', 'A face paint pattern as flat shapes'],
    ['02-yingge', 'formation-flat', 'Dots in two curves'],
    ['02-yingge', 'spiral-flat', 'Dots in a spiral'],
    ['02-yingge', 'gong-flat', 'A gong as a flat disc'],
    ['02-yingge', 'hand-flat', 'A hand as flat blocks'],
    ['02-yingge', 'flag-flat', 'A banner as a flat triangle'],
    ['02-yingge', 'motion-flat', 'A figure repeated as motion steps'],
    ['03-tea', 'pot-flat', 'A teapot as flat geometry'],
    ['03-tea', 'cups-flat', 'Three circles in a triangle'],
    ['03-tea', 'pour-flat', 'A line pouring into a circle'],
    ['03-tea', 'tray-flat', 'A tray as a flat rectangle'],
    ['03-tea', 'leaf-flat', 'A tea leaf as one shape'],
    ['03-tea', 'steam-flat', 'Steam as two curved lines'],
    ['03-tea', 'kettle-flat', 'A kettle as a flat shape'],
    ['03-tea', 'gaiwan-flat', 'A lidded bowl as two shapes'],
    ['03-tea', 'cloth-flat', 'A cloth as a folded plane'],
    ['03-tea', 'jar-flat', 'A jar as a flat cylinder'],
    ['03-tea', 'ring-flat', 'One ring on a plain field'],
    ['04-food', 'bowl-flat', 'A bowl as a half circle'],
    ['04-food', 'balls-flat', 'Three circles in a bowl shape'],
    ['04-food', 'noodle-flat', 'Noodles as parallel lines'],
    ['04-food', 'goose-flat', 'Slices as stacked ovals'],
    ['04-food', 'mallet-flat', 'Two mallets as flat blocks'],
    ['04-food', 'omelette-flat', 'A circle on a square'],
    ['04-food', 'cake-flat', 'A molded cake as a flat shape'],
    ['04-food', 'sheet-flat', 'A sheet as one translucent plane'],
    ['04-food', 'sauce-flat', 'A dot of sauce'],
    ['04-food', 'steam-flat', 'Steam as one line'],
    ['05-yinglaoye', 'palanquin-flat', 'A palanquin as stacked rectangles'],
    ['05-yinglaoye', 'lantern-flat', 'Two lanterns as flat circles'],
    ['05-yinglaoye', 'banner-flat', 'Three banners as flat strips'],
    ['05-yinglaoye', 'fire-flat', 'A flame as one shape'],
    ['05-yinglaoye', 'lion-flat', 'A lion mask as flat planes'],
    ['05-yinglaoye', 'gong-flat', 'A gong as a flat disc'],
    ['05-yinglaoye', 'smoke-flat', 'Smoke as one thin curve'],
    ['05-yinglaoye', 'street-flat', 'A street as flat bands'],
    ['06-agent', 'figure-flat', 'A head and shoulders as flat shapes'],
    ['06-agent', 'book-flat', 'An open book as two panels'],
    ['06-agent', 'wave-flat', 'Concentric arcs'],
    ['06-agent', 'window-flat', 'A window as a plane with light'],
  ],
}

async function genOne(setKey, folder, id, brief, idx, total) {
  const outDir = path.join(ROOT, `set-${setKey}`, folder)
  mkdirSync(outDir, { recursive: true })
  const outWebp = path.join(outDir, `${id}.webp`)
  if (!FORCE && existsSync(outWebp)) {
    console.log(`[${setKey}] (${idx}/${total}) skip ${folder}/${id}`)
    return true
  }
  const prompt = brief + AIR
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(`${API}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, prompt, size: SIZE, response_format: 'url', n: 1 }),
      })
      const txt = await r.text()
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${txt.slice(0, 140)}`)
      const item = ((JSON.parse(txt).data || [])[0]) || {}
      let buf
      if (item.b64_json) buf = Buffer.from(item.b64_json, 'base64')
      else if (item.url) {
        const d = await fetch(item.url)
        if (!d.ok) throw new Error(`dl ${d.status}`)
        buf = Buffer.from(await d.arrayBuffer())
      } else throw new Error('no image')

      const tmp = path.join(outDir, `${id}.tmp.png`)
      writeFileSync(tmp, buf)
      execFileSync('ffmpeg', ['-y', '-i', tmp, '-q:v', '92', outWebp], { stdio: 'ignore' })
      try { execFileSync('rm', ['-f', tmp]) } catch {}
      console.log(`[${setKey}] (${idx}/${total}) ok ${folder}/${id}`)
      return true
    } catch (e) {
      console.error(`[${setKey}] (${idx}/${total}) fail ${id} #${attempt}: ${e.message}`)
      if (attempt === 3) return false
      await new Promise((r) => setTimeout(r, 4000 * attempt))
    }
  }
}

async function runSet(setKey) {
  const list = SETS[setKey]
  if (!list) throw new Error(`unknown set ${setKey}`)
  console.log(`\n=== set-${setKey} · ${list.length} 张 · ${MODEL} ${SIZE} ===`)
  let cursor = 0
  const results = []
  async function worker() {
    while (cursor < list.length) {
      const i = cursor++
      const [folder, id, brief] = list[i]
      results.push(await genOne(setKey, folder, id, brief, i + 1, list.length))
    }
  }
  await Promise.all(Array.from({ length: CONC }, () => worker()))
  const ok = results.filter(Boolean).length
  console.log(`=== set-${setKey} 完成 ${ok}/${list.length} ===`)
}

const arg = process.argv[2] || 'all'
if (arg === 'all') {
  for (const k of ['a', 'b', 'c']) await runSet(k)
} else {
  await runSet(arg)
}
