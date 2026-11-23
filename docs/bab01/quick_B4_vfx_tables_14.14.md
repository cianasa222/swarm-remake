# BAB-01 · B4 逐层参数表（自动生成，Quick AI BAB-Q01）

> 由 `tools/bab/extract_vfx_14_14.cjs` 的输出生成。数值是原版单位：寿命 s、birthScale 原值（未换算）、颜色 RGBA 0–1。「代码」列 = 该层原版名出现在相关模块的文件（弱信号，见 `quick_B4_vfx_14.14.md` 第 2 节）。完整字段（曲线、UV、深度、子系统等）看 `src/render-babylon/vfx/data/14.14/*.json`。

## fountain

### `Strawberry_MapA_Fountain_Glow`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_MapA_Fountain_Glow` · SHA-256 `f05de3901bbc01fa…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `healspark` | billboard | Particles_Hex_Plus.StrawberryRebuild.dds | additive | 2 曲线1点 随机 | 15 | (20, 1, 1) 曲线1点 随机 |  | map_warehouse.ts |
| 1 | `Edge10` | mesh | Strawberry_Augment_HollowRadiance_Decal.StrawberryRebuild.tex / Strawberry_Map1_HealingWell_BaseEdge.StrawberryRebuild.scb | additive | 4 | 0.65 | (3.2, 1, 1) | (0, 1, 0.419, 1) | map_warehouse.ts |
| 2 | `outer_graphic` | quad | GlowRing.StrawberryRebuild.dds | additive | -1 | 1 | (1.4e+03, 460, 460) | (0, 1, 0.37, 0.1) | map_warehouse.ts |
| 3 | `Shockwave_blend` | mesh | Healing_Shockwave.StrawberryRebuild.dds / HealingStation_Wave01.StrawberryRebuild.scb | additive | 2 | 0.5 | (25, 8, 25) | (0, 1, 0.41, 1) | map_warehouse.ts |
| 4 | `Crecents1` | quad | HealingStation_Timer_Outline.StrawberryRebuild.dds | additive | 1 | 2 | (380, 1, 1) |  | map_warehouse.ts |
| 5 | `Crecents2` | quad | HealingStation_Glow_Ring.StrawberryRebuild.dds | additive | 1 | 2 | (500, 1, 1) | (0.00999, 1, 0.426, 0.8) | map_warehouse.ts |
| 6 | `outer_graphic1` | quad | HealingStation_Glow_Ring.StrawberryRebuild.dds | additive | 2 | 1 | (500, 460, 460) |  | map_warehouse.ts |
| 7 | `Edge12` | mesh | HealingStation_White.StrawberryRebuild.dds / Strawberry_Map1_HealingWell_CenterSphere.StrawberryRebuild.scb | additive | -1 | 1 | (0.98, 1, 1) | (0, 0.00999, 0.00999, 0.7) | map_warehouse.ts |
| 8 | `Edge13` | mesh | HealingStation_White.StrawberryRebuild.dds / Strawberry_Map1_HealingWell_CenterSphere.StrawberryRebuild.scb | additive | -1 | 1 |  | (0, 0, 0, 1) | map_warehouse.ts |
| 9 | `Edge14` | mesh | HealingStation_White.StrawberryRebuild.dds / Strawberry_Map1_HealingWell_CenterSphere.StrawberryRebuild.scb | alpha | -1 | 1 |  | (0, 0.24, 0.13, 0.7) | map_warehouse.ts |
| 10 | `Edge15` | mesh | HealingStation_White.StrawberryRebuild.dds / Strawberry_Map1_HealingWell_CenterSphere.StrawberryRebuild.scb | additive | -1 | 1 |  | (0, 0, 0, 0.65) | — |
| 11 | `Basic4` | billboard | HealingStation_Glow_Ring.StrawberryRebuild.dds | additive | -1 | 1 | (330, 1, 1) | (0.1, 0.87, 0.581, 0.4) | map_warehouse.ts |
| 12 | `Edge16` | mesh | HealingStation_trail_Dark.StrawberryRebuild.dds / Strawberry_Map1_HealingWell_CenterSphere.StrawberryRebuild.scb | additive | -1 | 1 |  | (0.00999, 1, 0.54, 0.3) | map_warehouse.ts |
| 13 | `Edge17` | mesh | HealingStation_White.StrawberryRebuild.dds / Strawberry_Map1_HealingWell_CenterSphere.StrawberryRebuild.scb | alpha | -1 | 1 |  | (0.118, 0.22, 0.42, 0.922) | map_warehouse.ts |
| 14 | `Basic5` | quad | Strawberry_Map1_HealingFountain_SharpCircle.StrawberryRebuild.tex | alpha | -1 | 1 | (430, 1, 1) | (0.275, 0.588, 1, 1) | map_warehouse.ts |

### `Strawberry_MapA_Fountain_Nova`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_MapA_Fountain_Nova` · SHA-256 `55b2a08c86721cda…` · 系统名出现在 map_warehouse.ts

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `brighShockwave` | billboard | HealingStation_Base_Glow.StrawberryRebuild.dds | additive | 0.3 | 1 | (800, 300, 300) | (0.18, 1, 0.63, 0.6) | map_warehouse.ts |
| 1 | `Gold` | billboard | Particles_Hex_Plus.StrawberryRebuild.dds | default | 2 曲线1点 随机 | 100 曲线1点 随机 | (10, 20, 10) 曲线1点 随机 |  | map_warehouse.ts |
| 2 | `InhaleFire` | mesh | HealingStation_MeshMult.StrawberryRebuild.dds / FlameMesh.StrawberryRebuild.scb | alpha | 5 | 1 | (10, 30, 10) | (0.03, 0.29, 0.19, 0.7) | map_warehouse.ts |
| 3 | `InhaleFire2` | mesh | HealingStation_MeshMult.StrawberryRebuild.dds / Brand_Base_Ring.StrawberryRebuild.scb | additive | 2 | 1 | (20, 30, 20) | (0.17, 1, 0.7, 0.1) | map_warehouse.ts |
| 4 | `InhaleFire3` | mesh | HealingStation_Trail_Silk_01.StrawberryRebuild.dds / Brand_Base_Ring.StrawberryRebuild.scb | additive | 2 | 1 | (20, 30, 20) | (0.17, 1, 0.39, 0.5) | map_warehouse.ts |
| 5 | `Gold1` | billboard | HealingStation_lilStar_4x2.StrawberryRebuild.dds | additive | 2 曲线1点 随机 | 50 | (20, 20, 10) 曲线1点 随机 |  | map_warehouse.ts |
| 6 | `Shockwave_blend` | mesh | Healing_Shockwave.StrawberryRebuild.dds / HealingStation_Wave01.StrawberryRebuild.scb | additive | 0.7 | 1 | (80, 10, 80) | (0.0332, 0.997, 0.386, 1) | map_warehouse.ts |
| 7 | `Ground_Light_mesh` | mesh | HealingStation_DecalLight01.StrawberryRebuild.dds / Healing_Station_LightCylinder.StrawberryRebuild.scb | additive | 0.4 | 1 | (1.2, 1, 1.2) | (0.15, 1, 0.73, 0.4) | map_warehouse.ts |
| 8 | `Ground_Light_mesh1` | mesh | HealingStation_DecalLight01.StrawberryRebuild.dds / Healing_Station_LightCylinder.StrawberryRebuild.scb | additive | 0.4 | 1 | (1.2, 1.5, 1.2) |  | map_warehouse.ts |
| 9 | `Shockwave_blend1` | mesh | Healing_Shockwave.StrawberryRebuild.dds / HealingStation_Wave01.StrawberryRebuild.scb | additive | 2 | 1 | (40, 10, 40) | (0.0332, 0.997, 0.386, 1) | map_warehouse.ts |
| 10 | `Beamdown` | ray | HealingStation_Base_GlowStar_02.StrawberryRebuild.dds | additive | 0.2 | 1 | (500, 700, 500) | (1, 1, 1, 0.5) | map_warehouse.ts |
| 11 | `Beamdown1` | ray | HealingStation_Base_GlowStar_02.StrawberryRebuild.dds | additive | 0.2 | 1 | (500, 700, 500) |  | map_warehouse.ts |
| 12 | `Ring` | mesh | HealingStation_Circle_Mis.StrawberryRebuild.dds / HealingStation_Swirl.StrawberryRebuild.scb | additive | 0.6 曲线1点 随机 | 6 | (1.8, 1, 1.8) |  | — |
| 13 | `ShapeAround` | mesh | Music_aura.StrawberryRebuild.dds / HealingStation_Shape_Music.StrawberryRebuild.scb | additive | 0.5 | 1 | (6, 10, 6) | (0, 0.99, 0.85, 0.8) | map_warehouse.ts |
| 14 | `flashBlend` | billboard | HealingStation_PointStarAdd.StrawberryRebuild.dds | additive | 0.15 | 1 | (600, 250, 250) | (1, 0.278, 0.592, 0.502) | map_warehouse.ts |
| 15 | `STAR` | billboard | HealingStation_Star_1.StrawberryRebuild.dds | alpha | 0.16 | 1 | (400, 1, 0) | (1, 0.82, 0.35, 0.8) | map_warehouse.ts |
| 16 | `teamring_circle1` | mesh | HealingStation__Infernal_Smoke_Trail.StrawberryRebuild.dds / HealingStation_Indicator.StrawberryRebuild.scb | additive | 5 | 1 | (2, 0.1, 2) | (0, 0.88, 0.4, 0.4) | map_warehouse.ts |

### `Strawberry_MapA_Fountain_Timer_Charge`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_MapA_Fountain_Timer_Charge` · SHA-256 `187500865ba0526b…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `sparklies1` | billboard | HealingStation_lilStar_4x2.StrawberryRebuild.dds | additive | 2 曲线1点 随机 | 40 | (50, 1, 1) 曲线1点 随机 |  | map_warehouse.ts |
| 1 | `background3` | mesh | HealingStation_White.StrawberryRebuild.dds / HealingStation_Mesh_Timer_02.StrawberryRebuild.scb | alpha | 11 | 1 | (92, 0.2, 0.2) | (0, 0.419, 0.213, 0.8) | — |
| 2 | `Noise_Mult` | mesh | 3026_Items_Noise_02.StrawberryRebuild.dds / HealingStation_Mesh_Timer_02.StrawberryRebuild.scb | additive | 11 | 1 | (92, 0.2, 0.2) | (0.44, 1, 0.87, 0.2) | — |
| 3 | `Decal` | mesh | Healing_Edge_08.StrawberryRebuild.dds / HealingStation_Mesh_Timer_02.StrawberryRebuild.scb | additive | 11 | 1 | (92, 0.2, 0.2) | (0.53, 0.99, 1, 0.3) | — |
| 4 | `Arrow_Start` | mesh | HealingStation_White.StrawberryRebuild.dds / HealingStation_Mesh_Timer_02.StrawberryRebuild.scb | additive | 11 | 1 | (92, 0.2, 0.2) | (0.22, 0.99, 0.66, 0.6) | — |
| 5 | `Decal_Highlight` | mesh | Healing_Edge_06.StrawberryRebuild.dds / HealingStation_Mesh_Timer_02.StrawberryRebuild.scb | additive | 11 | 1 | (92, 0.2, 0.2) | (0.53, 0.99, 1, 0.2) | — |
| 6 | `Circle_Pattern` | mesh | HealingStation_Dots.StrawberryRebuild.dds / HealingStation_Mesh_Timer_02.StrawberryRebuild.scb | alpha | 11 | 1 | (92, 0.2, 0.2) | (0.44, 1, 0.87, 0.3) | — |
| 7 | `Decal2` | mesh | Healing_Edge_09.StrawberryRebuild.dds / HealingStation_Mesh_Timer_02.StrawberryRebuild.scb | additive | 11 | 1 | (92, 0.2, 0.2) | (0.53, 1, 0.92, 0.4) | — |
| 8 | `Decal3` | mesh | Healing_Edge_06.StrawberryRebuild.dds / HealingStation_Mesh_Timer_02.StrawberryRebuild.scb | additive | 11 | 1 | (92, 0.2, 0.2) | (0.53, 0.99, 1, 0.3) | — |
| 9 | `Decal_Start1` | mesh | Healing_Edge_Start_01.StrawberryRebuild.dds / HealingStation_Mesh_Timer_Start_01.StrawberryRebuild.scb | additive | 11 | 1 | (92, 0.2, 0.2) | (0.53, 0.99, 1, 0.6) | — |
| 10 | `Decal_Start2` | mesh | Healing_Edge_Start_01.StrawberryRebuild.dds / HealingStation_Mesh_Timer_Start_01.StrawberryRebuild.scb | alpha | 11 | 2 | (92, 0.2, 0.2) | (0, 0.42, 0.21, 1) | map_warehouse.ts |

### `Strawberry_MapA_Foutain_Idle_OnCD`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_MapA_Foutain_Idle_OnCD` · SHA-256 `bafe2390f0f241a6…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Basic` | quad | Strawberry_Map1_HealingFountain_SharpCircle.StrawberryRebuild.tex | alpha | -1 | 1 | (430, 1, 1) | (0.0627, 0.161, 0.247, 1) | — |
| 1 | `Edge3` | mesh | HealingStation_White.StrawberryRebuild.dds / Strawberry_Map1_HealingWell_CenterSphere.StrawberryRebuild.scb | alpha | -1 | 1 | (0.98, 1, 1) | (0.0471, 0.137, 0.165, 1) | — |
| 2 | `Edge4` | mesh | HealingStation_White.StrawberryRebuild.dds / Strawberry_Map1_HealingWell_CenterSphere.StrawberryRebuild.scb | additive | -1 | 1 |  | (0.18, 0.306, 0.424, 1) | — |
| 3 | `Edge5` | mesh | HealingStation_White.StrawberryRebuild.dds / Strawberry_Map1_HealingWell_CenterSphere.StrawberryRebuild.scb | alpha | -1 | 1 |  | (0.0235, 0.208, 0.247, 1) | — |
| 4 | `Edge6` | mesh | HealingStation_White.StrawberryRebuild.dds / Strawberry_Map1_HealingWell_CenterSphere.StrawberryRebuild.scb | additive | -1 | 1 |  | (0, 0, 0, 0.6) | — |
| 5 | `Basic2` | billboard | HealingStation_Glow_Ring.StrawberryRebuild.dds | alpha | -1 | 1 | (310, 1, 1) | (0.0667, 0.424, 0.533, 0.702) | — |
| 6 | `Basic3` | billboard | HealingStation_Base_Glow.StrawberryRebuild.dds | additive | -1 | 1 | (300, 1, 1) | (0.239, 0.459, 0.812, 1) | — |
| 7 | `outer_graphic` | quad | HealingStation_Glow_Ring.StrawberryRebuild.dds | additive | 2 | 1 | (500, 460, 460) |  | map_warehouse.ts |
| 8 | `healspark` | billboard | Particles_Hex_Plus.StrawberryRebuild.dds | additive | 2 曲线1点 随机 | 10 | (20, 1, 1) 曲线1点 随机 |  | map_warehouse.ts |

## weapons

### `augment_holybauble_orbitalmis`

来源 `Maps/Shipping/Map33/Particles/Augments/augment_holybauble_orbitalmis` · SHA-256 `c4e12b1fdbfc576d…` · 引用技能：Augment_Weapon_HolyBauble_OrbitalMissile

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `HolyBauble_Blade` | quad | Strawberry_Weapon_HolyBauble_Consolidated_B.StrawberryRebuild.tex | alpha | -1 | 1 | (80, 7, 7) | (0.97, 0.99, 0.99, 0.45) | — |
| 1 | `HolyBauble_CatFace` | billboard | Jinx_Skin40_Cat_Faces.StrawberryRebuild.dds | alpha | -1 | 1 | (28, 7, 7) | (0.28, 0.55, 0.74, 0.65) | — |
| 2 | `HolyBauble_CatFace_TechLine` | billboard | Jinx_Skin40_Cat_Faces.StrawberryRebuild.dds | additive | -1 | 1 | (30, 7, 7) | (0.22, 0.9, 1, 0.65) | — |

### `Augment_Weapon_FrostNova_EvolveShield`

来源 `Maps/Shipping/Map33/Particles/Weapons/Augment_Weapon_FrostNova_EvolveShield` · SHA-256 `25259376009041ed…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Shield` | billboard | Strawberry_Yasuo_Base_passive_Timer_Glow.StrawberryRebuild.dds | alpha | -1 | 1 | (100, 10, 0) | (0.278, 0.318, 0.463, 1) | — |
| 1 | `Bubble5` | billboard | Lux_Skin15_passive_BW_Shield_2d.StrawberryRebuild.dds | additive | 1 | 2 | (75, 85, 85) | (1, 1, 1, 0.47) | — |
| 2 | `Bubble8` | billboard | Augment_CantTouchThis_Shield.StrawberryRebuild.tex | alpha | -1 | 1 | (90, 110, 100) | (0.09, 0.54, 0.95, 0.55) | weapon_vfx.ts |
| 3 | `FNova_Base_TechEdge` | mesh | Strawberry_Augment_FrostNova_TileEdge.StrawberryRebuild.tex / Strawberry_Yasuo_Base_Q_Ring01.StrawberryRebuild.scb | additive | -1 | 3 | (23, 5.5, 5.5) | (0.54, 0.88, 0.89, 1) | — |
| 4 | `Wind` | mesh | Augment_Frostwraith_Tile01.StrawberryRebuild.dds / Augment_Frostwraith_RoundMesh.StrawberryRebuild.scb | alpha | -1 | 1 | (0.5, 1.5, 2.45) |  | — |
| 5 | `SparksBurst` | billboard | Augment_Frostwraith_Crystals.StrawberryRebuild.dds | default | 0.6 曲线1点 随机 | 60 | (20, 150, 0) 曲线1点 随机 |  | — |
| 6 | `Dots` | billboard | HealingStation_Glow_Ring.StrawberryRebuild.dds | additive | 1 | 2 | (110, 1, 1) | (0.67, 0.84, 0.88, 0.36) | — |
| 7 | `FNova_Base_TechEdge1` | mesh | NeonLotus_Trail.StrawberryRebuild.dds / Strawberry_Yasuo_Base_Q_Ring01.StrawberryRebuild.scb | additive | 0.5 | 3 | (20, 5.5, 5.5) | (0.536, 0.881, 0.894, 1) | — |

### `Augment_Weapon_HolyBauble_Evolved`

来源 `Maps/Shipping/Map33/Particles/Weapons/Augment_Weapon_HolyBauble_Evolved` · SHA-256 `0eb49c633c09b6b8…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `HolyBauble_Evolve_CatFace` | billboard | Jinx_Skin40_Cat_Faces.StrawberryRebuild.dds | alpha | -1 | 1 | (28, 7, 7) | (0.84, 0.48, 0.16, 0.75) | — |
| 1 | `HolyBauble_Evolve_CatFace_Outline` | billboard | Jinx_Skin40_Cat_Faces.StrawberryRebuild.dds | additive | -1 | 2 | (28, 7, 7) | (1, 0.45, 0, 0.75) | — |
| 2 | `HolyBauble_Evolve_CatFace_TechLine` | billboard | Jinx_Skin40_Cat_Faces.StrawberryRebuild.dds | additive | -1 | 1 | (30, 7, 7) | (1, 0.58, 0.22, 0.85) | — |
| 3 | `HolyBauble_Evolve_Blades_Glow` | quad | Strawberry_Weapon_HolyBauble_Evolve_Consolidated_C.StrawberryRebuild.tex | alpha | -1 | 1 | (85, 7, 7) | (1, 0.95, 0.75, 0.8) | — |

### `Augment_Weapon_Mine_Countdown`

来源 `Maps/Shipping/Map33/Particles/Weapons/Augment_Weapon_Mine_Countdown` · SHA-256 `ab1d140770e11927…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Mine_Idle_Model` | mesh | Strawberry_Weapon_Mine.StrawberryRebuild.tex / Ziggs_Satchel.StrawberryRebuild.sco | alpha |  | 1 | (170, 170, 170) | (1, 1, 1, 0.9) | — |
| 1 | `Mine_Idle_ImpactDust` | billboard | Ziggs_Base_Q_Smoke_01.StrawberryRebuild.dds | alpha | 0.5 | 6 | (60, 60, 60) 曲线1点 随机 |  | — |

### `Augment_Weapon_StatikkShiv_Evolve`

来源 `Maps/Shipping/Map33/Particles/Weapons/Augment_Weapon_StatikkShiv_Evolve` · SHA-256 `6568d28973cae33b…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Weapon_StatikkShiv_Evo_Field_Lightning_1` | mesh | Kennen_Base_E_Lightning03.StrawberryRebuild.dds / Kennen_Lighting_Cyl.StrawberryRebuild.sco | additive | 0.5 曲线1点 随机 | 5 | (460, 1.2e+03, 460) 曲线1点 随机 |  | — |
| 1 | `Weapon_StatikkShiv_Evo_Field_Shadow` | quad | Kennen_Base_R_BG.StrawberryRebuild.dds | alpha | -1 | 1 | (700, 800, 0.7) |  | — |
| 2 | `Weapon_StatikkShiv_Evo_Field_Slow_Strobe` | quad | Kennen_Base_W_Glow_Blue.StrawberryRebuild.dds | additive | 0.8 | 4 | (900, 1, 1) | (0.21, 0.58, 0.97, 0.2) | — |

### `HollowRadiance_AoeCircle`

来源 `Maps/Shipping/Map33/Particles/Weapons/HollowRadiance_AoeCircle` · SHA-256 `4159743b835d1a71…` · 系统名出现在 weapon_vfx.ts

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `HRad_Dots` | quad | Jinx_Skin38_Glow3.StrawberryRebuild.dds | additive | -1 | 1 | (190, 150, 50) | (0.15, 1, 0.04, 0.1) | — |
| 1 | `HRad_Ring_Blend` | mesh | Strawberry_Yasuo_R_Tar_Glow002.StrawberryRebuild.dds / Strawberry_Weapon_HollowRadiance_OutlineR.StrawberryRebuild.scb | alpha | -1 | 1 | (0.77, 1, 1) | (0.41, 1, 0.5, 0.45) | — |
| 2 | `HRad_Ring_Add` | mesh | Strawberry_Yasuo_R_Tar_Glow002.StrawberryRebuild.dds / Strawberry_Weapon_HollowRadiance_OutlineR.StrawberryRebuild.scb | additive | -1 | 1 | (0.77, 1, 1) | (0.45, 1, 0.43, 0.15) | — |
| 3 | `HRad_BG` | mesh | common_color-hold.StrawberryRebuild.dds / Strawberry_Weapon_HollowRadiance_InteriorR.StrawberryRebuild.scb | alpha | -1 | 1 | (0.77, 1, 1) | (0.66, 0.2, 0.04, 0.3) | — |
| 4 | `HRad_Noise_1` | mesh | 3026_Items_Noise_02.StrawberryRebuild.dds / Strawberry_Weapon_HollowRadiance_FireInterior.StrawberryRebuild.scb | alpha | -1 | 1 | (0.77, 1, 1) | (1, 0.48, 0.03, 0.4) | — |
| 5 | `HRad_Noise_2` | mesh | 3026_Items_Noise_02.StrawberryRebuild.dds / Strawberry_Weapon_HollowRadiance_FireInterior.StrawberryRebuild.scb | additive | -1 | 1 | (0.77, 1, 1) | (0.02, 1, 0, 0.25) | — |

### `HollowRadiance_AoeCircle_Child`（0 层，仅作子系统容器或空壳）

### `HollowRadiance_AoeCircle_Evolve`

来源 `Maps/Shipping/Map33/Particles/Weapons/HollowRadiance_AoeCircle_Evolve` · SHA-256 `48d93aaff3529966…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `HRad_Dots` | quad | Jinx_Skin38_Glow3.StrawberryRebuild.dds | additive | -1 | 1 | (190, 150, 50) | (1, 0.69, 0.38, 0.2) | — |
| 1 | `HRad_Ring_Blend` | mesh | Strawberry_Yasuo_R_Tar_Glow002.StrawberryRebuild.dds / Strawberry_Weapon_HollowRadiance_OutlineR.StrawberryRebuild.scb | alpha | -1 | 1 | (0.77, 1, 1) | (1, 0.85, 0.24, 0.4) | — |
| 2 | `HRad_Ring_Add` | mesh | Strawberry_Yasuo_R_Tar_Glow002.StrawberryRebuild.dds / Strawberry_Weapon_HollowRadiance_OutlineR.StrawberryRebuild.scb | additive | -1 | 2 | (0.77, 1, 1) | (1, 0.48, 0.22, 0.5) | — |
| 3 | `HRad_BG` | mesh | common_color-hold.StrawberryRebuild.dds / Strawberry_Weapon_HollowRadiance_InteriorR.StrawberryRebuild.scb | alpha | -1 | 1 | (0.77, 1, 1) | (0.66, 0.2, 0.04, 0.5) | — |
| 4 | `HRad_Noise_1` | mesh | 3026_Items_Noise_02.StrawberryRebuild.dds / Strawberry_Weapon_HollowRadiance_FireInterior.StrawberryRebuild.scb | alpha | -1 | 1 | (0.77, 1, 1) | (1, 0.12, 0.85, 0.5) | — |
| 5 | `HRad_Noise_2` | mesh | 3026_Items_Noise_02.StrawberryRebuild.dds / Strawberry_Weapon_HollowRadiance_FireInterior.StrawberryRebuild.scb | additive | -1 | 1 | (0.77, 1, 1) | (1, 0.69, 0.07, 0.5) | — |
| 6 | `HRad_Dots1` | quad | Jinx_Skin38_Glow3.StrawberryRebuild.dds | additive | -1 | 1 | (215, 150, 50) | (1, 0.42, 0.04, 0.25) | — |
| 7 | `HRad_Center_BG` | quad | Jinx_Skin40_Cat_Faces.StrawberryRebuild.dds | alpha | -1 | 1 | (50, 1, 1) | (0.47, 0.36, 0.31, 0.5) | — |
| 8 | `HRad_Center_Holo` | quad | Jinx_Skin40_Cat_Faces.StrawberryRebuild.dds | additive | -1 | 1 | (52, 1, 1) | (0.92, 0.44, 0.16, 0.25) | — |

### `StatikkShiv_Beam`

来源 `Maps/Shipping/Map33/Particles/Weapons/StatikkShiv_Beam` · SHA-256 `5e2d1e75fbf2d997…` · 系统名出现在 game.ts

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Weapon_StatikkShiv_LightningBase` | beam | SRU_Dragon_Hextech_Base_LightningWave_Sheet.dds | additive | 0.4 | 10 | (7, 1, 1) 曲线2点 随机 |  曲线1点 随机 | — |
| 1 | `Weapon_StatikkShiv_Flash_Small` | beam | Kennen_Base_W_Glow_Beam.StrawberryRebuild.dds | additive | 0.1 | 1 | (3, 1, 1) 曲线1点 随机 | (1, 1, 1, 0.1) | — |
| 2 | `Weapon_StatikkShiv_Flash_Big` | beam | Kennen_Base_W_Glow_Beam.StrawberryRebuild.dds | alpha | 0.4 | 1 | (5, 1, 1) 曲线1点 随机 |  | — |

### `StatikkShiv_Beam_Evo`

来源 `Maps/Shipping/Map33/Particles/Weapons/StatikkShiv_Beam_Evo` · SHA-256 `702356e5f4c380ba…` · 系统名出现在 game.ts

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Weapon_StatikkShiv_LightningBase` | beam | SRU_Dragon_Hextech_Base_LightningWave_Sheet.dds | additive | 0.2 曲线1点 随机 | 15 | (5, 1, 1) 曲线1点 随机 | (0.94, 0.95, 0.96, 1) | — |
| 1 | `Weapon_StatikkShiv_Flash_Big` | beam | Kennen_Base_W_Glow_Beam.StrawberryRebuild.dds | alpha | 0.4 | 1 | (9, 1, 1) 曲线1点 随机 | (1, 0.482, 0.225, 0.302) | — |
| 2 | `Weapon_StatikkShiv_Flash_Big1` | beam | Kennen_Base_W_Glow_Beam.StrawberryRebuild.dds | alpha | 0.6 | 1 | (25, 1, 1) 曲线1点 随机 | (0.32, 0.36, 0.51, 0.4) | — |

### `StatikkShiv_Impact`

来源 `Maps/Shipping/Map33/Particles/Weapons/StatikkShiv_Impact` · SHA-256 `16f3dac2350f60c0…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Weapon_StatikkShiv_flash` | billboard | Volibear_Base_sparkMote.Shiv_Particles.dds | additive | 0.1 曲线1点 随机 | 25 | (150, 100, 100) 曲线1点 随机 | (0.173, 0.483, 0.974, 1) | — |
| 1 | `Weapon_StatikkShiv_Shockwave` | billboard | Zeri_Base_R_RainbowGlow.Shiv_Particles.dds | additive | 0.3 | 1 曲线1点 随机 | (20, 1, 1) | (0.139, 0.865, 0.985, 0.651) | — |
| 2 | `Weapon_StatikkShiv_shineRing` | billboard | Strawberry_AnimeStar.StrawberryRebuild.tex | alpha | 0.2 | 2 | (150, 1, 1) | (0.985, 0.985, 0.985, 0.749) | — |

### `StatikkShiv_Impact_Evo`

来源 `Maps/Shipping/Map33/Particles/Weapons/StatikkShiv_Impact_Evo` · SHA-256 `353e208c38a67c0b…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Weapon_StatikkShiv_flash` | billboard | Volibear_Base_sparkMote.Shiv_Particles.dds | additive | 0.1 曲线1点 随机 | 25 | (150, 100, 100) 曲线1点 随机 | (0.173, 0.483, 0.974, 1) | — |
| 1 | `Weapon_StatikkShiv_Shockwave` | billboard | Zeri_Base_R_RainbowGlow.Shiv_Particles.dds | additive | 0.3 | 1 曲线1点 随机 | (20, 1, 1) | (0.985, 0.527, 0.139, 0.651) | — |
| 2 | `Weapon_StatikkShiv_shineRing` | billboard | Strawberry_AnimeStar.StrawberryRebuild.tex | alpha | 0.2 | 2 | (150, 1, 1) | (0.528, 0.818, 0.946, 0.4) | — |

### `Strawberry_PierceShot_Mis`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_PierceShot_Mis` · SHA-256 `e175b5e86f33fa58…` · 引用技能：Augment_Weapon_PierceShotMis

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Weapon_Pierceshot_Head` | mesh | Strawberry_Weapon_FanOfKnives_Bolt_New.StrawberryRebuild.tex / Strawberry_Weapon_PiercingShot_Spin_Bolt.StrawberryRebuild.scb | alpha |  | 1 曲线1点 随机 |  | (0.88, 0.71, 0.98, 0.35) | — |
| 1 | `Weapon_Pierceshot_Head_Glow` | quad | Skin63_Glow.StrawberryRebuild.dds | additive | 10 | 1 | (125, 125, 0) | (0.04, 0.54, 1, 0.15) | — |
| 2 | `Weapon_Pierceshot_Head_Support` | mesh | Base_trail2.StrawberryRebuild.tex / Strawberry_Weapon_PiercingShot_Bolt_AnimeShapes.StrawberryRebuild.scb | alpha | 0.5 | 5 |  | (0.16, 0.91, 0.91, 0.5) | — |
| 3 | `Weapon_Pierceshot_Swirl_L` | quad |  | alpha |  | 1 曲线1点 随机 |  | (0.879, 0.709, 0.98, 1) | — |
| 4 | `Weapon_Pierceshot_Swirl_R` | quad |  | alpha |  | 1 曲线1点 随机 |  | (0.879, 0.709, 0.98, 1) | — |

### `Strawberry_PierceShot_Mis_Trail`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_PierceShot_Mis_Trail` · SHA-256 `71d74e420dfcc3f1…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Weapon_Pierceshot_Ribbon` | arbitraryTrail | Base_Trail_01.StrawberryRebuild.dds | additive | 0.5 | 25 | (40, 50, 50) | (0.06, 0.94, 0.93, 0.4) 曲线4点 | — |

### `Strawberry_Pierceshot_MisEvolve`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Pierceshot_MisEvolve` · SHA-256 `f5d3c6e1bebd629e…` · 引用技能：Augment_Weapon_PierceShotMisEvolve

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Weapon_Pierceshot_Evo_Head` | mesh | Strawberry_Weapon_FanOfKnives_Bolt.StrawberryRebuild.tex / Strawberry_Weapon_PiercingShot_Bolt_Evo.StrawberryRebuild.scb | alpha | 2 | 1 |  | (0.78, 0.82, 0.89, 0.65) | — |
| 1 | `Weapon_Pierceshot_Evo_Head_Glow` | quad | Skin63_Glow.StrawberryRebuild.dds | additive | 10 | 1 | (50, 100, 0) | (0.36, 0.9, 0.98, 0.1) | — |
| 2 | `Weapon_Pierceshot_Evo_Ribbon_Soft` | arbitraryTrail | Caitlyn_Base_WispLayerTrail.StrawberryRebuild.dds | additive | 0.3 | 50 | (30, 1, 1) | (1, 1, 1, 0.5) 曲线4点 | — |
| 3 | `Weapon_Pierceshot_Evo_Head_Cool_Shape` | ray | Caitlyn_Base_Q_FlameHead.StrawberryRebuild.dds | additive | 6 | 1 | (100, 200, 0) | (1, 1, 1, 0.3) | — |

### `Strawberry_RapidShot_Mis_Pink`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_RapidShot_Mis_Pink` · SHA-256 `4aac7e05a18fb6a9…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `leadHemi` | mesh | Morgana_Skin50_Q_Fire_Trail_Up.StrawberryRebuild.dds / Morgana_Skin50_Q_mis_energyflame.StrawberryRebuild.scb | additive | 100 | 1 | (0.6, 1.5, 0.6) 曲线1点 随机 | (1, 0.56, 0.83, 0.4) | — |
| 1 | `Trail` | arbitraryTrail | Lulu_Skin06_BA_Trail_01.StrawberryRebuild.dds | additive | 0.2 | 40 | (20, 0, 0) | (1, 1, 1, 0.5) 曲线4点 | — |
| 2 | `Trail1` | arbitraryTrail | Lulu_Skin06_BA_Trail_01.StrawberryRebuild.dds | alpha | 0.25 | 40 | (30, 0, 0) | (1, 1, 1, 0.5) 曲线4点 | — |
| 3 | `StarTip_add` | billboard | Lulu_Skin06_Z_StarGrid_01.StrawberryRebuild.dds | additive | -1 | 1 | (30, 65, 1) | (1, 1, 1, 0.5) | — |
| 4 | `Glow` | quad | Lulu_Skin06_ball32_02.StrawberryRebuild.dds | alpha | -1 | 1 | (40, 100, 1) | (1, 1, 1, 0.15) | — |
| 5 | `SmallStarTrail` | billboard | Lulu_Skin06_Z_StarGrid_01.StrawberryRebuild.dds | additive | 0.275 曲线1点 随机 | 35 曲线1点 随机 | (25, 1, 1) 曲线1点 随机 |  曲线1点 随机 | — |
| 6 | `Glow1` | quad | Lulu_Skin06_ball32_02.StrawberryRebuild.dds | alpha | -1 | 1 | (75, 120, 1) | (1, 1, 1, 0.25) | — |

### `Strawberry_RapidShot_Mis_Pink_Evolve`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_RapidShot_Mis_Pink_Evolve` · SHA-256 `fbcd8a1010b9fd71…` · 引用技能：Augment_Weapon_RapidShot_EvolveMis

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `leadHemi` | mesh | Morgana_Skin50_Q_Fire_Trail_Up.StrawberryRebuild.dds / Morgana_Skin50_Q_mis_energyflame.StrawberryRebuild.scb | additive | 100 | 1 | (0.75, 3.5, 0.75) 曲线1点 随机 | (1, 1, 1, 0.45) 曲线1点 随机 | — |
| 1 | `Trail` | arbitraryTrail | Lulu_Skin06_BA_Trail_01.StrawberryRebuild.dds | additive | 0.2 | 40 | (15, 0, 0) | (1, 1, 1, 0.6) 曲线4点 | — |
| 2 | `Trail1` | arbitraryTrail | Lulu_Skin06_BA_Trail_01.StrawberryRebuild.dds | alpha | 0.25 | 40 | (20, 0, 0) |  曲线4点 | — |
| 3 | `StarTip_alpha` | billboard | Lulu_Skin06_Z_GlowGrid_02.StrawberryRebuild.dds | alpha | -1 | 1 | (80, 75, 1) | (0.33, 0.62, 1, 0.6) | — |
| 4 | `StarTip_add` | billboard | Lulu_Skin06_Z_StarGrid_01.StrawberryRebuild.dds | additive | -1 | 1 | (30, 65, 1) | (1, 1, 1, 0.6) | — |
| 5 | `Glow` | quad | Lulu_Skin06_ball32_02.StrawberryRebuild.dds | alpha | -1 | 1 | (75, 160, 1) | (1, 1, 1, 0.3) 曲线1点 随机 | — |
| 6 | `Swirl_Thin` | mesh | Lulu_Skin06_Z_Twirl_01.StrawberryRebuild.dds / Lulu_Skin06_Z_Twirl_01.StrawberryRebuild.scb | additive | 0.2 曲线1点 随机 | 3 | (5, 5, 15) | (1, 1, 1, 0.3) | — |
| 7 | `SmallStarTrail` | billboard | Lulu_Skin06_Z_StarGrid_01.StrawberryRebuild.dds | additive | 0.275 曲线1点 随机 | 8 曲线1点 随机 | (35, 1, 1) 曲线1点 随机 | (1, 1, 1, 0.5) 曲线1点 随机 | — |

### `Strawberry_Weapon_Boomerang_Base_Q_tar`（0 层，仅作子系统容器或空壳）

### `Strawberry_Weapon_Boomerang_Base_Q_tar_02`（0 层，仅作子系统容器或空壳）

### `Strawberry_Weapon_Boomerang_Mis_02`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Boomerang_Mis_02` · SHA-256 `e74a834b6abde1f2…` · 引用技能：Augment_Weapon_BoomerangReturnMissile

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `BMRG_Core` | quad | Strawberry_Weapon_Boomerangv2_Mis.StrawberryRebuild.tex | alpha |  | 1 | (85, 85, 85) | (1, 1, 1, 0.5) | — |
| 1 | `BMRG_Shadow` | quad | Sivir_Base_Q_Mis_Shadow.StrawberryRebuild.dds | alpha |  | 1 | (100, 90, 90) | (1, 1, 1, 0.1) | — |

### `Strawberry_Weapon_Boomerang_Missile`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Boomerang_Missile` · SHA-256 `4d5bcc645d807f48…` · 引用技能：Augment_Weapon_BoomerangMissile

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Boomerang` | quad | Strawberry_Weapon_Boomerangv2_Mis.StrawberryRebuild.tex | alpha |  | 1 | (85, 85, 85) | (1, 1, 1, 0.5) | — |
| 1 | `Shadow` | quad | Sivir_Base_Q_Mis_Shadow.StrawberryRebuild.dds | alpha |  | 1 | (100, 90, 90) | (1, 1, 1, 0.1) | — |

### `Strawberry_Weapon_FrostNova`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_FrostNova` · SHA-256 `4ff6b821ba17f0df…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Wind` | mesh | Augment_Frostwraith_Tile01.StrawberryRebuild.dds / Augment_Frostwraith_RoundMesh.StrawberryRebuild.scb | alpha | 1.5 | 1 | (2.45, 1.5, 2.45) | (1, 1, 1, 0.72) | — |
| 1 | `AABasic` | quad | Augment_Frostwraith_CrackDecal.StrawberryRebuild.tex | additive | 1.75 | 1 | (550, 700, 700) | (1, 1, 1, 0.6) | weapon_vfx.ts |
| 2 | `shards` | quad | Augment_Frostwraith_Shards.StrawberryRebuild.dds | additive | 0.6 曲线1点 随机 | 40 曲线1点 随机 | (40, 40, 40) 曲线1点 随机 |  | — |
| 3 | `SparksBurst` | billboard | Augment_Frostwraith_Crystals.StrawberryRebuild.dds | default | 0.6 曲线1点 随机 | 8 | (50, 150, 0) 曲线1点 随机 |  | — |
| 4 | `Praxis1` | mesh | Augment_Frostwraith_Nova_Praxis.StrawberryRebuild.dds / Augment_Frostwraith_Praxis.StrawberryRebuild.scb | additive | 0.4 曲线1点 随机 | 2 | (2.4, 1.5, 1.3) | (0.265, 0.617, 0.835, 1) | — |
| 5 | `Dust` | billboard | Augment_Frostwraith_FlatShards.StrawberryRebuild.dds | additive | 2.4 曲线1点 随机 | 60 | (4, 150, 0) 曲线1点 随机 |  | — |
| 6 | `heal_spark` | billboard | Augment_Frostwraith_VGU_IceShards.StrawberryRebuild.dds | alpha | 0.5 曲线1点 随机 | 10 | (5, 25, 1) 曲线1点 随机 |  | — |
| 7 | `heal_spark1` | billboard | Augment_Frostwraith_VGU_IceShards.StrawberryRebuild.dds | alpha | 0.5 曲线1点 随机 | 10 | (5, 25, 1) 曲线1点 随机 | (0.45, 0.58, 0.77, 0.64) | — |
| 8 | `FNova_Base_TechEdge` | mesh | Strawberry_Augment_FrostNova_TileEdge.StrawberryRebuild.tex / Strawberry_Yasuo_Base_Q_Ring01.StrawberryRebuild.scb | additive | 1.5 | 3 | (130, 5.5, 5.5) | (0.536, 0.881, 0.894, 1) | — |
| 9 | `FNova_Base_Tech` | quad | Base_Mis_AlphaCircleGradient.StrawberryRebuild.dds | additive | 1.5 | 1 | (500, 460, 460) | (0.651, 0.864, 0.935, 1) | — |
| 10 | `Snow_Center1` | billboard | Augment_Frostwraith_Smoke.StrawberryRebuild.dds | additive | 1.2 曲线1点 随机 | 5 | (115, 1, 1) | (1, 1, 1, 0.57) 曲线1点 随机 | — |
| 11 | `FNova_Base_Dots` | quad | Jinx_Skin38_Glow3.StrawberryRebuild.dds | additive | 1.5 | 1 | (500, 150, 50) | (0.59, 0.92, 0.93, 0.1) | — |
| 12 | `black_ground2` | quad | Augment_Frostwraith_CircleGlow.StrawberryRebuild.dds | additive | 0.5 | 1 | (650, 650, 650) | (1, 1, 1, 0.44) | — |

### `Strawberry_Weapon_FrostNova_Evolve_Idle`（0 层，仅作子系统容器或空壳）

### `Strawberry_Weapon_FrostNova_Idle`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_FrostNova_Idle` · SHA-256 `dfa9ab99c9bf3da5…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Shield_Base` | mesh | Strawberry_POI_Freeze_CrystalTexture.StrawberryRebuild.tex / Strawberry_POI_Freeze_Core.StrawberryRebuild.scb | alpha | -1 | 1 | (6, 3.5, 6) | (0.62, 0.83, 0.92, 0.69) | — |
| 1 | `Shield_NoisePan` | mesh | Strawberry_POI_Freeze_CrystalTexture.StrawberryRebuild.tex / Strawberry_POI_Freeze_Core.StrawberryRebuild.scb | additive | -1 | 1 | (6, 3.5, 6) | (0.53, 1, 0.95, 0.55) | — |
| 2 | `Base_TextPAn` | mesh | Leona_Q_Decal_Scanline.StrawberryRebuild.tex / Strawberry_POI_HoloBase.StrawberryRebuild.scb | additive | -1 | 1 | (6, -3.5, 6) | (0.53, 0.94, 1, 0.37) | — |
| 3 | `PraxisNoise` | mesh | Belveth_Base_E_smokeEdge.StrawberryRebuild.dds / Belveth_Base_E_Praxis.StrawberryRebuild.scb | additive |  | 1 | (1.2, 1.5, 1.3) 曲线1点 随机 | (0.46, 0.81, 1, 1) | — |
| 4 | `Dots` | billboard | HealingStation_Glow_Ring.StrawberryRebuild.dds | additive | 1 | 2 | (100, 1, 1) | (0.67, 0.84, 0.88, 0.36) | — |

### `Strawberry_Weapon_FrostNova_Root`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_FrostNova_Root` · SHA-256 `ab92c796dcf35329…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `crystalspike` | mesh | Augment_FrostWraith_FrozenCrystal.StrawberryRebuild.dds / Augment_FrostWraith_FrozenCrystalMesh.StrawberryRebuild.scb | additive | -1 | 3 曲线1点 随机 | (120, 100, 120) | (0.35, 0.85, 0.96, 0.93) 曲线1点 随机 | — |

### `Strawberry_Weapon_HollowRadiance_Evolve`（0 层，仅作子系统容器或空壳）

### `Strawberry_Weapon_HollowRadiance_Evolve_Explosion`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_HollowRadiance_Evolve_Explosion` · SHA-256 `5d2f0453cab8ad43…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Light` | billboard | Strawberry_Yasuo_Base_Lightning_flipbook.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 1 | (100, 1, 1) 曲线1点 随机 | (1, 1, 1, 0.5) | — |
| 1 | `Swirl Particles` | billboard | Strawberry_Yasuo_Base_R_Buff_lilStar_4x2.StrawberryRebuild.dds | additive | 0.85 曲线1点 随机 | 4 | (80, 50, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 2 | `SpikeShapes` | quad | Yasuo_Skin77_Q_AnimeShapes02.StrawberryRebuild.dds | alpha | 0.23 曲线1点 随机 | 5 | (110, 70, 1) 曲线1点 随机 | (1, 1, 1, 0.5) | — |
| 3 | `Flash_Vertical1` | billboard | Strawberry_MissFortune_Skin31_BA_LensFlare.StrawberryRebuild.dds | additive | 0.2 | 1 | (50, 1, 1) | (1, 0.69, 0.376, 1) | — |
| 4 | `Mine_AoE_OuterEdge` | mesh | Strawberry_Jinx_Base_R_Praxis.StrawberryRebuild.dds / Strawberry_Jinx_Base_R_Praxis.StrawberryRebuild.scb | alpha | 0.45 | 1 | (0.8, 1, 1) 曲线1点 随机 | (1, 1, 1, 0.74) | — |
| 5 | `bloom` | billboard | Aatrox_Skin33_R_Aura_Self2.StrawberryRebuild.dds | additive | 0.3 | 1 | (200, 1, 1) | (0.9, 0.44, 0.11, 0.65) | — |
| 6 | `lingerShockwave` | billboard | Illaoi_Skin18_R_cas_ground.StrawberryRebuild.dds | alpha | 0.65 | 1 | (200, 1, 1) | (0.66, 0.07, 0.2, 0.5) | — |

### `Strawberry_Weapon_Mine_aoe_green`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Mine_aoe_green` · SHA-256 `4239717ddcb7a964…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Mine_Tell_Ring` | mesh | Ziggs_Base_R_Ring_Indicator_V2.StrawberryRebuild.dds / Ziggs_Base_R_landingZone_green.StrawberryRebuild.scb | alpha | 5 | 1 | (8.5, 20, 20) | (0, 0.77, 1, 0.15) | — |
| 1 | `Mine_Tell_Dots` | quad | Strawberry_Jinx_Base_Passive_GlowRing.StrawberryRebuild.dds | alpha | 1 | 1.5 | (95, 460, 460) | (1, 1, 1, 0.14) | — |

### `Strawberry_Weapon_Mine_aoe_red`（0 层，仅作子系统容器或空壳）

### `Strawberry_Weapon_Mine_Evolve_Mis`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Mine_Evolve_Mis` · SHA-256 `20a9bba80d114fbc…` · 引用技能：Augment_Weapon_Mine_Evolve_Missile

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Mine_Evolve_Mis` | mesh | Strawberry_Weapon_Mine_Evolve.StrawberryRebuild.tex / Ziggs_Satchel.StrawberryRebuild.sco | alpha |  | 1 | (190, 190, 190) |  | — |
| 1 | `Mine_Evolve_Mis_Glow` | billboard | Yasuo_Skin77_Glow2.StrawberryRebuild.dds | additive | 2 | 1 | (100, 10, 0) | (0.985, 0.603, 0.204, 0.58) | — |

### `Strawberry_Weapon_Mine_Evolve_MisChild`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Mine_Evolve_MisChild` · SHA-256 `310022a90393d980…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Mine_Evolve_Mis_Flare_Child` | billboard | Corki_Base_BA_Flash.StrawberryRebuild.dds | default | 0.4 | 10 | (40, 1, 1) 曲线1点 随机 |  | — |
| 1 | `Mine_Evolve_Mis_Trail_Child` | cameraTrail | HealingStation__Infernal_Smoke_Trail.StrawberryRebuild.dds | additive | 0.4 | 10 | (30, 1, 1) |  曲线3点 | — |

### `Strawberry_Weapon_Mine_hit`（0 层，仅作子系统容器或空壳）

### `Strawberry_Weapon_Mine_mis`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Mine_mis` · SHA-256 `18606bde9841ee68…` · 引用技能：Augment_Weapon_Mine, Augment_Weapon_Mine_Wrapper

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Mine_Mis_Model` | mesh | Strawberry_Weapon_Mine.StrawberryRebuild.tex / Ziggs_Satchel.StrawberryRebuild.sco | mode3 | 0.5 | 1 | (190, 190, 190) |  | — |
| 1 | `Mine_Mis_Trail` | arbitraryTrail | NeonLotus_Trail.StrawberryRebuild.dds | additive | 0.2 | 10 | (90, 1, 1) |  | — |

### `Strawberry_Weapon_Mine_tar`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Mine_tar` · SHA-256 `32ef70329489b236…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Mine_AoE_Flare` | quad | common_FB_explosion_centerFlare.StrawberryRebuild.dds | alpha | 0.25 | 1 | (600, 270, 0) | (1, 0.824, 0.412, 1) | — |
| 1 | `Mine_AoE_OuterEdge` | mesh | Strawberry_Jinx_Base_R_Praxis.StrawberryRebuild.dds / Strawberry_Jinx_Base_R_Praxis.StrawberryRebuild.scb | additive | 0.45 | 1 | (2, 1.25, 1) | (1, 1, 1, 0.4) | — |
| 2 | `Mine_AoE_Pixels` | billboard | Strawberry_Jinx_Base_Pixel.StrawberryRebuild.dds | additive | 0.65 曲线1点 随机 | 5 | (25, 0.75, 0.75) 曲线1点 随机 |  | — |
| 3 | `Mine_AoE_Dots` | billboard | Strawberry_Yasuo_Base_ball32_02.StrawberryRebuild.dds | additive | 0.3 | 1 | (200, 350, 0) | (1, 1, 1, 0.47) | — |
| 4 | `Mine_AoE_Splash` | billboard | Strawberry_Yasuo_Base_R_ImpactT.StrawberryRebuild.dds | alpha | 0.3 | 2.5 | (40, 53, 0) 曲线1点 随机 | (0.169, 0.122, 0.239, 1) | — |
| 5 | `flash` | billboard | Strawberry_Yasuo_Base_Glow3.StrawberryRebuild.dds | additive | 0.2 | 1 | (180, 180, 180) 曲线1点 随机 |  | — |
| 6 | `Swirl Particles` | billboard | Strawberry_Yasuo_Base_R_Buff_lilStar_4x2.StrawberryRebuild.dds | additive | 0.85 曲线1点 随机 | 5 | (80, 50, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 7 | `SpikeErode` | ray | Strawberry_Yasuo_Base_R_AnimeShapes02.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 5 | (55, 200, 1) |  | — |
| 8 | `blood_splash1` | billboard | Strawberry_Yasuo_Base_SpeedImpact.StrawberryRebuild.dds | alpha | 0.3 | 1 | (30, 53, 0) 曲线1点 随机 | (0.169, 0.122, 0.239, 1) | — |
| 9 | `vert5` | billboard | Strawberry_Yasuo_R_windstrike_glow004_2.StrawberryRebuild.dds | additive | 0.2 | 4 | (90, 350, 0) | (1, 1, 1, 0.88) | — |
| 10 | `SpikeErode1` | ray | Strawberry_Yasuo_Base_R_AnimeShapes02.StrawberryRebuild.dds | additive | 0.3 曲线1点 随机 | 6 | (55, 200, 1) |  | — |
| 11 | `splash` | billboard | Strawberry_Yasuo_Base_R_Color_Shapes01.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 4 | (40, 4, 0) 曲线1点 随机 |  | — |
| 12 | `Mine_AoE_StarFlare` | quad | Smolder_Base_SheenStar.StrawberryRebuild.dds | additive | 0.25 | 1 | (600, 270, 0) | (1, 0.824, 0.412, 1) | — |

### `Strawberry_Weapon_Starstrike_Evolve_Target`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Starstrike_Evolve_Target` · SHA-256 `651afae886efdea5…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `StarS_BG` | quad | Strawberry_Weapon_Starstrike_Decal_Perf.StrawberryRebuild.tex | alpha | 1.1 | 1 | (90, 90, 0) | (1, 1, 1, 0.4) | — |
| 1 | `StarS_Outline` | quad | Strawberry_Weapon_Starstrike_Decal_Outline_Perf.StrawberryRebuild.tex | alpha | 1.1 | 1 | (90, 90, 1) | (1, 1, 1, 0.4) | — |
| 2 | `BG` | quad | Strawberry_Weapon_Starstrike_Deca_XTarget.StrawberryRebuild.tex | additive | 1.1 | 1 | (50, 1, 1) | (0.14, 0.86, 0.77, 0.4) | — |
| 3 | `Laser_` | ray | AurelionSol_Base_R_GroundTrail_color-bellcurve.StrawberryRebuild.dds | additive | 1 | 1 | (25, 900, 0) | (1, 1, 1, 0.25) | — |

### `Strawberry_Weapon_Starstrike_Evolve_Target_Main`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_Starstrike_Evolve_Target_Main` · SHA-256 `27cd2764233d3d7b…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `StarS_BG` | quad | Strawberry_Weapon_Starstrike_Decal_Perf.StrawberryRebuild.tex | alpha | 1.1 | 1 | (90, 90, 0) |  | — |
| 1 | `StarS_Outline` | quad | Strawberry_Weapon_Starstrike_Decal_Outline_Perf.StrawberryRebuild.tex | alpha | 1.1 | 1 | (90, 90, 1) |  | — |
| 2 | `BG` | quad | Strawberry_Weapon_Starstrike_Deca_XTarget.StrawberryRebuild.tex | additive | 1.1 | 1 | (50, 1, 1) | (0.14, 0.86, 0.77, 1) | — |
| 3 | `Laser_` | ray | AurelionSol_Base_R_GroundTrail_color-bellcurve.StrawberryRebuild.dds | additive | 1 | 1 | (25, 900, 0) |  | — |

### `Strawberry_Weapon_StarStrike_Karthus_Explosion`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_StarStrike_Karthus_Explosion` · SHA-256 `d2c6892f9e39c5f0…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `StarS_Bits` | billboard | Sylas_Skin24_Shapes01.StrawberryRebuild.dds | additive | 0.7 曲线1点 随机 | 5 | (55, 100, 0) 曲线1点 随机 |  | — |
| 1 | `StarS_SkyBeam_Center` | ray | Strawberry_Leona_Skin10_Beam_2.StrawberryRebuild.dds | additive | 0.3 | 3 | (200, 1.28e+03, 1) | (1, 0.88, 0.58, 1) 曲线1点 随机 | — |
| 2 | `StarS_SkyBeam` | ray | Augment_OrbitalLaser_Laser_CoreHardEdge.StrawberryRebuild.tex | alpha | 0.5 | 1 | (350, 1.3e+03, 0) 曲线1点 随机 | (1, 1, 1, 0.95) 曲线1点 随机 | — |
| 3 | `StarS_EarthGround_LightRim` | quad | Cracks_Light.StrawberryRebuild.dds | additive | 0.7 | 1 | (300, -300, 300) | (1, 1, 1, 0.5) | — |
| 4 | `StarS_EarthGround` | quad | Base_Revive_ground_crack.StrawberryRebuild.dds | alpha | 1 | 1 | (300, -300, 300) | (0.78, 0.78, 0.78, 0.8) | — |
| 5 | `StarS_GroundFlare` | quad | Leona_Skin53_LensFlare.StrawberryRebuild.dds | additive | 0.3 | 2 | (450, 760, 0.5) | (1, 0.98, 1, 1) | — |
| 6 | `StarS_GroundSwirl` | mesh | Strawberry_Leona_Base_ErosionSphere02.StrawberryRebuild.dds / Sylas_Skin24_AnimeBurstMesh02.StrawberryRebuild.scb | additive | 0.5 曲线1点 随机 | 1 | (2.4, 1, 2.75) |  曲线1点 随机 | — |
| 7 | `StarS_Ground_Inner` | mesh | Strawberry_POI_MapD_Turret_Base_Smoke_Trail.StrawberryRebuild.dds / Strawberry_StarStrike_Light_Inside.StrawberryRebuild.scb | additive | 0.5 曲线1点 随机 | 1 | (13, 15, 13) 曲线1点 随机 | (0.09, 0.92, 0.95, 1) | — |
| 8 | `StarS_SkyBeam_VertBits` | ray | Strawberry_Leona_Skin10_Beam_2.StrawberryRebuild.dds | additive | 0.15 | 12 | (100, 1.28e+03, 1) 曲线1点 随机 | (1, 0.88, 0.58, 0.58) | — |

### `Strawberry_Weapon_StarStrike_Karthus_Target`

来源 `Maps/Shipping/Map33/Particles/Weapons/Strawberry_Weapon_StarStrike_Karthus_Target` · SHA-256 `68ddf1b665f6e5da…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `StarS_BG1` | quad | Strawberry_Weapon_Starstrike_Decal_Perf.StrawberryRebuild.tex | alpha | 1.1 | 1 | (90, 90, 0) |  | — |
| 1 | `StarS_Outline1` | quad | Strawberry_Weapon_Starstrike_Decal_Outline_Perf.StrawberryRebuild.tex | alpha | 1.1 | 1 | (90, 90, 1) |  | — |
| 2 | `BG4` | quad | Strawberry_Weapon_Starstrike_Deca_XTarget.StrawberryRebuild.tex | additive | 1.1 | 1 | (50, 1, 1) | (0.14, 0.86, 0.77, 1) | — |
| 3 | `Laser_1` | ray | AurelionSol_Base_R_GroundTrail_color-bellcurve.StrawberryRebuild.dds | additive | 1 | 1 | (25, 900, 0) |  | — |

## jinx

### `Strawberry_Jinx_Base_Idle_Minigun_Cas`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Idle_Minigun_Cas` · SHA-256 `9d541d97a49d67d2…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `End_Barrel Flash` | billboard | Aura_Self.StrawberryRebuild.DDS | additive | 0.15 | 3 | (23, 150, 150) |  | — |
| 1 | `End_Dark Barrel Flash` | billboard | Aura_Self.StrawberryRebuild.DDS | alpha | 0.15 | 3 | (25, 150, 150) |  | — |
| 2 | `Start_Barrel Flash1` | billboard | Aura_Self.StrawberryRebuild.DDS | additive | 0.15 | 5 | (17, 150, 150) |  | — |
| 3 | `Start_Dark Barrel Flash1` | billboard | Aura_Self.StrawberryRebuild.DDS | alpha | 0.15 | 5 | (19, 150, 150) |  | — |

### `Strawberry_Jinx_Base_Passive_Buff`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Passive_Buff` · SHA-256 `1899a308ae3a9fda…` · 系统名出现在 jinx_vfx.ts

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Jinx_P_Streak` | ray | Strawberry_Jinx_Base_Hit_squares.StrawberryRebuild.dds | additive | 0.3 曲线1点 随机 | 15 | (5, 80, 1) 曲线1点 随机 |  | jinx_vfx.ts |
| 1 | `Jinx_P_RingGlowDot` | quad | Strawberry_Jinx_Base_Passive_GlowRing.StrawberryRebuild.dds | alpha | 1 | 1.5 | (95, 460, 460) |  | — |
| 2 | `Jinx_P_SmallGlow` | quad | Strawberry_Jinx_CatLogo_outline.StrawberryRebuild.dds | additive | 1 | 1.5 | (125, 20, 100) | (1, 1, 1, 0.65) | — |
| 3 | `Jinx_P_ScalingCatFace` | quad | Strawberry_Jinx_Cat_Logo.StrawberryRebuild.dds | additive | 1 | 1.5 | (125, 20, 100) | (1, 1, 1, 0.28) | — |
| 4 | `Jinx_P_GlowRing` | quad | Strawberry_Jinx_Base_Passive_GlowRing.StrawberryRebuild.dds | additive | 1 | 1.5 | (115, 20, 100) | (1, 1, 1, 0.62) | — |
| 5 | `Jinx_P_SpeedRing` | mesh | Strawberry_Jinx_Circle_Mis.StrawberryRebuild.dds / Strawberry_Jinx_Base_Passive_Swirl.StrawberryRebuild.scb | additive | 0.5 | 1 | (0.7, 0.7, 0.7) |  | — |
| 6 | `Jinx_P_DarkBG` | quad | Strawberry_Jinx_Base_Passive_GlowRing.StrawberryRebuild.dds | alpha | 10 | 1 | (110, 20, 100) |  | — |

### `Strawberry_Jinx_Base_Passive_Buff_OnKill`（0 层，仅作子系统容器或空壳）

### `Strawberry_Jinx_Base_Q_Minigun_Cas`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Minigun_Cas` · SHA-256 `fdd0f29a6b7b101d…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Barrel Flash` | billboard | Aura_Self.StrawberryRebuild.DDS | additive | 0.45 | 2 | (23, 150, 150) |  | — |
| 1 | `bullet_Shell` | mesh | Strawberry_Jinx_Base_Props_TX_CM.StrawberryRebuild.dds / Strawberry_Jinx_Base_Props_MD_Cat.StrawberryRebuild.scb | alpha | 0.6 曲线1点 随机 | 9 曲线1点 随机 | (0.25, 0.075, 0.075) |  | — |
| 2 | `Curved_Mesh` | mesh | Strawberry_Jinx_CatPaw.StrawberryRebuild.dds / Strawberry_Jinx_Base_VFXMeshes_02.StrawberryRebuild.scb | additive | 0.35 | 1 | (0.45, 1, 1) |  | — |
| 3 | `shockwaves` | mesh | Strawberry_Jinx_Base_R_yanwu_223.StrawberryRebuild.dds / Strawberry_Jinx_Base_sk.StrawberryRebuild.scb | additive | 0.5 | 1 | (0.75, 0.75, 4) 曲线2点 |  | — |
| 4 | `Dark Barrel Flash` | billboard | Aura_Self.StrawberryRebuild.DDS | alpha | 0.45 | 1 | (25, 150, 150) |  | — |

### `Strawberry_Jinx_Base_Q_Minigun_Mis`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Minigun_Mis` · SHA-256 `d18dd3abfd3d4f5f…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `JinxQ_Bullet_Child` | billboard | Strawberry_Jinx_Base_Glow.StrawberryRebuild.dds | additive | 0.5 | 60 | (25, 25, 1.26) 曲线1点 随机 | (0.137, 0.333, 1, 1) | — |
| 1 | `JinxQ_Cas_Bits` | billboard | Strawberry_Jinx_Base_R_Buff_lilStar_4x2.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 1.5 曲线1点 随机 | (40, 30, 1) 曲线1点 随机 |  | — |

### `Strawberry_Jinx_Base_Q_Minigun_mis_child_Cat`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Minigun_mis_child_Cat` · SHA-256 `bf34cd725f378f9f…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Back Glow` | billboard | Strawberry_Jinx_Base_Glow.StrawberryRebuild.dds | additive | 1 | 1 | (25, 25, 1.26) | (0.14, 0.86, 1, 0.82) | — |
| 1 | `trail Outlines` | arbitraryTrail | Strawberry_Jinx_Base_R_Trail02.StrawberryRebuild.dds | additive | 0.115 | 20 | (12, 0, 0) |  曲线3点 | — |
| 2 | `bullet` | quad | Strawberry_Jinx_Base_Project_Bolts.StrawberryRebuild.dds | alpha | 5 | 1 | (75, 15, 0) 曲线1点 随机 |  | — |

### `Strawberry_Jinx_Base_Q_Minigun_Mis_child_Cyan`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Minigun_Mis_child_Cyan` · SHA-256 `effcc41d6930372a…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `BurstGlow` | billboard | Aura_Self.StrawberryRebuild.DDS | alpha | 0.4 | 1 | (30, 300, 150) 曲线1点 随机 |  | — |

### `Strawberry_Jinx_Base_Q_Minigun_Mis_child_yellow`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Minigun_Mis_child_yellow` · SHA-256 `b9c3a08d3baf53dd…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `BurstGlow` | billboard | Strawberry_Jinx_Base_Glow.StrawberryRebuild.dds | additive | 0.4 | 1 | (30, 300, 150) 曲线1点 随机 |  | — |

### `Strawberry_Jinx_Base_Q_Minigun_Mis_Evo`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Minigun_Mis_Evo` · SHA-256 `1a10aa715a4cbd0f…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `JinxQ_Bullet_Child1` | billboard | Strawberry_Jinx_Base_Glow.StrawberryRebuild.dds | additive | 0.5 | 2 | (25, 25, 1.26) 曲线1点 随机 | (0.137, 0.333, 1, 1) | — |
| 1 | `JinxQ_Cas_Bits1` | billboard | Strawberry_Jinx_Base_R_Buff_lilStar_4x2.StrawberryRebuild.dds | alpha | 0.25 曲线1点 随机 | 4 曲线1点 随机 | (60, 30, 1) 曲线1点 随机 | (0.0703, 0.894, 0.951, 1) 曲线1点 随机 | — |
| 2 | `Barrel Flash` | billboard | Strawberry_Jinx_Q_Gun_Hit.StrawberryRebuild.dds | mode2 | 0.1 | 1 | (250, 150, 150) | (1, 1, 1, 0.2) | — |
| 3 | `Barrel Flash1` | billboard | Strawberry_Jinx_Q_Gun_Hit.StrawberryRebuild.dds | additive | 0.1 | 1 | (125, 150, 150) |  | — |

### `Strawberry_Jinx_Base_Q_Minigun_Mis_Evo_child`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Minigun_Mis_Evo_child` · SHA-256 `4db34182aed22882…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Back Glow` | quad | Strawberry_Jinx_Base_Glow.StrawberryRebuild.dds | additive | 1 | 1 | (120, 60, 1.26) | (1, 1, 1, 0.6) | — |
| 1 | `trail Outlines` | arbitraryTrail | Strawberry_Jinx_Base_R_Trail02.StrawberryRebuild.dds | alpha | 0.3 | 16 | (12, 0, 0) | (1, 1, 1, 0.6) 曲线4点 | — |
| 2 | `bullet` | quad | Strawberry_Jinx_Base_Project_Bolts.StrawberryRebuild.dds | mode5 | 5 | 1 | (200, 30, 0) 曲线1点 随机 | (1, 1, 1, 0.52) | — |
| 3 | `GroundGlow` | quad | Strawberry_Jinx_Base_Glow.StrawberryRebuild.dds | additive | 1 | 1 | (150, 50, 1.26) 曲线1点 随机 | (1, 1, 1, 0.22) | — |
| 4 | `head` | mesh | Base_Missile_glow1.StrawberryRebuild.tex / Strawberry_Offset_Quad_01.StrawberryRebuild.scb | additive | 2 | 1 | (14, 80, 1) 曲线1点 随机 | (0.565, 0.972, 1, 1) 曲线1点 随机 | — |

### `Strawberry_Jinx_Base_Q_Minigun_Tar`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Minigun_Tar` · SHA-256 `508a1a63d7533858…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `SolidBeams` | ray | Strawberry_Jinx_Base_R_Shapes01.StrawberryRebuild.dds | alpha | 0.25 曲线1点 随机 | 1 | (10, 20, 0) 曲线1点 随机 |  | jinx_vfx.ts |
| 1 | `Muzzle_Flash4` | billboard | Strawberry_Jinx_Rocket_Hit.StrawberryRebuild.dds | additive | 0.2 曲线1点 随机 | 1 | (65, 70, 0) 曲线1点 随机 |  | — |
| 2 | `Muzzle_Flash5` | billboard | Aura_Self.StrawberryRebuild.DDS | additive | 0.1 | 1 | (50, 50, 0) 曲线1点 随机 |  | — |
| 3 | `SolidBeams1` | ray | Strawberry_Jinx_Base_Q_Shapes02.StrawberryRebuild.dds | additive | 0.25 曲线1点 随机 | 1 | (8, 20, 0) 曲线1点 随机 |  | — |
| 4 | `LingerBoxes` | billboard | Strawberry_Jinx_Base_R_Buff_lilStar_4x2.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 1 | (40, 30, 1) 曲线1点 随机 |  | jinx_vfx.ts |

### `Strawberry_Jinx_Base_Q_Rocket_Cas`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Rocket_Cas` · SHA-256 `dcaf765849a9ea56…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `MuzzleFlash` | quad | Strawberry_Jinx_Muzzle_Flash.StrawberryRebuild.dds | additive | 0.15 曲线1点 随机 | 5 | (35, 25, 0) |  | — |
| 1 | `Dark Smoke` | billboard | Strawberry_Jinx_Base_Particles_1_9.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 4 | (25, 0, 0) 曲线1点 随机 | (1, 1, 1, 0.72) 曲线1点 随机 | jinx_vfx.ts |
| 2 | `Add Smoke` | billboard | Strawberry_Jinx_Base_Particles_1_9.StrawberryRebuild.dds | additive | 0.65 曲线1点 随机 | 2 | (35, 0, 0) 曲线1点 随机 | (1, 1, 1, 0.72) 曲线1点 随机 | jinx_vfx.ts |
| 3 | `Flash` | billboard | Aura_Self.StrawberryRebuild.DDS | additive | 0.15 | 1 | (100, 200, 200) |  | — |
| 4 | `shockwaves1` | mesh | Strawberry_Jinx_Base_R_yanwu_223.StrawberryRebuild.dds / Strawberry_Jinx_Base_sk.StrawberryRebuild.scb | additive | 0.5 | 1 | (0.75, 0.75, 4) 曲线2点 |  | — |

### `Strawberry_Jinx_Base_Q_Rocket_Cas_Idle`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Rocket_Cas_Idle` · SHA-256 `744bfef4cff9b492…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Dark Smoke` | billboard | Strawberry_Jinx_Base_Particles_1_9.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 2 | (20, 0, 0) 曲线1点 随机 | (1, 1, 1, 0.72) 曲线1点 随机 | jinx_vfx.ts |
| 1 | `Add Smoke` | billboard | Strawberry_Jinx_Base_Particles_1_9.StrawberryRebuild.dds | additive | 0.65 曲线1点 随机 | 1 | (20, 0, 0) 曲线1点 随机 | (1, 1, 1, 0.72) 曲线1点 随机 | jinx_vfx.ts |

### `Strawberry_Jinx_Base_Q_Rocket_Crit_Mis`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Rocket_Crit_Mis` · SHA-256 `871cfe003ed9a6cb…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Mis_ Child_Cat_blue` | billboard | Strawberry_Jinx_Base_Glow.StrawberryRebuild.dds | alpha | 2 | 1 | (10, 10, 0) | (1, 1, 1, 0) | — |
| 1 | `LingerBoxes1` | billboard | Strawberry_Jinx_Base_R_Buff_lilStar_4x2.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 4 曲线1点 随机 | (40, 30, 1) 曲线1点 随机 |  | — |
| 2 | `Right` | quad | Strawberry_Jinx_Base_GroundSmoke02.StrawberryRebuild.dds | alpha | 0.4 | 10 | (100, 150, 0) 曲线1点 随机 | (1, 0.969, 0.922, 0.502) | jinx_vfx.ts |
| 3 | `Left` | quad | Strawberry_Jinx_Base_GroundSmoke02.StrawberryRebuild.dds | alpha | 0.4 | 10 | (100, 150, 0) 曲线1点 随机 | (1, 0.941, 0.89, 0.51) | jinx_vfx.ts |

### `Strawberry_Jinx_Base_Q_Rocket_GroundAOE`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Rocket_GroundAOE` · SHA-256 `7c7968d71bbc5044…` · 系统名出现在 jinx_vfx.ts

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Jinx_E_FloorFlash` | quad | Aura_Self.StrawberryRebuild.DDS | additive | 0.2 | 1 | (450, 450, 0) |  | jinx_vfx.ts |
| 1 | `Jinx_E_Crater` | mesh | Strawberry_Jinx_Base_Crater_01.StrawberryRebuild.dds / Strawberry_Jinx_Base_Crater_01.StrawberryRebuild.scb | alpha | 1.25 | 1 | (7, 5, 3.4) | (0.82, 0.76, 0.73, 0.34) | jinx_vfx.ts |
| 2 | `Jinx_E_SandBrust` | quad | Strawberry_Jinx_Base_SandStreaks.StrawberryRebuild.dds | alpha | 0.75 曲线1点 随机 | 12 曲线1点 随机 | (-120, 160, 0) 曲线1点 随机 | (1, 1, 1, 0.96) | jinx_vfx.ts |
| 3 | `Jinx_E_RingOut` | mesh | Strawberry_Jinx_Base_E_Praxis.StrawberryRebuild.dds / Strawberry_Jinx_Base_Q_Praxis.StrawberryRebuild.scb | additive | 0.45 | 3 | (3.25, 1.25, 1) | (1, 1, 1, 0.4) | jinx_vfx.ts |
| 4 | `Jinx_E_Swirls` | mesh | Strawberry_Jinx_Base_E_ErosionSphere02.StrawberryRebuild.dds / Strawberry_Jinx_Base_Q_AnimeBurstMesh02.StrawberryRebuild.scb | additive | 0.35 | 1 | (4, 2.75, 2.75) |  | jinx_vfx.ts |
| 5 | `Jinx_E_PixelHit` | billboard | Strawberry_Jinx_Base_Pixel.StrawberryRebuild.dds | additive | 0.65 曲线1点 随机 | 8 曲线1点 随机 | (30, 0.75, 0.75) 曲线1点 随机 |  | jinx_vfx.ts |

### `Strawberry_Jinx_Base_Q_Rocket_mis_child_Cat`（0 层，仅作子系统容器或空壳）

### `Strawberry_Jinx_Base_Q_Rocket_mis_child_Cat_CRIT`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_Q_Rocket_mis_child_Cat_CRIT` · SHA-256 `52d7fde295bb043f…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `missle_Main` | mesh | Strawberry_Jinx_Base_Props_TX_CM.StrawberryRebuild.dds / Strawberry_Jinx_Base_Props_MD_Cat.StrawberryRebuild.scb | alpha | 5 | 1 | (1.15, 1.3, 1.3) |  | weapon_vfx.ts |
| 1 | `Rocket Booter_Backing` | quad | Strawberry_Jinx_Base_R_SmokeShapes.StrawberryRebuild.dds | additive | 1 | 2 | (70, 35, 1.26) | (0.333, 1, 1, 1) | weapon_vfx.ts |
| 2 | `trail Outlines` | cameraTrail | Strawberry_Jinx_Base_R_Trail02.StrawberryRebuild.dds | additive | 0.175 | 220 | (50, 0, 0) |  | — |

### `Strawberry_Jinx_Base_Q_Rocket_mis_child_Mouse`（0 层，仅作子系统容器或空壳）

### `Strawberry_Jinx_Base_Q_Rocket_tar`（0 层，仅作子系统容器或空壳）

### `Strawberry_Jinx_Base_Q_Rocket_Tar_Unit`（0 层，仅作子系统容器或空壳）

### `Strawberry_Jinx_Base_R_Booster`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_R_Booster` · SHA-256 `933aed33d4c7cd03…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Rocket_Thrust` | quad | Strawberry_Jinx_Muzzle_Flash.StrawberryRebuild.dds | default | 0.2 | 25 曲线1点 随机 | (150, 150, 0) 曲线1点 随机 |  | — |
| 1 | `Flash` | billboard | Aura_Self.StrawberryRebuild.DDS | additive | 0.15 | 2 | (300, 350, 350) |  | — |
| 2 | `Dome_Energy_Big` | mesh | Strawberry_Jinx_Base_R_Energy_01.StrawberryRebuild.dds / Strawberry_Jinx_Base_R_Dome_01.StrawberryRebuild.scb | additive | 0.5 | 1 | (6, 12, 6) |  | — |
| 3 | `Projected` | quad | Aura_Self.StrawberryRebuild.DDS | additive | 50 | 1 | (400, 700, 700) | (0.32, 0.59, 0.69, 0.75) | — |

### `Strawberry_Jinx_Base_R_Cas`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_R_Cas` · SHA-256 `4ccca2a8908c5ce8…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Flash` | quad | Strawberry_Jinx_Muzzle_Flash.StrawberryRebuild.dds | additive | 0.15 曲线1点 随机 | 15 曲线2点 随机 | (60, 60, 0) 曲线2点 随机 |  | — |
| 1 | `Dark Smoke` | billboard | Strawberry_Jinx_Base_Particles_1_9.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 15 曲线1点 随机 | (50, 0, 0) 曲线1点 随机 | (1, 1, 1, 0.72) 曲线1点 随机 | jinx_vfx.ts |
| 2 | `Add Smoke` | billboard | Strawberry_Jinx_Base_Particles_1_9.StrawberryRebuild.dds | additive | 0.65 曲线1点 随机 | 15 曲线1点 随机 | (50, 0, 0) 曲线1点 随机 | (1, 1, 1, 0.72) 曲线1点 随机 | jinx_vfx.ts |
| 3 | `Dark Smoke_Far` | billboard | Strawberry_Jinx_Base_Particles_1_9.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 15 曲线1点 随机 | (75, 0, 0) 曲线1点 随机 | (1, 1, 1, 0.72) 曲线1点 随机 | — |
| 4 | `shockwaves` | mesh | Strawberry_Jinx_Base_R_yanwu_223.StrawberryRebuild.dds / Strawberry_Jinx_Base_sk.StrawberryRebuild.scb | additive | 0.5 | 1 | (0.75, 0.75, 4) 曲线2点 |  | — |

### `Strawberry_Jinx_Base_R_Mis`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_R_Mis` · SHA-256 `586dc317fef5a53c…` · 系统名出现在 jinx_vfx.ts

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Missle` | mesh | Strawberry_Jinx_Base_Props_TX_CM.StrawberryRebuild.dds / Strawberry_Jinx_Base_Props_MD_SuperMegaDeathRocket.StrawberryRebuild.scb | mode3 | 50 | 1 | (3.5, 3.5, 3.5) |  | — |
| 1 | `Glow` | quad | Aura_Self.StrawberryRebuild.DDS | additive | 50 | 1 | (275, 700, 700) | (0, 0.667, 1, 0.502) | — |
| 2 | `Right Wind` | quad | Strawberry_Jinx_Base_R_GroundSmoke02.StrawberryRebuild.dds | alpha | 0.45 | 20 | (200, 150, 0) 曲线1点 随机 |  | jinx_vfx.ts |
| 3 | `Left Wind` | quad | Strawberry_Jinx_Base_R_GroundSmoke02.StrawberryRebuild.dds | alpha | 0.45 | 20 | (200, 150, 0) 曲线1点 随机 |  | — |
| 4 | `Ground Front Glow` | quad | Strawberry_Jinx_R_Shape.StrawberryRebuild.dds | additive | 50 | 1 | (800, 450, 180) |  | jinx_vfx.ts |
| 5 | `Energy_Flame_Alpha3` | mesh | Strawberry_Jinx_Base_R_ConeTexture_01.StrawberryRebuild.dds / Strawberry_Jinx_Base_R_Conehead_01.StrawberryRebuild.scb | additive | 1 | 2 | (2, 5, 1.7) | (0.58, 0.97, 1, 1) | — |
| 6 | `Spots` | billboard | Strawberry_Jinx_Cat_Faces.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 3 曲线1点 随机 | (20, 5, 1) 曲线1点 随机 |  | jinx_vfx.ts |
| 7 | `Dark Smoke- Blended` | billboard | Strawberry_Jinx_Base_Particles_1_9.StrawberryRebuild.dds | alpha | 0.45 曲线1点 随机 | 15 曲线1点 随机 | (50, 50, 50) 曲线1点 随机 |  曲线1点 随机 | — |
| 8 | `LittleStar` | billboard | Strawberry_Jinx_Base_R_Buff_lilStar_4x2.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 12 曲线1点 随机 | (65, 50, 50) 曲线1点 随机 |  | jinx_vfx.ts |
| 9 | `[Mid]PixelCast` | quad | Strawberry_Jinx_Base_Pixel.StrawberryRebuild.dds | additive | 0.75 曲线1点 随机 | 5 | (45, 25, 1) |  | jinx_vfx.ts |
| 10 | `Speed_impact` | mesh | Strawberry_Jinx_SpeedImpact.StrawberryRebuild.dds / Strawberry_Jinx_Base_R_CastRing_01.StrawberryRebuild.scb | additive | 0.3 | 3 | (3.5, 5, 5) |  | jinx_vfx.ts |
| 11 | `Add Smoke` | billboard | Strawberry_Jinx_Base_Particles_1_9.StrawberryRebuild.dds | additive | 0.45 曲线1点 随机 | 9 曲线1点 随机 | (50, 50, 50) 曲线1点 随机 |  曲线1点 随机 | jinx_vfx.ts |
| 12 | `Ring Blue Big` | mesh | Strawberry_Jinx_Circle_Mis.StrawberryRebuild.dds / Strawberry_Jinx_Base_R_Swirl.StrawberryRebuild.scb | additive | 0.35 | 3 | (1, 1, 0.7) |  | jinx_vfx.ts |
| 13 | `Ring Yellow Small` | mesh | Strawberry_Jinx_Circle_Mis.StrawberryRebuild.dds / Strawberry_Jinx_Base_R_Swirl.StrawberryRebuild.scb | additive | 0.35 | 3 | (0.85, 1, 0.7) |  | jinx_vfx.ts |
| 14 | `Missle1` | mesh | Strawberry_Jinx_Base_Props_TX_CM.StrawberryRebuild.dds / Strawberry_Jinx_Base_Props_MD_SuperMegaDeathRocket.StrawberryRebuild.scb | default | 50 | 1 | (3.5, 3.5, 3.5) |  | — |

### `Strawberry_Jinx_Base_R_Rocket_Child`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_R_Rocket_Child` · SHA-256 `0f753206e663bec5…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Dark Trail Backing` | arbitraryTrail | Strawberry_Jinx_trail_Dark.StrawberryRebuild.dds | alpha | 0.3 | 220 | (175, 0, 0) |  | — |
| 1 | `trail Outlines` | arbitraryTrail | Strawberry_Jinx_Base_R_Trail02.StrawberryRebuild.dds | additive | 0.25 | 220 | (150, 5e+03, 0) |  | — |

### `Strawberry_Jinx_Base_R_Tar`

来源 `Characters/Strawberry_Jinx/Skins/Skin0/Particles/Strawberry_Jinx_Base_R_Tar` · SHA-256 `ea2634798516017d…` · 系统名出现在 jinx_vfx.ts

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `CloudFaceBackGlow` | billboard | Aura_Self.StrawberryRebuild.DDS | additive | 0.45 | 1 | (425, 210, 0) 曲线1点 随机 |  | jinx_vfx.ts |
| 1 | `vortex` | quad | Strawberry_Jinx_Base_R_CraterObsi.StrawberryRebuild.dds | alpha | 1 | 1 | (580, 310, 310) |  | jinx_vfx.ts |
| 2 | `fast` | billboard | Strawberry_Jinx_Base_R_Rocks_2x2.StrawberryRebuild.dds | alpha | 0.25 曲线1点 随机 | 14 | (50, 150, 1) 曲线1点 随机 | (1, 1, 1, 0.45) 曲线1点 随机 | jinx_vfx.ts |
| 3 | `CloudFace4` | billboard | Strawberry_Jinx_Flipbook.StrawberryRebuild.dds | additive | 0.3 曲线1点 随机 | 4 | (300, 210, 0) 曲线1点 随机 |  | jinx_vfx.ts |
| 4 | `Dark Smoke` | billboard | Strawberry_Jinx_Base_Particles_1_9.StrawberryRebuild.dds | alpha | 0.45 曲线1点 随机 | 15 | (65, 65, 65) 曲线1点 随机 |  曲线1点 随机 | jinx_vfx.ts |
| 5 | `Swirls` | mesh | Strawberry_Jinx_Base_E_ErosionSphere02.StrawberryRebuild.dds / Strawberry_Jinx_Base_R_AnimeBurstMesh02.StrawberryRebuild.scb | additive | 0.375 | 1 | (4, 2.75, 2.75) |  | jinx_vfx.ts |
| 6 | `EnergyRing_Out` | mesh | Strawberry_Jinx_Base_E_Praxis.StrawberryRebuild.dds / Strawberry_Jinx_Base_R_Praxis.StrawberryRebuild.scb | additive | 0.45 | 3 | (2.65, 1.25, 1) | (1, 1, 1, 0.4) | jinx_vfx.ts |
| 7 | `PixelCast` | billboard | Strawberry_Jinx_Base_Pixel.StrawberryRebuild.dds | additive | 0.65 曲线1点 随机 | 15 | (25, 0.75, 0.75) 曲线1点 随机 |  | jinx_vfx.ts |
| 8 | `SolidBeams` | ray | Strawberry_Jinx_Base_R_Shapes01.StrawberryRebuild.dds | alpha | 0.25 曲线1点 随机 | 8 | (25, 110, 0) 曲线1点 随机 |  | jinx_vfx.ts |
| 9 | `LingerBoxes` | billboard | Strawberry_Jinx_Base_R_Buff_lilStar_4x2.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 4 | (85, 30, 1) 曲线1点 随机 |  | jinx_vfx.ts |
| 10 | `Hit_Flash` | billboard | Strawberry_Jinx_Base_Glow2.StrawberryRebuild.dds | default | 0.2 | 1 | (500, 300, 300) |  | jinx_vfx.ts |

### `Strawberry_Jinx_Base_W_Beam`（0 层，仅作子系统容器或空壳）

### `Strawberry_Jinx_Base_W_Cas`（0 层，仅作子系统容器或空壳）

### `Strawberry_Jinx_Base_W_Gun_cas`（0 层，仅作子系统容器或空壳）

## enemy

### `EliteSpell_DamageZone`

来源 `Maps/Shipping/Map33/Particles/Environment/EliteSpell_DamageZone` · SHA-256 `70e05517e3c12aef…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Elite_AoE_Edge` | mesh | Udyr_Base_VGU_Awaken_Line_Hori.StrawberryRebuild.dds / Anivia_Base_Z_IndicatorMesh01.StrawberryRebuild.scb | alpha | 6 | 1 | (6.5, 2, 27) | (0.951, 0.228, 0.348, 1) | — |
| 1 | `Elite_AoE_EdgeBits` | billboard | Strawberry_Boss_Briar_Base_Z_Small_Mote.StrawberryRebuild.dds | additive | 0.7 曲线1点 随机 | 60 | (5, 25, 1) 曲线1点 随机 |  曲线1点 随机 | — |
| 2 | `Elite_AoE_FloorBlend` | quad | Generic_GroundBaseLayer.StrawberryRebuild.dds | alpha | 6 | 1 | (330, 640, 0) | (0.03, 0.15, 0.27, 0.69) | — |
| 3 | `Elite_Wave_Add` | mesh | Nami_Base_AberraticCaustic.StrawberryRebuild.dds / Udyr_Base_R_RoundMesh.StrawberryRebuild.scb | additive | 6 | 1 | (2.5, 1.4, 2.5) | (0.886, 0.403, 0.65, 1) | — |
| 4 | `Elite_Wave_WaterBlend` | mesh | Nami_Base_R_WaterAdd_02.StrawberryRebuild.dds / Udyr_Base_R_RoundMesh.StrawberryRebuild.scb | alpha | 6 | 1 | (2.5, 1.4, 2.5) | (1, 1, 1, 0.86) | — |
| 5 | `Elite_Wave_ChromaticFill` | mesh | Nami_Base_AberraticNoise.StrawberryRebuild.dds / Udyr_Base_R_RoundMesh.StrawberryRebuild.scb | additive | 6 | 1 | (2.2, 1.4, 2.5) | (1, 1, 1, 0.92) | — |
| 6 | `Temp_GroundGlow` | quad | Briar_Skin10_W_Decal_05.StrawberryRebuild.tex | alpha | 4 | 1 | (500, 150, 50) | (0.65, 0.1, 0.16, 0.5) | — |
| 7 | `CannonSpike` | quad | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | additive | 6 | 1 | (500, 1.27, 1.27) | (0.94, 0.94, 0.94, 0.15) | — |
| 8 | `Shockwave_blend` | mesh | Aatrox_Skin33_Shockwave_mask.StrawberryRebuild.dds / Aatrox_Skin33_Q3_lowpoly.StrawberryRebuild.scb | additive | 1 | 2 | (1, 0.2, 1) | (0.94, 0.11, 0.47, 0.32) 曲线2点 | — |
| 9 | `Lightning_AOE_Ring` | mesh | Strawberry_Boss_Briar_Base_Z_Lightning03.StrawberryRebuild.dds / Strawberry_Boss_Briar_Base_Z_Decal_Edge.StrawberryRebuild.scb | additive | 0.4 曲线1点 随机 | 12 | (4.2, 1, 4.2) 曲线1点 随机 |  曲线1点 随机 | — |
| 10 | `Shadows_in` | mesh | Strawberry_Boss_Briar_Base_Z_Screen_VFX_Water_wave.StrawberryRebuild.dds / Strawberry_Boss_Briar_Base_Z_ScreenWave_mesh.StrawberryRebuild.scb | alpha | 2 | 2 | (40, 0, 40) | (0.234, 0.333, 0.95, 1) | — |

### `EliteSpell_FastMissile`

来源 `Maps/Shipping/Map33/Particles/Environment/EliteSpell_FastMissile` · SHA-256 `bf3742ef452f2273…` · 引用技能：Strawberry_EliteSpell_Fireball

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Sparks` | billboard | Aatrox_Skin33_W_Shapes02.StrawberryRebuild.dds | additive | 0.4 曲线1点 随机 | 15 | (20, 25, 0) 曲线1点 随机 | (1, 1, 1, 0.8) 曲线1点 随机 | — |
| 1 | `lightBits` | mesh | Nami_Base_Q_WaterNoise.StrawberryRebuild.dds / Nami_Skin15_Q_debuff_MeshBubble.StrawberryRebuild.scb | alpha | 6 | 1 | (10, 10.8, 10.8) | (0.385, 0.526, 1, 1) | — |
| 2 | `Bubble` | billboard | Nami_Base_BubbleArea_01.StrawberryRebuild.dds | alpha | 6 | 1 | (90, 89.6, 89.6) | (0.114, 0.389, 0.979, 1) | — |
| 3 | `Trail1` | billboard | Yasuo_Skin77_Glow2.StrawberryRebuild.dds | additive | 1 | 15 | (40, 500, 0) 曲线1点 随机 | (0.995, 0.223, 0.373, 1) | — |
| 4 | `Ripple` | quad | DrMundo_Skin08_01.StrawberryRebuild.dds | alpha | 1.2 曲线1点 随机 | 5 | (600, 1, 1) 曲线1点 随机 | (1, 0.42, 0.697, 1) 曲线1点 随机 | — |
| 5 | `Bubble_Burst` | billboard | Strawberry_Briar_Base_R_Bubble02.StrawberryRebuild.dds | additive | 0.8 曲线1点 随机 | 20 | (15, 1, 1) 曲线1点 随机 | (0.788, 0.69, 1, 0.702) 曲线1点 随机 | — |
| 6 | `Temp_GroundGlow` | billboard | Briar_Skin10_W_Decal_05.StrawberryRebuild.tex | alpha | 4 | 1 | (90, 150, 50) | (0.514, 0.0784, 0.282, 1) | — |
| 7 | `lightBits1` | mesh | common_color-hold.StrawberryRebuild.dds / Nami_Skin15_Q_debuff_MeshBubble.StrawberryRebuild.scb | additive | 6 | 1 | (10, 10.8, 10.8) | (0, 0, 0, 1) | — |
| 8 | `Shockwave_blend` | mesh | Aatrox_Skin33_Shockwave_mask.StrawberryRebuild.dds / Aatrox_Skin33_Q3_lowpoly.StrawberryRebuild.scb | additive | 1 | 1 | (0.3, 1, 0.3) | (0.94, 0.11, 0.47, 1) 曲线2点 | — |

### `EliteSpell_FastMissile_tar`

来源 `Maps/Shipping/Map33/Particles/Environment/EliteSpell_FastMissile_tar` · SHA-256 `b983abe8a85cbf5e…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `STAR` | billboard | Aatrox_Skin33_Q_Star_1.StrawberryRebuild.dds | alpha | 0.26 | 1 | (150, 150, 60) | (1, 0.118, 0.561, 1) | — |
| 1 | `STAR1` | billboard | Aatrox_Skin33_Q_Star_1.StrawberryRebuild.dds | alpha | 0.26 | 1 | (130, 130, 60) | (1, 0.575, 0.251, 1) | — |
| 2 | `STAR2` | billboard | Aatrox_Skin33_Q_Star_1.StrawberryRebuild.dds | additive | 0.26 | 1 | (50, 40, 60) | (1, 0.575, 0.251, 1) | — |
| 3 | `CannonSpike` | billboard | Belveth_Skin10_Z_Glow_01.StrawberryRebuild.dds | additive | 0.25 | 1 | (60, 1, 1) | (0.941, 0.11, 0.471, 0.502) | — |
| 4 | `Blend` | billboard | Belveth_Skin10_Z_Glow_01.StrawberryRebuild.dds | additive | 0.25 | 1 | (50, 1, 1) |  | — |
| 5 | `CannonSpike1` | billboard | Belveth_Skin19_E_Flash_sharp.StrawberryRebuild.dds | default | 0.25 | 1 | (180, 1, 1) | (0.94, 0.94, 0.94, 1) | — |
| 6 | `CannonSpike2` | billboard | Belveth_Skin19_E_Flash_sharp.StrawberryRebuild.dds | default | 0.25 | 1 | (80, 1, 1) | (0.94, 0.94, 0.94, 1) | — |
| 7 | `Dot_Glow` | billboard | Belveth_R_Flashes_Rays.StrawberryRebuild.dds | additive | 0.2 | 1 | (50, 22, 1) | (0.03, 0.84, 0.8, 1) | — |
| 8 | `Dot_Glow1` | billboard | Belveth_R_Flashes_Rays.StrawberryRebuild.dds | additive | 0.2 | 1 | (50, 22, 1) | (1, 0.12, 0.43, 1) | — |
| 9 | `LightRefracs` | billboard | Aatrox_Skin33_Q_Bubble01.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 5 | (25, 1, 1) 曲线1点 随机 | (0.61, 0.88, 0.99, 1) 曲线1点 随机 | — |
| 10 | `Water_Splash1` | billboard | Briar_Skin10_LinearSplashes_05.StrawberryRebuild.dds | alpha | 0.5 曲线1点 随机 | 12 | (20, 20, 0) 曲线1点 随机 | (1, 1, 1, 0.98) | — |

### `EliteSpell_SlowMissile`

来源 `Maps/Shipping/Map33/Particles/Environment/EliteSpell_SlowMissile` · SHA-256 `4f29e07c2638ffdd…` · 引用技能：Strawberry_EliteSpell_SlowMissile

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Elite_LeadLines` | quad | Strawberry_Briar_Base_R_indicator_01_Upper_jaw.StrawberryRebuild.dds | alpha | 7.1 | 1 | (150, 400, 1) | (0.93, 0.03, 0.42, 1) | — |
| 1 | `Bubble_Burst` | billboard | Strawberry_Briar_Base_R_Shapes02.StrawberryRebuild.dds | additive | 2 曲线1点 随机 | 7 | (40, 1, 1) 曲线1点 随机 | (1, 1, 1, 0.702) 曲线1点 随机 | — |
| 2 | `WaterBlend` | mesh | TFT2_Soraka_Base_R_WaterBlend.StrawberryRebuild.dds / TFT2_Soraka_Base_R_Water.StrawberryRebuild.scb | alpha | 7.1 | 1 | (2, 2, 2.3) |  | — |
| 3 | `WaterAdd` | mesh | TFT2_Soraka_Base_R_WaterAdd.StrawberryRebuild.dds / TFT2_Soraka_Base_R_Water.StrawberryRebuild.scb | additive | 7.1 | 1 | (2, 2, 2) |  | — |
| 4 | `WaterAdd1` | mesh | TFT2_Soraka_Base_R_WaterAdd.StrawberryRebuild.dds / TFT2_Soraka_Base_R_Water.StrawberryRebuild.scb | additive | 7.1 | 1 | (2, 2, 2) |  | — |
| 5 | `Undertow` | quad | TFT2_Soraka_Base_R_mis_Undertow.StrawberryRebuild.dds | alpha | 7.1 | 1 | (550, 500, 1) |  | — |
| 6 | `Leading_glow` | quad | Glow_Bright.StrawberryRebuild.dds | additive | 7.1 | 1 | (800, 200, 1) | (1, 0, 0.0817, 1) | — |
| 7 | `MistFrontLineAdd1` | quad | TFT2_Soraka_Base_WaterFill_2x2.StrawberryRebuild.dds | additive | 0.6 曲线1点 随机 | 40 | (180, 180, 180) 曲线1点 随机 | (0.842, 0.158, 0.485, 1) | — |
| 8 | `Temp_Mesh` | mesh | TFT8_Urgot_Base_Alpha04.StrawberryRebuild.dds / TFT8_Urgot_Base_Ripples01.StrawberryRebuild.scb | alpha | 7.1 | 2 | (90, 60, 50) | (0.0668, 0.183, 0.319, 1) | — |
| 9 | `frontWaveSoftFill` | mesh | TFT8_Urgot_Base_RingMult.StrawberryRebuild.dds / TFT8_Urgot_Base_Wave_2.StrawberryRebuild.scb | alpha | 1.3 曲线1点 随机 | 3 | (1.5, 1, 1.5) 曲线1点 随机 | (1, 1, 1, 0.69) | — |
| 10 | `L1` | ray | Nami_Base_BA_LinearSplashes_02.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 25 | (80, 100, 250) 曲线1点 随机 | (1, 0, 0.46, 0.55) | — |
| 11 | `R1` | ray | Nami_Base_BA_LinearSplashes_02.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 25 | (80, 100, 250) 曲线1点 随机 | (1, 0, 0.46, 0.55) | — |
| 12 | `L_Bubbles1` | billboard | Sett_Skin10_W_Bubble_Alpha.StrawberryRebuild.dds | additive | 0.75 曲线1点 随机 | 35 | (10, 15, 5) 曲线1点 随机 | (1, 0, 0.287, 0.749) 曲线1点 随机 | — |
| 13 | `R_Bubbles1` | billboard | Sett_Skin10_W_Bubble_Alpha.StrawberryRebuild.dds | additive | 0.75 曲线1点 随机 | 35 | (10, 15, 5) 曲线1点 随机 | (1, 0, 0.287, 0.749) 曲线1点 随机 | — |
| 14 | `Elite_LeadLines1` | quad | Strawberry_Briar_Base_R_indicator_01_Upper_jaw.StrawberryRebuild.dds | additive | 7.1 | 1 | (150, 400, 1) | (0.93, 0.03, 0.151, 1) | — |
| 15 | `Head` | mesh | Strawberry_Boss_Aatrox_Base_Q1_Emp_Head_Decal.StrawberryRebuild.tex / Strawberry_Boss_Aatrox_Base_Mirrored_Quad1.StrawberryRebuild.scb | alpha | 7.1 | 1 | (87, 65, 0) |  | — |

### `EliteSpell_SlowMissile_Tar`

来源 `Maps/Shipping/Map33/Particles/Environment/EliteSpell_SlowMissile_Tar` · SHA-256 `0ad5b8d92e1b3b8e…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `STAR` | billboard | Aatrox_Skin33_Q_Star_1.StrawberryRebuild.dds | alpha | 0.26 | 1 | (150, 150, 60) | (1, 0.118, 0.561, 1) | — |
| 1 | `STAR1` | billboard | Aatrox_Skin33_Q_Star_1.StrawberryRebuild.dds | alpha | 0.26 | 1 | (130, 130, 60) | (1, 0.575, 0.251, 1) | — |
| 2 | `STAR2` | billboard | Aatrox_Skin33_Q_Star_1.StrawberryRebuild.dds | additive | 0.26 | 1 | (50, 40, 60) | (1, 0.575, 0.251, 1) | — |
| 3 | `CannonSpike` | billboard | Belveth_Skin10_Z_Glow_01.StrawberryRebuild.dds | additive | 0.25 | 1 | (60, 1, 1) | (0.941, 0.11, 0.471, 0.502) | — |
| 4 | `Blend` | billboard | Belveth_Skin10_Z_Glow_01.StrawberryRebuild.dds | additive | 0.25 | 1 | (50, 1, 1) |  | — |
| 5 | `CannonSpike1` | billboard | Belveth_Skin19_E_Flash_sharp.StrawberryRebuild.dds | default | 0.25 | 1 | (180, 1, 1) | (0.94, 0.94, 0.94, 1) | — |
| 6 | `CannonSpike2` | billboard | Belveth_Skin19_E_Flash_sharp.StrawberryRebuild.dds | default | 0.25 | 1 | (80, 1, 1) | (0.94, 0.94, 0.94, 1) | — |
| 7 | `Dot_Glow` | billboard | Belveth_R_Flashes_Rays.StrawberryRebuild.dds | additive | 0.2 | 1 | (50, 22, 1) | (0.03, 0.84, 0.8, 1) | — |
| 8 | `Dot_Glow1` | billboard | Belveth_R_Flashes_Rays.StrawberryRebuild.dds | additive | 0.2 | 1 | (50, 22, 1) | (1, 0.12, 0.43, 1) | — |
| 9 | `LightRefracs` | billboard | Aatrox_Skin33_Q_Bubble01.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 5 | (25, 1, 1) 曲线1点 随机 | (0.61, 0.88, 0.99, 1) 曲线1点 随机 | — |
| 10 | `Water_Splash1` | billboard | Briar_Skin10_LinearSplashes_05.StrawberryRebuild.dds | alpha | 0.5 曲线1点 随机 | 12 | (20, 20, 0) 曲线1点 随机 | (1, 1, 1, 0.98) | — |

### `Strawberry_Elite_MissileFast_Glow`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_Elite_MissileFast_Glow` · SHA-256 `8a86a6914ae44a22…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Avatar` | attachedMesh | alphaslice_mesh.StrawberryRebuild.dds | alpha | -1 | 1 | (1, 1, 1) | (0.907, 0.00392, 1, 1) | — |
| 1 | `Fresnel` | attachedMesh | alphaslice_mesh.StrawberryRebuild.dds | additive | -1 | 1 | (1, 1, 1) | (0, 0, 0, 1) | — |
| 2 | `statics_weapon` | billboard | Olaf_Base_BitsDissolve_01.StrawberryRebuild.dds | additive | 0.25 曲线1点 随机 | 5 曲线1点 随机 | (40, 15, 15) 曲线1点 随机 | (1, 0.394, 0.755, 1) | — |

### `Strawberry_Elite_MissileSlow_Glow`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_Elite_MissileSlow_Glow` · SHA-256 `534bea5f8d4fe161…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Avatar` | attachedMesh | alphaslice_mesh.StrawberryRebuild.dds | alpha | -1 | 1 | (1, 1, 1) | (0.00392, 0.799, 1, 1) | — |
| 1 | `Fresnel` | attachedMesh | alphaslice_mesh.StrawberryRebuild.dds | additive | -1 | 1 | (1, 1, 1) | (0, 0, 0, 1) | — |
| 2 | `statics_weapon` | billboard | Olaf_Base_BitsDissolve_01.StrawberryRebuild.dds | additive | 0.25 曲线1点 随机 | 5 曲线1点 随机 | (40, 15, 15) 曲线1点 随机 | (0.235, 0.788, 1, 1) | — |

### `Strawberry_Enemy_Death`

来源 `Maps/Shipping/Map33/Particles/Default/Strawberry_Enemy_Death` · SHA-256 `a36ac905ddf87606…` · 系统名出现在 vfx.ts

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `HeartGlow` | billboard | GlowAlpha.StrawberryRebuild.DDS | alpha | 0.6 | 1 | (200, 150, 50) | (1, 0.275, 0.224, 0.71) | vfx.ts |
| 1 | `Spark_Green1` | billboard | XinZhao_Skin20_Shape01.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 5 | (0.75, 0, 0) 曲线1点 随机 | (1, 0.0941, 0.0941, 1) | — |
| 2 | `Basic` | quad | FN_Universal_Sparks.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 15 曲线1点 随机 | (17, 28, 55) 曲线1点 随机 |  | — |
| 3 | `streaks` | ray | DeathExplo_InnerLight_002.StrawberryRebuild.dds | default | 0.4 曲线1点 随机 | 2 | (300, 1e+03, 800) 曲线1点 随机 |  | — |
| 4 | `HeartGlow1` | billboard | 6676_Tar_Flash22.StrawberryRebuild.dds | alpha | 0.4 | 1 | (25, 150, 50) | (0.21, 0, 0, 1) | — |
| 5 | `HeartGlow2` | billboard | 6676_Tar_Flash22.StrawberryRebuild.dds | additive | 0.12 | 2 | (15, 150, 50) | (1, 0.325, 0.235, 1) | vfx.ts |

### `Strawberry_Enemy_Hit`

来源 `Maps/Shipping/Map33/Particles/Default/Strawberry_Enemy_Hit` · SHA-256 `a85d1ef124d31c83…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `UTar_SharpShapes` | quad | Yasuo_Skin77_Q_AnimeShapes02.StrawberryRebuild.dds | alpha | 0.23 曲线1点 随机 | 1 | (110, 70, 1) 曲线1点 随机 |  | — |
| 1 | `UTar_MidFlash` | billboard | Smolder_Q_CenterShine_Tar.StrawberryRebuild.dds | additive | 0.2 | 1 | (200, 1, 1) 曲线1点 随机 | (1, 0.557, 0.173, 1) | — |
| 2 | `UTar_Core` | billboard | Smolder_Q_CenterShine_Tar.StrawberryRebuild.dds | additive | 0.2 曲线1点 随机 | 1 | (70, 1, 1) 曲线1点 随机 | (1, 0.88, 0.676, 1) | — |
| 3 | `UTar_BG` | billboard | Strawberry_Weapon_EnemyTar.StrawberryRebuild.tex | alpha | 0.2 曲线1点 随机 | 1 | (80, 120, 0) 曲线1点 随机 | (1, 0.516, 0.368, 1) 曲线1点 随机 | — |
| 4 | `UTar_Ring` | billboard | Strawberry_Weapon_EnemyTar_Ring.StrawberryRebuild.tex | alpha | 0.23 | 1 | (110, 350, 0) 曲线1点 随机 |  | — |
| 5 | `UTar_SparkBits` | billboard | Yasuo_Q_windstrike_shape001.StrawberryRebuild.dds | additive | 0.35 曲线1点 随机 | 3 曲线1点 随机 | (10, 50, 0) 曲线1点 随机 |  曲线1点 随机 | — |

### `Strawberry_Enemy_PoisonZone`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_Enemy_PoisonZone` · SHA-256 `26e6fccf17af60fc…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `groundBacker` | quad | Morgana_Base_E_BackDrop.StrawberryRebuild.dds | alpha | 5 | 1 | (350, 150, 50) | (1, 0.05, 0.26, 1) | — |
| 1 | `Ground_Mesh1` | quad | Morgana_Base_W_Tar_Ground.StrawberryRebuild.dds | alpha | 5 | 1 | (370, 760, 0.5) | (1, 0.39, 0.43, 1) | — |
| 2 | `Embers` | billboard | TestVFXChampion_Skin30_Cyber_Fish.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 5 | (25, 25, 50) 曲线1点 随机 | (1, 1, 1, 0.84) | — |
| 3 | `Embers1` | quad | Strawberry_Briar_Base_R_Shapes02.StrawberryRebuild.dds | additive | 1.25 曲线1点 随机 | 5 | (20, 20, 50) 曲线1点 随机 | (1, 1, 1, 0.71) | — |
| 4 | `Temp_Mesh` | mesh | Morgana_Base_R_Fire_Trail_Up.StrawberryRebuild.dds / Morgana_W_Circle_Mesh.StrawberryRebuild.scb | additive | 5 | 1 | (2.7, 5, 3.25) | (0.83, 0, 0.26, 1) | — |
| 5 | `Temp_GroundGlow1` | quad | Morgana_Base_E_BackDrop.StrawberryRebuild.dds | additive | 0.2 | 1 | (120, 150, 50) |  | — |
| 6 | `Temp_Mesh1` | mesh | Morgana_Base_R_Fire_Trail_Up.StrawberryRebuild.dds / Morgana_W_Circle_Mesh.StrawberryRebuild.scb | alpha | 5 | 1 | (3, 5, 3) | (0.407, 0.0901, 0.216, 0.69) | — |
| 7 | `Temp_Mesh2` | mesh | Morgana_Base_R_Fire_Trail_Up.StrawberryRebuild.dds / Morgana_W_Mist_Mesh.StrawberryRebuild.scb | alpha | 0.5 | 1 | (2, 100, 2) | (0, 0.0449, 0.16, 0.349) | — |
| 8 | `BaseDarkDecal` | quad | Primordian_Exploration_Decal_FloorVein_01.StrawberryRebuild.dds | alpha | 0.8 | 1 | (250, 285, 275) | (0.0607, 0.924, 0.809, 1) | — |
| 9 | `Ground_Mesh2` | quad | Strawberry_Boss_Belveth_Base_R_16.StrawberryRebuild.dds | alpha | 5 | 1 | (250, 760, 0.5) |  | — |
| 10 | `addGlow` | quad | common_soft_glow.StrawberryRebuild.dds | additive | 1.25 | 2 | (360, 1, 1) | (1, 0.13, 0.39, 0.6) | — |
| 11 | `diamondCenter` | quad | Strawberry_Briar_Base_R_Shapes02.StrawberryRebuild.dds | additive | 1.25 | 1 | (60, 1, 1) |  | — |
| 12 | `BaseDarkDecal1` | quad | Primordian_Exploration_Decal_FloorVein_01.StrawberryRebuild.dds | additive | 0.8 | 1 | (250, 285, 275) | (0.0607, 0.924, 0.809, 1) | — |
| 13 | `Ground_Mesh3` | quad | Strawberry_Boss_Belveth_Base_R_16.StrawberryRebuild.dds | additive | 0.5 | 1 | (250, 760, 0.5) |  | — |

### `Strawberry_Enemy_PoisonZone_Cast`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_Enemy_PoisonZone_Cast` · SHA-256 `3a417ca0a2c92b3c…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Embers` | billboard | Strawberry_Briar_Base_R_Shapes02.StrawberryRebuild.dds | additive | 0.75 曲线1点 随机 | 40 | (20, 20, 50) 曲线1点 随机 | (1, 0.0196, 0.485, 1) | — |
| 1 | `FireLine` | ray | Morgana_Base_R_Impactspike.StrawberryRebuild.dds | additive | 0.2 | 1 | (130, 400, 0) | (1, 0.51, 0.62, 1) | — |
| 2 | `FireLine1` | ray | Morgana_Base_R_Impactspike.StrawberryRebuild.dds | alpha | 0.25 | 1 | (200, 500, 0) | (1, 0.06, 0.447, 0.42) | — |
| 3 | `Temp_Mesh` | mesh | Morg_Base_BA_MeshMult.StrawberryRebuild.dds / Morgana_W_Swirl_Mesh.StrawberryRebuild.scb | additive | 0.8 | 1 | (2, 4, 2) | (0.925, 0.0627, 0.481, 1) | — |
| 4 | `Temp_Mesh2` | mesh | Morg_Base_BA_MeshMult.StrawberryRebuild.dds / Morgana_W_Swirl_Mesh.StrawberryRebuild.scb | alpha | 0.8 | 1 | (0.6, 4.5, 0.6) | (0.728, 0.487, 0.569, 0.439) | — |
| 5 | `Temp_Mesh3` | mesh | Morg_Base_BA_MeshMult.StrawberryRebuild.dds / Morgana_W_Beam_Mesh.StrawberryRebuild.scb | mode5 | 0.25 | 2 | (3, 4.5, 3) |  | — |
| 6 | `Temp_Mesh4` | mesh | Morg_Base_BA_MeshMult.StrawberryRebuild.dds / Morgana_W_Beam_Mesh.StrawberryRebuild.scb | alpha | 0.25 | 1 | (6, 4.5, 6) | (0.362, 0.362, 0.362, 1) | — |
| 7 | `Temp_Mesh5` | mesh | Morg_Base_BA_MeshMult.StrawberryRebuild.dds / Morgana_W_Cone_Mesh.StrawberryRebuild.scb | alpha | 0.55 | 1 | (2, 4, 2) | (0.267, 0.0196, 0.14, 1) | — |
| 8 | `Temp_Mesh6` | mesh | Morg_Base_BA_MeshMult.StrawberryRebuild.dds / Morgana_W_Cone_Mesh.StrawberryRebuild.scb | additive | 1 | 2 | (2.25, 4, 2.25) | (0.765, 0.765, 0.765, 0.522) | — |
| 9 | `Ring_A` | mesh | Morgana_Base_W_Edge_Blur.StrawberryRebuild.dds / Morgana_Base_R_indicator_ring.StrawberryRebuild.scb | alpha | 0.5 | 1 | (0.57, 0.57, 0.57) | (1, 1, 1, 0.06) | — |
| 10 | `Ring_A1` | mesh | Morgana_Base_W_Edge.StrawberryRebuild.dds / Morgana_Base_R_indicator_ring.StrawberryRebuild.scb | alpha | 0.3 | 1 | (0.57, 0.57, 0.57) | (0.14, 0, 0.33, 0.06) | — |

## reksai

### `Strawberry_Boss_RekSai_Base_Burrowed_E_tunnel_birth`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_E_tunnel_birth` · SHA-256 `8f200cafa2f3e873…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `ground_crack` | planarProjection | Strawberry_Boss_RekSai_Base_Burrowed_E_Tunnel_ground.StrawberryRebuild.dds | alpha | 600 | 1 | (300, 300, 300) |  | — |
| 1 | `DirtBits_ent` | billboard | Strawberry_Boss_RekSai_Base_Burrowed_Q_Ground_Clump.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 75 | (15, 15, 1) 曲线1点 随机 |  | — |
| 2 | `smoke_ent` | billboard | Strawberry_Boss_RekSai_Base_Burrowed_Q_tar_dust.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 20 | (100, 100, 100) 曲线1点 随机 |  | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_E_tunnel_birth2`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_E_tunnel_birth2` · SHA-256 `8adeafa7c54c7929…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `ground_crack` | planarProjection | Strawberry_Boss_RekSai_Base_Burrowed_E_Tunnel_ground.StrawberryRebuild.dds | alpha | 600 | 1 | (300, 300, 300) |  | — |
| 1 | `DirtBits_ent` | billboard | Strawberry_Boss_RekSai_Base_Burrowed_Q_Ground_Clump.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 75 | (15, 15, 1) 曲线1点 随机 |  | — |
| 2 | `smoke_ent` | billboard | Strawberry_Boss_RekSai_Base_Burrowed_Q_tar_dust.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 20 | (100, 100, 100) 曲线1点 随机 |  | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_Q_hit`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_Q_hit` · SHA-256 `e62804889d448180…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Ring_Ground_` | mesh | Strawberry_Boss_RekSai_Base_Q_IndicatorRing_01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_IndicatorRing_01.StrawberryRebuild.scb | additive | 0.8 | 2 曲线1点 随机 | (20, 20, 20) |  | — |
| 1 | `ground_crack1` | quad | Strawberry_Boss_RekSai_Base_Burrowed_Q_ground_hole_02.StrawberryRebuild.dds | alpha | 1 | 2 | (560, 560, 560) | (1, 1, 1, 0.19) | — |
| 2 | `Shockwave_add` | mesh | Strawberry_Boss_RekSai_Base_Praxis.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Praxis.StrawberryRebuild.scb | additive | 0.3 | 1 | (4, 1, 2.5) |  | — |
| 3 | `Cyber_Sparks_b` | billboard | Strawberry_Boss_RekSai_Base_Q_Shapes02.StrawberryRebuild.dds | alpha | 0.8 曲线1点 随机 | 15 | (20, 38, 0) 曲线1点 随机 | (0.937, 0.106, 0.467, 1) 曲线1点 随机 | — |
| 4 | `Ground_crack2` | quad | Strawberry_Boss_RekSai_Base_Q_16.StrawberryRebuild.dds | alpha | 0.8 | 1 | (600, 275, 0) |  | — |
| 5 | `Ground_crack3` | quad | Strawberry_Boss_RekSai_Base_Q_16.StrawberryRebuild.dds | additive | 0.6 | 1 | (600, 275, 0) | (1, 1, 1, 0.61) | — |
| 6 | `GroundLines1` | quad | Strawberry_Boss_RekSai_Base_Q_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.4 | 1 | (750, 300, 600) | (0.13, 0.11, 0.25, 0.64) | — |
| 7 | `STAR` | billboard | Strawberry_Boss_RekSai_Base_Q_Star_1.StrawberryRebuild.dds | alpha | 0.12 | 1 | (200, 100, 0) |  | — |
| 8 | `Cyber_Sparks` | billboard | Strawberry_Boss_RekSai_Base_Q_Shapes02.StrawberryRebuild.dds | alpha | 0.6 曲线1点 随机 | 4 | (40, 50, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 9 | `Shockwave_blend1` | mesh | Strawberry_Boss_RekSai_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 0.6 | 1 | (2, 2.4, 2) | (0.94, 0.11, 0.47, 1) | — |
| 10 | `Flash4` | quad | Strawberry_Boss_RekSai_Base_Aura_Self.StrawberryRebuild.dds | additive | 0.4 | 1 | (125, 150, 0) | (0.941, 0.137, 0.392, 0.8) | — |
| 11 | `Soft_Glow_Head` | quad | Strawberry_Boss_RekSai_Base_Q_Glow_01.StrawberryRebuild.dds | alpha | 0.4 | 1 | (600, 230, 0) | (0.941, 0.204, 0.463, 1) | — |
| 12 | `Bubble_Burst` | billboard | Strawberry_Boss_RekSai_Base_Q_Bubble02.StrawberryRebuild.dds | additive | 1.3 曲线1点 随机 | 40 | (35, 1, 1) 曲线1点 随机 | (0.79, 0.69, 1, 0.6) 曲线1点 随机 | — |
| 13 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_Q_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 20 | (125, 90, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 14 | `Center_Ripple` | mesh | Strawberry_Boss_RekSai_Base_shield_Mult.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_waveBACK.StrawberryRebuild.scb | alpha | 0.8 曲线1点 随机 | 20 | (2.5, 2.5, 2.5) 曲线1点 随机 | (1, 1, 1, 0.71) 曲线1点 随机 | — |
| 15 | `brighShockwave2` | billboard | Strawberry_Boss_RekSai_Base_Q_Shadow.StrawberryRebuild.dds | default | 0.1 | 1 | (190, 300, 300) | (1, 1, 1, 0.91) | — |
| 16 | `Sphere` | mesh | color-hold.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_BurstMesh.StrawberryRebuild.scb | alpha | 1 | 5 | (7, 1, 4) | (1, 1, 1, 0.6) | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_Q_mis`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_Q_mis` · SHA-256 `e2509df5ea0bf158…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Sphere_glow1` | quad | Strawberry_Boss_RekSai_Base_Q_Core_Glow.StrawberryRebuild.dds | additive | 0.5 | 10 | (382, 382, 382) | (1, 0.188, 0.243, 1) | — |
| 1 | `Sphere_glow2` | quad | Strawberry_Boss_RekSai_Base_Aura_Self.StrawberryRebuild.dds | alpha | 0.45 | 12 | (191, 249, 191) | (0.00784, 0.412, 0.345, 1) | — |
| 2 | `DirtBits1` | billboard | Strawberry_Boss_RekSai_Base_Q_Bubble02.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 20 | (47.8, 9.56, 9.56) 曲线1点 随机 | (0.56, 0.69, 1, 0.81) 曲线1点 随机 | — |
| 3 | `Sphere_core1` | quad | Strawberry_Boss_RekSai_Base_Aura_Self.StrawberryRebuild.dds | additive | 1 | 9 | (57.4, 153, 76.5) | (1, 1, 1, 0.12) | — |
| 4 | `Ground_Borders` | quad | Strawberry_Boss_RekSai_Base_Q_Shape.StrawberryRebuild.dds | alpha | 2 | 1 | (380, 325, 306) |  | — |
| 5 | `TearDrop` | mesh | Strawberry_Boss_RekSai_Base_Q_11.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Burrowed_Q_TearDrop.StrawberryRebuild.scb | alpha | 1.2 曲线1点 随机 | 15 | (2.15, 1.91, 1.91) | (1, 1, 1, 0.3) 曲线3点 | — |
| 6 | `trail_long` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Trail_Glow.StrawberryRebuild.dds | alpha | 0.45 | 150 | (153, 0, 0) | (1, 1, 1, 0.88) 曲线4点 | — |
| 7 | `trail_long1` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Trail_Glow.StrawberryRebuild.dds | alpha | 0.4 | 100 | (382, 0, 0) |  曲线4点 | — |
| 8 | `Buddy_Child` | mesh | Strawberry_Boss_RekSai_Base_Q_Trail_016.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Skin17_Q_Shark3.StrawberryRebuild.scb | additive | 10 | 1 | (9.75, 9.56, 10) | (0, 0, 0, 1) | — |
| 9 | `Buddy_Child1` | mesh | Strawberry_Boss_RekSai_Base_Q_Trail_016.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Skin17_Q_Shark3.StrawberryRebuild.scb | alpha | 10 | 1 | (9.56, 9.56, 10) | (0.61, 0.33, 0.44, 0.64) | — |
| 10 | `Buddy_Child2` | mesh | Strawberry_Boss_RekSai_Base_Q_22.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Skin17_Q_Shark4.StrawberryRebuild.scb | additive | 10 | 1 | (9.56, 9.56, 10) | (0.0118, 1, 0.722, 0.639) | — |
| 11 | `Buddy_Child4` | mesh | Strawberry_Boss_RekSai_Base_Q_Trail_16.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Skin17_Q_Shark.StrawberryRebuild.scb | alpha | 10 | 1 | (9.56, 9.56, 8.29) | (0.82, 0.82, 0.82, 1) | — |
| 12 | `TechnoTrail_add` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Circuitry3.StrawberryRebuild.dds | additive | 0.4 | 40 | (95.6, 0, 0) | (1, 1, 1, 0.3) 曲线4点 | — |
| 13 | `TechnoTrail_Blend` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Circuitry3.StrawberryRebuild.dds | alpha | 0.4 | 40 | (95.6, 0, 0) |  曲线4点 | — |
| 14 | `TechnoTrail_Blend1` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Circuitry3.StrawberryRebuild.dds | alpha | 0.4 | 40 | (95.6, 0, 0) | (1, 1, 1, 0.55) 曲线4点 | — |
| 15 | `TechnoTrail_add1` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Circuitry4.StrawberryRebuild.dds | additive | 0.4 | 40 | (95.6, 0, 0) | (1, 1, 1, 0.58) 曲线4点 | — |
| 16 | `TechnoTrail_Blend2` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Circuitry4.StrawberryRebuild.dds | alpha | 0.4 | 40 | (95.6, 0, 0) |  曲线4点 | — |
| 17 | `TechnoTrail_Blend3` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Circuitry4.StrawberryRebuild.dds | alpha | 0.4 | 40 | (95.6, 0, 0) | (1, 1, 1, 0.55) 曲线4点 | — |
| 18 | `Sparks` | billboard | Strawberry_Boss_RekSai_Base_Q_Shapes02.StrawberryRebuild.dds | alpha | 0.95 曲线1点 随机 | 30 | (38.2, 47.8, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 19 | `DirtBits2` | billboard | Strawberry_Boss_RekSai_Base_Q_Bubble02.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 20 | (47.8, 9.56, 9.56) 曲线1点 随机 | (0.56, 0.69, 1, 1) 曲线1点 随机 | — |
| 20 | `dome` | mesh | Strawberry_Boss_RekSai_Base_Noise_02.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Particles_2_75.StrawberryRebuild.scb | additive | 1 | 20 | (2.49, 0.956, 1.91) 曲线1点 随机 |  | — |
| 21 | `knock_up_ring` | quad | common_PoroSnack_glow.StrawberryRebuild.dds | alpha | 10 | 2 | (191, 803, 0) | (0, 0.24, 0.29, 0.39) | — |
| 22 | `Dark_Trail` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Mask_01_01.StrawberryRebuild.dds | alpha | 0.25 | 200 | (153, 258, 258) | (0.7, 0.04, 0.33, 0.5) | — |
| 23 | `Dark_Trail1` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Mask_01_01.StrawberryRebuild.dds | alpha | 0.25 | 200 | (191, 258, 258) | (1, 1, 1, 0.859) | — |
| 24 | `Glow` | quad | Strawberry_Boss_RekSai_Base_3026_Items_ball32_02.StrawberryRebuild.dds | additive | 10 | 1 | (250, 325, 191) 曲线1点 随机 | (0, 0.84, 0.56, 0.31) | — |
| 25 | `Water_Splash_Trail1` | quad | Strawberry_Boss_RekSai_Base_Q_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.75 曲线1点 随机 | 20 | (76.5, 76.5, 0) 曲线1点 随机 | (0.733, 1, 0.922, 0.878) 曲线1点 随机 | — |
| 26 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_Q_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.9 曲线1点 随机 | 50 | (105, 66.9, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 27 | `swirl_main_side` | mesh | Strawberry_Boss_RekSai_Base_Q_7.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Particles_1_1311.StrawberryRebuild.scb | additive | 1 | 2 | (1.53, 3.44, 2.3) | (0.02, 0.82, 1, 0.22) 曲线4点 | — |
| 28 | `Trail_add_Left` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Q_7.StrawberryRebuild.dds | additive | 0.3 | 50 | (191, 95.6, 0) 曲线2点 | (1, 1, 1, 0.9) 曲线1点 | — |
| 29 | `Trail_add_Left1` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Trail_05.StrawberryRebuild.dds | alpha | 0.3 | 50 | (191, 95.6, 0) 曲线2点 | (0.87, 0.97, 0.97, 1) 曲线1点 | — |
| 30 | `Trail_add_Right` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Q_7.StrawberryRebuild.dds | additive | 0.3 | 50 | (191, 95.6, 0) 曲线2点 | (0.97, 0.97, 0.97, 0.89) 曲线1点 | — |
| 31 | `Trail_add_Right1` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Trail_05.StrawberryRebuild.dds | alpha | 0.3 | 50 | (191, 95.6, 0) 曲线2点 | (0.87, 0.97, 0.97, 1) 曲线1点 | — |
| 32 | `Wet_Ground` | quad | Strawberry_Boss_RekSai_Base_Q_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.5 曲线1点 随机 | 8 | (191, 344, 440) | (0.106, 0.153, 0.259, 0.561) | — |
| 33 | `Flare_` | billboard | Strawberry_Boss_RekSai_Base_Q_LensFlare.StrawberryRebuild.dds | additive | 0.74 | 1 | (287, 1.91, 1.91) |  | — |
| 34 | `Flare_1` | billboard | Strawberry_Boss_RekSai_Base_Q_Hit2flare_omnimax.StrawberryRebuild.dds | additive | 0.74 | 1 | (38.2, 1.91, 1.91) | (1, 0.42, 0.28, 0.48) | — |
| 35 | `Flare_2` | billboard | Strawberry_Boss_RekSai_Base_Flare.StrawberryRebuild.dds | additive | 0.74 | 1 | (153, 1.91, 1.91) |  | — |
| 36 | `cast_orbit1` | billboard | Strawberry_Boss_RekSai_Base_Q_Bubble02.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 25 | (19.1, 19.1, 19.1) | (1, 1, 1, 0.72) | — |
| 37 | `Basic2` | quad | Strawberry_Boss_RekSai_Base_Burrowed_Q_nova_flash.StrawberryRebuild.dds | additive | 0.15 | 1 | (306, 306, 0) 曲线1点 随机 |  | — |
| 38 | `muzz_flash1` | quad | Strawberry_Boss_RekSai_Skin026_Burrowed_Q_muzz_flash.StrawberryRebuild.dds | alpha | 0.5 | 4 | (230, 287, 0) | (1, 1, 1, 0.75) | — |
| 39 | `muzz_flash2` | quad | Strawberry_Boss_RekSai_Skin026_Burrowed_Q_muzz_flash.StrawberryRebuild.dds | additive | 0.5 | 4 | (191, 95.6, 0) | (1, 1, 1, 0.51) | — |
| 40 | `SparksBurst` | billboard | Strawberry_Boss_RekSai_Skin026_Burrowed_Q_muzz_01.StrawberryRebuild.dds | alpha | 0.3 曲线1点 随机 | 10 | (57.4, 2.58, 0) 曲线1点 随机 |  | — |
| 41 | `Sphere_core2` | quad | Strawberry_Boss_RekSai_Base_Q_Fin_Spark_01.StrawberryRebuild.dds | additive | 0.4 | 30 | (76.5, 76.5, 76.5) |  | — |
| 42 | `ring1` | mesh | Strawberry_Boss_RekSai_Base_Burrowed_Q_Splash_tar.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Strawberry_Boss_RekSai_base_Q_bullet.StrawberryRebuild.scb | additive | 0.3 | 1 | (7.65, 7.65, 1.91) |  | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_W_cas`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_W_cas` · SHA-256 `6adc6f5d62ace189…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `rockshards` | billboard | Strawberry_Boss_RekSai_Base_W_Bubble02.StrawberryRebuild.dds | additive | 1.5 曲线1点 随机 | 65 | (30, 1, 1) 曲线1点 随机 | (0.87, 0.73, 1, 0.57) | — |
| 1 | `Center_Ripple` | mesh | Strawberry_Boss_RekSai_Base_shield_Mult.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_waveBACK.StrawberryRebuild.scb | alpha | 0.8 曲线1点 随机 | 8 | (1.6, 2, 1.6) 曲线1点 随机 |  曲线1点 随机 | — |
| 2 | `GroundLines` | quad | Strawberry_Boss_RekSai_Base_W_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.4 | 1 | (250, 300, 600) | (0.11, 0.145, 0.251, 0.8) | — |
| 3 | `Shockwave_blend` | mesh | Strawberry_Boss_RekSai_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 0.6 | 1 | (0.6, 2.4, 0.6) | (0.94, 0.11, 0.47, 1) | — |
| 4 | `Bubble_Burst` | billboard | Strawberry_Boss_RekSai_Base_W_Bubble02.StrawberryRebuild.dds | additive | 1.3 曲线1点 随机 | 20 | (30, 1, 1) 曲线1点 随机 | (0.79, 0.69, 1, 0.6) 曲线1点 随机 | — |
| 5 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_W_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 15 | (70, 60, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 6 | `Head_Flash` | quad | Strawberry_Boss_RekSai_Base_W_Glow_01.StrawberryRebuild.dds | additive | 0.3 | 1 | (600, 650, 0) | (0, 0.576, 0.404, 0.702) | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_W_cas_knockup`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_W_cas_knockup` · SHA-256 `a1945bd0d91326d6…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `ground_crack` | quad | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | alpha | 1.2 | 2 | (690, 796, 796) | (0.14, 0.11, 0.22, 1) | — |
| 1 | `rockShard_Spike` | billboard |  | mode3 | 1.5 | 1 | (14.6, 23.9, 14.6) |  | — |
| 2 | `RingFire` | mesh | Strawberry_Boss_RekSai_Base_W_Ring_01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_land_RingFire_01.StrawberryRebuild.scb | alpha | 1.4 | 2 | (5.04, 3.98, 13.3) | (0.00999, 1, 0.88, 0.79) | — |
| 3 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_W_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.5 曲线1点 随机 | 7 | (68, 93.5, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 4 | `CannonSpike` | billboard | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | additive | 0.4 | 1 | (663, 2.65, 2.65) | (0.94, 0.94, 0.94, 0.7) | — |
| 5 | `Bubble_Burst` | billboard | Strawberry_Boss_RekSai_Base_W_Bubble02.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 30 | (61, 2.65, 2.65) 曲线1点 随机 | (0.788, 0.69, 1, 0.702) 曲线1点 随机 | — |
| 6 | `Center_Ripple` | mesh | Strawberry_Boss_RekSai_Base_shield_Mult.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_waveBACK.StrawberryRebuild.scb | alpha | 0.8 曲线1点 随机 | 8 | (2.12, 3.4, 2.12) 曲线1点 随机 |  曲线1点 随机 | — |
| 7 | `Shockwave_blend` | mesh | Strawberry_Boss_RekSai_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 0.6 | 1 | (1.65, 6.36, 1.65) | (0.94, 0.11, 0.47, 1) | — |
| 8 | `Water_Splash1` | billboard | Strawberry_Boss_RekSai_Base_W_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 15 | (159, 133, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 9 | `Ripples` | mesh | Strawberry_Boss_RekSai_Base_W_27.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_IndicatorMesh02.StrawberryRebuild.scb | additive | 1 曲线1点 随机 | 6 | (4.51, 2.65, 14.6) 曲线1点 随机 |  曲线1点 随机 | — |
| 10 | `Rocks` | billboard | Strawberry_Boss_RekSai_Base_W_Bubble01.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 30 | (53, 2.65, 2.65) 曲线1点 随机 | (0.16, 1, 0.84, 0.66) 曲线3点 | — |
| 11 | `Rocks1` | quad | Strawberry_Boss_RekSai_Base_W_LinearSplashes_02_GS_02.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 15 | (23.9, 18.6, 0) 曲线1点 随机 | (0.0667, 1, 0.612, 0.612) 曲线3点 | — |
| 12 | `GroundLines` | quad | Strawberry_Boss_RekSai_Base_W_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.6 | 1 | (583, 796, 1.59e+03) | (0.09, 0.12, 0.2, 0.96) | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_W_cas_knockup_child`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_W_cas_knockup_child` · SHA-256 `696557602cec140a…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `rockShard_Spike` | mesh | Strawberry_Boss_RekSai_Base_W_8.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W10.StrawberryRebuild.scb | mode3 | 1.5 | 1 | (18.4, 17.1, 18.4) |  | — |
| 1 | `rockShard_Spike1` | mesh | Strawberry_Boss_RekSai_Base_W_8.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W9.StrawberryRebuild.scb | mode3 | 1.5 | 2 | (20.4, 16.5, 20.4) 曲线1点 随机 |  | — |
| 2 | `CannonSpike` | mesh | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_glow.StrawberryRebuild.scb | additive | 1.5 | 1 | (18.4, 17.1, 18.4) | (0.94, 0.94, 0.94, 0.75) | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_W_movement_idle`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_W_movement_idle` · SHA-256 `0c84154587f63c57…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `DirtBits` | billboard | Strawberry_Boss_RekSai_Base_W_Bubble02.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 20 | (25, 5, 5) 曲线1点 随机 | (0.56, 0.69, 1, 1) 曲线1点 随机 | — |
| 1 | `Sphere_core` | billboard | Strawberry_Boss_RekSai_Base_Glow_02.StrawberryRebuild.dds | additive | 1 | 5 | (80, 30, 40) | (1, 1, 1, 0.33) | — |
| 2 | `mists` | billboard | Strawberry_Boss_RekSai_Base_Sl_Dust_01.StrawberryRebuild.dds | additive | 2 曲线1点 随机 | 100 | (40, 1, 0) 曲线1点 随机 | (1, 1, 1, 0.16) | — |
| 3 | `Soft_VertBlend` | arbitraryTrail | Strawberry_Boss_RekSai_Base_W_mistTrailSoft.StrawberryRebuild.dds | alpha | 0.35 | 1 | (135, 135, 135) | (0.349, 0.31, 0.902, 1) 曲线4点 | — |
| 4 | `sparks Pink` | quad | Strawberry_Boss_RekSai_Base_W_Shapes02.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 15 | (15, 20, 0) 曲线1点 随机 |  | — |
| 5 | `knock_up_ring` | quad | common_PoroSnack_glow.StrawberryRebuild.dds | alpha | -1 | 2 | (160, 420, 0) | (0.122, 0.106, 0.224, 1) | — |
| 6 | `knock_up_ring1` | quad | common_PoroSnack_glow.StrawberryRebuild.dds | alpha | -1 | 2 | (100, 420, 0) | (0, 0.24, 0.29, 0.39) | — |
| 7 | `Trail_add_Right` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Trail_05.StrawberryRebuild.dds | alpha | 0.5 | 50 | (100, 50, 0) 曲线2点 | (0.87, 0.97, 0.97, 1) 曲线1点 | — |
| 8 | `Trail_add_Left` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Trail_05.StrawberryRebuild.dds | alpha | 0.5 | 50 | (100, 50, 0) 曲线2点 | (0.87, 0.97, 0.97, 1) 曲线1点 | — |
| 9 | `swirl_main_side` | mesh | Strawberry_Boss_RekSai_Base_W_07.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Particles_1_1311.StrawberryRebuild.scb | additive | 1 | 2 | (1.1, 1.8, 1.2) | (1, 0.137, 0.369, 1) 曲线4点 | — |
| 10 | `Shockwave_blend` | mesh | Strawberry_Boss_RekSai_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 2 曲线1点 随机 | 2 | (0.6, 0.8, 0.6) | (0.94, 0.11, 0.47, 0.6) 曲线2点 | — |
| 11 | `plasma` | attachedMesh | Strawberry_Boss_RekSai_Base_W_Trail_013.StrawberryRebuild.dds | additive | -1 | 1 | (1, 1, 1) | (0.659, 0.412, 1, 1) | — |
| 12 | `Soft_VertAdd` | arbitraryTrail | Strawberry_Boss_RekSai_Base_W_mistTrailSoft.StrawberryRebuild.dds | alpha | 0.37 | 1 | (135, 135, 135) | (0.11, 0.102, 0.251, 1) 曲线4点 | — |
| 13 | `Black_Trail` | cameraTrail | Strawberry_Boss_RekSai_Base_W_SmallStarTrail_Blurred.StrawberryRebuild.dds | alpha | 0.125 | 200 | (150, 135, 135) | (0.06, 0.08, 0.24, 1) | — |
| 14 | `Dark_Trail` | cameraTrail | Strawberry_Boss_RekSai_Base_W_SmallStarTrail_White.StrawberryRebuild.dds | alpha | 0.125 | 200 | (100, 135, 135) | (0.0235, 1, 0.886, 1) | — |
| 15 | `Glow` | quad | Strawberry_Boss_RekSai_Base_3026_Items_ball32_02.StrawberryRebuild.dds | additive | 1.2 | 2 | (110, 210, 210) 曲线1点 随机 | (0.839, 0.0745, 0.192, 0.588) | — |
| 16 | `dome` | mesh | Strawberry_Boss_RekSai_Base_Noise_02.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Particles_2_75.StrawberryRebuild.scb | additive | 1 | 20 | (1.3, 0.8, 1) 曲线1点 随机 |  | — |
| 17 | `Water_Splash_Trail` | quad | Strawberry_Boss_RekSai_Base_W_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.45 曲线1点 随机 | 30 | (40, 40, 0) 曲线1点 随机 | (0.733, 1, 0.922, 0.878) 曲线1点 随机 | — |
| 18 | `GroundBurn` | quad | Strawberry_Boss_RekSai_Base_Glow_02.StrawberryRebuild.dds | alpha | 1 | 8 | (60, 160, 200) 曲线1点 随机 | (0.133, 0.098, 0.263, 1) | — |
| 19 | `GroundBurn1` | quad | Strawberry_Boss_RekSai_Base_Glow_02.StrawberryRebuild.dds | alpha | 1 | 2 | (90, 200, 200) | (0.161, 0.145, 0.271, 1) | — |
| 20 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_W_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 90 | (55, 35, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 21 | `Wet_Ground` | quad | Strawberry_Boss_RekSai_Base_W_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.5 曲线1点 随机 | 8 | (110, 200, 230) | (0.0902, 0.208, 0.259, 0.561) | — |
| 22 | `TearDrop` | mesh | Strawberry_Boss_RekSai_Base_W_11.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Burrowed_W_TearDrop.StrawberryRebuild.scb | alpha | 1 曲线1点 随机 | 15 | (1.3, 1, 1) | (1, 1, 1, 0.73) | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_W_Plasma_idle`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_W_Plasma_idle` · SHA-256 `fc46449ee49d7976…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `plasma` | mesh | Strawberry_Boss_RekSai_Base_W_Plasma.StrawberryRebuild.dds / Strawberry_Boss_RekSai_base_w_electricity.StrawberryRebuild.scb | additive | 0.75 曲线1点 随机 | 0.3 曲线1点 随机 | (0.75, 0.3, 1) 曲线1点 随机 |  | — |
| 1 | `Avatar` | mesh | Strawberry_Boss_RekSai_Base_Burrowed_W_Fin.StrawberryRebuild.dds / Strawberry_Boss_RekSai_base_burrowed_w_fin.StrawberryRebuild.scb | additive | 1.5 | 1 | (1.2, 1, 0.9) |  | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_W_stop_idle`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_W_stop_idle` · SHA-256 `29c711ba818a7291…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `cracks_left` | mesh | Strawberry_Boss_RekSai_Base_W_Down_move_crack.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_Down_move_crack.StrawberryRebuild.scb | alpha | 0.8 | 4 | (1.25, 4, 1.5) 曲线1点 随机 |  | — |
| 1 | `cracks_right` | mesh | Strawberry_Boss_RekSai_Base_W_Down_move_crack.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_Down_move_crack.StrawberryRebuild.scb | alpha | 0.8 | 4 | (1.25, 4, 1.5) 曲线1点 随机 |  | — |
| 2 | `GroundBurn` | quad | Strawberry_Boss_RekSai_Base_W_ground_burn.StrawberryRebuild.dds | alpha | 1.25 | 3 | (230, 350, 275) |  | — |
| 3 | `rockshards` | billboard | Strawberry_Boss_RekSai_Base_W_Clumps.StrawberryRebuild.dds | alpha | 1.2 曲线1点 随机 | 200 | (17, 17, 17) 曲线1点 随机 |  | — |
| 4 | `smoke` | billboard | Strawberry_Boss_RekSai_Base_W_Down_move_dust.StrawberryRebuild.dds | alpha | 1.2 曲线1点 随机 | 30 | (30, 30, 30) 曲线1点 随机 |  | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_W_tar_knockup`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_W_tar_knockup` · SHA-256 `4c946a30509ac074…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Tornado` | mesh | Strawberry_Boss_RekSai_Base_W_knock_up_tar.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_knock_up_tar.StrawberryRebuild.scb | additive | 0.7 曲线1点 随机 | 60 | (0.5, 1, 0.5) 曲线1点 随机 | (1, 0.424, 0.51, 1) | — |
| 1 | `Lightning_Flash` | billboard | Strawberry_Boss_RekSai_Base_Alpha_Backdrop.StrawberryRebuild.dds | additive | 0.15 | 2 | (140, 50, 140) |  | — |

### `Strawberry_Boss_RekSai_Base_Burrowed_W_tar_KnockupImmune`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Burrowed_W_tar_KnockupImmune` · SHA-256 `52c621f7dba06379…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `ground_glow` | quad | Strawberry_Boss_RekSai_Base_W_knock_up_glow.StrawberryRebuild.dds | additive | 13 | 2 | (170, 170, 170) |  | — |
| 1 | `Timer` | mesh | Strawberry_Boss_RekSai_Base_W_knockup_timer.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_knockup_timer.StrawberryRebuild.sco | additive | 10 | 1 | (20, 20, 0) |  | — |

### `Strawberry_Boss_RekSai_Base_E_hit_tar`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_E_hit_tar` · SHA-256 `541e88fb1806e1da…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `smoke1` | billboard | Strawberry_Boss_RekSai_Base_E_Splash_tar.StrawberryRebuild.dds | alpha | 0.35 曲线1点 随机 | 10 | (80, 100, 80) 曲线1点 随机 |  | — |
| 1 | `Flash_core_02` | billboard | Strawberry_Boss_RekSai_Base_Burrowed_I_lines.StrawberryRebuild.dds | additive | 0.2 | 1 | (300, 300, 1) |  | — |
| 2 | `vecalign1` | billboard | Strawberry_Boss_RekSai_Base_BA_tar_spark.StrawberryRebuild.dds | alpha | 0.45 曲线1点 随机 | 7 | (10, 20, 0) 曲线1点 随机 |  | — |
| 3 | `flash1` | billboard | Strawberry_Boss_RekSai_Base_Burrowed_E_tunnel_Spark.StrawberryRebuild.dds | alpha | 0.3 | 1 | (300, 300, 1) 曲线1点 随机 |  | — |

### `Strawberry_Boss_RekSai_Base_E_hit_tar_full`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_E_hit_tar_full` · SHA-256 `c2c7265853606389…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `flash` | billboard | Strawberry_Boss_RekSai_Base_E_Spark_03.StrawberryRebuild.dds | alpha | 0.2 | 1 | (150, 275, 0) |  | — |
| 1 | `Ground_crack` | billboard | Strawberry_Boss_RekSai_Base_E_16.StrawberryRebuild.dds | alpha | 0.5 | 1 | (200, 275, 0) |  | — |
| 2 | `STAR` | billboard | Strawberry_Boss_RekSai_Base_E_Star_1.StrawberryRebuild.dds | alpha | 0.12 | 1 | (120, 100, 0) | (0, 0.996, 0.878, 1) | — |
| 3 | `CyberSparks` | billboard | Strawberry_Boss_RekSai_Base_E_CyberPart.StrawberryRebuild.dds | alpha | 0.45 曲线1点 随机 | 7 | (12, 25, 0) 曲线1点 随机 |  | — |
| 4 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_E_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.5 曲线1点 随机 | 25 | (25, 30, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 5 | `CannonSpike` | billboard | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | additive | 0.4 | 1 | (250, 1, 1) | (0.94, 0.94, 0.94, 0.7) | — |
| 6 | `Bubble_Burst` | billboard | Strawberry_Boss_RekSai_Base_E_Bubble02.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 20 | (37, 1, 1) 曲线1点 随机 | (0.788, 0.69, 1, 0.702) 曲线1点 随机 | — |
| 7 | `CannonSpike1` | billboard | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | additive | 0.3 | 1 | (150, 1, 1) | (0.937, 0.937, 0.937, 1) | — |
| 8 | `Ground_crack1` | billboard | Strawberry_Boss_RekSai_Base_E_Spark_02.StrawberryRebuild.dds | additive | 0.3 | 1 | (150, 275, 0) | (0.145, 1, 0.643, 1) | — |
| 9 | `Ground_crack2` | billboard | Strawberry_Boss_RekSai_Base_E_Spark_02.StrawberryRebuild.dds | alpha | 0.35 | 1 | (150, 275, 0) | (0.455, 0.953, 1, 1) | — |
| 10 | `flash1` | billboard | Strawberry_Boss_RekSai_Base_E_Glow_01.StrawberryRebuild.dds | alpha | 0.25 | 2 | (260, 190, 1) 曲线1点 随机 |  | — |
| 11 | `smoke` | billboard | Strawberry_Boss_RekSai_Base_E_Splash_tar.StrawberryRebuild.dds | alpha | 0.35 曲线1点 随机 | 10 | (80, 100, 80) 曲线1点 随机 |  | — |
| 12 | `vecalign` | billboard | Strawberry_Boss_RekSai_Base_E_tar_spark.StrawberryRebuild.dds | alpha | 0.45 曲线1点 随机 | 7 | (10, 20, 0) 曲线1点 随机 |  | — |

### `Strawberry_Boss_RekSai_Base_I_Fin_glow`（0 层，仅作子系统容器或空壳）

### `Strawberry_Boss_RekSai_Base_Q_swipe_cas`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Q_swipe_cas` · SHA-256 `305eb8b2b08b7c36…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Glow` | quad | Strawberry_Boss_RekSai_Base_Q_Glow_01.StrawberryRebuild.dds | alpha | 0.5 | 1 | (190, 210, 0) |  | — |
| 1 | `mesh_ground` | mesh | Strawberry_Boss_RekSai_Base_Q_WolfScratch.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_Claws.StrawberryRebuild.scb | alpha |  | 1 | (0.4, 1, 1) |  | — |
| 2 | `dark_wind` | mesh | Strawberry_Boss_RekSai_Base_wind_blow_01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_Q_slash_black.StrawberryRebuild.scb | alpha | 0.7 曲线1点 随机 | 4 | (2.3, 2, 2) | (0.259, 0.224, 0.616, 0.549) 曲线3点 | — |
| 3 | `Slashes` | mesh | Strawberry_Boss_RekSai_Base_Q_Slash_Test.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_Slashes.StrawberryRebuild.scb | alpha | 0.35 | 1 | (5.3, 600, 150) |  | — |
| 4 | `GroundGlow2` | quad | Strawberry_Boss_RekSai_Base_Q_011.StrawberryRebuild.dds | alpha | 0.7 | 3 | (310, 1.2, 1.2) |  | — |
| 5 | `GroundGlow3` | quad | Strawberry_Boss_RekSai_Base_Q_08.StrawberryRebuild.dds | alpha | 0.6 | 2 | (310, 1.2, 1.2) | (0.855, 0.855, 0.855, 0.949) | — |
| 6 | `GroundGlow5` | quad | Strawberry_Boss_RekSai_Base_Q_08.StrawberryRebuild.dds | additive | 0.9 | 2 | (310, 1.2, 1.2) |  | — |
| 7 | `GroundGlow6` | quad | Strawberry_Boss_RekSai_Base_Q_013.StrawberryRebuild.dds | alpha | 0.9 | 2 | (310, 1.2, 1.2) | (0.0157, 0.596, 0.51, 1) | — |
| 8 | `GroundGlow7` | quad | Strawberry_Boss_RekSai_Base_Q_013.StrawberryRebuild.dds | additive | 0.9 | 1 | (310, 1.2, 1.2) |  | — |
| 9 | `stormDarkness2` | quad | Strawberry_Boss_RekSai_Base_Q_05.StrawberryRebuild.dds | alpha | 0.5 | 1 | (195, 200, 0) | (0.835, 0.835, 0.835, 1) | — |
| 10 | `stormDarkness3` | quad | Strawberry_Boss_RekSai_Base_Q_051.StrawberryRebuild.dds | additive | 0.5 | 1 | (195, 200, 0) | (0.84, 0.84, 0.84, 1) | — |
| 11 | `stormDarkness4` | quad | Strawberry_Boss_RekSai_Base_Q_06.StrawberryRebuild.dds | additive | 0.5 | 1 | (195, 200, 0) |  | — |
| 12 | `Lightning_AOE_Ring` | mesh | Strawberry_Boss_RekSai_Base_Q_25.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_Decal_Edge.StrawberryRebuild.scb | additive | 0.6 曲线1点 随机 | 2 | (2.5, 1, 2.2) | (1, 1, 1, 0.6) 曲线1点 随机 | — |
| 13 | `Slashes2` | mesh | Strawberry_Boss_RekSai_Base_Q_SlashUlt.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_Slashes.StrawberryRebuild.scb | additive | 0.3 | 10 | (5.4, 600, 150) |  | — |
| 14 | `Slashes3` | mesh | Strawberry_Boss_RekSai_Base_Q_SlashUlt.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_Slashes.StrawberryRebuild.scb | additive | 0.3 | 2 | (5.4, 600, 150) |  | — |
| 15 | `Slayer_spark_shoot_up` | billboard | Strawberry_Boss_RekSai_Base_Q_Shapes02.StrawberryRebuild.dds | alpha | 1.5 曲线1点 随机 | 50 | (15, 15, 0) 曲线1点 随机 | (0.937, 0.106, 0.467, 1) | — |
| 16 | `mesh_ground1` | mesh | Strawberry_Boss_RekSai_Base_Q_Wisps.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_weaponswipe.StrawberryRebuild.scb | alpha | 1 | 2 | (0.7, 0.8, 0.8) |  | — |
| 17 | `Slashes4` | mesh | Strawberry_Boss_RekSai_Base_Q_SlashUlt.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_Slashes_02.StrawberryRebuild.scb | additive | 0.15 | 2 | (5.5, 600, 150) |  | — |
| 18 | `Slashes5` | mesh | Strawberry_Boss_RekSai_Base_Q_Slash_Test.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_Slashes_02.StrawberryRebuild.scb | alpha | 0.15 | 1 | (5.5, 600, 150) | (0.427, 0.00784, 0.157, 0.369) | — |
| 19 | `dark2` | mesh | Strawberry_Boss_RekSai_Base_Q_Void_slash_01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_void_slash_01.StrawberryRebuild.scb | alpha | 0.5 曲线1点 随机 | 12 | (1.5, 1, 1.5) 曲线1点 随机 |  | — |
| 20 | `dark3` | mesh | Strawberry_Boss_RekSai_Base_Q_Void_slash_01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_void_slash_01.StrawberryRebuild.scb | alpha | 0.5 曲线1点 随机 | 12 | (1.5, 1, 1.5) 曲线1点 随机 | (0.91, 0.4, 1, 0.42) | — |
| 21 | `stormDarkness5` | mesh | Strawberry_Boss_RekSai_Base_Q_ground_wind_01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q_slash_donut_01.StrawberryRebuild.scb | additive | 1.2 曲线1点 随机 | 10 | (7, 7, 7) |  | — |
| 22 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_Q_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 25 | (55, 35, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 23 | `knock_up_ring1` | quad | common_PoroSnack_glow.StrawberryRebuild.dds | alpha | 0.6 | 2 | (140, 420, 0) | (0, 0.227, 0.29, 0.761) | — |

### `Strawberry_Boss_RekSai_Base_Spawn_ArenaWall`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Spawn_ArenaWall` · SHA-256 `24137a2915bdf733…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `rock` | mesh | Jarvan_Base_Spawn_Wall_TUpdate02.StrawberryRebuild.dds / Jarvin_Base_Spawn_CatacylsmRocks01.StrawberryRebuild.scb | mode3 | -1 | 1 | (4, 3, 1) |  | — |
| 1 | `Glow` | quad | Jarvan_Base_Spawn_Ground_rock.StrawberryRebuild.dds | alpha | -1 | 1 | (1.1e+03, 750, 200) 曲线1点 随机 |  | — |

### `Strawberry_Boss_RekSai_Base_Spawn_KnockUpPlayersTowardArena`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Spawn_KnockUpPlayersTowardArena` · SHA-256 `e87625b70f272ced…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `ground_crack` | quad | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | alpha | 1.2 | 2 | (260, 300, 300) | (0.14, 0.11, 0.22, 1) | — |
| 1 | `rockShard_Spike` | billboard |  | mode3 | 1.5 | 1 | (5.5, 9, 5.5) |  | — |
| 2 | `RingFire` | mesh | Strawberry_Boss_RekSai_Base_Ring_01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_land_RingFire_01.StrawberryRebuild.scb | alpha | 1.4 | 2 | (1.9, 1.5, 5) | (0.00999, 1, 0.88, 0.79) | — |
| 3 | `CannonSpike` | quad | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | additive | 0.5 | 1 | (200, 1, 1) | (0.94, 0.94, 0.94, 0.8) | — |
| 4 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.5 曲线1点 随机 | 7 | (25, 34, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 5 | `CannonSpike1` | billboard | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | additive | 0.4 | 1 | (250, 1, 1) | (0.94, 0.94, 0.94, 0.7) | — |
| 6 | `Bubble_Burst` | billboard | Strawberry_Boss_RekSai_Base_Bubble02.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 30 | (23, 1, 1) 曲线1点 随机 | (0.788, 0.69, 1, 0.702) 曲线1点 随机 | — |
| 7 | `Center_Ripple` | mesh | Strawberry_Boss_RekSai_Base_shield_Mult.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_waveBACK.StrawberryRebuild.scb | alpha | 0.8 曲线1点 随机 | 8 | (1.4, 2, 1.4) 曲线1点 随机 |  曲线1点 随机 | — |
| 8 | `Shockwave_blend` | mesh | Strawberry_Boss_RekSai_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 0.6 | 1 | (0.5, 2.4, 0.5) | (0.94, 0.11, 0.47, 1) | — |
| 9 | `Water_Splash1` | billboard | Strawberry_Boss_RekSai_Base_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 15 | (60, 50, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 10 | `Ripples` | mesh | Strawberry_Boss_RekSai_Base_27.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_IndicatorMesh02.StrawberryRebuild.scb | additive | 1 曲线1点 随机 | 6 | (1.7, 1, 5.5) 曲线1点 随机 |  曲线1点 随机 | — |
| 11 | `Rocks` | billboard | Strawberry_Boss_RekSai_Base_Bubble01.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 30 | (20, 1, 1) 曲线1点 随机 | (0.16, 1, 0.84, 0.66) 曲线3点 | — |
| 12 | `Rocks1` | quad | Strawberry_Boss_RekSai_Base_LinearSplashes_02_GS_02.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 15 | (9, 7, 0) 曲线1点 随机 | (0.0667, 1, 0.612, 0.612) 曲线3点 | — |
| 13 | `GroundLines` | quad | Strawberry_Boss_RekSai_Base_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.6 | 1 | (220, 300, 600) | (0.09, 0.12, 0.2, 0.96) | — |

### `Strawberry_Boss_RekSai_Base_Spawn_KnockUpPlayersTowardArena_child`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Spawn_KnockUpPlayersTowardArena_child` · SHA-256 `8e97d688f9e31544…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `rockShard_Spike` | mesh | Strawberry_Boss_RekSai_Base_8.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W10.StrawberryRebuild.scb | mode3 | 1.5 | 1 | (8.3, 13, 8.3) |  | — |
| 1 | `rockShard_Spike1` | mesh | Strawberry_Boss_RekSai_Base_8.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W9.StrawberryRebuild.scb | mode3 | 1.5 | 2 | (8.5, 9, 8.5) 曲线1点 随机 |  | — |
| 2 | `CannonSpike` | mesh | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_glow.StrawberryRebuild.scb | additive | 1.5 | 1 | (8.3, 13, 8.3) | (0.94, 0.94, 0.94, 0.75) | — |

### `Strawberry_Boss_RekSai_Base_Spawn_MapWide_Spikes`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Spawn_MapWide_Spikes` · SHA-256 `1cb66e723c415016…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `rockShard_Spike` | mesh | Strawberry_Boss_RekSai_Base_8.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W10.StrawberryRebuild.scb | alpha | 4 曲线1点 随机 | 5e+03 | (5, 20, 5) 曲线1点 随机 |  曲线1点 随机 | — |

### `Strawberry_Boss_RekSai_Base_Tunnel_Beam`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Tunnel_Beam` · SHA-256 `31c502d88a6a8f3d…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `base_bright_glow` | beam | Base_Tunnel_Beam_glow.StrawberryRebuild.dds | additive | 1 | 1.75 | (50, 1, 1) | (1, 0.125, 0.243, 0.431) | — |
| 1 | `base_bright_glow1` | beam | Base_Tunnel_Beam_glow.StrawberryRebuild.dds | additive | 1 | 1.75 | (10, 1, 1) | (1, 0.42, 0.718, 1) | — |
| 2 | `base_dark_glow` | beam | Base_Tunnel_Beam_glow.StrawberryRebuild.dds | alpha | 2 | 2 | (90, 1, 1) | (0.15, 0.22, 0.62, 0.69) | — |

### `Strawberry_Boss_RekSai_Base_W_buf_knockup_ring`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_W_buf_knockup_ring` · SHA-256 `0ad00ea7e9566811…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `knock_up_ring` | quad | Strawberry_Boss_RekSai_Base_Burrowed_W_knock_up_Ring.StrawberryRebuild.dds | additive | 1.5 | 1 | (420, 420, 0) |  | — |

### `Strawberry_Boss_RekSai_Base_W_buf_TremorSense_ring`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_W_buf_TremorSense_ring` · SHA-256 `d10845309a0a9ac8…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `TeamCircle-Green` | mesh | Strawberry_Boss_RekSai_Base_Burrowed_W_tremor_ring.StrawberryRebuild.dds / Strawberry_Boss_RekSai_base_burrowed_w_tremor_ring.StrawberryRebuild.scb | additive | 2 | 1 | (25, 25, 25) |  | — |

### `Strawberry_Boss_RekSai_Base_W_cas_burrow`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_W_cas_burrow` · SHA-256 `b7472a0c8454bfcd…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `rockshards1` | billboard | Strawberry_Boss_RekSai_Base_W_Bubble02.StrawberryRebuild.dds | additive | 1.5 曲线1点 随机 | 40 | (42.2, 1.69, 1.69) 曲线1点 随机 | (0.87, 0.73, 1, 0.57) | — |
| 1 | `Center_Ripple` | mesh | Strawberry_Boss_RekSai_Base_shield_Mult.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_waveBACK.StrawberryRebuild.scb | alpha | 0.8 曲线1点 随机 | 8 | (3.38, 3.38, 3.38) 曲线1点 随机 |  曲线1点 随机 | — |
| 2 | `Ripples` | mesh | Strawberry_Boss_RekSai_Base_W_27.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W_IndicatorMesh02.StrawberryRebuild.scb | additive | 0.8 曲线1点 随机 | 4 | (4.22, 1.69, 9.28) 曲线1点 随机 |  曲线1点 随机 | — |
| 3 | `Cyber_Sparks_b` | billboard | Strawberry_Boss_RekSai_Base_W_Shapes02.StrawberryRebuild.dds | alpha | 0.8 曲线1点 随机 | 5 | (50.6, 84.4, 0) 曲线1点 随机 | (0.937, 0.106, 0.467, 1) 曲线1点 随机 | — |
| 4 | `GroundLines1` | quad | Strawberry_Boss_RekSai_Base_W_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.4 | 1 | (400, 506, 1.01e+03) | (0.11, 0.145, 0.251, 0.8) | — |
| 5 | `Shockwave_blend` | mesh | Strawberry_Boss_RekSai_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 0.6 | 1 | (1.01, 4.05, 1.01) | (0.94, 0.11, 0.47, 1) | — |
| 6 | `Bubble_Burst` | billboard | Strawberry_Boss_RekSai_Base_W_Bubble02.StrawberryRebuild.dds | additive | 1.3 曲线1点 随机 | 20 | (50.6, 1.69, 1.69) 曲线1点 随机 | (0.79, 0.69, 1, 0.6) 曲线1点 随机 | — |
| 7 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_W_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 10 | (118, 101, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 8 | `Head_Flash` | quad | Strawberry_Boss_RekSai_Base_W_Glow_01.StrawberryRebuild.dds | additive | 0.3 | 1 | (1.01e+03, 1.1e+03, 0) | (0, 0.576, 0.404, 0.702) | — |
| 9 | `Slayer__mesh_ground` | mesh | Strawberry_Boss_RekSai_Base_W_Smoke_2.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_weaponswipe.StrawberryRebuild.scb | alpha | 0.75 曲线1点 随机 | 6 | (1.35, 1.35, 1.35) | (0.16, 0.12, 0.25, 0.63) | — |

### `Strawberry_Boss_RekSai_Base_W_tar_TremorSense_Champion`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_W_tar_TremorSense_Champion` · SHA-256 `96a7925c430f0ebc…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Tremor` | quad | Strawberry_Boss_RekSai_Base_W_Basic_Impact_ring.StrawberryRebuild.dds | alpha | 1.25 | 4 | (210, 210, 210) | (0.247, 0.18, 0.51, 0.471) | — |
| 1 | `Tremor1` | quad | Strawberry_Boss_RekSai_Base_W_Indicator_ring.StrawberryRebuild.dds | alpha | 1.25 | 1 | (210, 210, 210) | (0.333, 0.0196, 0.208, 1) | — |
| 2 | `Tremor2` | quad | Strawberry_Boss_RekSai_Base_Burrowed_W_nova_flash.StrawberryRebuild.dds | additive | 0.1 曲线1点 随机 | 1 | (500, 500, 500) |  | — |
| 3 | `Tremor3` | quad | Strawberry_Boss_RekSai_Base_W_Indicator_ring.StrawberryRebuild.dds | alpha | 1.25 | 5 | (240, 240, 240) |  | — |
| 4 | `Tremor4` | quad | Strawberry_Boss_RekSai_Base_W_Basic_Impact_ring.StrawberryRebuild.dds | additive | 1.25 | 1 | (210, 210, 210) | (1, 1, 1, 0.39) | — |
| 5 | `Tremor5` | quad | Strawberry_Boss_RekSai_Base_W_Basic_Impact_ring.StrawberryRebuild.dds | additive | 1.25 | 2 | (210, 210, 210) |  | — |
| 6 | `Shockwave_blend` | mesh | Strawberry_Boss_RekSai_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 0.6 | 1 | (0.6, 1, 0.6) | (0.94, 0.11, 0.47, 0.77) | — |

### `Strawberry_Boss_RekSai_Base_Z_Burrowed_AOE_Explosion`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_Burrowed_AOE_Explosion` · SHA-256 `df31f1a035125afe…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `ground_crack` | quad | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | alpha | 2 | 2 | (762, 381, 381) | (0.14, 0.11, 0.22, 1) | — |
| 1 | `rockShard_Spike` | billboard |  | mode3 | 1.5 | 2 | (6.99, 11.4, 6.99) |  | — |
| 2 | `RingFire` | mesh | Strawberry_Boss_RekSai_Base_Z_Ring_01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_land_RingFire_01.StrawberryRebuild.scb | alpha | 2 | 2 | (8.9, 1.91, 6.35) | (0.00999, 1, 0.88, 0.79) | — |
| 3 | `CannonSpike` | quad | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | additive | 2 | 1 | (900, 1.27, 1.27) | (0.94, 0.94, 0.94, 0.8) | — |
| 4 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_Z_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.75 曲线1点 随机 | 30 | (76.2, 89, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 5 | `glowAdd` | billboard | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | additive | 0.75 | 1 | (1.27e+03, 1.27, 1.27) | (0.94, 0.94, 0.94, 1) | — |
| 6 | `Bubble_Burst` | billboard | Strawberry_Boss_RekSai_Base_Z_Bubble02.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 30 | (50.8, 1.27, 1.27) 曲线1点 随机 | (0.788, 0.69, 1, 0.702) 曲线1点 随机 | — |
| 7 | `Center_Ripple` | mesh | Strawberry_Boss_RekSai_Base_shield_Mult.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_waveBACK.StrawberryRebuild.scb | alpha | 1 曲线1点 随机 | 8 | (3, 3, 3) 曲线1点 随机 |  曲线1点 随机 | — |
| 8 | `Shockwave_blend` | mesh | Strawberry_Boss_RekSai_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 0.6 | 1 | (1.91, 3.05, 1.91) | (0.94, 0.11, 0.47, 1) | — |
| 9 | `Water_Splash1` | billboard | Strawberry_Boss_RekSai_Base_Z_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 15 | (191, 127, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 10 | `Ripples` | mesh | Strawberry_Boss_RekSai_Base_Z_27.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_IndicatorMesh02.StrawberryRebuild.scb | additive | 1 曲线1点 随机 | 6 | (7.62, 1.27, 6.99) 曲线1点 随机 |  曲线1点 随机 | — |
| 11 | `Rocks` | billboard | Strawberry_Boss_RekSai_Base_Z_Bubble01.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 30 | (63.5, 1.27, 1.27) 曲线1点 随机 | (0.16, 1, 0.84, 0.66) 曲线3点 | — |
| 12 | `Rocks1` | quad | Strawberry_Boss_RekSai_Base_Z_LinearSplashes_02_GS_02.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 15 | (11.4, 8.9, 0) 曲线1点 随机 | (0.0667, 1, 0.612, 0.612) 曲线3点 | — |
| 13 | `GroundLines` | quad | Strawberry_Boss_RekSai_Base_Z_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.6 | 1 | (890, 381, 762) | (0.09, 0.12, 0.2, 0.96) | — |
| 14 | `pinkMotes` | billboard | Strawberry_Boss_Briar_Base_Z_Small_Mote.StrawberryRebuild.dds | default | 2 曲线1点 随机 | 150 曲线1点 随机 | (19.1, 25.4, 12.7) 曲线1点 随机 |  曲线1点 随机 | — |
| 15 | `pinkMotes_linger` | billboard | Strawberry_Boss_Briar_Base_Z_Small_Mote.StrawberryRebuild.dds | default | 2 曲线1点 随机 | 50 | (19.1, 25.4, 12.7) 曲线1点 随机 |  曲线1点 随机 | — |
| 16 | `SPARKS_SIDES` | quad | Strawberry_Boss_Briar_Base_Z_Sparks.StrawberryRebuild.dds | additive | 0.25 曲线1点 随机 | 60 | (19.1, 229, 1.27) | (1, 0, 0, 0.651) | — |
| 17 | `brighShockwave` | billboard | Strawberry_Boss_Briar_Skin26_Z_land_glow.StrawberryRebuild.dds | default | 0.3 | 1 | (254, 381, 381) | (1, 0.278, 0.278, 0.561) | — |
| 18 | `cracks` | mesh | Kassadin_Base_Z_StarryBackdrop.StrawberryRebuild.dds / Strawberry_Boss_Briar_Base_FlatPlane.StrawberryRebuild.scb | alpha | 1.3 | 1 | (6.35, 762, 762) | (0.545, 0.0392, 0.0392, 0.8) | — |
| 19 | `Light_Shapes` | quad | Jax_Skin33_Z_Shapes01.StrawberryRebuild.dds | additive | 0.35 曲线1点 随机 | 10 | (63.5, 127, 0) 曲线1点 随机 | (0, 0.898, 0.996, 1) | — |
| 20 | `focuscone` | ray | Karma_Skin26_Z_955242.StrawberryRebuild.dds | additive | 1 | 5 | (152, 1.52e+03, 0) | (1, 0.149, 0.533, 1) | — |
| 21 | `Ray_DARK_BLACK` | ray | Karma_Skin26_Primary_Z_tar_exit_smoke.StrawberryRebuild.dds | additive | 1.25 | 1 | (191, 381, 0) 曲线1点 随机 | (1, 0.149, 0.533, 1) | — |
| 22 | `Beamdown` | ray | Base_GlowStar_02.StrawberryRebuild.dds | additive | 0.5 | 1 | (254, 635, 127) |  | — |
| 23 | `centerFlare` | billboard | Karma_Skin26_Z_1442.StrawberryRebuild.dds | additive | 0.15 | 3 | (635, 508, 508) |  | — |
| 24 | `Temp_GroundGlow` | quad | Strawberry_Boss_RekSai_Base_Z_Decal_05.StrawberryRebuild.tex | alpha | 0.5 | 1 | (720, 150, 50) | (0.65, 0.1, 0.36, 0.25) | — |
| 25 | `Temp_GroundGlow1` | quad | Strawberry_Boss_RekSai_Base_Z_Decal_05.StrawberryRebuild.tex | additive | 0.5 | 1 | (720, 150, 50) | (0.94, 0, 0.3, 0.15) | — |

### `Strawberry_Boss_RekSai_Base_Z_FallingDebris_Explosion`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_FallingDebris_Explosion` · SHA-256 `11c725bdf85803f1…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Crack_radial` | quad | GnarBig_Base_Z_cracks_radial.StrawberryRebuild.dds | alpha | 2 | 1 | (400, -400, 0) |  | — |
| 1 | `Flash1` | quad | Strawberry_MiniBoss_Vacuum_Base_Z_TrampleAOE_Glow.StrawberryRebuild.dds | additive | 0.5 | 1 | (300, 380, 380) | (1, 0.0527, 0.0392, 1) | — |
| 2 | `Embers` | billboard | Strawberry_MiniBoss_Vacuum_Base_glowspecks.StrawberryRebuild.dds | additive | 2 曲线1点 随机 | 20 | (36, 6, 2) 曲线1点 随机 |  | — |
| 3 | `Rock` | mesh | GnarBig_Base_Z_FallingDebris_Explosion.StrawberryRebuild.dds / gnarbig_Base_Z_FallingDebris_Explosion.StrawberryRebuild.scb | mode3 | 2 | 1 | (2, 6, 2) |  | — |
| 4 | `Rock1` | mesh | GnarBig_Base_Z_FallingDebris_Explosion.StrawberryRebuild.dds / gnarbig_Base_Z_FallingDebris_Explosion.StrawberryRebuild.scb | alpha | 2.5 | 1 | (2, 1, 1) |  | — |
| 5 | `Splash` | billboard | Strawberry_Boss_RekSai_Base_Burrowed_Z_Splash_tar.StrawberryRebuild.dds | additive | 0.6 曲线1点 随机 | 8 | (150, 150, 150) 曲线1点 随机 |  | — |
| 6 | `explosion` | billboard | Strawberry_Boss_RekSai_Base_Z_Tunnel_Explosion.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 5 | (350, 350, 0) 曲线1点 随机 | (1, 0.42, 0.64, 0.6) | — |
| 7 | `Flash_suck` | quad | Strawberry_Boss_RekSai_Base_Burrowed_Z_nova_flash.StrawberryRebuild.dds | default | 0.1 曲线1点 随机 | 1 | (300, 300, 300) |  | — |
| 8 | `Bubble_Burst` | billboard | Strawberry_Boss_RekSai_Base_Z_Bubble02.StrawberryRebuild.dds | additive | 1.3 曲线1点 随机 | 20 | (35, 1, 1) 曲线1点 随机 | (0.79, 0.69, 1, 0.6) 曲线1点 随机 | — |
| 9 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_Z_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 15 | (100, 88, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 10 | `Center_Ripple` | mesh | Strawberry_Boss_RekSai_Base_shield_Mult.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_waveBACK.StrawberryRebuild.scb | alpha | 0.8 曲线1点 随机 | 8 | (2, 2, 2) 曲线1点 随机 |  曲线1点 随机 | — |
| 11 | `GroundLines` | quad | Strawberry_Boss_RekSai_Base_Z_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.4 | 1 | (300, 300, 600) | (0.11, 0.145, 0.251, 0.8) | — |

### `Strawberry_Boss_RekSai_Base_Z_FallingDebris_Warning`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_FallingDebris_Warning` · SHA-256 `8d54fbcbc62b3fc0…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `GroundLines` | mesh | Base_Q3_decal.StrawberryRebuild.dds / Base_Mirrored_Quad1.StrawberryRebuild.scb | alpha | 1.5 | 1 | (190, 300, 600) | (0.17, 0.09, 0.15, 0.6) | — |
| 1 | `GroundLines1` | mesh | Base_Q3_decal.StrawberryRebuild.dds / Base_Mirrored_Quad1.StrawberryRebuild.scb | additive | 1.25 | 1 | (190, 300, 600) | (0.92, 0.02, 0.16, 1) | — |
| 2 | `GroundLines2` | quad | Base_03_Circle_light.StrawberryRebuild.dds | alpha | 0.45 | 1 | (400, 300, 600) | (1, 1, 1, 0.4) | — |
| 3 | `dots` | quad | Strawberry_MiniBoss_Vacuum_Base_Spawn_TrampleAOE_Glow.StrawberryRebuild.dds | additive | 1 | 1 | (330, 400, 400) | (1, 1, 1, 0.25) | — |
| 4 | `BaseRing` | quad | Strawberry_Boss_Reksai_Generic_shape.StrawberryRebuild.tex | alpha | 1 | 1 | (375, 400, 400) | (1, 1, 1, 0.74) | — |

### `Strawberry_Boss_RekSai_Base_Z_HitMissile_AvatarBurst`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_HitMissile_AvatarBurst` · SHA-256 `856d9a81e3f12ff5…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Avatar` | attachedMesh | SRU_JungleBuff_Baron_MeleeMin_AvatarOverlay.StrawberryRebuild.dds | additive | 0.5 | 1 |  |  | — |
| 1 | `Avatar1` | attachedMesh | RekSai_Skin26_TX_CM_Mask2.StrawberryRebuild.dds | additive | 0.5 | 3 |  | (0.914, 0.271, 1, 1) | — |
| 2 | `Avatar2` | attachedMesh | RekSai_Skin26_TX_CM_Mask3.StrawberryRebuild.dds | additive |  | 3 |  | (0.914, 0.271, 1, 1) | — |

### `Strawberry_Boss_RekSai_Base_Z_HurtFlash`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_HurtFlash` · SHA-256 `e982dc58e0d1b08e…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Avatar` | attachedMesh | white_RGB.StrawberryRebuild.dds | alpha | 1 | 1 |  | (1, 0, 0, 1) | — |
| 1 | `Avatar1` | attachedMesh | white_RGB.StrawberryRebuild.dds | additive | 0.4 | 1 |  |  | — |

### `Strawberry_Boss_RekSai_Base_Z_Invisible_Mask`（0 层，仅作子系统容器或空壳）

### `Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Explosion`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Explosion` · SHA-256 `fbd9260fd165223d…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `ground_crack` | quad | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | alpha | 1.2 | 2 | (762, 381, 381) | (0.14, 0.11, 0.22, 1) | — |
| 1 | `Temp_GroundGlow` | quad | Strawberry_Boss_RekSai_Base_Z_Decal_05.StrawberryRebuild.tex | alpha | 0.5 | 1 | (720, 150, 50) | (0.65, 0.1, 0.36, 0.25) | — |
| 2 | `Temp_GroundGlow1` | quad | Strawberry_Boss_RekSai_Base_Z_Decal_05.StrawberryRebuild.tex | additive | 0.5 | 1 | (720, 150, 50) | (0.94, 0, 0.3, 0.15) | — |
| 3 | `rockShard_Spike` | billboard |  | mode3 | 1.5 | 1 | (6.99, 11.4, 6.99) |  | — |
| 4 | `RingFire` | mesh | Strawberry_Boss_RekSai_Base_Z_Ring_01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_land_RingFire_01.StrawberryRebuild.scb | alpha | 1.4 | 2 | (8.9, 1.91, 6.35) | (0.00999, 1, 0.88, 0.79) | — |
| 5 | `CannonSpike` | quad | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | additive | 0.5 | 1 | (762, 1.27, 1.27) | (0.94, 0.94, 0.94, 0.8) | — |
| 6 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_Z_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.5 曲线1点 随机 | 15 | (76.2, 89, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 7 | `glowAdd` | billboard | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds | additive | 0.4 | 1 | (1.27e+03, 1.27, 1.27) | (0.94, 0.94, 0.94, 1) | — |
| 8 | `Bubble_Burst` | billboard | Strawberry_Boss_RekSai_Base_Z_Bubble02.StrawberryRebuild.dds | additive | 1 曲线1点 随机 | 30 | (50.8, 1.27, 1.27) 曲线1点 随机 | (0.788, 0.69, 1, 0.702) 曲线1点 随机 | — |
| 9 | `Center_Ripple` | mesh | Strawberry_Boss_RekSai_Base_shield_Mult.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_waveBACK.StrawberryRebuild.scb | alpha | 0.8 曲线1点 随机 | 8 | (2.54, 2.54, 2.54) 曲线1点 随机 |  曲线1点 随机 | — |
| 10 | `Shockwave_blend` | mesh | Strawberry_Boss_RekSai_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 0.6 | 1 | (1.91, 3.05, 1.91) | (0.94, 0.11, 0.47, 1) | — |
| 11 | `Water_Splash1` | billboard | Strawberry_Boss_RekSai_Base_Z_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 15 | (191, 127, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 12 | `Ripples` | mesh | Strawberry_Boss_RekSai_Base_Z_27.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_IndicatorMesh02.StrawberryRebuild.scb | additive | 1 曲线1点 随机 | 6 | (7.62, 1.27, 6.99) 曲线1点 随机 |  曲线1点 随机 | — |
| 13 | `Rocks` | billboard | Strawberry_Boss_RekSai_Base_Z_Bubble01.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 30 | (63.5, 1.27, 1.27) 曲线1点 随机 | (0.16, 1, 0.84, 0.66) 曲线3点 | — |
| 14 | `Rocks1` | quad | Strawberry_Boss_RekSai_Base_Z_LinearSplashes_02_GS_02.StrawberryRebuild.dds | additive | 0.5 曲线1点 随机 | 15 | (11.4, 8.9, 0) 曲线1点 随机 | (0.0667, 1, 0.612, 0.612) 曲线3点 | — |
| 15 | `GroundLines` | quad | Strawberry_Boss_RekSai_Base_Z_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.6 | 1 | (890, 381, 762) | (0.09, 0.12, 0.2, 0.96) | — |
| 16 | `centerFlare` | billboard | Karma_Skin26_Z_1442.StrawberryRebuild.dds | additive | 0.15 | 3 | (635, 508, 508) |  | — |
| 17 | `pinkMotes` | billboard | Strawberry_Boss_Briar_Base_Z_Small_Mote.StrawberryRebuild.dds | default | 2 曲线1点 随机 | 150 曲线1点 随机 | (19.1, 25.4, 12.7) 曲线1点 随机 |  曲线1点 随机 | — |
| 18 | `pinkMotes_linger` | billboard | Strawberry_Boss_Briar_Base_Z_Small_Mote.StrawberryRebuild.dds | default | 2 曲线1点 随机 | 50 | (19.1, 25.4, 12.7) 曲线1点 随机 |  曲线1点 随机 | — |
| 19 | `SPARKS_SIDES` | quad | Strawberry_Boss_Briar_Base_Z_Sparks.StrawberryRebuild.dds | additive | 0.25 曲线1点 随机 | 60 | (19.1, 229, 1.27) | (1, 0, 0, 0.651) | — |
| 20 | `brighShockwave` | billboard | Strawberry_Boss_Briar_Skin26_Z_land_glow.StrawberryRebuild.dds | default | 0.3 | 1 | (254, 381, 381) | (1, 0.278, 0.278, 0.561) | — |
| 21 | `cracks` | mesh | Kassadin_Base_Z_StarryBackdrop.StrawberryRebuild.dds / Strawberry_Boss_Briar_Base_FlatPlane.StrawberryRebuild.scb | alpha | 1.3 | 1 | (6.35, 762, 762) | (0.545, 0.0392, 0.0392, 0.8) | — |
| 22 | `Light_Shapes` | quad | Jax_Skin33_Z_Shapes01.StrawberryRebuild.dds | additive | 0.35 曲线1点 随机 | 10 | (63.5, 127, 0) 曲线1点 随机 | (0, 0.898, 0.996, 1) | — |
| 23 | `focuscone` | ray | Karma_Skin26_Z_955242.StrawberryRebuild.dds | additive | 1 | 5 | (152, 1.52e+03, 0) | (1, 0.149, 0.533, 1) | — |
| 24 | `Ray_DARK_BLACK` | ray | Karma_Skin26_Primary_Z_tar_exit_smoke.StrawberryRebuild.dds | additive | 1.25 | 1 | (191, 381, 0) 曲线1点 随机 | (1, 0.149, 0.533, 1) | — |
| 25 | `Beamdown` | ray | Base_GlowStar_02.StrawberryRebuild.dds | additive | 0.5 | 1 | (254, 635, 127) |  | — |

### `Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Explosion_child`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Explosion_child` · SHA-256 `f36e11936669025a…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `rockShard_Spike` | mesh | Strawberry_Boss_RekSai_Base_Z_8.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W10.StrawberryRebuild.scb | mode3 | 1.5 | 1 | (8.3, 13, 8.3) |  | — |
| 1 | `rockShard_Spike1` | mesh | Strawberry_Boss_RekSai_Base_Z_8.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_W9.StrawberryRebuild.scb | mode3 | 1.5 | 2 | (8.5, 9, 8.5) 曲线1点 随机 |  | — |
| 2 | `CannonSpike` | mesh | Strawberry_Boss_RekSai_Base_common_soft_glow.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_glow.StrawberryRebuild.scb | additive | 1.5 | 1 | (8.3, 13, 8.3) | (0.94, 0.94, 0.94, 0.75) | — |

### `Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Warning`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Warning` · SHA-256 `d3b28cf747584241…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `BaseRing` | quad | Base_Indicator_BaseRing.StrawberryRebuild.dds | alpha | 3.25 | 1 | (725, 400, 400) |  | — |
| 1 | `BaseRing1` | quad | Base_Indicator_BaseRing.StrawberryRebuild.dds | alpha | 3.25 | 1 | (725, 400, 400) |  | — |
| 2 | `Blend_FLoor` | quad | Generic_GroundBaseLayer.StrawberryRebuild.dds | alpha | 10 | 1 | (550, 1, 1) | (0, 0.07, 0.34, 0.48) | — |
| 3 | `ImpactGlow` | quad | common_PoroSnack_glow.StrawberryRebuild.dds | alpha | -1 | 1 | (1.2e+03, 1, 1) 曲线1点 随机 | (0, 0.07, 0.34, 0.44) | — |
| 4 | `Pulse` | mesh | AurelionSol_Base_Z_Fire_Noise_BW.StrawberryRebuild.dds / Vex_Base_Z_Praxis.StrawberryRebuild.scb | additive | 1.5 曲线1点 随机 | 0.5 | (5, 1, 1) | (1, 0.149, 0.533, 0.302) | — |
| 5 | `Shadows_in` | mesh | Strawberry_Boss_Briar_Base_Z_Screen_VFX_Water_wave.StrawberryRebuild.dds / Strawberry_Boss_Briar_Base_Z_ScreenWave_mesh.StrawberryRebuild.scb | additive | 2 | 2 | (40, 0, 40) | (0, 0.65, 1, 0.45) | — |
| 6 | `Temp_GroundGlow` | quad | Strawberry_Boss_Briar_Base_Z_Decal_05.StrawberryRebuild.tex | alpha | -1 | 1 | (720, 150, 50) | (0.41, 0.06, 0.23, 0.29) | — |
| 7 | `Ripple` | quad | DrMundo_Skin08_01.StrawberryRebuild.dds | alpha | 1.2 曲线1点 随机 | 5 | (1e+03, 1, 1) 曲线1点 随机 | (0.42, 0.72, 1, 0.44) 曲线1点 随机 | — |
| 8 | `Temp_GroundGlow1` | quad | Strawberry_Boss_Briar_Base_Z_Decal_0555555.StrawberryRebuild.dds | additive | -1 | 1 | (720, 150, 50) | (1, 0.15, 0.53, 0.48) | — |
| 9 | `AllyRingStaticShimmer` | mesh | Strawberry_Boss_Briar_Base_Z_StainedGlass_Pattern_Mult1.StrawberryRebuild.dds / Strawberry_Boss_Briar_Base_Z_Ring1.StrawberryRebuild.scb | alpha | -1 | 1 | (16, 0, 14.2) | (1, 1, 1, 0.82) | — |
| 10 | `Flash` | quad | Strawberry_Boss_Briar_Base_Z_StainedGlass_Pattern_Mult7.StrawberryRebuild.dds | additive | -1 | 1 | (850, 600, 0) | (1, 1, 1, 0.48) | — |
| 11 | `Shockwave_blend` | mesh | Strawberry_Boss_Briar_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_Briar_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 2 | 1 | (2.7, 2, 2.7) | (1, 0, 0, 0.95) | — |
| 12 | `AllyRingStaticShimmer1` | mesh | Strawberry_Boss_Briar_Base_Z_StainedGlass_Pattern_Mult14.StrawberryRebuild.dds / Strawberry_Boss_Briar_Base_BH_W2.StrawberryRebuild.scb | alpha | 2.6 | 1 | (30, 0, 30) | (1, 0.149, 0.533, 0.471) | — |
| 13 | `Lightning_AOE_Ring` | mesh | Strawberry_Boss_Briar_Base_Z_Lightning03.StrawberryRebuild.dds / Strawberry_Boss_Briar_Base_Z_Decal_Edge.StrawberryRebuild.scb | additive | 0.4 曲线1点 随机 | 2 | (5.8, 1, 5.8) 曲线1点 随机 |  曲线1点 随机 | — |
| 14 | `Temp_GroundGlow2` | quad | Primordian_Exploration_Decal_FloorVein_01.StrawberryRebuild.dds | alpha | 2 | 2 | (2e+03, 1, 1) 曲线6点 | (1, 1, 1, 0.24) | — |
| 15 | `finHolder` | mesh |  / Strawberry_Boss_RekSai_Spawn_Warning_Fin_Holder.StrawberryRebuild.skn | alpha | 3.25 | 1 |  |  | — |
| 16 | `finHolder1` | mesh |  / Strawberry_Boss_RekSai_Spawn_Warning_Fin_Holder.StrawberryRebuild.skn | alpha | 3.25 | 1 |  |  | — |

### `Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Warning_FinChild`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Warning_FinChild` · SHA-256 `b088c60202d39b68…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `fin` | mesh | Strawberry_Boss_RekSai_Base_Z_Trail_16.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Skin17_Z_Shark.StrawberryRebuild.scb | alpha | 3.25 | 1 | (7, 1, 1) | (0.82, 0.82, 0.82, 1) | — |
| 1 | `Glow` | quad | Strawberry_Boss_RekSai_Base_3026_Items_ball32_02.StrawberryRebuild.dds | additive | -1 | 1 | (250, 325, 191) 曲线1点 随机 | (0, 0.84, 0.56, 0.25) | — |
| 2 | `Water_Splash_Trail` | quad | Strawberry_Boss_RekSai_Base_Z_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.75 曲线1点 随机 | 10 | (76.5, 76.5, 0) 曲线1点 随机 | (0.733, 1, 0.922, 0.878) 曲线1点 随机 | — |
| 3 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_Z_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.9 曲线1点 随机 | 25 | (105, 66.9, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 4 | `swirl_main_side` | mesh | Strawberry_Boss_RekSai_Base_Z_7.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Particles_1_1311.StrawberryRebuild.scb | additive | 1 | 2 | (0.75, 1, 0.75) | (0.02, 0.82, 1, 0.15) 曲线4点 | — |
| 5 | `Trail_add_Left` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Z_7.StrawberryRebuild.dds | additive | 0.3 | 50 | (191, 95.6, 0) 曲线2点 | (1, 1, 1, 0.4) 曲线1点 | — |
| 6 | `Trail_add_Left1` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Trail_05.StrawberryRebuild.dds | alpha | 0.3 | 50 | (191, 95.6, 0) 曲线2点 | (0.87, 0.97, 0.97, 0.4) 曲线1点 | — |
| 7 | `Trail_add_Right` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Z_7.StrawberryRebuild.dds | additive | 0.3 | 50 | (191, 95.6, 0) 曲线2点 | (0.97, 0.97, 0.97, 0.4) 曲线1点 | — |
| 8 | `Trail_add_Right1` | arbitraryTrail | Strawberry_Boss_RekSai_Base_Trail_05.StrawberryRebuild.dds | alpha | 0.3 | 50 | (191, 95.6, 0) 曲线2点 | (0.87, 0.97, 0.97, 0.4) 曲线1点 | — |
| 9 | `Wet_Ground` | quad | Strawberry_Boss_RekSai_Base_Z_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.5 曲线1点 随机 | 8 | (191, 344, 440) | (0.106, 0.153, 0.259, 0.561) | — |

### `Strawberry_Boss_RekSai_Base_Z_Spawn_Crater`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_Spawn_Crater` · SHA-256 `01f30ea682b8b635…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Illaoi_Q_Crater_Hypermesh` | mesh | Illaoi_HypermeshTexture.StrawberryRebuild.tex / Strawberry_Illaoi_Crater_Hypermesh.StrawberryRebuild.scb | alpha | 5 | 1 | (2, 1, 2) | (1, 1, 1, 0.94) | — |
| 1 | `Illaoi_Q_Crater_Glow` | quad | Aura_Self.StrawberryRebuild.DDS | additive | 4 | 1 | (750, 450, 0) | (1, 0.08, 0.53, 0.47) | — |

### `Strawberry_Boss_RekSai_Base_Z_Tunnel_Spawn_Enemies`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_Tunnel_Spawn_Enemies` · SHA-256 `88aba0a0691b3781…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `rockshards` | billboard | Strawberry_Boss_RekSai_Base_Z_Bubble02.StrawberryRebuild.dds | additive | 1.5 曲线1点 随机 | 40 | (42.2, 1.69, 1.69) 曲线1点 随机 | (0.87, 0.73, 1, 0.57) | — |
| 1 | `Center_Ripple` | mesh | Strawberry_Boss_RekSai_Base_shield_Mult.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_waveBACK.StrawberryRebuild.scb | alpha | 0.8 曲线1点 随机 | 8 | (3.38, 3.38, 3.38) 曲线1点 随机 |  曲线1点 随机 | — |
| 2 | `Ripples` | mesh | Strawberry_Boss_RekSai_Base_Z_27.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_IndicatorMesh02.StrawberryRebuild.scb | additive | 0.8 曲线1点 随机 | 4 | (4.22, 1.69, 9.28) 曲线1点 随机 |  曲线1点 随机 | — |
| 3 | `Cyber_Sparks_b` | billboard | Strawberry_Boss_RekSai_Base_Z_Shapes02.StrawberryRebuild.dds | alpha | 0.8 曲线1点 随机 | 5 | (50.6, 84.4, 0) 曲线1点 随机 | (0.937, 0.106, 0.467, 1) 曲线1点 随机 | — |
| 4 | `GroundLines` | quad | Strawberry_Boss_RekSai_Base_Z_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.4 | 1 | (400, 506, 1.01e+03) | (0.11, 0.145, 0.251, 0.8) | — |
| 5 | `Shockwave_blend` | mesh | Strawberry_Boss_RekSai_Base_Shockwave_mask.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Q3_lowpoly.StrawberryRebuild.scb | additive | 0.6 | 1 | (1.01, 4.05, 1.01) | (0.94, 0.11, 0.47, 1) | — |
| 6 | `Bubble_Burst` | billboard | Strawberry_Boss_RekSai_Base_Z_Bubble02.StrawberryRebuild.dds | additive | 1.3 曲线1点 随机 | 20 | (50.6, 1.69, 1.69) 曲线1点 随机 | (0.79, 0.69, 1, 0.6) 曲线1点 随机 | — |
| 7 | `Water_Splash` | billboard | Strawberry_Boss_RekSai_Base_Z_LinearSplashes_02_GS.StrawberryRebuild.dds | alpha | 0.65 曲线1点 随机 | 10 | (118, 101, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 8 | `Head_Flash` | quad | Strawberry_Boss_RekSai_Base_Z_Glow_01.StrawberryRebuild.dds | additive | 0.3 | 1 | (1.01e+03, 1.1e+03, 0) | (0, 0.576, 0.404, 0.702) | — |
| 9 | `Slayer__mesh_ground` | mesh | Strawberry_Boss_RekSai_Base_Z_Smoke_2.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_weaponswipe.StrawberryRebuild.scb | alpha | 0.75 曲线1点 随机 | 6 | (1.35, 1.35, 1.35) | (0.16, 0.12, 0.25, 0.63) | — |

### `Strawberry_Boss_RekSai_Base_Z_WalkCrater`

来源 `Characters/Strawberry_Boss_RekSai/Skins/Skin0/Particles/Strawberry_Boss_RekSai_Base_Z_WalkCrater` · SHA-256 `2c25cb4e5f5a2508…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Clumps` | billboard | Strawberry_Boss_RekSai_Base_Z_Dirt.StrawberryRebuild.dds | alpha | 0.25 曲线1点 随机 | 25 | (75, 75, 0) 曲线1点 随机 |  曲线1点 随机 | — |
| 1 | `Conemesh_` | mesh | Strawberry_Boss_RekSai_Base_Z_AnimeShapesMesh01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_AnimeBurstMesh01.StrawberryRebuild.scb | alpha | 0.45 | 1 | (4, 2, 4) | (1, 1, 1, 0.85) | — |
| 2 | `Conemesh_1` | mesh | Strawberry_Boss_RekSai_Base_Z_AnimeShapesMesh01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Z_AnimeBurstMesh01.StrawberryRebuild.scb | alpha | 0.25 | 1 | (4, 8, 4) |  | — |
| 3 | `LIghtningJayce_Linger` | billboard | Strawberry_Boss_RekSai_Base_Z_Lightning02.StrawberryRebuild.dds | additive | 0.05 曲线1点 随机 | 10 曲线2点 | (90, 10, 0) 曲线1点 随机 | (1, 0.118, 1, 0.459) | — |
| 4 | `Crater_Impact` | mesh | Strawberry_Boss_RekSai_Base_Crater_01.StrawberryRebuild.dds / Strawberry_Boss_RekSai_Base_Crater_01.StrawberryRebuild.scb | alpha | 2 | 1 | (2.1, 4, 2.1) | (0.93, 0.89, 0.87, 0.62) | — |
| 5 | `cast_pulse` | quad | EzVGU_Tristana_Skin12_Z_Rings.StrawberryRebuild.dds | default | 0.3 | 1 | (250, 1, 1) | (0.47, 0.00999, 1, 0.2) | — |
| 6 | `LIghtningJayce_Burst` | billboard | Strawberry_Boss_RekSai_Base_Z_Lightning02.StrawberryRebuild.dds | additive | 0.15 曲线1点 随机 | 15 | (90, 10, 0) 曲线1点 随机 | (0.325, 0.71, 1, 1) | — |

### `Strawberry_MapC_BossSpawn_MapWide`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_MapC_BossSpawn_MapWide` · SHA-256 `6f81d750103e1ac1…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Temp_GroundGlow2` | quad | white_RGB.StrawberryRebuild.dds | alpha | 6 | 1 | (4e+04, 150, 50) | (0.06, 0.07, 0.15, 0.5) | — |
| 1 | `activate_Dirt_Red` | billboard | Base_Dirt_Takeoff_Style_Erode_V02.StrawberryRebuild.dds | alpha | 1.5 曲线1点 随机 | 300 | (100, 100, 1) 曲线1点 随机 | (1, 0.965, 0.843, 0.58) | — |
| 2 | `activate_Dirt_Red1` | billboard | Galio_Base_R_Cas_Dust_01.StrawberryRebuild.dds | alpha | 2 曲线1点 随机 | 300 | (250, 250, 1) 曲线1点 随机 | (1, 0.863, 0.675, 0.58) | — |
| 3 | `FakeAlarms` | quad | Strawberry_MapC_FakeAlarm.StrawberryRebuild.dds | additive | 6 | 75 | (2e+03, 1, 1) | (1, 0.09, 0.05, 0.35) | — |

### `Strawberry_MapC_FallingDebris_Explosion_Belveth`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_MapC_FallingDebris_Explosion_Belveth` · SHA-256 `6612846144e735a7…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `Crack_radial` | quad | GnarBig_Base_Z_cracks_radial.StrawberryRebuild.dds | alpha | 0.4 | 1 | (400, -400, 0) |  | — |
| 1 | `Flash_suck` | quad | Strawberry_Boss_RekSai_Base_Burrowed_Z_nova_flash.StrawberryRebuild.dds | default | 0.1 曲线1点 随机 | 1 | (300, 300, 300) |  | — |
| 2 | `GroundLines` | quad | Strawberry_Boss_RekSai_Base_Z_Glow_bg_01.StrawberryRebuild.dds | alpha | 1.4 | 1 | (300, 300, 600) | (0.169, 0.188, 0.251, 0.388) | — |
| 3 | `Dustring` | billboard | Sion_Skin05_Sl_Dust_01.StrawberryRebuild.dds | alpha | 1 曲线1点 随机 | 2 | (30, 60, 1.5) 曲线1点 随机 |  | — |
| 4 | `praxis` | quad | Enhanced_pulseWave.StrawberryRebuild.dds | additive | 0.3 | 1 | (550, 450, 0) | (1, 0, 0, 1) | — |
| 5 | `poolSphere_small` | mesh | Skin32_15.StrawberryRebuild.dds / common_sru_baron_acidball_poolsphere.StrawberryRebuild.scb | additive | 0.4 | 1 | (1.4, 4.5, 3) 曲线2点 |  | — |
| 6 | `Dirt` | billboard | Skin32_rocks.StrawberryRebuild.dds | alpha | 1.5 曲线1点 随机 | 2 | (30, 15, 1) 曲线1点 随机 | (0.87, 0.87, 0.87, 0.77) | — |
| 7 | `BGDarkPurpleEnd` | quad | Skin32_Glow01.StrawberryRebuild.dds | alpha | 0.5 | 1 | (700, 100, 0) | (0.114, 0.125, 0.275, 0.651) | — |
| 8 | `Basic1` | quad | Skin32_Cas_aoering_01.StrawberryRebuild.dds | additive | 0.3 | 1 | (550, 1, 1) |  | — |
| 9 | `Rock4` | mesh | GnarBig_Base_Z_FallingDebris_Explosion.StrawberryRebuild.dds / gnarbig_Base_Z_FallingDebris_Explosion.StrawberryRebuild.scb | mode3 | 0.25 | 1 | (2, 6, 2) |  | — |
| 10 | `Rock5` | mesh | GnarBig_Base_Z_FallingDebris_Explosion.StrawberryRebuild.dds / gnarbig_Base_Z_FallingDebris_Explosion.StrawberryRebuild.scb | alpha | 1.5 | 1 | (2, 1, 1) |  | — |

### `Strawberry_MapC_FallingDebris_Warning`

来源 `Maps/Shipping/Map33/Particles/Environment/Strawberry_MapC_FallingDebris_Warning` · SHA-256 `054b9eb853c2f41b…`

| # | 图层 | 图元 | 贴图 / 网格 | 混合 | 粒子寿命 s | 发射率 | birthScale | birthColor | 代码 |
| ---: | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | `GroundLines` | mesh | Base_Q3_decal.StrawberryRebuild.dds / Base_Mirrored_Quad1.StrawberryRebuild.scb | alpha | 1 | 1 | (190, 300, 600) | (0.17, 0.09, 0.15, 0.6) | — |
| 1 | `OuterMist_B` | mesh | Base_Indicator_Red_OuterMist.StrawberryRebuild.dds / Base_indicator_outermist.StrawberryRebuild.scb | alpha | 1 | 1 | (0.95, 1, 1) |  | — |
| 2 | `dots` | quad | Strawberry_MiniBoss_Vacuum_Base_Spawn_TrampleAOE_Glow.StrawberryRebuild.dds | additive | 1 | 1 | (330, 400, 400) | (1, 1, 1, 0.25) | — |
| 3 | `BaseRing` | quad | Strawberry_Boss_Reksai_Generic_shape.StrawberryRebuild.tex | additive | 1.05 | 1 | (370, 400, 400) | (1, 1, 1, 0.78) | — |
| 4 | `BaseRing1` | quad | Strawberry_Boss_Reksai_Generic_shape.StrawberryRebuild.tex | alpha | 1.05 | 1 | (375, 400, 400) | (1, 1, 1, 0.96) | — |
| 5 | `GroundLines1` | mesh | Base_Q3_decal.StrawberryRebuild.dds / Base_Mirrored_Quad1.StrawberryRebuild.scb | additive | 1.5 | 1 | (190, 300, 600) | (0.92, 0.02, 0.16, 1) | — |
| 6 | `GroundLines2` | quad | Base_03_Circle_light.StrawberryRebuild.dds | alpha | 0.45 | 1 | (400, 300, 600) | (1, 1, 1, 0.4) | — |
