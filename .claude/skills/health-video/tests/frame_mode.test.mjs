import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { frameInstruction, stillPrompt, movingPrompt, styleOf } from '../scripts/motion_style.mjs';
import { livingScenePrompt } from '../scripts/living_scene.mjs';

const cliPath = fileURLToPath(new URL('../scripts/motion_v2.mjs', import.meta.url));
const call = (...args) => {
  const p = spawnSync(process.execPath, [cliPath, ...args], { encoding:'utf8' });
  return { status:p.status, output:(p.stdout||'')+(p.stderr||'') };
};

test('default V1/V2 images, diagrams and animation prompts are fullbleed (not framed)', () => {
  const scene = {id:'SC001',mode:'character',action:'walks carefully',visual:'grandmother walks in living room',setting:'living-room'};
  for (const s of ['V1','V2']) {
    assert.doesNotMatch(styleOf(s).image,/outer.edge frame|picture.frame.style border/i);
    assert.doesNotMatch(styleOf(s).motion,/outer.picture.border|outer.edge frame/i);
    const a = stillPrompt(scene,s,'Carmen');
    const b = movingPrompt(scene,s,'Carmen');
    const l = livingScenePrompt(scene,s,'Carmen');
    for (const prompt of [a,b,l]) {
      assert.match(prompt,/FRAME MODE/);
      assert.match(prompt,/NO decorative picture border/);
      assert.match(prompt,/EDGE TO EDGE/);
    }
  }
});
test('framed and soft-frame remain available only on explicit request',()=>{
  const scene={id:'SC001',mode:'character',visual:'older adult walks',action:'walks forward'};
  assert.match(stillPrompt(scene,'V1','Carmen','framed'),/visible decorative picture-frame border/);
  assert.match(movingPrompt(scene,'V1','Carmen','soft-frame'),/barely visible/);
  assert.match(livingScenePrompt(scene,'V2','Carmen','subtle','soft-frame'),/barely visible/);
  assert.throws(()=>frameInstruction('rounded-cards'),/Invalid frame mode/);
});
test('custom master may have historical borders but project frame override explicitly wins',()=>{
  const master={label:'User favorite',image:'Watercolor oil-pencil rendering with curved outer border',motion:'Retain watercolors and any picture frame as in master reference'};
  const scene={id:'SC001',mode:'character',action:'waves'};
  const p=stillPrompt(scene,master,'Carmen','fullbleed');
  assert.match(p,/HIGHEST PRIORITY/);
  assert.match(p,/NO rounded or rounded frame|NO curved or rounded frame/);
  assert.match(livingScenePrompt(scene,master,'Carmen','subtle','fullbleed'),/NO letterboxing/);
});

test('CLI frame-mode persists mode; batch prompt overrides old borders; switching invalidates clip approvals',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'health-fullbleed-'));
  try {
    const proj=path.join(dir,'project'), srt=path.join(dir,'sample.srt'), voice=path.join(dir,'voice.mp3');
    fs.writeFileSync(srt,'1\n00:00:00,000 --> 00:00:04,000\nUna mujer camina en el parque.\n\n2\n00:00:04,000 --> 00:00:08,000\nEstá sentada en una silla.\n');
    fs.writeFileSync(voice,'unit test fixture');
    let r=call('init',proj,'--srt',srt,'--voice',voice,'--style','V1');
    assert.equal(r.status,0,r.output);
    const planPath=path.join(proj,'motion/scenes.json');
    const progressPath=path.join(proj,'motion/progress.json');
    assert.equal(JSON.parse(fs.readFileSync(planPath)).frame_mode,'fullbleed');
    r=call('frame-mode',proj,'--mode','framed');
    assert.equal(r.status,0,r.output);
    assert.equal(JSON.parse(fs.readFileSync(planPath)).frame_mode,'framed');
    r=call('batch',proj,'--index','1');
    assert.equal(r.status,0,r.output);
    const batchPath=path.join(proj,'motion/batches/batch_001_prompts.md');
    assert.match(fs.readFileSync(batchPath,'utf8'),/visible decorative picture-frame border/);
    fs.writeFileSync(progressPath,JSON.stringify({clips:{SC001:{status:'generated'}},approved:{SC001:{file_bytes:123}}}));
    r=call('frame-mode',proj,'--mode','fullbleed');
    assert.equal(r.status,0,r.output);
    assert.match(r.output,/Existing PNG\/MP4 files are untouched/);
    assert.equal(JSON.parse(fs.readFileSync(planPath)).frame_mode,'fullbleed');
    assert.deepEqual(JSON.parse(fs.readFileSync(progressPath)).approved,{});
    r=call('batch',proj,'--index','1');
    assert.equal(r.status,0,r.output);
    assert.match(fs.readFileSync(batchPath,'utf8'),/NO decorative picture border/);
    assert.match(fs.readFileSync(path.join(proj,'motion/batches/batch_001_live_prompts.md'),'utf8'),/EDGE TO EDGE/);
    const before=fs.readFileSync(planPath,'utf8');
    r=call('frame-mode',proj,'--mode','nonsense');
    assert.notEqual(r.status,0);
    assert.equal(fs.readFileSync(planPath,'utf8'),before);
    r=call('frame-mode',proj,'--mode','fullbleed');
    assert.equal(r.status,0,r.output);
    assert.match(r.output,/No changes made/);
    r=call('status',proj);
    assert.match(r.output,/"frame_mode": "fullbleed"/);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
