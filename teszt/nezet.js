// Gyors áttekintő: nyitókép az intro végén, aztán képernyőnként végiggörgetve, egy kontaktlapra.
// node nezet.js <url> <out.jpg> <w> <h> [mobile]   (FAKEGPU=1: a 3D billenés és a folyosó is látszik)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
(async () => {
  const [url, out, w, h, mob] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: !!mob, hasTouch: !!mob, locale: 'hu-HU' });
  if (process.env.FAKEGPU) await ctx.addInitScript(require('./fakegpu'));
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url, { waitUntil: 'load' });
  const dir = fs.mkdtempSync('/tmp/claude-0/-home-claude/fa3f2e9e-e4fb-54d1-9a40-cce4b0f6d0f4/scratchpad/nz-');
  for (const t of (process.env.INTRO || '600,1500,2500,6000').split(',').map(Number)) {
    await p.waitForTimeout(t - (t > 600 ? 0 : 0)); await p.screenshot({ path: `${dir}/a-${t}.png` });
  }
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = +h; y < H; y += Math.round(+h * 0.85)) {
    await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(2300);
    await p.screenshot({ path: `${dir}/s-${String(++i).padStart(2, '0')}.png` });
  }
  console.log(errs.join('\n') || 'no errors', 'H=' + H);
  await b.close();
  execFileSync('python3', ['-c', `
import glob,sys
from PIL import Image
fs=sorted(glob.glob('${dir}/a-*.png'),key=lambda f:int(f.split('-')[-1][:-4]))+sorted(glob.glob('${dir}/s-*.png'))
ims=[Image.open(f).convert('RGB') for f in fs]
W=${+w > 900 ? 480 : 260};cols=${+w > 900 ? 4 : 6}
th=[im.resize((W,round(im.height*W/im.width))) for im in ims]
rh=max(t.height for t in th);rows=(len(th)+cols-1)//cols
sh=Image.new('RGB',(cols*(W+6),rows*(rh+6)),'white')
for k,t in enumerate(th): sh.paste(t,((k%cols)*(W+6),(k//cols)*(rh+6)))
sh.save('${out}',quality=72)
print(sh.size)`]);
})();
