/**
 * Import images uploaded by the owner into a HealthyXZZS project for
 * first-frame-to-video generation.
 *
 * Scene identity is EXPLICIT (SC001.png etc), never guessed from appearance
 * or file order. Importing images does not call a paid model.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ACCEPTED = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const MAX_BYTES = 20 * 1024 * 1024;

const checksum = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const fileInside = (base, relative) => {
  const abs = path.resolve(base, relative);
  if (!abs.startsWith(path.resolve(base) + path.sep))
    throw new Error('Image path escapes project: ' + relative);
  return abs;
};
const validImage = file => {
  const ext = path.extname(file).toLowerCase();
  if (!ACCEPTED.has(ext)) throw new Error('Use PNG, JPEG or WEBP, not ' + ext);
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Image must be an ordinary file: ' + file);
  if (!stat.size || stat.size > MAX_BYTES) throw new Error('Image must be 1 byte to 20 MB: ' + file);
  const fd = fs.openSync(file, 'r');
  const signature = Buffer.alloc(12);
  try { fs.readSync(fd, signature, 0, 12, 0); }
  finally { fs.closeSync(fd); }
  const png = signature.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg = signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  const webp = signature.toString('ascii', 0, 4) === 'RIFF' && signature.toString('ascii', 8, 12) === 'WEBP';
  if (!(ext === '.png' && png || (ext === '.jpg' || ext === '.jpeg') && jpg || ext === '.webp' && webp))
    throw new Error('Image contents do not match its PNG/JPEG/WEBP extension: ' + file);
  return ext;
};

function inputPairs(src, sceneId) {
  if (!fs.existsSync(src)) throw new Error('Image path not found: ' + src);
  if (fs.lstatSync(src).isSymbolicLink()) throw new Error('Symbolic link input is not allowed');
  if (fs.statSync(src).isFile()) {
    const fromName = path.basename(src).match(/^(SC\d{3,})\.(png|jpg|jpeg|webp)$/i)?.[1]?.toUpperCase();
    const id = sceneId ? String(sceneId).toUpperCase() : fromName;
    if (!id || !/^SC\d{3,}$/.test(id))
      throw new Error('For a single unnamed photo use --scene SC001, or name it SC001.png');
    return [{ id, src }];
  }
  if (sceneId) throw new Error('--scene is only accepted for a single --from IMAGE_FILE, not a folder');
  if (!fs.statSync(src).isDirectory()) throw new Error('Expected an image file or a directory: ' + src);
  const names = fs.readdirSync(src).filter(name => ACCEPTED.has(path.extname(name).toLowerCase())).sort();
  if (!names.length) throw new Error('No PNG/JPEG/WEBP files found in ' + src);
  return names.map(name => {
    const m = name.match(/^(SC\d{3,})(?:[._-].*)?\.(png|jpg|jpeg|webp)$/i);
    if (!m) throw new Error('Cannot identify scene for "' + name + '". Rename to SC001.png or supply a single file with --scene SC001');
    return { id: m[1].toUpperCase(), src: path.join(src, name) };
  });
}

/**
 * All validations run before writing, to prevent accidentally swapping scenes
 * or overwriting user work when a batch has multiple images.
 */
export function importSceneImages({ project, plan, source, batch = 1, sceneId = null, replace = false }) {
  const root = path.resolve(project);
  const sourcePath = path.resolve(source);
  const b = Number(batch);
  if (!Number.isInteger(b) || b < 1) throw new Error('--batch must be a positive integer');
  const scenes = plan.scenes.slice((b - 1) * 20, b * 20);
  if (!scenes.length) throw new Error('Batch ' + b + ' does not exist');
  const known = new Map(scenes.map(s => [s.id, s]));
  const pairs = inputPairs(sourcePath, sceneId);
  const seen = new Set();
  const changes = [];
  for (const pair of pairs) {
    if (seen.has(pair.id)) throw new Error('Two images map to ' + pair.id + ': refuse ambiguous import');
    seen.add(pair.id);
    const scene = known.get(pair.id);
    if (!scene) throw new Error(pair.id + ' is not in batch ' + b + ' of this project');
    const ext = validImage(pair.src);
    const destRel = 'images/' + pair.id + ext;
    const target = fileInside(root, destRel);
    const oldTarget = fileInside(root, scene.image);
    const video = fileInside(root, scene.video);
    const hash = checksum(pair.src);
    const oldExists = fs.existsSync(oldTarget);
    const targetExists = fs.existsSync(target);
    const sameAsCurrent = oldExists && checksum(oldTarget) === hash;
    const existingSame = sameAsCurrent || (targetExists && checksum(target) === hash);
    if (oldExists && !existingSame && !replace) {
      throw new Error(pair.id + ' already has a DIFFERENT image (' + scene.image + '). Use --replace-images only after reviewing the replacement.');
    }
    if (targetExists && !existingSame && !replace) {
      throw new Error(pair.id + ': destination image exists and differs; use --replace-images after reviewing.');
    }
    if (fs.existsSync(video) && !sameAsCurrent) {
      throw new Error(pair.id + ' already has a generated video at ' + scene.video +
        '. Back up/remove that clip and explicitly re-import; never reuse a video from an outdated first frame.');
    }
    // If the current scene already points to identical image data, preserve its
    // path and avoid touching files unnecessarily.
    const rel = oldExists && checksum(oldTarget) === hash ? scene.image : destRel;
    changes.push({ id: pair.id, from: pair.src, to: fileInside(root, rel),
      rel, sha256: hash, bytes: fs.statSync(pair.src).size,
      alreadyPresent: fs.existsSync(fileInside(root, rel)) && checksum(fileInside(root, rel)) === hash });
  }

  let changed = false;
  for (const item of changes) {
    if (!item.alreadyPresent) {
      fs.mkdirSync(path.dirname(item.to), { recursive: true });
      if (path.resolve(item.from) !== item.to) fs.copyFileSync(item.from, item.to);
      changed = true;
    }
    const targetScene = known.get(item.id);
    if (targetScene.image !== item.rel) {
      targetScene.image = item.rel;
      changed = true;
    }
  }
  if (changed) {
    const planFile = path.join(root, 'motion/scenes.json');
    fs.writeFileSync(planFile, JSON.stringify(plan, null, 2) + '\n');
    const progressFile = path.join(root, 'motion/progress.json');
    const state = fs.existsSync(progressFile) ? JSON.parse(fs.readFileSync(progressFile, 'utf8')) : { clips: {}, approved: {} };
    if (!state.approved) state.approved = {};
    if (!state.clips) state.clips = {};
    for (const item of changes) {
      delete state.approved[item.id];
      if (!item.alreadyPresent) delete state.clips[item.id];
    }
    fs.writeFileSync(progressFile, JSON.stringify(state, null, 2) + '\n');
  }
  const report = {
    version: 1, batch: b, source_name: path.basename(sourcePath),
    items: changes.map(({ id, rel, bytes, sha256, alreadyPresent }) =>
      ({ id, image: rel, bytes, sha256, status: alreadyPresent ? 'unchanged' : 'imported' })),
  };
  const destReport = path.join(root, 'motion/imports', 'batch_' + String(b).padStart(3,'0') + '.json');
  fs.mkdirSync(path.dirname(destReport), { recursive: true });
  fs.writeFileSync(destReport, JSON.stringify(report, null, 2) + '\n');
  return report;
}
