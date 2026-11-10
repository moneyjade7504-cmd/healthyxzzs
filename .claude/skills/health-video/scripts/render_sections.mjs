#!/usr/bin/env node
// Render a long video as sections in parallel, then join them and add the voice once.
//
//   node render_sections.mjs <project_dir> <voice> <out.mp4> a.html b.html ... [--jobs 3] [--fps 30]
//
// Each section page sets window.START / window.END on the shared voice timeline (the first section may
// omit START = 0). Boundaries are snapped to whole frames, and section k ends exactly where k+1 starts,
// so the joined picture never drifts from the audio. Section MP4s go to <project>/out/sections/.
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const jobs = Number(opt('--jobs', 3)), fps = Number(opt('--fps', 30));
const [dir, voice, out, ...pages] = args;
const here = path.dirname(fileURLToPath(import.meta.url));
const renderer = path.join(here, '..', 'flat', 'render.mjs');
const { chromium } = await import(path.join(here, '..', 'flat', 'node_modules', 'playwright-core', 'index.mjs'));   // installed by setup.sh

// read START/END from each page
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const spans = [];
for (const p of pages) {
  await page.goto('file://' + path.resolve(dir, p));
  spans.push(await page.evaluate(() => [window.START || 0, window.END || window.DURATION]));
}
await browser.close();
const snap = t => Math.round(t * fps) / fps;
const cuts = [snap(spans[0][0]), ...spans.slice(1).map(s => snap(s[0])), snap(spans.at(-1)[1])];
fs.mkdirSync(path.join(dir, 'out', 'sections'), { recursive: true });
const tasks = pages.map((p, i) => ({ p, from: cuts[i], to: cuts[i + 1], file: path.join(dir, 'out', 'sections', `${String(i).padStart(2, '0')}_${path.basename(p, '.html')}.mp4`) }));
for (const t of tasks) console.log(`${t.p}: ${t.from.toFixed(2)} → ${t.to.toFixed(2)} s`);

const run = t => new Promise((res, rej) => {
  const c = spawn('node', [renderer, path.resolve(dir, t.p), t.file, '--fps', String(fps), '--from', String(t.from), '--to', String(t.to)], { stdio: ['ignore', 'ignore', 'pipe'] });
  let err = '';
  c.stderr.on('data', d => { err += d; });
  c.on('close', code => code ? rej(new Error(`${t.p} failed:\n${err.slice(-2000)}`)) : (console.log('done', t.p), res()));
});
const queue = [...tasks];
await Promise.all(Array.from({ length: jobs }, async () => { while (queue.length) await run(queue.shift()); }));

const list = path.join(dir, 'out', 'sections', 'list.txt');
fs.writeFileSync(list, tasks.map(t => `file '${path.resolve(t.file)}'`).join('\n') + '\n');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-i', voice,
  '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-af', 'loudnorm=I=-14:TP=-1.5',
  '-movflags', '+faststart', out], { stdio: 'inherit' });
console.log('wrote', out);
