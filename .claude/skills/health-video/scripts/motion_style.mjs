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

export function stillPrompt(scene, styleName = 'V1', character = '') {
  const s = styleOf(styleName);
  return [
    s.image,
    character ? 'IDENTITY LOCK: ' + character : 'Use the same approved master character reference as the previous scenes.',
    'SCENE: ' + (scene.visual || scene.text || 'A clear explanatory moment.'),
    'The character is fully inside the canvas; two hands, two feet, one head, correct knee and elbow geometry.',
    'No captions baked into the picture. A single complete idea per scene. No medical uniform unless a real doctor appears.',
    'no text, no logos, 16:9, high resolution',
  ].join('\n');
}

export function movingPrompt(scene, styleName = 'V1', character = '') {
  const s = styleOf(styleName);
  const action = (scene.action || '').trim();
  if (!action) throw new Error(scene.id + ': add an explicit action before animating.');
  return [
    s.motion,
    character ? 'Same recurring person: ' + character + '.' : 'Keep character identity identical to the provided first frame.',
    'ACTION (one action only): ' + action + '.',
    'Show the beginning, natural transition and completion of this action over the clip duration.',
    'Preserve coherent hands, feet, facial features, surroundings, and garment details in every frame.',
    'If demonstrating an exercise, obey the approved exercise safety/biomechanics card and do not invent impossible joint motion.',
    'No new people, captions, brand marks or camera motion; do not change character age or clothing.',
  ].join(' ');
}
