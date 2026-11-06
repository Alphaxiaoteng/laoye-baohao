import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const log = [];
page.on('pageerror', e => log.push(`[err] ${e.message.slice(0,150)}`));

// 1) Home: clue pill click switches spotlight
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const pill = page.locator('.clue-pill').nth(1);
if (await pill.count()) {
  await pill.tap();
  const pressed = await pill.getAttribute('aria-pressed');
  log.push(`home clue-pill#2 tap → aria-pressed=${pressed}`);
}
// 2) yingge formation buttons
await page.goto('http://localhost:4173/museum/yingge', { waitUntil: 'networkidle' });
const fbtn = page.locator('[aria-label="切换阵形示意"] button').nth(2);
if (await fbtn.count()) { await fbtn.tap(); log.push(`yingge formation#3 tap → aria-pressed=${await fbtn.getAttribute('aria-pressed')}`); }
// 3) yingge role arrows
const next = page.locator('.yh-role-arrow').nth(1);
if (await next.count()) { await next.tap(); await page.waitForTimeout(300); const cap = await page.locator('.yh-role-frame figcaption').textContent(); log.push(`yingge role next tap → caption=${cap}`); }
// 4) tea hotspots
await page.goto('http://localhost:4173/museum/tea', { waitUntil: 'networkidle' });
const hs = page.locator('.tea-hotspot').first();
if (await hs.count()) { await hs.tap(); await page.waitForTimeout(400); log.push('tea hotspot tap ok'); }
// tea brew next button
await page.goto('http://localhost:4173/museum/tea/brew', { waitUntil: 'networkidle' });
const brewNext = page.locator('.tea-btn-primary').last();
if (await brewNext.count()) { const before = await page.locator('[class*="tea-step"]').first().textContent().catch(()=> 'n/a'); await brewNext.tap(); await page.waitForTimeout(500); log.push('tea brew next tap ok'); }
// 5) food stage: dish buttons
await page.goto('http://localhost:4173/museum/food', { waitUntil: 'networkidle' });
const dishBtn = page.locator('button', { hasText: /牛肉丸|粿|蚝/ }).first();
const stageImg0 = await page.locator('.food-stage-img').getAttribute('src');
if (await dishBtn.count()) { await dishBtn.tap(); await page.waitForTimeout(600); const stageImg1 = await page.locator('.food-stage-img').getAttribute('src'); log.push(`food dish tap: img ${stageImg0} → ${stageImg1}`); }
// 6) yinglaoye procession figure tap
await page.goto('http://localhost:4173/museum/yinglaoye/procession', { waitUntil: 'networkidle' });
const fig = page.locator('[role="presentation"]').first();
if (await fig.count()) { await fig.tap(); await page.waitForTimeout(300); log.push('procession figure tap ok'); }
// 7) listen play button
await page.goto('http://localhost:4173/listen', { waitUntil: 'networkidle' });
const play = page.locator('button[aria-label^="播放"]').first();
if (await play.count()) {
  await play.tap(); await page.waitForTimeout(600);
  const playing = await page.locator('button[aria-pressed="true"][aria-label^="停止播放"]').count();
  log.push(`listen play tap → playing=${playing > 0}`);
  const stop = page.locator('button[aria-label^="停止播放"]').first();
  if (await stop.count()) { await stop.tap(); await page.waitForTimeout(300); }
}
// 8) still-film nav on yinglaoye
await page.goto('http://localhost:4173/museum/yinglaoye', { waitUntil: 'networkidle' });
const nav = page.locator('.still-film-nav').nth(1);
if (await nav.count()) { await nav.tap(); await page.waitForTimeout(400); log.push('still-film next tap ok'); }
console.log(log.join('\n'));
await browser.close();
