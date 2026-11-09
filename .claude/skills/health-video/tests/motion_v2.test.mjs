import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseSrt, buildScenes } from '../scripts/motion_v2.mjs';
import { stillPrompt, movingPrompt, styleOf } from '../scripts/motion_style.mjs';

const script = fileURLToPath(new URL('../scripts/motion_v2.mjs', import.meta.url));
const block = (i, start, end, text) => {
  const time = n => {
    const ms = Math.round(n * 1000);
    return [Math.floor(ms / 3600000), Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60]
      .map(x => String(x).padStart(2, '0')).join(':') + ',' + String(ms % 1000).padStart(3, '0');
  };
  return i + '\n' + time(start) + ' --> ' + time(end) + '\n' + text + '\n';
};
const fixture = n => Array.from({ length: n }, (_, i) =>
  block(i + 1, i * 4, (i + 1) * 4, 'El cuerpo se mueve con seguridad número ' + i)).join('\n');

test('parses standard Spanish SRT and preserves punctuation', () => {
  const a = parseSrt(block(1, 0.2, 4.7, '¿Puedes levantarte?') + '\n' + block(2, 4.7, 8.0, '¡Sí!'));
  assert.equal(a.length, 2);
  assert.equal(a[0].text, '¿Puedes levantarte?');
  assert.equal(a[0].start, 0.2);
  assert.equal(a[1].end, 8);
});

test('rejects invalid or empty subtitles', () => {
  assert.throws(() => parseSrt('empty'));
  assert.throws(() => parseSrt(block(1, 5, 3, 'wrong')));
});

test('plans contiguous, human-sized scenes with unique SC IDs', () => {
  const p = buildScenes(parseSrt(fixture(28)), 'V1', 'Doña Carmen');
  assert.equal(p.scenes[0].id, 'SC001');
  assert.equal(p.scenes.at(-1).end, 112);
  assert.equal(new Set(p.scenes.map(s => s.id)).size, p.scenes.length);
  assert.ok(p.scenes.some(s => s.mode === 'character'));
  assert.ok(p.scenes.some(s => s.mode === 'still'));
  for (let i = 0; i < p.scenes.length; i++) {
    const s = p.scenes[i];
    assert.ok(s.end - s.start >= 3 - 0.01 && s.end - s.start <= 6 + 0.01);
    if (i) assert.ok(Math.abs(s.start - p.scenes[i - 1].end) < 0.02);
  }
});

test('V1 and V2 honor the outer-frame and 2D requirements', () => {
  assert.match(styleOf('V1').image, /picture-frame-style border/);
  assert.match(styleOf('V2').image, /NO photorealism or 3D/);
  assert.match(stillPrompt({ visual: 'standing from a chair' }), /no text/i);
  assert.match(movingPrompt({ id: 'SC001', action: 'stands up' }), /stands up/);
  assert.throws(() => movingPrompt({ id: 'SC002' }), /explicit action/);
});

test('CLI creates one 20-image batch and stops without generating images', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'healthy-motion-'));
  try {
    const project = path.join(root, 'p');
    const srt = path.join(root, 'voice.srt');
    const voice = path.join(root, 'voice.mp3');
    fs.writeFileSync(srt, fixture(30));
    fs.writeFileSync(voice, 'test placeholder - not used in batch');
    const cli = (...params) => {
      const r = spawnSync(process.execPath, [script, ...params], { encoding: 'utf8' });
      assert.equal(r.status, 0, r.stderr);
      return r.stdout;
    };
    cli('init', project, '--srt', srt, '--voice', voice, '--style', 'V1');
    const plan = JSON.parse(fs.readFileSync(path.join(project, 'motion/scenes.json')));
    assert.ok(plan.scenes.length > 20);
    const text = cli('batch', project, '--index', '1');
    assert.match(text, /STOP and review/);
    const files = fs.readdirSync(path.join(project, 'motion/batches'));
    assert.ok(files.includes('batch_001_agent.md'));
    assert.ok(files.includes('batch_001_motion_prompts.md'));
    assert.equal(fs.readFileSync(path.join(project, 'motion/batches/batch_001_scene_text.txt'), 'utf8').trim().split('\n').length, 20);
    assert.equal(fs.readdirSync(path.join(project, 'clips')).length, 0);
    assert.equal(fs.readdirSync(path.join(project, 'images')).length, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
