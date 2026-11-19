#!/usr/bin/env python3
"""Cut doctor-claim / wrong-number phrases out of the voice; snap cuts to quiet points; shift transcript."""
import json, subprocess, numpy as np
CUTS = [(33.50,35.85,'en los próximos 18 minutos'),(42.95,46.40,'los que vienen a verme'),(184.33,191.00,'función inmunitaria (sin fuente)'),
 (199.00,206.62,'desde 1,46 veces… hasta (cifra sin fuente)'),(210.50,227.95,'He visto a pacientes… cayeron con fuerza'),(258.10,263.52,'permítame presentarme · Soy urólogo'),
 (374.70,387.20,'25 % (sin fuente)'),(432.35,436.80,'en mi consultorio'),(524.35,536.20,'300 ml (cifra variable)'),(558.75,571.80,'150–200 ml (cifras variables)'),
 (656.10,656.95,'8 onzas'),(670.45,702.15,'Tuve un paciente llamado Gerald…'),(911.15,919.20,'hasta por 4 horas'),(932.55,937.50,'muchos de mis pacientes'),
 (998.20,1020.40,'estudio no verificado · rivalizan con medicamentos'),(1146.55,1179.05,'mis pacientes · Patricia'),(1226.70,1239.45,'reducir de una a dos veces (sin datos)'),
 (1578.60,1585.40,'la evidencia más clara (exagerado)'),(1621.15,1632.35,'He estado con pacientes'),(1660.98,1668.55,'lo que veo en la práctica'),(1720.05,1724.55,'Sorprendió a mis pacientes')]
SR = 48000
pcm = subprocess.run(['ffmpeg','-v','error','-i','audio/voice_orig.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
x = np.frombuffer(pcm, np.float32); hop = SR//100
rms = np.sqrt(np.convolve(x**2, np.ones(hop)/hop, 'same')[::hop])
def snap(t, w=0.15):
    a, b = int((t-w)*100), int((t+w)*100); i = a+int(np.argmin(rms[a:b])); return i/100
FIX={'8 onzas','en los próximos 18 minutos','desde 1,46 veces… hasta (cifra sin fuente)','150–200 ml (cifras variables)'}
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
