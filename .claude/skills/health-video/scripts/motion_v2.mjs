#!/usr/bin/env node
/**
 * HealthyXZZS Motion V2: SRT -> 3-6 s scenes -> 20-scene image batches ->
 * real image-to-video clips -> technical + human QA -> narrated MP4.
 *
 * CLI:
 *   node scripts/motion_v2.mjs init PROJECT --srt subtitles.srt --voice voice.mp3 [--style V1]
 *   node scripts/motion_v2.mjs batch PROJECT [--index 1]
 *   node scripts/motion_v2.mjs animate PROJECT [--batch 1] [--max 1] [--execute]
 *   node scripts/motion_v2.mjs qa PROJECT
 *   node scripts/motion_v2.mjs approve PROJECT SC001 SC002 ...
 *   node scripts/motion_v2.mjs render PROJECT [--draft] [--allow-stills]
 *   node scripts/motion_v2.mjs status PROJECT
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { File } from 'node:buffer';
import { stillPrompt, movingPrompt, NEGATIVE, styleOf } from './motion_style.mjs';

const BATCH_SIZE = 20;
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const MODEL = 'fal-ai/wan/v2.7/image-to-video';
const DEFAULT_ACTION = 'The older adult breathes gently, turns their head a little, makes a small expressive hand gesture, then settles naturally, keeping both feet planted';
const round = n => Math.round(n * 100) / 100;
const exists = p => fs.existsSync(p);
const mkdir = p => fs.mkdirSync(p, { recursive: true });
const json = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const save = (p, v) => { mkdir(path.dirname(p)); fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n'); };
const write = (p, s) => { mkdir(path.dirname(p)); fs.writeFileSync(p, s); };

export function parseSrt(input) {
  const stamp = s => {
    const m = s.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);
    if (!m) throw new Error('Invalid SRT timestamp: ' + s);
    return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / (10 ** m[4].length);
  };
  const out = [];
  for (const b of input.replace(/\r/g, '').trim().split(/\n\s*\n/)) {
    const lines = b.split('\n').map(s => s.trim()).filter(Boolean);
    const at = lines.findIndex(s => s.includes('-->'));
    if (at < 0) continue;
    const marks = lines[at].split(/\s*-->\s*/);
    if (marks.length !== 2) throw new Error('Bad SRT interval: ' + lines[at]);
    const start = stamp(marks[0]);
    const end = stamp(marks[1].split(/\s+/)[0]);
    if (end <= start) throw new Error('SRT end must follow start');
    const text = lines.slice(at + 1).join(' ').replace(/<[^>]*>/g, '').trim();
    if (text) out.push({ start, end, text });
  }
  out.sort((a, b) => a.start - b.start);
  if (!out.length) throw new Error('SRT contains no subtitle cues');
  return out;
}

export function buildScenes(cues, style = 'V1', character = '') {
  styleOf(style);
  const total = Math.max(...cues.map(c => c.end));
  // Equal target lengths with subtitle-aligned cuts whenever feasibility permits.
  let n = Math.ceil(total / 5);
  if (n > 1 && total / n < 3) n = Math.max(1, Math.floor(total / 3));
  const scenes = [];
  let start = 0;
  for (let i = 0; i < n; i++) {
    const left = n - i;
    const ideal = (total - start) / left;
    let end = total;
    if (left > 1) {
      const candidates = [...new Set(cues.map(c => round(c.end)))].filter(t => {
        const d = t - start, rem = total - t;
        return d >= 3 && d <= 6 && rem / (left - 1) >= 3 && rem / (left - 1) <= 6;
      });
      end = candidates.length
        ? candidates.sort((a, b) => Math.abs(a - start - ideal) - Math.abs(b - start - ideal))[0]
        : round(start + ideal);
    }
    const id = 'SC' + String(i + 1).padStart(3, '0');
    const assigned = cues.filter(c => (c.start + c.end) / 2 >= start && (c.start + c.end) / 2 < end);
    const candidates = assigned.length ? assigned : cues.filter(c => c.start < end && c.end > start);
    const text = candidates.map(c => c.text).join(' ').trim();
    scenes.push({
      id, start: round(start), end: round(end), text,
      // Animate every third scene by default. The rest use genuine artwork and gentle camera motion.
      // Edit mode to 'character' for any additional actions, or to 'graphic' for diagrams.
      mode: i % 3 === 0 ? 'character' : 'still', character_id: 'main',
      visual: text || 'The recurring character in a suitable everyday environment',
      action: DEFAULT_ACTION,
      image: 'images/' + id + '.png', end_image: null,
      video: 'clips/' + id + '.mp4',
    });
    start = end;
  }
  return { version: 2, style, character, fps: FPS, width: WIDTH, height: HEIGHT, batch_size: BATCH_SIZE, scenes };
}

function argsOf(argv) {
  const pos = [], opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      if (['execute', 'draft', 'allow-stills', 'frames', 'dryrun'].includes(k)) opt[k] = true;
      else { if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error('Missing value for --' + k); opt[k] = argv[++i]; }
    } else pos.push(a);
  }
  return { pos, opt };
}
function files(project) {
  const base = path.resolve(project);
  return { base, motion: path.join(base, 'motion'), plan: path.join(base, 'motion/scenes.json'), progress: path.join(base, 'motion/progress.json') };
}
function local(base, rel) {
  if (typeof rel !== 'string' || !rel) throw new Error('Missing asset path');
  const target = path.resolve(base, rel);
  if (!target.startsWith(base + path.sep)) throw new Error('Asset path must stay within project: ' + rel);
  return target;
}
function planAt(f) {
  const p = json(f.plan);
  if (!Array.isArray(p.scenes) || !p.scenes.length) throw new Error('Missing scenes in ' + f.plan);
  const ids = new Set();
  let prev = 0;
  for (const s of p.scenes) {
    if (!/^SC\d{3,}$/.test(s.id) || ids.has(s.id)) throw new Error('Duplicate/invalid scene id: ' + s.id);
    ids.add(s.id);
    if (Math.abs(s.start - prev) > 0.025 || !(s.end > s.start)) throw new Error(s.id + ': gap, overlap or invalid duration');
    if (!['character', 'still', 'graphic'].includes(s.mode)) throw new Error(s.id + ': invalid mode');
    local(f.base, s.image);
    if (s.end_image) local(f.base, s.end_image);
    local(f.base, s.video);
    prev = s.end;
  }
  return p;
}
function progressAt(f) { return exists(f.progress) ? json(f.progress) : { clips: {}, approved: {} }; }
function run(cmd, argv, allowFailure = false) {
  const x = spawnSync(cmd, argv, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (x.error || (x.status !== 0 && !allowFailure))
    throw new Error(cmd + ' failed: ' + (x.error?.message || x.stderr || x.stdout || String(x.status)));
  return x;
}
export function probe(file) {
  const x = run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height,avg_frame_rate:format=duration', '-of', 'json', file]);
  const v = JSON.parse(x.stdout);
  const stream = (v.streams || []).find(s => s.codec_type === 'video') || {};
  const fps = (stream.avg_frame_rate || '0/1').split('/').map(Number);
  return { duration: Number(v.format?.duration || 0), width: Number(stream.width || 0), height: Number(stream.height || 0), fps: fps[1] ? fps[0] / fps[1] : 0 };
}
function secs(s) { return round(s.end - s.start); }
function imageType(file) {
  const e = path.extname(file).toLowerCase();
  const types = { '.png': 'image/png', '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
  if (!types[e]) throw new Error('Unsupported image extension: ' + file);
  return types[e];
}
function init(f, o) {
  if (!o.srt || !o.voice) throw new Error('init requires --srt and --voice');
  if (exists(f.plan)) throw new Error('Project already has a motion plan. Back it up before reinitializing: ' + f.plan);
  const srt = path.resolve(o.srt), voice = path.resolve(o.voice);
  if (!exists(srt) || !exists(voice)) throw new Error('SRT or voice file is missing');
  const style = (o.style || 'V1').toUpperCase();
  const identity = o.character || 'An expressive, healthy-looking Spanish adult aged around 68, consistent hair, face and everyday outfit across scenes; do not wear a white medical coat';
  const p = buildScenes(parseSrt(fs.readFileSync(srt, 'utf8')), style, identity);
  p.source_srt = 'transcript/subtitles.srt';
  p.voice = 'audio/voice' + path.extname(voice).toLowerCase();
  mkdir(f.motion);
  mkdir(path.join(f.base, 'audio')); mkdir(path.join(f.base, 'transcript'));
  mkdir(path.join(f.base, 'images')); mkdir(path.join(f.base, 'clips'));
  fs.copyFileSync(srt, local(f.base, p.source_srt));
  if (path.resolve(voice) !== local(f.base, p.voice)) fs.copyFileSync(voice, local(f.base, p.voice));
  save(f.plan, p);
  save(f.progress, { clips: {}, approved: {} });
  console.log('Created ' + p.scenes.length + ' scenes; ' + Math.ceil(p.scenes.length / BATCH_SIZE) + ' image batches.');
  console.log('Edit visual/action/mode in ' + f.plan + '. Then: batch ' + f.base);
}
function batch(f, p, index) {
  const b = Number(index || 1);
  if (!Number.isInteger(b) || b < 1) throw new Error('Batch index must be a positive integer');
  const chosen = p.scenes.slice((b - 1) * BATCH_SIZE, b * BATCH_SIZE);
  if (!chosen.length) throw new Error('Batch ' + b + ' does not exist');
  const dir = path.join(f.motion, 'batches');
  mkdir(dir);
  const slug = 'batch_' + String(b).padStart(3, '0');
  const motionInstructions = chosen.filter(s => s.mode === 'character').map(s =>
    '## ' + s.id + ' — ' + secs(s) + ' seconds\nFirst frame: ' + s.image + '\nResult: ' + s.video + '\n\n' + movingPrompt(s, p.style, p.character) + '\n').join('\n');
  write(path.join(dir, slug + '_motion_prompts.md'), '# Manual/optional image-to-video prompts\n\n' + motionInstructions);
  const prompt = chosen.map((s, i) => [
    '### ' + s.id + ' (' + (i + 1) + '/' + chosen.length + ')',
    'Vietnamese scene guide: ' + s.text,
    'File: ' + s.image,
    'Image prompt (copy and paste):',
    stillPrompt(s, p.style, p.character),
    'Action to animate: ' + s.action,
  ].join('\n')).join('\n\n---\n\n');
  write(path.join(dir, slug + '_prompts.md'), '# ' + slug + ' — ' + p.style + '\n\n' + prompt + '\n');
  write(path.join(dir, slug + '_scene_text.txt'), chosen.map((s, i) => String(i + 1) + '. ' + s.text).join('\n') + '\n');
  write(path.join(dir, slug + '_agent.md'), [
    '# Agent instructions — ONE BATCH ONLY',
    'Generate exactly ' + chosen.length + ' high-quality 16:9 scene images in the approved ' + p.style + ' style.',
    'Keep character identity, colors, wardrobe and anatomy consistent.',
    'Rename each image exactly ' + chosen.map(s => s.id + '.png').join(', ') + '.',
    'Then, for approved character scenes, produce natural moving MP4s using the separate motion prompts. Use an image-to-video tool that you choose; NEVER create paid clips without permission.',
    'Move finished images to the video Collection (or images/ folder). Do NOT generate videos yet.',
    'Check hands, legs, faces, Spanish text leakage, backgrounds and decorative external frame.',
    'STOP after this single batch; ask the owner for OK before the next batch.',
  ].join('\n') + '\n');
  console.log('Wrote ' + slug + ' (images ' + chosen[0].id + ' .. ' + chosen.at(-1).id + '). STOP and review.');
}
async function uploadImage(fal, filename) {
  const data = fs.readFileSync(filename);
  if (data.length > 20 * 1024 * 1024) throw new Error('Image exceeds model input size 20 MB');
  return fal.storage.upload(new File([data], path.basename(filename), { type: imageType(filename) }));
}
async function animate(f, p, o) {
  const batchIndex = Number(o.batch || 1);
  const max = Number(o.max || 1);
  if (!Number.isInteger(batchIndex) || batchIndex < 1 || !Number.isInteger(max) || max < 1 || max > BATCH_SIZE)
    throw new Error('Use --batch N and --max 1..20');
  const pending = p.scenes.slice((batchIndex - 1) * BATCH_SIZE, batchIndex * BATCH_SIZE)
    .filter(s => s.mode === 'character' && !exists(local(f.base, s.video)) && exists(local(f.base, s.image)))
    .slice(0, max);
  if (!pending.length) { console.log('No pending animated scenes with first-frame images in this batch'); return; }
  for (const s of pending) console.log(s.id + ' ' + secs(s) + 's: ' + movingPrompt(s, p.style, p.character));
  if (!o.execute) { console.log('DRY RUN ONLY. To pay for AI generation, set FAL_KEY and explicitly pass --execute. Default max=1 clip.'); return; }
  if (!process.env.FAL_KEY) throw new Error('FAL_KEY is required for paid AI generation; do not put it in Git');
  const { fal } = await import('@fal-ai/client');
  const state = progressAt(f);
  for (const s of pending) {
    try {
      const image_url = await uploadImage(fal, local(f.base, s.image));
      const end_image_url = s.end_image && exists(local(f.base, s.end_image))
        ? await uploadImage(fal, local(f.base, s.end_image)) : undefined;
      const input = {
        image_url, prompt: movingPrompt(s, p.style, p.character),
        duration: Math.max(2, Math.min(15, Math.ceil(secs(s)))),
        resolution: o.resolution === '1080p' ? '1080p' : '720p',
        negative_prompt: NEGATIVE,
        enable_prompt_expansion: false,
        enable_safety_checker: true,
      };
      if (end_image_url) input.end_image_url = end_image_url;
      console.log('Generating ' + s.id + ' using ' + MODEL);
      const result = await fal.subscribe(MODEL, { input, logs: true });
      const url = result.data?.video?.url;
      if (!url || !url.startsWith('https://')) throw new Error('No secure MP4 URL in model response');
      const response = await fetch(url);
      if (!response.ok || !response.body) throw new Error('Download failed: HTTP ' + response.status);
      const destination = local(f.base, s.video);
      mkdir(path.dirname(destination));
      const tmp = destination + '.partial';
      try {
        await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(tmp));
        fs.renameSync(tmp, destination);
      } finally { if (exists(tmp)) fs.unlinkSync(tmp); }
      state.clips[s.id] = { status: 'generated', model: MODEL, request_id: result.requestId || '', generated_at: new Date().toISOString() };
      delete state.approved[s.id];
      save(f.progress, state);
      console.log('Saved ' + destination + '; now run qa then manually approve.');
    } catch (err) {
      state.clips[s.id] = { status: 'error', reason: String(err.message || err).slice(0,500) };
      save(f.progress, state);
      console.error(s.id + ' ERROR: ' + state.clips[s.id].reason);
      process.exitCode = 1;
    }
  }
}
function qa(f, p, makeFrames = false) {
  const state = progressAt(f);
  const report = { generated_at: new Date().toISOString(), scenes: [], errors: 0, warnings: 0 };
  const qadir = path.join(f.motion, 'qa');
  mkdir(qadir);
  for (const s of p.scenes) {
    const item = { id: s.id, mode: s.mode, issues: [], warnings: [], approved: !!state.approved[s.id] };
    const img = local(f.base, s.image);
    const vid = local(f.base, s.video);
    if (s.mode === 'character') {
      if (!exists(vid)) item.issues.push('Missing moving-character MP4');
      else {
        try {
          const x = probe(vid);
          item.video = x;
          if (x.duration + 0.16 < secs(s)) item.issues.push('Clip too short: ' + x.duration + ' s for scene ' + secs(s) + ' s');
          if (x.width < 720 || x.height < 400) item.issues.push('Very low video resolution');
          if (x.height && Math.abs(x.width / x.height - 16 / 9) > 0.12) item.warnings.push('Video is not 16:9; renderer will crop');
          if (x.fps < 12) item.issues.push('Video has too few frames per second');
          // Freeze detection is a warning: a deliberate hold may legitimately be still.
          const fr = run('ffmpeg', ['-v', 'info', '-i', vid, '-vf', 'freezedetect=n=-50dB:d=0.9', '-an', '-f', 'null', '-'], true);
          const freezeCount = (fr.stderr.match(/freeze_start:/g) || []).length;
          if (freezeCount) item.warnings.push('Detected ' + freezeCount + ' freeze interval(s); inspect motion manually');
          if (makeFrames) {
            for (const frac of [0.12, 0.5, 0.88]) {
              const at = Math.max(0, Math.min(x.duration - 0.1, x.duration * frac));
              run('ffmpeg', ['-v', 'error', '-y', '-ss', String(at), '-i', vid, '-frames:v', '1',
                path.join(qadir, s.id + '_' + String(Math.round(frac * 100)) + '.jpg')]);
            }
          }
        } catch (err) { item.issues.push('Could not probe clip: ' + String(err.message || err)); }
      }
    } else if (!exists(img)) item.issues.push('Missing still/graphic image');
    report.errors += item.issues.length;
    report.warnings += item.warnings.length;
    report.scenes.push(item);
  }
  save(path.join(qadir, 'report.json'), report);
  console.log('QA: ' + report.errors + ' error(s), ' + report.warnings + ' warning(s). Human review required for every body-motion scene.');
  for (const s of report.scenes.filter(s => s.issues.length || s.warnings.length))
    console.log(s.id + ': ' + [...s.issues, ...s.warnings].join('; '));
  if (report.errors) process.exitCode = 1;
}
function approve(f, p, ids) {
  if (!ids.length) throw new Error('approve requires explicit SC### scene ids after viewing QA frames');
  const scenes = new Map(p.scenes.map(s => [s.id, s]));
  const state = progressAt(f);
  for (const id of ids) {
    const s = scenes.get(id);
    if (!s || s.mode !== 'character' || !exists(local(f.base, s.video))) throw new Error('No character motion clip for ' + id);
    state.approved[id] = { at: new Date().toISOString(), file_bytes: fs.statSync(local(f.base, s.video)).size };
  }
  save(f.progress, state);
  console.log('Approved ' + ids.join(', ') + ' after manual review. Changed clip files must be re-approved.');
}
function render(f, p, o) {
  const scenes = o['max-scenes'] ? p.scenes.slice(0, Number(o['max-scenes'])) : p.scenes;
  if (!scenes.length) throw new Error('No scenes to render');
  const state = progressAt(f);
  const voice = local(f.base, p.voice);
  if (!exists(voice)) throw new Error('Voice missing: ' + voice);
  const issues = [];
  for (const s of scenes) {
    const vid = local(f.base, s.video), img = local(f.base, s.image);
    if (s.mode === 'character' && !exists(vid) && !o['allow-stills']) issues.push(s.id + ': moving clip missing');
    if ((s.mode !== 'character' || !exists(vid)) && !exists(img)) issues.push(s.id + ': image missing');
    if (s.mode === 'character' && exists(vid) && !o.draft) {
      const approval = state.approved[s.id];
      if (!approval || approval.file_bytes !== fs.statSync(vid).size) issues.push(s.id + ': manual motion QA approval missing/stale');
    }
  }
  if (issues.length) throw new Error('Cannot render: ' + issues.slice(0,15).join(', ') + (issues.length > 15 ? ' ...' : ''));
  if (o.dryrun) { console.log('Validated ' + scenes.length + ' scenes; no render executed'); return; }
  const dir = path.join(f.motion, 'render');
  mkdir(dir);
  const entries = [];
  for (const s of scenes) {
    const clip = local(f.base, s.video);
    const animated = s.mode === 'character' && exists(clip);
    const source = animated ? clip : local(f.base, s.image);
    const target = path.join(dir, s.id + '.mp4');
    const frames = Math.max(1, Math.round(secs(s) * FPS));
    let argv;
    if (animated) {
      const info = probe(source);
      if (info.duration + 0.16 < secs(s)) throw new Error(s.id + ': motion clip too short for narration');
      argv = ['-v', 'error', '-y', '-i', source, '-vf',
        'fps=' + FPS + ',scale=' + WIDTH + ':' + HEIGHT + ':force_original_aspect_ratio=increase,crop=' + WIDTH + ':' + HEIGHT + ',setsar=1,format=yuv420p',
        '-frames:v', String(frames)];
    } else {
      argv = ['-v', 'error', '-y', '-loop', '1', '-framerate', String(FPS), '-i', source,
        '-vf', 'scale=2048:1152:force_original_aspect_ratio=increase,crop=2048:1152,zoompan=z=min(zoom+0.00015\\,1.05):d=1:s=1920x1080:fps=30,format=yuv420p',
        '-frames:v', String(frames)];
    }
    argv.push('-an', '-c:v', 'libx264', '-preset', o.draft ? 'ultrafast' : 'veryfast',
      '-crf', o.draft ? '24' : '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), target);
    console.log('Render ' + s.id + ' (' + (animated ? 'real motion' : 'still') + ')');
    run('ffmpeg', argv);
    entries.push(target);
  }
  const list = path.join(dir, 'concat.txt');
  write(list, entries.map(t => "file '" + t.replace(/'/g, "'\\''") + "'").join('\n') + '\n');
  const video = path.join(dir, 'silent.mp4');
  run('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video]);
  const out = o.output ? path.resolve(o.output) : path.join(f.base, 'out', o.draft ? 'preview_v2.mp4' : 'final_v2.mp4');
  mkdir(path.dirname(out));
  run('ffmpeg', ['-v', 'error', '-y', '-i', video, '-i', voice, '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-af', 'loudnorm=I=-14:TP=-1.5',
    '-shortest', '-movflags', '+faststart', out]);
  console.log('Wrote ' + out + '. Source AI clip audio was intentionally excluded; narration appears once.');
}
function status(f, p) {
  const state = progressAt(f);
  const counts = { scenes: p.scenes.length, image: 0, animated: 0, approved: 0, still: 0 };
  for (const s of p.scenes) {
    if (exists(local(f.base, s.image))) counts.image++;
    if (s.mode !== 'character') counts.still++;
    if (s.mode === 'character' && exists(local(f.base, s.video))) {
      counts.animated++;
      if (state.approved[s.id]?.file_bytes === fs.statSync(local(f.base, s.video)).size) counts.approved++;
    }
  }
  console.log(JSON.stringify({ style: p.style, counts, image_batches: Math.ceil(p.scenes.length / BATCH_SIZE) }, null, 2));
}
export async function main(argv = process.argv.slice(2)) {
  const { pos, opt } = argsOf(argv);
  const [cmd, project, ...ids] = pos;
  if (!cmd || !project) throw new Error('Usage: motion_v2.mjs init|batch|animate|qa|approve|render|status PROJECT [options]');
  const f = files(project);
  if (cmd === 'init') return init(f, opt);
  const p = planAt(f);
  if (cmd === 'batch') return batch(f, p, opt.index);
  if (cmd === 'animate') return animate(f, p, opt);
  if (cmd === 'qa') return qa(f, p, !!opt.frames);
  if (cmd === 'approve') return approve(f, p, ids);
  if (cmd === 'render') return render(f, p, opt);
  if (cmd === 'status') return status(f, p);
  throw new Error('Unknown command: ' + cmd);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error('ERROR: ' + e.message); process.exitCode = 1; });
}
