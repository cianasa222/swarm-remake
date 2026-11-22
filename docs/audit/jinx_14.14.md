# 金克丝（Strawberry_Jinx）移速 / 技能 / 特效 与 Patch 14.14 原版比对报告

> **本报告由 Quick AI（AWS Quick）编写**（登记编号 Q-12）· 2026-11-23 00:30 CST
> 审查对象：GitHub `main` @ `457e56d`（含 Antigravity AG-01 / AG-02）
> 原版数据：CommunityDragon 14.14 `data/characters/strawberry_jinx/strawberry_jinx.bin.json`、`.../skins/skin0.bin.json`（Cloudflare KV `ref/14.14/` 下）
> 对照代码：`src/config.ts`、`src/sim/game.ts`、`src/sim/weapons.ts`、`src/render/jinx_vfx.ts`、`src/render/weapon_vfx.ts`
> 单位：拳头 1 单位 = 0.01 m。

> **📌 Q-13 更新（2026-11-23 01:00 CST）**
> 1. **修复已提交**：按用户指示，本报告列出的不一致项已由 Quick AI 修复，代码在分支 `quick/q13-jinx-14.14`，[PR #2](https://github.com/cianasa222/swarm-remake/pull/2)，**待开发 AI 构建验收后合并**。修复范围和未做项见第 9 节。
> 2. **本报告有 2 处判断错误，已订正**（对照 LoL Wiki「Swarm/Jinx」和火箭弹道 `{69358b90}` 重新核对）：
>    - E 射程：之前写「9.25 m ✅」是错的。925 是 E 的瞄准距离，火箭弹道 `{69358b90}` 的 `castRange` 是 2200 且飞满全程，**实际射程 22 m**；方向也不是规则扇形，而是 **90° 锥形内随机**。
>    - 被动移速：之前写「+250%」是错的。`MSBuff 2.5` 的含义是 **+2.5% × 累计兴奋次数**（Wiki 原文），并在持续期间衰减，与其他移速相加；Wiki 未列攻速加成。
> 3. 另外补充：R 原版是**命中第一个敌人就爆炸**，最高 3 倍伤害的条件是**目标已损失生命**（+0%–200%）；E 爆炸对周围敌人与主目标**同等伤害**；进化子弹穿透后每个目标固定 **40%**。

图例：✅ 一致 · ⚠️ 有偏差 · ❌ 明显不符 · ❓ 原版字段含义需要确认

---

## 0. 结论速览

| 类别 | 结论 |
| :--- | :--- |
| 移速与基础属性 | ✅ 移速 3.5 m/s、HP 1000、寻路半径 0.35 m 都对；⚠️ 自动索敌距离和受击判定半径有偏差 |
| Q 喵喵枪（初始武器） | ✅ 冷却、伤害、弹数、弹速、射程、进化后减半冷却和穿透衰减下限 40% 都对；⚠️ 子弹碰撞半径偏小 |
| E 鱼骨头 | ✅ 冷却、9 发、射程、弹速、爆炸半径和成长、暴击加成都对；❌ **伤害公式明显偏高**；⚠️ 没有 0.35 s 施法前摇 |
| R 死神飞弹 | ✅ 冷却、射程、宽度、爆炸半径范围对；❌ **伤害公式不符**（原版还有最高 3 倍伤害）；⚠️ 弹速、0.5 s 施法前摇 |
| 被动 罪恶快感 | ✅ 70 击杀触发、持续 8 s、+150 技能急速对；❌ **移速加成不符**（原版 +250% 并衰减，代码固定 +100%）；❓ 攻速加成 |
| 特效 | 颜色和贴图选用大多对；⚠️ 被动光环、R 飞行光晕尺寸偏小约一半，R 尾环发射频率约原版 5 倍，E 爆炸和 R 爆炸层数与原版有出入（有缺有多）；⚠️ **全项目特效尺寸换算规则不统一**，见第 6 节 |

**影响最大、建议优先改的 3 项**：E 伤害、R 伤害、被动移速。这 3 项会直接改变数值平衡，改完必须重跑 `npm.cmd run playtest -- 2 0.85` 看通关率。

---

## 1. 基础属性（`CharacterRecords/Root`）

| 项目 | 原版 14.14 | 代码 | 结论 |
| :--- | :--- | :--- | :---: |
| 移速 `baseMoveSpeed` | 350 → **3.5 m/s** | `PLAYER.speed = 3.5` | ✅ |
| 生命 `baseHP` | 1000 | `PLAYER.maxHp = 1000` | ✅ |
| 寻路碰撞半径 `pathfindingCollisionRadius` | 35 → 0.35 m | `PLAYER.radius = 0.35` | ✅ |
| 受击判定半径 `overrideGameplayCollisionRadius` | 20 → **0.2 m** | 受击也用 0.35 m | ⚠️ 代码的受击判定比原版大 75%，玩家更容易被打中 |
| 暴击伤害倍率 `critDamageMultiplier` | 2.0 | E 暴击 `2 + 加成` | ✅ |
| Q 触发距离（Q `castRange`） | 900 → **9 m** | `PLAYER.targetRange = 10.5` | ⚠️ 代码在 10.5 m 就开火，比原版远 1.5 m |
| 模型缩放 `skinScale` | 0.85 | （模型侧已处理） | — |

## 2. Q 喵喵枪（`Strawberry_JinxAutoAttack` + 子弹 `Strawberry_JinxBasicAttack`）

| 项目 | 原版 14.14 | 代码（`weapons.ts` `jinx_meow` / `config.ts` `MG`） | 结论 |
| :--- | :--- | :--- | :---: |
| 冷却 | 2.5 s，进化后 1.25 s | `cd: [2.5 ×5, 1.25]` | ✅ |
| 单发伤害 | 60 / 80 / 100 / 120 / 140（进化 140） | `dmg: [60, 80, 100, 120, 140, 140]` | ✅ |
| 每轮弹数 | 3 / 4 / 5 / 6 / 7（进化 7） | `count: [3, 4, 5, 6, 7, 7]` | ✅ |
| 飞弹数量加成 `ProjectileMultiplier` | 3 | 每 +1 飞弹数量 +3 发 | ✅ |
| 进化穿透伤害下限 `FallOffDamagePercent` | 0.4 | `max(0.4, 0.6^命中数)` | ✅ 下限一致；每次 ×0.6 的衰减速度原版没写明 ❓ |
| 子弹速度 | 3500 → 35 m/s | `MG.bulletSpeed = 35` | ✅ |
| 子弹射程 | 1500 → 15 m | `radius: 15.0` | ✅ |
| 子弹宽度 `mMissileWidth` | 90 → 0.9 m（半径 0.45 m） | 碰撞半径 `MG.bulletRadius = 0.16`（进化 0.22） | ⚠️ 判定比原版窄很多，贴身小怪容易漏打 |

## 3. E 鱼骨头（`Strawberry_JinxE`）

| 项目 | 原版 14.14 | 代码（`JINX_E`） | 结论 |
| :--- | :--- | :--- | :---: |
| 冷却 | 8 s | 8 | ✅ |
| 火箭数 | 9 | 9 | ✅ |
| 射程 | ~~925 → 9.25 m~~ **火箭弹道 `{69358b90}` castRange 2200 → 22 m**（925 是瞄准距离）（Q-13 订正） | 9.25 | ❌ |
| 弹速 | `missileSpeed` 1750 → 17.5 m/s（子弹道 `mSpeed` 1800 → 18 m/s） | 17.5 | ✅（差 0.5 m/s，可忽略） |
| 爆炸半径 | 300 → 3.0 m | 3.0 | ✅ |
| 爆炸半径成长 | +15% / 30% / 45% / 60% / 75% / 90% / 105%（7 档） | 前 6 档 | ✅（第 7 档未用） |
| 暴击伤害加成 | 0 / 10% / … / 60%（7 档） | 前 6 档 | ✅ |
| **伤害** | **55 + 6 ×（等级 − 1）**（按角色等级） | **95 + 8 × 等级** | ❌ 1 级 55 vs 103，10 级 109 vs 175，20 级 169 vs 255，代码约高 50%–90% |
| 施法前摇 `mCastTime` | 0.35 s | 立即发射 | ⚠️ |

## 4. R 超究极死神飞弹（`Strawberry_JinxR`）

| 项目 | 原版 14.14 | 代码（`JINX_R`） | 结论 |
| :--- | :--- | :--- | :---: |
| 冷却 | 50 s | 50（开局冷却 `initCooldown = 12` 原版没有） | ✅ / ❓ |
| 射程 | 2500 → 25 m | 25 | ✅ |
| 宽度 | 140 → 1.4 m | 1.4（碰撞半径 0.77） | ✅ |
| 弹速 | `missileSpeed` 1700；**实际飞行 `mMissileSpec.mSpeed` 2000 → 20 m/s** | 17 | ⚠️ 原版飞得更快 |
| 爆炸半径 | 500 / 600 / … / 1100（按 R 档位）→ 5–11 m | `5 + floor(等级/4)`，上限 10 m | ✅ 范围一致，成长方式是近似 |
| **伤害** | **500 + 50 ×（等级 − 1）**；`MaxDamage = Damage × 3`（`DamageMulti = 3`） | 穿透 `380 + 38 × 等级`，爆炸 ×1.45 | ❌ 1 级原版 500（最高 1500）vs 代码 418 / 606；20 级原版 1450（最高 4350）vs 代码 1140 / 1653 |
| 其他系数 | `PercentDamage 200`、`AoEDamageMult 1.0`、`mCoefficient 0.15 / 1.5` | 未使用 | ❓ 含义需要对照 Swarm 原版技能说明确认 |
| 施法前摇 | 0.5 s（`delayCastOffsetPercent 0.5`） | 立即发射 | ⚠️ |

> 建议：R 伤害按「起始 Damage，随飞行距离或条件最高到 ×3」实现。具体是按距离增长还是按别的条件，`.bin.json` 里没写，需要看原版技能说明或实机录像确认后再定。

## 5. 被动 罪恶快感（`Strawberry_JinxPassiveMarker`）

| 项目 | 原版 14.14 | 代码（`JINX_PASSIVE`） | 结论 |
| :--- | :--- | :--- | :---: |
| 触发 | 70 次小怪击杀 | 70；另外击杀精英也会触发 | ✅ / ❓ 精英触发在数据里没有直接字段 |
| 持续 | 8 s | 8 | ✅ |
| 技能急速 | +150 | 150 | ✅ |
| **移速** | **`MSBuff 2.5`**：~~开始时 +250%~~ **+2.5% × 累计兴奋次数**（LoL Wiki），持续期间衰减（`MSDecayRate 0.95`），与其他移速相加（Q-13 订正） | 固定 +100%（乘法） | ❌ |
| 攻速 | `ASBuff` 1.5 / 1.9 / 2.3 / 2.7 / 3.1 / 3.5 / 3.9（7 档）；LoL Wiki 列出的兴奋加成只有技能急速和移速 | 弹流间隔 ÷ 1.8（+80%） | ❌ 按 Wiki 不加攻速；`ASBuff` 推测是奔跑动画速率（Q-13 订正） |

## 6. 特效（`skin0.bin.json`，共 28 套特效系统）

### 6.1 先说一个全项目问题：特效尺寸换算规则不统一

- 喷泉特效（`map_warehouse.ts`）一直按「平面全宽 = 2 × `birthScale` / 100 m」换算，例如 `Basic5` bS 430 → 8.6 m、`outer_graphic` bS 1400 → 28 m。
- 金克丝特效（`jinx_vfx.ts`）大多**只用了这个值的 55%–65%**，例如被动光环 bS 110–125 → 按喷泉规则应为 2.2–2.5 m，代码 1.35–1.45 m；R 飞行光晕 bS 275 × 700 → 应为 5.5 × 14 m，代码 2.8 × 6.2 m。
- AG-01 把 `healspark` 从换算值 0.4 m 调成了约 0.63–1.15 m，理由是实机看不清。
- **结论**：换算规则本身没有被原版截图验证过，所以两边谁对还不能下定论，但同一个项目里不能两套规则。建议开发 AI 用 1 张原版实机截图（例如金克丝站在喷泉旁、开着被动）同时量喷泉圈和被动光环，定一个统一系数，再一次性修正，并把系数写进 `AI_HANDOVER.md` 1.3 节。

### 6.2 逐项

| 特效 | 原版要点 | 代码现状 | 结论 |
| :--- | :--- | :--- | :---: |
| **被动光环** `Passive_Buff`（7 层） | 底环 DarkBG 常驻；GlowRing / CatFace / Outline / RingGlowDot 每秒约 1.5 个**新环**，1 s 内从 0.8 倍扩到 1.0 倍并淡入淡出；`SpeedRing` 用 `Passive_Swirl` 网格 ×0.007、`Circle_Mis` 贴图、黄转青；另有 `Jinx_P_Streak` 速度线 | 5 层常驻平面，持续旋转加正弦脉动；swirl ×0.0082、`r_energy` 贴图粉色；缺 Streak 速度线和 RingGlowDot | ⚠️ 动画方式不同（原版不转，是一圈圈往外冒）；颜色：底环 `0x052854`、金环 `0xffff7f` ✅，猫脸原版白色调、代码粉 `0xff5ce0` ⚠️，外框原版白、代码青 ⚠️ |
| **喵喵枪子弹** `Q_Minigun_Mis` + 子特效 | 主体 `Project_Bolts` bS 75 × 15（1.5 × 0.3 m），青 / 黄两种光晕子特效，蓝色背光，金色星星碎屑 | `project_bolts` 交叉面片约 1.52 × 0.43 m，青金交替 | ✅ 长度一致、颜色思路一致；⚠️ 宽度偏大约 40% |
| **进化子弹** `Q_Minigun_Mis_Evo_child` | `Project_Bolts` bS 200 × 30（4.0 × 0.6 m），加 `head` 网格、地面光晕、背光 | 同一面片 ×1.55 / ×1.75（约 2.5 × 0.7 m） | ⚠️ 长度只有原版约 60%，缺 head 和地面光晕 |
| **E 猫猫火箭** `Q_Rocket_mis_child_Cat_CRIT` | `Props_MD_Cat` 网格 bS 1.15–1.3（×0.0115–0.013），尾部 `R_SmokeShapes` 青色、`R_Trail02` 拖尾、两侧地面烟 | `cat_rocket.json` ×0.020，尾部橙色 `base_glow` | ⚠️ 模型比原版大约 50%；尾焰原版青色、代码橙色 |
| **E 爆炸** `Q_Rocket_GroundAOE`（系统整体 ×0.5） | FloorFlash（`Aura_Self` 蓝 0x0096ff，0.2 s）、Crater 网格（1.25 s）、SandBurst 沙尘、RingOut（`Q_Praxis` 0.45 s）、Swirls（`Q_AnimeBurst` 0.35 s，自转 100°/s）、PixelHit 像素碎块 | 地面闪光 0x0096ff 0.22 s ✅、弹坑 0.95 s、AnimeBurst 0.32 s ✅、Praxis 0.36 s；另加了猫脸和 rocket_hit 两层；缺 SandBurst、PixelHit | ⚠️ 弹坑时长短 25%；猫脸层原版 GroundAOE 里没有 |
| **R 飞行** `R_Mis`（15 层） | 火箭网格 ×0.035、马赫锥 (2, 5, 1.7)、`Aura_Self` 光晕 275 × 700、地面 `R_Shape` 800 × 450、左右地面风、猫脸点、星星、像素、`Speed_impact` 环、两层烟、`R_Swirl` 网格青 / 黄尾环 **各 3 个/s** | 火箭 0.035 ✅、锥约 (0.022, 0.048, 0.020) ✅；光晕 2.8 × 6.2、地面 4.2 × 7.2；尾环用平面、**每 0.065 s 一对（约 15 个/s）** | ⚠️ 尾环频率约原版 5 倍，且原版是 3D `R_Swirl` 网格；光晕和地面投影偏小；缺风、烟、猫脸点、星星、像素、Speed_impact |
| **R 爆炸** `R_Tar`（11 层） | Hit_Flash（`Glow2` 黄白，0.2 s）、vortex 焦痕（`R_CraterObsi`，1.0 s）、CloudFace 翻页图 + 背光（0.3–0.45 s）、Swirls（`R_AnimeBurst` + `E_ErosionSphere02`，0.375 s）、EnergyRing（`R_Praxis` 0.45 s）、SolidBeams 光束、碎石、黑烟、像素、星星 | 闪光 0.26 s ✅、焦痕 **1.85 s**、Praxis 0.52 s ✅；另加了弹坑网格、穹顶、巨型猫脸和外框；AnimeBurst 用了 `r_shapes01` 贴图 | ⚠️ 焦痕时长长 85%；弹坑、穹顶、猫脸这 3 层原版 R_Tar 里没有（可能来自别的系统，需开发 AI 说明出处）；缺 CloudFace、SolidBeams、碎石、黑烟、像素、星星 |

---

## 7. 建议修改清单（交给开发 AI，Quick AI 复核）

| 优先级 | 项目 | 建议 |
| :---: | :--- | :--- |
| P0 | E 伤害 | 改为 `55 + 6 × (level − 1)`，再按 playtest 结果决定是否整体调低怪物血量 |
| P0 | R 伤害 | 改为 `500 + 50 × (level − 1)`，并实现「最高 ×3」规则（先确认触发条件） |
| P0 | 被动移速 | 改为开始 +250%、按 `MSDecayRate 0.95` 衰减（先确认衰减是每秒 ×0.95 还是按持续时间线性） |
| P1 | 被动攻速 | 确认 `ASBuff` 含义后按档位实现 |
| P1 | 特效尺寸换算 | 先按第 6.1 节定统一系数，再统一修正喷泉和金克丝特效 |
| P1 | R 尾环频率 | 每色 3 个/s，用 `R_Swirl` 网格 |
| P2 | 受击判定半径 0.2 m、子弹碰撞半径 0.45 m、Q 触发距离 9 m | 改后跑 playtest，看难度变化 |
| P2 | E 0.35 s、R 0.5 s 施法前摇 | 配合 `hero_jinx.ts` 动画实现 |
| P2 | R 实际弹速 20 m/s | 改 `JINX_R.speed` |
| P3 | 被动光环动画、E 火箭模型大小和尾焰颜色、进化子弹长度、E/R 爆炸缺的层 | 视觉精修 |

## 8. 复现方法

- 原版文件按 [`handover/quick/HANDOVER.md`](../../handover/quick/HANDOVER.md) 第 3 节下载（能直接下载就直接下）：
  - `https://raw.communitydragon.org/14.14/game/data/characters/strawberry_jinx/strawberry_jinx.bin.json`
  - `https://raw.communitydragon.org/14.14/game/data/characters/strawberry_jinx/skins/skin0.bin.json`
- 技能 → 子弹道对应关系：Q 技能的子技能 `{cc2fbd2e}` 是普攻子弹（3500 / 1500）；E 技能的子技能 `{69358b90}` 是火箭弹道（`mMissileEffectKey` → `Q_Rocket_Crit_Mis`）；特效键到系统名的映射见 `skin0.bin.json` 里的 `ResourceResolver`。
- 伤害公式类型 `ByCharLevelBreakpointsCalculationPart`：没有断点时 = `mLevel1Value + mInitialBonusPerLevel × (角色等级 − 1)`。

---

## 9. 修复状态（Q-13，2026-11-23 01:00 CST）

代码：分支 `quick/q13-jinx-14.14`（提交 `c5d1b04`），[PR #2](https://github.com/cianasa222/swarm-remake/pull/2)，基于 `main` @ `c38c792`。**Quick AI 无法编译，必须由开发 AI 构建、playtest、截图后才能合并。**

| 项 | 状态 |
| :--- | :--- |
| E 伤害 `55 + 6 ×（等级 − 1）`、0.35 s 前摇、90° 锥形随机、22 m、18 m/s、碰撞半径 0.4、周围同等伤害 | ✅ 已改（PR #2） |
| R 伤害 `500 + 50 ×（等级 − 1）`、0.5 s 前摇、20 m/s、碰撞半径 1.4、命中第一个敌人即爆、按已损失生命 +0%–200%、爆炸半径上限 11 m | ✅ 已改（PR #2） |
| 被动移速 +2.5% × 累计次数并衰减、与其他移速相加；去掉 +80% 攻速 | ✅ 已改（PR #2）；衰减按「持续结束时衰减 95%」线性推断，需实机确认 |
| 受击判定半径 0.2、自动开火距离 9 m、子弹碰撞半径 0.45、进化穿透固定 40% | ✅ 已改（PR #2） |
| 被动光环重建（尺寸、外扩环动画、颜色、SpeedRing、Streak 速度线） | ✅ 已改（PR #2） |
| R 飞行：光晕、地面投影尺寸和变色、尾环频率与位置 | ✅ 已改（PR #2）；尾环仍是平面，原版为 `R_Swirl` 3D 网格 |
| E / R 爆炸：去掉原版没有的层，补 PixelHit / PixelCast / CloudFaceBackGlow，尺寸和时长按原版 | ✅ 已改（PR #2） |
| 普通 / 进化子弹长宽、E 火箭模型缩放与尾焰颜色 | ✅ 已改（PR #2） |
| 特效尺寸换算统一为「2 × birthScale.x / 100 m」 | ✅ 金克丝已统一（与喷泉一致）；Antigravity 对 `healspark` 的放大（AG-01）未动，需截图确认后再统一 |
| E SandBurst；R 飞行的风、烟、猫脸点、星星、像素、Speed_impact、R_Swirl 3D 尾环；R 爆炸 CloudFace、碎石、黑烟、SolidBeams | ✅ 已补齐（Antigravity AG-05）：从 CommunityDragon 14.14 拉取并转换 6 张缺失贴图（`sand_streaks` / `r_rocks_2x2` / `cloud_face_flipbook` / `particles_1_9` / `r_ground_smoke02` / `speed_impact`，共 140.1 KB `.webp`），全层接入 `jinx_vfx.ts` 并经 `1280×800` 实机视觉审计 CLEAN PASS |
| E 施法动作、R 施法动作与 0.5 s 前摇的衔接 | ⏳ 前摇已加；动作是否对得上需开发 AI 截图确认 |
