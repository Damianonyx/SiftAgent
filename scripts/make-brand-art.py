#!/usr/bin/env python3
"""Make brand-yellow versions of the approved artwork for the web workspace.

    python3 scripts/make-brand-art.py dist/app/reference-art.jpg dist/app

Writes:
  scene-brand.jpg   reference-art.jpg with its bright yellows (rabbit,
                    particles) moved to the brand yellow #fddf04; the dimmer
                    moon and glow only get the small hue shift. Same size
                    and layout, so the scene renderer's coordinates still apply.
                    Only hue and saturation of yellow pixels change; brightness,
                    shapes and everything else are kept. Nothing is redrawn.
  brand-rabbit.png  the small logo rabbit on a transparent background, yellow
                    remapped to #fddf04 and its dark outline kept.
The original reference-art.jpg is unchanged (the public website uses it).
Requires Pillow.
"""
import colorsys
import sys
from pathlib import Path
from PIL import Image

BRAND = (0xFD, 0xDF, 0x04)
INK = (0x12, 0x12, 0x10)
BRAND_H, BRAND_S, _ = colorsys.rgb_to_hsv(*(c / 255 for c in BRAND))
src, out = Image.open(sys.argv[1]).convert('RGB'), Path(sys.argv[2])


def brand_shift(p):
    """Move a yellow pixel to the brand hue and saturation, keeping its brightness."""
    h, s, v = colorsys.rgb_to_hsv(*(c / 255 for c in p))
    deg = h * 360
    # Weight: 1 inside the yellow band (40–70°), fading out to 30° and 80°;
    # greys and near-blacks (low saturation or value) are left alone.
    band = 1 if 40 <= deg <= 70 else max(0, 1 - (40 - deg) / 10) if deg < 40 else max(0, 1 - (deg - 70) / 10)
    w = band * min(1, max(0, (s - .18) / .25)) * min(1, max(0, (v - .12) / .2))
    if w <= 0: return p
    target_s = min(1, s * BRAND_S / .77)  # the artwork's main yellow has S≈.77
    # Saturate only bright yellows (rabbit, particles); the dimmer moon and glow
    # keep their original muted tone.
    ws = w * min(1, max(0, (v - .7) / .2))
    nh = h + (BRAND_H - h) * w; ns = s + (target_s - s) * ws
    return tuple(round(c * 255) for c in colorsys.hsv_to_rgb(nh, ns, v))


def scene():
    img = src.copy(); px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            px[x, y] = brand_shift(px[x, y])
    img.save(out / 'scene-brand.jpg', quality=92, optimize=True, progressive=True)
    return img.size


def to_brand(p, ref=.88):
    # Keep the pixel's brightness, swap the logo's lemon hue for #fddf04.
    r, g, b = p
    k = (r * .3 + g * .59 + b * .11) / 255 / ref
    if k <= 1: return tuple(int(c * k) for c in BRAND)
    lift = min(1, (k - 1) * 2)
    return tuple(int(c + (255 - c) * lift * .5) for c in BRAND)


def logo_rabbit():
    # The logo mark sits on light paper in the artwork's top-left corner.
    crop = src.crop((43, 28, 83, 75)); scale = 6
    big = crop.resize((crop.width * scale, crop.height * scale), Image.BICUBIC); px = big.load()
    img = Image.new('RGBA', big.size)
    for y in range(big.height):
        for x in range(big.width):
            r, g, b = px[x, y]
            lum = (r * .3 + g * .59 + b * .11) / 255
            yel = max(0.0, min(1.0, (min(r, g) - b - 40) / 80))
            dark = max(0.0, min(1.0, (.62 - lum) / .3))
            paper = max(0.0, 1 - yel - dark)
            alpha = 1 - paper
            if alpha <= .02: img.putpixel((x, y), (0, 0, 0, 0)); continue
            t = yel / (yel + dark)
            col = tuple(int(to_brand((r, g, b))[i] * t + INK[i] * (1 - t)) for i in range(3))
            img.putpixel((x, y), (*col, int(255 * min(1, alpha * 1.15))))
    img = img.crop(img.getbbox())
    img = img.resize((img.width * 2 // scale, img.height * 2 // scale), Image.LANCZOS)  # 2x for retina
    img.save(out / 'brand-rabbit.png', optimize=True)
    return img.size


print('scene-brand.jpg', scene(), '· brand-rabbit.png', logo_rabbit())
