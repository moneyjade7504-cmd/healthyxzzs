/**
 * HealthyXZZS Living Scenes V5
 *
 * Produce ONE cohesive first-frame-driven image-to-video shot where the
 * character moves naturally and the already-visible background has subtle
 * secondary motion. No character rigging, scene cuts, hallucinated props or
 * paid calls in this module: it only generates instructions.
 */
import { styleOf } from './motion_style.mjs';

const settings = Object.freeze([
  { match: /park|garden|terrace|outdoor|market|street|path|balcony|exterior|jardin|parque/,
    suggestion: 'If present in the approved first frame, leaves, grass and small branches sway gently with a very light breeze; distant existing background elements have only natural small motion' },
  { match: /bedroom|bed|night|dormitorio|cama/,
    suggestion: 'If present in the approved first frame, a curtain edge shifts slightly in the faint air flow, and existing bedside-lamp illumination remains steady with barely perceptible natural shadow variation' },
  { match: /kitchen|dining|breakfast|comida|cocina|mesa/,
    suggestion: 'If steam already appears in the first frame, let that steam rise gently; if curtains are present, let them sway minimally; all utensils, dishes, food and furniture remain physically stable' },
  { match: /living|home|hallway|study|window|sitting|sala|salon|pasillo/,
    suggestion: 'If a curtain or indoor plant is visible, allow a barely noticeable soft movement; keep furniture and floor fixed, and preserve the existing window lighting' },
  { match: /clinic|consult|doctor|hospital|medico|consulta/,
    suggestion: 'Keep clinical furniture and equipment still; subtle natural breathing and quiet existing ambient details only if actually visible' },
  { match: /exercise|stairs|gym|fitness|entren|escalera|silla/,
    suggestion: 'Keep handrails, support chairs and exercise equipment perfectly fixed; only already-visible cloth and nearby natural foliage may have subtle secondary movement' },
]);

const clean = value => typeof value === 'string' ? value.trim() : '';
const oneLine = s => s.replace(/\s+/g, ' ').trim();

/**
 * A still scene can explicitly opt into moving *only its environment*:
 *   "mode": "still", "animate_environment": true
 * Character scenes are always eligible for animate-live.
 */
export function liveEligible(scene) {
  return scene?.mode === 'character' ||
    (scene?.mode === 'still' && scene?.animate_environment === true);
}

export function inferEnvironmentMotion(scene) {
  const explicit = clean(scene?.environment_motion);
  if (explicit) return oneLine(explicit);
  const context = [scene?.setting, scene?.environment].map(clean).join(' ').toLowerCase();
  const suggestion = settings.find(setting => setting.match.test(context));
  return suggestion?.suggestion ||
    'Maintain a living but restrained atmosphere: only secondary motion in background features already visible in the first frame, without inventing objects or moving rigid furniture';
}

export function livingScenePrompt(scene, styleName = 'V1', character = '', intensity = 'subtle') {
  if (!scene || !liveEligible(scene))
    throw new Error((scene?.id || 'Scene') + ': animate-live requires mode=character or mode=still with animate_environment=true');
  const style = styleOf(styleName);
  const level = clean(scene.motion_intensity) || intensity;
  if (!['subtle', 'balanced'].includes(level))
    throw new Error((scene.id || 'Scene') + ': motion_intensity must be subtle or balanced');
  const isCharacter = scene.mode === 'character';
  const action = clean(scene.action);
  if (isCharacter && !action)
    throw new Error((scene.id || 'Scene') + ': character animation requires one explicit scene.action');
  const motion = inferEnvironmentMotion(scene);
  return [
    'LIVING SCENE image-to-video animation. One continuous shot using the APPROVED FIRST FRAME as the exact starting image.',
    'MASTER ART DIRECTION: ' + style.motion,
    'Preserve the EXACT medium, color palette, texture, character anatomy/design, clothing, props, background layout and lighting of that first frame; do not restyle between frames.',
    clean(character) && isCharacter && 'CHARACTER IDENTITY: ' + clean(character) + '.',
    clean(scene.environment || scene.setting) && 'SCENE CONTEXT: ' + clean(scene.environment || scene.setting) + '.',
    clean(scene.shot) && 'FRAMING: keep the first frame’s ' + clean(scene.shot) + ' composition.',
    isCharacter
      ? 'PRIMARY CHARACTER ACTION: ' + action + '. Human characters must show natural anticipation, breathing, smooth weight shifts, realistic limb arcs, foot contact, balance, joint alignment and follow-through; no robotic jerks. Nonhuman or mascot characters must follow the approved master design and physically coherent motion language.'
      : 'ENVIRONMENT-ONLY SHOT: preserve the foreground composition; do not invent walking, gesturing or speaking characters. Any visible people remain naturally still except for subtle breathing.',
    'SECONDARY ENVIRONMENT MOTION: ' + motion + '.',
    level === 'subtle'
      ? 'AMBIENT MOTION STRENGTH: very subtle, no more than is naturally plausible. Main action is always the focus; surroundings move gently and do not distract.'
      : 'AMBIENT MOTION STRENGTH: balanced but restrained natural movement, always subordinate to the main action and without exaggerated wind or dramatic lighting effects.',
    'Conserve stable objects, floor, walls, chairs, tables, windows, props and perspective. Only animate elements already visible in the source image; never generate new objects, people, animals, steam or foliage.',
    'Keep the camera FIXED and continuous throughout this clip. A new camera angle or location belongs to a DIFFERENT shot, not a mid-clip morph. No camera shake, cuts, sudden zooms, or drifting perspective.',
    'If this scene demonstrates exercise or symptoms, follow the approved medical and movement guidance; do not exaggerate a medical effect or invent claims.',
    'A single coherent action across the clip, stable temporal identity, coherent hands and face. No rubber limbs, extra fingers, flicker, ghosting, melting, background warping, random object motion, garbled text, labels, logos or watermarks.',
  ].filter(Boolean).join(' ');
}
