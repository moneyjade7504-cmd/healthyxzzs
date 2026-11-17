#!/usr/bin/env python3
"""Cut doctor-claim / wrong-number phrases out of the voice; snap cuts to quiet points; shift transcript."""
import json, subprocess, numpy as np
CUTS = [(22.12,24.50,'que veo, y he visto miles'),(27.85,29.92,'En los próximos 18 minutos'),(45.25,49.80,'confesión… médicos no hará'),
        (75.55,113.05,'77%/93% (cifras mal atribuidas)'),(125.20,128.50,'Si usted está en ese 77%'),(149.00,151.65,'Ni siquiera los especialistas lo dicen'),
        (280.58,281.40,'que vino a verme'),(296.30,299.00,'y esto lo escucho constantemente'),(549.04,553.25,'los próximos 7 signos…'),
        (680.28,683.37,'aproximadamente 108 mg/dL (falso)'),(1212.45,1221.85,'las señales que estamos por cubrir…'),(1362.30,1363.35,'de mis pacientes')]
SR = 48000
pcm = subprocess.run(['ffmpeg','-v','error','-i','audio/voice_orig.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
x = np.frombuffer(pcm, np.float32); hop = SR//100
rms = np.sqrt(np.convolve(x**2, np.ones(hop)/hop, 'same')[::hop])
def snap(t, w=0.15):
    a, b = int((t-w)*100), int((t+w)*100); i = a+int(np.argmin(rms[a:b])); return i/100
FIX={'En los próximos 18 minutos','de mis pacientes'} | {n for n in [c[2] for c in CUTS] if '108' in n}
cuts = sorted(((a,b,n) if n in FIX else (snap(a),snap(b),n)) for a,b,n in CUTS)
keep, t = [], 0.0
for a,b,_ in cuts: keep.append((t,a)); t = b
keep.append((t, len(x)/SR))
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
# drop whisper chunk-overlap duplicate ("Con base en lo que Paso 3. Revise su plato de las 6 pm.")
W = [w for w in W if not (2696 <= w['i'] <= 2709)]
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
