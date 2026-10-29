// Bemutató videó a nyitásról és egy végiggörgetésről: NODE_PATH=$(npm root -g) node teszt/video.js <url> <kimenet.mp4> gep|telefon
// A headless Chromium szoftveres GL-lel nem bírja valós időben a nyitóképet, ezért az oldal órája negyed sebességgel jár
// (performance.now, rAF, időzítők, CSS és Web Animations), a felvételt pedig az ffmpeg négyszeresére gyorsítja.
// Telefonon a Playwright videója csak CSS-pixelben, a kép bal felső negyedébe rögzít, ezért ott CDP-screencast menti
// a képkockákat teljes (2x) felbontásban, időbélyeggel, és az ffmpeg ezekből rakja össze a filmet.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const K = 0.25;

(async () => {
  const [url, out, mode] = process.argv.slice(2);
  const phone = mode === 'telefon';
  const vp = phone ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const size = phone ? { width: 780, height: 1688 } : vp;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vid-'));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext(Object.assign({ viewport: vp, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone, locale: 'hu-HU' }, phone ? {} : { recordVideo: { dir, size } }));
  await ctx.addInitScript(k => {
    const pn = performance.now.bind(performance), t0 = pn();
    performance.now = () => t0 + (pn() - t0) * k;
    const DN = Date.now, d0 = DN(); Date.now = () => d0 + (DN() - d0) * k;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = cb => raf(t => cb(t0 + (t - t0) * k));
    const st = window.setTimeout.bind(window), si = window.setInterval.bind(window);
    window.setTimeout = (f, d, ...a) => st(f, (d || 0) / k, ...a);
    window.setInterval = (f, d, ...a) => si(f, (d || 0) / k, ...a);
  }, K);
  // gépen az oldal grafikus chipet lát (3D billenés, folyosó), ahogy egy valódi gépen
  if (!phone) await ctx.addInitScript(require('./fakegpu'));
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: K });
  const shots = [];
  if (phone) {
    cdp.on('Page.screencastFrame', f => {
      const file = path.join(dir, String(shots.length).padStart(5, '0') + '.jpg');
      fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
      shots.push([file, f.metadata.timestamp]);
      cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: size.width, maxHeight: size.height, everyNthFrame: 1 });
  }
  const wait = ms => p.waitForTimeout(ms / K);
  // sima görgetés oldalidőben mérve: a gépen görgővel (a nyitókép követi), telefonon húzásszerű lendülettel
  const glide = async (to, ms) => {
    const from = await p.evaluate(() => scrollY), n = Math.max(1, Math.round(ms / 1000 * 30));
    for (let i = 1; i <= n; i++) {
      const u = i / n, e = phone ? 1 - Math.pow(1 - u, 3) : u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      await p.evaluate(y => window.scrollTo(0, y), Math.round(from + (to - from) * e));
      await p.waitForTimeout(1000 / 30 / K);
    }
  };
  const top = sel => p.evaluate(s => document.querySelector(s).getBoundingClientRect().top + scrollY - 70, sel);

  await p.goto(url, { waitUntil: 'commit' });
  await wait(4200);
  const abs = sel => p.evaluate(s => { let e = document.querySelector(s), y = 0; while (e) { y += e.offsetTop; e = e.offsetParent; } return y; }, sel);
  const leEnd = await p.evaluate(() => document.querySelector('.le').offsetHeight - innerHeight);
  if (phone) {
    // érintőn a lejárat egyszer, időzítve fut le az első görgetésre
    await glide(Math.round(leEnd * .4), 900); await wait(3800);
  } else {
    await glide(leEnd, 7000); await wait(1400);
  }
  await glide(await top('#pince'), phone ? 1300 : 1700); await wait(phone ? 1900 : 1500);
  await glide(await top('.nev'), phone ? 1300 : 1700); await wait(phone ? 1900 : 1500);
  const t0 = await abs('.termek'), t1 = await p.evaluate(() => document.querySelector('.termek').offsetHeight - innerHeight);
  if (!phone && t1 > 200) { await glide(t0, 1700); await wait(900); await glide(t0 + t1, 6000); await wait(900); }
  else { await glide(await top('#termek'), 1300); await wait(1900); }
  for (const s of ['#etlap', '#borok', '#kepek', '#elerhetoseg']) {
    await glide(await top(s), phone ? 1300 : 1700);
    await wait(phone ? 1900 : 1600);
  }
  await glide(await p.evaluate(() => document.documentElement.scrollHeight - innerHeight), 1500);
  await wait(2200);
  if (phone) {
    await cdp.send('Page.stopScreencast');
    await ctx.close(); await b.close();
    // a képkockák valós időbélyegei negyedelve adják az oldalidőt
    const list = shots.map(([f, t], i) => `file '${f}'\nduration ${(((shots[i + 1] || shots[i])[1] - t) * K || 1 / 30).toFixed(4)}`).join('\n') + `\nfile '${shots[shots.length - 1][0]}'\n`;
    fs.writeFileSync(path.join(dir, 'lista.txt'), list);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(dir, 'lista.txt'), '-vf', `scale=${size.width}:${size.height}:force_original_aspect_ratio=decrease,pad=${size.width}:${size.height}:(ow-iw)/2:0:color=0x130e0c,fps=30`, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  } else {
    const v = p.video();
    await ctx.close(); await b.close();
    const src = await v.path();
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', `setpts=${K}*PTS,fps=30`, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  }
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('kész:', out, Math.round(fs.statSync(out).size / 1e5) / 10, 'MB');
})();
