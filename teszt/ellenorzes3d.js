// Ellenőrzés 3D módban (FAKEGPU): menüpontok a folyosónál és a vízszintes galériánál, középről újratöltés,
// kattinthatóság (semmi láthatatlan nem takar), nyelvváltás a felbontott címekkel. node ellenorzes3d.js <url>
const { chromium } = require('playwright');
const url = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'hu-HU' });
  await ctx.addInitScript(require('./fakegpu'));
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url, { waitUntil: 'load' }); await sleep(5500);
  console.log('osztályok:', await p.evaluate(() => [document.querySelector('.termek').className, document.querySelector('.kepek').className].join(' | ')));
  for (const id of ['pince', 'termek', 'etlap', 'borok', 'kepek', 'elerhetoseg']) {
    await p.click(`.hdr__nav a[href="#${id}"]`); await sleep(2600);
    const r = await p.evaluate(id => {
      const s = document.getElementById(id), h = s.querySelector('h2'), hr = h.getBoundingClientRect();
      const ln = h.querySelector('.ln__i'), op = ln ? getComputedStyle(ln).transform : 'nincs';
      return { top: Math.round(hr.top), bottom: Math.round(hr.bottom), vis: getComputedStyle(h).opacity, ln: op };
    }, id);
    const ok = r.top >= 60 && r.bottom <= 900;
    console.log((ok ? 'ok ' : 'HIBA ') + id + ' ' + JSON.stringify(r));
  }
  // kattinthatóság: a tartalom linkjeit nem takarja semmi
  for (const sel of ['.tars__cta .btn', '.info a[href^="tel"]', '.card a[href$=".pdf"], .card .lnk']) {
    const el = await p.$(sel); if (!el) { console.log('nincs ' + sel); continue; }
    await el.scrollIntoViewIfNeeded(); await sleep(1800);
    const hit = await p.evaluate(sel => { const a = document.querySelector(sel), r = a.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return a === e || a.contains(e) ? 'ok' : 'HIBA takarja: ' + (e && e.className); }, sel);
    console.log(hit + ' ' + sel);
  }
  // középről újratöltés a galériában és a folyosóban
  for (const id of ['kepek', 'termek']) {
    await p.evaluate(id => { const s = document.getElementById(id); let y = 0, e = s; while (e) { y += e.offsetTop; e = e.offsetParent; } window.scrollTo(0, y + s.offsetHeight * .4); }, id);
    await sleep(800); await p.reload({ waitUntil: 'load' }); await sleep(4000);
    const r = await p.evaluate(() => {
      const hid = [...document.querySelectorAll('main *')].filter(e => { const b = e.getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight || b.right < 0 || b.left > innerWidth || !b.width) return false; const cs = getComputedStyle(e); return (e.matches('.rv,.sl') && !e.classList.contains('in')); }).length;
      return { y: Math.round(scrollY), hid };
    });
    console.log((r.hid ? 'HIBA ' : 'ok ') + 'újratöltés ' + id + ' ' + JSON.stringify(r));
  }
  // nyelvváltás: a címek új nyelven, felbontva
  await p.click('.hdr__lang [data-lang="de"]'); await sleep(600);
  console.log('de cím:', await p.evaluate(() => { const h = document.querySelector('#t-etlap'); return h.textContent + ' | sorok: ' + h.querySelectorAll('.ln').length + ' | aria: ' + h.getAttribute('aria-label'); }));
  console.log(errs.length ? 'HIBA konzol: ' + errs.join(' / ') : 'konzol tiszta');
  await b.close();
})();
