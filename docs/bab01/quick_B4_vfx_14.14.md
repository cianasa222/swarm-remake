# BAB-01 · B4 通用 VFX 数据（14.14 原版逐层参数）——Quick AI BAB-Q01

> Quick AI（AWS Quick）2026-11-23。⚠️ GitHub 连接器授权失效，本批文件**只在 Cloudflare KV `pending/bab01-quick/`**，待能写 GitHub 的 AI 上传到分支 `quick/bab01-b0-b4-data`（见同目录 README）。
> 本批只做 **B4 的数据准备**：通用数据结构 + 从原版 BIN 自动转换的全部参数 + 与现有代码的对照。**没有写 Babylon 运行器、没有改任何现有代码、没有改游戏数值**。TS 类型文件未编译（待验证）；转换脚本已在 Quick AI 的 Node 沙盒里实际运行生成了数据。

## 1. 交付物

| 文件 | 内容 | 状态 |
| :--- | :--- | :--- |
| `src/render-babylon/vfx/effect_def.ts` | 引擎无关的 `EffectDef` / `EffectLayer` / `Curve` / `EffectSpawnRequest` / `EffectQualityBudget` 类型；单位换算集中在 `EFFECT_UNITS`；`owner` + `importance` 用于「减轻队友特效只降队友装饰」 | 未编译（待验证） |
| `tools/bab/extract_vfx_14_14.cjs` | 无依赖 Node 脚本：读原版 `map33.bin.json`、金克丝 / 雷克塞 `skin0.bin.json`，按分类输出 EffectDef JSON；每个系统记录原版路径和原始 JSON 的 SHA-256 | ✅ 已在 Node 沙盒运行 |
| `src/render-babylon/vfx/data/14.14/{fountain,weapons,jinx,enemy,reksai,index}.json` | 转换结果（数值保持原版单位） | ✅ 已生成 |
| `docs/bab01/quick_B4_vfx_tables_14.14.md` | 742 个图层的逐层参数表（图元、贴图 / 网格、混合、寿命、发射率、birthScale、birthColor、代码中是否出现同名层） | ✅ 自动生成 |

重新生成：`node tools/bab/extract_vfx_14_14.cjs --map33 <map33.bin.json> --jinx <jinx skin0.bin.json> --reksai <reksai skin0.bin.json> --out src/render-babylon/vfx/data/14.14`（原版 bin.json 在 KV `ref/14.14/`，**不进公开仓库**）。
本次输入 SHA-256（规范化 JSON）：`map33` b383502c7e138742…、`jinx_skin0` 8d79cb367650d94c…、`reksai_skin0` 6ccb50f0257464c5…。

> **需要用户决定**：`data/14.14/*.json` 是从原版 BIN 派生的运行时参数（不含原始 BIN、贴图、网格），用途与公开仓库里已有的 `public/assets/` 压缩资产相同（Q-10 用户决定资产保留在公开仓库）。如果不希望公开，改放 KV / 私有构建输入，构建时注入。

## 2. 规模

| 分类 | 系统 | 有图层的系统 | 图层 | 系统名出现在相关代码 | 图层名出现在相关代码 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| fountain | 4 | 4 | 52 | 1 | 34 |
| weapons | 38 | 31 | 144 | 3 | 2 |
| jinx | 28 | 20 | 94 | 4 | 39 |
| enemy | 11 | 11 | 101 | 1 | 2 |
| reksai | 41 | 39 | 351 | 0 | 0 |

「出现在相关代码」只是名称匹配的弱信号（只在对应模块里搜，例如喷泉只搜 `map_warehouse.ts`）：代码里写了原版层名，说明当初是对照原版做的；没写不等于没做（武器特效代码大多没写原版层名）。**B4 运行器读数据后，这一列就不再需要。**

## 3. 各类核对结论

### 3.1 喷泉（`Strawberry_MapA_Fountain_*`）
- 4 个系统 52 层：`Fountain_Glow` 15、`Fountain_Nova` 17、`Fountain_Timer_Charge` 11、**`Foutain_Idle_OnCD` 9**（原版拼写 Foutain）。之前的喷泉审计（`fountain_emitters_14.14.md`）按 43 层（前三个系统）做；**冷却态 `Foutain_Idle_OnCD` 的 9 层不在那次审计范围**，代码里只出现 2 个同名层，需要 B4 时补核。
- `Fountain_Timer_Charge` 11 层只有 2 层名出现在代码里，进度圈相关层建议重点对照。
- 网格 11 个，项目已有 11 个 `public/assets/map1/vfx/fountain_*.json`（SCB 转 JSON），文件名不同，B4 运行器需要一张「原版网格名 → 项目 JSON」对照表（见第 5 节）。

### 3.2 九把副武器（对应关系按 QC-15 更正后的表）

| 武器 | 项目 id | 原版 | 系统数 | 图层数 | 系统（图层数） |
| :--- | :--- | :--- | ---: | ---: | :--- |
| UwU 魔爆炮 | `uwu_blaster` | RapidShot | 2 | 15 | `Strawberry_RapidShot_Mis_Pink`(7)、`Strawberry_RapidShot_Mis_Pink_Evolve`(8) |
| 旋风切割器 | `cyclonic` | HolyBauble | 2 | 7 | `augment_holybauble_orbitalmis`(3)、`Augment_Weapon_HolyBauble_Evolved`(4) |
| 耀光力场 | `radiant` | HollowRadiance | 5 | 22 | `HollowRadiance_AoeCircle`(6)、`HollowRadiance_AoeCircle_Child`(0)、`HollowRadiance_AoeCircle_Evolve`(9)、`Strawberry_Weapon_HollowRadiance_Evolve`(0)、`Strawberry_Weapon_HollowRadiance_Evolve_Explosion`(7) |
| 斯塔缇克之刃 | `statikk` | StatikkShiv | 5 | 15 | `Augment_Weapon_StatikkShiv_Evolve`(3)、`StatikkShiv_Beam`(3)、`StatikkShiv_Beam_Evo`(3)、`StatikkShiv_Impact`(3)、`StatikkShiv_Impact_Evo`(3) |
| 战兔十字弩 | `crossbow` | PierceShot | 3 | 10 | `Strawberry_PierceShot_Mis`(5)、`Strawberry_PierceShot_Mis_Trail`(1)、`Strawberry_Pierceshot_MisEvolve`(4) |
| 回旋刃 | `boomerang` | Boomerang | 4 | 4 | `Strawberry_Weapon_Boomerang_Base_Q_tar`(0)、`Strawberry_Weapon_Boomerang_Base_Q_tar_02`(0)、`Strawberry_Weapon_Boomerang_Mis_02`(2)、`Strawberry_Weapon_Boomerang_Missile`(2) |
| 战兔巨爆 | `bunnymega` | StarStrike | 4 | 21 | `Strawberry_Weapon_Starstrike_Evolve_Target`(4)、`Strawberry_Weapon_Starstrike_Evolve_Target_Main`(4)、`Strawberry_Weapon_StarStrike_Karthus_Explosion`(9)、`Strawberry_Weapon_StarStrike_Karthus_Target`(4) |
| 幻灵地雷 | `mines` | Mine | 8 | 23 | `Augment_Weapon_Mine_Countdown`(2)、`Strawberry_Weapon_Mine_aoe_green`(2)、`Strawberry_Weapon_Mine_aoe_red`(0)、`Strawberry_Weapon_Mine_Evolve_Mis`(2)、`Strawberry_Weapon_Mine_Evolve_MisChild`(2)、`Strawberry_Weapon_Mine_hit`(0)、`Strawberry_Weapon_Mine_mis`(2)、`Strawberry_Weapon_Mine_tar`(13) |
| 冰爆护甲 | `iceblast` | FrostNova | 5 | 27 | `Augment_Weapon_FrostNova_EvolveShield`(8)、`Strawberry_Weapon_FrostNova`(13)、`Strawberry_Weapon_FrostNova_Evolve_Idle`(0)、`Strawberry_Weapon_FrostNova_Idle`(5)、`Strawberry_Weapon_FrostNova_Root`(1) |

- 现有 `weapon_vfx.ts` 已保留 QC-15 的结论（巨爆 = StarStrike，不按 Nuke 改色）。代码里几乎没有原版层名，迁移时按本表逐系统对照，不要再用名字相近的 ScatterArrows / Nuke / CircleShot。
- 战兔巨爆原版 4 个系统 21 层（准星 ×2、`Karthus_Explosion` 9 层光柱 / 地裂 / 内圈、`Karthus_Target` 4 层），全部在 `weapons.json`，Q-30 重做直接用。
- 引用关系：`Augment_Weapon_PierceShotMis` → `Strawberry_PierceShot_Mis`、`RapidShot_EvolveMis` → `RapidShot_Mis_Pink_Evolve`、`BoomerangMissile` / `ReturnMissile` → 两个回旋刃系统、`Mine_Wrapper` → `Mine_mis` 等已写进各系统的 `usedBySpells`。

### 3.3 金克丝（`skin0.bin.json`，28 系统 94 层）
- 40 层的原版名出现在 `jinx_vfx.ts` / `weapon_vfx.ts`（Q-13 / AG-05 按原版做的部分），`R_Tar` 11/11、`Q_Rocket_GroundAOE` 6/6、`R_Mis` 9/15。
- 喵喵枪（Q）的 `Q_Minigun_*` 系列 8 个系统基本没出现原版层名，B4 需逐层核。

### 3.4 敌人 / 弹幕（11 系统 101 层）
- `EliteSpell_FastMissile` / `SlowMissile` 及其命中区、`Elite_Missile*_Glow`、`EliteSpell_DamageZone`、`Enemy_PoisonZone(_Cast)`：原版精英技能弹幕。**模拟层还没有这些技能**（Q-14 B2），所以现在只能先准备数据，接入要等玩法任务。
- `Strawberry_Enemy_Death`（6 层）、`Strawberry_Enemy_Hit`（6 层）：死亡已在 `vfx.ts` 改了颜色（Q-27，PR #8），命中特效项目还没有。
- 项目当前的敌弹（`spitter` 三连发）不是原版机制，没有对应原版特效（Q-14 B2）。

### 3.5 雷克塞（41 系统 351 层，含 map33 里 3 个首领相关系统）
- **代码里 0 个系统名、0 个原版层名**：首领特效基本未按原版实现，与 Q-17 首领审计一致。最大的几套：`Burrowed_Q_mis` 43 层、`Z_Burrowed_AOE_Explosion` / `Z_Spawn_AOE_Explosion` 各 26 层、`Q_swipe_cas` 24 层、`Burrowed_W_movement_idle` 23 层。
- 网格 61 个：AG-06 资产分支 `asset/14.14-unpacked-assets-20261123` 已有 55 个雷克塞特效网格，先对照分支清单再决定是否还要解包剩下的。

## 4. 第一版运行器需要处理的原版特性

**图元分布**：billboard 241、mesh 216、quad 201、arbitraryTrail 33、ray 26、attachedMesh 10、beam 9、cameraTrail 4、planarProjection 2。
**混合模式**：additive 377、alpha 325、default 22、mode3 15、mode5 2、mode2 1。`default`（未写 blendMode）22 层、`mode3` 15 层、`mode5` 2 层、`mode2` 1 层的含义**未验证**，运行器先按 alpha 画并打印一次警告，截图对照后再定。

**暂不支持、必须逐项说明的字段**（出现层数）：

| 字段 | 层数 | Babylon 建议做法 |
| :--- | ---: | :--- |
| `alphaErosionDefinition` | 156 | 溶解（erosion）：自定义片元着色器按阈值曲线裁剪，或 NodeMaterial |
| `useNavmeshMask` | 87 | 只在可走区域显示：用地图 `walkableB64` 生成遮罩贴图采样 |
| `colorLookUpTypeY` | 72 | 同上 |
| `FlexShapeDefinition` | 59 | Flex 参数由游戏逻辑运行时覆盖（如范围加成），运行器按 `EffectSpawnRequest.scale` 处理 |
| `softParticleParams` | 44 | 软粒子（深度淡化）：需要深度贴图；低档可关 |
| `Filtering` | 30 | 发射器按观察者 / 队伍过滤：对应 `owner` 字段 |
| `reflectionDefinition` | 22 | 菲涅尔 / 反射：`fresnelParameters`（StandardMaterial）或忽略并登记 |
| `childParticleSetDefinition` | 14 | 子系统：运行器递归按 id 播放（数据里保留了原始定义） |
| `paletteDefinition` | 12 | 调色板贴图换色：自定义着色器 |
| `colorLookUpTypeX` | 10 | 按寿命 / 速度查 `particleColorTexture`：Babylon `ParticleSystem.addColorGradient` 或 `useRampGradients` + `addRampGradient` |
| `colorLookUpScales` | 8 | 同上 |
| `colorLookUpOffsets` | 8 | 同上 |
| `fieldCollectionDefinition` | 4 | 力场（吸引 / 噪声）：CPU 粒子 `updateFunction` 或 GPUParticle 不支持时降级 |
| `rateByVelocityFunction` | 4 | 按移动速度发射（拖尾）：每帧按位移设 `emitRate` |
| `stencilRef` | 3 | 模板测试：Babylon `stencil` 状态 |
| `sliceTechniqueRange` | 3 | 切片技术：未知，登记待查 |
| `censorModulateValue` | 2 | 和谐版本相关，第一关可忽略（待确认） |
| `stencilMode` | 1 | 同上 |
| `falloffTexture` | 1 | 衰减贴图：自定义着色器 |

## 5. 资源可用性（缺什么才解包什么）

- **贴图 496 张全部能从 CommunityDragon 14.14 直接下载**（PNG，路径 = 原版路径小写、`.dds/.tex` 改 `.png`，已逐目录核对；目录页长文件名会截断，用前缀匹配）。每层的 `material.texture.cdragonPng` 就是下载地址。项目里已转换的 webp 文件名与原版不同，`project` 字段先留空，由迁移者按需补登。
- **网格 123 个（`.scb` / `.sco`）CommunityDragon 不提供**，另有 1 个 `.skn`。按分类：fountain 11、weapons 21、jinx 15、enemy 16、reksai 61。
- 项目已有的 19 个 SCB 转 JSON：`cat_rocket.json`、`passive_swirl.json`、`r_conehead.json`、`r_rocket.json`、`fountain_baseedge.json`、`fountain_beam.json`、`fountain_nova_flame.json`、`fountain_nova_indicator.json`、`fountain_nova_ring.json`、`fountain_nova_shape.json`、`fountain_nova_swirl.json`、`fountain_sphere.json`、`fountain_timer.json`、`fountain_timer_start.json`、`fountain_wave.json`、`frost_ring.json`、`hr_fire.json`、`hr_outline.json`、`star_burst.json`。喷泉 11 个应已齐全（待按顶点数核对对应关系）；武器、金克丝只有一部分；敌人、雷克塞在 main 上为 0（雷克塞 55 个在资产分支）。
- 取网格的顺序：main → 资产分支 `asset/14.14-unpacked-assets-20261123`（禁止删除 / 覆盖）→ 本机已解包目录 → 定向解包 Map33 / 角色 WAD（`handover/gpt/RESOURCE_SOURCES.md`）。

需要的网格清单：

**fountain**（11 个）：`brand_base_ring.strawberryrebuild.scb`、`flamemesh.strawberryrebuild.scb`、`healing_station_lightcylinder.strawberryrebuild.scb`、`healingstation_indicator.strawberryrebuild.scb`、`healingstation_mesh_timer_02.strawberryrebuild.scb`、`healingstation_mesh_timer_start_01.strawberryrebuild.scb`、`healingstation_shape_music.strawberryrebuild.scb`、`healingstation_swirl.strawberryrebuild.scb`、`healingstation_wave01.strawberryrebuild.scb`、`strawberry_map1_healingwell_baseedge.strawberryrebuild.scb`、`strawberry_map1_healingwell_centersphere.strawberryrebuild.scb`

**weapons**（21 个）：`augment_frostwraith_frozencrystalmesh.strawberryrebuild.scb`、`augment_frostwraith_praxis.strawberryrebuild.scb`、`augment_frostwraith_roundmesh.strawberryrebuild.scb`、`kennen_lighting_cyl.strawberryrebuild.sco`、`lulu_skin06_z_twirl_01.strawberryrebuild.scb`、`morgana_skin50_q_mis_energyflame.strawberryrebuild.scb`、`strawberry_jinx_base_r_praxis.strawberryrebuild.scb`、`strawberry_poi_freeze_core.strawberryrebuild.scb`、`strawberry_poi_holobase.strawberryrebuild.scb`、`strawberry_starstrike_light_inside.strawberryrebuild.scb`、`strawberry_weapon_hollowradiance_fireinterior.strawberryrebuild.scb`、`strawberry_weapon_hollowradiance_interiorr.strawberryrebuild.scb`、`strawberry_weapon_hollowradiance_outliner.strawberryrebuild.scb`、`strawberry_weapon_piercingshot_bolt_animeshapes.strawberryrebuild.scb`、`strawberry_weapon_piercingshot_bolt_evo.strawberryrebuild.scb`、`strawberry_weapon_piercingshot_spin_bolt.strawberryrebuild.scb`、`strawberry_yasuo_base_q_ring01.strawberryrebuild.scb`、`sylas_skin24_animeburstmesh02.strawberryrebuild.scb`、`ziggs_base_r_landingzone_green.strawberryrebuild.scb`、`ziggs_satchel.strawberryrebuild.sco`、`belveth_base_e_praxis.strawberryrebuild.scb`

**jinx**（15 个）：`strawberry_jinx_base_crater_01.strawberryrebuild.scb`、`strawberry_jinx_base_passive_swirl.strawberryrebuild.scb`、`strawberry_jinx_base_q_animeburstmesh02.strawberryrebuild.scb`、`strawberry_jinx_base_q_praxis.strawberryrebuild.scb`、`strawberry_jinx_base_r_animeburstmesh02.strawberryrebuild.scb`、`strawberry_jinx_base_r_castring_01.strawberryrebuild.scb`、`strawberry_jinx_base_r_conehead_01.strawberryrebuild.scb`、`strawberry_jinx_base_r_dome_01.strawberryrebuild.scb`、`strawberry_jinx_base_r_praxis.strawberryrebuild.scb`、`strawberry_jinx_base_r_swirl.strawberryrebuild.scb`、`strawberry_jinx_base_sk.strawberryrebuild.scb`、`strawberry_jinx_base_vfxmeshes_02.strawberryrebuild.scb`、`strawberry_offset_quad_01.strawberryrebuild.scb`、`strawberry_jinx_base_props_md_cat.strawberryrebuild.scb`、`strawberry_jinx_base_props_md_supermegadeathrocket.strawberryrebuild.scb`

**enemy**（16 个）：`aatrox_skin33_q3_lowpoly.strawberryrebuild.scb`、`anivia_base_z_indicatormesh01.strawberryrebuild.scb`、`morgana_base_r_indicator_ring.strawberryrebuild.scb`、`morgana_w_beam_mesh.strawberryrebuild.scb`、`morgana_w_circle_mesh.strawberryrebuild.scb`、`morgana_w_cone_mesh.strawberryrebuild.scb`、`morgana_w_mist_mesh.strawberryrebuild.scb`、`morgana_w_swirl_mesh.strawberryrebuild.scb`、`nami_skin15_q_debuff_meshbubble.strawberryrebuild.scb`、`strawberry_boss_aatrox_base_mirrored_quad1.strawberryrebuild.scb`、`strawberry_boss_briar_base_z_decal_edge.strawberryrebuild.scb`、`strawberry_boss_briar_base_z_screenwave_mesh.strawberryrebuild.scb`、`tft2_soraka_base_r_water.strawberryrebuild.scb`、`tft8_urgot_base_ripples01.strawberryrebuild.scb`、`tft8_urgot_base_wave_2.strawberryrebuild.scb`、`udyr_base_r_roundmesh.strawberryrebuild.scb`

**reksai**（61 个）：`base_mirrored_quad1.strawberryrebuild.scb`、`gnarbig_base_z_fallingdebris_explosion.strawberryrebuild.scb`、`jarvin_base_spawn_catacylsmrocks01.strawberryrebuild.scb`、`strawberry_boss_briar_base_bh_w2.strawberryrebuild.scb`、`strawberry_boss_briar_base_flatplane.strawberryrebuild.scb`、`strawberry_boss_briar_base_q3_lowpoly.strawberryrebuild.scb`、`strawberry_boss_briar_base_z_decal_edge.strawberryrebuild.scb`、`strawberry_boss_briar_base_z_ring1.strawberryrebuild.scb`、`strawberry_boss_briar_base_z_screenwave_mesh.strawberryrebuild.scb`、`strawberry_boss_reksai_base_burrowed_q_teardrop.strawberryrebuild.scb`、`strawberry_boss_reksai_base_burrowed_w_fin.strawberryrebuild.scb`、`strawberry_boss_reksai_base_burrowed_w_teardrop.strawberryrebuild.scb`、`strawberry_boss_reksai_base_burrowed_w_tremor_ring.strawberryrebuild.scb`、`strawberry_boss_reksai_base_crater_01.strawberryrebuild.scb`、`strawberry_boss_reksai_base_glow.strawberryrebuild.scb`、`strawberry_boss_reksai_base_indicatormesh02.strawberryrebuild.scb`、`strawberry_boss_reksai_base_land_ringfire_01.strawberryrebuild.scb`、`strawberry_boss_reksai_base_particles_1_1311.strawberryrebuild.scb`、`strawberry_boss_reksai_base_particles_2_75.strawberryrebuild.scb`、`strawberry_boss_reksai_base_praxis.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q3_lowpoly.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_burstmesh.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_claws.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_decal_edge.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_indicatorring_01.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_q_slash_black.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_slash_donut_01.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_slashes.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_slashes_02.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_void_slash_01.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_waveback.strawberryrebuild.scb`、`strawberry_boss_reksai_base_q_weaponswipe.strawberryrebuild.scb`、`strawberry_boss_reksai_base_strawberry_boss_reksai_base_q_bullet.strawberryrebuild.scb`、`strawberry_boss_reksai_base_w10.strawberryrebuild.scb`、`strawberry_boss_reksai_base_w9.strawberryrebuild.scb`、`strawberry_boss_reksai_base_w_down_move_crack.strawberryrebuild.scb`、`strawberry_boss_reksai_base_w_electricity.strawberryrebuild.scb`、`strawberry_boss_reksai_base_w_glow.strawberryrebuild.scb`、`strawberry_boss_reksai_base_w_indicatormesh02.strawberryrebuild.scb`、`strawberry_boss_reksai_base_w_knock_up_tar.strawberryrebuild.scb`、`strawberry_boss_reksai_base_w_knockup_timer.strawberryrebuild.sco`、`strawberry_boss_reksai_base_w_land_ringfire_01.strawberryrebuild.scb`、`strawberry_boss_reksai_base_w_waveback.strawberryrebuild.scb`、`strawberry_boss_reksai_base_waveback.strawberryrebuild.scb`、`strawberry_boss_reksai_base_weaponswipe.strawberryrebuild.scb`、`strawberry_boss_reksai_base_z_animeburstmesh01.strawberryrebuild.scb`、`strawberry_boss_reksai_base_z_glow.strawberryrebuild.scb`、`strawberry_boss_reksai_base_z_indicatormesh02.strawberryrebuild.scb`、`strawberry_boss_reksai_base_z_land_ringfire_01.strawberryrebuild.scb`、`strawberry_boss_reksai_base_z_waveback.strawberryrebuild.scb`、`strawberry_boss_reksai_skin17_q_shark.strawberryrebuild.scb`、`strawberry_boss_reksai_skin17_q_shark3.strawberryrebuild.scb`、`strawberry_boss_reksai_skin17_q_shark4.strawberryrebuild.scb`、`strawberry_boss_reksai_skin17_z_shark.strawberryrebuild.scb`、`strawberry_boss_reksai_spawn_warning_fin_holder.strawberryrebuild.skn`、`strawberry_illaoi_crater_hypermesh.strawberryrebuild.scb`、`vex_base_z_praxis.strawberryrebuild.scb`、`base_indicator_outermist.strawberryrebuild.scb`、`base_mirrored_quad1.strawberryrebuild.scb`、`common_sru_baron_acidball_poolsphere.strawberryrebuild.scb`、`gnarbig_base_z_fallingdebris_explosion.strawberryrebuild.scb`

## 6. 已知限制

1. 尺寸换算规则（`EFFECT_UNITS.quadFullWidthPerBirthScale`）仍未用原版截图验证，这是全项目遗留问题（`jinx_14.14.md` 6.1 节），B4 验收第一步就要定。
2. 子系统（`childParticleSetDefinition`）只保留了原始定义，运行器要按名字递归找系统；部分子系统在别的 bin 里，可能找不到，遇到时登记。
3. 原版 `transform`、`EmitterPosition` 坐标系未与项目 x / z 对齐验证（项目地图转换时可能镜像过 Z 轴，见 Q-26 太阳方向一节），运行器统一在一处换算。
4. 曲线 `t` 是归一化时间还是秒，按原版字段惯例：粒子属性按粒子寿命归一化、发射器属性按发射器寿命归一化；个别字段（`rate`、`bindWeight`）以截图核对为准。
