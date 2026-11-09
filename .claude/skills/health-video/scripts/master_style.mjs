/**
 * User-supplied Master Style adapter for HealthyXZZS.
 *
 * A master can be a JSON design profile, a picture, or both. No AI style
 * extraction is claimed: reference images must be supplied to an image model
 * with reference support; the prompt explicitly tells the agent which file.
 *
 * JSON style fields: id, label, image, graphic?, motion?, negative?,
 * reference_images? and character_references?.
 */
import fs from 'node:fs';
import path from 'node:path';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_REFERENCES = 8;
const safeText = (value, key, { optional = false } = {}) => {
  if (value == null && optional) return '';
  if (typeof value !== 'string' || (!optional && !value.trim()) || value.length > 12000)
    throw new Error('Master style field "' + key + '" must be non-empty text shorter than 12000 chars');
  return value.trim();
};
function checkedArray(value, name) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.some(x => typeof x !== 'string' || !x.trim()) || value.length > MAX_REFERENCES)
    throw new Error(name + ' must be an array of up to ' + MAX_REFERENCES + ' image filenames');
  return value;
}
function copyRefs(paths, fromDirectory, project, type) {
  const out = [];
  const targetFolder = path.resolve(project, 'motion/master');
  fs.mkdirSync(targetFolder, { recursive: true });
  for (let i = 0; i < paths.length; i++) {
    const source = path.resolve(fromDirectory, paths[i]);
    if (!fs.existsSync(source) || !fs.statSync(source).isFile())
      throw new Error('Master reference not found: ' + source);
    const extension = path.extname(source).toLowerCase();
    if (!IMAGE_EXTS.has(extension))
      throw new Error('Unsupported master reference image ' + source + ' (use PNG/JPG/WEBP)');
    if (fs.statSync(source).size > MAX_IMAGE_BYTES)
      throw new Error('Master reference exceeds 20MB: ' + source);
    const destination = path.join(targetFolder, type + '_' + String(i + 1).padStart(2, '0') + extension);
    if (source !== destination) fs.copyFileSync(source, destination);
    out.push('motion/master/' + path.basename(destination));
  }
  return out;
}

export function prepareMasterStyle({ master, masterImage, characterImage, project }) {
  if (!master && !masterImage && !characterImage)
    throw new Error('Specify --master PATH.json and/or --master-image PATH.png');
  const file = master ? path.resolve(master) : null;
  let profile = {};
  if (file) {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error('Master JSON not found: ' + file);
    try { profile = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (e) { throw new Error('Invalid Master Style JSON: ' + e.message); }
    if (!profile || Array.isArray(profile) || typeof profile !== 'object')
      throw new Error('Master Style JSON must contain an object');
  }
  const root = file ? path.dirname(file) : process.cwd();
  const image = profile.image || profile.style_prompt ||
    'Use the attached MASTER STYLE image as the absolute visual reference. Match its exact rendering medium, line work, color palette, lighting, shapes, texture, character design language and compositional conventions. Do not switch to the legacy HealthyXZZS preset.';
  const graphic = profile.graphic || profile.graphic_prompt ||
    'Draw the medical infographic or object illustration in the exact same artistic medium, palette, outlines, texture and compositional conventions as the MASTER STYLE reference image; anatomically accurate and no invented facts.';
  const motion = profile.motion || profile.motion_prompt ||
    'Animate the approved first frame in its exact original MASTER STYLE, with smooth plausible character actions. Preserve textures, lighting, shading, facial details, silhouettes, apparel and art medium through every frame; do not restyle or morph.';
  const id = safeText(profile.id || 'CUSTOM', 'id').replace(/[^a-z0-9_-]/gi, '_').slice(0, 64);
  const label = safeText(profile.label || 'User-provided MASTER STYLE', 'label');
  const negative = safeText(profile.negative || '', 'negative', { optional: true });
  const manifestStyles = checkedArray(profile.reference_images || profile.style_images, 'reference_images');
  const manifestCharacters = checkedArray(profile.character_references || profile.character_images, 'character_references');

  const styleRefs = copyRefs(
    masterImage ? [...manifestStyles.map(x => path.resolve(root, x)), path.resolve(masterImage)] :
      manifestStyles.map(x => path.resolve(root, x)),
    process.cwd(), project, 'style'
  );
  const charRefs = copyRefs(
    characterImage ? [...manifestCharacters.map(x => path.resolve(root, x)), path.resolve(characterImage)] :
      manifestCharacters.map(x => path.resolve(root, x)),
    process.cwd(), project, 'character'
  );
  const result = {
    id, label,
    image: safeText(image, 'image'),
    graphic: safeText(graphic, 'graphic'),
    motion: safeText(motion, 'motion'),
    negative,
    reference_images: styleRefs,
    character_references: charRefs,
  };
  if (result.reference_images.length + result.character_references.length === 0 &&
      !profile.image && !profile.style_prompt)
    throw new Error('Provide a descriptive style prompt or at least one reference image');
  return result;
}

export function masterReferenceInstructions(master, { motion = false } = {}) {
  if (!master) return '';
  const refs = master.reference_images || [];
  const characters = master.character_references || [];
  const parts = [
    'MASTER STYLE "' + master.label + '" (user supplied): use this exact art direction, not the default V1/V2.',
  ];
  if (refs.length) {
    parts.push('ATTACH these MASTER STYLE images to the image generator as visual reference files: ' + refs.join(', ') +
      '. Match their artistic medium and appearance. Filenames are LOCAL attachments, not URLs. Text alone does not load an image.');
  }
  if (characters.length) {
    parts.push('ATTACH these CHARACTER IDENTITY images: ' + characters.join(', ') +
      '. Preserve recognizable face, hairstyle, age, body type, outfit identity and character design throughout scenes.');
  }
  if (motion) parts.push('For image-to-video, use the approved rendered scene first frame. Reference images do not themselves animate.');
  return parts.join('\n');
}
