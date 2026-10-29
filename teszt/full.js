// Végiggörget (hogy minden görgetésre megjelenő elem előjöjjön), majd teljes oldalas kép: node full.js <url> <out.jpg> <w> <h> [mobile]
const { chromium } = require('playwright');
(async () => {
  const [url, out, w, h, mob] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: !!mob, hasTouch: !!mob });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(4500);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += Math.round(+h * 0.5)) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(260); }
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(2500);
  await p.screenshot({ path: out, fullPage: true, quality: 60, type: 'jpeg' });
  console.log('H', H, errs.join('\n') || 'no errors');
  await b.close();
})();
