# BAB-01 · 44 个缺口网格定向解包优先级清单（GM-12）

> 作者：Gemini（`GM-12`）· 2026-11-23 20:48 CST · 仅 KV
> 数据源：`GM-03`（`asset_map.json` 42 个 `missing_unpack`）+ `GM-04`（PR #10 补录 2 个 3D 血条网格），合计 **44 个**（40 个 `.scb`、3 个 `.sco`、1 个 `.skn`）。
> 目标：供具备本机/GitHub 权限的执行 AI（如 Muse / GPT）按轻重缓急分批从 14.14 `Map33.wad.client` / `Shared` 定向解包并转为 JSON/GLB，避免把时间耗在低优或暂未实装系统上。

## 汇总统计

| 优先级 | 数量 | 涵盖范围 | 解包建议 |
| :---: | ---: | :--- | :--- |
| **P0** | **15** | 核心副武器（地雷、十字弩、冰爆护甲、UwU、耀光力场、斯塔缇克进化） | **第一批必解**（直接影响 B4 战斗核心视觉） |
| **P1** | **8** | 经验球、治疗包、金属补给箱、升级仪式 | **第一/二批解包**（每局高频出现，可先用简单几何占位跑通代码） |
| **P2** | **10** | 首领雷克塞（2）与精英怪预警/弹幕（8） | **第二批解包**（随 B3/B4 首领与精英重做一并接入） |
| **P3** | **11** | 毒区怪（6）、MapC 落石（2）、金币（1，`inGame:false`）、3D 血条（2） | **暂缓/按需解包**（不阻塞第一关核心跑通） |
| **合计** | **44** | 100% 覆盖 PR #10 全部 44 个 `missing_unpack` 网格 | — |

---

## P0 · 核心副武器（15 个，第一批必解）

| # | 原版路径（14.14 WAD） | 格式 | 引用系统 |
| :---: | :--- | :---: | :--- |
| 1 | `ASSETS/Maps/Particles/Strawberry/Augment_FrostWraith_FrozenCrystalMesh.StrawberryRebuild.scb` | `.scb` | `Strawberry_Weapon_FrostNova_Root` |
| 2 | `ASSETS/Maps/Particles/Strawberry/Augment_Frostwraith_Praxis.StrawberryRebuild.scb` | `.scb` | `Strawberry_Weapon_FrostNova` |
| 3 | `ASSETS/Maps/Particles/Strawberry/Augment_Frostwraith_RoundMesh.StrawberryRebuild.scb` | `.scb` | `Augment_Weapon_FrostNova_EvolveShield`、`Strawberry_Weapon_FrostNova` |
| 4 | `ASSETS/Maps/Particles/Strawberry/Kennen_Lighting_Cyl.StrawberryRebuild.sco` | `.sco` | `Augment_Weapon_StatikkShiv_Evolve` |
| 5 | `ASSETS/Maps/Particles/Strawberry/Lulu_Skin06_Z_Twirl_01.StrawberryRebuild.scb` | `.scb` | `Strawberry_RapidShot_Mis_Pink_Evolve` |
| 6 | `ASSETS/Maps/Particles/Strawberry/Morgana_Skin50_Q_mis_energyflame.StrawberryRebuild.scb` | `.scb` | `Strawberry_RapidShot_Mis_Pink`、`Strawberry_RapidShot_Mis_Pink_Evolve` |
| 7 | `ASSETS/Maps/Particles/Strawberry/Strawberry_POI_Freeze_Core.StrawberryRebuild.scb` | `.scb` | `Strawberry_Weapon_FrostNova_Idle` |
| 8 | `ASSETS/Maps/Particles/Strawberry/Strawberry_POI_HoloBase.StrawberryRebuild.scb` | `.scb` | `Strawberry_Weapon_FrostNova_Idle` |
| 9 | `ASSETS/Maps/Particles/Strawberry/Strawberry_Weapon_HollowRadiance_InteriorR.StrawberryRebuild.scb` | `.scb` | `HollowRadiance_AoeCircle`、`HollowRadiance_AoeCircle_Evolve` |
| 10 | `ASSETS/Maps/Particles/Strawberry/Strawberry_Weapon_PiercingShot_Bolt_AnimeShapes.StrawberryRebuild.scb` | `.scb` | `Strawberry_PierceShot_Mis` |
| 11 | `ASSETS/Maps/Particles/Strawberry/Strawberry_Weapon_PiercingShot_Bolt_Evo.StrawberryRebuild.scb` | `.scb` | `Strawberry_Pierceshot_MisEvolve` |
| 12 | `ASSETS/Maps/Particles/Strawberry/Strawberry_Weapon_PiercingShot_Spin_Bolt.StrawberryRebuild.scb` | `.scb` | `Strawberry_PierceShot_Mis` |
| 13 | `ASSETS/Maps/Particles/Strawberry/Ziggs_Base_R_landingZone_green.StrawberryRebuild.scb` | `.scb` | `Strawberry_Weapon_Mine_aoe_green` |
| 14 | `ASSETS/Maps/Particles/Strawberry/Ziggs_Satchel.StrawberryRebuild.sco` | `.sco` | `Augment_Weapon_Mine_Countdown`、`Strawberry_Weapon_Mine_Evolve_Mis`、`Strawberry_Weapon_Mine_mis` |
| 15 | `ASSETS/Shared/Particles/Belveth_Base_E_Praxis.StrawberryRebuild.scb` | `.scb` | `Strawberry_Weapon_FrostNova_Idle` |

## P1 · 高频掉落、补给箱与升级仪式（8 个）

| # | 原版路径（14.14 WAD） | 格式 | 引用系统 |
| :---: | :--- | :---: | :--- |
| 1 | `ASSETS/Shared/Particles/Base_Crater_01.StrawberryRebuild.scb` | `.scb` | `Strawberry_Destructible_MetalBox_Spawn` |
| 2 | `ASSETS/Shared/Particles/Base_Q3_lowpoly.StrawberryRebuild.scb` | `.scb` | `Strawberry_Destructible_MetalBox_Explosion` |
| 3 | `ASSETS/Shared/Particles/Base_weaponswipe.StrawberryRebuild.scb` | `.scb` | `Strawberry_Destructible_MetalBox_Explosion` |
| 4 | `ASSETS/Shared/Particles/Dragonmancer_Rakan_Diamond02.StrawberryRebuild.scb` | `.scb` | `Strawberry_Destructible_MetalBox_Explosion` |
| 5 | `ASSETS/Shared/Particles/Sphere.StrawberryRebuild.scb` | `.scb` | `Strawberry_Drop_XP_High`、`Strawberry_Drop_XP_High_Missile`、`Strawberry_Drop_XP_High_Pickup` |
| 6 | `ASSETS/Shared/Particles/SS_BOSS_Herald_Assassin_Transform_mesh_fastclouds.StrawberryRebuild.scb` | `.scb` | `Strawberry_AugmentSelection_InWorld_Ceremony` |
| 7 | `ASSETS/Shared/Particles/SS_BOSS_Herald_Assassin_Transform_mesh_large_swirl1.StrawberryRebuild.scb` | `.scb` | `Strawberry_AugmentSelection_InWorld_Ceremony` |
| 8 | `ASSETS/Shared/Particles/SS_Heal_Cross_01.StrawberryRebuild.scb` | `.scb` | `Strawberry_Rebuild_Drop_Health`、`Strawberry_Rebuild_Drop_Health_Missile` |

## P2 · 首领雷克塞与精英预警/弹幕（10 个）

| # | 原版路径（14.14 WAD） | 格式 | 引用系统 |
| :---: | :--- | :---: | :--- |
| 1 | `ASSETS/Characters/Strawberry_Boss_RekSai/Skins/Base/Particles/Strawberry_Boss_RekSai_Base_W_knockup_timer.StrawberryRebuild.sco` | `.sco` | `Strawberry_Boss_RekSai_Base_Burrowed_W_tar_KnockupImmune` |
| 2 | `ASSETS/Characters/Strawberry_Boss_RekSai/Skins/Base/Particles/Strawberry_Boss_RekSai_Spawn_Warning_Fin_Holder.StrawberryRebuild.skn` | `.skn` | `Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Warning` |
| 3 | `ASSETS/Maps/Particles/Strawberry/Aatrox_Skin33_Q3_lowpoly.StrawberryRebuild.scb` | `.scb` | `EliteSpell_DamageZone`、`EliteSpell_FastMissile` |
| 4 | `ASSETS/Maps/Particles/Strawberry/Anivia_Base_Z_IndicatorMesh01.StrawberryRebuild.scb` | `.scb` | `EliteSpell_DamageZone` |
| 5 | `ASSETS/Maps/Particles/Strawberry/Nami_Skin15_Q_debuff_MeshBubble.StrawberryRebuild.scb` | `.scb` | `EliteSpell_FastMissile` |
| 6 | `ASSETS/Maps/Particles/Strawberry/Strawberry_Boss_Aatrox_Base_Mirrored_Quad1.StrawberryRebuild.scb` | `.scb` | `EliteSpell_SlowMissile` |
| 7 | `ASSETS/Maps/Particles/Strawberry/TFT2_Soraka_Base_R_Water.StrawberryRebuild.scb` | `.scb` | `EliteSpell_SlowMissile` |
| 8 | `ASSETS/Maps/Particles/Strawberry/TFT8_Urgot_Base_Ripples01.StrawberryRebuild.scb` | `.scb` | `EliteSpell_SlowMissile` |
| 9 | `ASSETS/Maps/Particles/Strawberry/TFT8_Urgot_Base_Wave_2.StrawberryRebuild.scb` | `.scb` | `EliteSpell_SlowMissile` |
| 10 | `ASSETS/Maps/Particles/Strawberry/Udyr_Base_R_RoundMesh.StrawberryRebuild.scb` | `.scb` | `EliteSpell_DamageZone` |

## P3 · 暂缓/条件解包（11 个，不阻塞跑通）

| # | 原版路径（14.14 WAD） | 格式 | 引用系统 |
| :---: | :--- | :---: | :--- |
| 1 | `ASSETS/Maps/Particles/Strawberry/Base_indicator_outermist.StrawberryRebuild.scb` | `.scb` | `Strawberry_MapC_FallingDebris_Warning` |
| 2 | `ASSETS/Maps/Particles/Strawberry/Morgana_Base_R_indicator_ring.StrawberryRebuild.scb` | `.scb` | `Strawberry_Enemy_PoisonZone_Cast` |
| 3 | `ASSETS/Maps/Particles/Strawberry/Morgana_W_Beam_Mesh.StrawberryRebuild.scb` | `.scb` | `Strawberry_Enemy_PoisonZone_Cast` |
| 4 | `ASSETS/Maps/Particles/Strawberry/Morgana_W_Circle_Mesh.StrawberryRebuild.scb` | `.scb` | `Strawberry_Enemy_PoisonZone` |
| 5 | `ASSETS/Maps/Particles/Strawberry/Morgana_W_Cone_Mesh.StrawberryRebuild.scb` | `.scb` | `Strawberry_Enemy_PoisonZone_Cast` |
| 6 | `ASSETS/Maps/Particles/Strawberry/Morgana_W_Mist_Mesh.StrawberryRebuild.scb` | `.scb` | `Strawberry_Enemy_PoisonZone` |
| 7 | `ASSETS/Maps/Particles/Strawberry/Morgana_W_Swirl_Mesh.StrawberryRebuild.scb` | `.scb` | `Strawberry_Enemy_PoisonZone_Cast` |
| 8 | `ASSETS/Shared/Particles/Base_Taunt_Coin.StrawberryRebuild.scb` | `.scb` | `Strawberry_Rebuild_Drop_Gold`、`Strawberry_Rebuild_Drop_Gold_Missile` |
| 9 | `ASSETS/Shared/Particles/common_sru_baron_acidball_poolsphere.StrawberryRebuild.scb` | `.scb` | `Strawberry_MapC_FallingDebris_Explosion_Belveth` |
| 10 | `ASSETS/Shared/Particles/SS_Boss_Healthbar_01.StrawberryRebuild.scb` | `.scb` | `Strawberry_MapBoss_Healthbar`、`Strawberry_MiniBoss_HealthBar` |
| 11 | `ASSETS/Shared/Particles/SS_Boss_Healthbar_Border_01.StrawberryRebuild.scb` | `.scb` | `Strawberry_MapBoss_Healthbar`、`Strawberry_MiniBoss_HealthBar` |
