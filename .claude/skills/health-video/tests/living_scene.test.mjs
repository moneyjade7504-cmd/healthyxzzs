import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildScenes } from '../scripts/motion_v2.mjs';
import { liveEligible, inferEnvironmentMotion, livingScenePrompt } from '../scripts/living_scene.mjs';

const script = fileURLToPath(new URL('../scripts/motion_v2.mjs', import.meta.url));
const picture = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl8tP8AAAAASUVORK5CYII=', 'base64');
const srt = Array.from({length:8},(_,i)=>{
  const stamp = sec => '00:00:' + String(sec).padStart(2,'0') + ',000';
  return String(i+1)+'\n'+stamp(4*i)+' --> '+stamp(4*i+4)+'\nLa persona camina en un parque y respira con tranquilidad.\n';
}).join('\n');

const cli = (...a) => {
  const r = spawnSync(process.execPath, [script, ...a], { encoding: 'utf8' });
  return {status:r.status, output:(r.stdout||'')+(r.stderr||'')};
};

test('living scene prompt asks for natural body mechanics and subtle visible background motion',()=>{
  const scene = {id:'SC001',mode:'character',setting:'park-path',action:'walks forward taking three steps'};
  const p = livingScenePrompt(scene,'V1','Carmen with grey hair');
  assert.match(p,/walks forward taking three steps/);
  assert.match(p,/natural anticipation/);
  assert.match(p,/weight shifts/);
  assert.match(p,/leaves, grass/);
  assert.match(p,/already visible/);
  assert.match(p,/camera FIXED/);
  assert.match(p,/face|identity/i);
});
test('uses exact explicit per-scene environment motion and respects custom master',()=>{
  const scene = {id:'SC003',mode:'character',setting:'kitchen',
    action:'gently raises a cup',
    environment_motion:'Only the blue curtain visible behind the chair moves softly'};
  const master={label:'Watercolor',image:'Brushstrokes and paper grain',
    motion:'Preserve watercolor pigment edges, blooms and paper texture'};
  const p=livingScenePrompt(scene,master,'Carmen');
  assert.match(p,/watercolor pigment edges/);
  assert.match(p,/Only the blue curtain visible/);
  assert.doesNotMatch(p,/leaves, grass/);
  assert.doesNotMatch(p,/must be 2D/i);
});
test('ambient-only B-roll must explicitly opt in',()=>{
  const s={id:'SC002',mode:'still',setting:'bedroom',animate_environment:true};
  assert.equal(liveEligible(s),true);
  const p=livingScenePrompt(s,'V2');
  assert.match(p,/ENVIRONMENT-ONLY SHOT/);
  assert.doesNotMatch(p,/PRIMARY CHARACTER ACTION/);
  assert.match(p,/bedside-lamp/);
  assert.equal(liveEligible({...s,animate_environment:false}),false);
  assert.equal(liveEligible({...s,mode:'graphic'}),false);
  assert.throws(()=>livingScenePrompt({id:'SC002',mode:'still'}),/animate_environment/);
});
test('invalid scene action and motion intensity are rejected',()=>{
  assert.throws(()=>livingScenePrompt({id:'SC001',mode:'character'}),/explicit scene.action/);
  assert.throws(()=>livingScenePrompt({id:'SC001',mode:'character',action:'walks',motion_intensity:'extreme'}),/subtle or balanced/);
  assert.match(livingScenePrompt({id:'SC001',mode:'character',action:'walks',motion_intensity:'balanced'}),/balanced but restrained/);
});
test('scene director includes editable environment motion metadata',()=>{
  const plan=buildScenes([{start:0,end:4,text:'Caminar en el parque ayuda al equilibrio.'},
    {start:4,end:8,text:'Siéntate en una silla firme.'}], 'V1', 'Carmen');
  assert.ok(plan.scenes.every(s=>typeof s.environment_motion==='string' && s.environment_motion.length>20));
  assert.ok(plan.scenes.every(s=>s.motion_intensity==='subtle'));
  assert.ok(plan.scenes.every(s=>s.animate_environment===false));
});
test('CLI batch exports live prompts and animate-live remains dry-run without --execute',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'living-scene-cli-'));
  try {
    const project=path.join(root,'video'), sub=path.join(root,'voice.srt'), audio=path.join(root,'voice.mp3');
    fs.mkdirSync(project,{recursive:true});
    fs.writeFileSync(sub,srt);
    fs.writeFileSync(audio,'test data');
    let r=cli('init',project,'--srt',sub,'--voice',audio,'--style','V1');
    assert.equal(r.status,0,r.output);
    const f=path.join(project,'motion/scenes.json');
    const plan=JSON.parse(fs.readFileSync(f,'utf8'));
    const chosenStill=plan.scenes.find(s=>s.mode==='still');
    assert.ok(chosenStill);
    chosenStill.animate_environment=true;
    chosenStill.environment_motion='The visible curtain in the living room moves gently';
    fs.writeFileSync(f,JSON.stringify(plan,null,2));
    r=cli('batch',project,'--index','1'); assert.equal(r.status,0,r.output);
    const promptFile=path.join(project,'motion/batches/batch_001_live_prompts.md');
    const prompt=fs.readFileSync(promptFile,'utf8');
    assert.match(prompt,/SECONDARY ENVIRONMENT MOTION/);
    assert.match(prompt,/ENVIRONMENT-ONLY SHOT/);
    assert.match(prompt,/visible curtain in the living room/);
    assert.match(prompt,/PRIMARY CHARACTER ACTION/);
    assert.equal(fs.readdirSync(path.join(project,'clips')).length,0);
    fs.writeFileSync(path.join(project,plan.scenes.find(s=>s.mode==='character').image),picture);
    fs.writeFileSync(path.join(project,chosenStill.image),picture);
    r=cli('animate-live',project,'--batch','1','--max','5');
    assert.equal(r.status,0,r.output);
    assert.match(r.output,/DRY RUN ONLY/);
    assert.match(r.output,/SECONDARY ENVIRONMENT MOTION/);
    assert.equal(fs.readdirSync(path.join(project,'clips')).length,0);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});
