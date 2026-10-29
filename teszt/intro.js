// Nyitóanimáció képkockái és konzolhibák: node intro.js <url> <out> <w> <h> [mobile]
const { chromium } = require('playwright');
(async () => {
  const [url, out, w, h, mob] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mob ? 2 : 1, isMobile: !!mob, hasTouch: !!mob, locale: 'hu-HU' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  const t0 = Date.now();
  for (const t of [300, 900, 1500, 2100, 2700, 3600, 4800]) {
    const wait = t - (Date.now() - t0); if (wait > 0) await p.waitForTimeout(wait);
    await p.screenshot({ path: `${out}-${t}.jpg`, quality: 70 });
  }
  console.log('classes:', await p.evaluate(() => document.documentElement.className));
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
