# BAB-01 · Q01-03 逐路径资产映射与直链实测报告（Gemini GM-03）

> 作者：Gemini（GM-03）· 2026-11-23 CST · 对应验收单：`handover/gpt/BAB_Q01_ACCEPTANCE_GPT13.md` 第 2 节 `Q01-03`
> 完整机器可读清单：`src/render-babylon/vfx/data/14.14/asset_map.json`（覆盖 GM-02 全部 152 系统 / 883 层）

## 1. 总览统计

| 资产类型 | 去重总数 | 主线 `main` 已有（直接复用） | 备用分支已有（`asset/14.14-unpacked-assets-20261123`） | 待获取 / 实体绑定 |
| :--- | ---: | ---: | ---: | :--- |
| **贴图（`.dds`/`.tex`）** | **555** | **95**（已回填至 JSON `project` 字段） | — | **460** 张已实测 CommunityDragon 14.14 **100% 可直下**（555/555 HTTP 200/206 + `image/png` + PNG 魔数通过，0 失败） |
| **网格（`.scb`/`.sco`/`.skn`）** | **133** | **29**（含 1 处跨路径复用 `r_praxis.json`） | **62**（含 4 处跨路径复用 `reksai_vfx/*.json`） | **42** 个需按 14.14 清单定向解包转换 |
| **无独立网格名 `attachedMesh`** | **21 层** | — | — | **非缺失文件**：运行时直接绑定实体蒙皮网格（精英 / 雷克塞 / 玩家） |

## 2. 需定向解包的网格缺口清单（共 42 个）

以下网格在 `main` 与 `asset/14.14-unpacked-assets-20261123` 均未找到现成转换 JSON，后续需按 14.14 Windows 清单 `17A8CACF07883D41.manifest` 定向解包转换（其中 `.sco` 3 个、`.skn` 1 个、其余 `.scb`）：

| 原版路径 | 格式 | 分类 | 引用系统 |
| :--- | :---: | :--- | :--- |
| `ASSETS/Characters/Strawberry_Boss_RekSai/Skins/Base/Particles/Strawberry_Boss_RekSai_Base_W_knockup_timer.StrawberryRebuild.sco` | `.sco` | reksai | `Strawberry_Boss_RekSai_Base_Burrowed_W_tar_KnockupImmune` |
| `ASSETS/Characters/Strawberry_Boss_RekSai/Skins/Base/Particles/Strawberry_Boss_RekSai_Spawn_Warning_Fin_Holder.StrawberryRebuild.skn` | `.skn` | reksai | `Strawberry_Boss_RekSai_Base_Z_Spawn_AOE_Warning` |
| `ASSETS/Maps/Particles/Strawberry/Aatrox_Skin33_Q3_lowpoly.StrawberryRebuild.scb` | `.scb` | enemy | `EliteSpell_DamageZone`、`EliteSpell_FastMissile` |
| `ASSETS/Maps/Particles/Strawberry/Anivia_Base_Z_IndicatorMesh01.StrawberryRebuild.scb` | `.scb` | enemy | `EliteSpell_DamageZone` |
| `ASSETS/Maps/Particles/Strawberry/Augment_FrostWraith_FrozenCrystalMesh.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_Weapon_FrostNova_Root` |
| `ASSETS/Maps/Particles/Strawberry/Augment_Frostwraith_Praxis.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_Weapon_FrostNova` |
| `ASSETS/Maps/Particles/Strawberry/Augment_Frostwraith_RoundMesh.StrawberryRebuild.scb` | `.scb` | weapons | `Augment_Weapon_FrostNova_EvolveShield`、`Strawberry_Weapon_FrostNova` |
| `ASSETS/Maps/Particles/Strawberry/Base_indicator_outermist.StrawberryRebuild.scb` | `.scb` | reksai | `Strawberry_MapC_FallingDebris_Warning` |
| `ASSETS/Maps/Particles/Strawberry/Kennen_Lighting_Cyl.StrawberryRebuild.sco` | `.sco` | weapons | `Augment_Weapon_StatikkShiv_Evolve` |
| `ASSETS/Maps/Particles/Strawberry/Lulu_Skin06_Z_Twirl_01.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_RapidShot_Mis_Pink_Evolve` |
| `ASSETS/Maps/Particles/Strawberry/Morgana_Base_R_indicator_ring.StrawberryRebuild.scb` | `.scb` | enemy | `Strawberry_Enemy_PoisonZone_Cast` |
| `ASSETS/Maps/Particles/Strawberry/Morgana_Skin50_Q_mis_energyflame.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_RapidShot_Mis_Pink`、`Strawberry_RapidShot_Mis_Pink_Evolve` |
| `ASSETS/Maps/Particles/Strawberry/Morgana_W_Beam_Mesh.StrawberryRebuild.scb` | `.scb` | enemy | `Strawberry_Enemy_PoisonZone_Cast` |
| `ASSETS/Maps/Particles/Strawberry/Morgana_W_Circle_Mesh.StrawberryRebuild.scb` | `.scb` | enemy | `Strawberry_Enemy_PoisonZone` |
| `ASSETS/Maps/Particles/Strawberry/Morgana_W_Cone_Mesh.StrawberryRebuild.scb` | `.scb` | enemy | `Strawberry_Enemy_PoisonZone_Cast` |
| `ASSETS/Maps/Particles/Strawberry/Morgana_W_Mist_Mesh.StrawberryRebuild.scb` | `.scb` | enemy | `Strawberry_Enemy_PoisonZone` |
| `ASSETS/Maps/Particles/Strawberry/Morgana_W_Swirl_Mesh.StrawberryRebuild.scb` | `.scb` | enemy | `Strawberry_Enemy_PoisonZone_Cast` |
| `ASSETS/Maps/Particles/Strawberry/Nami_Skin15_Q_debuff_MeshBubble.StrawberryRebuild.scb` | `.scb` | enemy | `EliteSpell_FastMissile` |
| `ASSETS/Maps/Particles/Strawberry/Strawberry_Boss_Aatrox_Base_Mirrored_Quad1.StrawberryRebuild.scb` | `.scb` | enemy | `EliteSpell_SlowMissile` |
| `ASSETS/Maps/Particles/Strawberry/Strawberry_POI_Freeze_Core.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_Weapon_FrostNova_Idle` |
| `ASSETS/Maps/Particles/Strawberry/Strawberry_POI_HoloBase.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_Weapon_FrostNova_Idle` |
| `ASSETS/Maps/Particles/Strawberry/Strawberry_Weapon_HollowRadiance_InteriorR.StrawberryRebuild.scb` | `.scb` | weapons | `HollowRadiance_AoeCircle`、`HollowRadiance_AoeCircle_Evolve` |
| `ASSETS/Maps/Particles/Strawberry/Strawberry_Weapon_PiercingShot_Bolt_AnimeShapes.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_PierceShot_Mis` |
| `ASSETS/Maps/Particles/Strawberry/Strawberry_Weapon_PiercingShot_Bolt_Evo.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_Pierceshot_MisEvolve` |
| `ASSETS/Maps/Particles/Strawberry/Strawberry_Weapon_PiercingShot_Spin_Bolt.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_PierceShot_Mis` |
| `ASSETS/Maps/Particles/Strawberry/TFT2_Soraka_Base_R_Water.StrawberryRebuild.scb` | `.scb` | enemy | `EliteSpell_SlowMissile` |
| `ASSETS/Maps/Particles/Strawberry/TFT8_Urgot_Base_Ripples01.StrawberryRebuild.scb` | `.scb` | enemy | `EliteSpell_SlowMissile` |
| `ASSETS/Maps/Particles/Strawberry/TFT8_Urgot_Base_Wave_2.StrawberryRebuild.scb` | `.scb` | enemy | `EliteSpell_SlowMissile` |
| `ASSETS/Maps/Particles/Strawberry/Udyr_Base_R_RoundMesh.StrawberryRebuild.scb` | `.scb` | enemy | `EliteSpell_DamageZone` |
| `ASSETS/Maps/Particles/Strawberry/Ziggs_Base_R_landingZone_green.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_Weapon_Mine_aoe_green` |
| `ASSETS/Maps/Particles/Strawberry/Ziggs_Satchel.StrawberryRebuild.sco` | `.sco` | weapons | `Augment_Weapon_Mine_Countdown`、`Strawberry_Weapon_Mine_Evolve_Mis`、`Strawberry_Weapon_Mine_mis` |
| `ASSETS/Shared/Particles/Base_Crater_01.StrawberryRebuild.scb` | `.scb` | map | `Strawberry_Destructible_MetalBox_Spawn` |
| `ASSETS/Shared/Particles/Base_Q3_lowpoly.StrawberryRebuild.scb` | `.scb` | map | `Strawberry_Destructible_MetalBox_Explosion` |
| `ASSETS/Shared/Particles/Base_Taunt_Coin.StrawberryRebuild.scb` | `.scb` | map | `Strawberry_Rebuild_Drop_Gold`、`Strawberry_Rebuild_Drop_Gold_Missile` |
| `ASSETS/Shared/Particles/Base_weaponswipe.StrawberryRebuild.scb` | `.scb` | map | `Strawberry_Destructible_MetalBox_Explosion` |
| `ASSETS/Shared/Particles/Belveth_Base_E_Praxis.StrawberryRebuild.scb` | `.scb` | weapons | `Strawberry_Weapon_FrostNova_Idle` |
| `ASSETS/Shared/Particles/common_sru_baron_acidball_poolsphere.StrawberryRebuild.scb` | `.scb` | reksai | `Strawberry_MapC_FallingDebris_Explosion_Belveth` |
| `ASSETS/Shared/Particles/Dragonmancer_Rakan_Diamond02.StrawberryRebuild.scb` | `.scb` | map | `Strawberry_Destructible_MetalBox_Explosion` |
| `ASSETS/Shared/Particles/Sphere.StrawberryRebuild.scb` | `.scb` | map | `Strawberry_Drop_XP_High`、`Strawberry_Drop_XP_High_Missile`、`Strawberry_Drop_XP_High_Pickup` |
| `ASSETS/Shared/Particles/SS_BOSS_Herald_Assassin_Transform_mesh_fastclouds.StrawberryRebuild.scb` | `.scb` | map | `Strawberry_AugmentSelection_InWorld_Ceremony` |
| `ASSETS/Shared/Particles/SS_BOSS_Herald_Assassin_Transform_mesh_large_swirl1.StrawberryRebuild.scb` | `.scb` | map | `Strawberry_AugmentSelection_InWorld_Ceremony` |
| `ASSETS/Shared/Particles/SS_Heal_Cross_01.StrawberryRebuild.scb` | `.scb` | map | `Strawberry_Rebuild_Drop_Health`、`Strawberry_Rebuild_Drop_Health_Missile` |

## 3. 无独立网格名 `attachedMesh` 实体绑定清单（共 21 层）

| 系统 ID | 图层名 | 运行时绑定目标 | 子网格限制 |
| :--- | :--- | :--- | :--- |
| `Strawberry_Elite_Glow` | `Avatar` (#1) | elite_skinned_mesh | 全部 |
| `Strawberry_Elite_Glow` | `Fresnel` (#2) | elite_skinned_mesh | 全部 |
| `Strawberry_Elite_MissileFast_Glow` | `Avatar` (#0) | elite_skinned_mesh | 全部 |
| `Strawberry_Elite_MissileFast_Glow` | `Fresnel` (#1) | elite_skinned_mesh | 全部 |
| `Strawberry_Elite_MissileSlow_Glow` | `Avatar` (#0) | elite_skinned_mesh | 全部 |
| `Strawberry_Elite_MissileSlow_Glow` | `Fresnel` (#1) | elite_skinned_mesh | 全部 |
| `Strawberry_Elite_Zone_Glow` | `Avatar` (#0) | elite_skinned_mesh | 全部 |
| `Strawberry_Elite_Zone_Glow` | `Fresnel` (#1) | elite_skinned_mesh | 全部 |
| `Strawberry_Boss_RekSai_Base_Burrowed_W_movement_idle` | `plasma` (#11) | reksai_skinned_mesh | BODY |
| `Strawberry_Boss_RekSai_Base_Z_HitMissile_AvatarBurst` | `Avatar` (#0) | reksai_skinned_mesh | 全部 |
| `Strawberry_Boss_RekSai_Base_Z_HitMissile_AvatarBurst` | `Avatar1` (#1) | reksai_skinned_mesh | 全部 |
| `Strawberry_Boss_RekSai_Base_Z_HitMissile_AvatarBurst` | `Avatar2` (#2) | reksai_skinned_mesh | 全部 |
| `Strawberry_Boss_RekSai_Base_Z_HurtFlash` | `Avatar` (#0) | reksai_skinned_mesh | 全部 |
| `Strawberry_Boss_RekSai_Base_Z_HurtFlash` | `Avatar1` (#1) | reksai_skinned_mesh | 全部 |
| `Strawberry_AugmentSelection_InWorld_Ceremony` | `Avatar` (#7) | player_skinned_mesh | 全部 |
| `Strawberry_Drop_Health_Heal` | `Avatar_Overlay` (#0) | player_skinned_mesh | 全部 |
| `Strawberry_Drop_Health_Heal` | `HologramFresnel` (#6) | player_skinned_mesh | 全部 |
| `Strawberry_Drop_Health_Heal` | `Sparkles` (#7) | player_skinned_mesh | 全部 |
| `Strawberry_Drop_XP_High_Pickup` | `Avatar` (#3) | player_skinned_mesh | 全部 |
| `Strawberry_Player_Hit` | `Avatar` (#0) | player_skinned_mesh | 全部 |
| `Strawberry_Player_Hit` | `Avatar1` (#1) | player_skinned_mesh | 全部 |
