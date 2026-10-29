// Megosztási kép (1200x630) a kész nyitóképről: node og.js <url> <out.jpg>
const { chromium } = require('playwright');
(async () => {
  const [url, out] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await (await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, locale: 'hu-HU' })).newPage();
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('intro-done'), null, { timeout: 15000 });
  await p.waitForTimeout(1500);
  await p.addStyleTag({ content: '.hdr__nav,.hdr__lang,.hdr__call,.hdr__burger,.mcall,.le__cta,.le__today,.le__cue{visibility:hidden!important}' });
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, type: 'jpeg', quality: 86 });
  await b.close();
})();
