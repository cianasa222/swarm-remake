import * as THREE from 'three';
import { ARENA } from '../config';
import type { FountainState } from '../sim/game';
import { addOutline, merge, paint, place, toon } from './style';

/**
 * 「晴日海堤货运站」场景（美术重制版）
 * 色彩分工：
 *   - 环境：蓝天青海、浅暖灰混凝土、白色防浪墙、橘黄港机 —— 明亮但低饱和/低对比
 *   - 玩法：敌弹玫红、预警玫红、经验晶片黄绿、友方青蓝/金橙 —— 高饱和，只留给战斗信息
 * 构图：高大的岸桥只放在北侧海面（画面上方），不遮挡角色；南侧只放低矮设施。
 */
export interface WorldView {
  group: THREE.Group;
  sun: THREE.DirectionalLight;
  ready?: Promise<void>;
  update(t: number, progress: number, alarm: number, warnings: { entrance: string; tag?: string }[], tier: string, fountain?: FountainState): void;
  setShadows(on: boolean): void;
}

const HW = ARENA.halfW;
const HH = ARENA.halfH;

export function buildWorld(scene: THREE.Scene): WorldView {
  scene.background = new THREE.Color(0x7cc7ea);
  scene.fog = null;
  const group = new THREE.Group();
  scene.add(group);

  // ── 光照：天光 + 暖色日光 ──
  group.add(new THREE.HemisphereLight(0xd8f1ff, 0xb9a58a, 1.25));
  group.add(new THREE.AmbientLight(0xffffff, 0.25));
  const sun = new THREE.DirectionalLight(0xfff0d4, 2.1);
  sun.position.set(22, 40, 16);
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.near = 5; sc.far = 120; sc.left = -46; sc.right = 46; sc.top = 40; sc.bottom = -40;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  group.add(sun, sun.target);

  // ── 海水：单张四边形 + 着色器（浪纹、日光闪烁、岸边白沫、首领浪涌） ──
  const waterUniforms = {
    uTime: { value: 0 },
    uAlarm: { value: 0 },
    uHalf: { value: new THREE.Vector2(HW + 3.2, HH + 3.2) },
    uDetail: { value: 1 },
  };
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 320),
    new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      vertexShader: /* glsl */ `
        varying vec2 vW;
        void main(){
          vec4 w = modelMatrix * vec4(position,1.0);
          vW = w.xz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform float uAlarm; uniform vec2 uHalf; uniform float uDetail;
        varying vec2 vW;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
        void main(){
          // 到平台边缘的距离（矩形 SDF）
          vec2 d = abs(vW) - uHalf;
          float dist = length(max(d,0.0)) + min(max(d.x,d.y),0.0);
          float sp = 1.0 + uAlarm * 1.6;
          float t = uTime * sp;
          vec3 deep = vec3(0.07,0.42,0.62);
          vec3 shallow = vec3(0.16,0.72,0.80);
          vec3 col = mix(shallow, deep, smoothstep(2.0, 26.0, dist));
          // 斜向浪纹
          float w1 = sin(vW.x*0.35 + vW.y*0.22 + t*1.3 + n(vW*0.15)*4.0);
          float w2 = sin(vW.x*-0.18 + vW.y*0.41 - t*1.0 + n(vW*0.2+7.0)*3.0);
          float waves = (w1 + w2) * 0.5;
          col += vec3(0.05,0.08,0.08) * waves * uDetail;
          // 日光闪烁
          float g = n(vW*1.6 + vec2(t*0.6, -t*0.4)) * n(vW*0.9 - vec2(t*0.3, t*0.5));
          col += vec3(1.0) * smoothstep(0.42, 0.62, g) * 0.55 * uDetail;
          // 岸边白沫（随时间呼吸，首领入场时更宽）
          float foamW = 1.1 + 0.35*sin(t*1.7 + vW.x*0.3) + uAlarm*1.8;
          float foam = smoothstep(foamW, 0.0, dist) * (0.65 + 0.35*n(vW*2.5 + t));
          col = mix(col, vec3(0.97,0.99,1.0), clamp(foam,0.0,1.0)*0.9);
          // 首领警报：远处浪涌白线
          float surge = smoothstep(0.93, 1.0, sin(dist*0.55 - t*3.0)) * uAlarm;
          col = mix(col, vec3(0.95,0.98,1.0), surge*0.6);
          gl_FragColor = vec4(col,1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -1.3;
  group.add(water);

  // ── 货运平台：混凝土甲板 + 侧壁 ──
  const deckW = HW * 2 + 6, deckH = HH * 2 + 6;
  const deckSide = new THREE.Mesh(new THREE.BoxGeometry(deckW, 1.6, deckH), toon(0xa9b0b4));
  deckSide.position.y = -0.82;
  group.add(deckSide);
  const deckTex = makeDeckTexture(deckW, deckH);
  const deck = new THREE.Mesh(
    new THREE.PlaneGeometry(deckW, deckH),
    new THREE.MeshToonMaterial({ map: deckTex, gradientMap: undefined }),
  );
  deck.rotation.x = -Math.PI / 2;
  deck.position.y = 0;
  deck.receiveShadow = true;
  group.add(deck);

  // 岸线黄色警示边 + 黑色橡胶护舷（东/西/北三侧临海）
  const curbMat = toon(0xf2c230);
  const fenderMat = toon(0x24292e);
  const addCurb = (x: number, z: number, w: number, d: number) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.22, d), curbMat);
    c.position.set(x, 0.11, z);
    c.receiveShadow = true;
    group.add(c);
  };
  addCurb(0, -deckH / 2 + 0.2, deckW, 0.4);
  addCurb(0, deckH / 2 - 0.2, deckW, 0.4);
  addCurb(-deckW / 2 + 0.2, 0, 0.4, deckH);
  addCurb(deckW / 2 - 0.2, 0, 0.4, deckH);
  const fenderGeo = new THREE.CylinderGeometry(0.42, 0.42, 1.1, 10);
  const fenders = new THREE.InstancedMesh(fenderGeo, fenderMat, 64);
  let fi = 0;
  const dummy = new THREE.Object3D();
  for (let x = -deckW / 2 + 4; x < deckW / 2 - 2; x += 6) {
    for (const z of [-deckH / 2 - 0.3, deckH / 2 + 0.3]) {
      dummy.position.set(x, -0.55, z);
      dummy.rotation.set(0, 0, Math.PI / 2);
      dummy.updateMatrix();
      fenders.setMatrixAt(fi++, dummy.matrix);
    }
  }
  for (let z = -deckH / 2 + 4; z < deckH / 2 - 2; z += 6) {
    for (const x of [-deckW / 2 - 0.3, deckW / 2 + 0.3]) {
      dummy.position.set(x, -0.55, z);
      dummy.rotation.set(Math.PI / 2, 0, 0);
      dummy.updateMatrix();
      fenders.setMatrixAt(fi++, dummy.matrix);
    }
  }
  fenders.count = fi;
  group.add(fenders);

  // 系船柱（沿岸一圈）
  const bollardGeo = merge([
    paint(place(new THREE.CylinderGeometry(0.22, 0.28, 0.5, 10), 0, 0.25, 0), 0x2f3a44),
    paint(place(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 10), 0, 0.52, 0), 0x2f3a44),
  ]);
  const bollards = new THREE.InstancedMesh(bollardGeo, toon(0xffffff, { vertexColors: true }), 48);
  let bi = 0;
  for (let x = -deckW / 2 + 7; x < deckW / 2 - 4; x += 9) {
    for (const z of [deckH / 2 - 0.9]) {
      dummy.position.set(x, 0, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
      bollards.setMatrixAt(bi++, dummy.matrix);
    }
  }
  bollards.count = bi;
  bollards.castShadow = true;
  group.add(bollards);

  // ── 白色防浪墙（四边分段，留出入口） ──
  const wallMat = toon(0xf4f6f8);
  const wallCapMat = toon(0xdfe5ea);
  const stripeMat = toon(0x2f7fa8);
  const addWall = (x: number, z: number, w: number, d: number, h = 1.35) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, h / 2, z);
    m.castShadow = true; m.receiveShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, 0.18, d + 0.16), wallCapMat);
    cap.position.set(x, h + 0.09, z);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.14, d + 0.02), stripeMat);
    stripe.position.set(x, h * 0.62, z);
    group.add(m, cap, stripe);
  };
  // 北（临海，较高）
  addWall(-17, -HH - 1.4, 22, 1.2, 1.6);
  addWall(17, -HH - 1.4, 22, 1.2, 1.6);
  // 南（较低）
  addWall(-17.5, HH + 1.4, 21, 1.0, 0.9);
  addWall(17.5, HH + 1.4, 21, 1.0, 0.9);
  // 东西
  addWall(-HW - 1.4, -14, 1.0, 16, 1.1);
  addWall(-HW - 1.4, 14, 1.0, 16, 1.1);
  addWall(HW + 1.4, -14, 1.0, 16, 1.1);
  addWall(HW + 1.4, 14, 1.0, 16, 1.1);

  // 北侧海中消波块（四脚体，实例化）
  const tetraGeo = makeTetrapod();
  const tetraMat = toon(0xe9edf0);
  const tetras = new THREE.InstancedMesh(tetraGeo, tetraMat, 90);
  let ti = 0;
  const rnd = mulberry(7);
  for (let x = -deckW / 2 - 6; x < deckW / 2 + 6; x += 2.3) {
    for (let row = 0; row < 2; row++) {
      if (Math.abs(x) < 5.5 && row === 0) continue; // 北堤缺口：异兽从这里爬上来
      dummy.position.set(x + rnd() * 0.8, -1.0 + rnd() * 0.3, -deckH / 2 - 2.0 - row * 2.1 - rnd() * 0.6);
      dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      dummy.scale.setScalar(0.9 + rnd() * 0.35);
      dummy.updateMatrix();
      tetras.setMatrixAt(ti++, dummy.matrix);
    }
  }
  tetras.count = ti;
  group.add(tetras);

  // ── 集装箱堆（与 ARENA.blocks 碰撞体对齐） ──
  const containerColors = [0xe8742c, 0x2f7e9e, 0xf0e2c4, 0x3f8a6a, 0xd2453b, 0x2b4f7a];
  let ci = 0;
  for (const [cx, cz, hw, hh] of ARENA.blocks) {
    const pillar = hw < 1.6 && hh < 1.6;
    if (pillar) {
      group.add(makeGatePillar(cx, cz, hw, hh));
      continue;
    }
    // 两层堆叠，上层略错位，增加层次
    const stack = new THREE.Group();
    const vertical = hh > hw;
    const len = (vertical ? hh : hw) * 2;
    const wid = (vertical ? hw : hh) * 2;
    const nCols = Math.max(1, Math.round(wid / 2.4));
    for (let k = 0; k < nCols; k++) {
      const off = -wid / 2 + (k + 0.5) * (wid / nCols);
      const c1 = makeContainer(len - 0.2, wid / nCols - 0.15, containerColors[ci++ % containerColors.length]);
      const c2 = makeContainer(len * 0.62, wid / nCols - 0.15, containerColors[ci++ % containerColors.length]);
      c1.position.set(vertical ? off : 0, 0, vertical ? 0 : off);
      c2.position.set(vertical ? off : len * 0.14, 2.6, vertical ? -len * 0.14 : off);
      if (vertical) { c1.rotation.y = Math.PI / 2; c2.rotation.y = Math.PI / 2; }
      stack.add(c1);
      if ((ci + k) % 3 !== 0) stack.add(c2);
    }
    stack.position.set(cx, 0, cz);
    group.add(stack);
  }

  // ── 北侧岸桥（橘黄港机，位于画面上方海面，不遮挡战斗） ──
  const craneA = makeQuayCrane();
  craneA.position.set(-15, 0, -HH - 4.6);
  const craneB = makeQuayCrane();
  craneB.position.set(15, 0, -HH - 4.6);
  group.add(craneA, craneB);

  // ── 中央维修塔（任务进度） ──
  const tower = makeTower();
  group.add(tower.group);

  // ── 外围装饰：油桶、托盘、锥桶、灯柱、救生圈 ──
  addProps(group, rnd);

  // ── 刷怪入口：地面箭头信标 ──
  const entMarks: Record<string, { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }> = {};
  const chevronGeo = makeChevrons();
  for (const [k, e] of Object.entries(ARENA.entrances)) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xff2f86, transparent: true, opacity: 0, depthWrite: false });
    const m = new THREE.Mesh(chevronGeo, mat);
    const px = clamp(e.x, HW - 1.8), pz = clamp(e.z, HH - 1.8);
    m.position.set(px, 0.03, pz);
    m.rotation.y = Math.atan2(-px, -pz); // 箭头指向场内
    m.renderOrder = 11;
    group.add(m);
    entMarks[k] = { mesh: m, mat };
  }

  // ── 云影（极低对比，漂过甲板，强化晴日感） ──
  const cloudMat = new THREE.MeshBasicMaterial({ map: cloudTex(), transparent: true, opacity: 0.11, depthWrite: false, color: 0x1d3550 });
  const clouds: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(26, 16), cloudMat);
    c.rotation.x = -Math.PI / 2;
    c.position.set(-60 + i * 34, 0.02, -20 + (i % 2) * 26);
    c.renderOrder = 1;
    group.add(c);
    clouds.push(c);
  }

  // ── 海鸥 ──
  const gullGeo = merge([
    paint(place(new THREE.BoxGeometry(0.9, 0.05, 0.22), -0.42, 0, 0, 0, 0, 0.25), 0xffffff),
    paint(place(new THREE.BoxGeometry(0.9, 0.05, 0.22), 0.42, 0, 0, 0, 0, -0.25), 0xffffff),
    paint(place(new THREE.BoxGeometry(0.16, 0.12, 0.5), 0, 0, 0), 0xf3f3f3),
  ]);
  const gulls = new THREE.InstancedMesh(gullGeo, new THREE.MeshBasicMaterial({ vertexColors: true }), 7);
  gulls.frustumCulled = false;
  group.add(gulls);

  let lastProg = -1;
  return {
    group,
    sun,
    setShadows(on) {
      sun.castShadow = on;
      deck.receiveShadow = on;
    },
    update(t, progress, alarm, warnings, tier) {
      waterUniforms.uTime.value = t;
      waterUniforms.uAlarm.value = alarm;
      waterUniforms.uDetail.value = tier === 'low' ? 0.4 : 1;

      // 岸桥与塔顶随警报晃动
      const sway = alarm > 0.01 ? Math.sin(t * 22) * 0.012 * alarm : 0;
      craneA.rotation.z = sway;
      craneB.rotation.z = -sway * 0.8;
      tower.update(t, progress, alarm);
      if (Math.abs(progress - lastProg) > 0.002) lastProg = progress;

      // 云影漂移
      for (const c of clouds) {
        c.position.x += 0.016;
        if (c.position.x > 80) c.position.x = -80;
      }
      // 海鸥绕圈
      for (let i = 0; i < 7; i++) {
        const a = t * (0.12 + i * 0.015) + i * 0.9;
        const r = 30 + (i % 3) * 7;
        dummy.position.set(Math.cos(a) * r, 7 + (i % 2) * 2 + Math.sin(t * 2 + i) * 0.3, Math.sin(a) * r * 0.75 - 6);
        dummy.rotation.set(0, -a, Math.sin(t * 7 + i) * 0.35);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        gulls.setMatrixAt(i, dummy.matrix);
      }
      gulls.instanceMatrix.needsUpdate = true;

      // 入口预警
      const act = new Map<string, string | undefined>();
      for (const w of warnings) act.set(w.entrance, w.tag);
      for (const [k, v] of Object.entries(entMarks)) {
        if (act.has(k)) {
          const p = 0.5 + 0.5 * Math.sin(t * 12);
          v.mat.opacity = 0.55 + p * 0.4;
          v.mesh.scale.setScalar(act.get(k) === 'boss' ? 1.8 : 1 + p * 0.12);
        } else {
          v.mat.opacity = 0;
        }
      }
    },
  };
}

// ───────────────────────── 构件 ─────────────────────────

function makeContainer(len: number, wid: number, hex: number): THREE.Group {
  const g = new THREE.Group();
  const h = 2.5;
  const body = new THREE.Mesh(new THREE.BoxGeometry(len, h, wid), toon(hex));
  body.position.y = h / 2;
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);
  // 波纹板：竖向细肋（顶部可见），用略深色
  const dark = new THREE.Color(hex).multiplyScalar(0.78).getHex();
  const ribMat = toon(dark);
  const ribs: THREE.BufferGeometry[] = [];
  for (let x = -len / 2 + 0.35; x < len / 2 - 0.2; x += 0.5) {
    ribs.push(place(new THREE.BoxGeometry(0.12, h - 0.25, wid + 0.06), x, h / 2, 0));
  }
  const ribMesh = new THREE.Mesh(merge(ribs), ribMat);
  g.add(ribMesh);
  // 顶框
  const frame = new THREE.Mesh(new THREE.BoxGeometry(len + 0.05, 0.12, wid + 0.05), toon(0x3a4148));
  frame.position.y = h;
  g.add(frame);
  return g;
}

function makeGatePillar(cx: number, cz: number, hw: number, hh: number): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 1.8, hh * 2), toon(0xf07a24));
  base.position.y = 0.9;
  base.castShadow = true;
  // 黑黄警示斜纹
  const stripes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 4; i++) {
    stripes.push(place(new THREE.BoxGeometry(hw * 2 + 0.04, 0.16, hh * 2 + 0.04), 0, 0.25 + i * 0.42, 0, 0, 0, 0.35));
  }
  const s = new THREE.Mesh(merge(stripes), toon(0x23272b));
  const cap = new THREE.Mesh(new THREE.BoxGeometry(hw * 2 + 0.3, 0.3, hh * 2 + 0.3), toon(0x3a4249));
  cap.position.y = 1.95;
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 10), new THREE.MeshBasicMaterial({ color: 0xffb02e }));
  lamp.position.y = 2.25;
  g.add(base, s, cap, lamp);
  g.position.set(cx, 0, cz);
  // 低矮道闸臂
  const arm = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 0.16), toon(0xffffff));
  arm.position.set(cx < 0 ? 3.2 : -3.2, 1.0, 0.0);
  g.add(arm);
  return g;
}

function makeQuayCrane(): THREE.Group {
  const g = new THREE.Group();
  const orange = toon(0xf07120);
  const dark = toon(0x2e3a44);
  const white = toon(0xf2f4f6);
  // 四条腿（在海堤外侧）
  for (const [x, z] of [[-3.2, 0], [3.2, 0], [-3.2, -6], [3.2, -6]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.75, 11, 0.75), orange);
    leg.position.set(x, 5.5 - 1.2, z);
    leg.castShadow = true;
    g.add(leg);
  }
  // 横梁与斜撑
  for (const z of [0, -6]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.8, 0.8), orange);
    beam.position.set(0, 9.6, z);
    g.add(beam);
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8.0, 0.3), orange);
    brace.position.set(0, 5.6, z);
    brace.rotation.z = 0.68;
    g.add(brace);
  }
  // 吊臂伸向北方海面
  const boom = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 24), orange);
  boom.position.set(0, 11.2, -10);
  boom.castShadow = true;
  g.add(boom);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 1.8), white);
  cabin.position.set(0, 10.1, -3);
  g.add(cabin);
  const win = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0x5fd0ef }));
  win.position.set(0, 10.25, -2.2);
  g.add(win);
  const machine = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.0, 3.4), white);
  machine.position.set(0, 12.6, -4.5);
  g.add(machine);
  const apex = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.5, 0.5), orange);
  apex.position.set(0, 14.0, -3);
  g.add(apex);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3a3a }));
  tip.position.set(0, 16.3, -3);
  g.add(tip);
  void dark;
  addOutline(g, 0.04);
  return g;
}

function makeTower() {
  const g = new THREE.Group();
  const R = ARENA.towerRadius;
  // 底座平台
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.1, R + 0.35, 0.5, 24), toon(0x5a6873));
  base.position.y = 0.25;
  base.receiveShadow = true; base.castShadow = true;
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.12, R + 0.12, 0.12, 24), toon(0xf2c230));
  ring.position.y = 0.52;
  g.add(base, ring);
  // 桁架主体
  const orange = toon(0xf26a1b);
  const legs: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.4, 0.28), orange);
    leg.position.set(Math.cos(a) * 0.95, 2.7, Math.sin(a) * 0.95);
    leg.rotation.set(Math.sin(a) * 0.08, 0, -Math.cos(a) * 0.08);
    leg.castShadow = true;
    legs.push(leg);
    g.add(leg);
  }
  for (const y of [1.4, 2.6, 3.8]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.98 - (y - 1.4) * 0.04, 0.07, 6, 16), orange);
    band.rotation.x = Math.PI / 2;
    band.position.y = y;
    g.add(band);
  }
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 4.2, 12), toon(0xe9edf0));
  core.position.y = 2.6;
  core.castShadow = true;
  g.add(core);
  // 进度光柱：竖直能量条随进度上升
  const barMat = new THREE.MeshBasicMaterial({ color: 0x3ff0ff });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 1, 12), barMat);
  bar.position.y = 0.6;
  g.add(bar);
  // 顶部平台与信标
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.2, 0.35, 16), toon(0x36434e));
  top.position.y = 4.95;
  g.add(top);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x45f2ff });
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.7, 10), beaconMat);
  beacon.position.y = 5.5;
  g.add(beacon);
  const lampArm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.3), toon(0x36434e));
  lampArm.position.y = 5.9;
  g.add(lampArm);
  addOutline(g, 0.035);

  // 地面进度刻度：12 段围绕塔基
  const segs: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 12; i++) {
    const a0 = Math.PI / 2 - (i / 12) * Math.PI * 2;
    const geo = new THREE.RingGeometry(R + 0.55, R + 1.0, 6, 1, a0 - (Math.PI * 2) / 12 + 0.05, (Math.PI * 2) / 12 - 0.1);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.MeshBasicMaterial({ color: 0x9fb0ba, transparent: true, opacity: 0.55, depthWrite: false });
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.y = 0.025;
    mesh.renderOrder = 2;
    g.add(mesh);
    segs.push(m);
  }

  return {
    group: g,
    update(t: number, progress: number, alarm: number) {
      const h = Math.max(0.05, progress) * 4.0;
      bar.scale.y = h;
      bar.position.y = 0.55 + h / 2;
      barMat.color.setHex(progress >= 1 ? 0xff3a86 : 0x3ff0ff);
      const lit = Math.floor(progress * 12 + 1e-4);
      for (let i = 0; i < 12; i++) {
        const s = segs[i];
        if (progress >= 1) {
          s.color.setHex(0xff3a86); s.opacity = 0.6 + 0.3 * Math.sin(t * 8 + i);
        } else if (i < lit) {
          s.color.setHex(0x2fd8f0); s.opacity = 0.85;
        } else if (i === lit) {
          s.color.setHex(0x2fd8f0); s.opacity = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t * 4));
        } else {
          s.color.setHex(0x9fb0ba); s.opacity = 0.45;
        }
      }
      if (alarm > 0.01) beaconMat.color.setHex(Math.sin(t * 14) > 0 ? 0xff2b6d : 0xffb32b);
      else beaconMat.color.setHex(progress >= 1 ? 0xff3a86 : 0x45f2ff);
      beacon.rotation.y = t * 2;
      lampArm.rotation.y = t * 1.2;
      g.position.x = alarm > 0.01 ? Math.sin(t * 30) * 0.03 * alarm : 0;
    },
  };
}

function addProps(group: THREE.Group, rnd: () => number) {
  const drumGeo = merge([
    paint(new THREE.CylinderGeometry(0.34, 0.34, 0.9, 12), 0x2f7e9e),
    paint(place(new THREE.TorusGeometry(0.34, 0.03, 4, 12), 0, 0.2, 0, Math.PI / 2), 0x1d4e63),
    paint(place(new THREE.TorusGeometry(0.34, 0.03, 4, 12), 0, -0.2, 0, Math.PI / 2), 0x1d4e63),
  ]);
  const drumRed = merge([
    paint(new THREE.CylinderGeometry(0.34, 0.34, 0.9, 12), 0xd2453b),
    paint(place(new THREE.TorusGeometry(0.34, 0.03, 4, 12), 0, 0.2, 0, Math.PI / 2), 0x8a2a22),
  ]);
  const palletGeo = merge([
    paint(new THREE.BoxGeometry(1.2, 0.14, 1.0), 0xc79a62),
    paint(place(new THREE.BoxGeometry(1.0, 0.7, 0.85), 0, 0.42, 0), 0xe6d2a8),
    paint(place(new THREE.BoxGeometry(1.02, 0.08, 0.87), 0, 0.5, 0), 0x9a7448),
  ]);
  const coneGeo = merge([
    paint(new THREE.BoxGeometry(0.5, 0.06, 0.5), 0x2a2f34),
    paint(place(new THREE.ConeGeometry(0.2, 0.62, 10), 0, 0.34, 0), 0xff7a1f),
    paint(place(new THREE.CylinderGeometry(0.13, 0.15, 0.1, 10), 0, 0.36, 0), 0xffffff),
  ]);
  const lampGeo = merge([
    paint(new THREE.CylinderGeometry(0.08, 0.1, 3.0, 8), 0x4b5863),
    paint(place(new THREE.BoxGeometry(0.7, 0.12, 0.25), 0.25, 1.5, 0), 0x4b5863),
    paint(place(new THREE.BoxGeometry(0.3, 0.1, 0.2), 0.5, 1.43, 0), 0xfff2b0),
  ]);
  const mat = toon(0xffffff, { vertexColors: true });
  const dummy = new THREE.Object3D();
  const spots: [THREE.BufferGeometry, number, number, number][] = [];
  // 集装箱附近散落
  const clusters: [number, number][] = [[-22.5, -18], [22.5, 18], [-22.5, 19], [22.5, -19], [-6, -19.5], [6, 19.5], [-14, 19], [14, -19]];
  for (const [cx, cz] of clusters) {
    const n = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const r = rnd();
      const geo = r < 0.3 ? drumGeo : r < 0.45 ? drumRed : r < 0.75 ? palletGeo : coneGeo;
      spots.push([geo, cx + (rnd() - 0.5) * 3, cz + (rnd() - 0.5) * 2, rnd() * Math.PI]);
    }
  }
  // 灯柱沿南北两侧
  for (const x of [-24, -8, 8, 24]) {
    spots.push([lampGeo, x, -HH + 0.4, Math.PI / 2]);
  }
  const byGeo = new Map<THREE.BufferGeometry, [number, number, number][]>();
  for (const [geo, x, z, r] of spots) {
    if (!byGeo.has(geo)) byGeo.set(geo, []);
    byGeo.get(geo)!.push([x, z, r]);
  }
  for (const [geo, list] of byGeo) {
    const im = new THREE.InstancedMesh(geo, mat, list.length);
    const yOff = geo === drumGeo || geo === drumRed ? 0.45 : geo === lampGeo ? 1.5 : 0.07;
    list.forEach(([x, z, r], i) => {
      dummy.position.set(x, yOff, z);
      dummy.rotation.set(0, r, 0);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.castShadow = true;
    group.add(im);
  }
}

function makeTetrapod(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const dirs = [[0, 1, 0], [0.94, -0.33, 0], [-0.47, -0.33, 0.82], [-0.47, -0.33, -0.82]];
  for (const [x, y, z] of dirs) {
    const c = new THREE.CylinderGeometry(0.16, 0.34, 1.0, 7);
    c.translate(0, 0.5, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, y, z).normalize());
    c.applyQuaternion(q);
    parts.push(c);
  }
  for (const p of parts) if (p.attributes.uv) p.deleteAttribute('uv');
  return merge(parts);
}

function makeChevrons(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-1.1, 0); shape.lineTo(0, 0.9); shape.lineTo(1.1, 0);
  shape.lineTo(1.1, -0.45); shape.lineTo(0, 0.45); shape.lineTo(-1.1, -0.45); shape.closePath();
  const a = new THREE.ShapeGeometry(shape);
  const b = a.clone().translate(0, -1.1, 0);
  const g = merge([a, b]);
  g.rotateX(-Math.PI / 2);
  // 让箭头指向 -Z（局部前方），再由外部旋转到场内方向
  g.rotateY(Math.PI);
  return g;
}

function makeDeckTexture(w: number, h: number): THREE.CanvasTexture {
  const ppm = 28; // 每米像素
  const c = document.createElement('canvas');
  c.width = Math.min(2048, Math.round(w * ppm));
  c.height = Math.min(2048, Math.round(h * ppm));
  const sx = c.width / w, sy = c.height / h;
  const g = c.getContext('2d')!;
  const rnd = mulberry(42);
  const X = (x: number) => (x + w / 2) * sx;
  const Y = (z: number) => (z + h / 2) * sy;

  // 底色：浅暖灰混凝土
  g.fillStyle = '#c9cdcf';
  g.fillRect(0, 0, c.width, c.height);
  // 板块：4m 一块，轻微色差
  const slab = 4;
  for (let x = -w / 2; x < w / 2; x += slab) {
    for (let z = -h / 2; z < h / 2; z += slab) {
      const v = 196 + Math.floor((rnd() - 0.5) * 12);
      g.fillStyle = `rgb(${v},${v + 3},${v + 5})`;
      g.fillRect(X(x) + 1, Y(z) + 1, slab * sx - 2, slab * sy - 2);
    }
  }
  // 细噪点
  const img = g.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd() - 0.5) * 10;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
  // 接缝
  g.strokeStyle = 'rgba(120,130,138,0.35)';
  g.lineWidth = 2;
  for (let x = -w / 2; x <= w / 2; x += slab) { g.beginPath(); g.moveTo(X(x), 0); g.lineTo(X(x), c.height); g.stroke(); }
  for (let z = -h / 2; z <= h / 2; z += slab) { g.beginPath(); g.moveTo(0, Y(z)); g.lineTo(c.width, Y(z)); g.stroke(); }
  // 油渍与轮胎印
  for (let i = 0; i < 26; i++) {
    const x = X((rnd() - 0.5) * w * 0.9), y = Y((rnd() - 0.5) * h * 0.9);
    const r = (0.8 + rnd() * 2.2) * sx;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(90,96,104,0.16)');
    grd.addColorStop(1, 'rgba(90,96,104,0)');
    g.fillStyle = grd;
    g.beginPath(); g.ellipse(x, y, r, r * (0.5 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = 'rgba(80,86,92,0.10)';
  g.lineWidth = 0.35 * sx;
  for (let i = 0; i < 6; i++) {
    const z0 = (rnd() - 0.5) * h * 0.8;
    g.beginPath();
    g.moveTo(X(-w / 2), Y(z0));
    g.bezierCurveTo(X(-8), Y(z0 + 6 * (rnd() - 0.5)), X(8), Y(z0 + 6 * (rnd() - 0.5)), X(w / 2), Y(z0 + 4 * (rnd() - 0.5)));
    g.stroke();
  }
  // 中央导流圈（黄色虚线，低饱和）
  g.setLineDash([0.9 * sx, 0.6 * sx]);
  g.strokeStyle = 'rgba(214,170,60,0.55)';
  g.lineWidth = 0.22 * sx;
  g.beginPath(); g.arc(X(0), Y(0), 7 * sx, 0, Math.PI * 2); g.stroke();
  g.setLineDash([]);
  // 十字车道线（白色，淡）
  g.strokeStyle = 'rgba(255,255,255,0.45)';
  g.lineWidth = 0.18 * sx;
  for (const off of [-1.6, 1.6]) {
    g.beginPath(); g.moveTo(X(off), Y(-h / 2 + 3)); g.lineTo(X(off), Y(-8)); g.stroke();
    g.beginPath(); g.moveTo(X(off), Y(8)); g.lineTo(X(off), Y(h / 2 - 3)); g.stroke();
    g.beginPath(); g.moveTo(X(-w / 2 + 3), Y(off)); g.lineTo(X(-8), Y(off)); g.stroke();
    g.beginPath(); g.moveTo(X(8), Y(off)); g.lineTo(X(w / 2 - 3), Y(off)); g.stroke();
  }
  // 导流箭头（指向中心）
  g.fillStyle = 'rgba(255,255,255,0.40)';
  const arrow = (x: number, z: number, ang: number) => {
    g.save(); g.translate(X(x), Y(z)); g.rotate(ang);
    g.beginPath();
    g.moveTo(0, -0.9 * sy); g.lineTo(0.55 * sx, 0); g.lineTo(0.2 * sx, 0); g.lineTo(0.2 * sx, 0.9 * sy);
    g.lineTo(-0.2 * sx, 0.9 * sy); g.lineTo(-0.2 * sx, 0); g.lineTo(-0.55 * sx, 0); g.closePath(); g.fill();
    g.restore();
  };
  arrow(0, -15, Math.PI); arrow(0, 15, 0); arrow(-20, 0, Math.PI / 2); arrow(20, 0, -Math.PI / 2);
  // 泊位编号
  g.fillStyle = 'rgba(70,84,96,0.28)';
  g.font = `bold ${Math.round(1.6 * sy)}px sans-serif`;
  g.textAlign = 'center';
  const labels: [string, number, number][] = [['A1', -12, -12], ['A2', 12, -12], ['B1', -12, 12], ['B2', 12, 12]];
  for (const [s, x, z] of labels) g.fillText(s, X(x), Y(z));
  // 场地外圈黄黑警示带
  const band = 0.5;
  for (let i = 0, x = -w / 2; x < w / 2; x += 0.8, i++) {
    g.fillStyle = i % 2 ? 'rgba(242,194,48,0.85)' : 'rgba(40,44,48,0.75)';
    g.fillRect(X(x), Y(-h / 2 + 0.4), 0.8 * sx, band * sy);
    g.fillRect(X(x), Y(h / 2 - 0.4 - band), 0.8 * sx, band * sy);
  }
  // 维修塔周围放射状排水槽
  g.strokeStyle = 'rgba(100,110,118,0.35)';
  g.lineWidth = 0.12 * sx;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.beginPath();
    g.moveTo(X(Math.cos(a) * 3.4), Y(Math.sin(a) * 3.4));
    g.lineTo(X(Math.cos(a) * 5.2), Y(Math.sin(a) * 5.2));
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function cloudTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 160;
  const g = c.getContext('2d')!;
  const rnd = mulberry(3);
  for (let i = 0; i < 9; i++) {
    const x = 50 + rnd() * 156, y = 40 + rnd() * 80, r = 30 + rnd() * 30;
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(255,255,255,0.9)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 160);
  }
  return new THREE.CanvasTexture(c);
}

function clamp(v: number, m: number) {
  return v < -m ? -m : v > m ? m : v;
}

function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
