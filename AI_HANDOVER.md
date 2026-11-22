# 《无尽狂潮（Swarm）》Map33 仓库区 1:1 复刻 — 完整开发方案、进度与资产来源交接书（AI_HANDOVER）

> 本文档面向**其他 AI 编程代理（Claude Code / Cursor / Codex / Gemini / Windsurf 等）及开发者**，提供从零理解架构、在线还原全部拳头 Patch 14.14 官方资产、接力后续里程碑（M5 及多英雄扩展）并一键部署 Cloudflare Pages / R2 的完整蓝图。
>
> **GitHub 仓库**：`https://github.com/cianasa222/swarm-remake.git`  
> **Cloudflare 线上实机部署地址（含跨域 CDN 资产与在线交接文档）**：
> - **线上实机游戏**：`https://tideline-swarm.cianasa888-gbd.workers.dev/`
> - **在线开发交接书**：`https://tideline-swarm.cianasa888-gbd.workers.dev/AI_HANDOVER.md`
> - **在线进度清单**：`https://tideline-swarm.cianasa888-gbd.workers.dev/PROGRESS.md`
> - **在线开发总纲**：`https://tideline-swarm.cianasa888-gbd.workers.dev/AGENTS.md`
> - **线上已转换压缩资产 CDN 根地址（已开启 `Access-Control-Allow-Origin: *`）**：`https://tideline-swarm.cianasa888-gbd.workers.dev/assets/`（任何在线 AI 只需设置环境变量 `VITE_ASSET_BASE_URL=https://tideline-swarm.cianasa888-gbd.workers.dev` 即可免解包直接远程加载全部 9 个 Meshopt `.glb`、238 张 `.webp` 与 25 个 `.json` 特效网格！）
>
> **技术栈**：`Vite 5` + `TypeScript` + `Three.js r170`（零外部重型游戏引擎依赖，纯 WebGL2 高性能合批渲染）

---

## 一、 完整开发方案与工程架构（Development Plan & Architecture）

### 1.1 总体开发路线与里程碑状态

总体路线：**`导入现成官方资产 → 对齐高档实机画面 → 跑通首波到 Boss → 建立两级预载与缓存压缩 → 验收画质档与扩展新英雄`**

| 里程碑 | 核心目标 | 当前状态 | 关键指标 / 产出 |
| :--- | :--- | :---: | :--- |
| **M0-A** | 第一关「仓库区（Map33）」3D 场景与碰撞 | **已完成 (PASS)** | `warehouse_map1.glb`（1805 网格、104 套贴图）+ `180m×180m` `walkableB64` 碰撞网格 1:1 对齐 |
| **M0-B** | 幻灵战队金克丝（`Strawberry_Jinx`）3D 角色与动作 | **已完成 (PASS)** | `strawberry_jinx.glb`（133 骨骼、18 段四向走 A/火箭/大招/死亡动画）、俯视相机 `(22.5, 17.8)` |
| **M1** | 中央治愈喷泉 + 66 个补给箱 + 22 张官方烘焙光照图 | **已完成 (CLEAN PASS)** | 喷泉坐标 `(-0.45, -2.40)` + 5 套 `.scb` 3D 特效网格；66 个 `metalbox.glb`；1751 个模型 `uv1` 烘焙光照映射 + `MapSunProperties` |
| **M2** | 原版小怪 / 精英怪 / 雷克塞首领 3D 模型与首波到 Boss | **已完成 (PASS)** | `enemy_pix`、`enemy_ghoul`、`enemy_hunter`、`enemy_dasher` 单 DrawCall `InstancedMesh` 合批；`miniboss_bruiser`（4 动画）6 槽骨骼池；`reksai`（8 动画）首领状态机 |
| **M3** | 金克丝官方技能特效 + 5 武器/6 被动进化 + 原版底部 HUD | **已完成 (CLEAN PASS)** | 17 个武器/技能 `.scb` 3D 特效网格 + 41 张官方 VFX 贴图 + 28 张官方 UI/技能图标；10 武器 + 12 被动 + 访问卡进化；PC 原版底部居中头像技能台 + 移动端触控布局 |
| **M4** | 统一两级预载与去重缓存体系 + Meshopt/WebP 资产压缩 | **已完成 (CLEAN PASS)** | `src/render/assets.ts`（`247` 请求 / `704` 缓存命中 / `0` 重复）；总资产 **`172.56 MB` → `36.75 MB`（`-78.7%`）**；`warehouse_map1.glb` **`50.42 MB` → `13.24 MB`**（`< 25 MiB`，可直接发 Cloudflare Pages） |
| **M5** | 低/中/高三档画质自适应验收 + 联机边界 + 新英雄扩展 | **待开启 (NEXT)** | 验证画质降级不减怪、`teammateVfxScale` 队友特效衰减、扩展锐雯/亚索/蕾欧娜/萨勒芬妮/阿萝拉/霞等英雄 |

---

### 1.2 目录结构与核心模块地图

```text
tideline/
├── index.html                    # 主页面：PC 底部居中《无尽狂潮》战斗中控台、移动端触控 HUD、开局预载进度条、暗黑霓虹进化选卡弹窗
├── vite.config.ts                # Vite 构建配置（base: './'，支持任意静态托管与子路径部署）
├── package.json                  # 脚本：dev / build (tsc --noEmit && vite build) / preview / playtest
├── AGENTS.md                     # 开发总纲与硬性验收规范
├── PROGRESS.md                   # 里程碑进度交接记录
├── AI_HANDOVER.md                # 本文档：完整开发方案、进度、资产来源直链与部署指南
├── tools/
│   ├── playtest.ts               # 无头数值回归测试（模拟不同走位/技能水平下 0:00 -> 14:57 雷克塞首领战通关率与等级曲线）
│   └── compress_assets.mjs       # M4 幂等资产压缩管线（GLB Meshopt + PNG->WebP + map1_materials.json 路径重写）
└── src/
    ├── main.ts                   # 入口：两级资源预载驱动、WebGL 着色器预热、主循环固定步长累加器、HUD 实时绑定与悬浮提示窗
    ├── config.ts                 # Patch 14.14 官方核心数值基线（PLAYER / FOUNTAIN / SUPPLY_BOX / JINX_E / JINX_R / ENEMY_SCALES / BOSS）
    ├── style.css                 # PC 底部居中 Swarm HUD 样式、暗黑霓虹卡牌弹窗、开局预载条、移动端响应式适配
    ├── types/
    │   └── three-libs.d.ts       # Three.js 内置 MeshoptDecoder 类型声明
    ├── sim/                      # 【纯逻辑模拟层】零 Three.js / 零 DOM 依赖，确定性可复现，预留联机与微信小游戏移植
    │   ├── game.ts               # 战斗主循环（移动/碰撞、10 武器发射、E 9连火箭、R 死神飞弹、罪恶快感被动、喷泉、66 补给箱、波次与雷克塞 AI）
    │   ├── weapons.ts            # 官方 10 把武器 + 12 种被动属性 + 5 武器/6 被动槽位限制 + 满级配对访问卡进化池
    │   ├── upgrades.ts           # 升级与访问卡词条桥接
    │   ├── waves.ts              # 官方 20 波 SubPhases 时间线（0s -> 897s 首领登场，[20m, 23m] 环状可行走区刷怪）
    │   ├── map_grid.ts           # 180m × 180m (320×320) walkableB64 碰撞掩码解码与扫掠圆碰撞
    │   ├── grid.ts               # 均匀空间网格加速结构（O(1) 邻域索敌与弹道碰撞）
    │   ├── math.ts               # 向量、角度差、确定性伪随机数发生器（makeRng）
    │   ├── map1_data.json        # Map33 180m×180m 可行走网格、66 个补给箱官方坐标、出生点与喷泉参数
    │   ├── map1_materials.json   # Map33 104 套官方材质名 -> .webp 贴图路径与 cutout/blend 透明通道配置
    │   └── map1_lightmaps.json   # Map33 1751 个 MapGeo_Instance 烘焙光照图索引与 UV1 scale/bias 映射表
    ├── render/                   # 【纯渲染表现层】只读消费 Game 状态与 events[]
    │   ├── assets.ts             # 【M4 核心】统一资源管理器：VITE_ASSET_BASE_URL、Meshopt GLB 缓存、图片/纹理/切格/SCB 几何体缓存、Stage1/Stage2 分级预载
    │   ├── renderer.ts           # WebGLRenderer 总控：40° 窄 FOV 斜俯视相机 (22.5, 17.8)、跟随玩家 0.5m 步长对齐阴影、gl.compile 着色器预热
    │   ├── map_warehouse.ts      # 仓库区 3D 场景组装、104 套材质 + 22 张烘焙光照贴图自定义 Shader 注入、中央喷泉 5 层 .scb + 15 贴图全息特效
    │   ├── hero_jinx.ts          # 幻灵战队金克丝骨骼动画状态机（18 段动作：机枪四向走A、火箭筒、大招、死亡、脚底瞄准环）
    │   ├── boss_reksai.ts        # 最终首领雷克塞骨骼动画状态机（潜行破土登场、扫尾、击飞重踏、弹幕咆哮、转阶段、死亡）
    │   ├── enemy_models.ts       # 4 种常规小怪单 DrawCall InstancedEnemyModel + 精英怪 EliteBruiserPool（6 槽 SkeletonUtils.clone 骨骼池）
    │   ├── entities.ts           # 实体总渲染器：英雄、小怪、精英、首领、66 补给箱 + Temp_GroundGlow15 蓝光信标、经验晶片、精英访问卡光柱
    │   ├── jinx_vfx.ts           # 金克丝专属官方多通道特效：R 飞弹细长马赫锥 + 8 层核爆、E 鱼骨头 5 层爆炸、1.45m 罪恶快感 5 层猫脸脚底光环、枪口猫爪闪光
    │   ├── weapon_vfx.ts         # 10 把武器官方特效：喵喵枪双交叉光弹、E 3D 猫猫火箭池、耀光力场 3D 火焰、电刀宽幅闪电带、战兔巨爆 13m 激光柱、冰爆裂纹与冰盾
    │   ├── vfx.ts                # 战斗事件消费器、飘字伤害、预警圈与震屏衰减
    │   ├── quality.ts            # 低 / 中 / 高 / 自动四档画质状态机（仅调节阴影、DPR、粒子预算，绝不干预逻辑层刷怪数量）
    │   ├── env.ts                # 晴日海湾程序化 IBL 环境贴图生成
    │   ├── style.ts              # 假阴影贴图与基础材质辅助函数
    │   └── world.ts              # WorldView 接口定义
    ├── input/
    │   └── input.ts              # PC 键鼠（WASD + C/Q + E + R + Space + 1/2/3）与移动端左半屏虚拟摇杆 + 右下角技能键统一采集
    └── audio/
        └── audio.ts              # WebAudio 合成音效（开火、爆炸、升级、拾取、首领警报，支持切后台挂起与静音开关）
```

---

### 1.3 必须遵守的五大架构契约（供后续 AI 开发严格执行）

1. **逻辑层（`src/sim/`）与渲染层（`src/render/`）严格解耦**：
   - `src/sim/` 不得引用任何 `three`、`window`、`document` 对象，确保 `npm.cmd run playtest -- 2 0.85` 可在纯 Node 环境下以千倍速跑完 15 分钟整局模拟。
   - **画质档位与刷怪数量解耦**：低/中/高画质（`src/render/quality.ts`）只能调整 `maxDpr`、`resScale`、`shadows`、`fxScale`、`particleBudget`，**严禁**因低画质减少 `src/sim/` 中的敌人生成数量或碰撞精度。
2. **多人联机与「减轻队友特效」预留**：
   - `JinxVfxSystem` 与 `WeaponVfxRenderer` 已预留 `teammateVfxScale = 1.0` 接口；后续扩展多玩家时，非本地玩家（`ownerId !== localPlayerId`）的特效透明度与粒子数乘上 `teammateVfxScale`（如 `0.35`）。
3. **统一通过 `src/render/assets.ts` 加载一切资源**：
   - 严禁在任何渲染模块中新建 `new GLTFLoader()`、`new THREE.TextureLoader()` 或裸调 `fetch('./assets/...')`。
   - 所有资源必须走 `loadGLB()`、`getTexture()`、`loadSpriteCell()`、`loadScbGeo()`、`uiIconUrl()`，自动享受去重缓存、`.png` → `.webp` 兜底映射及 `VITE_ASSET_BASE_URL` CDN 前缀支持。
4. **WebGL2 不可变纹理与 `PointsMaterial` 切格铁律**：
   - `THREE.PointsMaterial` 会忽略 `Texture.repeat` / `offset`，必须使用 `assets.ts` 中的 `loadSpriteCell()` 切出单格 `CanvasTexture`。
   - **严禁**在 `img.onload` 回调中修改 `canvas.width` / `canvas.height`（WebGL2 `texStorage2D` 分配后修改尺寸会导致纹理静默变成全透明！）。
5. **烘焙光照 `TEXCOORD_1` (`uv1`) 保护铁律**：
   - `warehouse_map1.glb` 的 `uv1` 属性在 `src/render/map_warehouse.ts` 中需按 `src/sim/map1_lightmaps.json` 的 `[lmIdx, sx, sy, bx, by]` 进行浮点缩放偏移。
   - 运行 `@gltf-transform` 压缩地图 GLB 时，**必须**排除 `TEXCOORD_1` 量化（`pattern: /^(?!TEXCOORD_1$).*$/`），且 `map_warehouse.ts` 中已内置 `uv1Attr.normalized` 转 `Float32BufferAttribute` 的双重防护。

---

## 二、 官方 Patch 14.14 全部资产来源地址与 1:1 还原管线（Asset Sources & Reproduction）

如果其他 AI 或开发者需要在新环境重新拉取、验证或扩展新英雄/新地图资产，所有资产均来自**拳头官方 Patch 14.14 客户端数据**，分为以下两条公开可复现渠道：

### 2.1 渠道 A：CommunityDragon Patch 14.14 公开直链（免解包，直接 HTTP GET 下载）

根地址：**`https://raw.communitydragon.org/14.14/game/`**

#### (1) 第一关「仓库区（Map33）」数据配置、材质映射与 22 张烘焙光照贴图
- **地图波次 / 喷泉 / 补给箱 / 刷怪环配置**：
  `https://raw.communitydragon.org/14.14/game/data/maps/shipping/map33/map33.bin.json`
- **地图材质与 `MapSunProperties` 光照配置**：
  `https://raw.communitydragon.org/14.14/game/data/maps/mapgeometry/map33/strawberry_animasquad_map1.materials.bin.json`
- **22 张官方烘焙光照贴图（对应本项目 `public/assets/map1/lightmaps/1..22.webp`）**：
  `https://raw.communitydragon.org/14.14/game/data/maps/mapgeometry/map33/strawberry_animasquad_map1_lightmaps/0.png` 至 `21.png`
- **104 张仓库区建筑/地面/植被/广告牌贴图（完整文件名映射表见仓库内 `src/sim/map1_materials.json`）**：
  - 地面贴图目录：`https://raw.communitydragon.org/14.14/game/assets/maps/kitpieces/strawberry/textures/`
  - 建筑与道具贴图目录：`https://raw.communitydragon.org/14.14/game/assets/maps/kitpieces/strawberry/props/`
- **中央治愈喷泉与地图通用粒子贴图（对应 `public/assets/map1/vfx/`）**：
  `https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/`

#### (2) 幻灵战队金克丝（`Strawberry_Jinx`）数值、贴图、技能图标与 41 张 VFX 贴图
- **金克丝技能/武器/成长数值配置**：
  `https://raw.communitydragon.org/14.14/game/data/characters/strawberry_jinx/strawberry_jinx.bin.json`
- **金克丝特效粒子系统定义（`VfxSystemDefinitionData`，含 E/R/被动/枪口全部图层尺寸、颜色、纹理路径）**：
  `https://raw.communitydragon.org/14.14/game/data/characters/strawberry_jinx/skins/skin0.bin.json`
- **金克丝角色与武器贴图**：
  - `https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_jinx/skins/base/strawberry_jinx_base_tx_cm.png`（→ `heroes/jinx/body.webp`）
  - `https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_jinx/skins/base/strawberry_jinx_weapon_tx_cm.png`（→ `heroes/jinx/weapon.webp`）
- **金克丝 HUD 头像与技能图标**：
  - `https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_jinx/hud/strawberry_jinx_circle_0.png`（→ `ui/jinx_circle.webp`）
  - `https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_jinx/hud/strawberry_jinx_square_0.png`（→ `ui/jinx_square.webp`）
  - `https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_jinx/hud/icons2d/`（被动、Q/喵喵枪、E 鱼骨头、R 死神飞弹图标 → `heroes/jinx/icons/`）
- **金克丝专属 VFX 粒子贴图**：
  `https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_jinx/skins/base/particles/`

#### (3) 第一关小怪、精英怪、雷克塞首领与可破坏补给箱配置及贴图
- **小怪 Pix（`enemy_pix`）**：
  - 配置：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_enemy_pix/skins/skin0.bin.json`
  - 贴图：`https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_enemy_pix/skins/base/`
- **小怪 Ghoul（`enemy_ghoul`）**：
  - 配置：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_enemy_ghoul/skins/skin0.bin.json`
  - 贴图：`https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_enemy_ghoul/skins/base/`
- **远程小怪 Hunter（`enemy_hunter`）**：
  - 配置：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_enemy_hunter/skins/skin0.bin.json`
  - 贴图：`https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_enemy_hunter/skins/base/`
- **冲锋小怪 Dasher（`enemy_dasher`）**：
  - 配置：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_enemy_dasher/skins/skin0.bin.json`
  - 贴图：`https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_enemy_dasher/skins/base/`
- **重装精英怪 Bruiser（`miniboss_bruiser`）**：
  - 配置：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_miniboss_bruiser/skins/skin0.bin.json`
  - 贴图：`https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_miniboss_bruiser/skins/base/`
- **最终首领 深海魔鲨·雷克塞（`reksai`）**：
  - 配置：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_boss_reksai/skins/skin0.bin.json`
  - 技能数值：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_boss_reksai/strawberry_boss_reksai.bin.json`
  - 贴图：`https://raw.communitydragon.org/14.14/game/assets/characters/strawberry_boss_reksai/skins/base/`

#### (4) 10 把官方武器与 12 种被动属性 UI 图标及特效配置
- **武器与升级图标目录**：
  `https://raw.communitydragon.org/14.14/game/assets/ux/strawberry/upgrades/`
  `https://raw.communitydragon.org/14.14/game/assets/ux/traiticons/`
- **后续可扩展的其他幻灵战队英雄（M5+ 角色库直链）**：
  - 锐雯：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_riven/`
  - 亚索：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_yasuo/`
  - 蕾欧娜：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_leona/`
  - 萨勒芬妮：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_seraphine/`
  - 俄洛伊：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_illaoi/`
  - 贝蕾亚：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_briar/`
  - 阿萝拉：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_aurora/`
  - 霞：`https://raw.communitydragon.org/14.14/game/data/characters/strawberry_xayah/`

---

### 2.2 渠道 B：3D 模型（`.glb`）与 3D 特效网格（`.scb` → `.json`）提取与压缩管线

CommunityDragon 不直接托管转换好的 `.glb`，本项目中的 **9 个 `.glb` 模型**与 **22 个 `.scb` 3D 特效 JSON** 通过以下标准开源工具链从 Patch 14.14 `.wad.client` 转换而来：

1. **所需开源工具**：
   - **ManifestDownloader**：从拳头 CDN 按 Patch `14.14` 清单拉取 `Map33.wad.client` 及 `Strawberry_*.wad.client`。
   - **CommunityDragon 路径哈希表**：`https://raw.communitydragon.org/data/hashes/lol/hashes.game.txt`
   - **lol2gltf**（`https://github.com/LeagueToolkit/lol2gltf`）：
     - 地图转换：`lol2gltf mapgeo -m strawberry_animasquad_map1.mapgeo -o warehouse_map1.glb`
     - 骨骼角色转换：`lol2gltf skn -m <model.skn> -s <skeleton.skl> -a <animations_dir> -o <character.glb>`
2. **`.scb` v3.2 3D 特效网格转 `.json` 规范（踩坑警示）**：
   - 拳头 `.scb` v3.2 文件头：`char[8] magic ("r3d2Mesh")`、`uint16 major (3)`、`uint16 minor (2)`、`char[128] name`、`uint32 vertCount`、`uint32 faceCount`、`uint32 flags (hasVertColors = flags & 1)`、`float32[6] bbox`、`uint32 vertexType`。
   - **关键字节序**：紧接着是 `vertCount * 12` 字节的 `float32[3]` 顶点坐标；**当 `vertexType === 1`（含顶点色）时，紧随顶点坐标之后有 `vertCount * 4` 字节的 RGBA 顶点色，然后才是 `float32[3] centralPoint` 和 `faceCount` 个三角形面（每个面：`uint32[3] indices` + `char[64] matName` + `float32[6] uvs`）**。
3. **M4 一键压缩脚本（已内置于仓库 [`tools/compress_assets.mjs`](./tools/compress_assets.mjs)）**：
   ```bash
   node tools/compress_assets.mjs
   ```
   - 自动对全部 `.glb` 执行 `dedup + quantize (保留 TEXCOORD_1) + meshopt`，并将全部 `.png` 转为 `.webp`，将总资产从 `172.56 MB` 压缩至 **`36.75 MB`**（最大单文件 `warehouse_map1.glb` = **`13.24 MB`**）。

---

## 三、 Cloudflare Pages / R2 部署与 GitHub 在线 AI 协作指南

经过 M4 压缩后，整个项目的体积结构发生了质变：

| 资产分类 | 压缩前体积 | M4 压缩后体积 | 缩减比例 | 最大单文件 |
| :--- | :---: | :---: | :---: | :--- |
| **9 个 3D 模型 (`.glb`, Meshopt)** | `63.62 MB` | **`16.39 MB`** | `-74.2%` | `warehouse_map1.glb` (**`13.24 MB`**) |
| **238 张贴图与图标 (`.webp`)** | `108.06 MB` | **`19.48 MB`** | `-82.0%` | `squadicons_streetsigns_a.webp` (`< 0.5 MB`) |
| **25 个 3D 特效网格 (`.json`)** | `0.89 MB` | **`0.88 MB`** | `-1.1%` | `fountain_sphere.json` (`< 0.2 MB`) |
| **总计 (`public/assets/`)** | **`172.56 MB`** | **`36.75 MB`** | **`-78.7%`** | **`13.24 MB`（远低于 Cloudflare Pages `25 MiB` 限制）** |

### 3.1 方案一：Cloudflare Pages 单项目直接部署（最简推荐，无需额外配 R2）
由于最大单文件 `warehouse_map1.glb` 已降至 **`13.24 MB`**（低于 Cloudflare Pages 单文件 `25 MiB` 上限），且构建产物 `dist/` 总计仅 `~37.7 MB`（共 258 个文件，远低于 Pages 20,000 文件上限），**可以直接将代码与资产一次性部署到同一个 Cloudflare Pages 项目**：
```bash
npm run build
npx wrangler pages deploy dist --project-name tideline-swarm
```

### 3.2 方案二：Cloudflare Pages + R2 对象存储分离部署（可选）
如果你希望将 `public/assets/` 单独托管在 Cloudflare R2 桶（绑定自定义域名如 `https://assets.example.com`）：
1. 将 `public/assets/` 上传至 R2 桶的 `/assets/` 路径下并开启 CORS（`Access-Control-Allow-Origin: *`）。
2. 在 Cloudflare Pages 环境变量中配置：
   ```env
   VITE_ASSET_BASE_URL=https://assets.example.com
   ```
   `src/render/assets.ts` 中的 `assetUrl()` 会自动将全站 3D 模型、贴图、特效 JSON 与 UI 图标指向该 CDN 地址。

### 3.3 让其他在线 AI 开箱即用（上传压缩后 `public/assets/` 到 GitHub）
此前由于未压缩前 `warehouse_map1.glb` 高达 `50.42 MB`、总资产 `172 MB`，`.gitignore` 中临时排除了 `public/assets/`。  
**现在 M4 压缩后 `public/assets/` 仅 `36.75 MB`（最大文件 `13.24 MB`，远低于 GitHub 单文件 `100 MiB` 限制）**：
- 只需从 `.gitignore` 中移除 `public/assets/` 并 `git push`，任何云端 AI（Claude Code Web / Cursor Cloud / Bolt / StackBlitz / Cloudflare Pages Git 自动构建）拉取仓库后，无需本机解包即可直接运行 `npm install && npm run dev` 或自动构建上线！
