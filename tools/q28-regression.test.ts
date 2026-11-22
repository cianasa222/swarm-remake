import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { EliteBruiserPool } from '../src/render/enemy_models';
import { WEAPON_SFX } from '../src/audio/audio';
import type { Enemy } from '../src/sim/game';

// Construct a renderer pool with real Three animation mixers, no WebGL/DOM.
const pool = new EliteBruiserPool(new THREE.Group(), 2, true);
const p = pool as unknown as { slots: any[]; loadStarted: boolean; byId: Map<number, number> };
p.loadStarted = true;
for (let i = 0; i < 2; i++) {
  const model = new THREE.Group(), root = new THREE.Group();
  const mixer = new THREE.AnimationMixer(model);
  const actions = { run: mixer.clipAction(new THREE.AnimationClip('run', 1, [])), death: mixer.clipAction(new THREE.AnimationClip('death', 1.633, [])) };
  p.slots.push({ root, model, mixer, actions, mat: new THREE.MeshStandardMaterial(), ring: new THREE.Mesh(), curKey: '', dyingT: 0 });
}
const enemy = (id: number) => ({ id, hp: 100, alive: true, x: id, z: 0, face: 0, age: 1, flash: 0, bindT: 0, state: 'run' }) as Enemy;
const a = enemy(1), b = enemy(2);
pool.update([a, b], .016);
const ai = p.byId.get(1)!, bi = p.byId.get(2)!;
a.hp = 0; a.alive = false;
pool.update([b], .016);
assert.equal(p.byId.get(2), bi);
assert.equal(p.slots[ai].curKey, 'death');
assert.equal(p.slots[ai].ring.visible, false);
assert.ok(p.slots[ai].root.visible);
pool.update([b], 2);
assert.equal(p.slots[ai].root.visible, false);
b.alive = false; // positive HP: boss entrance / non-kill removal
pool.update([], .016);
assert.equal(p.slots[bi].dyingT, 0);
assert.equal(p.slots[bi].root.visible, false);
pool.update([enemy(3)], .016);
pool.reset();
assert.equal(p.byId.size, 0);
assert.ok(p.slots.every(s => !s.root.visible && s.dyingT === 0));

for (const [cue, paths] of Object.entries(WEAPON_SFX)) {
  for (const path of paths) assert.equal(readFileSync(`public/assets/audio/${path}`).subarray(0, 4).toString(), 'OggS', `${cue}: ${path}`);
}
console.log('PASS: elite slot stability, death clip, non-kill removal, reset; 18 audio cue groups with Ogg assets');
