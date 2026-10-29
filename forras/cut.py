# Ételfotók kivágása: rembg (isnet) maszk + a tányér pontos ellipszise (konvex burokra illesztve),
# így a tányér széle éles és ép marad; a tányérról kilógó étel a maszkból jön. Lágy árnyék beégetve.
import sys
import numpy as np, cv2
from PIL import Image, ImageFilter
from rembg import remove, new_session
sys.path.insert(0, '/home/claude/gyogygodor3/forras')
from img import cellar, R, O
ses = new_session('isnet-general-use')

def plate_alpha(mask):
    b = (mask > 128).astype(np.uint8)
    cs, _ = cv2.findContours(b, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)
    hull = cv2.convexHull(c)
    (cx, cy), (w, h), ang = cv2.fitEllipse(hull)
    S = 4; H, W = mask.shape
    big = np.zeros((H * S, W * S), np.uint8)
    cv2.ellipse(big, ((cx * S, cy * S), (w * S * 0.992, h * S * 0.992), ang), 255, -1, cv2.LINE_AA)
    return cv2.resize(big, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255

for n in sys.argv[1:] or ['oriasborda', 'porkolt', 'halaszle', 'turogomboc']:
    src = Image.open(R + 'gy-wo-%s.jpg' % n).convert('RGB')
    m = np.asarray(remove(src, session=ses, only_mask=True))
    pa = plate_alpha(m)
    food = np.clip((m.astype(np.float32) / 255 - 0.6) / 0.3, 0, 1)   # csak a biztos, kilógó részek
    a = np.maximum(pa, food)
    al = Image.fromarray((a * 255).astype(np.uint8))
    im = cellar(src, 1.0, 0.95, (1.03, 1.0, 0.94)).convert('RGBA'); im.putalpha(al)
    im = im.crop(al.point(lambda v: 255 if v > 10 else 0).getbbox())
    pad = round(im.width * 0.12); W, H = im.width + 2 * pad, im.height + 2 * pad
    sh = Image.new('L', (W, H), 0); sh.paste(im.split()[3].point(lambda v: v * 0.6), (pad + round(pad * .08), pad + round(pad * .3)))
    sh = sh.filter(ImageFilter.GaussianBlur(pad * 0.3))
    out = Image.new('RGBA', (W, H), (6, 4, 3, 0)); out.putalpha(sh); out.alpha_composite(im, (pad, pad))
    w = min(720, round(out.width * 1.4)); out = out.resize((w, round(out.height * w / out.width)), Image.LANCZOS)
    out.save(O + 'etel-%s.webp' % n, 'WEBP', quality=84, method=6); print(n, out.size)
