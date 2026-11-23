import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const main = readFileSync('src/main.ts', 'utf8');
const audio = readFileSync('src/audio/audio.ts', 'utf8');

test('GM-07: explosive ultimate and card pickup cues remain distinct', () => {
  assert.match(main, /audio\.explode\(ev\.kind === 'ult' \|\| ev\.kind === 'ult_r'\)/);
  assert.match(main, /ev\.kind === 'card' \? audio\.pick\(\)/);
  assert.match(main, /ev\.type === 'levelUp'\) audio\.levelUp\(\)/);
});

test('GM-07: original login and React UI integration is preserved', () => {
  assert.match(main, /mountSettings/);
  assert.match(main, /mountUpgrade/);
  assert.match(main, /cameraHeight/);
});

test('GM-07: decoder queue, voice limits, and iOS format fallbacks are present', () => {
  assert.match(audio, /DECODE_CONCURRENCY = 4/);
  assert.match(audio, /MAX_ACTIVE_SFX = 10/);
  assert.match(audio, /MAX_LOW_PRIO_SFX = 5/);
  assert.match(audio, /\.m4a/);
  assert.match(audio, /createDynamicsCompressor/);
  assert.match(audio, /onended =/);
});
