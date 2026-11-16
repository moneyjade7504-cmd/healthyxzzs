// Extra builders for "medicamentos y memoria" (load after common.js).
const Full = color => g => { el('rect', { x: -960, y: -540, width: 1920, height: 1080, fill: color }, g); };
const Dram = (S, t, x = 1660, y = 1015) => Item(S, Chip('DRAMATIZACIÓN', { size: 28, color: K.grey }), { x, y, t, enter: 'fade' });

// Two neurons with acetylcholine "messengers" flowing between them; from tb on, red pills block most of them.
function Synapse(tb) {
  return g => {
    const L = -380, R = 380;
    for (const [x, c] of [[L, K.blue], [R, K.pink]]) {
      el('circle', { cx: x, cy: 0, r: 120, fill: c, stroke: K.ink, 'stroke-width': 9 }, g);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.3, d = x < 0 ? -1 : 1;
        el('line', { x1: x + Math.cos(a) * 120, y1: Math.sin(a) * 120, x2: x + Math.cos(a) * 180, y2: Math.sin(a) * 180, stroke: K.ink, 'stroke-width': 9, 'stroke-linecap': 'round', opacity: (Math.cos(a) * d > 0.3) ? 0 : 1 }, g);
      }
    }
    const dots = [];
    for (let i = 0; i < 14; i++) dots.push(el('circle', { r: 14, fill: K.yellow, stroke: K.ink, 'stroke-width': 4 }, g));
    const pills = [];
    for (let i = 0; i < 3; i++) {
      const p = el('g', {}, g);
      el('rect', { x: -38, y: -18, width: 76, height: 36, rx: 18, fill: K.red, stroke: K.ink, 'stroke-width': 6 }, p);
      el('line', { x1: 0, y1: -18, x2: 0, y2: 18, stroke: K.ink, 'stroke-width': 5 }, p);
      pills.push(p);
    }
    return { draw(t) {
      const blk = tb == null ? 0 : E.inOut(prog(t, tb, tb + 0.8));
      pills.forEach((p, i) => {
        const y = (i - 1) * 90;
        p.setAttribute('transform', `translate(0 ${y - (1 - blk) * 500}) rotate(${-20 + i * 20})`);
        p.setAttribute('opacity', blk.toFixed(2));
      });
      dots.forEach((d, i) => {
        const u = ((t * 0.5) + i / 14) % 1, y = Math.sin(i * 2.3) * 110;
        const pass = i % 4 === 0;
        let x = lerp(L + 130, R - 130, u), o = 1;
        if (blk > 0.5 && !pass && u > 0.42) { x = lerp(L + 130, R - 130, 0.42) - (u - 0.42) * 60; o = clamp(1 - (u - 0.42) * 4); }
        set(d, { cx: x.toFixed(1), cy: y.toFixed(1), opacity: o.toFixed(2) });
      });
    } };
  };
}

// Horizontal bar that grows to frac(t) of w; label on the left.
function Bar(label, frac, { w = 640, color = K.blueD, size = 40 } = {}) {
  return g => {
    Text(g, label, { x: -w / 2 - 30, y: 0, size, anchor: 'end' });
    el('rect', { x: -w / 2, y: -26, width: w, height: 52, rx: 26, fill: K.greyL, stroke: K.ink, 'stroke-width': 6 }, g);
    const f = el('rect', { x: -w / 2, y: -26, width: 0, height: 52, rx: 26, fill: color, stroke: K.ink, 'stroke-width': 6 }, g);
    return { draw(t) { set(f, { width: Math.max(52, w * clamp(frac(t))).toFixed(1) }); } };
  };
}
