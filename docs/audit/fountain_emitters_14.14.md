# 中央治愈喷泉 · 原版 43 个发射器核对报告（Patch 14.14）

> 核对日期：2026-11-22 · 核对人：AWS Quick
> 原版数据：`map33.bin.json`（CommunityDragon 14.14，KV `ref/14.14/data/maps/shipping/map33/map33.bin.json`）
> 对照代码：`src/render/map_warehouse.ts` 第 206–1019 行（M4 版本）
> 单位换算：拳头 1 单位 = 0.01 m；面片尺寸 = 2 × birthScale / 100 m；网格缩放 = birthScale / 100

---

## 1. 总览

| 特效系统 | 发射器数 | 已实现 | 缺失 | 说明 |
| :--- | :---: | :---: | :---: | :--- |
| `Fountain_Glow`（常驻） | 15 | 15 | 0 | 全部有对应，但 7 个缺「叠加贴图 textureMult」，2 个参数有偏差 |
| `Fountain_Timer_Charge`（充能 10 s） | 11 | 10 | 1 | 9 个层被合并成 2 个着色器近似；充能星芒行为和原版不同 |
| `Fountain_Nova`（满充爆发） | 17 | 3 | 14 | **差距最大**；整个系统还缺 1.75 倍整体缩放 |
| **合计** | **43** | **28** | **15** | |

---

## 2. 最关键的 5 个问题（按影响排序）

1. **Nova 整体缩放 ×1.75 没应用**：原版 `Fountain_Nova` 系统带 `transform` 缩放 1.75。代码里光柱、地面冲击光、金星都按 1.0 做，比原版小了将近一半。例如 `brighShockwave` 应为 28 m（代码 16 m），`STAR` 应为 14 m（代码 8 m）。
2. **Nova 17 层只做了 3 层**：缺 `Gold`/`Gold1` 两组上升粒子、两层 `Shockwave_blend` 冲击波、`Beamdown` 下射光、`flashBlend` 闪白、`Ring` 旋涡、`ShapeAround`、`InhaleFire` ×3 吸入火焰、`teamring_circle1`、`Ground_Light_mesh1` 扫描线光柱。
3. **Nova 节奏不对**：原版是「0.15–0.4 s 的瞬间闪光 + 2–5 s 慢慢收尾」两段式。代码统一用 0.85 s 线性淡出：
   - `flashBlend` 0.15 s、`STAR` 0.16 s、`brighShockwave` 0.3 s、`Ground_Light_mesh` 0.4 s
   - `Shockwave_blend1` 2 s、`InhaleFire` 5 s、`teamring_circle1` 5 s
4. **充能星芒 `sparklies1` 行为不同**：原版每秒 40 颗，生成点沿 7.2–9.4 m 圆周**跟着进度头 10 s 扫一圈**，贴地生成后以 0.2–1 m/s 上浮，单颗约 0.7 m。代码是 36 颗固定在 8.5 m 圆上整体旋转。
5. **7 个常驻层缺叠加贴图**：`Edge10`（scan_lines 扫描线）、`outer_graphic` / `Shockwave_blend` / `outer_graphic1`（dots 点阵）、`Crecents1`（base_glow）、`Crecents2`（glow_hardedge）都缺 textureMult。原版这些层带「点阵 / 扫描线」细节，代码只有纯色光圈，这正是之前说的「偏平面、单层感」的主要原因。

---

## 3. 逐项对照

图例：✅ 一致 · 🟡 有但有偏差 · 🔀 与其他层合并近似 · ❌ 缺失

### 3.1 `Fountain_Glow`（15）

| 发射器 | 原版要点 | 代码现状 | 状态 |
| :--- | :--- | :--- | :---: |
| `healspark` | hex_plus 2×2 随机 4 帧；15 个/s，寿命 1–2 s；半径 3 m 内生成；上升 2.5–5 m/s；0.4 m，缩放 0→1→0 弹出 | 40 颗常驻循环；0.82 m（**大一倍**）；上升 1.45–2.45 m/s；只用 2 帧 | 🟡 |
| `Edge10` | BaseEdge 网格 ×3.2；绿 (0,1,0.42)；4 s 呼吸、自转 3°/s、uv×9；叠加 scan_lines 下滚 | 尺寸、颜色、呼吸、自转、uv 都对；**缺 scan_lines** | 🟡 |
| `outer_graphic` | GlowRing 28 m，y=0.1，α=0.1；叠加 dots | 28 m、α 0.08 一致；**缺 dots** | 🟡 |
| `Shockwave_blend` | Wave01 (25,8,25)；每 2 s 一次；α 0→0.5→0.5→0；UV 滚动 0.5；叠加 dots (150→250) | 尺寸、周期、曲线一致；峰值 0.42（原版 0.5）；**缺 dots** | 🟡 |
| `Crecents1` | Timer_Outline 7.6 m，y=0.9；叠加 base_glow | 尺寸一致；**缺叠加** | 🟡 |
| `Crecents2` | Glow_Ring 10 m；叠加 glow_hardedge | 尺寸一致；**缺叠加** | 🟡 |
| `outer_graphic1` | Glow_Ring 10 m；叠加 dots | 尺寸一致；**缺叠加** | 🟡 |
| `Edge12` | CenterSphere ×0.98，y=3.5；HexTile 叠加 | 并入 sphereHex（缩放 0.010） | 🔀 |
| `Edge13` | ×1.0；HexTile_Inverted 叠加 | 并入 sphereHex | 🔀 |
| `Edge14` | ×1.0；普通混合，暗绿 (0,0.24,0.13,0.7) | 并入 sphereCore | 🔀 |
| `Edge15` | ×1.0；菲涅尔边缘 | 并入 sphereHex | 🔀 |
| `Edge16` | trail_dark + noise_02 流动 | sphereSwirl（缩放 0.0102） | ✅ |
| `Edge17` | ×1.0；普通混合，深蓝 (0.12,0.22,0.42,0.92) | 并入 sphereCore（缩放 0.0098，**应为 1.0**，0.98 属于 Edge12） | 🔀 |
| `Basic4` | Glow_Ring 6.6 m 朝向相机，y=3.5，α=0.4 | 6.6 m 一致；α 0.22（**偏暗**） | 🟡 |
| `Basic5` | SharpCircle 8.6 m，y=0.72，普通混合蓝 | 一致 | ✅ |

### 3.2 `Fountain_Timer_Charge`（11）

| 发射器 | 原版要点 | 代码现状 | 状态 |
| :--- | :--- | :--- | :---: |
| `sparklies1` | 见第 2 节第 4 条 | 36 颗固定环绕 | 🟡 |
| `background3` | Timer_02 ×0.92，普通混合暗绿 α 0.8；进度遮罩 Base_Timer_Mult_06（0.104/s，约 9.6 s 扫满） | timerBg；进度用 `uv.x > progress` 丢弃代替遮罩 | 🔀 |
| `Noise_Mult` | noise_02，Mult_06 | 并入 timerTech | 🔀 |
| `Decal` | Healing_Edge_08 青 (0.53,0.99,1.0)，UV 滚动 0.07 | 并入 timerTech | 🔀 |
| `Arrow_Start` | 白，Mult_07（进度头高光） | 用 `head` 近似 | 🔀 |
| `Decal_Highlight` | Edge_06，Mult_08 | 并入 timerTech | 🔀 |
| `Circle_Pattern` | Dots 普通混合，Mult_09 | 并入 timerBg | 🔀 |
| `Decal2` | Edge_09，Mult_06 | 并入 timerTech | 🔀 |
| `Decal3` | Edge_06，Mult_06 | 并入 timerTech | 🔀 |
| `Decal_Start1` | Timer_Start_01 网格，Edge_Start_01 加色 | timerStartMesh | ✅ |
| `Decal_Start2` | 同网格，普通混合深绿 (0,0.42,0.21) 打底 | **缺** | ❌ |

> ⚠️ 代码在进度 75% 后把颜色渐变成暖黄 `(1.0,0.85,0.35)`，**原版 Timer_Charge 的 11 个层里没有任何暖色**，建议去掉。

### 3.3 `Fountain_Nova`（17，系统整体 ×1.75）

| 发射器 | 原版要点（未乘 1.75） | 代码现状 | 状态 |
| :--- | :--- | :--- | :---: |
| `brighShockwave` | Base_Glow 16 m，y=1.0，0.3 s | novaGlow 16 m，约 0.6 s | 🟡 |
| `Ground_Light_mesh` | LightCylinder ×1.2，DecalLight01，0.4 s | fountain_beam ×1.2，0.85 s | 🟡 |
| `STAR` | Star_1 8 m，y=2.0，金 (1,0.82,0.35)，0.16 s | novaStar 8 m，约 0.5 s | 🟡 |
| `Gold` | hex_plus 粒子，每秒 100 个，2 s | — | ❌ |
| `Gold1` | lilStar 粒子，每秒 50 个，2 s | — | ❌ |
| `InhaleFire` | **FlameMesh** 网格，贴地，5 s | — | ❌ |
| `InhaleFire2` | **Brand_Base_Ring** 网格，2 s | — | ❌ |
| `InhaleFire3` | **Brand_Base_Ring** + Trail_Silk_01，2 s | — | ❌ |
| `Shockwave_blend` | Wave01 ×(80,10,80)，贴地，0.7 s | — | ❌ |
| `Shockwave_blend1` | Wave01 ×(40,10,40)，贴地，2 s | — | ❌ |
| `Ground_Light_mesh1` | LightCylinder ×(1.2,1.5)，叠加 Scan_Lines | — | ❌ |
| `Beamdown` / `Beamdown1` | Base_GlowStar_02 10×14 m，y=-1.0，0.2 s | — | ❌ ×2 |
| `Ring` | **HealingStation_Swirl** 网格，Circle_Mis，6 个/s | — | ❌ |
| `ShapeAround` | **HealingStation_Shape_Music** 网格，Music_aura | — | ❌ |
| `flashBlend` | PointStarAdd 12 m，y=2.0，0.15 s | — | ❌ |
| `teamring_circle1` | **HealingStation_Indicator** 网格，Infernal_Smoke_Trail，5 s | — | ❌ |

---

## 4. 修复分工

### 4.1 AWS Quick 现在就能改（不需要新资产）
- [ ] Nova 系统整体 ×1.75
- [ ] Nova 节奏改为两段式（按第 2 节第 3 条的原版寿命）
- [ ] 新增 Nova `Shockwave_blend` / `Shockwave_blend1`（复用已有 `fountain_wave.json` + `shockwave` 贴图）
- [ ] 新增 Nova `Gold` / `Gold1` 粒子（复用 `hex_plus` / `lilstar`）
- [ ] 新增 Timer `Decal_Start2` 深绿打底（复用 `edge_start_01`）
- [ ] `healspark` 改为发射式粒子（尺寸 0.4 m、上升 2.5–5 m/s、寿命 1–2 s、4 帧随机、缩放弹出曲线）
- [ ] `sparklies1` 改为跟随进度头扫圈生成并上浮
- [ ] `Basic4` α 0.22 → 0.4；`Edge12`/`Edge17` 缩放对调；`Shockwave_blend` 峰值 0.42 → 0.5
- [ ] 去掉计时圈 75% 后的暖黄色

### 4.2 交给执行 AI（Issue #1）
- **T2 网格（5 个，需从 `Map33.wad.client` 解包）**：`FlameMesh`、`Brand_Base_Ring`、`HealingStation_Swirl`、`HealingStation_Shape_Music`、`HealingStation_Indicator`
  - 订正：`HealingStation_Mesh_Timer_02`（= `fountain_timer.json`）、`Timer_Start_01`（= `fountain_timer_start.json`）、`Healing_Station_LightCylinder`（= `fountain_beam.json`）代码里已经在用，**不用再做**。
- **T4 贴图（15 张，CommunityDragon 可直接下载 `.png` 再转 `.webp`）**：`Base_Timer_Mult_05`～`09`、`HealingStation_Scan_Lines`、`HealingStation_Glow_HardEdge`、`HealingStation_Base_GlowStar_02`、`HealingStation_PointStarAdd`、`HealingStation_Circle_Mis`、`HealingStation_MeshMult`、`HealingStation_Shockwave_Trail`、`HealingStation_Trail_Silk_01`、`HealingStation__Infernal_Smoke_Trail`、`Music_aura`
  - 下载地址：`https://raw.communitydragon.org/14.14/game/assets/maps/particles/strawberry/<小写文件名>.strawberryrebuild.png`
  - 放到 `public/assets/map1/vfx/`，过 `tools/compress_assets.mjs` 转 `.webp`。

### 4.3 等资产到位后 AWS Quick 再接
- 7 个常驻层的 textureMult 叠加；Timer 进度遮罩换成原版 `Base_Timer_Mult_05–09`
- Nova `Beamdown` ×2、`flashBlend`、`Ground_Light_mesh1`、`Ring`、`ShapeAround`、`InhaleFire` ×3、`teamring_circle1`
