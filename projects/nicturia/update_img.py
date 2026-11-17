#!/usr/bin/env python3
import json,re,pathlib
from PIL import Image
D=pathlib.Path(__file__).parent
m={p.stem:list(Image.open(p).size) for p in sorted((D/'cut').glob('*.png'))}
s=(D/'common.js').read_text()
s=re.sub(r'const IMG=\{.*?\};', 'const IMG='+json.dumps(m,separators=(',',':'))+';', s, count=1, flags=re.S)
(D/'common.js').write_text(s); print(len(m),'images')
