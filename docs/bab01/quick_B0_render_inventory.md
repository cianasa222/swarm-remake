# BAB-01 · B0 渲染模块清单与 Babylon.js 对应（Quick AI BAB-Q01）

> Quick AI（AWS Quick）2026-11-23。**只做了 B0 的「模块清单 / 接口梳理」部分**，其余 B0 项（`npm ci`、`build`、`playtest`、截图、性能基准）Quick AI 的环境做不了，标 `NOT RUN`，交给能编译和能开浏览器的 AI。
> ⚠️ Quick AI 的 GitHub 连接器仍授权失效，**读的是 Cloudflare KV 镜像**，不是 GitHub 最新 main。镜像对应关系见第 1 节；接手的 AI 必须在最新 main 上重新核对，有差异以 main 为准。

## 1. 基线（读到的是什么版本）

- KV `SYNC_STATE.json`：全局 `commit` 仍是 `bd8a87b`（各 AI 约定等 Quick pending 核对后再改）；`gpt08_release.git_main` = **`6962303`**（PR #8 合并后），线上 `5955ad9a`（deployment `f94499ee`）。GPT-09 手册写的最新 main 是 `62b8591` / 文档提交 `7c45016`。
- 下表「哈希核对」= 本次从 KV 读到的文件 SHA-256 与 `SYNC_STATE.sha256/files` 里登记的值是否一致。`match` 表示该文件就是登记时的版本（`gpt08_release.mirrored_text_paths` 里的文件 = main `6962303`）；`no-record` 表示同步记录里没有这个文件的哈希，版本无法证明（推断与 `bd8a87b` 相同，未验证）。

| 文件 | 行数 | KV SHA-256（前 12 位） | 哈希核对 |
| :--- | ---: | :--- | :--- |
| `src/render/assets.ts` | 594 | `6816b331183e` | match |
| `src/render/boss_reksai.ts` | 234 | `58cb103b1f05` | match |
| `src/render/enemy_models.ts` | 750 | `d78dfe9e6a72` | match |
| `src/render/entities.ts` | 530 | `ed038d58f711` | match |
| `src/render/env.ts` | 69 | `4d619abb83a7` | no-record |
| `src/render/hero_jinx.ts` | 262 | `d87c035b2947` | match |
| `src/render/jinx_vfx.ts` | 922 | `bef506528645` | match |
| `src/render/lan.ts` | 1023 | `dbb00d8bfc22` | no-record |
| `src/render/map_warehouse.ts` | 1803 | `0bc5c25e45cd` | match |
| `src/render/quality.ts` | 251 | `6d8d81ac3a73` | match |
| `src/render/renderer.ts` | 163 | `2932bc1f9aab` | match |
| `src/render/style.ts` | 129 | `84a041dda49e` | no-record |
| `src/render/vfx.ts` | 342 | `b417d8300cf2` | match |
| `src/render/weapon_vfx.ts` | 524 | `9e118845daf0` | match |
| `src/render/world.ts` | 758 | `1874611a995a` | no-record |
| `src/main.ts` | 792 | `48ddf773422b` | match |
| `src/entry.ts` | 76 | `d2719f9b3c54` | match |
| `src/types/three-libs.d.ts` | 7 | `7d3bab92f5b8` | no-record |
| `src/sim/game.ts` | 2090 | `7b38ed98b30d` | match |
| `package.json` | 34 | `009a35da1e6a` | no-record |
| `tsconfig.json` | 17 | `5786fa3c6c48` | no-record |
| `vite.config.ts` | 13 | `8453acf62475` | no-record |
| `wrangler.jsonc` | 21 | `ab24f228b629` | match |

## 2. B0 回归与基准（全部 NOT RUN）

| 项 | 状态 | 原因 / 交给谁 |
| :--- | :--- | :--- |
| `npm ci` / `npm run build` | NOT RUN | 无 Node 构建环境。另：Muse MU-01 记录 `tsc` 在干净拉取下因 `tools/q28-regression.test.ts` 缺 Node 类型失败（`tsconfig.json` 的 `types` 需加 `"node"`），B0 执行者先确认这一点 |
| `npm run playtest -- 2 0.85` | NOT RUN | 同上 |
| `node tools/auth-gateway.test.mjs`、`npx tsx tools/q28-regression.test.ts`、`npx tsx tools/render-quality.test.ts` | NOT RUN | 同上 |
| 构建产物体积、首屏 / 开战加载、FPS / 帧时间 / 内存 / draw calls | NOT RUN | 需浏览器 + 真机；`?perf=1` 面板（Q-23，PR #8 已合入）可直接用来记录 |
| 地图 / 喷泉 / 金克丝 / 精英 / 首领 / 升级画面截图 | NOT RUN | 需浏览器；参考机位见 `tools/shots.ts` |

## 3. 渲染模块清单（`src/render/`）

| 文件 | 行数 | 被谁引用 | 主要导出 | 用到的 Three.js（前 8） | 自定义着色 | 现有职责 | Babylon.js 对应 / 迁移要点 |
| :--- | ---: | :--- | :--- | :--- | ---: | :--- | :--- |
| `assets.ts` | 594 | boss_reksai.ts, enemy_models.ts, entities.ts, hero_jinx.ts, jinx_vfx.ts, main.ts, map_warehouse.ts, renderer.ts, weapon_vfx.ts | ScbJson, TextureOpts, AssetStats, hasCustomAssetBase, assetUrl, setWarmupMs, getAssetStats, loadGLB… | Texture×6, BufferGeometry×4, CanvasTexture×3, Float32BufferAttribute×3, SRGBColorSpace×2, RepeatWrapping×2, ClampToEdgeWrapping×2, NoColorSpace×1 | 0 | 统一资源加载：GLTFLoader + Meshopt、纹理缓存、SCB JSON → BufferGeometry、两级预载 | `@babylonjs/loaders` glTF（`SceneLoader.LoadAssetContainerAsync`）+ `MeshoptCompression` 配置解码器 URL（同源）；`Texture` 缓存；SCB JSON → `VertexData`；`assetUrl` / `VITE_ASSET_BASE_URL` / UI 图标部分**原样复用** |
| `boss_reksai.ts` | 234 | entities.ts | RekSaiSubmeshInfo, RekSaiRig | Group×3, Mesh×3, AnimationMixer×2, MeshStandardMaterial×2, AnimationAction×1, PlaneGeometry×1, MeshBasicMaterial×1, DoubleSide×1 | 0 | 雷克塞 42 段动作、子网格 Wrap/Plane 隐藏 | 同上；子网格隐藏按 `reference/14.14/reksai_submeshes.json` 名称 + 顶点数双重校验 |
| `enemy_models.ts` | 750 | entities.ts | VatClipKey, InstancedEnemyModel, EliteBruiserPool | Mesh×8, BufferGeometry×7, Vector3×7, SkinnedMesh×6, Float32BufferAttribute×6, BufferAttribute×6, AnimationClip×6, InterleavedBufferAttribute×5 | 1 | 小怪单 DrawCall 合批（VAT 顶点动画 + 静止姿态回退）、精英骨骼动画池 | VAT：Babylon `BakedVertexAnimationManager` + `VertexAnimationBaker`（官方 baked texture animations）可替代自写着色器；精英：`AssetContainer.instantiateModelsToScene` 克隆骨骼 + `AnimationGroup` |
| `entities.ts` | 530 | renderer.ts | EntityRenderer | InstancedMesh×15, MeshBasicMaterial×11, BufferGeometry×5, Color×4, Group×4, BoxGeometry×4, DynamicDrawUsage×3, Matrix4×3 | 0 | 实体渲染总控：小怪合批、拾取物、敌弹、地雷、补给箱、访问卡（15 个 InstancedMesh） | `thinInstance`（`thinInstanceSetBuffer('matrix')` + 颜色 buffer）；描边层同样用 thin instance |
| `env.ts` | 69 | renderer.ts | buildSunnyEnv | Mesh×3, MeshBasicMaterial×2, Color×2, DoubleSide×2, WebGLRenderer×1, Texture×1, PMREMGenerator×1, Scene×1 | 3 | 程序化天空 IBL（PMREMGenerator） | `scene.environmentTexture` 用 `HDRCubeTexture`/`RawCubeTexture` 或程序化 `ReflectionProbe`；强度 0.40 照搬 |
| `hero_jinx.ts` | 262 | entities.ts | HeroRig, JinxRig | Mesh×6, Group×4, MeshBasicMaterial×4, MeshStandardMaterial×3, AnimationMixer×2, DoubleSide×2, AnimationAction×1, PlaneGeometry×1 | 0 | 金克丝骨骼动画（18 段）、挂点 | `AnimationGroup` 切换（`start/stop/weight` 混合）；挂点用 `TransformNode` 跟随骨骼 `getTransformNode()` |
| `jinx_vfx.ts` | 922 | entities.ts, vfx.ts | loadSpriteCell, JinxVfxSystem | Texture×32, Mesh×27, BufferGeometry×13, MeshBasicMaterial×12, PlaneGeometry×6, AdditiveBlending×5, SRGBColorSpace×5, Group×4 | 0 | 金克丝 Q/E/R/被动 28 套特效的手写还原（含 CanvasTexture 裁图 workaround） | 读 `jinx.json`；`loadSpriteCell` 的 Canvas 裁图 workaround 不翻译，改用 `ParticleSystem` 的 `spriteCellWidth/Height` 或 UV 偏移 |
| `lan.ts` | 1023 | （无） | LanRig | Mesh×80, Group×25, CylinderGeometry×16, MeshStandardMaterial×13, Vector3×12, CanvasTexture×10, MeshBasicMaterial×10, Vector2×6 | 1 | 旧版程序化角色（Lan） | **KV 镜像里没有任何文件 import 它**；按手册「逐项审查实际调用，不凭文件名判断可删」：在最新 main 跑 `rg -n "lan\.ts|LanRig"` 确认后再决定迁移或保留 |
| `map_warehouse.ts` | 1803 | renderer.ts | buildWarehouseWorld | DoubleSide×17, AdditiveBlending×17, Mesh×16, ShaderMaterial×13, Color×10, MeshBasicMaterial×8, PlaneGeometry×6, NormalBlending×6 | 40 | 仓库区地图（glb + 104 材质 + 22 张烘焙光照 uv1）、喷泉 43 层特效（13 个 ShaderMaterial / 40 处自定义着色） | 地图：`StandardMaterial`/`PBRMaterial` 关闭光照或 `lightmapTexture`（`useLightmapAsShadowmap=false`，`coordinatesIndex=1`）；喷泉：改为读 `vfx/data/14.14/fountain.json` 由通用运行器播放，13 个自定义着色器改写为 `ShaderMaterial`（GLSL + WGSL 各测一次）或 `NodeMaterial` |
| `quality.ts` | 251 | main.ts, map_warehouse.ts, renderer.ts | QualitySetting, QualityTier, DetailKey, DetailValue, FrameCap, FrameLimiter, QualitySpec, QUALITY_SPECS… |  | 0 | 画质档位、细节画质、帧率上限、动态分辨率（无引擎依赖） | **直接复用**；Babylon 侧把 `resScale` 映射到 `engine.setHardwareScalingLevel(1 / (dpr × resScale))` |
| `renderer.ts` | 163 | main.ts | Renderer | WebGLRenderer×2, PerspectiveCamera×2, Scene×1, Texture×1, SRGBColorSpace×1, NeutralToneMapping×1, PCFSoftShadowMap×1 | 0 | 渲染总控：WebGLRenderer、两台透视相机、色调映射 Neutral 1.08、PCFSoft 阴影、相机跟随 / 特写 / 震屏 | `Engine` / `WebGPUEngine`（异步 `initAsync`，失败回退 `Engine` WebGL2）+ `Scene` + `FreeCamera`/`TargetCamera`（FOV 40°，位置照搬）；`scene.imageProcessingConfiguration`（toneMapping 需对照 Neutral 曲线实测，Babylon 无同名 Neutral 时用 `TONEMAPPING_KHR_PBR_NEUTRAL`，版本需核实）；`ShadowGenerator`（PCF）；实现 `RenderPort` |
| `style.ts` | 129 | boss_reksai.ts, enemy_models.ts, entities.ts, hero_jinx.ts, lan.ts, vfx.ts, world.ts | toonGradient, toon, toonUnique, OUTLINE_MAT, addOutline, paint, place, merge… | BufferGeometry×6, CanvasTexture×6, MeshToonMaterial×5, Mesh×5, Vector3×4, DataTexture×3, NearestFilter×2, RGBAFormat×1 | 0 | 卡通渐变、描边材质、几何合并工具、圆形软影贴图 | 描边：`renderOutline` / 额外反面网格；`mergeGeometries` → `Mesh.MergeMeshes`；软影贴图 → `DynamicTexture` |
| `vfx.ts` | 342 | renderer.ts | VfxRenderer | Vector3×11, BufferGeometry×7, Mesh×5, MeshBasicMaterial×5, Line×3, Group×2, Points×2, RingGeometry×2 | 0 | 通用特效：事件 → 环 / 粒子 / 线 / 震屏；串起金克丝和武器特效 | 改为 **通用 VFX 运行器**：`EffectDef`（`src/render-babylon/vfx/effect_def.ts`）→ `ParticleSystem` / `GPUParticleSystem` / 网格池；事件映射表单独维护 |
| `weapon_vfx.ts` | 524 | entities.ts, vfx.ts | WeaponVfxRenderer | Mesh×21, BufferGeometry×12, InstancedMesh×10, Texture×9, Group×8, MeshBasicMaterial×7, Color×6, PlaneGeometry×5 | 0 | 9 把副武器特效手写还原（10 个 InstancedMesh、闪电光带池、激光柱池） | 读 `weapons.json`；弹道类 thin instance；闪电链用真实端点的动态 ribbon（`MeshBuilder.CreateRibbon` 可更新 / `GreasedLine`） |
| `world.ts` | 758 | map_warehouse.ts, renderer.ts | WorldView, buildWorld | Mesh×39, BoxGeometry×31, CylinderGeometry×15, Group×11, MeshBasicMaterial×11, BufferGeometry×7, InstancedMesh×5, TorusGeometry×4 | 3 | `WorldView` 接口 + 旧版程序化世界 `buildWorld` | `WorldView` 接口保留；`buildWorld`（程序化占位世界）按 KV 镜像只被 `map_warehouse.ts` / `renderer.ts` 引用，迁移前用 `rg buildWorld` 在最新 main 复核是否仍在用 |

额外依赖（`three/examples/jsm`）：
- `assets.ts`：`three/examples/jsm/libs/meshopt_decoder.module.js`、`three/examples/jsm/loaders/GLTFLoader.js`
- `enemy_models.ts`：`three/examples/jsm/utils/BufferGeometryUtils.js`、`three/examples/jsm/utils/SkeletonUtils.js`
- `lan.ts`：`three/examples/jsm/geometries/RoundedBoxGeometry.js`
- `style.ts`：`three/examples/jsm/utils/BufferGeometryUtils.js`

## 4. `main.ts` 对渲染器的全部调用 → `RenderPort`

| 现有调用 | 次数 | `RenderPort`（`src/render-babylon/render_port.ts`） |
| :--- | ---: | :--- |
| `renderer.applyQuality` | 3 | `applyQuality()` |
| `renderer.vfx.reduceFlash` | 3 | `vfxOptions.reduceFlash` |
| `renderer.vfx.noShake` | 3 | `vfxOptions.noShake` |
| `renderer.closeup` | 3 | `closeup / closeupAngle` |
| `renderer.warmup` | 1 | `warmup()` |
| `renderer.startStage2` | 1 | `startStage2()` |
| `renderer.resize` | 1 | `resize(w, h)` |
| `renderer.camTargetOverride` | 1 | `camTargetOverride` |
| `renderer.camDistScale` | 1 | `camDistScale` |
| `renderer.gl.info.render` | 1 | `stats().drawCalls / triangles` |
| `renderer.gl.getPixelRatio` | 1 | `stats().pixelRatio` |
| `renderer.vfx.consumeEvents` | 1 | `consumeEvents(game, fxScale, budget)` |
| `renderer.render` | 1 | `render(dt, game)` |
| `new Renderer(canvas, quality)` | 1 | `RenderPortFactory({ canvas, quality, backend })`（异步，含 WebGPU → WebGL2 回退） |
| （`renderer.ts` 内部）`vfx.jinxVfx.teammateVfxScale` | — | 实现内部从 `quality.details.teammates` 读取，不暴露给 main |

## 5. 结论与下一步（给 B1 执行者）

1. 先给旧 `Renderer` 包一层 `RenderPort`（零行为变化），`main.ts` 改为只认接口；再写 Babylon 实现。这样 B1 起每一步都能和旧版同机位对比。
2. 可直接复用、不需要改的：`quality.ts`（含 `FrameLimiter`）、`assets.ts` 里的 URL / 预载统计 / UI 图标部分、`world.ts` 的 `WorldView` 接口形状。
3. 工作量最大的三块：`map_warehouse.ts`（1803 行，40 处自定义着色，喷泉全部手写）、`jinx_vfx.ts`（922 行）、`weapon_vfx.ts`。B4 已把这三块对应的原版参数全部转成 `EffectDef` 数据（见 `quick_B4_vfx_14.14.md`），新运行器读数据即可，不要逐行翻译旧代码。
4. `lan.ts`、`world.ts` 的 `buildWorld` 在 KV 镜像里看起来没有运行时调用，**删除前必须在最新 main 用 `rg` 复核**（手册 B2 要求）。
5. `enemy_models.ts` 的自写 VAT 着色器：Babylon 有官方 `BakedVertexAnimationManager`，建议直接用官方实现（仍需先补导出带动作的 4 个小怪模型，见看板 PERF-1 T2b / GPT `ASSET_LIBRARY_14.14.md`）。
