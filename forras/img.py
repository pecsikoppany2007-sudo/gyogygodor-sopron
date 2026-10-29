# Gyógygödör v3 képek: egységes, meleg pinceszín, webp több méretben.
# Futtatás: python3 forras/img.py [név ...]
import sys
from PIL import Image, ImageOps, ImageEnhance, ImageFilter
R = '/home/claude/assets/raw/'
O = '/home/claude/gyogygodor3/site/img/'

def load(f): return ImageOps.exif_transpose(Image.open(R + f)).convert('RGB')

def crop_ar(im, ar, cx=0.5, cy=0.5):
    W, H = im.size
    if W / H > ar: w = round(H * ar); x = round((W - w) * cx); return im.crop((x, 0, x + w, H))
    h = round(W / ar); y = round((H - h) * cy); return im.crop((0, y, W, y + h))

def curve(v):
    # lágy S-görbe: mélyebb árnyék, kímélt csúcsfény
    t = v / 255.0
    t = t * t * (3 - 2 * t) * 0.35 + t * 0.65
    return int(max(0, min(255, round(t * 255))))

def cellar(im, expo=0.94, sat=0.86, warm=(1.05, 1.0, 0.9), contrast=1.0):
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Brightness(im).enhance(expo)
    if contrast != 1.0: im = ImageEnhance.Contrast(im).enhance(contrast)
    im = im.point(curve)
    r, g, b = im.split()
    im = Image.merge('RGB', [c.point(lambda v, k=k: min(255, round(v * k))) for c, k in zip((r, g, b), warm)])
    return im

def save(im, name, widths, q=80, alpha=False):
    for w in widths:
        x = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        if not alpha: x = x.filter(ImageFilter.UnsharpMask(0.6, 40, 2))
        p = O + '%s-%d.webp' % (name, w)
        x.save(p, 'WEBP', quality=q, method=6)
        print(p.split('/')[-1], x.size)

def only(n): return len(sys.argv) < 2 or n in sys.argv[1:]

if __name__ == '__main__':
    if only('hero'):
        im = cellar(load('gy-mu-hero-up.png'), 0.9, 0.84)
        save(im, 'hero', [2400, 1280], 78)
    if only('pince'): save(crop_ar(cellar(load('gy-mu-et3-up.png')), 4 / 5, 0.5), 'pince', [1100, 700])
    if only('rooms'):
        save(crop_ar(cellar(load('gy-wl-3.jpg'), 0.96), 3 / 4, 0.55), 'sontes', [810, 560])
        save(crop_ar(cellar(load('gy-mu-et6-up.png')), 3 / 4, 0.5), 'ronkos', [1000, 600])
        save(crop_ar(cellar(load('gy-mu-et4-up.png')), 3 / 4, 0.5), 'etterem', [1000, 600])
    if only('borok'): save(crop_ar(cellar(load('gy-mu-fq3-up.png'), 0.92), 4 / 5, 0.62), 'lepcso', [1100, 700])
    if only('kepek'):
        save(crop_ar(cellar(load('gy-mu-et2-up.png'), 0.96, 0.9), 4 / 3, 0.5, 0.5), 'bejarat', [1000, 640])
        save(crop_ar(cellar(load('gy-wl-1.jpg'), 0.98, 0.9), 4 / 3, 0.5, 0.6), 'kint', [1200, 700])
        save(crop_ar(cellar(load('gy-s-foter.jpg'), 1.0, 0.9), 4 / 3), 'foter', [1181, 700])
        save(crop_ar(cellar(load('gy-wl-2.jpg'), 0.98, 0.9), 4 / 5, 0.5, 0.5), 'este', [900, 600])
    if only('tars'): save(crop_ar(cellar(load('gy-et-7.jpg')), 4 / 3), 'tarsasag', [960])
    if only('haz'): save(crop_ar(cellar(load('gy-fq-og.jpg'), 1.0, 0.92), 4 / 3, 0.5, 0.6), 'haz', [1200, 700])
