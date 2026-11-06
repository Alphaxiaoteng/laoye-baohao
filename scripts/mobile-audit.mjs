import { chromium } from 'playwright';

const routes = ['/', '/museum/yingge', '/museum/yingge/story', '/museum/tea', '/museum/tea/brew', '/museum/tea/gesture', '/museum/food', '/museum/food/menu', '/recipe/beef-ball', '/museum/yinglaoye', '/museum/yinglaoye/procession', '/museum/yinglaoye/cases', '/listen', '/guide', '/skill', '/docs', '/journal', '/about', '/sources'];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(`[pageerror] ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`[console] ${m.text().slice(0,200)}`); });
const results = [];
for (const r of routes) {
  errors.length = 0;
  try {
    await page.goto('http://localhost:4173' + r, { waitUntil: 'networkidle', timeout: 25000 });
  } catch (e) { results.push({route: r, err: 'goto: '+e.message.slice(0,120)}); continue; }
  await page.waitForTimeout(600);
  const audit = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflowX = doc.scrollWidth > window.innerWidth + 1;
    // find widest offender
    let worst = null, worstW = 0;
    for (const el of document.querySelectorAll('body *')) {
      const w = el.getBoundingClientRect();
      if (w.right > window.innerWidth + 2 && w.width > worstW && w.width < 3000) { worstW = w.width; worst = el.tagName + '.' + String(el.className).slice(0,60); }
    }
    const imgs = [...document.querySelectorAll('img')];
    const broken = imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src'));
    return { overflowX, worst, worstW: Math.round(worstW), scrollW: doc.scrollWidth, imgCount: imgs.length, broken: broken.slice(0,5) };
  });
  results.push({ route: r, ...audit, errors: errors.slice(0,3) });
}
console.log(JSON.stringify(results, null, 1));
await browser.close();
