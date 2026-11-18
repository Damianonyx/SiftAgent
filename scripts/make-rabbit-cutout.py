#!/usr/bin/env python3
"""Regenerate dist/app/rabbit.png from the approved artwork. Requires Pillow.
Usage: python3 scripts/make-rabbit-cutout.py dist/app/reference-art.jpg dist/app/rabbit.png"""
# Cut the approved rabbit out of its scene: keep only the rabbit's own pixels
# (largest connected yellow region plus its soft edge), everything else transparent.
import sys
from PIL import Image, ImageFilter
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
box = (712, 182, 848, 342)
crop = im.crop(box); W, H = crop.size; px = crop.load()
def yel(p):
    r, g, b = p; return max(0.0, min(1.0, (min(r, g) - b - 55) / 70))
soft = [[yel(px[x, y]) for x in range(W)] for y in range(H)]
hard = [[soft[y][x] >= .5 for x in range(W)] for y in range(H)]
seen = [[False]*W for _ in range(H)]; best = []
for y in range(H):
    for x in range(W):
        if hard[y][x] and not seen[y][x]:
            st = [(x, y)]; seen[y][x] = True; comp = []
            while st:
                a, b = st.pop(); comp.append((a, b))
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    u, v = a+dx, b+dy
                    if 0 <= u < W and 0 <= v < H and hard[v][u] and not seen[v][u]:
                        seen[v][u] = True; st.append((u, v))
            if len(comp) > len(best): best = comp
print('rabbit pixels', len(best), file=sys.stderr)
keep = Image.new('L', (W, H), 0)
for a, b in best: keep.putpixel((a, b), 255)
# include the rabbit's own anti-aliased edge (2px), not neighbouring particles
keep = keep.filter(ImageFilter.MaxFilter(5))
rgba = Image.new('RGBA', (W, H))
for y in range(H):
    for x in range(W):
        r, g, b = px[x, y]
        a = int(255 * soft[y][x]) if keep.getpixel((x, y)) else 0
        rgba.putpixel((x, y), (r, g, b, a))
bb = rgba.getbbox(); rgba = rgba.crop(bb)
rgba.save(out, optimize=True)
print('size', rgba.size, 'from', (box[0]+bb[0], box[1]+bb[1]), file=sys.stderr)
