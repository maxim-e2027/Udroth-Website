#!/usr/bin/env python3
"""
Generates web-sized copies of every image in assets/ (originals are never touched):

  assets/thumbs/<name>.webp   600 px wide   — cards in the Gallery list
  assets/display/<name>.webp  ≤2400 px      — the picture shown on an image's own page

The full-resolution original stays in assets/ and is linked from the image page.
Files are only regenerated when the original is newer. Needs Pillow (pip install Pillow).
Generated files are committed to git, so the hosting build does not need to run this.
"""
import os
import sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None  # the world map is ~190 megapixels

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")
SKIP = {"og-image"}  # social preview image, not a gallery item

def up_to_date(src, out):
    return os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src)

def main():
    os.makedirs(os.path.join(ROOT, "thumbs"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "display"), exist_ok=True)
    done = 0
    for fname in sorted(os.listdir(ROOT)):
        name, ext = os.path.splitext(fname)
        if ext.lower() not in (".jpg", ".jpeg", ".png") or name in SKIP:
            continue
        src = os.path.join(ROOT, fname)
        thumb = os.path.join(ROOT, "thumbs", name + ".webp")
        display = os.path.join(ROOT, "display", name + ".webp")
        if up_to_date(src, thumb) and up_to_date(src, display):
            continue
        im = Image.open(src)
        im.draft("RGB", (2400, 2400))  # fast JPEG decode at reduced size when possible
        im = im.convert("RGB")
        w, h = im.size
        if not up_to_date(src, display):
            s = min(1.0, 2400 / max(w, h))
            d = im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im
            d.save(display, "WEBP", quality=82, method=6)
            print(f"  display/{name}.webp  {d.size[0]}x{d.size[1]}  {os.path.getsize(display)//1024} KB")
        if not up_to_date(src, thumb):
            s = 600 / w
            t = im.resize((600, round(h * s)), Image.LANCZOS)
            t.save(thumb, "WEBP", quality=82, method=6)
            print(f"  thumbs/{name}.webp  {t.size[0]}x{t.size[1]}  {os.path.getsize(thumb)//1024} KB")
        done += 1
    print(f"gen-images: {done} image(s) processed.")

if __name__ == "__main__":
    sys.exit(main())
