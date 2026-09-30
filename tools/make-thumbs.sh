#!/bin/sh
# Small copies of the animal photos for the Field Guide grid, so a full guide stays light.
# Run after adding or changing a photo, then `node tools/cache-files.mjs`. Needs cwebp.
set -e
cd "$(dirname "$0")/../art/animals"
mkdir -p thumbs
for photo in *.webp; do
  cwebp -quiet -q 75 -resize 400 0 "$photo" -o "thumbs/$photo"
done
echo "Made $(ls thumbs | wc -l | tr -d ' ') thumbnails"
