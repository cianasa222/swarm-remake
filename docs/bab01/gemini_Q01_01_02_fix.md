# BAB-01 · Q01-01 与 Q01-02 修复说明（Gemini GM-02）

> 作者：Gemini（GM-02）· 2026-11-23 CST · 独立 KV 目录：`pending/bab01-gemini/`（未修改 `pending/bab01-quick/` 原件）
> 对应验收单：`handover/gpt/BAB_Q01_ACCEPTANCE_GPT13.md` 第 2 节 `Q01-01`、`Q01-02`

## 1. 转换前后数量对比（Patch 14.14 实测重跑，0 重复 ID）

| 文件 | BAB-Q01（旧） | GM-02（新） | 变化 | 说明 |
| :--- | ---: | ---: | ---: | :--- |
| `fountain.json` | 4 / 52 | 4 / 52 | 0 | 与 Quick 原件逐字节 SHA-256 一致 |
| `weapons.json` | 38 / 144 | **41 / 150** | **+3 / +6** | **Q01-01**：补齐回旋刃 3 个进化系统 |
| `jinx.json` | 28 / 94 | 28 / 94 | 0 | 与 Quick 原件逐字节 SHA-256 一致 |
| `enemy.json` | 11 / 101 | **13 / 108** | **+2 / +7** | **Q01-02**：补齐 2 个精英光环系统 |
| `reksai.json` | 41 / 351 | 41 / 351 | 0 | 与 Quick 原件逐字节 SHA-256 一致 |
| `map.json`（新增） | — | **25 / 128** | **+25 / +128** | **Q01-02**：补给箱、掉落拾取与玩家核心反馈 |
| **合计** | **122 / 742** | **152 / 883** | **+30 / +141** | 全量校验 0 重复 ID |

## 2. Q01-01 修复详情（回旋刃进化系统）

- 根因：`classifyMap33()` 原武器正则 `(^|_)${w.riot}(_|$)` 无法匹配词尾直接拼接 `Evolve` 的系统名。
- 修正：改为 `(^|_)${w.riot}(Evolve)?(_|$)`，延续 QC-15 武器对应关系（`Nuke` / `ScatterArrows` / `CircleShot` / `ItemToBuy` 仍排除）。
- 补回 3 个系统（各 2 层，归入 `weapons.json`，`gameRefs: { weapon: 'boomerang', riot: 'Boomerang' }`）：
  1. `Strawberry_Weapon_BoomerangEvolve_Missile`
  2. `Strawberry_Weapon_BoomerangEvolve_Missile_Return`
  3. `Strawberry_Weapon_BoomerangEvolve_Mini_Missile`

## 3. Q01-02 修复详情（当前第一关玩法覆盖与 `src/sim/game.ts` 事件映射）

- **精英光环（+2 系统 / +7 层，归入 `enemy.json`）**：
  - `Strawberry_Elite_Glow`（4 层）、`Strawberry_Elite_Zone_Glow`（3 层），`gameRefs: { enemy: true, elite: true }`。
- **补给箱（3 系统 / 21 层，归入 `map.json`）**：
  - `Strawberry_Destructible_MetalBox_Idle_01`（`boxIdle`）、`Strawberry_Destructible_MetalBox_Explosion`（`boxBreak`）、`Strawberry_Destructible_MetalBox_Spawn`（`boxSpawn`）。
- **掉落与拾取（18 系统 / 91 层，归入 `map.json`）**：
  - XP（10）：`Strawberry_Drop_XP` / `_Missile` / `_Pickup`、`_T2` / `_T2_Missile`、`_T3` / `_T3_Missile`、`_High` / `_High_Missile` / `_High_Pickup`。
  - 治疗（3）：`Strawberry_Rebuild_Drop_Health` / `_Missile`、`Strawberry_Drop_Health_Heal`。
  - 访问卡（2，对应 `simDropKinds: 'card'`）：`Strawberry_AnimaSquad_Card`、`Strawberry_Drop_Card_Pickup`。
  - 金币（3）：`Strawberry_Rebuild_Drop_Gold` / `_Missile` / `_Pickup`。
- **核心玩家反馈（4 系统 / 16 层，归入 `map.json`）**：
  - `Strawberry_Player_Hit`（`playerHurt`）、`Strawberry_AugmentSelection_InWorld_Ceremony`（`levelUp`）、`Strawberry_Rebuild_TargeterOrientation` 与 `_Manual`（`aimRing`）。

## 4. 明确暂不纳入本轮的系统（防越界 / 防编造）

对照当前 `src/sim/game.ts` 单人玩法，以下 Map33 系统已盘点但**暂不导出**，待对应玩法实装时再纳入：
- 联机复活：`Strawberry_Revive_*`、`Strawberry_Downed_Revive`（待 M5+ 多人联机）。
- 吸铁石/真空球：`Strawberry_Pickup_Vacuum_*`（当前模拟层无此道具）。
- 尖塔/关内目标事件：`Strawberry_Spire_*`、`Strawberry_Event_LootChonklin_*`（对应看板 `UIA-5`）。
- 其他地图或大环境装饰：`MapC_*`、`MapD_*`、海浪/海鸥/通风口等（对应看板 `EMAP-1`）。

## 5. 校验与遗留说明

- 已运行：`node --check tools/bab/extract_vfx_14_14.cjs` 通过；`node --test tools/bab/extract_vfx_14_14.test.cjs` 4/4 PASS；14.14 原版三份 BIN 全量重跑 0 重复 ID。
- 未运行（需有 GitHub/本机环境的 AI 完成）：仓库集成 `npm run build` / `playtest`、原版实机录像逐层核对、B4 运行器视觉验收。
