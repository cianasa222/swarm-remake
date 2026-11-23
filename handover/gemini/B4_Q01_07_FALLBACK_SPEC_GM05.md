# GM-05 · Q01-07 未支持字段统计与 B4 运行器降级规格（基于 PR #10 157 系统 / 903 层）

> 作者：Gemini（GM-05）· 2026-11-23 19:45 CST · 仅 KV（待合入 [PR #10](https://github.com/cianasa222/swarm-remake/pull/10) 或 B4 开发分支）
> 数据来源：PR #10（`f2ae2a21` / `77c25a35`）`src/render-babylon/vfx/data/14.14/{fountain,weapons,jinx,enemy,reksai,map}.json`（共 **157 系统 / 903 图层**）。
> 对应验收单：`handover/gpt/BAB_Q01_ACCEPTANCE_GPT13.md` 第 2 节 `Q01-07`。

## 1. 数据无损保留核查与图元分布

- **原值保留率：100%（20 / 20 类未支持字段、611 / 611 次出现均完整保留在 `material.*` / `children` / `fields` / `extra`，0 静默丢弃）**。
- **903 图层图元分布**：`billboard` 297、`quad` 251、`mesh` 245、`arbitraryTrail` 34、`ray` 32、`attachedMesh` 26、`beam` 10、`cameraTrail` 6、`planarProjection` 2。

## 2. 未支持字段分布与 B4 降级 / 实现优先级

| 优先级 | 字段名 | 出现层数 | 分类分布（喷/武/金/敌/雷/图） | B4 首版有依据 Fallback | 正式实现建议 |
| :---: | :--- | ---: | :--- | :--- | :--- |
| **P0** | `alphaErosionDefinition` | **161** | 2 / 21 / 28 / 17 / 89 / 4 | 退回标准 `alpha` 曲线淡出（保留原值不删除） | B4.1 优先在通用片元着色器补软溶解阈值裁剪（显著影响雷克塞/金克丝爆发质感） |
| **P0** | `useNavmeshMask` | **91** | 3 / 13 / 10 / 11 / 50 / 4 | 跳过裁剪（**敌方预警层严禁因裁切丢失**） | B4.2 复用 `map1_data.json` 的 `walkableB64` 生成 320×320 掩码纹理在片元采样 |
| **P0** | `colorLookUpTypeY/X/Offsets/Scales` | **83 / 10 / 12 / 8** | 6 / 15 / 4 / 4 / 43 / 11（Y） | 退回 `birthColor × color` 曲线 | B4.1 支持 `particleColorTexture` 按归一化寿命采样（1D/2D LUT） |
| **P0** | `FlexShapeDefinition` | **69** | 1 / 11 / 14 / 15 / 21 / 7 | 按 `EffectSpawnRequest.scale` 统一缩放 `spawnShape` | B4.2 按原版绑定参数覆盖发射半径/盒尺寸 |
| **P0** | `softParticleParams` | **52** | 3 / 8 / 1 / 11 / 22 / 7 | 移动端/低中档关闭深度软粒子（省深度读取 pass） | 桌面高档按需开启深度缓冲淡出 |
| **P1** | `reflectionDefinition` | **36** | 4 / 1 / 3 / 6 / 10 / 12 | 忽略独立反射贴图，复用场景 IBL | B5 后视性能按需补环境反射 |
| **P1** | `Filtering` | **30** | 2 / 0 / 1 / 3 / 24 / 0 | 使用材质默认线性过滤 + 各向异性 4 | 仅在发现像素风/硬边失真时单独切 nearest |
| **P1** | `paletteDefinition` | **22** | 0 / 7 / 1 / 2 / 3 / 9 | 保留贴图原色 + `birthColor` | B4.2 查色板映射（主要涉及武器与拾取） |
| **P1** | `childParticleSetDefinition` | **14** | 0 / 3 / 5 / 0 / 6 / 0 | 首版打印一次性告警，不静默忽略 | B4.2 支持父粒子触发派生子系统（十字弩/地雷/金克丝/雷克塞） |
| **P2** | `flexBirthUVOffset` | **5** | 0 / 0 / 0 / 0 / 0 / 5 | 仅血条系统；按默认 UV 偏移 0 | 仅若采用原版 3D 血条特效时按血量百分比驱动 |
| **P2** | `fieldCollectionDefinition` | **4** | 0 / 3 / 0 / 1 / 0 / 0 | 忽略力场扰动，保留基础速度/加速度 | B5 后视地雷/精英区效果决定是否补力场 |
| **P2** | `rateByVelocityFunction` | **4** | 0 / 2 / 0 / 0 / 2 / 0 | 退回固定 `rate` 发射 | B4.2 按实体瞬时移速乘算发射率（地雷/雷克塞潜行） |
| **P2** | `stencilRef` / `stencilMode` | **3 / 1** | 敌 1 / 雷 2（Ref）；雷 1（Mode） | 关闭模板测试 | 待雷克塞潜行/弹坑截图确认是否需要模板遮罩 |
| **P2** | `sliceTechniqueRange` | **3** | 0 / 0 / 0 / 0 / 3 / 0 | 仅雷克塞潜行；跳过切片 | 待雷克塞实机截图标定 |
| **P2** | `censorModulateValue` | **2** | 武 1 / 金 1 | 忽略（地区和谐系数） | 无需实现 |
| **P2** | `falloffTexture` | **1** | 0 / 0 / 0 / 0 / 1 / 0 | 仅雷克塞潜行；退回边缘淡出 | 待雷克塞实机截图标定 |

## 3. 混合模式分布与未知模式（`mode2` / `mode3` / `mode5`）清单

**903 图层混合模式分布**：`additive`（Riot 4）**450 层**、`alpha`（Riot 1）**390 层**、`default`（未填，按 `alpha`）**36 层**、**特殊模式共 27 层（3.0%）**：`mode3` **22 层**、`mode2` **3 层**、`mode5` **2 层**。

> ⛔ **硬性约束（GPT-13 Q01-07）**：以下 3 种特殊混合模式均**未经原版实机截图标定，严禁宣布已还原**。运行器遇到时必须打印一次告警（按 `systemId:layer` 去重）并走明确记录的 fallback。

### 3.1 `mode3`（Riot 3，共 22 层）
- **特征**：18 层 `mesh` + 4 层 `billboard`，全部为实体模型/碎石/飞弹/金币（`Mine_Mis_Model`、`Missle`、`rock`、`rockShard_Spike`、`coin` 等），疑似不透明/AlphaTest（Cutout）。
- **Fallback**：按 `alpha` 渲染，若存在 `alphaRef` 则启用 alpha-test 裁剪并开启深度写入（待截图标定是否关闭透明混合）。
- **涉及系统**：武器 1（`Strawberry_Weapon_Mine_mis`）、金克丝 1（`Strawberry_Jinx_Base_R_Mis`）、雷克塞 13（`Burrowed_W_cas_knockup(_child)`、`Spawn_ArenaWall`、`Spawn_KnockUpPlayersTowardArena(_child)`、`Z_Burrowed_AOE_Explosion`、`Z_FallingDebris_Explosion`、`Z_Spawn_AOE_Explosion(_child)`、`MapC_FallingDebris_Explosion_Belveth`）、地图掉落 7（`Drop_XP_High_Missile` ×2、`Drop_XP_High_Pickup`、`Rebuild_Drop_Gold(_Missile)`、`Rebuild_Drop_Health(_Missile)`）。

### 3.2 `mode2`（Riot 2，共 3 层）
- **Fallback**：按 `alpha` 渲染并记录告警（其中 `MetalBox_Spawn/shadow` 需实机确认是否为乘算阴影）。
- **明细**：
  1. `Strawberry_Jinx_Base_Q_Minigun_Mis_Evo` — `Barrel Flash`（`billboard`）
  2. `Strawberry_Destructible_MetalBox_Explosion` — `CenterFlare`（`quad`）
  3. `Strawberry_Destructible_MetalBox_Spawn` — `shadow`（`quad`）

### 3.3 `mode5`（Riot 5，共 2 层）
- **Fallback**：按 `alpha` 渲染并记录告警。
- **明细**：
  1. `Strawberry_Jinx_Base_Q_Minigun_Mis_Evo_child` — `bullet`（`quad`）
  2. `Strawberry_Enemy_PoisonZone_Cast` — `Temp_Mesh3`（`mesh`）

## 4. 单位换算与标定红线

- 数据 JSON 内全部保持原版 14.14 数值，B4 运行器必须统一通过 `effect_def.ts` 的 `EFFECT_UNITS` 换算（`worldScale = 0.01`、`meshScalePerBirthScale = 0.01`、`quadFullWidthPerBirthScale = 0.02`）。
- `quadFullWidthPerBirthScale = 0.02` 与旧 Three.js 金克丝实现（约 55–65%）的差异，必须在 **B6 同机位原版截图标定**后统一调整常数，禁止各模块私自硬编码换算系数或混用世界单位。
