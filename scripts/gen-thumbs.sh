#!/bin/sh
# Generates web-sized copies of the images in assets/:
#   assets/thumbs/   600px WebP for the Gallery list
#   assets/display/  ≤2400px WebP shown on each image page (original stays linked)
# Generated files are committed to the repo. If Python + Pillow is missing
# (e.g. on the hosting build runner), keep the committed ones and carry on.

DIR="$(dirname "$0")"

if command -v python3 >/dev/null 2>&1 && python3 -c "import PIL" >/dev/null 2>&1; then
  python3 "$DIR/gen-images.py"
else
  echo "gen-thumbs: Python/Pillow not found - using committed thumbnails and display images as-is."
fi
exit 0
