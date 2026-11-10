// "8 señales" — brain-mascot style engine (white background, thick ink lines, pink brain, yellow accents).
// Needs lib.js (el, set, prog, clamp, lerp, E), kit.js (Icon) and cues.js (CUE).
// A section page: build scenes with Scene(a, b) + Item(...), then call Run(START, END).
const K = {
  bg: '#FFFFFF', ink: '#1D1D1F', pink: '#F4A3AE', pinkD: '#D9606F', yellow: '#FFC629', yellowL: '#FFF3C4',
  blue: '#A9C3EA', blueD: '#3E6FC4', blueL: '#EAF1FB', green: '#43B05C', greenL: '#E3F5E6',
  red: '#E5484D', redL: '#FDE6E7', grey: '#9AA0A6', greyL: '#F1F2F4',
};
const SZ = {
  // poses (cut from sheets 1 and 3)
  think: [269, 453], worry: [278, 431], armchair_tea: [337, 444], mirror: [434, 440], shrug: [329, 432], present: [334, 430],
  magnifier: [396, 406], replay: [339, 447], stressed: [347, 468], cover_ears: [405, 424], shield_light: [429, 443], remote: [381, 430],
  // panels (sheets 2 and 4)
  s_bed: [815, 450], s_dinner: [816, 450], s_armchair: [816, 450], s_walkaway: [816, 450],
  s_bench: [825, 470], s_restaurant: [824, 470], s_ask: [825, 448], s_tv: [824, 448],
  // items (sheet 5)
  brain: [398, 294], ear: [285, 294], eye: [414, 249], clock: [362, 304], remote_icon: [349, 311], lamp: [366, 311],
  bubble: [403, 283], funnel: [361, 272], battery: [426, 252],
  // original character sheet
  m_wave: [252, 473], m_point: [252, 417], m_listen: [256, 413], m_magnifier: [280, 408], m_puzzle: [232, 412], m_cheer: [270, 470], m_walk_thumb: [252, 413],
};
const SRC = n => n.startsWith('m_') ? `../../characters/brain_mascot/${n.slice(2)}.png` : `cut/${n}.png`;
const LEAD = 0.2;   // beats land 0.2 s before their word

// time: number, 'cue', 'cue+0.8' or 'cue-1'
function T(k) {
  if (typeof k === 'number') return k;
  const m = /^(\w+)([+-][\d.]+)?$/.exec(k);
  if (!m || !(m[1] in CUE)) throw new Error('missing cue ' + k);
  return CUE[m[1]] - LEAD + (m[2] ? Number(m[2]) : 0);
}

const svg = document.getElementById('s');
el('rect', { width: 1920, height: 1080, fill: K.bg }, svg);
const ROOT = el('g', {}, svg);
const SCENES = [], OVER = [];

function Scene(a, b, { cut = false } = {}) {
  const g = el('g', {}, ROOT);
  const sc = { g, a: T(a), b: T(b), cut, items: [], punches: [] };
  SCENES.push(sc);
  return sc;
}
const punchAt = (sc, ...ts) => sc.punches.push(...ts.map(T));

// One animated element. build(g) draws it centred on (0, 0) and may return {draw(t, t0)}.
function Item(sc, build, o = {}) {
  const { x = 960, y = 540, t = sc.a, out = null, enter = 'pop', bob = 0, s = 1, zoom = 0, rot = 0, dur = 0.45 } = o;
  const w = el('g', {}, sc.g), inner = el('g', {}, w);
  const api = build(inner) || {};
  const t0 = typeof t === 'number' && t === sc.a ? t : T(t), t1 = out == null ? 1e9 : T(out);
  const ph = (x * 7 + y * 3) % 10;
  sc.items.push(tt => {
    if (tt < t0 - 0.001 || tt > t1 + 0.3) { w.style.display = 'none'; return; }
    w.style.display = '';
    const u = prog(tt, t0, t0 + dur);
    let dx = 0, dy = 0, k = 1, op = 1;
    if (enter === 'pop') { k = E.back(u); op = clamp(u * 3); }
    else if (enter === 'slam') { k = u < 1 ? lerp(1.8, 1, E.out(u)) : 1; op = clamp(u * 3); }
    else if ('lrud'.includes(enter) && enter.length === 1) {
      const d = (1 - E.back(u)) * 700;
      [dx, dy] = { l: [-d, 0], r: [d, 0], u: [0, -d], d: [0, d] }[enter];
      op = clamp(u * 4);
    } else if (enter === 'fade') op = E.inOut(u);
    op *= 1 - E.inOut(prog(tt, t1, t1 + 0.3));
    const by = bob ? bob * Math.sin((tt / 3.2 + ph) * 2 * Math.PI) : 0;
    const r = bob ? 0.9 * Math.sin((tt / 4.1 + ph) * 2 * Math.PI) : 0;
    const z = 1 + zoom * E.inOut(prog(tt, sc.a, sc.b));
    w.setAttribute('transform', `translate(${(x + dx).toFixed(1)} ${(y + dy + by).toFixed(1)}) rotate(${(rot + r).toFixed(2)}) scale(${(s * Math.max(0, k) * z).toFixed(4)})`);
    w.setAttribute('opacity', clamp(op).toFixed(3));
    if (api.draw) api.draw(tt, t0);
  });
  return api;
}

// ---------------------------------------------------------------- builders (centred on 0,0)
const Img = (n, h) => g => { const [iw, ih] = SZ[n], w = iw * h / ih; el('image', { href: SRC(n), x: -w / 2, y: -h / 2, width: w, height: h }, g); };
const ImgW = (n, w) => g => { const [iw, ih] = SZ[n], h = ih * w / iw; el('image', { href: SRC(n), x: -w / 2, y: -h / 2, width: w, height: h }, g); };
// panel: framed drawing with a soft blue offset shadow (the drawing already has its own ink border)
const Panel = (n, w) => g => {
  const [iw, ih] = SZ[n], h = ih * w / iw;
  el('rect', { x: -w / 2 + 14, y: -h / 2 + 16, width: w - 4, height: h - 4, rx: 34, fill: K.blue, opacity: 0.55 }, g);
  el('image', { href: SRC(n), x: -w / 2, y: -h / 2, width: w, height: h }, g);
};
const tw = (s, size) => s.length * size * 0.66;   // rough width of Inter Black caps
function Txt(str, { size = 80, color = K.ink, weight = 900, anchor = 'middle' } = {}) {
  return g => { str.split('\n').forEach((s, i, a) => Text(g, s, { x: 0, y: (i - (a.length - 1) / 2) * size * 1.12, size, color, weight, anchor })); };
}
// caption pill: ink fill, white text, one highlighted (yellow) word
function Pill(str, { size = 56, hi = '', fill = K.ink, color = '#fff', hiColor = K.yellow, stroke = null } = {}) {
  return g => {
    const w = tw(str, size) + 90, h = size * 1.6;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill, stroke: stroke || 'none', 'stroke-width': 7 }, g);
    const t = el('text', { x: 0, y: 2, 'font-size': size, 'font-weight': 900, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-family': 'Inter', fill: color }, g);
    if (hi && str.includes(hi)) {
      const [a, b] = str.split(hi);
      for (const [s, c] of [[a, color], [hi, hiColor], [b, color]]) if (s) { const sp = el('tspan', { fill: c }, t); sp.textContent = s; }
    } else t.textContent = str;
  };
}
// chip: white card with coloured border; optional icon ('check' | 'cross' | 'question')
function Chip(str, { size = 52, color = K.ink, fill = '#fff', icon = null, w = null } = {}) {
  return g => {
    const iw = icon ? size * 1.5 : 0, W = w || tw(str, size) + 80 + iw, H = size * 1.9;
    el('rect', { x: -W / 2 + 8, y: -H / 2 + 10, width: W, height: H, rx: 26, fill: K.ink }, g);
    el('rect', { x: -W / 2, y: -H / 2, width: W, height: H, rx: 26, fill, stroke: color === K.ink ? K.ink : color, 'stroke-width': 7 }, g);
    if (icon) Icon[icon](g, -W / 2 + 22, -size * 0.62, size * 0.0125 * 1.0, { check: K.green, cross: K.red, question: K.yellow }[icon]);
    Text(g, str, { x: iw / 2, y: 2, size, color: K.ink });
  };
}
// yellow emphasis strokes ("!" lines) like in the drawings
function Spark(g, x, y, s = 1, rot = 0) {
  const k = el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` }, g);
  for (const [a, l] of [[-35, 40], [0, 48], [35, 40]]) {
    const r = a * Math.PI / 180;
    el('line', { x1: Math.sin(r) * 20, y1: -Math.cos(r) * 20, x2: Math.sin(r) * (20 + l), y2: -Math.cos(r) * (20 + l), stroke: K.yellow, 'stroke-width': 13, 'stroke-linecap': 'round' }, k);
  }
  return k;
}
const Sparks = (s = 1) => g => { Spark(g, 0, 0, s); };
// big kicker title: yellow tag + headline (two lines allowed with \n)
function Kicker(tag, title, { size = 92, tagColor = K.yellow } = {}) {
  return g => {
    const tagW = tw(tag, 52) + 80;
    el('rect', { x: -tagW / 2 + 7, y: -170 + 9, width: tagW, height: 92, rx: 46, fill: K.ink }, g);
    el('rect', { x: -tagW / 2, y: -170, width: tagW, height: 92, rx: 46, fill: tagColor, stroke: K.ink, 'stroke-width': 7 }, g);
    Text(g, tag, { x: 0, y: -122, size: 52 });
    title.split('\n').forEach((s, i) => Text(g, s, { x: 0, y: 0 + i * size * 1.12, size }));
  };
}
// red stamp on white
function StampB(str, { size = 84, color = K.red, rot = -7 } = {}) {
  return g => {
    const k = el('g', { transform: `rotate(${rot})` }, g);
    const w = tw(str, size) + 90, h = size * 1.55;
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 20, fill: '#fff', stroke: color, 'stroke-width': 12 }, k);
    el('rect', { x: -w / 2 + 14, y: -h / 2 + 14, width: w - 28, height: h - 28, rx: 12, fill: 'none', stroke: color, 'stroke-width': 4 }, k);
    Text(k, str, { x: 0, y: 4, size, color });
  };
}
// icon from kit.js, centred
const Ico = (name, s = 1) => g => { Icon[name](g, -50 * s, -50 * s, s, { check: K.green, cross: K.red, question: K.yellow }[name]); };

// ---------------------------------------------------------------- animated diagrams
// rotating loop arrow (rumination); speed in turns/s
function Loop({ r = 120, color = K.red, width = 22, speed = 0.45 } = {}) {
  return g => {
    const k = el('g', {}, g);
    const a0 = -60, a1 = 250, p = a => [r * Math.cos(a * Math.PI / 180), r * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    el('path', { d: `M${x0} ${y0} A${r} ${r} 0 1 1 ${x1} ${y1}`, fill: 'none', stroke: K.ink, 'stroke-width': width + 12, 'stroke-linecap': 'round' }, k);
    el('path', { d: `M${x0} ${y0} A${r} ${r} 0 1 1 ${x1} ${y1}`, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round' }, k);
    const [hx, hy] = p(a0), tx = -Math.sin(a0 * Math.PI / 180), ty = Math.cos(a0 * Math.PI / 180);
    const ah = 46;
    el('path', { d: `M${hx + tx * ah * 0.2 + ty * ah * 0.75} ${hy + ty * ah * 0.2 - tx * ah * 0.75} L${hx - tx * ah} ${hy - ty * ah} L${hx + tx * ah * 0.2 - ty * ah * 0.75} ${hy + ty * ah * 0.2 + tx * ah * 0.75} Z`, fill: color, stroke: K.ink, 'stroke-width': 7, 'stroke-linejoin': 'round' }, k);
    return { draw(t) { k.setAttribute('transform', `rotate(${(t * speed * 360) % 360})`); } };
  };
}
// straight arrow that draws itself (dx, dy relative), colour
function Arrow(dx, dy, { color = K.green, width = 20, dur = 0.6 } = {}) {
  return g => {
    const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, ah = 44;
    const line = el('line', { x1: 0, y1: 0, x2: dx - ux * ah * 0.6, y2: dy - uy * ah * 0.6, stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L }, g);
    const head = el('path', { d: `M${dx} ${dy} L${dx - ux * ah - uy * ah * 0.7} ${dy - uy * ah + ux * ah * 0.7} L${dx - ux * ah + uy * ah * 0.7} ${dy - uy * ah - ux * ah * 0.7} Z`, fill: color, stroke: K.ink, 'stroke-width': 6, 'stroke-linejoin': 'round' }, g);
    return { draw(t, t0) { const u = E.inOut(prog(t, t0, t0 + dur)); line.setAttribute('stroke-dashoffset', (L * (1 - u)).toFixed(1)); head.setAttribute('opacity', u > 0.85 ? 1 : 0); } };
  };
}
// pulsing yellow callout ring
const Ring = (r = 70, color = K.yellow) => g => {
  const c = el('circle', { r, fill: 'none', stroke: color, 'stroke-width': 12 }, g);
  const c2 = el('circle', { r, fill: 'none', stroke: color, 'stroke-width': 6, opacity: 0.5 }, g);
  return { draw(t, t0) { const u = ((t - t0) % 1.2) / 1.2; c2.setAttribute('r', r * (1 + 0.35 * u)); c2.setAttribute('opacity', (0.6 * (1 - u)).toFixed(2)); } };
};
// sound rings (arcs) pulsing outward to the right (dir 1) or left (-1)
const Waves = (dir = 1, color = K.yellow) => g => {
  const arcs = [0, 1, 2].map(i => el('path', { d: '', fill: 'none', stroke: color, 'stroke-width': 12, 'stroke-linecap': 'round' }, g));
  return { draw(t) {
    arcs.forEach((a, i) => {
      const u = ((t * 0.9 + i / 3) % 1), r = 30 + u * 90;
      a.setAttribute('d', `M${dir * r * 0.5} ${-r * 0.85} A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${dir * r * 0.5} ${r * 0.85}`);
      a.setAttribute('opacity', (1 - u).toFixed(2));
    });
  } };
};
// battery whose level follows lv(t) in 0..1
function Battery(lv, { w = 300, h = 150 } = {}) {
  return g => {
    el('rect', { x: -w / 2 + 8, y: -h / 2 + 10, width: w, height: h, rx: 24, fill: K.ink }, g);
    el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 24, fill: '#fff', stroke: K.ink, 'stroke-width': 9 }, g);
    el('rect', { x: w / 2, y: -h * 0.2, width: 22, height: h * 0.4, rx: 6, fill: K.ink }, g);
    const bars = [0, 1, 2].map(i => el('rect', { x: -w / 2 + 20 + i * (w - 40) / 3, y: -h / 2 + 20, width: (w - 40) / 3 - 14, height: h - 40, rx: 10 }, g));
    return { draw(t) {
      const v = clamp(lv(t)), n = Math.ceil(v * 3 - 0.001), col = n >= 3 ? K.green : n === 2 ? K.yellow : K.red;
      bars.forEach((b, i) => set(b, { fill: i < n ? col : K.greyL }));
    } };
  };
}
// horizontal slider: label on the left, knob position v(t) in 0..1
function Slider(label, v, { w = 520, color = K.blueD, size = 40 } = {}) {
  return g => {
    Text(g, label, { x: -w / 2 - 30, y: 0, size, anchor: 'end' });
    el('rect', { x: -w / 2, y: -14, width: w, height: 28, rx: 14, fill: K.greyL, stroke: K.ink, 'stroke-width': 6 }, g);
    const fill = el('rect', { x: -w / 2, y: -14, width: 0, height: 28, rx: 14, fill: color }, g);
    const knob = el('circle', { cx: 0, cy: 0, r: 30, fill: '#fff', stroke: K.ink, 'stroke-width': 8 }, g);
    return { draw(t) { const u = clamp(v(t)); set(fill, { width: (w * u).toFixed(1) }); set(knob, { cx: (-w / 2 + w * u).toFixed(1) }); } };
  };
}
// subscribe button with a cursor that clicks at tc
function Subscribe(tc) {
  return g => {
    const w = 560, h = 130;
    el('rect', { x: -w / 2 + 8, y: -h / 2 + 10, width: w, height: h, rx: 65, fill: K.ink }, g);
    const btn = el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 65, fill: K.red, stroke: K.ink, 'stroke-width': 8 }, g);
    const lab = Text(g, 'SUSCRÍBETE', { x: 30, y: 4, size: 60, color: '#fff' });
    // bell
    const bell = el('g', { transform: 'translate(-200 0)' }, g);
    el('path', { d: 'M-26 18 C-26 -8 -22 -30 0 -32 C22 -30 26 -8 26 18 L34 26 L-34 26 Z', fill: '#fff', stroke: K.ink, 'stroke-width': 6, 'stroke-linejoin': 'round' }, bell);
    el('circle', { cx: 0, cy: 34, r: 9, fill: '#fff', stroke: K.ink, 'stroke-width': 6 }, bell);
    const cur = el('path', { d: 'M0 0 L0 64 L16 48 L28 76 L40 70 L28 44 L50 44 Z', fill: '#fff', stroke: K.ink, 'stroke-width': 6, 'stroke-linejoin': 'round' }, g);
    return { draw(t) {
      const u = E.inOut(prog(t, tc - 0.9, tc)), x = lerp(320, 150, u), y = lerp(200, 20, u);
      const press = t >= tc && t < tc + 0.18 ? 0.85 : 1;
      cur.setAttribute('transform', `translate(${x} ${y}) scale(${press})`);
      const done = t >= tc + 0.1;
      btn.setAttribute('fill', done ? K.grey : K.red);
      lab.textContent = done ? 'SUSCRITO ✓' : 'SUSCRÍBETE';
      bell.setAttribute('transform', `translate(-200 0) rotate(${done ? 18 * Math.sin((t - tc) * 18) * Math.exp(-(t - tc) * 2) : 0})`);
    } };
  };
}

// ---------------------------------------------------------------- overlays (outside the camera)
// progress strip: 8 numbered circles top-right; cur(t) = current signal (0 = none), shown in [a, b)
function Strip(a, b, cur) {
  const g = el('g', {}, svg), cs = [];
  const x0 = 1920 - 70 - 7 * 66, y = 70;
  el('rect', { x: x0 - 52, y: y - 44, width: 7 * 66 + 104, height: 88, rx: 44, fill: '#fff', stroke: K.ink, 'stroke-width': 5 }, g);
  for (let i = 0; i < 8; i++) {
    const c = el('circle', { cx: x0 + i * 66, cy: y, r: 25, fill: K.greyL, stroke: K.ink, 'stroke-width': 5 }, g);
    const tx = Text(g, String(i + 1), { x: x0 + i * 66, y: y + 2, size: 30, color: K.ink });
    cs.push([c, tx]);
  }
  OVER.push(t => {
    const vis = t >= T(a) && t < T(b);
    g.style.display = vis ? '' : 'none';
    if (!vis) return;
    g.setAttribute('opacity', E.inOut(prog(t, T(a), T(a) + 0.4)).toFixed(3));
    const n = cur(t);
    cs.forEach(([c, tx], i) => {
      const k = i + 1;
      set(c, { fill: k < n ? K.pink : k === n ? K.yellow : K.greyL, r: k === n ? 31 : 25, 'stroke-width': k === n ? 7 : 5 });
    });
  });
}

// ---------------------------------------------------------------- run
function Run(START, END) {
  window.START = START; window.END = END; window.DURATION = END;
  window.draw = t => {
    for (const sc of SCENES) {
      let k;
      if (sc.cut) { k = t >= sc.a && t < sc.b ? 1 : 0; }
      else k = E.inOut(prog(t, sc.a, sc.a + 0.25)) * (1 - E.inOut(prog(t, sc.b, sc.b + 0.25)));
      if (sc.a <= START + 0.01 && t < sc.a + 0.25) k = 1;   // first scene of a section needs no fade-in
      sc.g.style.display = k > 0.001 ? '' : 'none';
      if (k <= 0.001) continue;
      sc.g.setAttribute('opacity', k.toFixed(3));
      const p = sc.punches.filter(x => x <= t).pop();
      if (p != null) punch(sc.g, t, p, 960, 540, 0.07); else sc.g.removeAttribute('transform');
      for (const f of sc.items) f(t);
    }
    for (const f of OVER) f(t);
  };
}
