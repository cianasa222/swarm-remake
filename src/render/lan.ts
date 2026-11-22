import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Game } from '../sim/game';
import { angleDiff } from '../sim/math';
import { blobShadowTex } from './style';

const LAN_SCALE = 1.26;

function lerpAngle(a: number, b: number, t: number): number {
  return a + angleDiff(b, a) * Math.min(1, t);
}

/**
 * 为角色 PBR 材质注入手绘垂直渐变（上亮下暗）与清透边缘光（Rim Light），
 * 无需脏黑外壳描边即可在俯视与特写下获得干净立体的层次感。
 */
function stylizeMat<T extends THREE.MeshStandardMaterial>(mat: T): T {
  mat.customProgramCacheKey = () => 'lan_stylized_v2';
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vStylY;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvStylY = (modelMatrix * vec4(transformed, 1.0)).y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vStylY;')
      .replace(
        '#include <dithering_fragment>',
        `
        gl_FragColor.rgb *= mix(0.74, 1.04, smoothstep(0.05, 1.9, vStylY));
        float rim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 3.0);
        gl_FragColor.rgb += vec3(0.55, 0.88, 1.0) * rim * 0.26;
        #include <dithering_fragment>
        `,
      );
  };
  return mat;
}

// ───────────────────────── 程序化高精度纹理 ─────────────────────────

function makeFaceTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;

  const skinGrd = g.createLinearGradient(0, 80, 0, 480);
  skinGrd.addColorStop(0, '#f4cbb4');
  skinGrd.addColorStop(0.65, '#eebda1');
  skinGrd.addColorStop(1, '#e0a587');
  g.fillStyle = skinGrd;
  g.fillRect(0, 0, 512, 512);

  for (const cx of [145, 367]) {
    const grd = g.createRadialGradient(cx, 316, 6, cx, 316, 56);
    grd.addColorStop(0, 'rgba(248, 128, 114, 0.34)');
    grd.addColorStop(1, 'rgba(248, 128, 114, 0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(cx, 316, 56, 0, Math.PI * 2);
    g.fill();
  }

  g.fillStyle = 'rgba(210, 145, 118, 0.35)';
  g.beginPath();
  g.ellipse(256, 312, 5, 9, 0, 0, Math.PI * 2);
  g.fill();

  for (const side of [-1, 1]) {
    const ex = 256 + side * 74;
    const ey = 252;
    g.save();
    g.translate(ex, ey);
    g.scale(side, 1);

    g.fillStyle = '#fcfdff';
    g.beginPath();
    g.ellipse(0, 0, 38, 29, 0, 0, Math.PI * 2);
    g.fill();

    const iris = g.createLinearGradient(0, -24, 0, 24);
    iris.addColorStop(0, '#0a4a68');
    iris.addColorStop(0.55, '#19a7cc');
    iris.addColorStop(1, '#72f9ff');
    g.fillStyle = iris;
    g.beginPath();
    g.ellipse(4, 2, 23, 25, 0, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#091f2e';
    g.beginPath();
    g.ellipse(4, 2, 10, 13, 0, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(-6, -10, 7, 0, Math.PI * 2);
    g.arc(12, 10, 3.5, 0, Math.PI * 2);
    g.fill();

    g.strokeStyle = '#1b1a22';
    g.lineWidth = 8;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-40, -10);
    g.quadraticCurveTo(0, -34, 42, -16);
    g.stroke();

    g.strokeStyle = '#c45318';
    g.lineWidth = 7.5;
    g.beginPath();
    g.moveTo(-34, -42);
    g.quadraticCurveTo(4, -56, 38, -46);
    g.stroke();

    g.restore();
  }

  g.strokeStyle = '#8b433a';
  g.lineWidth = 5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(226, 376);
  g.quadraticCurveTo(256, 384, 292, 367);
  g.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeCoatTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;

  g.fillStyle = '#eef3f7';
  g.fillRect(0, 0, 512, 512);

  g.strokeStyle = 'rgba(175, 192, 206, 0.28)';
  g.lineWidth = 2;
  for (let i = -512; i < 1024; i += 10) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 512, 512);
    g.stroke();
  }

  g.fillStyle = '#24313d';
  g.fillRect(0, 368, 512, 144);
  g.fillRect(0, 0, 42, 512);

  g.fillStyle = '#ff7b22';
  g.fillRect(0, 346, 512, 22);
  g.fillRect(36, 0, 12, 346);

  g.strokeStyle = 'rgba(55, 72, 88, 0.35)';
  g.lineWidth = 3;
  g.strokeRect(64, 34, 396, 286);

  g.fillStyle = '#ff7b22';
  g.font = 'bold 74px sans-serif';
  g.fillText('07', 350, 120);
  g.fillStyle = '#24313d';
  g.font = 'bold 20px sans-serif';
  g.fillText('TIDELINE', 344, 148);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeHazardTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;

  g.fillStyle = '#ff7d24';
  g.fillRect(0, 0, 256, 256);

  g.fillStyle = '#1b242d';
  for (let i = -256; i < 512; i += 48) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 24, 0);
    g.lineTo(i + 280, 256);
    g.lineTo(i + 256, 256);
    g.closePath();
    g.fill();
  }

  g.fillStyle = '#ff7d24';
  g.fillRect(0, 0, 256, 20);
  g.fillRect(0, 236, 256, 20);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeMetalBumpTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;

  g.fillStyle = '#848484';
  g.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 2) {
    const v = 115 + Math.floor(Math.sin(y * 1.7) * 16 + ((y * 37) % 18));
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(0, y, 256, 1);
  }

  g.strokeStyle = '#383838';
  g.lineWidth = 4;
  g.strokeRect(14, 14, 228, 228);
  g.beginPath();
  g.moveTo(128, 14);
  g.lineTo(128, 242);
  g.stroke();

  g.fillStyle = '#d4d4d4';
  for (const [rx, ry] of [[28, 28], [228, 28], [28, 228], [228, 228], [112, 28], [144, 28]]) {
    g.beginPath();
    g.arc(rx, ry, 5, 0, Math.PI * 2);
    g.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * 对标《无尽狂潮》的发光脚底战术光环：
 * 双层明亮外圈 + 径向刻度 + 淡网格光晕 + 锐利前向指示箭。
 */
function makeReticleTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d')!;
  const cx = 256;
  const cy = 256;

  // 内部微弱科技光晕与网格
  const glow = g.createRadialGradient(cx, cy, 40, cx, cy, 198);
  glow.addColorStop(0, 'rgba(255,255,255,0.03)');
  glow.addColorStop(0.72, 'rgba(255,255,255,0.14)');
  glow.addColorStop(0.95, 'rgba(255,255,255,0.22)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = glow;
  g.beginPath();
  g.arc(cx, cy, 200, 0, Math.PI * 2);
  g.fill();

  g.save();
  g.beginPath();
  g.arc(cx, cy, 168, 0, Math.PI * 2);
  g.clip();
  g.strokeStyle = 'rgba(255,255,255,0.12)';
  g.lineWidth = 2;
  for (let p = 80; p <= 440; p += 28) {
    g.beginPath(); g.moveTo(p, 80); g.lineTo(p, 440); g.stroke();
    g.beginPath(); g.moveTo(80, p); g.lineTo(440, p); g.stroke();
  }
  g.restore();

  // 外圈分段亮弧
  g.strokeStyle = '#ffffff';
  g.lineWidth = 9;
  g.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const a0 = i * (Math.PI / 2) + 0.2;
    const a1 = (i + 1) * (Math.PI / 2) - 0.2;
    g.beginPath();
    g.arc(cx, cy, 194, a0, a1);
    g.stroke();
  }

  // 内细环 + 径向刻度
  g.strokeStyle = 'rgba(255,255,255,0.72)';
  g.lineWidth = 4;
  g.beginPath();
  g.arc(cx, cy, 168, 0, Math.PI * 2);
  g.stroke();

  g.lineWidth = 3;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r0 = i % 6 === 0 ? 154 : 161;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    g.lineTo(cx + Math.cos(a) * 168, cy + Math.sin(a) * 168);
    g.stroke();
  }

  // 锐利前向箭头（在顶部 -Y，经 rotateX(-PI/2) + rotateY(PI) 后指向 +Z 前方）
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.moveTo(cx, 12);
  g.lineTo(cx + 34, 72);
  g.lineTo(cx + 12, 60);
  g.lineTo(cx + 12, 92);
  g.lineTo(cx - 12, 92);
  g.lineTo(cx - 12, 60);
  g.lineTo(cx - 34, 72);
  g.closePath();
  g.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ───────────────────────── 平滑自定义几何 ─────────────────────────

function makeHairLockGeo(
  pts: [number, number, number][],
  widths: number[],
  thicks: number[],
  segs = 10,
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const radial = 8;
  const pos: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];

  const up = new THREE.Vector3(0, 1, 0);
  const alt = new THREE.Vector3(0, 0, 1);

  const sampleLerp = (arr: number[], u: number) => {
    const f = u * (arr.length - 1);
    const i = Math.min(arr.length - 2, Math.floor(f));
    const t = f - i;
    return arr[i] * (1 - t) + arr[i + 1] * t;
  };

  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const p = curve.getPointAt(u);
    const tang = curve.getTangentAt(u).normalize();
    const ref = Math.abs(tang.dot(up)) > 0.92 ? alt : up;
    const side = new THREE.Vector3().crossVectors(ref, tang).normalize();
    const binorm = new THREE.Vector3().crossVectors(tang, side).normalize();

    const w = sampleLerp(widths, u);
    const th = sampleLerp(thicks, u);

    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      pos.push(
        p.x + side.x * Math.cos(a) * w + binorm.x * Math.sin(a) * th,
        p.y + side.y * Math.cos(a) * w + binorm.y * Math.sin(a) * th,
        p.z + side.z * Math.cos(a) * w + binorm.z * Math.sin(a) * th,
      );
      uvs.push(j / radial, u);
    }
  }

  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radial; j++) {
      const next = (j + 1) % radial;
      const a = i * radial + j;
      const b = i * radial + next;
      const c = (i + 1) * radial + next;
      const d = (i + 1) * radial + j;
      idx.push(a, b, c, a, c, d);
    }
  }

  const tipCenter = curve.getPointAt(1);
  const tipIdx = pos.length / 3;
  pos.push(tipCenter.x, tipCenter.y, tipCenter.z);
  uvs.push(0.5, 1);
  const lastRing = segs * radial;
  for (let j = 0; j < radial; j++) {
    idx.push(lastRing + j, lastRing + ((j + 1) % radial), tipIdx);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ───────────────────────── 主角「岚」骨骼装配体 ─────────────────────────

export class LanRig {
  readonly root = new THREE.Group();

  private hips = new THREE.Group();
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private hairPivot = new THREE.Group();

  private legL = new THREE.Group();
  private legR = new THREE.Group();
  private kneeL = new THREE.Group();
  private kneeR = new THREE.Group();

  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private coatTail = new THREE.Group();
  private sash = new THREE.Group();

  private gunPivot = new THREE.Group();
  private mgMesh = new THREE.Group();
  private mgSpin = new THREE.Group();
  private mgPierceFin = new THREE.Group();
  private cnMesh = new THREE.Group();
  private cnShardsWing = new THREE.Group();
  private cnPulseRing = new THREE.Group();
  private cnPistonL!: THREE.Mesh;
  private cnPistonR!: THREE.Mesh;

  private pbrMats: THREE.MeshStandardMaterial[] = [];
  private gogLensMat: THREE.MeshPhysicalMaterial;
  private packCoreMat: THREE.MeshStandardMaterial;
  private packJetMat: THREE.MeshBasicMaterial;
  private heelJetMat: THREE.MeshBasicMaterial;
  private mgGlowMat: THREE.MeshStandardMaterial;
  private mgFocusMat: THREE.MeshStandardMaterial;
  private cnGlowMat: THREE.MeshStandardMaterial;
  private cnPulseMat: THREE.MeshStandardMaterial;

  private facing: THREE.Mesh;
  private facingMat: THREE.MeshBasicMaterial;
  private auraRing: THREE.Mesh;
  private auraMat: THREE.MeshBasicMaterial;
  private pickupRing: THREE.Mesh;

  private legYaw = 0;
  private aimYaw = 0;
  private hairSwings: { mesh: THREE.Mesh; baseRx: number; baseRz: number; phase: number }[] = [];

  constructor() {
    const faceTex = makeFaceTex();
    const coatTex = makeCoatTex();
    const hazardTex = makeHazardTex();
    const metalBump = makeMetalBumpTex();
    const reticleTex = makeReticleTex();

    const mkStd = (opts: THREE.MeshStandardMaterialParameters) => {
      const m = stylizeMat(new THREE.MeshStandardMaterial(opts));
      this.pbrMats.push(m);
      return m;
    };

    const skinMat = mkStd({ color: 0xeec0a5, roughness: 0.68, metalness: 0.01 });
    const faceMat = mkStd({ map: faceTex, roughness: 0.64, metalness: 0.01 });
    const hairOrange = mkStd({ color: 0xff7d26, roughness: 0.44, metalness: 0.05 });
    const hairWhite = mkStd({ color: 0xfff8ee, roughness: 0.42, metalness: 0.05 });
    const coatMat = mkStd({ map: coatTex, roughness: 0.56, metalness: 0.04 });
    const coatWhiteMat = mkStd({ color: 0xeef3f7, roughness: 0.54, metalness: 0.05 });
    const coatOrange = mkStd({ color: 0xff7b22, roughness: 0.46, metalness: 0.12 });
    const hazardMat = mkStd({ map: hazardTex, roughness: 0.44, metalness: 0.2 });
    const tealDarkMat = mkStd({ color: 0x14364a, roughness: 0.58, metalness: 0.08 });
    const navyMat = mkStd({ color: 0x182942, roughness: 0.58, metalness: 0.1 });
    const bootMat = mkStd({ color: 0x202730, roughness: 0.52, metalness: 0.22 });
    const metalMat = mkStd({
      color: 0x8e9da9, roughness: 0.3, metalness: 0.84,
      bumpMap: metalBump, bumpScale: 0.014, roughnessMap: metalBump,
    });
    const darkMetalMat = mkStd({
      color: 0x27313b, roughness: 0.36, metalness: 0.8,
      bumpMap: metalBump, bumpScale: 0.012,
    });
    const jointOrangeMat = mkStd({ color: 0xff7b22, roughness: 0.32, metalness: 0.62 });

    // ── 接地影 & 发光脚底战术光环 ──
    const shadowMat = new THREE.MeshBasicMaterial({ map: blobShadowTex(), transparent: true, depthWrite: false });
    const shadowGeo = new THREE.PlaneGeometry(1.75, 1.75);
    shadowGeo.rotateX(-Math.PI / 2);
    const pShadow = new THREE.Mesh(shadowGeo, shadowMat);
    pShadow.position.y = 0.02;
    this.root.add(pShadow);

    const reticleGeo = new THREE.PlaneGeometry(2.35, 2.35);
    reticleGeo.rotateX(-Math.PI / 2);
    reticleGeo.rotateY(Math.PI); // 关键：让纹理顶部箭头严格指向角色前方 +Z
    this.facingMat = new THREE.MeshBasicMaterial({
      map: reticleTex, color: 0x32f4ff, transparent: true, opacity: 0.92, depthWrite: false,
    });
    this.facing = new THREE.Mesh(reticleGeo, this.facingMat);
    this.facing.position.y = 0.035;
    this.facing.renderOrder = 6;

    this.auraMat = new THREE.MeshBasicMaterial({ color: 0x45f8ff, transparent: true, opacity: 0, depthWrite: false });
    const auraGeo = new THREE.RingGeometry(0.96, 1.24, 36);
    auraGeo.rotateX(-Math.PI / 2);
    this.auraRing = new THREE.Mesh(auraGeo, this.auraMat);
    this.auraRing.position.y = 0.045;
    this.auraRing.renderOrder = 7;

    const prGeo = new THREE.RingGeometry(0.975, 1.0, 48);
    prGeo.rotateX(-Math.PI / 2);
    this.pickupRing = new THREE.Mesh(prGeo, new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.14, depthWrite: false,
    }));
    this.pickupRing.position.y = 0.03;

    this.root.add(this.facing, this.auraRing, this.pickupRing);

    // ── 修长 5 头身骨架根部（hips 高 0.83m，使鞋底稳踩 y=0） ──
    const rigRoot = new THREE.Group();
    rigRoot.scale.setScalar(LAN_SCALE);
    this.root.add(rigRoot);

    this.hips.position.y = 0.83;
    rigRoot.add(this.hips);

    // ── 修长深蓝护腿（细大腿 + 独立膝关节 + 流线护腿 + 工业工靴 + 脚跟喷口） ──
    this.heelJetMat = new THREE.MeshBasicMaterial({ color: 0x45f5ff, transparent: true, opacity: 0 });
    const mkLeg = (side: number, legGrp: THREE.Group, kneeGrp: THREE.Group) => {
      legGrp.position.set(side * 0.11, 0, 0);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.25, 6, 12), navyMat);
      thigh.position.y = -0.19;

      const strap = new THREE.Mesh(new THREE.TorusGeometry(0.074, 0.013, 6, 16), coatOrange);
      strap.rotation.x = Math.PI / 2;
      strap.position.y = -0.2;

      kneeGrp.position.set(0, -0.39, 0);
      const kneePad = new THREE.Mesh(new RoundedBoxGeometry(0.135, 0.11, 0.095, 3, 0.025), metalMat);
      kneePad.position.set(0, 0, 0.055);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.056, 0.28, 12), navyMat);
      shin.position.y = -0.17;

      const shinGuard = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.22, 0.06, 2, 0.018), darkMetalMat);
      shinGuard.position.set(0, -0.17, 0.048);

      const bootUpper = new THREE.Mesh(new RoundedBoxGeometry(0.135, 0.09, 0.23, 3, 0.025), bootMat);
      bootUpper.position.set(0, -0.37, 0.035);
      const sole = new THREE.Mesh(new RoundedBoxGeometry(0.148, 0.04, 0.25, 2, 0.012), coatOrange);
      sole.position.set(0, -0.42, 0.035);

      const heelJet = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 8), this.heelJetMat);
      heelJet.rotation.x = -Math.PI / 2;
      heelJet.position.set(0, -0.37, -0.15);

      kneeGrp.add(kneePad, shin, shinGuard, bootUpper, sole, heelJet);
      legGrp.add(thigh, strap, kneeGrp);
    };
    mkLeg(-1, this.legL, this.kneeL);
    mkLeg(1, this.legR, this.kneeR);
    this.hips.add(this.legL, this.legR);

    // ── 上身躯干（纤细收腰暗青内衬 + 不对称防浪外套 + 飘逸长摆与腰带飘带） ──
    this.hips.add(this.torso);

    const torsoPts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.14, 0.0),
      new THREE.Vector2(0.12, 0.16),
      new THREE.Vector2(0.175, 0.37),
      new THREE.Vector2(0.15, 0.48),
      new THREE.Vector2(0.0, 0.5),
    ];
    const torsoMesh = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 16), tealDarkMat);
    torsoMesh.scale.set(1.08, 1, 0.76);
    this.torso.add(torsoMesh);

    const belt = new THREE.Mesh(new RoundedBoxGeometry(0.35, 0.068, 0.26, 3, 0.018), bootMat);
    belt.position.y = 0.02;
    const buckle = new THREE.Mesh(new RoundedBoxGeometry(0.088, 0.056, 0.035, 2, 0.01), metalMat);
    buckle.position.set(0, 0.02, 0.135);
    const beltMine = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12), jointOrangeMat);
    beltMine.position.set(-0.185, 0.01, 0.03);
    beltMine.rotation.z = 0.25;
    this.torso.add(belt, buckle, beltMine);

    // 不对称防浪外套（圆润贴身剪裁 + 飘逸浅白长摆）
    const coatL = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.42, 0.25, 4, 0.05), coatMat);
    coatL.position.set(-0.075, 0.26, 0);
    const coatR = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.3, 0.24, 4, 0.045), coatMat);
    coatR.position.set(0.085, 0.32, 0);
    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 10), coatWhiteMat);
    shoulderL.position.set(-0.185, 0.4, 0.01);

    // 轻盈斜飘的左侧防浪长衣摆（使用纯白布料避免 UV 偏移发黑）
    this.coatTail.position.set(-0.09, 0.06, -0.02);
    const tailShape = new THREE.Shape();
    tailShape.moveTo(-0.08, 0);
    tailShape.lineTo(0.09, 0);
    tailShape.lineTo(0.11, -0.31);
    tailShape.lineTo(-0.02, -0.37);
    tailShape.lineTo(-0.12, -0.27);
    tailShape.closePath();
    const tailGeo = new THREE.ExtrudeGeometry(tailShape, {
      depth: 0.024, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2,
    });
    const tailMesh = new THREE.Mesh(tailGeo, coatWhiteMat);
    tailMesh.position.set(0, 0, -0.1);
    tailMesh.rotation.x = 0.35;
    const tailTrim = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.032, 0.045, 2, 0.01), coatOrange);
    tailTrim.position.set(-0.005, -0.28, -0.19);
    tailTrim.rotation.x = 0.35;
    this.coatTail.add(tailMesh, tailTrim);

    // 亮橙镶青边的动态防风腰带飘带（强化跑动方向感）
    this.sash.position.set(0.14, 0.03, -0.09);
    const sashCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, -0.14, -0.18),
      new THREE.Vector3(0.08, -0.32, -0.38),
      new THREE.Vector3(0.06, -0.44, -0.54),
    ]);
    const sashGeo = new THREE.TubeGeometry(sashCurve, 12, 0.026, 6, false);
    sashGeo.scale(1.6, 0.55, 1);
    const sashMesh = new THREE.Mesh(sashGeo, coatOrange);
    this.sash.add(sashMesh);

    // 高翻白橙防风立领
    const collarOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.205, 0.125, 18, 1, false, Math.PI * 0.25, Math.PI * 1.5), coatOrange);
    collarOuter.position.set(0, 0.485, -0.01);
    const collarInner = new THREE.Mesh(new THREE.CylinderGeometry(0.168, 0.185, 0.108, 18, 1, false, Math.PI * 0.25, Math.PI * 1.5), coatMat);
    collarInner.position.set(0, 0.49, -0.01);

    // 右肩斜切橙黑警示肩甲
    const padR = new THREE.Mesh(new RoundedBoxGeometry(0.19, 0.125, 0.24, 3, 0.03), hazardMat);
    padR.position.set(0.22, 0.43, 0.0);
    padR.rotation.z = -0.24;
    const padTrim = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.036, 0.25, 2, 0.01), coatOrange);
    padTrim.position.set(0.22, 0.475, 0.0);
    padTrim.rotation.z = -0.24;

    this.torso.add(coatL, coatR, shoulderL, this.coatTail, this.sash, collarOuter, collarInner, padR, padTrim);

    // ── 工业拆械背包 ──
    const pack = new THREE.Group();
    pack.position.set(0, 0.29, -0.19);
    const packCase = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.31, 0.14, 3, 0.03), darkMetalMat);
    const packFrame = new THREE.Mesh(new RoundedBoxGeometry(0.31, 0.06, 0.16, 2, 0.018), coatMat);
    packFrame.position.y = 0.12;
    this.packCoreMat = new THREE.MeshStandardMaterial({
      color: 0x4df6ff, emissive: 0x1ac8e8, emissiveIntensity: 1.5, roughness: 0.2, metalness: 0.1,
    });
    const packCore = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.2, 12), this.packCoreMat);
    packCore.position.set(0, -0.01, -0.05);
    const packCage = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 6, 14), metalMat);
    packCage.rotation.x = Math.PI / 2;
    packCage.position.set(0, -0.01, -0.05);

    this.packJetMat = new THREE.MeshBasicMaterial({ color: 0x5af7ff, transparent: true, opacity: 0 });
    const packJet = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.36, 10), this.packJetMat);
    packJet.rotation.x = -Math.PI / 2;
    packJet.position.set(0, -0.05, -0.25);

    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.05, -0.03),
      new THREE.Vector3(0.21, 0.09, -0.06),
      new THREE.Vector3(0.24, 0.07, 0.1),
    ]);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 12, 0.02, 8, false), jointOrangeMat);
    pack.add(packCase, packFrame, packCore, packCage, packJet, cable);
    this.torso.add(pack);

    // ── 紧凑头部 + 14 缕立体橙白短发 + 发光青色护目镜 ──
    this.head.position.set(0, 0.53, 0.01);
    this.torso.add(this.head);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.064, 0.1, 12), skinMat);
    neck.position.y = 0.02;
    const headBase = new THREE.Mesh(new THREE.SphereGeometry(0.158, 20, 16), skinMat);
    headBase.scale.set(0.96, 1.04, 0.96);
    headBase.position.y = 0.16;

    const facePatch = new THREE.Mesh(
      new THREE.SphereGeometry(0.159, 20, 14, -Math.PI * 0.32, Math.PI * 0.64, Math.PI * 0.24, Math.PI * 0.56),
      faceMat,
    );
    facePatch.rotation.y = Math.PI / 2;
    facePatch.scale.set(0.96, 1.04, 0.96);
    facePatch.position.y = 0.16;

    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), skinMat);
      ear.scale.set(0.55, 1, 0.7);
      ear.position.set(s * 0.154, 0.155, -0.01);
      this.head.add(ear);
    }

    this.hairPivot.position.set(0, 0.185, -0.01);
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.168, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.44),
      hairOrange,
    );
    hairCap.position.set(0, 0.02, -0.008);
    hairCap.rotation.x = -0.18;
    this.hairPivot.add(hairCap);

    const hairDefs: { pts: [number, number, number][]; w: number[]; th: number[]; white?: boolean; phase: number }[] = [
      { pts: [[-0.07, 0.13, 0.07], [-0.13, 0.08, 0.16], [-0.15, 0.0, 0.19]], w: [0.06, 0.042, 0.007], th: [0.03, 0.022, 0.005], phase: 0.2 },
      { pts: [[0.01, 0.14, 0.08], [0.04, 0.09, 0.19], [0.07, 0.01, 0.21]], w: [0.066, 0.046, 0.007], th: [0.032, 0.022, 0.005], white: true, phase: 0.7 },
      { pts: [[0.1, 0.12, 0.06], [0.16, 0.06, 0.15], [0.19, -0.01, 0.16]], w: [0.056, 0.038, 0.007], th: [0.028, 0.02, 0.005], phase: 1.3 },
      { pts: [[-0.03, 0.15, 0.0], [-0.07, 0.25, 0.04], [-0.11, 0.29, 0.08]], w: [0.054, 0.036, 0.005], th: [0.03, 0.02, 0.004], phase: 1.9 },
      { pts: [[0.04, 0.15, 0.0], [0.1, 0.26, 0.02], [0.16, 0.3, -0.03]], w: [0.054, 0.036, 0.005], th: [0.03, 0.02, 0.004], white: true, phase: 2.4 },
      { pts: [[-0.12, 0.1, 0.0], [-0.22, 0.05, -0.02], [-0.26, -0.02, -0.05]], w: [0.058, 0.04, 0.007], th: [0.032, 0.022, 0.005], phase: 2.9 },
      { pts: [[-0.12, 0.05, -0.05], [-0.21, 0.0, -0.12], [-0.25, -0.06, -0.17]], w: [0.058, 0.04, 0.007], th: [0.03, 0.02, 0.005], phase: 3.4 },
      { pts: [[0.12, 0.1, 0.0], [0.22, 0.05, -0.01], [0.26, -0.01, -0.04]], w: [0.058, 0.04, 0.007], th: [0.032, 0.022, 0.005], white: true, phase: 3.9 },
      { pts: [[0.12, 0.05, -0.05], [0.21, 0.0, -0.12], [0.25, -0.06, -0.17]], w: [0.058, 0.04, 0.007], th: [0.03, 0.02, 0.005], phase: 4.4 },
      { pts: [[-0.09, 0.11, -0.11], [-0.15, 0.08, -0.23], [-0.19, 0.01, -0.32]], w: [0.064, 0.045, 0.007], th: [0.034, 0.024, 0.005], phase: 4.9 },
      { pts: [[-0.03, 0.12, -0.13], [-0.04, 0.11, -0.27], [-0.05, 0.05, -0.36]], w: [0.068, 0.048, 0.007], th: [0.036, 0.024, 0.005], phase: 5.4 },
      { pts: [[0.05, 0.12, -0.12], [0.09, 0.1, -0.26], [0.12, 0.04, -0.35]], w: [0.066, 0.046, 0.007], th: [0.034, 0.024, 0.005], white: true, phase: 5.8 },
      { pts: [[0.11, 0.1, -0.1], [0.18, 0.06, -0.22], [0.23, 0.0, -0.3]], w: [0.06, 0.042, 0.007], th: [0.032, 0.022, 0.005], phase: 6.2 },
      { pts: [[0.0, 0.02, -0.15], [0.0, -0.04, -0.24], [0.0, -0.11, -0.29]], w: [0.08, 0.052, 0.01], th: [0.03, 0.02, 0.005], phase: 0.4 },
    ];
    for (const d of hairDefs) {
      const m = new THREE.Mesh(makeHairLockGeo(d.pts, d.w, d.th, 8), d.white ? hairWhite : hairOrange);
      this.hairPivot.add(m);
      this.hairSwings.push({ mesh: m, baseRx: 0, baseRz: 0, phase: d.phase });
    }

    // 发光青色护目镜（贴合额前）
    const gogGroup = new THREE.Group();
    gogGroup.position.set(0, 0.225, 0.005);
    gogGroup.rotation.x = -0.1;
    const gogBand = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.014, 8, 28), darkMetalMat);
    gogBand.rotation.x = Math.PI / 2;
    const gogFrame = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.072, 0.056, 3, 0.018), darkMetalMat);
    gogFrame.position.set(0, 0.005, 0.145);
    const gogNose = new THREE.Mesh(new RoundedBoxGeometry(0.04, 0.028, 0.03, 2, 0.008), coatOrange);
    gogNose.position.set(0, -0.018, 0.165);

    this.gogLensMat = new THREE.MeshPhysicalMaterial({
      color: 0x3ef5ff,
      emissive: 0x16b8d8,
      emissiveIntensity: 0.9,
      roughness: 0.08,
      metalness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const gogLens = new THREE.Mesh(new RoundedBoxGeometry(0.21, 0.052, 0.024, 3, 0.012), this.gogLensMat);
    gogLens.position.set(0, 0.005, 0.17);
    gogGroup.add(gogBand, gogFrame, gogNose, gogLens);

    this.head.add(neck, headBase, facePatch, this.hairPivot, gogGroup);

    // ── 左臂（机能布袖 + 手套协同托枪） ──
    this.armL.position.set(-0.2, 0.39, 0.02);
    const sleeveL = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.19, 6, 10), coatMat);
    sleeveL.position.set(0.02, -0.09, 0.07);
    sleeveL.rotation.set(-0.65, 0, -0.22);
    const cuffL = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.052, 0.045, 10), coatOrange);
    cuffL.position.set(0.07, -0.17, 0.17);
    cuffL.rotation.set(-0.65, 0, -0.22);
    const gloveL = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.08, 0.1, 2, 0.022), bootMat);
    gloveL.position.set(0.14, -0.2, 0.27);
    this.armL.add(sleeveL, cuffL, gloveL);
    this.torso.add(this.armL);

    // ── 右侧单侧机械护臂 ──
    this.armR.position.set(0.21, 0.39, 0.01);
    const mechUpper = new THREE.Mesh(new RoundedBoxGeometry(0.115, 0.19, 0.125, 3, 0.026), metalMat);
    mechUpper.position.set(0.01, -0.08, 0.01);
    const mechJoint = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), jointOrangeMat);
    mechJoint.position.set(0.02, -0.185, 0.04);
    const mechFore = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.125, 0.25, 3, 0.026), metalMat);
    mechFore.position.set(0.02, -0.195, 0.17);
    const mechStrip = new THREE.Mesh(new RoundedBoxGeometry(0.024, 0.032, 0.17, 2, 0.008), this.packCoreMat);
    mechStrip.position.set(0.08, -0.195, 0.17);
    const mechHand = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.1, 0.11, 2, 0.022), darkMetalMat);
    mechHand.position.set(0.01, -0.195, 0.31);
    this.armR.add(mechUpper, mechJoint, mechFore, mechStrip, mechHand);
    this.torso.add(this.armR);

    // ── 放大体量的双形态重武器（纤细身板 × 重火力反差，总长 ~1.05m 局部尺度） ──
    this.gunPivot.position.set(0.2, 0.2, 0.32);
    this.gunPivot.add(this.mgMesh, this.cnMesh);
    this.torso.add(this.gunPivot);

    // 1) 铆钉机枪
    this.mgGlowMat = new THREE.MeshStandardMaterial({
      color: 0x264458, emissive: 0x16809e, emissiveIntensity: 0.55, roughness: 0.25, metalness: 0.75,
    });
    this.mgFocusMat = new THREE.MeshStandardMaterial({
      color: 0x45f8ff, emissive: 0x28e4ff, emissiveIntensity: 1.6, roughness: 0.2, metalness: 0.3,
    });

    const mgRec = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.19, 0.62, 3, 0.03), metalMat);
    const mgTopRail = new THREE.Mesh(new RoundedBoxGeometry(0.088, 0.045, 0.48, 2, 0.012), darkMetalMat);
    mgTopRail.position.set(0, 0.11, 0.02);
    const mgSight = new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.072, 0.11, 2, 0.014), darkMetalMat);
    mgSight.position.set(0, 0.155, -0.02);
    const mgSightGlass = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.045, 0.012), this.gogLensMat);
    mgSightGlass.position.set(0, 0.158, 0.03);

    const mgShroud = new THREE.Mesh(new RoundedBoxGeometry(0.135, 0.135, 0.32, 2, 0.024), darkMetalMat);
    mgShroud.position.z = 0.41;

    this.mgSpin.position.set(0, 0.01, 0.56);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.54, 8), this.mgGlowMat);
      bar.rotation.x = Math.PI / 2;
      bar.position.set(Math.cos(a) * 0.032, Math.sin(a) * 0.032, 0);
      this.mgSpin.add(bar);
    }
    const mgMuzzleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.045, 12), coatOrange);
    mgMuzzleCap.rotation.x = Math.PI / 2;
    mgMuzzleCap.position.z = 0.25;
    this.mgSpin.add(mgMuzzleCap);

    // 大号标志性侧挂青白弹鼓
    const drumBody = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.15, 20), mkStd({ color: 0x26b8d8, roughness: 0.34, metalness: 0.32 }));
    drumBody.rotation.z = Math.PI / 2;
    drumBody.position.set(0.165, -0.035, 0.03);
    const drumHub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.17, 16), coatMat);
    drumHub.rotation.z = Math.PI / 2;
    drumHub.position.set(0.165, -0.035, 0.03);
    const drumFeed = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.08, 0.12, 2, 0.015), darkMetalMat);
    drumFeed.position.set(0.085, -0.02, 0.03);

    const finL = new THREE.Mesh(new RoundedBoxGeometry(0.028, 0.07, 0.44, 2, 0.008), this.mgFocusMat);
    finL.position.set(-0.09, 0.03, 0.54);
    const finR = finL.clone();
    finR.position.x = 0.09;
    this.mgPierceFin.add(finL, finR);
    this.mgPierceFin.visible = false;

    this.mgMesh.add(mgRec, mgTopRail, mgSight, mgSightGlass, mgShroud, this.mgSpin, drumBody, drumHub, drumFeed, this.mgPierceFin);

    // 2) 震荡炮
    this.cnGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffa832, emissive: 0xff6e12, emissiveIntensity: 0.9, roughness: 0.25, metalness: 0.4,
    });
    this.cnPulseMat = new THREE.MeshStandardMaterial({
      color: 0x45f5ff, emissive: 0x24d6ff, emissiveIntensity: 1.6, roughness: 0.2, metalness: 0.25,
    });

    const cnBody = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.31, 0.64, 3, 0.04), darkMetalMat);
    const cnHood = new THREE.Mesh(new RoundedBoxGeometry(0.37, 0.14, 0.46, 3, 0.032), coatOrange);
    cnHood.position.set(0, 0.16, -0.02);
    const cnHazardPlate = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.034, 0.26, 2, 0.01), hazardMat);
    cnHazardPlate.position.set(0, 0.235, -0.04);
    const cnCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.23, 0.11, 16), metalMat);
    cnCollar.rotation.x = Math.PI / 2;
    cnCollar.position.z = 0.36;
    const cnCap = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.16, 12), this.cnGlowMat);
    cnCap.rotation.z = Math.PI / 2;
    cnCap.position.set(0, 0.05, -0.32);

    const pistonGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.28, 8);
    pistonGeo.rotateX(Math.PI / 2);
    this.cnPistonL = new THREE.Mesh(pistonGeo, metalMat);
    this.cnPistonL.position.set(-0.18, 0.02, 0.2);
    this.cnPistonR = new THREE.Mesh(pistonGeo, metalMat);
    this.cnPistonR.position.set(0.18, 0.02, 0.2);

    for (const [bx, by] of [[-0.098, 0.058], [0.098, 0.058], [0, -0.1]]) {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.078, 0.4, 12), darkMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(bx, by, 0.56);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.014, 6, 14), coatOrange);
      rim.position.set(bx, by, 0.755);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.024, 10), this.cnGlowMat);
      core.rotation.x = Math.PI / 2;
      core.position.set(bx, by, 0.75);
      this.cnMesh.add(barrel, rim, core);
    }

    for (const s of [-1, 1]) {
      const wing = new THREE.Mesh(new RoundedBoxGeometry(0.045, 0.14, 0.28, 2, 0.01), coatOrange);
      wing.position.set(s * 0.215, 0.03, 0.48);
      wing.rotation.z = s * -0.25;
      this.cnShardsWing.add(wing);
    }
    this.cnShardsWing.visible = false;

    const pulseCoil = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.022, 8, 20), this.cnPulseMat);
    pulseCoil.position.set(0, 0, 0.52);
    this.cnPulseRing.add(pulseCoil);
    this.cnPulseRing.visible = false;

    this.cnMesh.add(
      cnBody, cnHood, cnHazardPlate, cnCollar, cnCap,
      this.cnPistonL, this.cnPistonR, this.cnShardsWing, this.cnPulseRing,
    );

    rigRoot.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.material !== this.packJetMat && m.material !== this.heelJetMat) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
  }

  update(g: Game, dt: number) {
    const p = g.player;
    const t = g.clock;

    this.root.position.set(p.x, 0, p.z);

    // ── 上/下身朝向分离：腿朝移动方向，上身带微侧身战斗架势转向目标 ──
    const targetAim = Math.atan2(p.faceX, p.faceZ);
    const moveAng = Math.atan2(p.lastMoveX, p.lastMoveZ);
    const k = Math.min(1, dt * 16);
    this.aimYaw = lerpAngle(this.aimYaw, targetAim, k);

    const moving = p.moving || p.dashT > 0;
    let legTarget = this.aimYaw - 0.24; // 待机时微侧身 14° 站姿
    let strideSign = 1;
    if (moving) {
      const d = Math.abs(angleDiff(moveAng, this.aimYaw));
      if (d > Math.PI * 0.62) {
        legTarget = moveAng + Math.PI;
        strideSign = -1;
      } else {
        legTarget = moveAng;
      }
    }
    this.legYaw = lerpAngle(this.legYaw, legTarget, Math.min(1, dt * 12));
    this.hips.rotation.y = this.legYaw;
    this.torso.rotation.y = angleDiff(this.aimYaw, this.legYaw);

    // ── 奔跑 / 闪避 / 侧身待机动画 ──
    const dashing = p.dashT > 0;
    const freq = 14.5;
    if (dashing) {
      this.hips.position.y = 0.72;
      this.legL.rotation.x = 0.58;
      this.kneeL.rotation.x = 0.45;
      this.legR.rotation.x = -0.68;
      this.kneeR.rotation.x = 0.72;
      this.torso.rotation.x = 0.34;
    } else if (moving) {
      const s = Math.sin(t * freq) * strideSign;
      const c = Math.cos(t * freq) * strideSign;
      this.hips.position.y = 0.83 + Math.abs(Math.sin(t * freq)) * 0.06;
      this.legL.rotation.x = s * 0.64;
      this.legR.rotation.x = -s * 0.64;
      this.kneeL.rotation.x = Math.max(0, -c) * 0.88;
      this.kneeR.rotation.x = Math.max(0, c) * 0.88;
      this.torso.rotation.x = 0.11 + p.recoil * -0.06;
    } else {
      const breath = Math.sin(t * 2.6);
      this.hips.position.y = 0.83 + breath * 0.012;
      this.legL.rotation.x = lerpAngle(this.legL.rotation.x, -0.18, dt * 10);
      this.legR.rotation.x = lerpAngle(this.legR.rotation.x, 0.14, dt * 10);
      this.kneeL.rotation.x = lerpAngle(this.kneeL.rotation.x, 0.22, dt * 10);
      this.kneeR.rotation.x = lerpAngle(this.kneeR.rotation.x, 0.1, dt * 10);
      this.torso.rotation.x = 0.05 + breath * 0.015 - p.recoil * (p.weapon === 'cn' ? 0.12 : 0.03);
    }

    // ── 次级动态：衣摆、腰带飘带 & 短发随速度弹性飘动 ──
    const speedRatio = dashing ? 1.55 : moving ? 1.0 : 0.16;
    this.coatTail.rotation.x = 0.26 * speedRatio + Math.sin(t * 11) * (moving ? 0.18 : 0.035);
    this.sash.rotation.x = 0.34 * speedRatio + Math.cos(t * 10.5) * (moving ? 0.2 : 0.04);
    this.sash.rotation.y = Math.sin(t * 7.5) * (moving ? 0.14 : 0.04);
    for (const h of this.hairSwings) {
      h.mesh.rotation.x = h.baseRx - speedRatio * 0.14 + Math.sin(t * 9 + h.phase) * (moving ? 0.08 : 0.018);
      h.mesh.rotation.z = h.baseRz + Math.cos(t * 7 + h.phase) * (moving ? 0.05 : 0.012);
    }

    // ── 双武器显示、后坐、换枪与升级可视变化 ──
    this.mgMesh.visible = p.weapon === 'mg';
    this.cnMesh.visible = p.weapon === 'cn';

    const kick = p.weapon === 'cn' ? 0.2 : 0.055;
    this.gunPivot.position.z = 0.32 - p.recoil * kick;
    this.gunPivot.rotation.x = p.swapT > 0
      ? -Math.sin((p.swapT / 0.7) * Math.PI) * 1.15
      : -p.recoil * (p.weapon === 'cn' ? 0.24 : 0.04);

    const meowLv = g.weaponLv('jinx_meow');
    const stackRatio = Math.min(1, meowLv / 6);
    this.mgSpin.rotation.z += dt * (4 + stackRatio * 28);
    this.cnPistonL.position.z = 0.2 - p.recoil * 0.1;
    this.cnPistonR.position.z = 0.2 - p.recoil * 0.1;

    this.mgPierceFin.visible = meowLv >= 6;
    this.cnShardsWing.visible = p.eVolleyLeft > 0;
    this.cnPulseRing.visible = p.rCd <= 0;

    // ── 过载 / 满层 / 推进焰 / 受击状态发光 ──
    const full = meowLv >= 6;
    const over = p.overloadT > 0;

    this.mgGlowMat.emissive.setHex(over || full ? 0x4df9ff : 0x10556e);
    this.mgGlowMat.emissiveIntensity = over ? 2.4 : full ? 1.5 : 0.5;
    this.mgFocusMat.emissiveIntensity = over || full ? 2.2 : 0.75;

    this.cnGlowMat.emissive.setHex(over ? 0xffd24a : 0xff6e12);
    this.cnGlowMat.emissiveIntensity = over ? 2.1 : 0.85 + p.recoil * 1.2;
    this.cnPulseMat.emissiveIntensity = over ? 2.4 : 1.3;

    this.packCoreMat.emissiveIntensity = over ? 2.8 : full ? 2.0 : 1.15 + Math.sin(t * 4) * 0.2;
    this.gogLensMat.emissiveIntensity = over ? 1.8 : 0.9;

    const jetFlicker = 0.75 + Math.sin(t * 45) * 0.25;
    this.packJetMat.opacity = dashing ? 0.9 * jetFlicker : over ? 0.45 * jetFlicker : 0;
    this.heelJetMat.opacity = dashing ? 0.92 * jetFlicker : 0;

    const hurt = p.hurtT > 0.12;
    for (const m of this.pbrMats) {
      m.emissive.setHex(hurt ? 0x992218 : over ? 0x062430 : 0x000000);
    }

    // ── 地面战术光环 ──
    this.facing.rotation.y = this.aimYaw;
    this.facingMat.color.setHex(p.weapon === 'mg' ? 0x32f4ff : 0xffaa2b);
    this.facingMat.opacity = p.swapT > 0 ? 0.35 : 0.92;
    this.auraMat.opacity = over ? 0.55 + Math.sin(t * 18) * 0.25 : 0;
    this.auraRing.scale.setScalar(over ? 1 + Math.sin(t * 10) * 0.08 : 1);
    this.pickupRing.scale.setScalar(g.pickupRadius);
  }
}
