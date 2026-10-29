// Görgetve képernyőnként fotóz és összefűzi (fullPage helyett, mert az a vh-t elrontja): node stitch.js <url> <out-prefix> <w> <h> [mobile]
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
  await p.waitForTimeout(4200);
  const start = await p.evaluate(() => document.querySelector('.hero-wrap').offsetHeight);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  // végiggörgetés, hogy a görgetésre megjelenő elemek előjöjjenek
  for (let y = 0; y < H; y += Math.round(+h * 0.4)) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(220); }
  await p.waitForTimeout(1500);
  await p.addStyleTag({ content: '.hdr,.mcall{visibility:hidden!important}' });
  let i = 0;
  for (let y = start; y < H; y += +h) {
    await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(350);
    await p.screenshot({ path: `${out}-${String(i).padStart(2, '0')}.png` }); i++;
  }
  const last = await p.evaluate(() => window.pageYOffset);
  console.log(JSON.stringify({ start, H, n: i, last }), errs.join('\n') || 'no errors');
  await b.close();
})();
