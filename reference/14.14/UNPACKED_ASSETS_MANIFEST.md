# Patch 14.14 本地解包专属资产库（分支 `asset/14.14-unpacked-assets-20261123`）

> 由 Antigravity 于 2026-11-23 从本机 Patch 14.14 官方客户端解包目录（`Map33.wad.client` + `Strawberry_Jinx.wad.client`）批量转换、压缩并上传。
> **核心价值**：以下所有资产均**无法从 CommunityDragon 直接 HTTP 下载**（或仅以拳头专有二进制 `.bnk / .wpk / .skn / .skl / .anm / .scb` 存在），现已全部转为网页与 Three.js 可直接加载的开放格式（`.ogg` / Meshopt `.glb` / `.json`），供任何云端或本地 AI 直接复用。

---

## 1. 全套原版音效与 BGM（`public/assets/audio/`，736 条 `.ogg` + 3 份事件映射表）

通过 `ww2ogg --pcb packed_codebooks_aoTuV_603.bin` 从 Wwise 2016 `.bnk / .wpk` 无损转码（已实测 Chromium `AudioContext.decodeAudioData()` 原生解码通过），并从 `*_events.bnk` 的 `HIRC` 向下树状解析生成精确的「事件名 → `.ogg` ID」映射：

| 目录 | 来源文件 | 音轨数 | 总大小 | 已映射事件数 | 映射表 |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `public/assets/audio/jinx/` | `mode_strawberry_jinx_base_sfx_audio.bnk` + `_events.bnk` | **34** | `0.68 MB` | **19** | `public/assets/audio/jinx/events.json` |
| `public/assets/audio/global/` | `mode_strawberry_global_sfx_audio.bnk/.wpk` + `_events.bnk` | **656** | `18.01 MB` | **280**（+12 哈希） | `public/assets/audio/global/events.json` |
| `public/assets/audio/music/` | `mus_map33_audio.bnk/.wpk` + `_events.bnk` | **46** | `27.73 MB` | **6** | `public/assets/audio/music/events.json` |
| **合计** | — | **736** | **`46.42 MB`** | **305** | — |

---

## 2. 首领雷克塞（Rek'Sai）完整动作、子网格与 55 个 3D 特效网格（对应 Issue #4 B1 / B2 / B3）

- **完整 42 段原版动作模型**：`public/assets/enemies/reksai.glb`
  - 已由原 8 段动作升级为全部 **42 段原版 `.anm` 骨骼动画**（`lol2gltf` + `dedup + quantize[excl TEXCOORD_1] + meshopt`，`12.21 MB → 3.05 MB`）。
- **5 个子网格精确顺序表**：`reference/14.14/reksai_submeshes.json`（直接解析自 `RekSai_Skin26.StrawberryRebuild.skn` v4.1）：
  - `[0] Body`（6518 顶点）
  - `[1] Fin`（344 顶点）
  - `[2] Scale`（365 顶点）
  - `[3] Wrap`（1250 顶点 — 需在 `boss_reksai.ts` 隐藏）
  - `[4] Plane`（122 顶点 — 需在 `boss_reksai.ts` 隐藏）
- **全部 55 个 3D `.scb` 特效网格 JSON**：`public/assets/enemies/reksai_vfx/*.json`（`55/55`，共 `2.02 MB`，格式与 `fountain_*.json` 完全一致）。

---

## 3. 金克丝剩余 3 个 3D `.scb` 特效网格（对应 Issue #4 A）

- `public/assets/heroes/jinx/vfx/jinx_sk.json`（`Strawberry_Jinx_Base_sk.StrawberryRebuild.scb`）
- `public/assets/heroes/jinx/vfx/jinx_vfxmeshes_02.json`（`Strawberry_Jinx_Base_VFXMeshes_02.StrawberryRebuild.scb`）
- `public/assets/heroes/jinx/vfx/jinx_offset_quad_01.json`（`Strawberry_Offset_Quad_01.StrawberryRebuild.scb`）

---

## 4. 第一关（Map 1）全部 16 个补充小怪 / 小首领 / 隧道 3D 模型（对应 Q-14 B1 21 波刷怪表）

全部经 `lol2gltf` 转换并按 `tools/compress_assets.mjs` 同款管线（`dedup + quantize[excl TEXCOORD_1] + meshopt`）压缩，合计 `6.16 MB`：

`enemy_shy.glb`、`enemy_swarmer.glb`、`enemy_red.glb`、`enemy_fuemigo.glb`、`enemy_tibbers.glb`、`enemy_daisy.glb`、`enemy_lancer.glb`、`enemy_shield.glb`、`enemy_exploder.glb`、`enemy_fast.glb`、`enemy_divider.glb`、`enemy_minireksai.glb`、`enemy_spawner.glb`、`miniboss_dasher.glb`、`miniboss_artillery.glb`、`reksai_tunnel.glb`

---

## 5. 合规校验
- 不含任何 `.wad.client`、原始解包目录、未压缩 `.glb`；
- 全部分支新增文件单文件均远小于 `25 MiB`（Cloudflare 限制）；
- 未改动 `src/` 代码，通过 `npm.cmd run build` 校验。
