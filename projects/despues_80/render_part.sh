#!/bin/bash
# usage: render_part.sh N page1.html[,page2.html...]   (each page split into 2 parallel chunks, 4 jobs max)
# writes out/parteN.mp4 (+ parteN_*.mp4 parts under 30 MB)
set -e
cd "$(dirname "$0")"
N=$1; IFS=',' read -ra P <<< "$2"
R=../../.claude/skills/health-video/flat/render.mjs
D=out/sec$N; rm -rf $D; mkdir -p $D
spans=$(node -e "
const vm=require('vm'),fs=require('fs');const c={};vm.runInNewContext(fs.readFileSync('cues.js','utf8')+';this.CUE=CUE',c);
const C=k=>c.CUE[k]-0.15, snap=t=>Math.round(t*30)/30;
const pages='${P[*]}'.split(' ');
const out=[];for(const p of pages){const s=fs.readFileSync(p,'utf8');
 const S=eval(s.match(/window.START=([^;]+);/)[1]), E=eval(s.match(/window.END=([^;]+);/)[1]);
 const a=snap(S),b=snap(E),m=snap((a+b)/2); out.push(p+' '+a+' '+m, p+' '+m+' '+b);}
console.log(out.join('\n'))")
echo "$spans"
i=0; list=$D/list.txt; : > $list
while read -r p a b; do f=$(printf "%s/%02d.mp4" $D $i); echo "file '$(basename $f)'" >> $list
  node $R $p $f --from $a --to $b > $f.log 2>&1 &
  i=$((i+1)); if (( i % 4 == 0 )); then wait; fi
done <<< "$spans"
wait
T0=$(echo "$spans" | head -1 | awk '{print $2}'); T1=$(echo "$spans" | tail -1 | awk '{print $3}')
ffmpeg -v error -y -f concat -safe 0 -i $list -ss $T0 -t $(echo "$T1 - $T0" | bc) -i audio/voice.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -shortest -movflags +faststart out/parte$N.mp4
rm -f out/parte${N}_*.mp4
ffmpeg -v error -y -i out/parte$N.mp4 -c copy -map 0 -f segment -segment_time 30 -reset_timestamps 1 -movflags +faststart out/parte${N}_%d.mp4
ls -la out/parte$N*
