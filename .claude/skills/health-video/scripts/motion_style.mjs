// Shared visual DNA for character image generation and motion generation.
// Keep every prompt self-contained; image/video models do not remember preceding scenes.
export const STYLE = Object.freeze({
  V1: {
    label: 'HEALTH_CARTOON V1 · pastel editorial',
    image: 'Beautiful hand-drawn 2D educational cartoon, Spanish older adult aged 60-75 with expressive but natural face, recognisable mature proportions, elegant everyday clothing, pleasing pastel colors with moderate saturation, clean dark outlines, subtle cel shading, believable room depth, one clear focal point. Full-bleed 16:9 illustration, a thin decorative picture-frame-style border OVERLAID at the OUTER FOUR EDGES. The picture continues beneath the border. This is NOT a card, NOT a rounded panel and NOT white margins.',
    graphic: 'Beautiful 2D educational illustration in the V1 pastel editorial palette with slightly saturated muted colors, crisp clean outlines, delicate cel shading and realistic depth of objects. Full-bleed 16:9 infographic, thin decorative picture-frame-style border ON TOP of the four OUTER EDGES, art fills the whole canvas; never a white panel. No foreground people unless explicitly requested.',
    motion: 'Preserve the exact illustrated 2D style, face, outfit, body proportions, border and background. Natural human timing and weight transfer; smooth controlled movement with realistic joint motion, subtle cloth follow-through. Locked camera. The decorative outer picture border remains fixed and visible.',
  },
  V2: {
    label: 'HEALTH_CARTOON V2 · vivid editorial',
    image: 'Beautiful richly detailed 2D cartoon explainer of a Spanish adult aged 60-75, expressive mature face, clearly readable anatomy and everyday clothing, confident saturated colors and stronger contrast, crisp controlled outlines, careful two-tone soft shading and foreground/background depth. Full-bleed 16:9 art with a restrained organic/curved editorial frame at the OUTER EDGES, overlay on the illustration, not a panel. NO photorealism or 3D.',
    graphic: 'Beautiful vivid V2 medical and object illustration, saturated colors with strong readable contrast, finely controlled dark outlines, gentle two-tone cel shading, layered foreground depth, a curved decorative outer-edge frame overlay, full-bleed 16:9 art, NOT 3D and NOT photorealistic. No human character unless clinically necessary.',
    motion: 'Keep the original vivid 2D illustration, precise clean outlines, same mature character and clothes, stable lighting, curved outer-edge frame and room. Smooth believable weight shifts, body mechanics, natural follow-through; fixed camera. No 3D transformation.',
  },
  LEGACY: {
    label: 'Original blue mannequin',
    image: 'Original channel house style: detailed 2D flat/cel-shaded health explainer illustration, adult blue mannequin with glowing white eyes, consistent proportions, expressive posture, clean bold outlines, cream #F5ECD7 background, 16:9, one focal point.',
    graphic: 'Original channel 2D medical diagram style, strong dark outlines, soft cel shading, cream #F5ECD7 background, blue/red/amber object palette, flat educational anatomical art, no person unless requested.',
    motion: 'Keep the exact original illustrated blue mannequin, white eyes, contours, anatomy, cream background and scale. Controlled physically plausible exercise movement, fixed camera, natural limb arcs. Never rotate flat cardboard cut-out limbs.',
  },
});

export const NEGATIVE = 'morphing, melting, extra limbs, extra hands, missing fingers, deformed legs, broken joints, face swap, outfit change, flicker, shaky camera, rubber anatomy, unnatural bends, inconsistent character, photorealism, 3D render, gibberish text, logos, watermark';

export function styleOf(name = 'V1') {
  if (name && typeof name === 'object' && !Array.isArray(name)) {
    if (typeof name.image !== 'string' || !name.image.trim() ||
        typeof name.motion !== 'string' || !name.motion.trim())
      throw new Error('Custom Master Style requires image and motion descriptions');
    return { ...name, graphic: name.graphic || name.image };
  }
  const s = STYLE[String(name).toUpperCase()];
  if (!s) throw new Error('Unknown style ' + name + '. Use V1/V2/LEGACY or provide --master/--master-image.');
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
    'Keep the recurring character recognisable. ' + clean(scene.wardrobe || 'Retain defining colors, clothing and accessories') +
      '. Respect the MASTER CHARACTER reference anatomy: if human, preserve exactly one head, two arms, two legs and correct hands, elbows and knees; if a mascot or abstract character, preserve its canonical features and proportions. No default idle standing pose.';
  return [
    graphic ? s.graphic : s.image,
    identity,
    sceneDirection(scene),
    'WHAT TO SHOW: ' + (scene.visual || scene.text || 'One clear complete educational concept') + '.',
    'VOICE MEANING (do not draw these words): ' + clean(scene.text) + '.',
    characterRule,
    'The overall MASTER STYLE artistic medium, palette, texture and character design remain uniform across scenes, but staging, setting, shot scale and editorial treatment must NOT repeat monotonously.',
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
    'Perform the action with natural anticipation, smooth easing and follow-through. For human characters preserve believable feet contact, balance and joints; for mascot or nonhuman characters preserve their master proportions and established motion language.',
    'Preserve facial identity, head shape, costume, props, lighting and image palette throughout this single clip. Do not change wardrobe DURING movement.',
    'Use stable fixed camera with NO cuts within the clip; differing camera angles are applied to DIFFERENT scenes in the image storyboard.',
    'Keep the entire animation in the SAME artistic medium and rendering style as the approved first frame and its master reference. Maintain any border/framing established by the chosen master; do not switch to a different art medium.',
    'If demonstrating exercise, follow approved exercise motion research and anatomy references. Do not invent extreme joint angles or unsupported health claims.',
    'No new characters or objects, no camera shake, no text, captions, logos, unjustified medical uniform or watermarks.',
  ].filter(Boolean).join(' ');
}
