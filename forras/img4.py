# Gyógygödör v4 új képei: a lefelé vezető út (Kossow-ház, bejárat, lépcső) és a palackok kivágása.
# Futtatás: python3 forras/img4.py [név ...]
import numpy as np
from PIL import Image, ImageFilter
from img import load, crop_ar, cellar, save, only

if only('kapu'):
    # a hero boltíves ablaka: a kapu és a tábla, álló 3:4
    im = cellar(load('gy-fq-og.jpg'), 1.02, 0.92, (1.03, 1.0, 0.94))
    save(im.crop((300, 0, 1110, 1080)), 'kapu', [810, 560])
if only('le'):
    # a teljes képernyős lépések; fekvő képek, telefonon object-position vágja
    save(cellar(load('gy-fq-og.jpg'), 1.02, 0.92, (1.03, 1.0, 0.94)), 'le-haz', [1620, 960])
    save(cellar(load('gy-mu-et2-up.png'), 0.96, 0.9), 'le-bejarat', [1920, 1080])
    save(cellar(load('gy-mu-fq3-up.png'), 0.92), 'le-lepcso', [1920, 1080])
if only('palack'):
    from rembg import remove, new_session
    ses = new_session('isnet-general-use')
    for n in ('furmint', 'kekfrankos', 'cabernet'):
        src = load('gy-wo-%s.jpg' % n)
        m = np.asarray(remove(src, session=ses, only_mask=True)).astype(np.float32) / 255
        m = np.clip((m - 0.35) / 0.4, 0, 1)
        a = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
        bb = a.point(lambda v: 255 if v > 24 else 0).getbbox()
        im = src.copy(); im.putalpha(a)
        im = im.crop((bb[0] - 6, bb[1] - 6, bb[2] + 6, bb[3] + 6))
        save(im, 'bor-' + n, [im.width], q=86, alpha=True)
