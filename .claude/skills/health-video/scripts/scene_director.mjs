/**
 * Deterministic storyboard director for ANY user-selected art direction.
 * Keeps the channel's master art style while varying place, framing, action,
 * lighting and narrative treatment. It never invents medical outcomes or
 * contradicts an explicit action from the supplied subtitles.
 *
 * This is a rule-based first pass, not semantic AI script understanding.
 * Review the resulting scenes.json before generating any assets.
 */

const fold = v => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const has = (v, re) => re.test(fold(v));

const TOPIC_RULES = Object.freeze({
  legs: /pierna|pantorrilla|rodilla|talon|tobillo|equilibrio|caminar|andando|silla|escalera|musculo|fuerza|levantarse|caid[ao]|gemelo|pie[s ]/,
  heart: /corazon|presion|tension|arteria|colesterol|infarto|circulacion|cardiovascular|hipertension/,
  diabetes: /glucosa|insulina|azucar|diabetes|pancreas|gluc[óo]metro|a1c|glucemia/,
  bladder: /vejiga|orina|prostata|nicturia|nocturia|miccion|urinari/,
  food: /desayuno|comida|fruta|verdura|proteina|queso|legumbre|carne|alimento|nutricion|dieta|saludable/,
  sleep: /sueno|dormir|despertar|insomnio|cansancio|descanso|dormitorio/,
  mind: /cerebro|memoria|ansiedad|depresion|mente|olvido|hormona|pensamiento/,
});

const LOCATIONS = Object.freeze({
  legs: [
    ['living-room-exercise', 'Bright lived-in sitting room with stable exercise chair and uncluttered floor'],
    ['park-path', 'Quiet shaded park pathway, even pavement and nearby greenery'],
    ['home-hallway', 'Spacious home corridor with steady handrail and soft daylight'],
    ['exercise-corner', 'Simple home exercise corner with wall support and non-slip floor'],
    ['garden-terrace', 'Private garden terrace with flat, non-slip stone paving'],
    ['stairs-landing', 'Well-lit staircase landing with secure handrail'],
  ],
  heart: [
    ['living-room', 'Inviting sitting room with armchair and daylight'],
    ['kitchen', 'Bright everyday kitchen and wooden table'],
    ['park-path', 'Green neighborhood walking path with even pavement'],
    ['home-table', 'Quiet table by a window, calm morning light'],
    ['garden-terrace', 'Shaded garden terrace with comfortable seating'],
  ],
  diabetes: [
    ['breakfast-table', 'Home breakfast table and simple balanced breakfast'],
    ['kitchen', 'Realistic bright kitchen with everyday foods'],
    ['living-room', 'Inviting home living room with quiet daylight'],
    ['clinic', 'Calm neutral clinic consultation room without logos'],
    ['garden-terrace', 'Quiet terrace with chairs and potted plants'],
  ],
  bladder: [
    ['bedroom', 'Warm bedroom with bedside table and nighttime lamp'],
    ['home-hallway', 'Quiet home hallway leading toward the bathroom, no visible toilet'],
    ['living-room', 'Comfortable living room in late afternoon'],
    ['kitchen', 'Evening kitchen with an ordinary drinking glass on a table'],
    ['clinic', 'Friendly consultation room, no institutional signs or logos'],
  ],
  sleep: [
    ['bedroom', 'Comfortable quiet bedroom with soft warm bedside lamp'],
    ['living-room', 'Cozy evening living room with a reading chair'],
    ['morning-kitchen', 'Morning kitchen with gentle sunlight'],
    ['balcony', 'Peaceful home balcony after sunrise'],
  ],
  food: [
    ['kitchen', 'Bright familiar kitchen with wooden countertop'],
    ['breakfast-table', 'Neat breakfast table in morning window light'],
    ['market', 'Small neighborhood produce market stall, no readable signs'],
    ['dining-table', 'Warm family dining table with realistic servings'],
    ['garden-terrace', 'Outdoor terrace with a simple lunch table'],
  ],
  mind: [
    ['living-room', 'Comfortable living room with a bookcase'],
    ['study-desk', 'Quiet study desk by a window with a notebook'],
    ['park-bench', 'Peaceful park bench surrounded by trees'],
    ['kitchen', 'Morning kitchen in a lived-in family home'],
    ['bedroom', 'Softly lit bedroom with a bedside book'],
  ],
  general: [
    ['living-room', 'Warm lived-in home sitting room'],
    ['kitchen', 'Bright home kitchen with simple clean counter'],
    ['garden-terrace', 'Quiet garden terrace with potted plants'],
    ['park-path', 'Shaded neighborhood footpath'],
    ['study-desk', 'Small desk by a window with a notebook'],
  ],
});

const SHOTS = [
  ['wide', 'Wide establishing shot, full-body or clear full setting, generous negative space'],
  ['medium', 'Medium three-quarter shot, character waist-up with visible environmental storytelling'],
  ['detail', 'Focused detail shot on hands and a relevant everyday object, no unrelated face'],
  ['over-shoulder', 'Over-the-shoulder shot revealing the task or prop'],
  ['close-up', 'Expressive facial close-up with subtle background depth'],
  ['full-body', 'Full-body readable safe movement demonstration, both feet in the frame'],
  ['two-thirds', 'Dynamic 2/3 composition with the subject to one side and context on the other'],
  ['top-down', 'Clean top-down flat-lay of relevant objects, no person unless needed'],
];

const TREATMENTS = [
  ['lifestyle', 'Warm slice-of-life environmental storytelling, faithfully rendered in the chosen master art medium'],
  ['action-demo', 'Clear educational movement demonstration, accurate weight distribution and natural gesture, using master art style'],
  ['object-focus', 'A visually arresting everyday object detail and motivated human hands if appropriate'],
  ['story-moment', 'An intimate storytelling moment with natural body language'],
  ['anatomy', 'Clean medically cautious anatomical educational cutaway, correct organ location, restrained annotations added later in the editor'],
  ['comparison', 'Side-by-side comparison of two relevant real-world states, NO unverified before/after improvement'],
  ['visual-metaphor', 'Simple scientifically cautious visual metaphor with realistic context'],
];

const SPECIAL_RULES = [
  { kind: 'warning', re: /urgencia|emergencia|dolor en el pecho|dolor toracico|llame al|ambulancia|signos de alarma/ },
  { kind: 'clinic', re: /medico|doctora|doctor|consulta|farmaco|medicamento|tratamiento|diagnostico|pastillas?/ },
  { kind: 'night', re: /noche|dormir|despertar|cama|madrugada|levantarse por la noche|sueno|descanso/ },
  { kind: 'food', re: /fruta|desayuno|proteina|queso|comida|plato|arroz|huevo|pescado|sal\b|verdura|agua\b/ },
  { kind: 'chair', re: /silla|sentad[oa]|levantarse|sentarse/ },
  { kind: 'walk', re: /caminar|paseo|pasos|camina|caminando|marcha|equilibrio/ },
  { kind: 'exercise', re: /ejercicio|entrenar|elevar|talones|rodilla|piernas|mover|fortalecer|estirar/ },
  { kind: 'anatomy', re: /arteria|vasos|corazon|pancreas|cerebro|musculo|celulas?|nervios?|organos?|hormona|insulina|circulacion/ },
  { kind: 'numbers', re: /por ciento|porcentaje|riesgo|estudio|investigacion|datos|resultados|aumenta|disminuye/ },
];

function classOf(text) {
  const t = fold(text);
  const rule = SPECIAL_RULES.find(v => v.re.test(t));
  return rule ? rule.kind : 'general';
}

function topicOf(text) {
  const t = fold(text);
  const counts = Object.entries(TOPIC_RULES).map(([name, re]) => {
    let count = 0;
    const global = new RegExp(re.source, 'g');
    for (const m of t.matchAll(global)) count++;
    return { name, count };
  }).sort((a, b) => b.count - a.count);
  return counts[0]?.count ? counts[0].name : 'general';
}

const SETTING_FOR_KIND = {
  clinic: ['clinic', 'Bright neutral consultation room, understated medical props, no logos'],
  night: ['bedroom', 'Cozy nighttime bedroom, softly lit bedside table and warm practical lamp'],
  food: ['kitchen', 'Lived-in daylight kitchen with relevant healthy foods'],
  chair: ['living-room-exercise', 'Bright home sitting room, sturdy chair on a non-slip floor'],
  walk: ['park-path', 'Even public walking path with trees and gentle daylight'],
  exercise: ['exercise-corner', 'Comfortable simple home exercise area, sturdy support and stable floor'],
};

function locationFor(kind, theme, index, previous) {
  const fixed = SETTING_FOR_KIND[kind];
  if (fixed) {
    // Three successive walking lines can stay in the park while shot and action change.
    if (kind === 'walk' && index % 4 === 3) return ['garden-terrace', 'Even non-slip garden terrace with gentle greenery'];
    return fixed;
  }
  const available = LOCATIONS[theme] || LOCATIONS.general;
  const rotated = index * 5 + Math.floor(index / 3);
  let result = available[rotated % available.length];
  if (previous && result[0] === previous.setting) {
    result = available[(rotated + 1) % available.length];
  }
  return result;
}

function wardrobeFor(setting, kind) {
  if (kind === 'night') return 'The same recurring character in simple tasteful sleepwear only when the script genuinely describes bedtime; otherwise retain the master outfit';
  if (/park|garden|terrace/.test(setting)) return 'Retain the character master outfit and its signature colors; a subtle weather-appropriate outer layer is acceptable';
  if (setting === 'clinic') return 'The recurring character is a patient in everyday clothing. Only a genuinely depicted physician wears clinical clothing';
  return 'Keep the master character signature outfit, colors and accessories; do not invent a different person';
}

function actionFor(kind, theme, setting, index) {
  const options = {
    night: [
      'The older adult slowly sets a book on the bedside table and leans back against the pillows',
      'The older adult sits calmly on the bed edge, places both feet firmly on the floor, and pauses',
      'The older adult gently draws the curtain closed and turns toward the bedside lamp',
    ],
    clinic: [
      'The older adult sits opposite the clinician, listens attentively, and gently nods once',
      'The older adult calmly shows a paper list of questions to a seated clinician',
      'The older adult carefully points to a notebook on the consultation desk',
    ],
    food: [
      'The older adult places a small bowl of prepared food on the table, then steadies the plate',
      'The older adult reaches naturally for an everyday fruit on the counter and lifts it slowly',
      'The older adult stirs a bowl gently with one hand and pauses to inspect the meal',
    ],
    chair: [
      'The older adult moves forward on a sturdy chair, plants the feet, and rises slowly with safe control',
      'The older adult sits down onto a stable chair with a slow controlled hip hinge, using chair support when needed',
      'The older adult carefully shifts weight forward while seated and straightens the upper body',
    ],
    walk: [
      'The older adult takes three comfortable steady steps along the flat path, with a natural arm swing',
      'The older adult walks smoothly past a tree and gradually turns the head toward the path ahead',
      'The older adult starts from standing and walks forward with short balanced steps on even ground',
    ],
    exercise: [
      'The older adult performs one slow supported heel raise near a sturdy chair, then gently lowers the heels',
      'The older adult slowly marches in place with low knee lifts while keeping balance and a safe support nearby',
      'The older adult lightly reaches one arm toward the wall for balance and makes a small controlled weight shift',
    ],
    anatomy: [
      'The older adult sits comfortably, places a hand lightly over the relevant body area and looks thoughtfully toward a simple anatomy illustration',
    ],
    general: [
      'The older adult reaches for a book, opens it carefully and looks at one page',
      'The older adult sits by the window and gently turns their head toward the sunlight',
      'The older adult walks a short distance across the living room with a natural weight shift',
      'The older adult places a cup gently on the table and sits upright',
      'The older adult gestures naturally toward an object on the table while explaining a point',
    ],
  };
  // All motions are explicitly one safe, coherent activity. The storyboard may still require
  // manual rewriting when a specific exercise is mentioned in the script.
  const arr = options[kind] || options[theme === 'legs' ? 'exercise' : theme === 'food' ? 'food' : 'general'];
  return arr[Math.floor(index / 2) % arr.length];
}

function detailsFor(kind, theme, setting, index) {
  if (kind === 'warning') return {
    object: 'One simple emergency warning motif grounded in the narration; no graphic injury',
    treatment: 'Clean, sober educational caution infographic rather than a sensational reenactment',
  };
  if (kind === 'anatomy') return {
    object: theme === 'heart' ? 'Clearly structured heart and blood vessel inset' :
      theme === 'diabetes' ? 'Clear glucose and pancreas relationship diagram' :
      theme === 'mind' ? 'Simple brain and neural pathway cutaway' :
      theme === 'legs' ? 'Anatomically correct leg muscle close-up' : 'Relevant human organ cutaway',
    treatment: 'Accurate anatomical cutaway in the exact selected master visual medium and style, without inventing anatomical claims',
  };
  if (kind === 'numbers') return {
    object: 'Unlabeled graphical shapes, bar lengths or icons; facts and numbers added later in editing',
    treatment: 'Clean data visual with editorial composition and one meaningful visual focus',
  };
  if (kind === 'food') return {
    object: 'Everyday plate, bowl and relevant foods from the script, no invented medicinal claims',
    treatment: 'Lived-in still life, rich food details, preserving master style lines, surface textures, palette and rendering medium',
  };
  if (kind === 'chair' || kind === 'exercise' || kind === 'walk') return {
    object: 'Stable floor, visible limbs and practical physical support',
    treatment: 'Crisp full-body exercise demonstration that makes correct direction of motion obvious',
  };
  const t = TREATMENTS[(index * 3 + 1) % TREATMENTS.length];
  return { object: setting.includes('desk') ? 'A notebook, pen and simple desk lamp' : 'One ordinary meaningful contextual prop', treatment: t[1] };
}

function shotFor(kind, index, last) {
  const safe = kind === 'exercise' || kind === 'chair' || kind === 'walk';
  const choices = safe ? [SHOTS[5], SHOTS[0], SHOTS[1], SHOTS[6]] :
    kind === 'food' ? [SHOTS[7], SHOTS[2], SHOTS[1], SHOTS[6]] :
    kind === 'warning' || kind === 'anatomy' || kind === 'numbers' ? [SHOTS[2], SHOTS[6], SHOTS[0]] :
    SHOTS;
  let chosen = choices[(index + Math.floor(index / 2)) % choices.length];
  if (last && chosen[0] === last.shot) chosen = choices[(index + Math.floor(index / 2) + 1) % choices.length];
  return chosen;
}

function modeFor(kind, index) {
  if (kind === 'warning' || kind === 'numbers') return 'graphic';
  if (kind === 'anatomy') return index % 5 === 0 ? 'character' : 'graphic';
  // B-roll, diagrams, performance and expressive character beats, not just talking heads.
  const pattern = ['character', 'still', 'graphic', 'character', 'still', 'character', 'still', 'graphic', 'still', 'character', 'still', 'graphic'];
  if (['chair', 'walk', 'exercise'].includes(kind)) return index % 4 === 2 ? 'still' : 'character';
  if (kind === 'food' && index % 4 === 2) return 'still';
  return pattern[index % pattern.length];
}

function visualFor(scene) {
  const focus = scene.mode === 'graphic' ?
    'Draw a standalone explanatory visual, appropriate object or anatomy cutaway. NO foreground human character' :
    scene.mode === 'still' && scene.shot === 'detail' ?
    'Emphasize hands/objects/context rather than a person standing still' :
    'Show the recurring older adult doing a believable activity with meaningful body language';
  return [
    focus + '.',
    scene.treatment + '.',
    scene.environment + '.',
    'Key object: ' + scene.object + '.',
    'Narration concept: ' + scene.text + '.',
    'Avoid repeating the exact composition or idle standing pose of adjacent scenes.',
  ].join(' ');
}

/**
 * Decorate SRT-aligned planned scenes with a coherent visual narrative.
 * The existing base scenes must have id/start/end/text, can keep image/video paths.
 */
export function directScenes(baseScenes, opts = {}) {
  const all = baseScenes.map(s => s.text).join(' ');
  const theme = opts.topic && opts.topic !== 'auto' ? fold(opts.topic) : topicOf(all);
  const variety = ['balanced', 'high'].includes(opts.variety) ? opts.variety : 'high';
  const scenes = [];
  for (let i = 0; i < baseScenes.length; i++) {
    const raw = baseScenes[i];
    const kind = classOf(raw.text);
    const prev = scenes.at(-1);
    let mode = modeFor(kind, i);
    if (variety === 'balanced' && kind === 'general' && i % 4 === 1 && mode === 'graphic') mode = 'still';
    const loc = mode === 'graphic' ? ['educational-illustration', 'Clean full-bleed diagram composition preserving the chosen master art treatment, no unrelated room or person'] : locationFor(kind, theme, i, prev);
    const shot = shotFor(kind, i, prev);
    const specifics = detailsFor(kind, theme, loc[0], i);
    const mood = kind === 'warning' ? 'serious and calm' :
      kind === 'night' ? 'warm quiet nighttime' :
      kind === 'walk' || kind === 'exercise' || kind === 'chair' ? 'active, reassuring' :
      ['clinic', 'anatomy'].includes(kind) ? 'clear, professional, calm' : 'warm, approachable, educational';
    const scene = {
      ...raw,
      mode,
      topic: theme,
      narrative_kind: kind,
      setting: loc[0], environment: loc[1],
      shot: mode === 'graphic' ? 'diagram' : shot[0],
      framing: mode === 'graphic' ? 'Focused clean diagram with generous empty space around the main visual' : shot[1],
      mood,
      lighting: kind === 'night' ? 'soft warm night lamp; no artificial daylight' :
        loc[0] === 'clinic' ? 'neutral balanced diffused lighting' :
        i % 4 === 0 ? 'soft morning window light' : i % 4 === 1 ? 'warm afternoon light' : 'clean natural ambient light',
      palette_treatment: i % 3 === 0 ? 'warm editorial accent ONLY if compatible with the master style' : i % 3 === 1 ? 'cool calming secondary tones ONLY if compatible with the master style' : 'high readability contrast strictly within the master palette',
      wardrobe: wardrobeFor(loc[0], kind),
      treatment: specifics.treatment,
      object: specifics.object,
      action: mode === 'character' ? actionFor(kind, theme, loc[0], i) : '',
    };
    scene.visual = visualFor(scene);
    scenes.push(scene);
  }
  return { topic: theme, variety, scenes };
}

/** Advisory only; never automatically blocks clinically intentional repeated contexts. */
export function auditStoryboard(scenes) {
  const settings = [...new Set(scenes.map(s => s.setting).filter(Boolean))];
  const shots = [...new Set(scenes.map(s => s.shot).filter(Boolean))];
  const actions = scenes.filter(s => s.mode === 'character').map(s => s.action);
  const repeated = [];
  for (let i = 2; i < scenes.length; i++) {
    const seq = scenes.slice(i - 2, i + 1);
    if (seq.every(s => s.setting === seq[0].setting && s.shot === seq[0].shot))
      repeated.push([seq[0].id, seq[2].id]);
  }
  const uniqueActions = [...new Set(actions)];
  return {
    scene_count: scenes.length,
    settings, shots,
    unique_actions: uniqueActions.length,
    character_scenes: actions.length,
    repeat_warnings: repeated,
    diversity_score: scenes.length ? Math.round(100 * Math.min(1, (settings.length / Math.min(scenes.length, 5)) * 0.35 +
      (shots.length / Math.min(scenes.length, 6)) * 0.35 +
      (uniqueActions.length / Math.max(1, actions.length)) * 0.3)) : 0,
  };
}
