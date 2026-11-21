import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FOUNTAIN } from '../config';
import map1Data from '../sim/map1_data.json';
import map1Materials from '../sim/map1_materials.json';
import type { WorldView } from './world';

interface MatEntry {
  url: string;
  alpha?: 'cutout' | 'blend';
}

interface ScbJson {
  pos: number[];
  uv: number[];
}

const MAT_MAP = map1Materials as Record<string, MatEntry>;

function loadScbMesh(url: string, mat: THREE.Material, onReady?: (m: THREE.Mesh) => void): THREE.Mesh {
  const geo = new THREE.BufferGeometry();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  fetch(url)
    .then((r) => r.json())
    .then((d: ScbJson) => {
      geo.setAttribute('position', new THREE.Float32BufferAttribute(d.pos, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(d.uv, 2));
      geo.computeVertexNormals();
      onReady?.(mesh);
    })
    .catch((e) => console.warn('[VFX SCB] load failed:', url, e));
  return mesh;
}

/**
 * Three.js PointsMaterial ignores Texture.repeat/offset; crop sprite-sheet cells
 * (e.g. hex_plus 2x2, lilstar 4x2) into standalone 256x256 CanvasTextures.
 */
function loadSpriteCell(url: string, col: number, row: number, cols: number, rows: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const cw = img.width / cols;
    const ch = img.height / rows;
    ctx.clearRect(0, 0, 256, 256);
    ctx.drawImage(img, col * cw, row * ch, cw, ch, 0, 0, 256, 256);
    tex.needsUpdate = true;
  };
  img.src = url;
  return tex;
}

/**
 * 第一关「仓库区」原版 3D 场景：
 * - 直接加载由拳头 14.14 官方 Map33.wad.client 解包并转换的 `warehouse_map1.glb`
 * - 1:1 映射 104 套原版贴图并与 `map1_data.json` 180m × 180m 碰撞网格严格对齐
 * - 中央治愈喷泉使用原版 5 套 `.scb` 3D 特效网格 + 12 张原版特效贴图还原全套光效
 */
export function buildWarehouseWorld(scene: THREE.Scene, gl: THREE.WebGLRenderer): WorldView {
  scene.background = new THREE.Color(0x5fa8d3);
  scene.fog = null;

  const group = new THREE.Group();
  scene.add(group);

  group.add(new THREE.HemisphereLight(0xdaf1ff, 0x76828e, 1.4));
  group.add(new THREE.AmbientLight(0xffffff, 0.28));

  const sun = new THREE.DirectionalLight(0xfff0d4, 2.0);
  sun.position.set(22, 40, 16);
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.near = 5;
  sc.far = 120;
  sc.left = -22;
  sc.right = 22;
  sc.top = 22;
  sc.bottom = -22;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.025;
  group.add(sun, sun.target);

  // 底层深海延展平面
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(520, 520),
    new THREE.MeshStandardMaterial({ color: 0x0f4c63, roughness: 0.35, metalness: 0.1 }),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -2.2;
  group.add(sea);

  const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const texLoader = new THREE.TextureLoader();
  const texCache = new Map<string, THREE.Texture>();
  const matCache = new Map<string, THREE.MeshStandardMaterial>();

  const getTex = (url: string, flipY = false) => {
    const key = `${url}|${flipY ? 1 : 0}`;
    let t = texCache.get(key);
    if (!t) {
      t = texLoader.load(url);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.flipY = flipY;
      t.anisotropy = maxAniso;
      texCache.set(key, t);
    }
    return t;
  };

  const getMat = (matName: string): THREE.MeshStandardMaterial | null => {
    const entry = MAT_MAP[matName];
    if (!entry) return null;
    let m = matCache.get(matName);
    if (!m) {
      const isCutout = entry.alpha === 'cutout';
      const isBlend = entry.alpha === 'blend';
      const isGlow = /healingwell|hologram|crystal|glow/i.test(matName);
      m = new THREE.MeshStandardMaterial({
        map: getTex(entry.url, false),
        color: 0xffffff,
        roughness: isBlend ? 0.28 : 0.84,
        metalness: isBlend ? 0.15 : 0.08,
        alphaTest: isCutout ? 0.42 : 0,
        transparent: isBlend,
        opacity: isBlend ? 0.88 : 1.0,
        depthWrite: !isBlend,
        side: THREE.DoubleSide,
        emissive: isGlow ? new THREE.Color(0x112a36) : new THREE.Color(0x000000),
        emissiveIntensity: isGlow ? 0.35 : 0,
      });
      matCache.set(matName, m);
    }
    return m;
  };

  const allMeshes: THREE.Mesh[] = [];
  const elevatedMeshes: THREE.Mesh[] = [];
  let shadowsOn = true;

  new GLTFLoader().load(
    './assets/map1/warehouse_map1.glb',
    (gltf) => {
      const root = gltf.scene;
      root.rotation.set(0, 0, 0);
      root.scale.set(0.01, 0.01, -0.01);
      root.position.set(-90, -0.085, 90);
      root.updateMatrixWorld(true);

      const box = new THREE.Box3();
      root.traverse((obj) => {
        if (obj instanceof THREE.Light) {
          obj.visible = false;
          return;
        }
        if (!(obj instanceof THREE.Mesh)) return;
        const srcMat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        const mName = srcMat?.name ?? '';

        if (/GrayBox_MAT|Board_LandingSite/i.test(mName)) {
          obj.visible = false;
          return;
        }

        const boundMat = getMat(mName);
        if (boundMat) {
          obj.material = boundMat;
        } else if (srcMat && 'side' in srcMat) {
          (srcMat as THREE.Material).side = THREE.DoubleSide;
        }

        obj.receiveShadow = true;
        allMeshes.push(obj);

        box.setFromObject(obj);
        if (!/Strawberry_Ground_/i.test(mName) && box.max.y > 0.65 && !boundMat?.transparent) {
          obj.castShadow = shadowsOn;
          elevatedMeshes.push(obj);
        }
      });

      group.add(root);
    },
    undefined,
    (err) => {
      console.error('[Map33 GLB] Failed to load warehouse_map1.glb:', err);
    },
  );

  // ═══════════════════════════════════════════════════════════════
  // 中央治愈喷泉原版 3D 特效组（Fountain_Glow + Timer_Charge + Nova）
  // ═══════════════════════════════════════════════════════════════
  const fx = FOUNTAIN.x;
  const fz = FOUNTAIN.z;
  const fGroup = new THREE.Group();
  fGroup.position.set(fx, 0, fz);
  group.add(fGroup);

  const vfxTex = (name: string) => getTex(`./assets/map1/vfx/${name}`, true);

  // 1. 水池上空 y=3.5m 悬浮 3D 全息能量球核（strawberry_map1_healingwell_centersphere.scb）
  // 匹配 map33.bin.json: Edge17/Edge14 blendMode=1 深海蓝绿菲涅尔球核 + Edge16 blendMode=4 流动条纹
  const sphereGroup = new THREE.Group();
  sphereGroup.position.y = 3.5;
  fGroup.add(sphereGroup);

  const noiseTex = vfxTex('noise_02.png');
  const sphereUniforms = {
    uTime: { value: 0 },
    uCooldown: { value: 0 },
    uCharging: { value: 0 },
    uNoise: { value: noiseTex },
  };
  const sphereInnerMat = new THREE.ShaderMaterial({
    uniforms: sphereUniforms,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: true,
    side: THREE.FrontSide,
    vertexShader: /* glsl */ `
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uCooldown;
      uniform float uCharging;
      uniform sampler2D uNoise;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec2 vUv;
      void main() {
        vec3 n = normalize(vNormalView);
        vec3 v = normalize(vViewPos);
        float fresnel = pow(1.0 - max(0.0, abs(dot(n, v))), 2.2);
        vec2 nUv1 = vUv * 2.0 + vec2(uTime * 0.14, -uTime * 0.18);
        vec2 nUv2 = vUv * 1.4 + vec2(-uTime * 0.09, uTime * 0.12);
        float noise = 0.5 * texture2D(uNoise, nUv1).r + 0.5 * texture2D(uNoise, nUv2).g;
        vec3 coreCol = vec3(0.06, 0.17, 0.30);
        vec3 midCol = vec3(0.0, 0.34, 0.24);
        vec3 rimCol = vec3(0.06, 1.0, 0.58);
        vec3 col = mix(coreCol, midCol, smoothstep(0.25, 0.85, noise) * 0.75);
        col = mix(col, rimCol, clamp(fresnel * (0.85 + 0.45 * noise + 0.25 * uCharging), 0.0, 1.0));
        col *= mix(1.0, 0.35, uCooldown);
        float alpha = mix(0.92, 0.35, uCooldown) * (0.86 + 0.14 * fresnel);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });

  const trailDarkTex = vfxTex('trail_dark.png').clone();
  trailDarkTex.needsUpdate = true;
  trailDarkTex.wrapS = THREE.RepeatWrapping;
  trailDarkTex.wrapT = THREE.RepeatWrapping;
  const sphereOuterMat = new THREE.MeshBasicMaterial({
    map: trailDarkTex,
    color: 0x05ff8c,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const sphereInner = loadScbMesh('./assets/map1/vfx/fountain_sphere.json', sphereInnerMat);
  sphereInner.scale.setScalar(0.0092);
  sphereInner.renderOrder = 10;
  const sphereOuter = loadScbMesh('./assets/map1/vfx/fountain_sphere.json', sphereOuterMat);
  sphereOuter.scale.setScalar(0.0102);
  sphereOuter.renderOrder = 11;
  const sphereHaloMat = new THREE.MeshBasicMaterial({
    map: vfxTex('glow_ring.png'),
    color: 0x2bff94,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const sphereHalo = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 6.2), sphereHaloMat);
  sphereHalo.rotation.x = -Math.PI / 2;
  sphereHalo.renderOrder = 11;
  sphereGroup.add(sphereInner, sphereOuter, sphereHalo);

  // 2. 水池表面原版贴图圈（Basic5 blendMode=1 深海蓝底 + timer_outline + Basic4 glow_ring）
  const mkDecalPlane = (size: number, y: number, texName: string, hex: number, opacity: number, additive = true) => {
    const mat = new THREE.MeshBasicMaterial({
      map: vfxTex(texName),
      color: hex,
      transparent: true,
      opacity,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.renderOrder = additive ? 8 : 6;
    fGroup.add(m);
    return { mesh: m, mat };
  };

  const sharpCircle = mkDecalPlane(8.6, 0.72, 'sharp_circle.png', 0x2665b8, 0.92, false);
  const timerOutline = mkDecalPlane(7.8, 0.86, 'timer_outline.png', 0x26ff8f, 0.92, true);
  const poolGlowRing = mkDecalPlane(10.0, 0.92, 'glow_ring.png', 0x0eff78, 0.45, true);

  // 3. 喷泉外沿 3D 底座光边（Edge10: fountain_baseedge.scb + hollow_decal.png uvScale=[9,1]）+ outer_graphic
  const baseEdgeTex = vfxTex('hollow_decal.png').clone();
  baseEdgeTex.needsUpdate = true;
  baseEdgeTex.wrapS = THREE.RepeatWrapping;
  baseEdgeTex.wrapT = THREE.RepeatWrapping;
  baseEdgeTex.repeat.set(9, 1);
  const baseEdgeMat = new THREE.MeshBasicMaterial({
    map: baseEdgeTex,
    color: 0x00ff6b,
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const baseEdge = loadScbMesh('./assets/map1/vfx/fountain_baseedge.json', baseEdgeMat);
  baseEdge.scale.setScalar(0.0295);
  baseEdge.position.y = 0.09;
  baseEdge.renderOrder = 5;
  fGroup.add(baseEdge);

  const outerGraphic = mkDecalPlane(24.0, 0.05, 'glowring_outer.png', 0x00ff60, 0.14, true);

  // 4. 3D 脉冲波浪罩（fountain_wave.scb + shockwave.png，每 2 秒荡开一次）
  const waveMat = new THREE.MeshBasicMaterial({
    map: vfxTex('shockwave.png'),
    color: 0x18ff7c,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const waveMesh = loadScbMesh('./assets/map1/vfx/fountain_wave.json', waveMat);
  waveMesh.position.y = 0.16;
  waveMesh.renderOrder = 9;
  fGroup.add(waveMesh);

  // 5. 飘升的原版六边形 "+" 治疗十字粒子与空心六边形粒子（hex_plus.png 2x2 独立裁剪单格）
  const hexCount = 24;
  const hexPos = new Float32Array(hexCount * 3);
  const hexMeta: { a: number; r: number; y: number; sp: number }[] = [];
  for (let i = 0; i < hexCount; i++) {
    const a = (i / hexCount) * Math.PI * 2 + i * 0.85;
    const r = 0.6 + ((i * 19) % 28) * 0.1;
    const y = 0.8 + ((i * 13) % 52) * 0.1;
    hexMeta.push({ a, r, y, sp: 1.45 + (i % 5) * 0.25 });
    hexPos[i * 3] = Math.cos(a) * r;
    hexPos[i * 3 + 1] = y;
    hexPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const hexGeo = new THREE.BufferGeometry();
  hexGeo.setAttribute('position', new THREE.BufferAttribute(hexPos, 3));
  const hexMat = new THREE.PointsMaterial({
    size: 0.62,
    map: loadSpriteCell('./assets/map1/vfx/hex_plus.png', 0, 0, 2, 2),
    color: 0x38ff8a,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const hexPts = new THREE.Points(hexGeo, hexMat);
  hexPts.renderOrder = 12;
  fGroup.add(hexPts);

  const hex2Count = 16;
  const hex2Pos = new Float32Array(hex2Count * 3);
  const hex2Meta: { a: number; r: number; y: number; sp: number }[] = [];
  for (let i = 0; i < hex2Count; i++) {
    const a = (i / hex2Count) * Math.PI * 2 + i * 1.15;
    const r = 0.9 + ((i * 23) % 26) * 0.1;
    const y = 0.7 + ((i * 17) % 48) * 0.1;
    hex2Meta.push({ a, r, y, sp: 1.15 + (i % 4) * 0.22 });
    hex2Pos[i * 3] = Math.cos(a) * r;
    hex2Pos[i * 3 + 1] = y;
    hex2Pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const hex2Geo = new THREE.BufferGeometry();
  hex2Geo.setAttribute('position', new THREE.BufferAttribute(hex2Pos, 3));
  const hex2Mat = new THREE.PointsMaterial({
    size: 0.56,
    map: loadSpriteCell('./assets/map1/vfx/hex_plus.png', 0, 1, 2, 2),
    color: 0x56ffb8,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const hex2Pts = new THREE.Points(hex2Geo, hex2Mat);
  hex2Pts.renderOrder = 12;
  fGroup.add(hex2Pts);

  // 6. 站圈外沿科技纹理环（edge_08.png）+ 360° 充能进度弧（edge_06.png）
  const zoneGeo = new THREE.RingGeometry(FOUNTAIN.zoneRadius - 0.65, FOUNTAIN.zoneRadius, 72);
  zoneGeo.rotateX(-Math.PI / 2);
  const zoneTex = vfxTex('edge_08.png').clone();
  zoneTex.needsUpdate = true;
  zoneTex.repeat.set(8, 1);
  const zoneMat = new THREE.MeshBasicMaterial({
    map: zoneTex,
    color: 0x2ef89a,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const zoneRing = new THREE.Mesh(zoneGeo, zoneMat);
  zoneRing.position.y = 0.06;
  zoneRing.renderOrder = 5;
  fGroup.add(zoneRing);

  const arcUniforms = {
    uProgress: { value: 0 },
    uColor: { value: new THREE.Color(0x38ff9c) },
    uAlpha: { value: 0.92 },
    uTex: { value: vfxTex('edge_06.png') },
  };
  const arcGeo = new THREE.RingGeometry(8.35, 9.15, 72);
  arcGeo.rotateX(-Math.PI / 2);
  const arcMat = new THREE.ShaderMaterial({
    uniforms: arcUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vLocal;
      varying vec2 vUv;
      void main() {
        vLocal = position.xz;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform vec3 uColor;
      uniform float uAlpha;
      uniform sampler2D uTex;
      varying vec2 vLocal;
      varying vec2 vUv;
      void main() {
        float ang = atan(vLocal.x, -vLocal.y);
        float norm = (ang < 0.0 ? ang + 6.2831853 : ang) / 6.2831853;
        if (norm > uProgress) discard;
        vec4 tex = texture2D(uTex, vec2(norm * 6.0, vUv.y));
        float lum = max(tex.a, max(tex.r, tex.g));
        gl_FragColor = vec4(uColor * (0.65 + 0.55 * lum), uAlpha * (0.45 + 0.55 * lum));
        #include <colorspace_fragment>
      }
    `,
  });
  const arcRing = new THREE.Mesh(arcGeo, arcMat);
  arcRing.position.y = 0.08;
  arcRing.renderOrder = 7;
  fGroup.add(arcRing);

  // 7. 站圈充能旋转星芒（lilstar.png 4x2 独立裁剪单格 + 环绕）
  const starTex = loadSpriteCell('./assets/map1/vfx/lilstar.png', 0, 0, 4, 2);
  const chargeCount = 36;
  const chargePos = new Float32Array(chargeCount * 3);
  for (let i = 0; i < chargeCount; i++) {
    const a = (i / chargeCount) * Math.PI * 2;
    chargePos[i * 3] = Math.cos(a) * 8.75;
    chargePos[i * 3 + 1] = 0.4 + (i % 4) * 0.35;
    chargePos[i * 3 + 2] = Math.sin(a) * 8.75;
  }
  const chargeGeo = new THREE.BufferGeometry();
  chargeGeo.setAttribute('position', new THREE.BufferAttribute(chargePos, 3));
  const chargeMat = new THREE.PointsMaterial({
    size: 0.85,
    map: starTex,
    color: 0x52ffb0,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const chargePts = new THREE.Points(chargeGeo, chargeMat);
  chargePts.renderOrder = 11;
  fGroup.add(chargePts);

  // 8. 满充 Nova 爆发光柱（fountain_beam.json）+ 金星闪光（star1.png）
  const beamMat = new THREE.MeshBasicMaterial({
    map: vfxTex('glowstar.png'),
    color: 0x3dff96,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beamMesh = loadScbMesh('./assets/map1/vfx/fountain_beam.json', beamMat);
  beamMesh.scale.set(0.012, 0.016, 0.012);
  beamMesh.visible = false;
  beamMesh.renderOrder = 13;
  fGroup.add(beamMesh);

  const novaStarMat = new THREE.MeshBasicMaterial({
    map: vfxTex('star1.png'),
    color: 0xffd159,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const novaStar = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 8.5), novaStarMat);
  novaStar.rotation.x = -Math.PI / 2;
  novaStar.position.y = 2.1;
  novaStar.visible = false;
  novaStar.renderOrder = 14;
  fGroup.add(novaStar);

  // 地面低矮地标光环（首领竞技场 & 首领出生点）
  const mkBeaconRing = (x: number, z: number, rIn: number, rOut: number, hex: number, opacity: number) => {
    const g = new THREE.RingGeometry(rIn, rOut, 48);
    g.rotateX(-Math.PI / 2);
    const m = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity, depthWrite: false });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, 0.04, z);
    mesh.renderOrder = 3;
    group.add(mesh);
    return mesh;
  };
  const { bossArena, reksaiSpawn } = map1Data.landmarks;
  let bossRing: THREE.Mesh | null = null;
  if (bossArena) bossRing = mkBeaconRing(bossArena.wx, bossArena.wz, 6.2, 6.55, 0xffb838, 0.32);
  if (reksaiSpawn) mkBeaconRing(reksaiSpawn.wx, reksaiSpawn.wz, 2.2, 2.55, 0xff2e88, 0.4);

  let prevT = 0;
  let lastFState = 'ready';
  let novaT = 0;

  return {
    group,
    sun,
    setShadows(on: boolean) {
      shadowsOn = on;
      sun.castShadow = on;
      for (const m of allMeshes) m.receiveShadow = on;
      for (const m of elevatedMeshes) m.castShadow = on;
    },
    update(t, _progress, alarm, _warnings, _tier, fountain) {
      const dt = Math.min(0.1, Math.max(0, t - prevT));
      prevT = t;

      const fState = fountain?.state ?? 'ready';
      const charge = fountain?.charge ?? 0;
      const onCd = fState === 'cooldown';
      const charging = fState === 'charging';

      if (lastFState !== 'cooldown' && fState === 'cooldown') {
        novaT = 1.4;
      }
      lastFState = fState;

      // 悬浮 3D 球核动画
      sphereGroup.visible = !onCd || novaT > 0;
      sphereGroup.position.y = 3.5 + Math.sin(t * 2.1) * 0.16;
      sphereUniforms.uTime.value = t;
      sphereUniforms.uCooldown.value = onCd ? 1 : 0;
      sphereUniforms.uCharging.value = charging ? 1 : 0;
      sphereInner.rotation.y = t * (charging ? 1.4 : 0.45);
      sphereOuter.rotation.y = -t * (charging ? 1.9 : 0.65);
      trailDarkTex.offset.set((t * (charging ? 0.36 : 0.16)) % 1, (-t * 0.12) % 1);
      sphereHalo.rotation.z = t * 0.5;
      sphereOuterMat.opacity = onCd ? 0.12 : charging ? 0.88 : 0.72;
      sphereHaloMat.opacity = onCd ? 0.08 : charging ? 0.48 : 0.34;

      // 水池贴图圈
      sharpCircle.mat.opacity = onCd ? 0.25 : charging ? 0.96 : 0.88;
      timerOutline.mesh.rotation.z = t * 0.35;
      timerOutline.mat.opacity = onCd ? 0.12 : charging ? 0.96 : 0.82;
      poolGlowRing.mesh.rotation.z = -t * 0.25;
      poolGlowRing.mat.opacity = onCd ? 0.06 : charging ? 0.55 : 0.38;

      baseEdge.visible = !onCd;
      baseEdge.rotation.y = t * 0.18;
      outerGraphic.mat.opacity = onCd ? 0.04 : charging ? 0.2 : 0.12;

      // 3D 脉冲波浪罩（2 秒周期）
      waveMesh.visible = !onCd;
      if (!onCd) {
        const wPhase = (t * 0.5) % 1;
        const ws = 0.10 + wPhase * 0.16;
        waveMesh.scale.set(ws, 0.08 + wPhase * 0.08, ws);
        waveMat.opacity = (1 - wPhase) * (charging ? 0.72 : 0.48);
      }

      // 六边形 "+" 治疗粒子与空心六边形粒子飘升
      hexPts.visible = !onCd;
      hex2Pts.visible = !onCd;
      if (!onCd) {
        hexMat.opacity = charging ? 0.98 : 0.85;
        hex2Mat.opacity = charging ? 0.9 : 0.72;
        const speedMul = charging ? 1.7 : 1.0;
        const arr = hexGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < hexCount; i++) {
          const hm = hexMeta[i];
          hm.y += hm.sp * speedMul * dt;
          if (hm.y > 6.2) hm.y = 0.8;
          const a = hm.a + t * (charging ? 1.0 : 0.38);
          arr[i * 3] = Math.cos(a) * hm.r;
          arr[i * 3 + 1] = hm.y;
          arr[i * 3 + 2] = Math.sin(a) * hm.r;
        }
        hexGeo.attributes.position.needsUpdate = true;

        const arr2 = hex2Geo.attributes.position.array as Float32Array;
        for (let i = 0; i < hex2Count; i++) {
          const hm = hex2Meta[i];
          hm.y += hm.sp * speedMul * dt;
          if (hm.y > 5.8) hm.y = 0.7;
          const a = hm.a - t * (charging ? 0.8 : 0.3);
          arr2[i * 3] = Math.cos(a) * hm.r;
          arr2[i * 3 + 1] = hm.y;
          arr2[i * 3 + 2] = Math.sin(a) * hm.r;
        }
        hex2Geo.attributes.position.needsUpdate = true;
      }

      // 外圈站圈环 & 360° 进度弧
      zoneTex.offset.x = (t * (charging ? 0.12 : 0.03)) % 1;
      zoneMat.color.setHex(onCd ? 0x33505c : charging ? 0x5effb2 : 0x2ef89a);
      zoneMat.opacity = onCd ? 0.18 : charging ? 0.72 : 0.44;

      arcRing.visible = !onCd && charge > 0.005;
      arcUniforms.uProgress.value = charge;
      arcUniforms.uColor.value.setHex(charge > 0.75 ? 0xffd352 : 0x38ff9c);

      chargePts.visible = !onCd && charging;
      if (chargePts.visible) {
        chargePts.rotation.y = t * 1.4;
      }

      // Nova 爆发光柱与金星闪光
      if (novaT > 0) {
        novaT = Math.max(0, novaT - dt);
        const k = 1 - novaT / 1.4;
        beamMesh.visible = true;
        beamMesh.rotation.y = t * 2.5;
        beamMesh.scale.set(0.011 + k * 0.004, 0.014 + k * 0.01, 0.011 + k * 0.004);
        beamMat.opacity = (1 - k) * 0.85;

        novaStar.visible = k < 0.55;
        novaStar.rotation.z = t * 4;
        novaStar.scale.setScalar(0.5 + k * 2.2);
        novaStarMat.opacity = Math.max(0, 1 - k * 2.0);
      } else {
        beamMesh.visible = false;
        novaStar.visible = false;
      }

      if (bossRing) {
        const mat = bossRing.material as THREE.MeshBasicMaterial;
        mat.opacity = alarm > 0.01 ? 0.45 + Math.sin(t * 10) * 0.25 : 0.28;
      }
    },
  };
}
