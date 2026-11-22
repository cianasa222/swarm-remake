import * as THREE from 'three';
import { FOUNTAIN } from '../config';
import map1Data from '../sim/map1_data.json';
import map1Lightmaps from '../sim/map1_lightmaps.json';
import map1Materials from '../sim/map1_materials.json';
import { getTexture, loadGLB, loadScbGeo, loadSpriteCell as loadAssetSpriteCell } from './assets';
import type { WorldView } from './world';

interface MatEntry {
  url: string;
  alpha?: 'cutout' | 'blend';
}

const MAT_MAP = map1Materials as Record<string, MatEntry>;

function loadScbMesh(url: string, mat: THREE.Material, onReady?: (m: THREE.Mesh) => void): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
  mesh.frustumCulled = false;
  loadScbGeo(url, true)
    .then((geo) => {
      mesh.geometry.dispose();
      mesh.geometry = geo;
      onReady?.(mesh);
    })
    .catch((e) => console.warn('[VFX SCB] load failed:', url, e));
  return mesh;
}

function loadSpriteCell(url: string, col: number, row: number, cols: number, rows: number, glow = false): THREE.CanvasTexture {
  return loadAssetSpriteCell(url, col, row, cols, rows, { size: 256, glow });
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

  group.add(new THREE.HemisphereLight(0xb4f5ff, 0x566c8e, 0.95));

  const sun = new THREE.DirectionalLight(0xf9f0dd, 1.95);
  sun.position.set(-24, 34, 28);
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.near = 5;
  sc.far = 120;
  sc.left = -28;
  sc.right = 28;
  sc.top = 28;
  sc.bottom = -28;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.025;
  group.add(sun, sun.target);

  // 底层深海延展平面
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(520, 520),
    new THREE.MeshStandardMaterial({ color: 0x0b3c52, roughness: 0.35, metalness: 0.1 }),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -2.2;
  group.add(sea);

  const maxAniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const matCache = new Map<string, THREE.MeshLambertMaterial>();
  const LM_MAP = map1Lightmaps as Record<string, number[]>;

  const getTex = (url: string, flipY = false) =>
    getTexture(url, { flipY, repeat: true, anisotropy: maxAniso });

  const getLightmap = (idx: number) =>
    getTexture(`./assets/map1/lightmaps/${idx}.webp`, {
      flipY: false,
      repeat: false,
      channel: 1,
      anisotropy: maxAniso,
    });

  const getMat = (matName: string, lmIdx: number | null): THREE.MeshLambertMaterial | null => {
    const entry = MAT_MAP[matName];
    if (!entry) return null;
    const key = lmIdx !== null ? `${matName}|lm${lmIdx}` : matName;
    let m = matCache.get(key);
    if (!m) {
      const isCutout = entry.alpha === 'cutout';
      const isBlend = entry.alpha === 'blend';
      const isGlow = /healingwell|hologram|crystal|glow/i.test(matName);
      m = new THREE.MeshLambertMaterial({
        map: getTex(entry.url, false),
        lightMap: lmIdx !== null ? getLightmap(lmIdx) : null,
        lightMapIntensity: 1.85,
        color: 0xffffff,
        alphaTest: isCutout ? 0.42 : 0,
        transparent: isBlend,
        opacity: isBlend ? 0.88 : 1.0,
        depthWrite: !isBlend,
        side: THREE.DoubleSide,
        emissive: isGlow ? new THREE.Color(0x0c222e) : new THREE.Color(0x000000),
        emissiveIntensity: isGlow ? 0.28 : 0,
      });
      if (lmIdx !== null) {
        m.customProgramCacheKey = () => 'baked-lm-v3';
        m.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <lights_fragment_maps>',
            `#ifdef USE_LIGHTMAP
              vec3 lmTexel = texture2D( lightMap, vLightMapUv ).rgb;
              float lmLen = lmTexel.r + lmTexel.g + lmTexel.b;
              if (lmLen > 0.01) {
                vec3 baked = max(lmTexel, vec3(0.24, 0.31, 0.44)) * lightMapIntensity;
                reflectedLight.directDiffuse *= 0.35;
                reflectedLight.indirectDiffuse = diffuseColor.rgb * baked;
              }
            #endif`,
          );
        };
      }
      matCache.set(key, m);
    }
    return m;
  };

  const allMeshes: THREE.Mesh[] = [];
  const elevatedMeshes: THREE.Mesh[] = [];
  let shadowsOn = true;

  const mapReady = loadGLB('./assets/map1/warehouse_map1.glb')
    .then((gltf) => {
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

        const instMatch = (obj.name || obj.parent?.name || '').match(/MapGeo_Instance_(\d+)/);
        const lmData = instMatch ? LM_MAP[instMatch[1]] : undefined;
        let uv1Attr = obj.geometry.attributes.uv1 as THREE.BufferAttribute | undefined;
        let lmIdx: number | null = null;
        if (lmData && lmData[0] !== 0 && uv1Attr) {
          lmIdx = lmData[0];
          if (!obj.geometry.userData.lmScaled) {
            if (uv1Attr.normalized) {
              const arr = new Float32Array(uv1Attr.count * 2);
              for (let i = 0; i < uv1Attr.count; i++) {
                arr[i * 2] = uv1Attr.getX(i);
                arr[i * 2 + 1] = uv1Attr.getY(i);
              }
              uv1Attr = new THREE.Float32BufferAttribute(arr, 2);
              obj.geometry.setAttribute('uv1', uv1Attr);
            }
            const [, sx, sy, bx, by] = lmData;
            for (let i = 0; i < uv1Attr.count; i++) {
              uv1Attr.setXY(i, uv1Attr.getX(i) * sx + bx, uv1Attr.getY(i) * sy + by);
            }
            uv1Attr.needsUpdate = true;
            obj.geometry.userData.lmScaled = true;
          }
        }

        const boundMat = getMat(mName, lmIdx);
        if (boundMat) {
          obj.material = boundMat;
        } else if (srcMat && 'side' in srcMat) {
          (srcMat as THREE.Material).side = THREE.DoubleSide;
        }

        obj.receiveShadow = true;
        allMeshes.push(obj);

        box.setFromObject(obj);
        if (lmIdx === null && !/Strawberry_Ground_/i.test(mName) && box.max.y > 0.65 && !boundMat?.transparent) {
          obj.castShadow = shadowsOn;
          elevatedMeshes.push(obj);
        }
      });

      group.add(root);
    })
    .catch((err) => {
      console.error('[Map33 GLB] Failed to load warehouse_map1.glb:', err);
    });

  // ═══════════════════════════════════════════════════════════════
  // 中央治愈喷泉原版 3D 特效组（Fountain_Glow + Timer_Charge + Nova）
  // ═══════════════════════════════════════════════════════════════
  const fx = FOUNTAIN.x;
  const fz = FOUNTAIN.z;
  const fGroup = new THREE.Group();
  fGroup.position.set(fx, 0, fz);
  group.add(fGroup);

  const vfxTex = (name: string) => getTex(`./assets/map1/vfx/${name}`, true);
  const noiseTex = vfxTex('noise_02.png');

  // 1. 水池上空 y=3.5m 悬浮 3D 全息蜂窝能量球核（官方 EmitterPosition=[0,350,0], bS=0.98/1.0）
  const sphereGroup = new THREE.Group();
  sphereGroup.position.y = 3.5;
  fGroup.add(sphereGroup);

  const sphereUniforms = {
    uTime: { value: 0 },
    uCooldown: { value: 0 },
    uCharging: { value: 0 },
    uNoise: { value: noiseTex },
    uHexTile: { value: vfxTex('hextile.png') },
    uHexTileInv: { value: vfxTex('hextile_inv.png') },
    uTrailDark: { value: vfxTex('trail_dark.png') },
  };

  // 半透明深海靛蓝内芯（depthWrite=false，透出玻璃全息体积感）
  const sphereCoreMat = new THREE.ShaderMaterial({
    uniforms: sphereUniforms,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
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
        float fresnel = pow(1.0 - max(0.0, abs(dot(n, v))), 1.9);
        float n1 = texture2D(uNoise, vUv * 2.0 + vec2(uTime * 0.12, -uTime * 0.16)).r;
        float n2 = texture2D(uNoise, vUv * 1.4 + vec2(-uTime * 0.08, uTime * 0.10)).g;
        float noise = 0.5 * n1 + 0.5 * n2;
        vec3 deepBlue = vec3(0.03, 0.13, 0.30);
        vec3 deepTeal = vec3(0.0, 0.24, 0.22);
        vec3 col = mix(deepBlue, deepTeal, smoothstep(0.25, 0.85, noise) * 0.72);
        col += vec3(0.04, 0.42, 0.38) * fresnel * (0.65 + 0.35 * uCharging);
        float alpha = mix(0.28, 0.68, fresnel) * mix(1.0, 0.0, uCooldown);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const sphereCore = loadScbMesh('./assets/map1/vfx/fountain_sphere.json', sphereCoreMat);
  sphereCore.scale.setScalar(0.0098);
  sphereCore.renderOrder = 10;

  // Edge12/13/15：极区平滑混入 XZ 平面投影彻底消除北极星芒捏合
  const sphereHexMat = new THREE.ShaderMaterial({
    uniforms: sphereUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    vertexShader: /* glsl */ `
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec3 vObjPos;
      varying vec3 vObjNorm;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vObjPos = position;
        vObjNorm = normalize(position);
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
      uniform sampler2D uHexTile;
      uniform sampler2D uHexTileInv;
      varying vec3 vNormalView;
      varying vec3 vViewPos;
      varying vec3 vObjPos;
      varying vec3 vObjNorm;
      varying vec2 vUv;
      void main() {
        vec3 n = normalize(vNormalView);
        vec3 v = normalize(vViewPos);
        float f = pow(1.0 - max(0.0, abs(dot(n, v))), 2.3);
        float scrollSpd = mix(0.05, 0.14, uCharging);
        vec2 eqUv = vUv * vec2(3.5, 1.75) + vec2(0.0, uTime * scrollSpd);
        vec2 capUv = vObjPos.xz * 0.0075 + vec2(0.0, uTime * scrollSpd);
        float poleW = smoothstep(0.55, 0.88, abs(vObjNorm.y));
        vec4 h1 = mix(texture2D(uHexTile, eqUv), texture2D(uHexTile, capUv), poleW);
        vec4 h2 = mix(texture2D(uHexTileInv, eqUv), texture2D(uHexTileInv, capUv), poleW);
        float m1 = max(h1.a, max(h1.r, h1.g));
        float m2 = max(h2.a, max(h2.r, h2.g));
        vec3 edge12 = vec3(0.08, 0.92, 0.58) * m1 * (0.16 + 0.72 * f);
        vec3 edge13 = vec3(0.45, 0.98, 0.92) * m2 * (0.08 + 0.36 * f);
        vec3 edge15 = pow(f, 1.6) * mix(vec3(0.0, 0.95, 0.55), vec3(0.45, 0.95, 0.92), f) * 0.72;
        vec3 col = (edge12 + edge13 + edge15) * (1.0 + 0.20 * uCharging) * mix(1.0, 0.0, uCooldown);
        float alpha = clamp((m1 * 0.38 + m2 * 0.22 + f * 0.65) * mix(1.0, 0.0, uCooldown), 0.0, 0.92);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const sphereHex = loadScbMesh('./assets/map1/vfx/fountain_sphere.json', sphereHexMat);
  sphereHex.scale.setScalar(0.010);
  sphereHex.renderOrder = 11;

  // Edge16：柔和流动翡翠光带
  const sphereSwirlMat = new THREE.ShaderMaterial({
    uniforms: sphereUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uCooldown;
      uniform float uCharging;
      uniform sampler2D uTrailDark;
      uniform sampler2D uNoise;
      varying vec2 vUv;
      void main() {
        float spd = mix(1.0, 1.8, uCharging);
        vec4 tr = texture2D(uTrailDark, vUv * vec2(2.0, 1.0) + vec2(uTime * 0.14 * spd, -uTime * 0.10 * spd));
        vec4 nz = texture2D(uNoise, vUv * vec2(3.0, 1.0) + vec2(uTime * 0.10 * spd, uTime * 0.30 * spd));
        float m = max(tr.a, tr.r) * (0.40 + 0.80 * nz.r);
        float alpha = m * mix(0.28, 0.44, uCharging) * mix(1.0, 0.0, uCooldown);
        vec3 col = vec3(0.02, 0.95, 0.56) * (1.0 + 0.22 * uCharging);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const sphereSwirl = loadScbMesh('./assets/map1/vfx/fountain_sphere.json', sphereSwirlMat);
  sphereSwirl.scale.setScalar(0.0102);
  sphereSwirl.renderOrder = 12;

  // Basic4 面向相机的球核柔光光晕 Billboard（官方 bS=330）
  const sphereHaloMat = new THREE.SpriteMaterial({
    map: vfxTex('glow_ring.png'),
    color: 0x16d48e,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sphereHalo = new THREE.Sprite(sphereHaloMat);
  sphereHalo.scale.set(6.6, 6.6, 1);
  sphereHalo.renderOrder = 13;
  sphereGroup.add(sphereCore, sphereHex, sphereSwirl, sphereHalo);

  // 2. 水池内部多层贴图圈（严丝合缝贴合 r<3.4m 真实水池凹槽，杜绝穿模 3 座基座）
  const mkDecalPlane = (size: number, y: number, texName: string, hex: number, opacity: number, additive = true, order = 8) => {
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
    m.renderOrder = order;
    fGroup.add(m);
    return { mesh: m, mat };
  };

  const sharpUniforms = {
    uTex: { value: vfxTex('sharp_circle.png') },
    uOpacity: { value: 0.92 },
    uDim: { value: 0 },
  };
  const sharpMat = new THREE.ShaderMaterial({
    uniforms: sharpUniforms,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform float uOpacity;
      uniform float uDim;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5);
        float edgeMask = smoothstep(0.50, 0.37, r);
        if (edgeMask < 0.005) discard;
        vec4 tex = texture2D(uTex, vUv);
        vec3 col = mix(vec3(0.07, 0.30, 0.72), vec3(0.04, 0.14, 0.28), uDim) * (0.55 + 0.65 * tex.rgb);
        float alpha = tex.a * edgeMask * uOpacity;
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const sharpCircleMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 8.6), sharpMat);
  sharpCircleMesh.rotation.x = -Math.PI / 2;
  sharpCircleMesh.position.y = 0.72;
  sharpCircleMesh.renderOrder = 6;
  fGroup.add(sharpCircleMesh);

  const crecents1 = [
    mkDecalPlane(7.6, 0.90, 'timer_outline.png', 0x2ef88a, 0.0, true, 8),
    mkDecalPlane(7.6, 0.91, 'timer_outline.png', 0x2ef88a, 0.0, true, 8),
  ];
  const crecents2 = [
    mkDecalPlane(10.0, 0.89, 'glow_ring.png', 0x03ff6e, 0.0, true, 7),
    mkDecalPlane(10.0, 0.895, 'glow_ring.png', 0x03ff6e, 0.0, true, 7),
  ];
  const outerGraphic1 = [
    mkDecalPlane(10.0, 0.92, 'glow_ring.png', 0x05ff85, 0.0, true, 8),
    mkDecalPlane(10.0, 0.925, 'glow_ring.png', 0x05ff85, 0.0, true, 8),
  ];

  // 3. 喷泉底座光边（Edge10: 官方 bS=3.2）+ outer_graphic（官方 bS=1400）
  const baseEdgeTex = vfxTex('hollow_decal.png').clone();
  baseEdgeTex.needsUpdate = true;
  baseEdgeTex.wrapS = THREE.RepeatWrapping;
  baseEdgeTex.wrapT = THREE.RepeatWrapping;
  baseEdgeTex.repeat.set(9, 1);
  const baseEdges = [0, 0.5].map((phase, idx) => {
    const mat = new THREE.MeshBasicMaterial({
      map: baseEdgeTex,
      color: 0x00ff6b,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = loadScbMesh('./assets/map1/vfx/fountain_baseedge.json', mat);
    mesh.scale.setScalar(0.032);
    mesh.position.y = 0.14 + idx * 0.01;
    mesh.renderOrder = 5;
    fGroup.add(mesh);
    return { mesh, mat, phase };
  });

  const outerGraphic = mkDecalPlane(28.0, 0.10, 'glowring_outer.png', 0x00ff60, 0.08, true, 4);

  // 4. 修复后的 3D 脉冲波浪罩（Shockwave_blend: scale=(0.235, 0.055, 0.235) 贴地柔和脉冲）
  const waveUniforms = {
    uPhase: { value: 0 },
    uOpacity: { value: 0.42 },
    uTex: { value: vfxTex('shockwave.png') },
  };
  const waveMat = new THREE.ShaderMaterial({
    uniforms: waveUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute float aAlpha;
      varying vec2 vUv;
      varying float vAlpha;
      void main() {
        vUv = uv;
        vAlpha = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uPhase;
      uniform float uOpacity;
      uniform sampler2D uTex;
      varying vec2 vUv;
      varying float vAlpha;
      void main() {
        float v = vUv.y * 0.6 - 0.8 + uPhase * 1.1;
        if (v < 0.0 || v > 1.0) discard;
        vec4 tex = texture2D(uTex, vec2(vUv.x, v));
        float m = max(tex.a, max(tex.r, tex.g));
        float a = m * vAlpha * uOpacity;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(0.0, 1.0, 0.45), a);
        #include <colorspace_fragment>
      }
    `,
  });
  const waveMesh = loadScbMesh('./assets/map1/vfx/fountain_wave.json', waveMat);
  waveMesh.scale.set(0.25, 0.08, 0.25);
  waveMesh.position.y = 0.12;
  waveMesh.renderOrder = 9;
  fGroup.add(waveMesh);

  // 5. 飘升的原版六边形 "+" 治疗十字粒子与空心六边形粒子（hex_plus.png 2x2 + 柔光底晕）
  const hexCount = 24;
  const hexPos = new Float32Array(hexCount * 3);
  const hexMeta: { a: number; r: number; y: number; sp: number }[] = [];
  for (let i = 0; i < hexCount; i++) {
    const a = (i / hexCount) * Math.PI * 2 + i * 0.85;
    const r = 0.6 + ((i * 19) % 24) * 0.1;
    const y = 0.8 + ((i * 13) % 52) * 0.1;
    hexMeta.push({ a, r, y, sp: 1.45 + (i % 5) * 0.25 });
    hexPos[i * 3] = Math.cos(a) * r;
    hexPos[i * 3 + 1] = y;
    hexPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const hexGeo = new THREE.BufferGeometry();
  hexGeo.setAttribute('position', new THREE.BufferAttribute(hexPos, 3));
  const hexMat = new THREE.PointsMaterial({
    size: 0.82,
    map: loadSpriteCell('./assets/map1/vfx/hex_plus.png', 0, 0, 2, 2, true),
    color: 0x2eff98,
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
    const r = 0.9 + ((i * 23) % 22) * 0.1;
    const y = 0.7 + ((i * 17) % 48) * 0.1;
    hex2Meta.push({ a, r, y, sp: 1.15 + (i % 4) * 0.22 });
    hex2Pos[i * 3] = Math.cos(a) * r;
    hex2Pos[i * 3 + 1] = y;
    hex2Pos[i * 3 + 2] = Math.sin(a) * r;
  }
  const hex2Geo = new THREE.BufferGeometry();
  hex2Geo.setAttribute('position', new THREE.BufferAttribute(hex2Pos, 3));
  const hex2Mat = new THREE.PointsMaterial({
    size: 0.72,
    map: loadSpriteCell('./assets/map1/vfx/hex_plus.png', 0, 1, 2, 2, true),
    color: 0x38ff85,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const hex2Pts = new THREE.Points(hex2Geo, hex2Mat);
  hex2Pts.renderOrder = 12;
  fGroup.add(hex2Pts);

  // 6. 站圈外沿精致窄环（r=11.05..11.40m）+ 原生 3D 进度弧（scale=1.06 对齐 8.8..10.6m 走道，零切穿高塔与基座）
  const zoneGeo = new THREE.RingGeometry(FOUNTAIN.zoneRadius - 0.35, FOUNTAIN.zoneRadius, 72);
  zoneGeo.rotateX(-Math.PI / 2);
  const zoneTex = vfxTex('edge_08.png').clone();
  zoneTex.needsUpdate = true;
  zoneTex.repeat.set(8, 1);
  const zoneMat = new THREE.MeshBasicMaterial({
    map: zoneTex,
    color: 0x2ef89a,
    transparent: true,
    opacity: 0.40,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const zoneRing = new THREE.Mesh(zoneGeo, zoneMat);
  zoneRing.position.y = 0.13;
  zoneRing.renderOrder = 5;
  fGroup.add(zoneRing);

  const timerUniforms = {
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uDots: { value: vfxTex('dots.png') },
    uEdge08: { value: vfxTex('edge_08.png') },
    uEdge09: { value: vfxTex('edge_09.png') },
    uEdge06: { value: vfxTex('edge_06.png') },
    uNoise: { value: noiseTex },
  };
  const timerBgMat = new THREE.ShaderMaterial({
    uniforms: timerUniforms,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform sampler2D uDots;
      varying vec2 vUv;
      void main() {
        if (uProgress <= 0.005 || vUv.x > uProgress) discard;
        vec4 d = texture2D(uDots, vUv * vec2(120.0, 4.0));
        float dotMask = max(d.a, d.r);
        vec3 bgCol = vec3(0.0, 0.34, 0.20);
        vec3 dotCol = vec3(0.28, 0.92, 0.80);
        vec3 col = mix(bgCol, dotCol, dotMask * 0.38);
        gl_FragColor = vec4(col, 0.56);
        #include <colorspace_fragment>
      }
    `,
  });
  const timerBgMesh = loadScbMesh('./assets/map1/vfx/fountain_timer.json', timerBgMat);
  timerBgMesh.scale.set(0.92, 1, 0.92);
  timerBgMesh.rotation.y = Math.PI;
  timerBgMesh.position.y = 0.15;
  timerBgMesh.visible = false;
  timerBgMesh.renderOrder = 6;
  fGroup.add(timerBgMesh);

  const timerTechMat = new THREE.ShaderMaterial({
    uniforms: timerUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform float uTime;
      uniform sampler2D uEdge08;
      uniform sampler2D uEdge09;
      uniform sampler2D uEdge06;
      uniform sampler2D uNoise;
      varying vec2 vUv;
      void main() {
        if (uProgress <= 0.005 || vUv.x > uProgress) discard;
        float e8 = texture2D(uEdge08, vUv * vec2(14.0, 1.0)).r;
        float e9 = texture2D(uEdge09, vUv * vec2(4.0, 1.0)).r;
        float e6 = texture2D(uEdge06, vUv * vec2(16.0, 1.0) + vec2(0.5, 0.0)).r;
        float nz = texture2D(uNoise, vUv * vec2(8.0, 1.0) + vec2(-uTime * 0.15, 0.0)).r;
        float head = smoothstep(0.022, 0.0, uProgress - vUv.x);
        vec3 cyanCol = vec3(0.28, 0.92, 0.96);
        vec3 warmCol = vec3(1.0, 0.85, 0.35);
        vec3 baseTint = mix(cyanCol, warmCol, smoothstep(0.75, 1.0, uProgress));
        float energy = e8 * 0.34 + e9 * 0.44 + e6 * 0.34 + nz * 0.18 + head * 0.65;
        vec3 col = baseTint * energy + vec3(0.20, 0.95, 0.65) * head * 0.55;
        float alpha = clamp(energy * 0.62, 0.0, 0.82);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const timerTechMesh = loadScbMesh('./assets/map1/vfx/fountain_timer.json', timerTechMat);
  timerTechMesh.scale.set(0.92, 1, 0.92);
  timerTechMesh.rotation.y = Math.PI;
  timerTechMesh.position.y = 0.16;
  timerTechMesh.visible = false;
  timerTechMesh.renderOrder = 7;
  fGroup.add(timerTechMesh);

  const timerStartMat = new THREE.MeshBasicMaterial({
    map: vfxTex('edge_start_01.png'),
    color: 0x6ef5ff,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const timerStartMesh = loadScbMesh('./assets/map1/vfx/fountain_timer_start.json', timerStartMat);
  timerStartMesh.scale.set(0.92, 1, 0.92);
  timerStartMesh.rotation.y = Math.PI * (178.8 / 180);
  timerStartMesh.position.y = 0.165;
  timerStartMesh.visible = false;
  timerStartMesh.renderOrder = 8;
  fGroup.add(timerStartMesh);

  // 7. 站圈充能旋转星芒（lilstar.png 4x2 独立裁剪单格 + 环绕）
  const starTex = loadSpriteCell('./assets/map1/vfx/lilstar.png', 0, 0, 4, 2);
  const chargeCount = 36;
  const chargePos = new Float32Array(chargeCount * 3);
  for (let i = 0; i < chargeCount; i++) {
    const a = (i / chargeCount) * Math.PI * 2;
    chargePos[i * 3] = Math.cos(a) * 8.5;
    chargePos[i * 3 + 1] = 0.4 + (i % 4) * 0.35;
    chargePos[i * 3 + 2] = Math.sin(a) * 8.5;
  }
  const chargeGeo = new THREE.BufferGeometry();
  chargeGeo.setAttribute('position', new THREE.BufferAttribute(chargePos, 3));
  const chargeMat = new THREE.PointsMaterial({
    size: 0.85,
    map: starTex,
    color: 0x40ff87,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const chargePts = new THREE.Points(chargeGeo, chargeMat);
  chargePts.renderOrder = 11;
  fGroup.add(chargePts);

  // 8. 满充 Nova 爆发（上下软渐隐紧凑光柱 + 地面冲击光 + 金星闪光，绝不切穿外围建筑）
  const beamUniforms = {
    uTex: { value: vfxTex('decal_light_01.png') },
    uOpacity: { value: 0 },
  };
  const beamMat = new THREE.ShaderMaterial({
    uniforms: beamUniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float vFade = smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.30, vUv.y);
        if (vFade < 0.005) discard;
        vec4 tex = texture2D(uTex, vUv);
        float m = max(tex.a, max(tex.r, tex.g));
        gl_FragColor = vec4(vec3(0.15, 1.0, 0.72) * (0.6 + 0.6 * m), m * vFade * uOpacity);
        #include <colorspace_fragment>
      }
    `,
  });
  const beamMesh = loadScbMesh('./assets/map1/vfx/fountain_beam.json', beamMat);
  beamMesh.scale.set(0.012, 0.010, 0.012);
  beamMesh.visible = false;
  beamMesh.renderOrder = 13;
  fGroup.add(beamMesh);

  const novaGlowMat = new THREE.MeshBasicMaterial({
    map: vfxTex('base_glow.png'),
    color: 0x2effa1,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const novaGlow = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), novaGlowMat);
  novaGlow.rotation.x = -Math.PI / 2;
  novaGlow.position.y = 1.0;
  novaGlow.visible = false;
  novaGlow.renderOrder = 13;
  fGroup.add(novaGlow);

  const novaStarMat = new THREE.MeshBasicMaterial({
    map: vfxTex('star1.png'),
    color: 0xffd159,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const novaStar = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 8.0), novaStarMat);
  novaStar.rotation.x = -Math.PI / 2;
  novaStar.position.y = 2.0;
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
  let cdShrinkT = 0;
  const cTmp = new THREE.Color();

  return {
    group,
    sun,
    ready: mapReady,
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
        novaT = 0.85;
        cdShrinkT = 0.15;
      }
      lastFState = fState;

      // 悬浮 3D 蜂窝全息球核动画（进入冷却 0.15s 快速收缩消隐，绝不留暗灰球）
      if (cdShrinkT > 0) cdShrinkT = Math.max(0, cdShrinkT - dt);
      const shrinkScale = onCd ? cdShrinkT / 0.15 : 1.0;
      sphereGroup.visible = !onCd || cdShrinkT > 0;
      sphereGroup.scale.setScalar(Math.max(0.001, shrinkScale));
      sphereGroup.position.y = 3.5 + Math.sin(t * 2.1) * 0.14;
      sphereUniforms.uTime.value = t;
      sphereUniforms.uCooldown.value = 0;
      sphereUniforms.uCharging.value = charging ? 1 : 0;
      const rotSpd = charging ? 0.9 : 0.35;
      sphereCore.rotation.y = t * rotSpd;
      sphereHex.rotation.y = t * rotSpd;
      sphereSwirl.rotation.y = -t * rotSpd * 1.3;
      sphereHaloMat.opacity = (charging ? 0.34 : 0.22) * shrinkScale;

      // 水池多层动画环（Basic5 + Crecents1 + Crecents2 + outer_graphic1）
      sharpUniforms.uDim.value = onCd ? 1 : 0;
      sharpUniforms.uOpacity.value = onCd ? 0.45 : charging ? 0.96 : 0.92;
      const visMul = onCd ? 0.0 : charging ? 1.05 : 0.85;

      for (let i = 0; i < crecents1.length; i++) {
        const k = (t + i * 0.5) % 1;
        const c = crecents1[i];
        c.mesh.visible = !onCd;
        c.mesh.scale.setScalar(1.3 - k * 0.8);
        c.mesh.rotation.z = t * 0.35 + i * 1.57;
        const a = k < 0.4 ? k / 0.4 : (1 - k) / 0.6;
        c.mat.opacity = a * 0.42 * visMul;
        if (k < 0.4) cTmp.setRGB(0.01 + (0.17 * k) / 0.4, 1.0, 0.85 - (0.39 * k) / 0.4);
        else cTmp.setRGB(0.18 - (0.17 * (k - 0.4)) / 0.6, 1.0, 0.46 - (0.31 * (k - 0.4)) / 0.6);
        c.mat.color.copy(cTmp);
      }

      for (let i = 0; i < crecents2.length; i++) {
        const k = (t + i * 0.5) % 1;
        const c = crecents2[i];
        c.mesh.visible = !onCd;
        const sc = k < 0.8 ? 0.7 + (0.45 * k) / 0.8 : 1.15 + (0.1 * (k - 0.8)) / 0.2;
        c.mesh.scale.setScalar(sc);
        c.mesh.rotation.z = -t * 0.28 + i * 1.57;
        const a = k < 0.3 ? k / 0.3 : (1 - k) / 0.7;
        c.mat.opacity = a * 0.28 * visMul;
      }

      for (let i = 0; i < outerGraphic1.length; i++) {
        const k = (t * 0.5 + i * 0.5) % 1;
        const c = outerGraphic1[i];
        c.mesh.visible = !onCd;
        c.mesh.scale.setScalar(1.0 - k);
        c.mesh.rotation.z = t * 0.2 + i * 2.1;
        const a = k < 0.4 ? k / 0.4 : (1 - k) / 0.6;
        c.mat.opacity = a * 0.34 * visMul;
        if (k < 0.4) cTmp.setRGB(0.02, 0.66 + (0.34 * k) / 0.4, 0.98 - (0.46 * k) / 0.4);
        else cTmp.setRGB(0.02 - (0.01 * (k - 0.4)) / 0.6, 1.0, 0.52 - (0.34 * (k - 0.4)) / 0.6);
        c.mat.color.copy(cTmp);
      }

      // 外沿底座光边（Edge10 双层交错呼吸）
      for (const b of baseEdges) {
        b.mesh.visible = !onCd;
        if (!onCd) {
          const k = (t * 0.25 + b.phase) % 1;
          const fade = k < 0.5 ? k * 2 : (1 - k) * 2;
          b.mat.opacity = fade * (charging ? 0.55 : 0.42);
          b.mesh.rotation.y = t * 0.052 + b.phase * Math.PI;
        }
      }
      outerGraphic.mat.opacity = onCd ? 0.02 : charging ? 0.15 : 0.08;

      // 3D 脉冲波浪罩（Shockwave_blend 2s UV 径向滚动）
      waveMesh.visible = !onCd;
      if (!onCd) {
        const wPhase = (t * 0.5) % 1;
        waveUniforms.uPhase.value = wPhase;
        const env = wPhase < 0.3 ? wPhase / 0.3 : wPhase < 0.6 ? 1.0 : (1 - wPhase) / 0.4;
        waveUniforms.uOpacity.value = env * (charging ? 0.56 : 0.42);
      }

      // 六边形 "+" 治疗粒子与空心六边形粒子飘升
      hexPts.visible = !onCd;
      hex2Pts.visible = !onCd;
      if (!onCd) {
        hexMat.opacity = charging ? 0.98 : 0.88;
        hex2Mat.opacity = charging ? 0.9 : 0.78;
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

      // 外圈站圈环 & 原生 3D 充能进度弧（fountain_timer.json + fountain_timer_start.json）
      zoneTex.offset.x = (t * (charging ? 0.12 : 0.03)) % 1;
      zoneMat.color.setHex(onCd ? 0x33505c : charging ? 0x5effb2 : 0x2ef89a);
      zoneMat.opacity = onCd ? 0.15 : charging ? 0.68 : 0.40;

      const showTimer = !onCd && charge > 0.005;
      timerBgMesh.visible = showTimer;
      timerTechMesh.visible = showTimer;
      timerStartMesh.visible = showTimer;
      timerUniforms.uProgress.value = charge;
      timerUniforms.uTime.value = t;

      chargePts.visible = !onCd && charging;
      if (chargePts.visible) {
        chargePts.rotation.y = t * 1.4;
      }

      // Nova 爆发（0.85s，上下软渐隐光柱 + 低矮冲击光 + 金星闪光）
      if (novaT > 0) {
        novaT = Math.max(0, novaT - dt);
        const k = 1 - novaT / 0.85;
        beamMesh.visible = true;
        beamMesh.rotation.y = t * 2.5;
        beamMesh.scale.set(0.011 + k * 0.003, 0.009 + k * 0.005, 0.011 + k * 0.003);
        beamUniforms.uOpacity.value = (1 - k) * 0.78;

        novaGlow.visible = k < 0.7;
        novaGlow.scale.setScalar(0.65 + k * 0.95);
        novaGlowMat.opacity = Math.max(0, 1 - k * 1.45) * 0.62;

        novaStar.visible = k < 0.6;
        novaStar.rotation.z = t * 4;
        novaStar.scale.setScalar(0.5 + k * 1.8);
        novaStarMat.opacity = Math.max(0, 1 - k * 1.7);
      } else {
        beamMesh.visible = false;
        novaGlow.visible = false;
        novaStar.visible = false;
      }

      if (bossRing) {
        const mat = bossRing.material as THREE.MeshBasicMaterial;
        mat.opacity = alarm > 0.01 ? 0.45 + Math.sin(t * 10) * 0.25 : 0.28;
      }
    },
  };
}
