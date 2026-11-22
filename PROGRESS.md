# 项目进度与跨会话交接清单（PROGRESS）

> 最后更新：2026-11-22  
> 仓库定位：仅托管源码、配置与文档；大体积解包资产与运行时资源留在本机磁盘（见第 4 节）。

---

## 1. 已完成里程碑

- **M0-A · 第一关仓库区原版 3D 场景（PASS）**
  - 解包 Patch 14.14 `Map33.wad.client`，转换 `warehouse_map1.glb`（`50.42 MB`），在 `src/sim/map1_materials.json` 完成 `104/106` 材质映射。
  - 与 `src/sim/map1_data.json` 中 `180m × 180m` `walkableB64` 碰撞网格 1:1 对齐，已通过 4 地标实机截图与独立分身复核。
- **M0-B · 幻灵战队金克丝（`Strawberry_Jinx`，PASS）**
  - 导出 `strawberry_jinx.glb`（`7.78 MB`，`133` 骨骼、`18` 套 4 向跑打/火箭/大招/死亡动画），接入 `src/render/hero_jinx.ts` 与 `src/render/entities.ts`。
  - 对齐原版 Swarm 俯视角相机 `(22.5, 17.8)` 与枪口挂点偏移，实机截图与独立分身复核通过。
- **M1 · 补给箱与中央治愈喷泉机制 + 初版原版 VFX**
  - `src/sim/game.ts` / `src/config.ts` / `src/main.ts` 已接入 `updateFountain`、`updateBoxes`、`damageBox`、`findAimTarget`、小地图与 `?spot=box` 传送点。
  - 导出 `metalbox.glb` + 贴图及 `box_glow.png`、`box_crystal.png`，实现 66 个补给箱 `InstancedMesh`、地面光晕、`Temp_GroundGlow15` 蓝色通天信标与破碎粒子。
  - 转换 5 套原版 `.scb` v3.2 网格至 `public/assets/map1/vfx/`（`fountain_sphere.json`、`fountain_baseedge.json`、`fountain_wave.json`、`fountain_timer.json`、`fountain_beam.json`）与 15 张 VFX 贴图。
  - 第二轮 & 第三轮精修（CLEAN PASS）：
    - **官方坐标与喷泉特效 1:1 对齐**：对照拳头 `{6825a2fd} Fountain MapLocator` 修正 `FOUNTAIN` 圆心为官方真实坐标 `(-0.45, -2.40)`（消除此前含偏心高塔包围盒导致的 `1.63m` 偏移），并按 `map33.bin.json` 官方参数恢复尺寸（`Basic5=8.6m/y=0.72`、`CenterSphere=0.01/y=3.5`、`Timer=0.92`、`BaseEdge=0.032`、`Wave=[0.25,0.08,0.25]`）；修复 `.scb` v3.2 转换脚本 `hasVertColors` 字节序、补齐 6 张官方贴图、消除球核北极捏合与冷却灰球，全部圆环与球核绝对居中贴合水池与走道。
    - **官方晴日光照与 22 张烘焙贴图还原**：从 `strawberry_animasquad_map1.mapgeo` 提取 `1751/1805` 个模型的 `uv1` 缩放偏移表 `src/sim/map1_lightmaps.json`，下载 22 张官方烘焙光照贴图至 `public/assets/map1/lightmaps/0..21.png`；严格对齐官方 `MapSunProperties`（`sunColor`/`sunDirection`/`skyLightColor`）、跳过空图块 `0.png`、校准 `lightMapIntensity = 1.85` 与冷蓝阴影底色（画面均亮度 `148.9`）及 `THREE.NeutralToneMapping`，恢复晴朗明亮的暖阳光与冷靛蓝投影对比。
    - 已通过 `build`、`playtest`、6 张 `1280x800` 全景/特写/充能/Nova/冷却/常规视角实机截图（0 报错、0 失败请求）及独立艺术总监分身 **CLEAN PASS**。
- **M2 · 第一关原版小怪 / 精英怪 / 雷克塞 Boss 3D 模型与动画（PASS）**
  - 从 Patch 14.14 导出 6 套官方 3D 模型与贴图至 `public/assets/enemies/`：`enemy_pix`、`enemy_ghoul`、`enemy_hunter`、`enemy_dasher`、`miniboss_bruiser`（4 段骨骼动画）与 `reksai`（8 段骨骼动画）。
  - 在 `src/config.ts` 与 `src/sim/game.ts` 对齐官方参数：`ENEMY_SCALES`（`pix: 0.0165`、`ghoul: 0.009`、`hunter: 0.009`、`dasher: 0.0082`、`bruiser: 0.0068`、`reksai: 0.0275`）、波次小怪变体 `pix`/`ghoul`、`BOSS` 名称/基础移速 `1.05`/碰撞半径 `2.5` 与二阶段加速倍率 `1.28`。
  - 新增 `src/render/boss_reksai.ts`（`RekSaiRig`，隐藏 `Wrap`/`Plane` 辅助面并以 `AnimationMixer` 驱动潜行/破土/攻击/击飞/大招/死亡状态机）与 `src/render/enemy_models.ts`（4 种小怪 `InstancedEnemyModel` 1-DrawCall 合批渲染 + 6 槽位 `EliteBruiserPool` `SkeletonUtils.clone` 骨骼实例池），并在 `src/render/entities.ts` 替换全部程序化占位几何体。
  - `npm.cmd run build`、`npm.cmd run playtest -- 2 0.85`、`1280x800` 浏览器全流程（0 `pageerror`、0 `console.error`、0 失败请求）及独立视觉审计 5 张实机截图全部 **PASS**。
- **M3 · 金克丝官方武器/技能特效 + 5 武器 / 6 被动进化系统（CLEAN PASS）**
  - 导出 Patch 14.14 官方 17 个 `.scb` v3.2 3D 特效网格与 41 张官方 VFX 贴图 + 4 张 HUD 技能图标至 `public/assets/heroes/jinx/{vfx,icons}/` 与 `public/assets/weapons/vfx/`。
  - 新建 `src/sim/weapons.ts`，完整实现 5 武器槽 + 6 被动槽 + 10 把官方武器 + 12 种官方 Stat 被动 + 武器进化与精英掉落「访问卡（Access Card）」抽卡体系，严格对齐 Patch 14.14 `strawberry_jinx.bin.json` 与 `map33.bin.json` 数值及经验曲线。
  - 更新 `src/config.ts`、`src/sim/game.ts`、`src/sim/upgrades.ts`，接入金克丝喵喵枪连发、E 鱼骨头 9 连火箭、R 超究极死神飞弹、被动「罪恶快感（70 击杀 / 精英触发 8s +100% 移速 & +150 技能急速）」、护甲/护盾减伤与 10 把武器独立自动冷却驱动。
  - 新增 `src/render/jinx_vfx.ts`、`src/render/weapon_vfx.ts` 与 24 张官方 UI 图标（`public/assets/ui/`），1:1 还原 R 飞弹细长马赫锥/地面投影/双色尾环与 8 层核爆（`r_dome` / `r_swirl` / `r_animeburst` / `r_praxis` / 巨型猫脸 / 黑曜石弹坑）、E 鱼骨头 3×3 扇形 3D 猫猫火箭齐射与 5 层爆炸、收紧至 `1.45m` 的罪恶快感 5 层猫脸光环、以及战兔巨爆 13m 激光柱、斯塔缇克宽幅闪电带、耀光力场 3D 火焰、不息气旋双刃、深度冻结冰裂与冰盾。
  - 重构 `index.html`、`src/style.css`、`src/main.ts`、`src/input/input.ts`、`tools/playtest.ts`，接入 PC 底部居中原版《无尽狂潮》人物头像 HUD（金克丝圆形头像 + 2×4 实时属性 + 5 官方技能冷却格 + 宽幅 HP/护盾/EXP 条 + 5+6 官方图标槽与星级圆点 + 悬停官方提示浮窗 + `C/Q/E/R/空格/1-3` 快捷键）、暗黑霓虹官方图标进化卡牌弹窗，以及移动端响应式布局。
  - `npm.cmd run build`（1.42s）、`npm.cmd run playtest -- 2 0.85`（4/4 全胜，Lv.41-44，进化 4-5 把武器）、PC `1280×800` + 移动端 `844×390` 浏览器全流程（0 报错、0 失败请求）及独立视觉审计 7 张实机截图全部 **CLEAN PASS**。
- **M4 · 统一预载缓存体系 + 资产压缩优化（CLEAN PASS）**
  - 新建 `src/render/assets.ts` 与 `src/types/three-libs.d.ts`，收拢全工程 `GLTFLoader`（内置 `MeshoptDecoder`）、`Image`/`THREE.Texture`、`CanvasTexture` 精灵切格、`ScbJson` 3D 特效网格与 UI 图标 `blob:` 缓存池，消除 `src/render/` 下全部散落的裸加载器与重复网络请求（实测 `247` 次唯一网络请求、`704` 次缓存命中、`0` 重复请求）。
  - 实现开局两级预载与进度条 UI（`index.html` `#preload-box` + `src/main.ts` + `src/render/renderer.ts`）：Stage 1 预载仓库区地图、金克丝、补给箱、首波小怪、22 张烘焙光照贴图与核心特效，完成后执行 `gl.compile(scene, cam)` 着色器预热（`~34ms`）再解锁「开始任务」；Stage 2 在后台以并发 4 静默预热精英怪、雷克塞首领、剩余武器特效与全部升级卡牌 UI 图标。
  - 支持 `import.meta.env.VITE_ASSET_BASE_URL` 外部 CDN/Cloudflare R2 前缀一键切换。
  - 新建 `tools/compress_assets.mjs` 幂等资产压缩管线（原始未压缩备份位于 `c:/七星/游戏/tideline/_assets_raw_backup`）：
    - **9 个 `.glb` 模型**（`dedup + quantize [排除 TEXCOORD_1 保护烘焙光照 UV1] + meshopt`）：`63.62 MB` → **`16.39 MB`**（`-74.2%`），其中最大的 `map1/warehouse_map1.glb` 从 `50.42 MB` 降至 **`13.24 MB`**（`-73.7%`，低于 Cloudflare Pages 单文件 `25 MiB` 限制），骨骼动画数量 100% 完整保留（金克丝 18 段、雷克塞 8 段、精英怪 4 段）。
    - **238 张 `.png` 贴图 → `.webp`**（光照图 `Q92`、VFX/UI 图标 `Q90/Alpha95`、场景与角色贴图 `Q84/Alpha92`）：`108.06 MB` → **`19.48 MB`**（`-82.0%`）。
    - **25 个 `.json` 特效网格与清单**：`0.89 MB` → **`0.88 MB`**。
    - **`public/assets/` 总体积**：从 `172.56 MB` 降至 **`36.75 MB`**（整体缩减 **`-78.7%`**，单文件最大 `13.24 MB`）。
  - `npm.cmd run build`、`npm.cmd run playtest -- 2 0.85`、`verify_m4.mjs`（5 张桌面/移动端实机截图，`0` 报错、`0` 失败请求、`0` 重复请求、`0` 残留 `.png` 请求）及独立视觉审计子代理全部 **CLEAN PASS**。

---

## 2. 当前状态：M0–M4 已全部完成，可直接部署 Cloudflare Pages 或交接在线 AI 继续 M5

完整的跨 AI 在线交接文档（含开发方案、架构契约、M0–M4 进度、Patch 14.14 全部资产来源直链与解包/压缩命令、Cloudflare 部署指南）已整理至同目录下的 [`AI_HANDOVER.md`](./AI_HANDOVER.md)。

---

## 3. 下一阶段计划（M5 与多英雄扩展）

1. **M5：低 / 中 / 高三档画质验收与联机边界验证**（验证不同画质档位下帧率自适应降级、阴影/DPR/粒子缩放且绝不削减逻辑层怪物数量，以及 `teammateVfxScale` 队友特效衰减接口）。
2. **新英雄扩展**：按 `AI_HANDOVER.md` 的角色提取管线依次导入幻灵战队锐雯、亚索、蕾欧娜、萨勒芬妮、俄洛伊、贝蕾亚、阿萝拉、霞。

---

## 4. Patch 14.14 原版文件来源与本机工具链（跨会话直接复用）

### 方式 A：本机已就绪的 Patch 14.14 官方 Manifest + WAD 解包/转换工具链
工具根目录：`C:\Users\yuyl\.gemini\antigravity\brain\022a7d42-84dd-4039-a9bd-5be738fc3b71\scratch\map33_tools\`
- **`14_14.manifest`**（`23.5 MB`）：拳头官方 Patch 14.14 游戏清单，可直接拉取任意 `Map33` / `Strawberry_*` 小怪、精英怪、雷克塞 Boss 与英雄 `.wad.client`。
- **`ManifestDownloader.exe`**：按过滤条件从拳头官方 CDN 下载 Patch 14.14 对应的 `.wad.client`。
- **`hashes.game.txt`**（`233.9 MB`）：CommunityDragon 路径哈希映射表，配合 WAD 解包还原真实路径。
- **`unpack_wad_generic.mjs`**：通用 `.wad.client` 解包脚本，用法：`node unpack_wad_generic.mjs <wadPath> <hashPath> <outDir>`。
- **`lol2gltf.exe`**：将 `.skn`/`.skl`/`.anm` 或 `.mapgeo` 转为 `.glb`（运行前须将 `C:\Program Files\dotnet` 加入 `$env:Path`）。
- **`convert_scb_to_json.mjs`**：将 `.scb` v3.2 特效网格转为 `pos`/`uv` JSON。
- **已解包目录**：`gamedata/`（`Map33.wad.client` 解包产物，含 `.scb` 与地图文件）、`jinx_gamedata/`（`Strawberry_Jinx.wad.client`）。

### 方式 B：CommunityDragon Patch 14.14 公开直链（免解包拉取 `.png` / `.bin.json`）
- **根地址**：`https://raw.communitydragon.org/14.14/game/`
- **特效贴图目录**：`https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/`
- **第一关地图配置**：`https://raw.communitydragon.org/14.14/game/data/maps/shipping/map33/map33.bin.json`

### 本机资产目录说明
- **压缩后运行时资产目录**：`C:\七星\游戏\tideline\tideline\public\assets\`（共 **`36.75 MB`**，最大单文件 `warehouse_map1.glb` **`13.24 MB`**，9 个 Meshopt `.glb` + 238 张 `.webp` + 25 个 `.json`，已满足 Cloudflare Pages 单文件 `< 25 MiB` 直接部署要求）。
- **原始未压缩资产备份目录（仅本机保留）**：`C:\七星\游戏\tideline\_assets_raw_backup\`（`172.56 MB`，供 `node tools/compress_assets.mjs` 随时重新生成压缩产物）。
- **原始解包参考目录（未上传 GitHub）**：`C:\七星\游戏\tideline\tideline\资产包\第一关仓库区地图材质贴图\`（`68.89 MB`）。
