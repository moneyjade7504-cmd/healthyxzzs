// Whiteboard explainer kit for ducha_60 (Claves de la Longevidad).
// Each section page: <script src=cues.js> <script src=common.js>, sets window.START / window.END, builds beats.
document.head.insertAdjacentHTML('beforeend', `<style>
@font-face{font-family:Kalam;font-weight:700;src:url(fonts/kalam-latin-700-normal.woff2) format('woff2');}
@font-face{font-family:Kalam;font-weight:700;src:url(fonts/kalam-latin-ext-700-normal.woff2) format('woff2');unicode-range:U+0100-024F;}
@font-face{font-family:Kalam;font-weight:400;src:url(fonts/kalam-latin-400-normal.woff2) format('woff2');}
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#fff;}
#stage{position:absolute;inset:0;overflow:hidden;
  background:#fdfdfb radial-gradient(circle at 1px 1px,#e9ecf2 1.2px,transparent 1.4px) 0 0/34px 34px;}
.layer{position:absolute;inset:0;opacity:0;}
.panel{position:absolute;border-radius:30px;overflow:hidden;background:#fff;box-shadow:0 18px 40px rgba(40,60,110,.18);border:6px solid #2f6fd6;}
.panel img,.panel canvas{position:absolute;left:0;top:0;width:100%;height:100%;}
.panel .cam{position:absolute;inset:0;}
.cut{position:absolute;transform-origin:50% 100%;}
.cut img{display:block;width:100%;}
.cap{position:absolute;font-family:Kalam;font-weight:700;color:#24263a;white-space:nowrap;transform:translate(-50%,-50%);line-height:1.08;text-align:center;}
.hl{position:relative;z-index:0;}
.hl::before{content:'';position:absolute;left:-10px;right:-10px;top:52%;height:44%;z-index:-1;background:#ffe14d;border-radius:10px 4px 12px 6px;transform:scaleX(var(--hl,0));transform-origin:0 50%;}
.red{color:#e23b2e}.blue{color:#2f6fd6}.green{color:#1f9d55}.grey{color:#6a6f86}
.pill{position:absolute;transform:translate(-50%,-50%);background:#fff;border:5px solid #2f6fd6;border-radius:26px;padding:10px 34px 14px;font-family:Kalam;font-weight:700;color:#24263a;white-space:nowrap;box-shadow:0 10px 24px rgba(40,60,110,.15);}
.card{position:absolute;background:#fff;border:5px solid #2f6fd6;border-radius:28px;box-shadow:0 14px 30px rgba(40,60,110,.15);}
.num{position:absolute;border-radius:50%;background:#2f6fd6;color:#fff;font-family:Kalam;font-weight:700;display:flex;align-items:center;justify-content:center;transform:translate(-50%,-50%);box-shadow:0 6px 0 #1d4fa3;}
.src{position:absolute;left:40px;bottom:22px;font-family:Kalam;font-weight:400;font-size:28px;color:#7a7f95;}
svg.ov{position:absolute;inset:0;width:1920px;height:1080px;overflow:visible;}
</style>`);
const S = document.createElement('div'); S.id = 'stage'; document.body.appendChild(S);
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const prog=(t,a,b)=>clamp((t-a)/(b-a));
const eo=x=>1-Math.pow(1-x,3);
const eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const back=x=>{const c=1.6;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
const mk=(tag,cls,parent,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;parent.appendChild(e);return e;};
const NS='http://www.w3.org/2000/svg';
const sv=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent.appendChild(e);return e;};
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const C=k=>{if(!(k in CUE))throw new Error('missing cue '+k);return CUE[k]-0.15;};   // beat lands 0.15 s before the word
const IMG={"antonio_walk":[307,466],"bandage":[320,348],"barrier":[354,390],"basin":[373,387],"bathtub":[488,360],"body":[243,466],"bubble_bath":[326,390],"calendar":[377,370],"cane":[207,425],"clean_clothes":[351,335],"cleanser":[240,405],"cream_jar":[341,327],"cream_jar_hold":[289,454],"cream_tube":[235,389],"cream_tube2":[274,367],"dry_circle":[316,330],"foot":[359,421],"gel":[285,429],"grab_bar":[150,429],"handshower":[274,412],"hat_gloves":[403,382],"lemon_vinegar":[346,394],"lotion":[233,386],"mat":[387,264],"notebook":[360,403],"phone":[297,411],"rough_towel":[309,358],"s_dawn":[808,439],"s_dry_leg":[819,457],"s_garden":[828,458],"s_mirror":[819,439],"s_nurse":[828,441],"s_shower":[808,457],"s_shower_soft":[816,441],"s_tea":[816,458],"sandtimer":[245,356],"scratch_shin":[374,462],"shower_chair":[335,432],"shower_head":[315,379],"skin_block":[331,320],"soap":[302,304],"soft_towel":[371,355],"sponge":[377,405],"stethoscope":[283,410],"sweaty_shirt":[383,364],"tap":[365,295],"tea":[325,380],"thermo":[169,426],"think":[249,464],"tight_arm":[306,468],"timer":[318,323],"vaseline":[343,355],"washcloth":[348,271],"wave":[340,455]};

// ---------- beats (layers) ----------
const beats=[];
function Beat(a,b,{enter='right',exit='left'}={}){const L=mk('div','layer',S);const B={L,a,b,enter,exit,fx:[]};beats.push(B);return B;}
function layerT(B,t){
  const {L,a,b}=B, ti=0.42, to=0.38;
  if(t<a-0.01||t>b+to){L.style.opacity=0;L.style.display='none';return false;}
  L.style.display='block'; let x=0,y=0,op=1,bl=0,sc=1;
  if(t<a+ti){const p=eo(prog(t,a,a+ti));
    if(B.enter==='zoom')sc=0.9+0.1*p; else if(B.enter==='up')y=(1-p)*300; else if(B.enter==='none'){} else x=(B.enter==='left'?-1:1)*(1-p)*520;
    op=p; bl=(1-p)*10;}
  if(t>b){const p=eio(prog(t,b,b+to)); x+=({left:-1,right:1,fade:0}[B.exit]||0)*p*520; op*=1-p; bl+=p*8;}
  L.style.opacity=op; L.style.transform=`translate(${x}px,${y}px) scale(${sc})`; L.style.filter=bl>0.3?`blur(${bl}px)`:'none';
  return true;
}
// framed scene panel: marker-sweep reveal, slow camera move, canvas overlay in panel pixels
function Panel(B,name,{x=960,y=520,w=1560,from=[.5,.5,1],to=[.5,.5,1.1],t0}={}){
  const [iw,ih]=IMG[name]; const h=w*ih/iw; t0=t0??B.a;
  const P=mk('div','panel',B.L); Object.assign(P.style,{left:x-w/2+'px',top:y-h/2+'px',width:w+'px',height:h+'px'});
  const cam=mk('div','cam',P); mk('img','',cam).src='cut/'+name+'.png';
  const cv=mk('canvas','',cam); cv.width=iw*2; cv.height=ih*2; const ctx=cv.getContext('2d'); ctx.scale(2,2);
  const o={P,ctx,iw,ih,draw:null};
  B.fx.push(t=>{const p=eio(prog(t,t0,B.b+0.4));
    cam.style.transformOrigin=`${(from[0]+(to[0]-from[0])*p)*100}% ${(from[1]+(to[1]-from[1])*p)*100}%`;
    cam.style.transform=`scale(${from[2]+(to[2]-from[2])*p})`;
    ctx.clearRect(0,0,iw,ih); if(o.draw)o.draw(ctx,t);
    const r=eo(prog(t,t0,t0+0.55)); P.style.opacity=t>=t0?1:0;
    P.style.clipPath=`polygon(0 0, ${r*180}% 0, ${r*180-60}% 100%, 0 100%)`;});
  return o;
}
// cut-out: pop with overshoot (or slide), then idle bob / sway; optional shake
function Cut(B,name,{cx,cy,h,t0,amp=5,period=3,tilt=1.5,phase=0,dir=null,shake=0,t1=1e9}){
  const [iw,ih]=IMG[name]; const w=h*iw/ih; t0=t0??B.a;
  const E=mk('div','cut',B.L); Object.assign(E.style,{left:cx-w/2+'px',top:cy-h+'px',width:w+'px',height:h+'px'}); mk('img','',E).src='cut/'+name+'.png';
  B.fx.push(t=>{const p=prog(t,t0,t0+0.5), q=prog(t,t1,t1+0.3); let s=p<=0?0:back(p), dx=0;
    if(dir){dx=(1-eo(p))*(dir==='l'?-700:700); s=p<=0?0:1;}
    const k=(t-t0)/period*2*Math.PI+phase, bob=Math.sin(k)*amp, rot=Math.sin(k*0.5)*tilt;
    const sh=shake?Math.sin(t*38)*shake*Math.max(0,Math.sin((t-t0)*2.2)):0;
    E.style.opacity=(p>0?Math.min(1,p*3):0)*(1-q);
    E.style.transform=`translate(${dx+sh}px,${bob}px) rotate(${rot}deg) scale(${s*(1-q*0.3)},${s*(1-q*0.3)*(1+0.012*Math.sin(k*2))})`;});
  return E;
}
// handwritten caption, written left→right, then the .hl word gets a highlighter stroke
function Cap(B,html,{cx,cy,size=84,t0,pill=false,color,t1=1e9}){
  t0=t0??B.a; const E=mk('div',pill?'pill':'cap',B.L,html); E.style.left=cx+'px'; E.style.top=cy+'px'; E.style.fontSize=size+'px'; if(color)E.style.color=color;
  const hls=[...E.querySelectorAll('.hl')];
  B.fx.push(t=>{const p=prog(t,t0,t0+0.6), q=prog(t,t1,t1+0.3);
    E.style.opacity=(p>0?1:0)*(1-q); E.style.clipPath=`inset(-30% ${(1-eo(p))*100}% -30% -5%)`;
    E.style.transform=`translate(-50%,-50%) rotate(${-1.2+Math.sin(t*1.3)*0.4}deg)`;
    hls.forEach(h=>h.style.setProperty('--hl',eo(prog(t,t0+0.55,t0+0.9))));});
  return E;
}
function Svg(B){return sv('svg',{class:'ov',viewBox:'0 0 1920 1080'},B.L);}
function Draw(B,svg,d,{t0,dur=0.5,stroke='#e23b2e',w=9,fill='none'}){
  const p=sv('path',{d,fill,stroke,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round'},svg);
  const len=p.getTotalLength()||1; p.style.strokeDasharray=len;
  B.fx.push(t=>{p.style.strokeDashoffset=len*(1-eo(prog(t,t0,t0+dur))); p.style.opacity=t>=t0?1:0;});
  return p;
}
const scribble=(cx,cy,rx,ry,turns=1.15)=>{let d='';for(let i=0;i<=60;i++){const a=-1.9+i/60*turns*2*Math.PI,k=1+0.05*Math.sin(i*0.7);d+=(i?'L':'M')+(cx+Math.cos(a)*rx*k).toFixed(1)+' '+(cy+Math.sin(a)*ry*k).toFixed(1);}return d;};
const tick=(x,y,s=1)=>`M${x-28*s} ${y} l${22*s} ${24*s} l${42*s} ${-50*s}`;
const cross=(x,y,s=1)=>`M${x-30*s} ${y-30*s} L${x+30*s} ${y+30*s} M${x+30*s} ${y-30*s} L${x-30*s} ${y+30*s}`;
const arrow=(x0,y0,x1,y1,bend=0)=>{const mx=(x0+x1)/2-(y1-y0)*bend, my=(y0+y1)/2+(x1-x0)*bend; const a=Math.atan2(y1-my,x1-mx);
  return `M${x0} ${y0} Q${mx} ${my} ${x1} ${y1} M${x1-30*Math.cos(a-0.5)} ${y1-30*Math.sin(a-0.5)} L${x1} ${y1} L${x1-30*Math.cos(a+0.5)} ${y1-30*Math.sin(a+0.5)}`;};
// pop-in element (card, number circle, pill)
function Pop(B,E,{t0,t1=1e9,rot=0}){B.fx.push(t=>{const p=prog(t,t0,t0+0.45),q=prog(t,t1,t1+0.3);const s=p<=0?0:back(p)*(1-q*0.3);
  E.style.opacity=(p>0?Math.min(1,p*3):0)*(1-q); E.style.transform=`translate(-50%,-50%) scale(${s}) rotate(${rot}deg)`;});return E;}
function Num(B,n,{cx,cy,r=60,t0,t1}){const E=mk('div','num',B.L,String(n));Object.assign(E.style,{left:cx+'px',top:cy+'px',width:2*r+'px',height:2*r+'px',fontSize:r*1.25+'px'});return Pop(B,E,{t0,t1});}
function Card(B,{cx,cy,w,h,t0,t1,border='#2f6fd6',bg='#fff'}){const E=mk('div','card',B.L);Object.assign(E.style,{left:cx+'px',top:cy+'px',width:w+'px',height:h+'px',borderColor:border,background:bg,marginLeft:-w/2+'px',marginTop:-h/2+'px'});
  B.fx.push(t=>{const p=prog(t,t0,t0+0.45),q=prog(t,t1??1e9,(t1??1e9)+0.3);E.style.opacity=(p>0?Math.min(1,p*3):0)*(1-q);E.style.transform=`scale(${p<=0?0:back(p)})`;});return E;}
function Src(B,txt){mk('div','src',B.L,txt);}
function Canvas(B,fn){const cv=mk('canvas','',B.L);cv.width=1920;cv.height=1080;Object.assign(cv.style,{position:'absolute',left:0,top:0});const c=cv.getContext('2d');B.fx.push(t=>{c.clearRect(0,0,1920,1080);fn(c,t);});return cv;}

// ---------- painters ----------
function water(ctx,t,{x0,y0,x1,y1,spread=120,n=26,col='rgba(70,150,235,0.85)',lw=2.6}){
  for(let i=0;i<n;i++){const ph=(t*1.6+rnd(i))%1, off=(rnd(i+50)-0.5)*spread, sx=x0+off*0.25, ex=x1+off;
    const x=sx+(ex-sx)*ph, y=y0+(y1-y0)*ph; ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.globalAlpha=Math.sin(ph*Math.PI);
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+(ex-sx)*0.06,y+(y1-y0)*0.06); ctx.stroke();}
  ctx.globalAlpha=1;
}
function steam(ctx,t,{x,y,w=200,n=7,r=26,rise=150}){
  for(let i=0;i<n;i++){const ph=(t*0.22+rnd(i+9))%1, px=x+(rnd(i+3)-0.5)*w+Math.sin(t*0.9+i)*14, py=y-ph*rise;
    ctx.globalAlpha=0.55*Math.sin(ph*Math.PI); ctx.fillStyle='#fff'; ctx.strokeStyle='rgba(160,195,230,.55)'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.arc(px,py,r*(0.7+ph*0.8),0,Math.PI*2); ctx.fill(); ctx.stroke();}
  ctx.globalAlpha=1;
}
function sparks(ctx,t,{x,y,s=1}){
  const k=0.6+0.4*Math.sin(t*9); ctx.strokeStyle='#e62a2a'; ctx.lineWidth=4*s; ctx.lineJoin='round';
  [[0,0],[14,26],[-6,48]].forEach(([dx,dy],i)=>{const o=Math.sin(t*9+i)*4; ctx.globalAlpha=k; dx*=s; dy*=s;
    ctx.beginPath(); ctx.moveTo(x+dx+o,y+dy); ctx.lineTo(x+dx+12*s+o,y+dy+6*s); ctx.lineTo(x+dx+4*s+o,y+dy+10*s); ctx.lineTo(x+dx+18*s+o,y+dy+16*s); ctx.stroke();});
  ctx.globalAlpha=1;
}
function rays(ctx,t,{x,y,r0=34,r1=58,col='rgba(255,200,40,.9)',lw=3}){
  ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.lineCap='round';
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2+t*0.25, pl=4*Math.sin(t*3+i);
    ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0); ctx.lineTo(x+Math.cos(a)*(r1+pl),y+Math.sin(a)*(r1+pl)); ctx.stroke();}
}
function drop(ctx,px,py,s=1,fill='#5aaee8',stroke='#2c6db8'){ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=1.5*s;
  ctx.beginPath();ctx.moveTo(px,py-26*s);ctx.quadraticCurveTo(px+19*s,py,px,py+15*s);ctx.quadraticCurveTo(px-19*s,py,px,py-26*s);ctx.fill();ctx.stroke();}
function drops(ctx,t,{x,y,w,h,n=8,t0,s=1,speed=0.45,fill,stroke}){
  if(t<t0)return; for(let i=0;i<n;i++){const ph=((t-t0)*speed+rnd(i+20))%1, px=x+rnd(i)*w+Math.sin(t*2+i)*6, py=y+h-ph*h*1.5;
    ctx.globalAlpha=Math.sin(ph*Math.PI)*0.95; drop(ctx,px,py,s,fill,stroke);} ctx.globalAlpha=1;
}
function foam(ctx,t,{x,y,w,h,n=40,t0,grow=0.8}){
  for(let i=0;i<n;i++){const p=prog(t,t0+rnd(i)*grow,t0+rnd(i)*grow+0.3); if(p<=0)continue;
    const px=x+rnd(i+7)*w, py=y+rnd(i+13)*h+Math.sin(t*1.5+i)*3, r=(8+rnd(i+5)*22)*back(p);
    ctx.globalAlpha=0.92; ctx.fillStyle='#fff'; ctx.strokeStyle='#9cc3ea'; ctx.lineWidth=2.2;
    ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle='#c9e1f7'; ctx.arc(px-r*0.3,py-r*0.3,r*0.35,3.4,4.6); ctx.stroke();}
  ctx.globalAlpha=1;
}
// simple hand-drawn icons (SVG) ----------
function clockIcon(B,svg,{cx,cy,r=60,t0}){Draw(B,svg,scribble(cx,cy,r,r,1.02),{t0,dur:0.45,stroke:'#3a3c52',w:7});
  const hand=sv('path',{d:'',stroke:'#e23b2e','stroke-width':7,'stroke-linecap':'round',fill:'none'},svg);
  B.fx.push(t=>{const a=(t-t0)*2.2; hand.style.opacity=t>=t0+0.3?1:0; hand.setAttribute('d',`M${cx} ${cy} L${cx} ${cy-r*0.55} M${cx} ${cy} L${cx+Math.sin(a)*r*0.75} ${cy-Math.cos(a)*r*0.75}`);});}
function bellIcon(B,svg,{cx,cy,s=1,t0}){const d=`M${cx-40*s} ${cy+30*s} Q${cx-40*s} ${cy-45*s} ${cx} ${cy-50*s} Q${cx+40*s} ${cy-45*s} ${cx+40*s} ${cy+30*s} L${cx+52*s} ${cy+42*s} L${cx-52*s} ${cy+42*s} Z M${cx-12*s} ${cy+50*s} Q${cx} ${cy+66*s} ${cx+12*s} ${cy+50*s}`;
  const p=Draw(B,svg,d,{t0,dur:0.5,stroke:'#3a3c52',w:7}); p.setAttribute('fill','#ffe14d');
  B.fx.push(t=>{p.style.transformOrigin=`${cx}px ${cy-50*s}px`; p.style.transform=`rotate(${t>t0+0.5?Math.sin((t-t0)*14)*14*Math.max(0,1-((t-t0-0.5)%2.2)):0}deg)`;});}

// ---------- frame ----------
window.draw=function(t){for(const B of beats){if(!layerT(B,t))continue;for(const f of B.fx)f(t);}};
