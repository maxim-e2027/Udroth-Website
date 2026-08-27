#!/bin/sh
# Generates WebP thumbnails (600px wide) for all images in assets/
# Output goes to assets/thumbs/ — copied to public/assets/thumbs/ by sync-assets

set -e

ASSETS_DIR="$(dirname "$0")/../assets"
THUMBS_DIR="$ASSETS_DIR/thumbs"

# Thumbnails are committed to the repo. If ImageMagick is missing (e.g. on a
# hosting build runner), keep the committed ones and carry on instead of failing.
if ! command -v convert >/dev/null 2>&1; then
  echo "gen-thumbs: ImageMagick not found - using committed thumbnails as-is."
  exit 0
fi

mkdir -p "$THUMBS_DIR"

count=0
for f in "$ASSETS_DIR"/*.jpg "$ASSETS_DIR"/*.png; do
  [ -f "$f" ] || continue
  base=$(basename "$f")
  name="${base%.*}"
  out="$THUMBS_DIR/$name.webp"

  # Skip if thumb is newer than source
  if [ -f "$out" ] && [ "$out" -nt "$f" ]; then
    continue
  fi

  convert "$f" -resize 600x -quality 82 "$out"
  echo "  ✓ thumbs/$name.webp"
  count=$((count + 1))
done

echo "gen-thumbs: $count image(s) processed."
