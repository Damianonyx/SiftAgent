#!/usr/bin/env python3
"""Cut Sift's rabbits out of the approved artwork, in the brand yellow.

    python3 scripts/make-rabbit-cutout.py dist/app/reference-art.jpg dist/app

Writes:
  rabbit.png        the agent-card rabbit: its own pixels only (no city, moon,
                    rings or particles), hue-shifted to brand yellow #fddf04
                    with the artwork's brightness and LED texture kept.
  brand-rabbit.png  the small logo rabbit on a transparent background, yellow
                    remapped to #fddf04 and its dark outline kept.
The shapes come straight from the artwork; nothing is redrawn. Requires Pillow.
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter

BRAND = (0xFD, 0xDF, 0x04)
INK = (0x12, 0x12, 0x10)
src, out = Image.open(sys.argv[1]).convert('RGB'), Path(sys.argv[2])


def to_brand(p, ref=.86):
    # Keep the pixel's brightness, swap the artwork's lemon hue for #fddf04.
    r, g, b = p
    k = (r * .3 + g * .59 + b * .11) / 255 / ref
    if k <= 1: return tuple(int(c * k) for c in BRAND)
    lift = min(1, (k - 1) * 2)
    return tuple(int(c + (255 - c) * lift * .5) for c in BRAND)


def yellowness(p):
    r, g, b = p
    return max(0.0, min(1.0, (min(r, g) - b - 55) / 70))


def agent_rabbit():
    crop = src.crop((712, 182, 848, 342)); w, h = crop.size; px = crop.load()
    soft = [[yellowness(px[x, y]) for x in range(w)] for y in range(h)]
    hard = [[v >= .5 for v in row] for row in soft]
    # The rabbit is the largest connected yellow region; particles are separate.
    seen = [[False] * w for _ in range(h)]; best = []
    for y in range(h):
        for x in range(w):
            if hard[y][x] and not seen[y][x]:
                stack, comp = [(x, y)], []; seen[y][x] = True
                while stack:
                    a, b = stack.pop(); comp.append((a, b))
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        u, v = a + dx, b + dy
                        if 0 <= u < w and 0 <= v < h and hard[v][u] and not seen[v][u]:
                            seen[v][u] = True; stack.append((u, v))
                if len(comp) > len(best): best = comp
    keep = Image.new('L', (w, h), 0)
    for a, b in best: keep.putpixel((a, b), 255)
    keep = keep.filter(ImageFilter.MaxFilter(5))  # the rabbit's own soft edge
    img = Image.new('RGBA', (w, h))
    for y in range(h):
        for x in range(w):
            a = soft[y][x] if keep.getpixel((x, y)) else 0
            img.putpixel((x, y), (*to_brand(px[x, y]), int(255 * a)))
    img = img.crop(img.getbbox()); img.save(out / 'rabbit.png', optimize=True)
    return img.size


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
            col = tuple(int(to_brand((r, g, b), .88)[i] * t + INK[i] * (1 - t)) for i in range(3))
            img.putpixel((x, y), (*col, int(255 * min(1, alpha * 1.15))))
    img = img.crop(img.getbbox())
    img = img.resize((img.width * 2 // scale, img.height * 2 // scale), Image.LANCZOS)  # 2x for retina
    img.save(out / 'brand-rabbit.png', optimize=True)
    return img.size


print('rabbit.png', agent_rabbit(), '· brand-rabbit.png', logo_rabbit())
