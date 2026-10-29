// Átadási képernyőképek: node teszt/kepek.js <url> <mappa>
// Gépen az oldal grafikus chipet lát (fakegpu), így a 3D folyosó és a billenés is a képen van.
const { chromium } = require('playwright');
const fake = require('./fakegpu');
const [url, out] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  async function page(phone, lang) {
    const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'hu-HU' } : { viewport: { width: 1440, height: 900 }, locale: 'hu-HU' });
    if (!phone) await ctx.addInitScript(fake);
    const p = await ctx.newPage();
    await p.goto(url + '?lang=' + (lang || 'hu'), { waitUntil: 'load' }); await p.waitForTimeout(3800);
    return p;
  }
  const abs = (p, s) => p.evaluate(s => { let e = document.querySelector(s), y = 0; while (e) { y += e.offsetTop; e = e.offsetParent; } return y; }, s);
  const go = async (p, y, ms) => { await p.evaluate(y => window.scrollTo(0, y), Math.round(y)); await p.waitForTimeout(ms || 2600); };
  const snap = (p, n) => p.screenshot({ path: `${out}/${n}.jpg`, quality: 84 });
  let p = await page(false);
  await snap(p, '01-nyitokep-gep');
  const R = await p.evaluate(() => document.querySelector('.le').offsetHeight - innerHeight);
  await go(p, R * .24); await snap(p, '02-lejarat-kossow-haz-gep');
  await go(p, R); await snap(p, '03-lejarat-pince-gep');
  const T = await abs(p, '.termek'), TR = await p.evaluate(() => document.querySelector('.termek').offsetHeight - innerHeight);
  await go(p, T + TR * .42); await snap(p, '04-harom-terem-3d-gep');
  await go(p, (await abs(p, '#etlap .plates')) - 110); await snap(p, '05-etlap-gep');
  await go(p, (await abs(p, '#borok h2')) - 136); await snap(p, '06-borok-gep');
  await go(p, (await abs(p, '#elerhetoseg h2')) - 136); await snap(p, '07-elerhetoseg-gep');
  await p.context().close();
  p = await page(true);
  await snap(p, '08-nyitokep-telefon');
  await go(p, 40, 4800); await snap(p, '09-lejarat-telefon');
  await go(p, (await abs(p, '#etlap .plates')) - 90); await snap(p, '10-etlap-telefon');
  await p.context().close();
  p = await page(false, 'de');
  await snap(p, '11-nyitokep-gep-nemet');
  await p.context().close();
  await b.close();
})();
