import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
const files=[
  "public/assets/audio/global/648459546.ogg",
  "public/assets/audio/global/707729322.ogg",
  "public/assets/audio/global/199453683.ogg",
  "public/assets/audio/global/236701451.ogg",
  "public/assets/audio/global/1063282412.ogg",
  "public/assets/audio/global/116442316.ogg",
  "public/assets/audio/global/869815710.ogg",
  "public/assets/audio/global/606260377.ogg",
  "public/assets/audio/global/1067684107.ogg",
  "public/assets/audio/global/196758714.ogg",
  "public/assets/audio/global/382785855.ogg",
  "public/assets/audio/global/910166186.ogg",
  "public/assets/audio/global/973490012.ogg",
  "public/assets/audio/global/312848139.ogg",
  "public/assets/audio/global/371025373.ogg",
  "public/assets/audio/global/181571615.ogg",
  "public/assets/audio/global/321846344.ogg",
  "public/assets/audio/global/122258074.ogg",
  "public/assets/audio/global/515733205.ogg",
  "public/assets/audio/global/1053037764.ogg",
  "public/assets/audio/global/166078121.ogg",
  "public/assets/audio/global/308623664.ogg",
  "public/assets/audio/global/348804465.ogg"
];
test('GM-10: all 23 selected 14.14 Ogg assets are real and non-empty', () => {
 assert.equal(files.length,23);
 assert.equal(new Set(files).size,23);
 for(const path of files) {
  assert.ok(statSync(path).size > 64,'empty asset: '+path);
  assert.equal(readFileSync(path).subarray(0,4).toString(),'OggS','not valid Ogg magic: '+path);
 }
});
