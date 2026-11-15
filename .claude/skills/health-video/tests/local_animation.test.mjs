import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/motion_v2.mjs', import.meta.url));
const run = (command, args) => {
  const p = spawnSync(command, args, { encoding:'utf8', maxBuffer: 8*1024*1024 });
  return { status:p.status, output:(p.stdout||'')+'\n'+(p.stderr||''), error:p.error?.message };
};
const cli = (...args) => run(process.execPath, [script, ...args]);
function ok(r) { assert.equal(r.status,0,r.error || r.output); return r.output; }
const python = program => ok(run('python3',['-c', program]));

test('V8 offline local animation: single image -> micro MP4, ambient MP4 and rig MP4, with QA', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'healthy-local-v8-'));
  try {
    const project=path.join(root,'video');
    const srt=path.join(root,'voice.srt'), voice=path.join(root,'voice.mp3');
    fs.writeFileSync(srt,[
      '1','00:00:00,000 --> 00:00:04,000','La mujer respira tranquilamente.','',
      '2','00:00:04,000 --> 00:00:08,000','La cortina se mueve suavemente.'
    ].join('\n'));
    fs.writeFileSync(voice,'dummy narration for pipeline setup');
    ok(cli('init',project,'--srt',srt,'--voice',voice,'--style','V1'));
    const planPath=path.join(project,'motion/scenes.json');
    const plan=JSON.parse(fs.readFileSync(planPath,'utf8'));
    assert.equal(plan.scenes.length,2);
    const character=plan.scenes[0];
    const scenery=plan.scenes[1];
    scenery.mode='still'; scenery.animate_environment=true;
    fs.writeFileSync(planPath,JSON.stringify(plan,null,2));
    const src=path.join(project,character.image);
    const second=path.join(project,scenery.image);
    fs.mkdirSync(path.dirname(src),{recursive:true});
    python([
      'from PIL import Image,ImageDraw',
      'im=Image.new("RGB",(960,540),"#e8edec")',
      'd=ImageDraw.Draw(im)',
      'd.rectangle((310,95,645,420),fill="#509dc8")',
      'd.ellipse((397,60,555,210),fill="#f0c49e")',
      'd.rectangle((35,50,180,440),fill="#1c607a")',
      'im.save('+JSON.stringify(src)+')',
      'im.save('+JSON.stringify(second)+')',
    ].join('\n'));
    let text=ok(cli('local-init',project,'--batch','1','--max','2'));
    assert.match(text,/No MP4 automatically created/);
    const m=path.join(project,'motion/local',character.id+'.json');
    const a=path.join(project,'motion/local',scenery.id+'.json');
    const cfg=JSON.parse(fs.readFileSync(m,'utf8'));
    assert.equal(cfg.mode,'micro');
    assert.equal(cfg.region,null);
    assert.equal(JSON.parse(fs.readFileSync(a,'utf8')).mode,'ambient');
    let p=cli('animate-local',project,'--batch','1','--max','2','--fps','12');
    assert.equal(p.status,0,p.output);
    assert.match(p.output,/NEEDS SETUP/);
    assert.ok(!fs.existsSync(path.join(project,character.video)));
    cfg.region=[0.31,0.10,0.67,0.8];
    fs.writeFileSync(m,JSON.stringify(cfg,null,2));
    const ambient=JSON.parse(fs.readFileSync(a,'utf8'));
    ambient.ambient_regions=[{box:[0.025,0.09,0.19,0.81],strength:0.02,hz:0.6}];
    fs.writeFileSync(a,JSON.stringify(ambient,null,2));
    text=ok(cli('animate-local',project,'--batch','1','--max','2','--fps','12'));
    assert.match(text,/LOCAL V8 SUMMARY: 2 MP4 created, 0 scenes/);
    for (const s of plan.scenes) {
      const out=path.join(project,s.video);
      assert.ok(fs.statSync(out).size>1000);
      const probed=JSON.parse(ok(run('ffprobe',['-v','error','-show_entries','format=duration:stream=width,height,codec_type','-of','json',out])));
      assert.ok(+probed.format.duration>=3.9 && +probed.format.duration<=4.1);
      assert.ok(probed.streams.some(v=>v.codec_type==='video'&&v.width===960&&v.height===540));
    }
    const progressPath=path.join(project,'motion/progress.json');
    let progress=JSON.parse(fs.readFileSync(progressPath,'utf8'));
    assert.equal(progress.clips[character.id].local_mode,'micro');
    assert.equal(progress.clips[scenery.id].local_mode,'ambient');
    assert.deepEqual(progress.approved,{});
    text=ok(cli('qa',project,'--frames'));
    assert.match(text,/MICRO-MOTION only/);
    // Force output to switch from weak micro-motion to an explicit layered local rig.
    const rigdir=path.join(project,'motion/local',character.id);
    fs.mkdirSync(rigdir,{recursive:true});
    const backdrop=path.join(rigdir,'background.png'),sprite=path.join(rigdir,'arm.png');
    python([
      'from PIL import Image,ImageDraw',
      'bg=Image.new("RGB",(960,540),"#f5eee3")',
      'bg.save('+JSON.stringify(backdrop)+')',
      'fg=Image.new("RGBA",(960,540),(0,0,0,0))',
      'd=ImageDraw.Draw(fg)',
      'd.ellipse((450,170,530,330),fill="#e47b60")',
      'fg.save('+JSON.stringify(sprite)+')',
    ].join('\n'));
    fs.writeFileSync(m,JSON.stringify({
      version:1,mode:'rig',
      background:'motion/local/'+character.id+'/background.png',
      layers:[{
        image:'motion/local/'+character.id+'/arm.png',
        pivot:[0.50,0.33],
        keyframes:[{t:0,rotate:0,dx:0,dy:0},{t:0.5,rotate:12,dx:6,dy:0},{t:1,rotate:0,dx:0,dy:0}]
      }]
    },null,2));
    text=ok(cli('animate-local',project,'--batch','1','--max','1','--fps','12','--force'));
    assert.match(text,/1 MP4 created/);
    progress=JSON.parse(fs.readFileSync(progressPath,'utf8'));
    assert.equal(progress.clips[character.id].local_mode,'rig');
    assert.deepEqual(progress.approved,{});
    // This is a synthetic rendering test, not proof of anatomically natural exercise.
  } finally {
    fs.rmSync(root,{recursive:true,force:true});
  }
});

test('V8 --local import path never calls fal and creates a reviewed template (not a fake MP4)', () => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'healthy-local-import-'));
  try {
    const project=path.join(root,'p'),srt=path.join(root,'voice.srt'),voice=path.join(root,'voice.mp3'),uploads=path.join(root,'uploads');
    fs.mkdirSync(uploads);
    fs.writeFileSync(srt,'1\n00:00:00,000 --> 00:00:04,000\nEsta señora respira suavemente.\n');
    fs.writeFileSync(voice,'dummy');
    ok(cli('init',project,'--srt',srt,'--voice',voice));
    const photo=path.join(uploads,'SC001.png');
    python([
      'from PIL import Image',
      'Image.new("RGB",(960,540),"#62aa8c").save('+JSON.stringify(photo)+')'
    ].join('\n'));
    const p=cli('animate-from-images',project,'--from',uploads,'--local','--batch','1','--max','1');
    assert.equal(p.status,0,p.output);
    assert.match(p.output,/LOCAL PATH V8/);
    assert.match(p.output,/NEEDS SETUP/);
    assert.ok(fs.existsSync(path.join(project,'motion/local/SC001.json')));
    assert.ok(!fs.existsSync(path.join(project,'clips/SC001.mp4')));
    const ex=cli('animate-local',project,'--execute');
    assert.notEqual(ex.status,0);
    assert.match(ex.output,/NEVER uses cloud/);
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
