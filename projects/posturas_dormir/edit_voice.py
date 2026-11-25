#!/usr/bin/env python3
"""Cut doctor-claim / wrong-number phrases out of the voice; snap cuts to quiet points; shift transcript."""
import json, subprocess, numpy as np
CUTS = [(86.90,95.30,'cada uno aumenta el riesgo de derrame (exagerado)'),
 (210.10,218.10,'el corazón trabaja más para compensar (sin fuente)'),
 (239.30,257.78,'horas de esfuerzo extra para el sistema circulatorio (sin fuente)'),
 (344.80,372.38,'menos oxígeno · agresión real cada noche (sin fuente)'),
 (438.25,442.58,'aumenta muchísimo el riesgo de derrame (exagerado)'),
 (452.00,459.74,'medio litro a un litro por noche (exagerado)'),
 (680.80,683.15,'el cuerpo reacciona a esa bajada (mecanismo erróneo)'),
 (740.50,757.70,'pastilla nocturna causa el pico · cuña cura el dolor (sin base)'),
 (1204.40,1206.95,'suaviza el pico de tensión (sin fuente)')]
SR = 48000
pcm = subprocess.run(['ffmpeg','-v','error','-i','audio/voice_orig.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
x = np.frombuffer(pcm, np.float32); hop = SR//100
rms = np.sqrt(np.convolve(x**2, np.ones(hop)/hop, 'same')[::hop])
def snap(t, w=0.1):
    a, b = int((t-w)*100), int((t+w)*100); i = a+int(np.argmin(rms[a:b])); return i/100
FIX={'aumenta muchísimo el riesgo de derrame (exagerado)','el cuerpo reacciona a esa bajada (mecanismo erróneo)','suaviza el pico de tensión (sin fuente)'}
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
