#!/bin/bash
# Turn clips/<scene>.mp4 (AI image-to-video, user-made) into frame folders + clips.js for the scenes.
# Frames: 24 fps, 1280 px wide JPEG. Audio of the clip is ignored (narration is added once).
set -e; cd "$(dirname "$0")"
echo "const CLIPS={" > clips.js
for f in clips/*.mp4; do [ -e "$f" ] || continue
  n=$(basename "$f" .mp4); d=clips/$n; rm -rf "$d"; mkdir -p "$d"
  ffmpeg -v error -y -i "$f" -vf "fps=24,scale=1280:-2" -q:v 3 "$d/%03d.jpg"
  c=$(ls "$d" | wc -l); echo " \"$n\":$c," >> clips.js; echo "$n: $c frames"
done
echo "};" >> clips.js
