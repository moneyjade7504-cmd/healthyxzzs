import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { importSceneImages } from '../scripts/image_intake.mjs';

const script = fileURLToPath(new URL('../scripts/motion_v2.mjs', import.meta.url));
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl8tP8AAAAASUVORK5CYII=', 'base64');
const otherPng = Buffer.from(png); otherPng[otherPng.length - 5] ^= 7; // Different payload with same PNG signature.
const run = (args, env = process.env) => {
  const p = spawnSync(process.execPath, [script, ...args], { encoding:'utf8', env });
  return { status:p.status, output:(p.stdout||'')+(p.stderr||'') };
};
const withProject = fn => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'healthy-image-import-'));
  try {
    const project = path.join(root, 'video');
    const input = path.join(root, 'user_images');
    fs.mkdirSync(input);
    const srt = path.join(root, 'voice.srt');
    const voice = path.join(root, 'voice.mp3');
    fs.writeFileSync(srt, '1\n00:00:00,000 --> 00:00:04,000\nCamina por el parque.\n\n2\n00:00:04,000 --> 00:00:08,000\nSuave movimiento de los pies.\n\n3\n00:00:08,000 --> 00:00:12,000\nDescansa en la silla.\n');
    fs.writeFileSync(voice, 'dummy audio, not used during intake');
    const r = run(['init',project,'--srt',srt,'--voice',voice,'--style','V1']);
    assert.equal(r.status, 0, r.output);
    return fn({ root, project, input });
  } finally {
    fs.rmSync(root, { recursive:true, force:true });
  }
};

test('from user-uploaded numbered images: import, scene match, live prompt, no paid clip by default', () => withProject(({project,input}) => {
  fs.writeFileSync(path.join(input,'SC001.png'),png);
  fs.writeFileSync(path.join(input,'SC002_still.png'),png);
  const r = run(['animate-from-images',project,'--from',input,'--batch','1','--max','3']);
  assert.equal(r.status,0,r.output);
  assert.match(r.output,/Imported 2 uploaded first-frame image/);
  assert.match(r.output,/CLAUDE PREVIEW/);
  assert.ok(fs.existsSync(path.join(project,'images/SC001.png')));
  assert.ok(fs.existsSync(path.join(project,'images/SC002.png')));
  assert.equal(fs.readdirSync(path.join(project,'clips')).length,0);
  const p = JSON.parse(fs.readFileSync(path.join(project,'motion/scenes.json'),'utf8'));
  assert.equal(p.scenes[0].image,'images/SC001.png');
  const report = JSON.parse(fs.readFileSync(path.join(project,'motion/imports/batch_001.json'),'utf8'));
  assert.deepEqual(report.items.map(x=>x.id),['SC001','SC002']);
  assert.ok(report.items.every(x=>x.sha256.length === 64));
  assert.match(fs.readFileSync(path.join(project,'motion/batches/batch_001_live_prompts.md'),'utf8'),/FRAME MODE/);
}));
test('accept a single arbitrary named Claude-uploaded image with explicit --scene',()=>withProject(({project,root})=>{
  const file=path.join(root,'uploaded_picture.png');fs.writeFileSync(file,png);
  const r=run(['animate-from-images',project,'--from',file,'--scene','SC001']);
  assert.equal(r.status,0,r.output);
  assert.ok(fs.existsSync(path.join(project,'images/SC001.png')));
}));
test('reject ambiguity, mismatch and misnumbered images without writing project scenes',()=>withProject(({project,input})=>{
  const wrong=path.join(input,'random.png');fs.writeFileSync(wrong,png);
  const before=fs.readFileSync(path.join(project,'motion/scenes.json'),'utf8');
  let r=run(['animate-from-images',project,'--from',input]);assert.notEqual(r.status,0);
  assert.match(r.output,/Cannot identify scene/);
  assert.equal(fs.readFileSync(path.join(project,'motion/scenes.json'),'utf8'),before);
  fs.rmSync(wrong);
  fs.writeFileSync(path.join(input,'SC100.png'),png);
  r=run(['animate-from-images',project,'--from',input,'--batch','1']);assert.notEqual(r.status,0);
  assert.match(r.output,/is not in batch/);
  fs.rmSync(path.join(input,'SC100.png'));
  fs.writeFileSync(path.join(input,'SC001.png'),png);
  fs.writeFileSync(path.join(input,'SC001_take2.png'),png);
  r=run(['animate-from-images',project,'--from',input]);assert.notEqual(r.status,0);
  assert.match(r.output,/Two images map to SC001/);
  assert.equal(fs.readdirSync(path.join(project,'images')).length,0);
}));
test('reject bogus file content and paid execution without FAL_KEY BEFORE import',()=>withProject(({project,root})=>{
  const file=path.join(root,'SC001.png');fs.writeFileSync(file,'not really an image');
  let r=run(['animate-from-images',project,'--from',file]);assert.notEqual(r.status,0);
  assert.match(r.output,/contents do not match/);
  fs.writeFileSync(file,png);
  r=run(['animate-from-images',project,'--from',file,'--execute'],{...process.env,FAL_KEY:''});
  assert.notEqual(r.status,0);
  assert.match(r.output,/FAL_KEY/);
  assert.equal(fs.readdirSync(path.join(project,'images')).length,0);
}));
test('protect existing first frames and prevent stale animated videos when replacing a picture',()=>withProject(({project,root})=>{
  const img=path.join(root,'SC001.png');fs.writeFileSync(img,png);
  let r=run(['animate-from-images',project,'--from',img]);assert.equal(r.status,0,r.output);
  r=run(['animate-from-images',project,'--from',img]);assert.equal(r.status,0,r.output);
  fs.writeFileSync(img,otherPng);
  r=run(['animate-from-images',project,'--from',img]);assert.notEqual(r.status,0);
  assert.match(r.output,/DIFFERENT image/);
  fs.writeFileSync(path.join(project,'clips/SC001.mp4'),'an older actual video placeholder');
  r=run(['animate-from-images',project,'--from',img,'--replace-images']);
  assert.notEqual(r.status,0);
  assert.match(r.output,/already has a generated video/);
  fs.rmSync(path.join(project,'clips/SC001.mp4'));
  r=run(['animate-from-images',project,'--from',img,'--replace-images']);
  assert.equal(r.status,0,r.output);
  assert.ok(fs.readFileSync(path.join(project,'images/SC001.png')).equals(otherPng));
}));
test('single file input can be mapped to a specific batch only',()=>withProject(({project,root})=>{
  const file=path.join(root,'SC001.png'); fs.writeFileSync(file,png);
  const r=run(['animate-from-images',project,'--from',file,'--batch','2']);
  assert.notEqual(r.status,0);
  assert.match(r.output,/Batch 2 does not exist/);
}));
