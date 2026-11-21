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
  - 首轮修复已解决：补齐 `trail_dark.png` / `glowring_outer.png` / `noise_02.png`、水池底 `Basic5` 改用 `NormalBlending`、`Edge17/14/16` 菲涅尔着色器+滚动条纹、`Edge10` `uvScale=[9,1]`、以及 `hex_plus`/`lilstar` 独立单格裁剪。

---

## 2. 【当前首要任务】遗留待修问题：中央花坛（治愈喷泉）特效仍不太对

虽然首轮修复消除了水池过曝白块与 4 格粒子图集平铺问题，并跑通了充能→冷却状态切换，但**中央花坛整体视觉观感仍未达到《无尽狂潮》原版的高还原度**。新会话开启后请优先按以下 4 点逐项排查与精修：

1. **悬浮 3D 能量球核（`sphereGroup`）在实机视角被裁切与遮挡**
   - 现状：在 `?spot=hub` `1280x800` 视角下，`y = 3.5m` 的悬浮球核正好处于画面最顶部边缘，且被顶部 `00:04 / 距首领` 计时器 HUD 遮挡，导致首轮实机截图根本无法完整看清球核的体积形态、颜色过渡和 `trail_dark.png` 流动效果。
   - 待办：新增或调整一个能**完整拍到中央喷泉全景（包含池面与悬浮球核顶部）**的测试视角/镜头参数（如 `?spot=fountain` 或临时缩放调试参数），重新核对原版球核的真实高度、缩放比例、外层条纹亮度和体积透明感。
2. **已导出原版 `.scb` 网格存在未挂接项（`fountain_timer.json` 未使用）**
   - 现状：目前 `src/render/map_warehouse.ts` 只加载了 `fountain_sphere.json`、`fountain_baseedge.json`、`fountain_wave.json`、`fountain_beam.json`；而已经从原版解包导出的 `public/assets/map1/vfx/fountain_timer.json` **尚未被任何代码引用**，当前充能进度圈仍使用程序化 `RingGeometry` + `edge_06.png`。
   - 待办：全面遍历 `map33.bin.json` 下 `Fountain_Glow`、`Timer_Charge`、`Nova` 的全部子发射器与 `.scb` 网格绑定关系，核对 `fountain_timer.json` 及其他原生发射器是否遗漏，避免用程序化网格替代原版 3D 资产。
3. **水池光效层次、脉冲波可见度与颜色比例校准**
   - 现状：当前中央花坛在视觉上仍偏“平面/单层感”，`fountain_wave.json` 脉冲波与池面外沿发光厚度不足，中心球核与池面的光影呼应、蓝绿青配色比重尚未与原版实机一致。
   - 待办：对照《无尽狂潮》原版中央花坛实机截图（可请用户提供 1 张原版截图作为黄金参考，或重新核对 `map33.bin.json` 每个 emitter 的 `birthColor`、`colorOverLifetime`、`birthScale0`、`scaleOverLifetime` 与 `emitterPosition`），逐层校准颜色曲线、透明度与缩放脉冲。
4. **升级 AI 分身复核标准**
   - 后续 `research` 复核子代理必须要求**看到包含悬浮球核全貌的全景实机截图**，并且逐条核对 `map33.bin.json` 所有子发射器是否 100% 对应，不得再遗漏未使用的 `.scb` 资产。

---

## 3. 下一阶段计划（待中央花坛特效彻底验收通过后推进）

1. 完成中央花坛特效第二轮精修 → `build` + `playtest` → 全景多角度浏览器实机截图 → AI 分身逐参数复核 PASS → 向用户展示截图确认。
2. **获得用户明确确认后**，启动 **M2：导入第一关原版小怪 / 精英怪 / 雷克塞 Boss（`strawberry_boss_reksai`）3D 模型与动画**，跑通首波到 Boss 全流程。

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

### 本机未上传的大体积资产目录（仅本机参考）
- **运行时大资源目录（未上传 GitHub）**：`C:\七星\游戏\tideline\tideline\public\assets\`（共 `144.98 MB`，含 `warehouse_map1.glb` `50.42 MB`、`strawberry_jinx.glb` `7.78 MB`、`metalbox.glb`、127 张贴图及 VFX JSON/PNG）。
- **原始解包参考目录（未上传 GitHub）**：`C:\七星\游戏\tideline\tideline\资产包\第一关仓库区地图材质贴图\`（`68.89 MB`）。
