// Címek: egyik sor se lógjon ki a saját oszlopából (minden szélességen és nyelven, 3D módban is). node cimek.js <url>
const { chromium } = require('playwright');
const url = process.argv[2];
(async () => {
  const b = await chromium.launch(); let bad = 0;
  for (const fake of [false, true]) for (const w of [320, 360, 390, 768, 1024, 1100, 1180, 1280, 1366, 1440, 1600, 1920]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 760, hasTouch: w < 760 });
    if (fake) await ctx.addInitScript(require('./fakegpu'));
    const p = await ctx.newPage();
    for (const l of ['hu', 'de', 'en']) {
      await p.goto(url + '?lang=' + l, { waitUntil: 'load' }); await p.waitForTimeout(1900);
      const r = await p.evaluate(() => [...document.querySelectorAll('main h2, .lede')].map(h => {
        const box = h.getBoundingClientRect().width, parent = h.parentElement.getBoundingClientRect().width;
        let wmax = 0; h.querySelectorAll('.ln__i').forEach(i => { const rg = document.createRange(); rg.selectNodeContents(i); wmax = Math.max(wmax, rg.getBoundingClientRect().width); });
        return { t: h.getAttribute('aria-label') || h.textContent, box: Math.round(box), wmax: Math.round(wmax) };
      }).filter(o => o.wmax > o.box + 12));
      r.forEach(o => { bad++; console.log(`HIBA ${fake ? '3D ' : ''}${w} ${l}: „${o.t}” ${o.wmax} > ${o.box}`); });
    }
    await ctx.close();
  }
  console.log(bad ? bad + ' hiba' : 'minden cím elfér'); await b.close();
})();
