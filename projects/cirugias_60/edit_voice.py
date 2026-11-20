#!/usr/bin/env python3
"""Cut doctor-claim / wrong-number phrases out of the voice; snap cuts to quiet points; shift transcript."""
import json, subprocess, numpy as np
CUTS = [(48.42,50.26,'I have seen over and over (xưng bác sĩ)'),
 (75.60,77.26,'My name is Dr. Elias (xưng bác sĩ)'),
 (233.88,238.96,'trừ rủi ro mổ khỏi lợi ích (sai phép tính)'),
 (275.38,287.40,'trừ rủi ro mổ (sai phép tính)'),
 (419.72,427.73,'it fails · ASRA (không xác minh)'),
 (846.10,852.88,'Every day I break down'),
 (979.80,995.72,'2,1 lần (không xác minh)'),
 (1337.82,1339.24,'dưới 5 cm (mâu thuẫn ngưỡng)'),
 (1505.72,1507.60,'about a patient'),
 (1519.28,1520.12,'came to me'),
 (1538.68,1540.42,'sat across from me'),
 (1544.98,1561.90,'we went through them / 45 minutes'),
 (1563.06,1564.05,'we concluded'),
 (1568.70,1575.85,'we adjusted'),
 (1578.12,1580.26,'sends me notes'),
 (1580.86,1581.74,'wrote to tell me'),
 (1585.96,1589.08,"I've thought about")]
SR = 48000
pcm = subprocess.run(['ffmpeg','-v','error','-i','audio/voice_orig.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
x = np.frombuffer(pcm, np.float32); hop = SR//100
rms = np.sqrt(np.convolve(x**2, np.ones(hop)/hop, 'same')[::hop])
def snap(t, w=0.1):
    a, b = int((t-w)*100), int((t+w)*100); i = a+int(np.argmin(rms[a:b])); return i/100
FIX={'we adjusted','dưới 5 cm (mâu thuẫn ngưỡng)','wrote to tell me','it fails · ASRA (không xác minh)','My name is Dr. Elias (xưng bác sĩ)','Every day I break down','came to me','we concluded','sends me notes'}
cuts = sorted(((a,b,n) if n in FIX else (snap(a),snap(b),n)) for a,b,n in CUTS)
keep, t = [], 0.0
for a,b,_ in cuts: keep.append((t,a)); t = b
keep.append((t, len(x)/SR))
keep=[(a,b) for a,b in keep if b-a>0.1]
fs = ''.join(f'[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b-a-0.02}:d=0.02[s{i}];' for i,(a,b) in enumerate(keep))
fs += ''.join(f'[s{i}]' for i in range(len(keep))) + f'concat=n={len(keep)}:v=0:a=1[o]'
subprocess.run(['ffmpeg','-v','error','-y','-i','audio/voice_orig.mp3','-filter_complex',fs,'-map','[o]','-b:a','192k','audio/voice.mp3'],check=True)
def shift(s):
    off = 0
    for a,b,_ in cuts:
        if s >= b: off += b-a
        elif s > a: return None
    return round(s-off, 3)
W = json.load(open('transcript/words_orig.json'))
K=[];last=-1
for w in W:
    if w['s']<last-0.3: continue
    K.append(w); last=w['s']
W=K
# drop whisper chunk-overlap duplicate ("Con base en lo que Paso 3. Revise su plato de las 6 pm.")
out = []
for w in W:
    s, e = shift(w['s']), shift(w['e'])
    if s is None or e is None: continue
    out.append({**w, 'i': len(out), 's': s, 'e': e})
json.dump(out, open('transcript/words.json','w'), ensure_ascii=False)
with open('audio/EDIT.txt','w') as f:
    f.write('voice.mp3 = voice_orig.mp3 minus (orig seconds):\n')
    for a,b,n in cuts: f.write(f'{a:8.2f}-{b:8.2f}  {n}\n')
print('removed', round(sum(b-a for a,b,_ in cuts),2),'s; words',len(out))
