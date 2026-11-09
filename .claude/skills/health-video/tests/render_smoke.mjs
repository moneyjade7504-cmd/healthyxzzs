import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/motion_v2.mjs', import.meta.url));
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'motion-v2-smoke-'));
const project = path.join(root, 'project');
const exec = (cmd, args) => {
  const p = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  if (p.status !== 0) throw new Error(cmd + ' failed: ' + (p.stderr || p.stdout));
  return p.stdout;
};
const cli = (...args) => exec(process.execPath, [script, ...args]);
try {
  fs.mkdirSync(project, { recursive: true });
  const srt = path.join(root, 'subtitle.srt');
  const voice = path.join(root, 'voice.mp3');
  fs.writeFileSync(srt, '1\n00:00:00,000 --> 00:00:04,000\nLevanta el brazo despacio.\n\n2\n00:00:04,000 --> 00:00:08,000\nDescansa y respira.\n');
  exec('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=8', '-c:a', 'libmp3lame', voice]);
  cli('init', project, '--srt', srt, '--voice', voice, '--style', 'V1');
  const plan = JSON.parse(fs.readFileSync(path.join(project, 'motion/scenes.json'), 'utf8'));
  assert.equal(plan.scenes.length, 2, '8 seconds should produce two scenes');
  const png = path.join(root, 'still.png');
  exec('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=lightblue:s=640x360', '-frames:v', '1', png]);
  for (const s of plan.scenes) fs.copyFileSync(png, path.join(project, s.image));
  const video = path.join(project, plan.scenes[0].video);
  exec('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=30:duration=4.2',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', video]);
  cli('qa', project, '--frames');
  cli('approve', project, plan.scenes[0].id);
  cli('render', project, '--draft');
  const out = path.join(project, 'out/preview_v2.mp4');
  assert.ok(fs.statSync(out).size > 10000, 'rendered video must not be empty');
  const info = JSON.parse(exec('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type', '-of', 'json', out]));
  assert.ok(info.streams.some(s => s.codec_type === 'video'));
  assert.ok(info.streams.some(s => s.codec_type === 'audio'));
  assert.ok(Math.abs(+info.format.duration - 8) < 0.25, 'output duration must follow SRT');
  process.stdout.write('Motion V2 smoke PASS: moving MP4 + still + narrator combined into 8-second video\n');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
