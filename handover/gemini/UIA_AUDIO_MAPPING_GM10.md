# UIA-1 / UIA-2 / UIA-3 原版音频事件核验报告（GM-10）

> 作者：Gemini（`GM-10`）· 2026-11-23 20:30 CST
> 数据源：GPT 经 `inbox/gemini/audio-fix/` 临时中转的 `global_events.json`（280 命名事件 / 656 音轨）与 `music_events.json`（6 命名事件 / 46 音轨），均源自 `asset/14.14-unpacked-assets-20261123`。
> 交付代码：`pending/audio-uia-gemini/src/audio/audio_uia_map.ts` + `tools/audio-uia.test.ts`（`tsc --strict --noEmit` PASS，`node --test` 3/3 PASS）。
> 清理状态：本报告与代码包落盘并校验 SHA-256 后，按 `COLLAB.md` 2.5 节精确删除 `inbox/gemini/audio-fix/` 下的 2 个临时中转 key。

## 1. UIA-1：9 把副武器原版音效核对与补缺（按 QC-15 校验）

已逐条核对 `audio.ts` 现有 `WEAPON_SFX`（GPT-07 / GM-07）：现有 18 个 cue 的全部哈希均与 `global_events.json` 一致且无 QC-15 错配。本次补齐了以下之前缺失的 6 组副武器事件及完整变体池（详见 `WEAPON_SFX_EXTENDED_14_14`）：

| 武器 | 新增补齐事件 | 原版 Wwise 事件名 | 音轨哈希（`global/*.ogg`） |
| :--- | :--- | :--- | :--- |
| 回旋刃 | `boomerangReturn` | `Play_sfx_augment_weapon_boomerangreturnmissile_OnMissileLaunch` | `648459546`, `707729322` |
| 回旋刃（进化） | `boomerangEvoReturn` | `Play_sfx_augment_weapon_boomerangevolvereturnmissile_OnMissileLaunch` | `199453683`, `236701451` |
| 回旋刃（进化） | `boomerangMiniCast` | `Play_sfx_augment_weapon_boomerangevolveminimissile_OnMissileLaunch` | `1063282412`, `116442316`, `182117459`, `299712216`, `5618198` |
| 旋风切割器 | `cyclonicDeactivate` | `Play_sfx_augment_weapon_holybauble_buffdeactivate` | `869815710` |
| 冰爆护甲 | `iceblastReady` | `Play_sfx_augment_weapon_frostnova_ready_buffactivate` | `606260377` |
| 地雷 | `mineArm` | `Play_sfx_augment_weapon_mine_buffactivate` | `1067684107`, `196758714`, `33989928`, `706547561` |
| 十字弩 | `crossbowPreCast` | `Play_sfx_augment_weapon_pierceshotmis_OnMissileCast` | `569613682`, `597238142`, `75538993`, `8902771` |

## 2. UIA-2：敌人按怪种死亡音效（23 组全量映射）

现主线 `SFX.kill` 仅使用 `Bruiser_Death`（`238729373` / `285886244` / `298438811`）。已在 `ENEMY_DEATH_SFX_14_14` 中整理全部 23 组死亡音轨，并通过 `resolveEnemyDeathSfx(kind, variant?)` 精确路由当前 4 类在场怪种：

- `crawler (pix)` → `Strawberry_Enemy_Pix_Death`（6 变体）
- `crawler (ghoul)` → `Strawberry_Enemy_BasicMelee_Death`（3 变体）
- `spitter` → `Strawberry_Enemy_Hunter_Death`（6 变体）
- `charger` → `Strawberry_Enemy_MiniDasher_Death`（5 变体）
- `elite` / `boss` → `Strawberry_MiniBoss_Bruiser_Death`（3 变体）

## 3. 世界音效关键纠错

- **补给箱破碎**：原版事件为 `Play_sfx_Strawberry_Destructible_Barrell_break_buffactivate`（`382785855`, `910166186`, `973490012`），可直接替代 `main.ts` 中借用 `audio.pick()` 的问题。
- **`SFX.levelUp` 哈希错配发现**：当前 `SFX.levelUp` 使用的 `120178910` / `365957618` / `442822305` 在 `global_events.json` 中实际属于 `Play_sfx_Strawberry_Rebuild_drop_gold_missile_OnHit`（金币拾取音），后续需从主线/原版升级事件库确认升级音或保持标注。

## 4. UIA-3：BGM 5 个哈希核对结论

对照 `music_events.json`（6 个命名事件 / 46 音轨）：
- ✅ `music/307974760.ogg`（`BGM.mainIntro`）= `Play_mus_map33_game_start_MapA`（确认第一关开场曲）
- ✅ `music/91455257.ogg`（`BGM.victory`）= `Play_sfx_Env_SRUAP_Victory_Banner`（确认胜利横幅曲）
- ✅ `music/632537467.ogg`（`BGM.defeat`）= `Play_sfx_Evn_SRUAP_Defeat_Banner`（确认失败横幅曲）
- ⚠️ `music/854037489.ogg`（`mainLoop`）与 `music/71063538.ogg`（`bossLoop`）未出现在这 6 个普通 Sound Event 中（`unnamedEvents` 为空），属 Wwise Interactive Music Segment；`mid_game` / `late_game` 切换音轨需后续解析 `.bnk` 的 Music Switch Container 后才能精确绑定。

## 5. 最小增量资产同步清单（23 条 `.ogg`）

见 `audio_uia_map.ts` 导出的 `MINIMAL_ASSET_SYNC_FILES`（从 `asset/14.14-unpacked-assets-20261123` 的 `public/assets/audio/` 复制 23 条至主线并同步转 `.m4a` 即可完整启用 UIA-1 缺口 + UIA-2 4 类怪种 + 补给箱破碎）。
