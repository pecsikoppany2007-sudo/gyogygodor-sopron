// Egy szakasz képe, miután odáig minden görgetésre megjelenő elem előjött: node shot.js <url> <out.png> <w> <h> <selector> [mobile]
const { chromium } = require('playwright');
(async () => {
  const [url, out, w, h, sel, mob] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mob ? 2 : 1, isMobile: !!mob, hasTouch: !!mob, locale: 'hu-HU' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(4000);
  const Y = await p.evaluate(s => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
  for (let y = 0; y <= Y; y += Math.round(+h * 0.4)) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(200); }
  await p.evaluate(y => window.scrollTo(0, y), Y); await p.waitForTimeout(+process.env.WAIT || 3500);
  await p.addStyleTag({ content: '.hdr,.mcall{visibility:hidden!important}' });
  await p.screenshot({ path: out });
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
