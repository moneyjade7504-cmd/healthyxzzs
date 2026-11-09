// Shared visual DNA for character image generation and motion generation.
// Keep every prompt self-contained; image/video models do not remember preceding scenes.
export const STYLE = Object.freeze({
  V1: {
    label: 'HEALTH_CARTOON V1 · pastel editorial',
    image: 'Beautiful hand-drawn 2D educational cartoon, Spanish older adult aged 60-75 with expressive but natural face, recognisable mature proportions, elegant everyday clothing, pleasing pastel colors with moderate saturation, clean dark outlines, subtle cel shading, believable room depth, one clear focal point. Full-bleed 16:9 illustration, a thin decorative picture-frame-style border OVERLAID at the OUTER FOUR EDGES. The picture continues beneath the border. This is NOT a card, NOT a rounded panel and NOT white margins.',
    motion: 'Preserve the exact illustrated 2D style, face, outfit, body proportions, border and background. Natural human timing and weight transfer; smooth controlled movement with realistic joint motion, subtle cloth follow-through. Locked camera. The decorative outer picture border remains fixed and visible.',
  },
  V2: {
    label: 'HEALTH_CARTOON V2 · vivid editorial',
    image: 'Beautiful richly detailed 2D cartoon explainer of a Spanish adult aged 60-75, expressive mature face, clearly readable anatomy and everyday clothing, confident saturated colors and stronger contrast, crisp controlled outlines, careful two-tone soft shading and foreground/background depth. Full-bleed 16:9 art with a restrained organic/curved editorial frame at the OUTER EDGES, overlay on the illustration, not a panel. NO photorealism or 3D.',
    motion: 'Keep the original vivid 2D illustration, precise clean outlines, same mature character and clothes, stable lighting, curved outer-edge frame and room. Smooth believable weight shifts, body mechanics, natural follow-through; fixed camera. No 3D transformation.',
  },
  LEGACY: {
    label: 'Original blue mannequin',
    image: 'Original channel house style: detailed 2D flat/cel-shaded health explainer illustration, adult blue mannequin with glowing white eyes, consistent proportions, expressive posture, clean bold outlines, cream #F5ECD7 background, 16:9, one focal point.',
    motion: 'Keep the exact original illustrated blue mannequin, white eyes, contours, anatomy, cream background and scale. Controlled physically plausible exercise movement, fixed camera, natural limb arcs. Never rotate flat cardboard cut-out limbs.',
  },
});

export const NEGATIVE = 'morphing, melting, extra limbs, extra hands, missing fingers, deformed legs, broken joints, face swap, outfit change, flicker, shaky camera, rubber anatomy, unnatural bends, inconsistent character, photorealism, 3D render, gibberish text, logos, watermark';

export function styleOf(name = 'V1') {
  const s = STYLE[String(name).toUpperCase()];
  if (!s) throw new Error('Unknown style ' + name + '. Choose V1, V2 or LEGACY.');
  return s;
}

const clean = x => typeof x === 'string' ? x.trim() : '';

/**
 * Scene-specific prompt: the master channel aesthetic remains constant while
 * perspective, location, layout, activity and editorial technique can vary.
 * The subject of the SRT remains authoritative; no miraculous outcomes.
 */
function sceneDirection(scene) {
  const parts = [
    clean(scene.setting) && 'LOCATION: ' + clean(scene.environment || scene.setting) + '.',
    clean(scene.framing) && 'FRAMING: ' + clean(scene.framing) + '.',
    clean(scene.shot) && 'SHOT TYPE: ' + clean(scene.shot) + '.',
    clean(scene.treatment) && 'VISUAL TREATMENT: ' + clean(scene.treatment) + '.',
    clean(scene.lighting) && 'LIGHT: ' + clean(scene.lighting) + '.',
    clean(scene.palette_treatment) && 'COLOR ACCENT: ' + clean(scene.palette_treatment) + '.',
    clean(scene.mood) && 'MOOD: ' + clean(scene.mood) + '.',
    clean(scene.object) && 'FOCUS OBJECT: ' + clean(scene.object) + '.',
  ];
  return parts.filter(Boolean).join('\n');
}

export function stillPrompt(scene, styleName = 'V1', character = '') {
  const s = styleOf(styleName);
  const graphic = scene.mode === 'graphic';
  const identity = graphic ?
    'No recurring human character required: show only the relevant medical infographic/objects without adding an irrelevant person.' :
    (character ? 'IDENTITY LOCK: ' + character + '.' : 'Use the exact approved master character reference, same face, body type and age.');
  const characterRule = graphic ?
    'Use correct anatomy and responsible educational symbolism; no misleading numerical labels or invented improvements.' :
    'Keep the recurring person recognisable. ' + clean(scene.wardrobe || 'Retain their signature outfit') +
      '. If the entire body is in frame: exactly one head, two arms, two legs, two hands, two feet, anatomically correct elbows and knees. No default idle standing pose.';
  return [
    graphic ? [
      'Full-bleed 2D medical/educational graphic in the same color palette, line quality, modest soft shading, and decorative OUTER EDGE frame as this channel.',
      s.image,
      'OVERRIDE for this infographic: depict only the contextually relevant anatomical insert, graph or object; NO main human character.'
    ].join(' ') : s.image,
    identity,
    sceneDirection(scene),
    'WHAT TO SHOW: ' + (scene.visual || scene.text || 'One clear complete educational concept') + '.',
    'VOICE MEANING (do not draw these words): ' + clean(scene.text) + '.',
    characterRule,
    'The overall channel identity and clean 2D illustration method remain uniform across scenes, but staging, setting, shot scale and editorial treatment must NOT repeat monotonously.',
    'Do NOT repeat the exact environment, outfit pose, prop arrangement, and camera position of the previous shot.',
    'Full-bleed widescreen 16:9, high resolution. NO text or baked captions, NO logos, NO brands, NO watermarks. Text is composited later in the video editor.',
  ].filter(Boolean).join('\n');
}

export function movingPrompt(scene, styleName = 'V1', character = '') {
  const s = styleOf(styleName);
  const action = clean(scene.action);
  if (!action) throw new Error(scene.id + ': add an explicit action before animating.');
  if (scene.mode === 'graphic') throw new Error(scene.id + ': graphic scene has no human movement. Set mode=character if appropriate.');
  return [
    s.motion,
    character ? 'Recurring person identity (from reference image): ' + character + '.' : 'Keep character identity identical to the supplied approved first frame.',
    clean(scene.setting) && 'The existing first-frame scene is ' + clean(scene.environment || scene.setting) + '. Maintain this exact scene during the clip; scene changes occur BETWEEN clips.',
    clean(scene.shot) && 'Preserve the existing first-frame ' + clean(scene.shot) + ' composition throughout this shot.',
    'ONE COHERENT PHYSICAL ACTION: ' + action + '.',
    'Perform the action with natural weight transfer, anticipation, smooth easing and follow-through, physically believable feet contact, shoulders, hips, elbows, knees and hands.',
    'Preserve facial identity, head shape, costume, props, lighting and image palette throughout this single clip. Do not change wardrobe DURING movement.',
    'Use stable fixed camera with NO cuts within the clip; differing camera angles are applied to DIFFERENT scenes in the image storyboard.',
    'Keep the entire animation in the approved flat 2D cartoon look, keep the outer picture-frame overlay stationary, no 3D or photorealistic changes.',
    'If demonstrating exercise, follow approved exercise motion research and anatomy references. Do not invent extreme joint angles or unsupported health claims.',
    'No new characters or objects, no camera shake, no text, captions, logos, medical uniform (unless clinically relevant), or watermarks.',
  ].filter(Boolean).join(' ');
}
