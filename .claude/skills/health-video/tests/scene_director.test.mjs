import test from 'node:test';
import assert from 'node:assert/strict';
import { directScenes, auditStoryboard } from '../scripts/scene_director.mjs';
import { stillPrompt, movingPrompt } from '../scripts/motion_style.mjs';
import { buildScenes } from '../scripts/motion_v2.mjs';

const cues = terms => terms.map((text, i) => ({ text, start: i * 4, end: i * 4 + 4 }));
const sample = [
  '¿Sientes que tus piernas pierden fuerza después de los 60?',
  'Al caminar por el parque, intenta sentir tus pasos de forma natural.',
  'Una silla firme puede ayudarte a practicar con seguridad.',
  'El músculo de la pantorrilla ayuda al movimiento del tobillo.',
  'Vamos a elevar los talones con una silla estable.',
  'Da unos pasos tranquilos sobre suelo regular.',
  'Revisaremos qué dicen los estudios y sus resultados.',
  'Ahora descansa sentado y comprueba cómo te sientes.',
  'Es hora de cuidar tu equilibrio y mantener la autonomía.',
  'Consulta al médico si aparece un dolor fuerte o un problema nuevo.',
  'Practica el movimiento con una buena postura, sin forzar articulaciones.',
  'Cuando caminas, observa si tu paso es estable.',
];

test('auto director creates varied editorial locations, framing and meaningful activities', () => {
  const p = buildScenes(cues(sample), 'V1', 'Carmen, 69 years old');
  assert.equal(p.version, 3);
  assert.equal(p.topic, 'legs');
  const a = auditStoryboard(p.scenes);
  assert.ok(a.settings.length >= 4, JSON.stringify(a));
  assert.ok(a.shots.length >= 4, JSON.stringify(a));
  assert.ok(a.unique_actions >= 3, JSON.stringify(a));
  assert.ok(p.scenes.some(s => s.mode === 'character'));
  assert.ok(p.scenes.some(s => s.mode === 'graphic'));
  assert.ok(p.scenes.every(s => s.setting && s.framing && s.treatment && s.lighting));
  assert.ok(p.scenes.filter(s => s.mode === 'character').every(s => s.action.length > 20));
  assert.ok(p.scenes.every(s => s.visual.includes('Narration concept:')));
});

test('outdoor, seated, anatomy and food beats have contextual staging', () => {
  const p = directScenes([
    { id: 'SC001', start: 0, end: 4, text: 'Camina con calma en un suelo plano.' },
    { id: 'SC002', start: 4, end: 8, text: 'Sentarse en una silla estable ayuda.' },
    { id: 'SC003', start: 8, end: 12, text: 'La arteria lleva sangre al corazón.' },
    { id: 'SC004', start: 12, end: 16, text: 'Desayuna verduras y huevos en un plato.' },
  ], { topic: 'legs', variety: 'high' });
  assert.match(p.scenes[0].setting, /park|garden/);
  assert.match(p.scenes[1].setting, /living-room-exercise/);
  assert.equal(p.scenes[2].mode, 'graphic');
  assert.equal(p.scenes[2].shot, 'diagram');
  assert.equal(p.scenes[3].setting, 'kitchen');
  assert.match(p.scenes[3].action, /bowl|fruit|meal|food/);
});

test('scene prompts vary shot and lighting but preserve the master identity and outer frame', () => {
  const p = directScenes([
    { id: 'SC001', start: 0, end: 4, text: 'Caminar ayuda a mantener la movilidad.' },
    { id: 'SC002', start: 4, end: 8, text: 'Una silla estable puede ser útil.' },
  ], { topic: 'legs' });
  const first = stillPrompt(p.scenes[0], 'V1', 'Carmen, grey hair, teal blouse');
  const second = stillPrompt(p.scenes[1], 'V1', 'Carmen, grey hair, teal blouse');
  assert.notEqual(first, second);
  assert.match(first, /LOCATION:/);
  assert.match(first, /SHOT TYPE:/);
  assert.match(first, /picture-frame-style border/);
  assert.match(first, /IDENTITY LOCK: Carmen/);
  assert.match(movingPrompt(p.scenes[0], 'V1', 'Carmen'), /ONE COHERENT PHYSICAL ACTION/);
  assert.match(movingPrompt(p.scenes[0], 'V1', 'Carmen'), /fixed camera/i);
});

test('director is deterministic, honors manually specified topics and avoids repetitious shot run', () => {
  const base = Array.from({ length: 26 }, (_, i) => ({
    id: 'SC' + String(i + 1).padStart(3, '0'), start: i * 4, end: (i + 1) * 4,
    text: 'Es importante escuchar nuestro cuerpo y avanzar con tranquilidad.',
  }));
  const a = directScenes(base, { topic: 'food' });
  const b = directScenes(base, { topic: 'food' });
  assert.deepEqual(a, b);
  assert.equal(a.topic, 'food');
  assert.ok(auditStoryboard(a.scenes).settings.length >= 4);
  assert.equal(auditStoryboard(a.scenes).repeat_warnings.length, 0);
  const held = directScenes(base, { topic: 'food', variety: 'balanced' });
  assert.ok(held.scenes.some(s => s.mode === 'still'));
});
