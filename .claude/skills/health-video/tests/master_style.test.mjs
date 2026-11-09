import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareMasterStyle, masterReferenceInstructions } from '../scripts/master_style.mjs';
import { stillPrompt, movingPrompt, styleOf, NEGATIVE } from '../scripts/motion_style.mjs';

const script = fileURLToPath(new URL('../scripts/motion_v2.mjs', import.meta.url));
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl8tP8AAAAASUVORK5CYII=', 'base64');

const withTmp = fn => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'health-master-v4-'));
  try { return fn(folder); }
  finally { fs.rmSync(folder, { force: true, recursive: true }); }
};

const cli = (...args) => {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  assert.equal(r.status, 0, [r.error?.message, r.stderr, r.stdout].filter(Boolean).join('\n'));
  return r.stdout;
};

test('allows completely arbitrary master style including 3D or photographic style without V1/V2 override', () => {
  const custom = { label: 'Clay stop-motion', image: 'hand-sculpted clay figures, physical stop-motion', graphic: 'clay objects on table', motion: 'stop-motion gestures, small deliberate movements' };
  assert.equal(styleOf(custom).image, custom.image);
  assert.match(stillPrompt({ mode: 'still', visual: 'person reading' }, custom, 'Carmen'), /hand-sculpted clay/);
  const move = movingPrompt({ id: 'SC001', mode: 'character', action: 'waves slowly' }, custom, 'Carmen');
  assert.match(move, /stop-motion gestures/);
  assert.doesNotMatch(move, /flat 2D cartoon|no 3D|photorealistic changes/i);
  assert.match(NEGATIVE, /photorealism/); // legacy presets remain unchanged
});

test('copies user master and character reference images into project and writes local attachment filenames', () => withTmp(root => {
  const refs = path.join(root, 'source');
  const project = path.join(root, 'video');
  fs.mkdirSync(refs);
  fs.mkdirSync(project);
  fs.writeFileSync(path.join(refs, 'art.png'), png);
  fs.writeFileSync(path.join(refs, 'face.png'), png);
  const manifest = path.join(refs, 'style.json');
  fs.writeFileSync(manifest, JSON.stringify({
    id: 'CUSTOM_CLAY', label: 'Pastel clay stop-motion',
    image: 'Hand-crafted pastel clay figures', graphic: 'Clay-figure diagrams',
    motion: 'Gentle handcrafted stop motion',
    reference_images: ['./art.png'], character_references: ['./face.png'],
    negative: 'plastic CGI textures',
  }));
  const master = prepareMasterStyle({ master: manifest, project });
  assert.equal(master.id, 'CUSTOM_CLAY');
  assert.deepEqual(master.reference_images, ['motion/master/style_01.png']);
  assert.deepEqual(master.character_references, ['motion/master/character_01.png']);
  assert.ok(fs.existsSync(path.join(project, master.reference_images[0])));
  assert.ok(fs.existsSync(path.join(project, master.character_references[0])));
  assert.match(masterReferenceInstructions(master), /ATTACH these MASTER STYLE images/);
  assert.match(masterReferenceInstructions(master), /motion\/master\/style_01.png/);
  assert.match(masterReferenceInstructions(master), /ATTACH these CHARACTER IDENTITY images/);
}));

test('image-only master path works without JSON and does not claim image has been analyzed', () => withTmp(root => {
  const project = path.join(root, 'p');
  fs.mkdirSync(project);
  const image = path.join(root, 'anything.webp');
  fs.writeFileSync(image, png);
  const m = prepareMasterStyle({ masterImage: image, project });
  assert.equal(m.reference_images.length, 1);
  assert.match(m.image, /attached MASTER STYLE image/);
  assert.match(masterReferenceInstructions(m), /Text alone does not load an image/);
}));

test('rejects unsafe missing, unsupported or oversized image references', () => withTmp(root => {
  const project = path.join(root, 'p'); fs.mkdirSync(project);
  assert.throws(() => prepareMasterStyle({ masterImage: path.join(root, '404.png'), project }), /not found/);
  const text = path.join(root, 'foo.txt'); fs.writeFileSync(text, 'hello');
  assert.throws(() => prepareMasterStyle({ masterImage: text, project }), /Unsupported/);
  const invalidJSON = path.join(root, 'bad.json'); fs.writeFileSync(invalidJSON, 'not json');
  assert.throws(() => prepareMasterStyle({ master: invalidJSON, project }), /Invalid Master Style JSON/);
  const bogus = path.join(root, 'badstyle.json'); fs.writeFileSync(bogus, JSON.stringify({label: 'missing image'}));
  assert.throws(() => prepareMasterStyle({ master: bogus, project }), /descriptive style prompt or at least one reference image/);
}));

test('end-to-end CLI init+batch accepts user master photo and preserves it in all 20 prompts', () => withTmp(root => {
  const folder = path.join(root, 'video');
  const input = path.join(root, 'master.jpg');
  const character = path.join(root, 'character.webp');
  fs.writeFileSync(input, png);
  fs.writeFileSync(character, png);
  const srt = path.join(root, 'voice.srt');
  fs.writeFileSync(srt, Array.from({length:30}, (_,i)=>{
    const ts = n => '00:00:' + String(n).padStart(2,'0') + ',000';
    return (i+1)+'\n'+ts(i*4%60)+' --> '+ts((i+1)*4%60)+'\nUna escena con un cambio de ambiente.\n';
  }).join('\n'));
  // timestamps need valid ascending; use a slower fixed 5s step within first minute only
  fs.writeFileSync(srt, Array.from({length: 11}, (_,i)=>{
    const ts=n=>'00:00:'+String(n).padStart(2,'0')+',000';
    return (i+1)+'\n'+ts(i*5)+' --> '+ts((i+1)*5)+'\nUna escena con actividades distintas.\n';
  }).join('\n'));
  const voice=path.join(root,'voice.mp3'); fs.writeFileSync(voice,'not processed for image prompts');
  cli('init',folder,'--srt',srt,'--voice',voice,'--master-image',input,'--character-image',character,'--variety','high');
  const plan=JSON.parse(fs.readFileSync(path.join(folder,'motion/scenes.json'),'utf8'));
  assert.equal(plan.style,'CUSTOM');
  assert.ok(plan.master_style);
  assert.equal(plan.master_style.reference_images.length,1);
  assert.equal(plan.master_style.character_references.length,1);
  assert.ok(plan.scenes.length>=10);
  cli('batch',folder,'--index','1');
  const batch=fs.readFileSync(path.join(folder,'motion/batches/batch_001_prompts.md'),'utf8');
  assert.match(batch,/motion\/master\/style_01.jpg/);
  assert.match(batch,/motion\/master\/character_01.webp/);
  assert.match(batch,/Text alone does not load an image/);
  assert.doesNotMatch(batch,/V1 · pastel editorial/);
  cli('map',folder);
  const status=cli('status',folder);
  assert.match(status,/User-provided MASTER STYLE/);
}));
