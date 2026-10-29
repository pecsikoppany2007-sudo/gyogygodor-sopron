// Ellenőrzés: kilógás minden szélességen és nyelven, menüpontok, újratöltés oldal közepén, élő nyelvváltás,
// csökkentett mozgás, WebGL nélkül. node ellenorzes.js <url> <képek mappája>
const { chromium } = require('playwright');
const [url, out] = process.argv.slice(2);
const GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const problems = [];
const bad = (s) => { problems.push(s); console.log('HIBA ' + s); };

async function page(b, w, h, mob, extra) {
  const ctx = await b.newContext(Object.assign({ viewport: { width: w, height: h }, isMobile: !!mob, hasTouch: !!mob }, extra || {}));
  const p = await ctx.newPage();
  p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  return p;
}

(async () => {
  const b = await chromium.launch({ args: GL });

  // 1. kilógás
  for (const w of [320, 360, 390, 414, 768, 820, 1024, 1180, 1280, 1440, 1920]) for (const lang of ['hu', 'de', 'en']) {
    const mob = w < 1100;
    const p = await page(b, w, mob ? 760 : 900, mob);
    await p.goto(url + '?lang=' + lang, { waitUntil: 'load' }); await sleep(600);
    const r = await p.evaluate(() => {
      const W = document.documentElement.clientWidth, over = [];
      document.querySelectorAll('body *').forEach(e => {
        if (e.closest('svg') || e.closest('.marq') || e.closest('.hero__media') || e.closest('.mnav') || e.closest('[hidden]') || e.matches('.skip') || e.matches('.ph > img')) return;
        const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || cs.position === 'fixed') return;
        const r = e.getBoundingClientRect(); if (!r.width) return;
        if (r.right > W + 1 || r.left < -1) over.push((e.className || e.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
      });
      return { sw: document.documentElement.scrollWidth, W, over: over.slice(0, 6) };
    });
    if (r.sw > r.W || r.over.length) bad(`kilógás ${w} ${lang}: scrollWidth ${r.sw}/${r.W} ${r.over.join(' | ')}`);
    if (p.errs.length) bad(`hiba ${w} ${lang}: ${p.errs.join('; ')}`);
    await p.context().close();
  }
  console.log('kilógás kész');
  if (process.env.CSAK === 'kilogas') { await b.close(); console.log(problems.length ? `\n${problems.length} hiba` : '\nminden rendben'); return; }

  // 2. menüpontok
  for (const [w, h, mob] of [[1440, 900, 0], [390, 844, 1], [1024, 768, 1]]) {
    const p = await page(b, w, h, mob);
    await p.goto(url + '?lang=hu', { waitUntil: 'load' }); await sleep(4200);
    for (const id of ['pince', 'termek', 'etlap', 'borok', 'kepek', 'elerhetoseg']) {
      if (w < 1100) { await p.click('.hdr__burger'); await sleep(500); await p.click(`#mnav a[href="#${id}"]`); }
      else await p.click(`.hdr__nav a[href="#${id}"]`);
      await sleep(1600);
      const r = await p.evaluate(id => {
        const hd = document.querySelector(id === 'etlap' ? '#etlap .plates' : '#' + id + ' h2'), hdr = document.querySelector('.hdr').getBoundingClientRect();
        return { top: Math.round(hd.getBoundingClientRect().top), hdr: Math.round(hdr.bottom), op: getComputedStyle(hd).opacity };
      }, id);
      const ok = r.top >= r.hdr && r.top < r.hdr + 160;
      console.log(`menü ${w} #${id}: cím teteje ${r.top}, fejléc alja ${r.hdr}${ok ? '' : '  <-'}`);
      if (!ok) bad(`menü ${w} #${id}: cím ${r.top}px, fejléc ${r.hdr}px`);
      await p.screenshot({ path: `${out}/menu-${w}-${id}.jpg`, quality: 60 });
    }
    await p.context().close();
  }

  // 3. újratöltés az oldal közepén
  for (const [w, h, mob] of [[1440, 900, 0], [390, 844, 1]]) {
    const p = await page(b, w, h, mob);
    await p.goto(url + '?lang=hu', { waitUntil: 'load' }); await sleep(3000);
    await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.55)); await sleep(800);
    await p.reload({ waitUntil: 'load' }); await sleep(3500);
    const r = await p.evaluate(() => {
      const V = innerHeight, hidden = [];
      document.querySelectorAll('.rv, .rv-ph').forEach(e => {
        const b = e.getBoundingClientRect();
        if (b.bottom > 0 && b.top < V * 0.85 && !e.classList.contains('in')) hidden.push(e.className + ' @' + Math.round(b.top));
      });
      return { y: Math.round(scrollY), hidden };
    });
    console.log(`újratöltés ${w}: scrollY ${r.y}, rejtve maradt ${r.hidden.length}`);
    if (r.hidden.length) bad(`újratöltés ${w}: rejtve ${r.hidden.join(', ')}`);
    if (p.errs.length) bad(`újratöltés ${w}: ${p.errs.join('; ')}`);
    await p.screenshot({ path: `${out}/reload-${w}.jpg`, quality: 60 });
    await p.context().close();
  }

  // 4. élő nyelvváltás = friss betöltés
  for (const lang of ['de', 'en', 'hu']) {
    const p = await page(b, 1440, 900, 0, { locale: 'hu-HU' });
    await p.goto(url, { waitUntil: 'load' }); await sleep(3000);
    if (lang === 'hu') { await p.click('.hdr__lang [data-lang="de"]'); await sleep(400); }
    await p.click(`.hdr__lang [data-lang="${lang}"]`); await sleep(900);
    const grab = () => p.evaluate(() => ({
      txt: [...document.querySelectorAll('[data-i18n]')].map(e => e.textContent).join('|'),
      alt: [...document.querySelectorAll('[data-i18n-alt]')].map(e => e.alt).join('|'),
      lang: document.documentElement.lang, title: document.title,
      today: document.querySelector('.js-today').textContent, hours: document.querySelector('.js-now').textContent,
      prices: [...document.querySelectorAll('li > b, .wines b, .btn b')].map(e => e.textContent).join('|')
    }));
    const live = await grab();
    const q = await page(b, 1440, 900, 0);
    await q.goto(url + '?lang=' + lang, { waitUntil: 'load' }); await sleep(1500);
    const fresh = await q.evaluate(() => ({
      txt: [...document.querySelectorAll('[data-i18n]')].map(e => e.textContent).join('|'),
      alt: [...document.querySelectorAll('[data-i18n-alt]')].map(e => e.alt).join('|'),
      lang: document.documentElement.lang, title: document.title,
      today: document.querySelector('.js-today').textContent, hours: document.querySelector('.js-now').textContent,
      prices: [...document.querySelectorAll('li > b, .wines b, .btn b')].map(e => e.textContent).join('|')
    }));
    for (const k of Object.keys(live)) if (live[k] !== fresh[k]) {
      const a = (live[k] || '').split('|'), c = (fresh[k] || '').split('|'), i = a.findIndex((x, j) => x !== c[j]);
      bad(`nyelvváltás ${lang} ${k}: élő "${a[i]}" / friss "${c[i]}"`);
    }
    if (p.errs.length) bad(`nyelvváltás ${lang}: ${p.errs.join('; ')}`);
    console.log(`nyelvváltás ${lang}: ${live.lang} ${live.title}`);
    await p.context().close(); await q.context().close();
  }

  // 5. csökkentett mozgás
  {
    const p = await page(b, 1440, 900, 0, { reducedMotion: 'reduce' });
    await p.goto(url + '?lang=hu', { waitUntil: 'load' }); await sleep(1500);
    const r = await p.evaluate(() => ({ cls: document.documentElement.className, h1: getComputedStyle(document.querySelector('.hero__h1')).opacity}));
    console.log('csökkentett mozgás:', JSON.stringify(r));
    if (!/no-intro/.test(r.cls) || r.h1 !== '1') bad('csökkentett mozgás: ' + JSON.stringify(r));
    await p.screenshot({ path: `${out}/reduced.jpg`, quality: 60 });
    await p.context().close();
  }
  await b.close();

  // 6. WebGL nélkül
  {
    const b2 = await chromium.launch({ args: ['--disable-gpu', '--disable-webgl', '--disable-3d-apis'] });
    const p = await page(b2, 1440, 900, 0);
    await p.goto(url + '?lang=hu', { waitUntil: 'load' }); await sleep(5000);
    const r = await p.evaluate(() => ({ cls: document.documentElement.className, h1: getComputedStyle(document.querySelector('.hero__h1')).opacity }));
    console.log('WebGL nélkül:', JSON.stringify(r), p.errs.join('; '));
    if (r.h1 !== '1' || p.errs.length) bad('WebGL nélkül: ' + JSON.stringify(r) + ' ' + p.errs.join('; '));
    await p.screenshot({ path: `${out}/nogl.jpg`, quality: 60 });
    const m = await page(b2, 390, 844, 1);
    await m.goto(url + '?lang=hu', { waitUntil: 'load' }); await sleep(5000);
    await m.screenshot({ path: `${out}/nogl-m.jpg`, quality: 60 });
    await b2.close();
  }
  console.log(problems.length ? `\n${problems.length} hiba` : '\nminden rendben');
})();
