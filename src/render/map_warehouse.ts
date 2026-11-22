import * as THREE from 'three';
import { FOUNTAIN } from '../config';
import map1Data from '../sim/map1_data.json';
import map1Lightmaps from '../sim/map1_lightmaps.json';
import map1Materials from '../sim/map1_materials.json';
import { getTexture, loadGLB, loadScbGeo, loadSpriteCell as loadAssetSpriteCell } from './assets';
import { QUALITY_SPECS, type QualityTier } from './quality';
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
  sphereCore.scale.setScalar(0.0100); // Edge14/Edge17 原版 bS = 1.0
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
  sphereHex.scale.setScalar(0.0098); // Edge12 原版 bS = 0.98（Edge13/15 叠在同层）
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
    color: new THREE.Color().setRGB(0.1, 0.87, 0.581, THREE.SRGBColorSpace), // 原版 Basic4 birthColor
    transparent: true,
    opacity: 0.4,
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

  const dotsTex = vfxTex('dots.png');
  const scanLinesTex = vfxTex('healingstation_scan_lines.webp');
  const glowHardEdgeTex = vfxTex('healingstation_glow_hardedge.webp');
  const baseGlowTex = vfxTex('base_glow.png');

  // 带 textureMult 叠加的地面贴图环工厂（补齐原版 7 个常驻层的点阵/光晕/硬边细节）
  const mkMultDecalPlane = (
    size: number,
    y: number,
    texName: string,
    multTex: THREE.Texture,
    multScale: number,
    hex: number,
    opacity: number,
    order = 8,
  ) => {
    const col = new THREE.Color(hex);
    const u = {
      uTex: { value: vfxTex(texName) },
      uMult: { value: multTex },
      uMultScale: { value: multScale },
      uColor: { value: col },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: u,
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
        uniform sampler2D uMult;
        uniform float uMultScale;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vec4 base = texture2D(uTex, vUv);
          vec4 mult = texture2D(uMult, vUv * uMultScale + vec2(uTime * 0.04, -uTime * 0.03));
          float bm = max(base.a, max(base.r, base.g));
          float mm = mix(0.45, 1.25, max(mult.a, max(mult.r, mult.g)));
          float a = bm * mm * uOpacity;
          if (a < 0.004) discard;
          gl_FragColor = vec4(uColor * (0.85 + 0.35 * mult.rgb), a);
          #include <colorspace_fragment>
        }
      `,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.renderOrder = order;
    fGroup.add(m);
    return {
      mesh: m,
      u,
      mat: {
        get opacity() { return u.uOpacity.value; },
        set opacity(v: number) { u.uOpacity.value = v; },
        color: col,
      },
    };
  };

  const crecents1 = [
    mkMultDecalPlane(7.6, 0.90, 'timer_outline.png', baseGlowTex, 1.0, 0x2ef88a, 0.0, 8),
    mkMultDecalPlane(7.6, 0.91, 'timer_outline.png', baseGlowTex, 1.0, 0x2ef88a, 0.0, 8),
  ];
  const crecents2 = [
    mkMultDecalPlane(10.0, 0.89, 'glow_ring.png', glowHardEdgeTex, 1.0, 0x03ff6e, 0.0, 7),
    mkMultDecalPlane(10.0, 0.895, 'glow_ring.png', glowHardEdgeTex, 1.0, 0x03ff6e, 0.0, 7),
  ];
  const outerGraphic1 = [
    mkMultDecalPlane(10.0, 0.92, 'glow_ring.png', dotsTex, 6.0, 0x05ff85, 0.0, 8),
    mkMultDecalPlane(10.0, 0.925, 'glow_ring.png', dotsTex, 6.0, 0x05ff85, 0.0, 8),
  ];

  // 3. 喷泉底座光边（Edge10: 官方 bS=3.2 + 叠加 scan_lines 下滚）+ outer_graphic（官方 bS=1400 + 叠加 dots）
  const baseEdgeTex = vfxTex('hollow_decal.png');
  const baseEdges = [0, 0.5].map((phase, idx) => {
    const u = {
      uTex: { value: baseEdgeTex },
      uScan: { value: scanLinesTex },
      uOpacity: { value: 0.42 },
      uTime: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: u,
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
        uniform sampler2D uScan;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vec4 base = texture2D(uTex, vec2(vUv.x * 9.0, vUv.y));
          vec4 scan = texture2D(uScan, vec2(vUv.x * 18.0, vUv.y * 2.0 - uTime * 0.45));
          float bm = max(base.a, max(base.r, base.g));
          float sm = mix(0.50, 1.25, max(scan.a, scan.r));
          float a = bm * sm * uOpacity;
          if (a < 0.004) discard;
          gl_FragColor = vec4(vec3(0.0, 1.0, 0.42) * (0.85 + 0.30 * scan.r), a);
          #include <colorspace_fragment>
        }
      `,
    });
    const mesh = loadScbMesh('./assets/map1/vfx/fountain_baseedge.json', mat);
    mesh.scale.setScalar(0.032);
    mesh.position.y = 0.14 + idx * 0.01;
    mesh.renderOrder = 5;
    fGroup.add(mesh);
    return {
      mesh,
      u,
      mat: {
        get opacity() { return u.uOpacity.value; },
        set opacity(v: number) { u.uOpacity.value = v; },
      },
      phase,
    };
  });

  const outerGraphic = mkMultDecalPlane(28.0, 0.10, 'glowring_outer.png', dotsTex, 8.0, 0x00ff60, 0.08, 4);

  // 4. 3D 脉冲波浪罩（Shockwave_blend）：Glow 常驻层与 Nova 两层共用材质工厂（支持 dots 叠加）
  //    v = uv.y * uVScale + uVOffset（texDiv / uvScale / birthUVOffset / UV 滚动折算）
  const makeWaveMat = (vScale: number, rgb: [number, number, number], useDots = false) => {
    const u = {
      uVScale: { value: vScale },
      uVOffset: { value: -0.8 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Vector3(rgb[0], rgb[1], rgb[2]) },
      uTex: { value: vfxTex('shockwave.png') },
      uDots: { value: dotsTex },
      uUseDots: { value: useDots ? 1.0 : 0.0 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: u,
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
        uniform float uVScale;
        uniform float uVOffset;
        uniform float uOpacity;
        uniform vec3 uColor;
        uniform sampler2D uTex;
        uniform sampler2D uDots;
        uniform float uUseDots;
        varying vec2 vUv;
        varying float vAlpha;
        void main() {
          float v = vUv.y * uVScale + uVOffset;
          if (v < 0.0 || v > 1.0) discard;
          vec4 tex = texture2D(uTex, vec2(vUv.x, v));
          float m = max(tex.a, max(tex.r, tex.g));
          if (uUseDots > 0.5) {
            vec4 d = texture2D(uDots, vec2(vUv.x * 16.0, v * 4.0));
            m *= mix(0.55, 1.35, max(d.a, d.r));
          }
          float a = m * vAlpha * uOpacity;
          if (a < 0.004) discard;
          gl_FragColor = vec4(uColor, a);
          #include <colorspace_fragment>
        }
      `,
    });
    return { mat, u };
  };
  // Glow/Shockwave_blend：scale = (0.25, 0.08, 0.25)，2 s 一次，α 0 → 0.5 → 0.5 → 0，叠加 dots
  const glowWave = makeWaveMat(0.6, [0.0, 1.0, 0.45], true);
  const waveUniforms = glowWave.u;
  const waveMesh = loadScbMesh('./assets/map1/vfx/fountain_wave.json', glowWave.mat);
  waveMesh.scale.set(0.25, 0.08, 0.25);
  waveMesh.position.y = 0.12;
  waveMesh.renderOrder = 9;
  fGroup.add(waveMesh);

  // ── 原版粒子发射器公共设施（CPU 模拟 + 单 DrawCall Points；图集按帧采样；尺寸按世界米换算） ──
  // 原版颜色为 sRGB 数值：写入 Shader 前转线性，经 colorspace_fragment 输出后与原版数值一致
  const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const linRGBA = (rows: number[][]) => rows.map(([r, g, b, a]) => [toLin(r), toLin(g), toLin(b), a]);
  /** 分段线性曲线采样（等价 VfxAnimated*VariableData；两端外推为端点值） */
  const curve1 = (times: number[], vals: number[], k: number): number => {
    const n = times.length - 1;
    if (k <= times[0]) return vals[0];
    if (k >= times[n]) return vals[n];
    let i = 1;
    while (i < n && k > times[i]) i++;
    const f = (k - times[i - 1]) / Math.max(1e-6, times[i] - times[i - 1]);
    return vals[i - 1] + (vals[i] - vals[i - 1]) * f;
  };
  const curve4 = (times: number[], vals: number[][], k: number, out: number[]): number[] => {
    const n = times.length - 1;
    if (k <= times[0] || k >= times[n]) {
      const v = vals[k <= times[0] ? 0 : n];
      out[0] = v[0];
      out[1] = v[1];
      out[2] = v[2];
      out[3] = v[3];
      return out;
    }
    let i = 1;
    while (i < n && k > times[i]) i++;
    const a = vals[i - 1];
    const b = vals[i];
    const f = (k - times[i - 1]) / Math.max(1e-6, times[i] - times[i - 1]);
    for (let c = 0; c < 4; c++) out[c] = a[c] + (b[c] - a[c]) * f;
    return out;
  };
  /** 分段线性曲线 0→k 的积分（IntegratedValue：UV 滚动速率 → 累计偏移） */
  const curveIntegral = (times: number[], vals: number[], k: number): number => {
    let acc = 0;
    for (let i = 1; i < times.length; i++) {
      const t0 = times[i - 1];
      const t1 = Math.min(times[i], k);
      if (t1 <= t0) break;
      acc += (vals[i - 1] + curve1(times, vals, t1)) * 0.5 * (t1 - t0);
    }
    return acc;
  };
  const rnd = (a: number, b: number) => a + (b - a) * Math.random();
  /** VfxProbabilityTableData：keyTimes → keyValues 的随机倍率 */
  const prob = (keys: number[], vals: number[]) => curve1(keys, vals, Math.random());

  interface FxCurves {
    sT: number[]; // scale0 曲线（统一缩放取 x 分量）
    sV: number[];
    cT: number[]; // color 生命周期曲线（线性 RGB + A）
    cV: number[][];
  }
  interface FxParticle {
    age: number;
    life: number;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    dx: number; // birthDrag（指数衰减 /s）
    dy: number;
    dz: number;
    ay: number; // worldAcceleration.y（m/s²）
    size: number; // 全尺寸（米，父节点局部空间）
    frame: number;
    cv: FxCurves;
  }
  const particleViewH = { value: 800 };
  const fxTmp4 = [0, 0, 0, 0];
  const makeFxPool = (parent: THREE.Object3D, atlas: string, cols: number, rows: number, capacity: number, order: number) => {
    const pos = new Float32Array(capacity * 3);
    const size = new Float32Array(capacity);
    const frame = new Float32Array(capacity);
    const color = new Float32Array(capacity * 4);
    const aPos = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
    const aSize = new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage);
    const aFrame = new THREE.BufferAttribute(frame, 1).setUsage(THREE.DynamicDrawUsage);
    const aColor = new THREE.BufferAttribute(color, 4).setUsage(THREE.DynamicDrawUsage);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', aPos);
    geo.setAttribute('aSize', aSize);
    geo.setAttribute('aFrame', aFrame);
    geo.setAttribute('aColor', aColor);
    geo.setDrawRange(0, 0);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uAtlas: { value: vfxTex(atlas) },
        uGrid: { value: new THREE.Vector2(cols, rows) },
        uViewH: particleViewH,
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aFrame;
        attribute vec4 aColor;
        uniform float uViewH;
        varying float vFrame;
        varying vec4 vColor;
        void main() {
          vFrame = aFrame;
          vColor = aColor;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float modelScale = length(modelMatrix[0].xyz);
          // 世界尺寸 aSize（米）→ 像素：size * cot(fov/2) * 0.5 * 视口高 / 深度
          gl_PointSize = aSize * modelScale * projectionMatrix[1][1] * 0.5 * uViewH / max(0.05, -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uAtlas;
        uniform vec2 uGrid;
        varying float vFrame;
        varying vec4 vColor;
        void main() {
          if (vColor.a < 0.003) discard;
          float f = floor(vFrame + 0.5);
          float col = mod(f, uGrid.x);
          float row = floor(f / uGrid.x);
          vec2 uv = vec2((col + gl_PointCoord.x) / uGrid.x, 1.0 - (row + gl_PointCoord.y) / uGrid.y);
          vec4 tex = texture2D(uAtlas, uv);
          float luma = max(tex.r, max(tex.g, tex.b));
          float a = min(tex.a, luma) * vColor.a;
          if (a < 0.005) discard;
          gl_FragColor = vec4(tex.rgb * vColor.rgb * 1.45, a);
          #include <colorspace_fragment>
        }
      `,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    pts.renderOrder = order;
    parent.add(pts);
    const live: FxParticle[] = [];
    return {
      spawn(p: FxParticle) {
        if (live.length < capacity) live.push(p);
      },
      update(dt: number) {
        let w = 0;
        for (let i = 0; i < live.length; i++) {
          const p = live[i];
          p.age += dt;
          if (p.age >= p.life) continue;
          p.vx *= Math.exp(-p.dx * dt);
          p.vy = p.vy * Math.exp(-p.dy * dt) + p.ay * dt;
          p.vz *= Math.exp(-p.dz * dt);
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          const k = p.age / p.life;
          const s = curve1(p.cv.sT, p.cv.sV, k);
          curve4(p.cv.cT, p.cv.cV, k, fxTmp4);
          live[w] = p;
          pos[w * 3] = p.x;
          pos[w * 3 + 1] = p.y;
          pos[w * 3 + 2] = p.z;
          size[w] = p.size * s;
          frame[w] = p.frame;
          color[w * 4] = fxTmp4[0];
          color[w * 4 + 1] = fxTmp4[1];
          color[w * 4 + 2] = fxTmp4[2];
          color[w * 4 + 3] = fxTmp4[3];
          w++;
        }
        live.length = w;
        geo.setDrawRange(0, w);
        if (w > 0) {
          aPos.needsUpdate = true;
          aSize.needsUpdate = true;
          aFrame.needsUpdate = true;
          aColor.needsUpdate = true;
        }
      },
    };
  };
  type FxPool = ReturnType<typeof makeFxPool>;

  // 5. Glow/healspark：原版 hex_plus 2×2 随机 4 帧治疗粒子
  //    15 个/s；寿命 2 s × U(0.5, 1)；半径 3 m 圆盘、y = 0.9 m 生成；上升 5 m/s × U(0.5, 1)，阻尼 1；
  //    尺寸 0.4 m × U(0.2, 1)，按 scale0 曲线弹出再收回
  const HEALSPARK_CV: FxCurves = {
    sT: [0, 0.067, 0.3, 0.665, 1.0],
    sV: [0, 0.794, 1.0, 0.617, 0],
    cT: [0, 0.1, 0.8, 1.0],
    cV: linRGBA([
      [0.04, 1.0, 0.473, 1],
      [0.04, 1.0, 0.366, 1],
      [0.04, 1.0, 0.241, 1],
      [0.04, 1.0, 0.191, 1],
    ]),
  };
  const healPool = makeFxPool(fGroup, 'hex_plus.png', 2, 2, 48, 12);
  const spawnHealspark = () => {
    const r = 3.0 * Math.sqrt(Math.random());
    const a = Math.random() * Math.PI * 2;
    healPool.spawn({
      age: 0,
      life: 2.0 * rnd(0.5, 1.0),
      x: Math.cos(a) * r,
      y: 0.9,
      z: Math.sin(a) * r,
      vx: 0,
      vy: 5.0 * rnd(0.5, 1.0),
      vz: 0,
      dx: 0,
      dy: 1.0,
      dz: 0,
      ay: 0,
      size: 1.15 * rnd(0.55, 1.0),
      frame: Math.floor(Math.random() * 4),
      cv: HEALSPARK_CV,
    });
  };

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
    uDots: { value: dotsTex },
    uEdge08: { value: vfxTex('edge_08.png') },
    uEdge09: { value: vfxTex('edge_09.png') },
    uEdge06: { value: vfxTex('edge_06.png') },
    uNoise: { value: noiseTex },
    uMult06: { value: vfxTex('base_timer_mult_06.webp') },
    uMult07: { value: vfxTex('base_timer_mult_07.webp') },
    uMult08: { value: vfxTex('base_timer_mult_08.webp') },
    uMult09: { value: vfxTex('base_timer_mult_09.webp') },
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
      uniform sampler2D uMult06;
      uniform sampler2D uMult09;
      varying vec2 vUv;
      void main() {
        if (uProgress <= 0.005 || vUv.x > uProgress + 0.015) discard;
        vec2 mUv = vec2(clamp(vUv.x - uProgress + 1.0, 0.0, 1.0), vUv.y);
        float m6 = texture2D(uMult06, mUv).r;
        float m9 = texture2D(uMult09, mUv).r;
        float clipMask = smoothstep(uProgress + 0.012, uProgress - 0.004, vUv.x) * mix(0.65, 1.0, m6);
        vec4 d = texture2D(uDots, vUv * vec2(120.0, 4.0));
        float dotMask = max(d.a, d.r) * mix(0.55, 1.0, m9);
        vec3 bgCol = vec3(0.0, 0.34, 0.20);
        vec3 dotCol = vec3(0.28, 0.92, 0.80);
        vec3 col = mix(bgCol, dotCol, dotMask * 0.44);
        gl_FragColor = vec4(col, 0.60 * clipMask);
        #include <colorspace_fragment>
      }
    `,
  });
  // 充能进度头角度：由 fountain_timer.json 顶点 uv.x（= 进度）拟合，供 sparklies1 跟随生成
  let timerA0 = -Math.PI / 2;
  let timerDir = 1;
  const fitTimerHead = (mesh: THREE.Mesh) => {
    const p = mesh.geometry.getAttribute('position');
    const uv = mesh.geometry.getAttribute('uv');
    if (!p || !uv) return;
    mesh.updateMatrix();
    const v = new THREE.Vector3();
    let x0 = 0;
    let z0 = 0;
    let n0 = 0;
    let x1 = 0;
    let z1 = 0;
    let n1 = 0;
    for (let i = 0; i < p.count; i++) {
      const u = uv.getX(i);
      const near0 = u <= 0.02;
      const nearQ = u >= 0.24 && u <= 0.26;
      if (!near0 && !nearQ) continue;
      v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrix);
      const l = Math.hypot(v.x, v.z) || 1;
      if (near0) {
        x0 += v.x / l;
        z0 += v.z / l;
        n0++;
      } else {
        x1 += v.x / l;
        z1 += v.z / l;
        n1++;
      }
    }
    if (!n0 || !n1) return;
    const a0 = Math.atan2(z0, x0);
    let d = Math.atan2(z1, x1) - a0;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    timerA0 = a0;
    timerDir = d >= 0 ? 1 : -1;
  };
  const timerHeadAngle = (k: number) => timerA0 + timerDir * k * Math.PI * 2;
  const timerBgMesh = loadScbMesh('./assets/map1/vfx/fountain_timer.json', timerBgMat, fitTimerHead);
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
      uniform sampler2D uMult06;
      uniform sampler2D uMult07;
      uniform sampler2D uMult08;
      varying vec2 vUv;
      void main() {
        if (uProgress <= 0.005 || vUv.x > uProgress + 0.015) discard;
        vec2 mUv = vec2(clamp(vUv.x - uProgress + 1.0, 0.0, 1.0), vUv.y);
        float m6 = mix(0.60, 1.0, texture2D(uMult06, mUv).r);
        float m7 = texture2D(uMult07, mUv).r;
        float m8 = mix(0.55, 1.15, texture2D(uMult08, mUv).r);
        float e8 = texture2D(uEdge08, vUv * vec2(14.0, 1.0) + vec2(-uTime * 0.07, 0.0)).r;
        float e9 = texture2D(uEdge09, vUv * vec2(4.0, 1.0)).r;
        float e6 = texture2D(uEdge06, vUv * vec2(16.0, 1.0) + vec2(0.5, 0.0)).r;
        float nz = texture2D(uNoise, vUv * vec2(8.0, 1.0) + vec2(-uTime * 0.15, 0.0)).r;
        float head = max(smoothstep(0.025, 0.0, abs(uProgress - vUv.x)), m7 * smoothstep(0.08, 0.0, abs(uProgress - vUv.x)));
        vec3 baseTint = vec3(0.28, 0.92, 0.96); // 原版 Timer_Charge 11 层均为青绿色系，无暖色过渡
        float energy = (e8 * 0.34 + e9 * 0.44 + e6 * 0.34 * m8 + nz * 0.18) * m6 + head * 0.72;
        vec3 col = baseTint * energy + vec3(0.45, 1.0, 0.85) * head * 0.65;
        float alpha = clamp(energy * 0.64, 0.0, 0.86) * smoothstep(uProgress + 0.012, uProgress - 0.004, vUv.x);
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

  // Timer_Charge/Decal_Start2：同一起点网格，普通混合深绿打底（原版 birthColor = (0, 0.42, 0.21, 1)）
  const timerStartBaseMat = new THREE.MeshBasicMaterial({
    map: vfxTex('edge_start_01.png'),
    color: new THREE.Color().setRGB(0.0, 0.42, 0.21, THREE.SRGBColorSpace),
    transparent: true,
    opacity: 1.0,
    blending: THREE.NormalBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const timerStartBaseMesh = loadScbMesh('./assets/map1/vfx/fountain_timer_start.json', timerStartBaseMat);
  timerStartBaseMesh.scale.set(0.92, 1, 0.92);
  timerStartBaseMesh.rotation.y = Math.PI * (178.8 / 180);
  timerStartBaseMesh.position.y = 0.162;
  timerStartBaseMesh.visible = false;
  timerStartBaseMesh.renderOrder = 7.5;
  fGroup.add(timerStartBaseMesh);

  // 7. Timer_Charge/sparklies1：原版 lilStar 4×2 随机帧星芒
  //    40 个/s；沿 8.5 m × U(0.85, 1.1) 圆周、跟随充能进度头（emitRotation 0 → -360°/10 s）生成；
  //    y = 0.6 m，上浮 1 m/s × U(0.2, 1)；寿命 2 s × 概率表(0.5, 1, 1.5)；尺寸 1 m × U(0.7, 1) × 0.7
  const SPARKLE_CV: FxCurves = {
    sT: [0, 0.25, 1],
    sV: [1.1, 1.45, 0.7],
    cT: [0, 0.35, 1.0],
    cV: linRGBA([
      [0.32, 1.0, 0.62, 0.65],
      [0.45, 1.0, 0.72, 1.0],
      [0.255, 1.0, 0.532, 0],
    ]),
  };
  const sparklePool = makeFxPool(fGroup, 'lilstar.png', 4, 2, 140, 11);
  const spawnSparkle = (charge: number) => {
    const a = timerHeadAngle(charge) + rnd(-0.08, 0.08);
    const r = 8.9 * rnd(0.92, 1.06);
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const vt = -0.05 * Math.random(); // 原版 birthVelocity.x = -5（切向微漂）
    sparklePool.spawn({
      age: 0,
      life: 2.0 * prob([0, 0.9, 1.0], [0.5, 1.0, 1.5]),
      x: ca * r,
      y: 0.6,
      z: sa * r,
      vx: -sa * vt,
      vy: 1.0 * rnd(0.2, 1.0),
      vz: ca * vt,
      dx: 0,
      dy: 0,
      dz: 0,
      ay: 0,
      size: 1.05 * rnd(0.75, 1.0),
      frame: Math.floor(Math.random() * 8),
      cv: SPARKLE_CV,
    });
  };

  // 8. 满充 Nova 爆发（原版 Strawberry_MapA_Fountain_Nova：系统 transform 整体 ×1.75）
  //    先 0.15–0.4 s 的瞬间闪光（STAR / brighShockwave / Ground_Light_mesh），再 0.7–3 s 冲击波与粒子收尾
  const NOVA_SCALE = 1.75;
  const novaGroup = new THREE.Group();
  novaGroup.scale.setScalar(NOVA_SCALE);
  fGroup.add(novaGroup);

  // Ground_Light_mesh：LightCylinder ×(1.2, 1, 1.2)，朝向 109°，0.4 s 内自下而上升起
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
  beamMesh.rotation.y = (109 * Math.PI) / 180;
  beamMesh.visible = false;
  beamMesh.renderOrder = 13;
  novaGroup.add(beamMesh);

  // brighShockwave：Base_Glow 16 m（×1.75 = 28 m），y = 1.0 m，0.3 s 内由 2 倍收缩到 0
  const NOVA_GLOW_C = [
    [1.0, 0.8, 0.294, 1.0],
    [1.0, 0.8, 0.294, 1.0],
    [1.0, 0.8, 0.294, 0.631],
    [0.953, 0.6, 0.188, 0.0],
  ];
  const novaGlowMat = new THREE.MeshBasicMaterial({
    map: vfxTex('base_glow.png'),
    color: 0xffffff,
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
  novaGroup.add(novaGlow);

  // STAR：Star_1 面向相机 8 m（×1.75 = 14 m），y = 2.0 m，普通混合金色 α 0.8，0.16 s
  const novaStarMat = new THREE.SpriteMaterial({
    map: vfxTex('star1.png'),
    color: new THREE.Color().setRGB(1.0, 0.82, 0.35, THREE.SRGBColorSpace),
    transparent: true,
    opacity: 0,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });
  const novaStar = new THREE.Sprite(novaStarMat);
  novaStar.position.y = 2.0;
  novaStar.visible = false;
  novaStar.renderOrder = 14;
  novaGroup.add(novaStar);

  // Shockwave_blend（0.7 s，bS 80/10/80）+ Shockwave_blend1（2 s，bS 40/10/40）：复用 Wave01 网格贴地扩散
  const NOVA_WAVE_ALPHA_T = [0.1, 0.165, 0.352, 0.693, 0.9];
  const NOVA_WAVE_ALPHA_V = [0, 1.0, 0.839, 0.412, 0];
  const NOVA_WAVE_SCROLL_T = [0, 0.066, 0.092, 0.277, 0.441, 0.69, 1.0];
  const NOVA_WAVE_SCROLL_V = [1.0, 1.0, 1.0, 0.521, 0.213, 0.061, 0]; // × rate（blend 3.0 / blend1 1.0）
  // fountain_wave.json 原始顶点半径 maxR = 46.33，叠加 novaGroup ×1.75 后：
  // sxz=0.175 → 扩散半径 ~14.2 m（贴合外围广场内缘不穿墙）；sxz=0.135 → 扩散半径 ~10.9 m
  const novaWaves = [
    { life: 0.7, sxz: 0.175, s0: 0.08, rate: 3.0 },
    { life: 2.0, sxz: 0.135, s0: 0.18, rate: 1.0 },
  ].map((cfg) => {
    const w = makeWaveMat(0.6 * 0.7, [0.033, 0.997, 0.386]);
    const mesh = loadScbMesh('./assets/map1/vfx/fountain_wave.json', w.mat);
    mesh.position.y = 0.07; // ×1.75 ≈ 0.12 m，与常驻波浪罩同层
    mesh.visible = false;
    mesh.renderOrder = 9;
    novaGroup.add(mesh);
    return { ...cfg, mesh, u: w.u };
  });

  // Gold（hex_plus 2×2，绿）/ Gold1（lilStar 4×2，金）：单次爆发（isSingleParticle，rate = 数量）
  //    y = 1.0 m、半径 1 m × U(0.5, 1) 环上生成；外抛阻尼 (5, 3, 5)；寿命 2 s × 概率表(0.2, 0.5, 1.5)
  const GOLD_SCALE_T = [0, 0.04, 0.2, 0.55, 1.0];
  const GOLD_SCALE_V = [0.5, 1.9, 2.2, 1.4, 0];
  const GOLD_CV: FxCurves = {
    sT: GOLD_SCALE_T,
    sV: GOLD_SCALE_V,
    cT: [0, 0.1, 0.3, 0.6, 1.0],
    cV: linRGBA([
      [0.2, 1.0, 0.522, 0.9],
      [0.25, 1.0, 0.58, 1],
      [0.2, 1.0, 0.522, 1],
      [0.2, 1.0, 0.522, 0.85],
      [0.0, 0.02, 0.078, 0],
    ]),
  };
  const GOLD1_CV: FxCurves = {
    sT: GOLD_SCALE_T,
    sV: GOLD_SCALE_V,
    cT: [0, 0.35, 1.0],
    cV: linRGBA([
      [1.0, 0.85, 0.32, 0.85],
      [1.0, 0.82, 0.28, 1.0],
      [1.0, 0.714, 0.255, 0],
    ]),
  };
  const goldPool = makeFxPool(novaGroup, 'hex_plus.png', 2, 2, 110, 14);
  const gold1Pool = makeFxPool(novaGroup, 'lilstar.png', 4, 2, 60, 14);
  const burstGold = (pool: FxPool, count: number, sizeFn: () => number, frames: number, cv: FxCurves) => {
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2;
      const c = Math.cos(th);
      const s = Math.sin(th);
      const off = 1.0 * rnd(0.5, 1.0);
      const vx0 = 18 * rnd(0.3, 1.0);
      const vy0 = 9 * rnd(0.2, 1.0);
      const vz0 = 18 * rnd(0.3, 1.0);
      pool.spawn({
        age: 0,
        life: 2.0 * prob([0, 0.5, 1.0], [0.25, 0.6, 1.4]),
        x: c * off,
        y: 1.0,
        z: -s * off,
        vx: vx0 * c + vz0 * s,
        vy: vy0,
        vz: -vx0 * s + vz0 * c,
        dx: 4.5,
        dy: 3,
        dz: 4.5,
        ay: 0.1,
        size: sizeFn(),
        frame: Math.floor(Math.random() * frames),
        cv,
      });
    }
  };
  const triggerNovaBursts = (fx: number) => {
    burstGold(goldPool, Math.round(100 * rnd(0.6, 1.0) * fx), () => 0.55 * rnd(0.55, 1.0), 4, GOLD_CV);
    burstGold(gold1Pool, Math.round(55 * fx), () => 0.9 * rnd(0.7, 1.0), 8, GOLD1_CV);
  };

  // ── 喷泉 Nova 第二批（补齐剩余 10 层原版发射器，均置于 novaGroup ×1.75，严格按顶点 maxR 校准防穿墙） ──
  // A. flashBlend：PointStarAdd 12 m Billboard，y = 2.0，0.15 s 瞬闪
  const novaFlashMat = new THREE.SpriteMaterial({
    map: vfxTex('healingstation_pointstaradd.webp'),
    color: new THREE.Color().setRGB(1.0, 0.96, 0.78, THREE.SRGBColorSpace),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const novaFlash = new THREE.Sprite(novaFlashMat);
  novaFlash.position.y = 2.0;
  novaFlash.visible = false;
  novaFlash.renderOrder = 15;
  novaGroup.add(novaFlash);

  // B. Beamdown / Beamdown1：Base_GlowStar_02 10×14 m 交叉竖直下射光柱，0.22 s
  const novaBeamdowns = [0, Math.PI / 2].map((rotY, idx) => {
    const mat = new THREE.MeshBasicMaterial({
      map: vfxTex('healingstation_base_glowstar_02.webp'),
      color: new THREE.Color().setRGB(idx === 0 ? 0.25 : 0.95, 1.0, idx === 0 ? 0.75 : 0.52, THREE.SRGBColorSpace),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 14), mat);
    m.rotation.y = rotY;
    m.position.y = 5.2;
    m.visible = false;
    m.renderOrder = 14;
    novaGroup.add(m);
    return { mesh: m, mat };
  });

  // C. Ground_Light_mesh1：LightCylinder ×(1.2, 1.5, 1.2) + 叠加 Scan_Lines 向上滚动，0.55 s
  const beamScanUniforms = {
    uTex: { value: vfxTex('decal_light_01.png') },
    uScan: { value: scanLinesTex },
    uOpacity: { value: 0 },
    uTime: { value: 0 },
  };
  const beamScanMat = new THREE.ShaderMaterial({
    uniforms: beamScanUniforms,
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
      uniform sampler2D uScan;
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float vFade = smoothstep(0.0, 0.22, vUv.y) * smoothstep(1.0, 0.28, vUv.y);
        if (vFade < 0.005) discard;
        vec4 tex = texture2D(uTex, vUv);
        vec4 scan = texture2D(uScan, vec2(vUv.x * 6.0, vUv.y * 4.0 - uTime * 2.2));
        float m = max(tex.a, max(tex.r, tex.g)) * mix(0.45, 1.35, max(scan.a, scan.r));
        gl_FragColor = vec4(vec3(0.28, 1.0, 0.85) * (0.7 + 0.5 * scan.r), m * vFade * uOpacity);
        #include <colorspace_fragment>
      }
    `,
  });
  const beamScanMesh = loadScbMesh('./assets/map1/vfx/fountain_beam.json', beamScanMat);
  beamScanMesh.rotation.y = (109 * Math.PI) / 180;
  beamScanMesh.visible = false;
  beamScanMesh.renderOrder = 13;
  novaGroup.add(beamScanMesh);

  // D. 通用滚动 3D 网格着色器工厂（供 InhaleFire×3 / Ring / ShapeAround / teamring_circle1 共用）
  const makeScrollMeshMat = (texName: string, rgb: [number, number, number], uvScale: [number, number], scroll: [number, number]) => {
    const u = {
      uTex: { value: vfxTex(texName) },
      uNoise: { value: noiseTex },
      uColor: { value: new THREE.Vector3(rgb[0], rgb[1], rgb[2]) },
      uUvScale: { value: new THREE.Vector2(uvScale[0], uvScale[1]) },
      uScroll: { value: new THREE.Vector2(scroll[0], scroll[1]) },
      uOpacity: { value: 0 },
      uTime: { value: 0 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: u,
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
        uniform sampler2D uNoise;
        uniform vec3 uColor;
        uniform vec2 uUvScale;
        uniform vec2 uScroll;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vec4 tex = texture2D(uTex, vUv * uUvScale + uScroll * uTime);
          float nz = texture2D(uNoise, vUv * 2.0 + vec2(uTime * 0.15, -uTime * 0.25)).r;
          float m = max(tex.a, max(tex.r, tex.g)) * mix(0.65, 1.15, nz);
          float a = m * uOpacity;
          if (a < 0.004) discard;
          gl_FragColor = vec4(uColor * (0.75 + 0.45 * tex.rgb), a);
          #include <colorspace_fragment>
        }
      `,
    });
    return { mat, u };
  };

  // InhaleFire（FlameMesh, maxR=11.32 → scale 0.48×1.75 ≈ 9.5 m，3.8 s）
  const inhaleFire1 = makeScrollMeshMat('healingstation_meshmult.webp', [0.08, 1.0, 0.56], [2.0, 1.0], [0.15, -0.55]);
  const inhaleFire1Mesh = loadScbMesh('./assets/map1/vfx/fountain_nova_flame.json', inhaleFire1.mat);
  inhaleFire1Mesh.position.y = 0.06;
  inhaleFire1Mesh.visible = false;
  inhaleFire1Mesh.renderOrder = 10;
  novaGroup.add(inhaleFire1Mesh);

  // InhaleFire2（Brand_Base_Ring, maxR=10.0 → scale 0.52×1.75 ≈ 9.1 m，2.0 s）
  const inhaleFire2 = makeScrollMeshMat('healingstation_shockwave_trail.webp', [0.22, 1.0, 0.72], [3.0, 1.0], [-0.45, 0.0]);
  const inhaleFire2Mesh = loadScbMesh('./assets/map1/vfx/fountain_nova_ring.json', inhaleFire2.mat);
  inhaleFire2Mesh.position.y = 0.08;
  inhaleFire2Mesh.visible = false;
  inhaleFire2Mesh.renderOrder = 10;
  novaGroup.add(inhaleFire2Mesh);

  // InhaleFire3（Brand_Base_Ring + Trail_Silk_01, maxR=10.0 → scale 0.44×1.75 ≈ 7.7 m，2.0 s）
  const inhaleFire3 = makeScrollMeshMat('healingstation_trail_silk_01.webp', [0.65, 1.0, 0.48], [2.0, 1.0], [0.55, 0.0]);
  const inhaleFire3Mesh = loadScbMesh('./assets/map1/vfx/fountain_nova_ring.json', inhaleFire3.mat);
  inhaleFire3Mesh.position.y = 0.10;
  inhaleFire3Mesh.visible = false;
  inhaleFire3Mesh.renderOrder = 11;
  novaGroup.add(inhaleFire3Mesh);

  // Ring（HealingStation_Swirl, maxR=91.64 → scale 0.055×1.75 ≈ 8.8 m，2.2 s，双层交错旋涡）
  const novaRings = [0, Math.PI].map((rot0) => {
    const r = makeScrollMeshMat('healingstation_circle_mis.webp', [0.12, 1.0, 0.68], [2.0, 1.0], [0.85, 0.0]);
    const mesh = loadScbMesh('./assets/map1/vfx/fountain_nova_swirl.json', r.mat);
    mesh.position.y = 1.1;
    mesh.visible = false;
    mesh.renderOrder = 12;
    novaGroup.add(mesh);
    return { mesh, u: r.u, rot0 };
  });

  // ShapeAround（HealingStation_Shape_Music, maxR=32.52 → scale 0.14×1.75 ≈ 8.0 m，1.6 s）
  const novaShape = makeScrollMeshMat('music_aura.webp', [0.38, 1.0, 0.85], [2.0, 1.0], [0.35, -0.45]);
  const novaShapeMesh = loadScbMesh('./assets/map1/vfx/fountain_nova_shape.json', novaShape.mat);
  novaShapeMesh.position.y = 0.15;
  novaShapeMesh.visible = false;
  novaShapeMesh.renderOrder = 11;
  novaGroup.add(novaShapeMesh);

  // teamring_circle1（HealingStation_Indicator, maxR=30.55 → scale 0.21×1.75 ≈ 11.2 m 贴合站圈，4.2 s）
  const novaTeamRing = makeScrollMeshMat('healingstation__infernal_smoke_trail.webp', [0.10, 0.96, 0.62], [4.0, 1.0], [0.22, 0.0]);
  const novaTeamRingMesh = loadScbMesh('./assets/map1/vfx/fountain_nova_indicator.json', novaTeamRing.mat);
  novaTeamRingMesh.position.y = 0.09;
  novaTeamRingMesh.visible = false;
  novaTeamRingMesh.renderOrder = 9;
  novaGroup.add(novaTeamRingMesh);

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
  let novaElapsed = -1;
  let healAcc = 0;
  let sparkAcc = 0;
  const viewSize = new THREE.Vector2();
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

      // 画质档位只缩放粒子发射数量（渲染负载），不影响逻辑层
      const fxScale = QUALITY_SPECS[_tier as QualityTier]?.fxScale ?? 1;

      if (lastFState !== 'cooldown' && fState === 'cooldown') {
        novaElapsed = 0;
        triggerNovaBursts(fxScale);
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
      sphereHaloMat.opacity = 0.4 * shrinkScale; // 原版 Basic4 α = 0.4，常驻不随充能变化

      // 水池多层动画环（Basic5 + Crecents1 + Crecents2 + outer_graphic1）
      sharpUniforms.uDim.value = onCd ? 1 : 0;
      sharpUniforms.uOpacity.value = onCd ? 0.45 : charging ? 0.96 : 0.92;
      const visMul = onCd ? 0.0 : charging ? 1.05 : 0.85;

      for (let i = 0; i < crecents1.length; i++) {
        const k = (t + i * 0.5) % 1;
        const c = crecents1[i];
        c.mesh.visible = !onCd;
        c.u.uTime.value = t;
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
        c.u.uTime.value = t;
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
        c.u.uTime.value = t;
        c.mesh.scale.setScalar(1.0 - k);
        c.mesh.rotation.z = t * 0.2 + i * 2.1;
        const a = k < 0.4 ? k / 0.4 : (1 - k) / 0.6;
        c.mat.opacity = a * 0.34 * visMul;
        if (k < 0.4) cTmp.setRGB(0.02, 0.66 + (0.34 * k) / 0.4, 0.98 - (0.46 * k) / 0.4);
        else cTmp.setRGB(0.02 - (0.01 * (k - 0.4)) / 0.6, 1.0, 0.52 - (0.34 * (k - 0.4)) / 0.6);
        c.mat.color.copy(cTmp);
      }

      // 外沿底座光边（Edge10 双层交错呼吸 + scan_lines 下滚）
      for (const b of baseEdges) {
        b.mesh.visible = !onCd;
        if (!onCd) {
          const k = (t * 0.25 + b.phase) % 1;
          const fade = k < 0.5 ? k * 2 : (1 - k) * 2;
          b.u.uTime.value = t;
          b.mat.opacity = fade * (charging ? 0.55 : 0.42);
          b.mesh.rotation.y = t * 0.052 + b.phase * Math.PI;
        }
      }
      outerGraphic.u.uTime.value = t;
      outerGraphic.mat.opacity = onCd ? 0.02 : charging ? 0.15 : 0.08;

      // 3D 脉冲波浪罩（Shockwave_blend 2s UV 径向滚动）
      waveMesh.visible = !onCd;
      if (!onCd) {
        const wPhase = (t * 0.5) % 1;
        waveUniforms.uVOffset.value = -0.8 + wPhase * 1.1;
        const env = wPhase < 0.3 ? wPhase / 0.3 : wPhase < 0.6 ? 1.0 : (1 - wPhase) / 0.4;
        waveUniforms.uOpacity.value = env * 0.5; // 原版 α 峰值 0.5，常驻不随充能变化
      }

      // Glow/healspark：冷却期间停止发射，已发射的粒子自然走完寿命
      particleViewH.value = gl.getDrawingBufferSize(viewSize).y;
      if (!onCd) {
        healAcc += dt * 15 * fxScale;
        while (healAcc >= 1) {
          healAcc -= 1;
          spawnHealspark();
        }
      }

      // 外圈站圈环 & 原生 3D 充能进度弧（fountain_timer.json + fountain_timer_start.json）
      zoneTex.offset.x = (t * (charging ? 0.12 : 0.03)) % 1;
      zoneMat.color.setHex(onCd ? 0x33505c : charging ? 0x5effb2 : 0x2ef89a);
      zoneMat.opacity = onCd ? 0.15 : charging ? 0.68 : 0.40;

      const showTimer = !onCd && charge > 0.005;
      timerBgMesh.visible = showTimer;
      timerTechMesh.visible = showTimer;
      timerStartMesh.visible = showTimer;
      timerStartBaseMesh.visible = showTimer;
      timerUniforms.uProgress.value = charge;
      timerUniforms.uTime.value = t;

      // Timer_Charge/sparklies1：仅充能中发射，生成点跟随进度头
      if (charging && !onCd) {
        sparkAcc += dt * 40 * fxScale;
        while (sparkAcc >= 1) {
          sparkAcc -= 1;
          spawnSparkle(charge);
        }
      } else {
        sparkAcc = 0;
      }

      // Nova 爆发：按原版各层寿命分段推进（闪光 0.15–0.4 s，冲击波 0.7 / 2 s，粒子 0.4–3 s）
      if (novaElapsed >= 0) {
        novaElapsed += dt;
        const e = novaElapsed;

        // Ground_Light_mesh（0.4 s）
        const kb = e / 0.4;
        beamMesh.visible = kb < 1;
        if (beamMesh.visible) {
          const ys = curve1([0.02, 0.646], [0, 1], kb);
          beamMesh.scale.set(0.012, 0.01 * Math.max(0.001, ys), 0.012);
          beamUniforms.uOpacity.value = 0.4 * curve1([0.011, 0.052, 0.426, 0.654, 1.0], [0, 0.98, 0.494, 0.369, 0], kb);
        }

        // brighShockwave（0.3 s）
        const kg = e / 0.3;
        novaGlow.visible = kg < 1;
        if (novaGlow.visible) {
          novaGlow.scale.setScalar(Math.max(0.001, curve1([0, 0.6, 1.0], [1.25, 0.72, 0], kg)));
          curve4([0, 0.3, 0.634, 1.0], NOVA_GLOW_C, kg, fxTmp4);
          novaGlowMat.color.setRGB(0.18 * fxTmp4[0], 1.0 * fxTmp4[1], 0.63 * fxTmp4[2], THREE.SRGBColorSpace);
          novaGlowMat.opacity = 0.42 * fxTmp4[3];
        }

        // STAR（0.16 s）
        const ks = e / 0.16;
        novaStar.visible = ks < 1;
        if (novaStar.visible) {
          novaStar.scale.setScalar(8.0 * curve1([0, 0.3, 1.0], [1.5, 0.8, 0.2], ks));
          novaStarMat.opacity = 0.8;
        }

        // Shockwave_blend / Shockwave_blend1
        for (const w of novaWaves) {
          const k = e / w.life;
          w.mesh.visible = k < 1;
          if (!w.mesh.visible) continue;
          const sxz = w.sxz * (w.s0 + (1 - w.s0) * k);
          w.mesh.scale.set(sxz, 0.1 * (0.5 + 0.5 * k), sxz);
          w.u.uVOffset.value = -0.8 + w.rate * w.life * curveIntegral(NOVA_WAVE_SCROLL_T, NOVA_WAVE_SCROLL_V, k);
          w.u.uOpacity.value = curve1(NOVA_WAVE_ALPHA_T, NOVA_WAVE_ALPHA_V, k);
        }

        // flashBlend（0.15 s 瞬闪）
        const kf = e / 0.15;
        novaFlash.visible = kf < 1;
        if (novaFlash.visible) {
          novaFlash.scale.setScalar(12.0 * curve1([0, 0.25, 1.0], [0.4, 1.15, 0.1], kf));
          novaFlashMat.opacity = 0.72 * curve1([0, 0.2, 1.0], [0.3, 1.0, 0], kf);
        }

        // Beamdown / Beamdown1（0.22 s 下射光柱）
        const kbd = e / 0.22;
        for (let i = 0; i < novaBeamdowns.length; i++) {
          const bd = novaBeamdowns[i];
          bd.mesh.visible = kbd < 1;
          if (bd.mesh.visible) {
            const sy = curve1([0, 0.3, 1.0], [1.35, 1.0, 0.25], kbd);
            bd.mesh.scale.set(curve1([0, 0.35, 1.0], [1.15, 0.85, 0.2], kbd), sy, 1);
            bd.mat.opacity = (i === 0 ? 0.55 : 0.42) * curve1([0, 0.18, 1.0], [0.2, 1.0, 0], kbd);
          }
        }

        // Ground_Light_mesh1（0.55 s 扫描线光柱）
        const kbs = e / 0.55;
        beamScanMesh.visible = kbs < 1;
        if (beamScanMesh.visible) {
          const ys = curve1([0.02, 0.55], [0, 1], kbs);
          beamScanMesh.scale.set(0.012, 0.015 * Math.max(0.001, ys), 0.012);
          beamScanUniforms.uTime.value = e;
          beamScanUniforms.uOpacity.value = 0.36 * curve1([0, 0.1, 0.6, 1.0], [0, 1.0, 0.48, 0], kbs);
        }

        // InhaleFire（FlameMesh，3.8 s 贴地火焰慢收尾）
        const kif1 = e / 3.8;
        inhaleFire1Mesh.visible = kif1 < 1;
        if (inhaleFire1Mesh.visible) {
          const sc = 0.48 * curve1([0, 0.15, 0.75, 1.0], [0.55, 1.0, 0.92, 0.75], kif1);
          inhaleFire1Mesh.scale.set(sc, 0.75 * curve1([0, 0.2, 1.0], [0.4, 1.0, 0.3], kif1), sc);
          inhaleFire1Mesh.rotation.y = e * 0.42;
          inhaleFire1.u.uTime.value = e;
          inhaleFire1.u.uOpacity.value = 0.44 * curve1([0, 0.08, 0.55, 1.0], [0, 1.0, 0.55, 0], kif1);
        }

        // InhaleFire2 & InhaleFire3（Brand_Base_Ring，2.0 s 双层旋转丝带）
        const kif2 = e / 2.0;
        inhaleFire2Mesh.visible = kif2 < 1;
        inhaleFire3Mesh.visible = kif2 < 1;
        if (kif2 < 1) {
          const sc2 = 0.52 * curve1([0, 0.25, 1.0], [0.7, 1.02, 0.82], kif2);
          inhaleFire2Mesh.scale.set(sc2, 1, sc2);
          inhaleFire2Mesh.rotation.y = -e * 0.85;
          inhaleFire2.u.uTime.value = e;
          inhaleFire2.u.uOpacity.value = 0.48 * curve1([0, 0.12, 0.6, 1.0], [0, 1.0, 0.5, 0], kif2);

          const sc3 = 0.44 * curve1([0, 0.25, 1.0], [0.6, 1.0, 0.76], kif2);
          inhaleFire3Mesh.scale.set(sc3, 1, sc3);
          inhaleFire3Mesh.rotation.y = e * 1.05;
          inhaleFire3.u.uTime.value = e;
          inhaleFire3.u.uOpacity.value = 0.42 * curve1([0, 0.12, 0.6, 1.0], [0, 1.0, 0.45, 0], kif2);
        }

        // Ring（HealingStation_Swirl，2.2 s 双层交错旋涡）
        const kr = e / 2.2;
        for (let i = 0; i < novaRings.length; i++) {
          const nr = novaRings[i];
          nr.mesh.visible = kr < 1;
          if (!nr.mesh.visible) continue;
          const sc = 0.055 * curve1([0, 0.25, 1.0], [0.45, 1.0, 0.85], kr);
          nr.mesh.scale.setScalar(sc);
          nr.mesh.rotation.y = nr.rot0 + (i === 0 ? 1 : -1) * e * 1.45;
          nr.u.uTime.value = e;
          nr.u.uOpacity.value = 0.46 * curve1([0, 0.12, 0.6, 1.0], [0, 1.0, 0.45, 0], kr);
        }

        // ShapeAround（HealingStation_Shape_Music，1.6 s 上升光环）
        const ksh = e / 1.6;
        novaShapeMesh.visible = ksh < 1;
        if (novaShapeMesh.visible) {
          const sc = 0.14 * curve1([0, 0.2, 1.0], [0.55, 1.0, 1.08], ksh);
          novaShapeMesh.scale.set(sc, sc * 0.9, sc);
          novaShapeMesh.rotation.y = e * 0.9;
          novaShape.u.uTime.value = e;
          novaShape.u.uOpacity.value = 0.40 * curve1([0, 0.15, 0.65, 1.0], [0, 1.0, 0.45, 0], ksh);
        }

        // teamring_circle1（HealingStation_Indicator，4.2 s 站圈余韵）
        const ktr = e / 4.2;
        novaTeamRingMesh.visible = ktr < 1;
        if (novaTeamRingMesh.visible) {
          const sc = 0.21 * curve1([0, 0.12, 1.0], [0.88, 1.0, 1.0], ktr);
          novaTeamRingMesh.scale.set(sc, 1, sc);
          novaTeamRingMesh.rotation.y = e * 0.25;
          novaTeamRing.u.uTime.value = e;
          novaTeamRing.u.uOpacity.value = 0.42 * curve1([0, 0.08, 0.65, 1.0], [0, 1.0, 0.55, 0], ktr);
        }

        if (e > 4.2) novaElapsed = -1;
      }
      if (novaElapsed < 0) {
        beamMesh.visible = false;
        novaGlow.visible = false;
        novaStar.visible = false;
        novaFlash.visible = false;
        for (const bd of novaBeamdowns) bd.mesh.visible = false;
        beamScanMesh.visible = false;
        inhaleFire1Mesh.visible = false;
        inhaleFire2Mesh.visible = false;
        inhaleFire3Mesh.visible = false;
        for (const nr of novaRings) nr.mesh.visible = false;
        novaShapeMesh.visible = false;
        novaTeamRingMesh.visible = false;
        for (const w of novaWaves) w.mesh.visible = false;
      }

      healPool.update(dt);
      sparklePool.update(dt);
      goldPool.update(dt);
      gold1Pool.update(dt);

      if (bossRing) {
        const mat = bossRing.material as THREE.MeshBasicMaterial;
        mat.opacity = alarm > 0.01 ? 0.45 + Math.sin(t * 10) * 0.25 : 0.28;
      }
    },
  };
}
