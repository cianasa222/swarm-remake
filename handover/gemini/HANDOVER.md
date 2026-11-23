# Gemini 交接文档（handover/gemini/HANDOVER.md）

> 🔁 **工作方式（用户 2026-11-23 指定）**：Gemini 为**与 Quick AI 相同的角色**（角色由用户随时指定），**仅可访问 Cloudflare（不连 GitHub）**；只负责读取与更新 Cloudflare KV（`tideline-handover`）上的交接文档和独立 `pending/<任务>/` 临时代码，**提交到 GitHub、开 PR、本机编译与验收由其他具备 GitHub 权限的 AI 负责**（遵循 `COLLAB.md` 2.2 第 10 条、2.3、2.4）。

> **本文档由 Gemini 编写和维护。**
> 最后更新：2026-11-23 20:08 CST · 编号前缀：`GM-`（当前已排到 **GM-09**）
> 交接总入口：[`handover/README.md`](../README.md) · 协作规范：[`COLLAB.md`](../../COLLAB.md)

---

## 1. 角色定位与权限边界

| 维度 | 说明 |
| :--- | :--- |
| **角色定位** | 与 Quick AI 相同，角色由用户随时指定（审查、14.14 原版数据比对、文档/方案整理、KV 临时代码编写等） |
| **可访问平台** | **仅 Cloudflare**（账号 `63223f8370990e669e94ab2e9c56683a`、KV `tideline-handover` 等） |
| **不可直接访问** | GitHub 仓库写入/PR（无 GitHub 连接器）；本机 Windows 编译、解包与真机运行 |
| **交付方式** | 交接文档写在本目录；若后续产成代码/补丁，按 `COLLAB.md` 2.2 第 10 条写入独立 `pending/<任务>/` 并登记 `SYNC_STATE.json` 与 `FILE_INDEX.json`，交由其他有 GitHub 权限的 AI 核对代上传、开 PR 与编译验收 |
| **防冲突承诺** | 不覆盖 `kv_only_pending` 及其他 AI 目录，不删除 `pending/` 或备用资产，不推进全局 `SYNC_STATE.commit`，共享文件仅做增量修改并在写后核对 SHA-256 |

---

## 2. 改动索引

| 编号 | 时间（CST） | 提交 | 文件（+增 / −删 行） | 改了什么 | 验收 | 部署 | KV |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| GM-01 | 2026-11-23 10:42 | ⚠️ **仅 KV，待代上传** | `handover/gemini/HANDOVER.md`（新增）、`handover/README.md`（§3 新增 Gemini 行）、`FILE_INDEX.json`（增量）、`SYNC_STATE.json`（增量） | 按 `COLLAB.md` 第 0 节通读全部交接文档了解项目，并按用户要求登记 Gemini 目录与角色（与 Quick AI 相同，仅可访问 Cloudflare） | 文档核对 | 不涉及 | 仅 KV（待其他 AI 合并至 GitHub） |
| GM-02 | 2026-11-23 11:02 | ⚠️ **仅 KV，待代上传**（`pending/bab01-gemini/`） | `pending/bab01-gemini/`（12 文件：修订 `extract_vfx_14_14.cjs`、新增 `extract_vfx_14_14.test.cjs`、重跑 6 份数据 JSON + `index.json`、新增 `gemini_Q01_01_02_fix.md` / `README.md` / `MANIFEST.json`）；本文件、`handover/README.md`、`COLLAB.md`、`FILE_INDEX.json`、`SYNC_STATE.json` | 修复 GPT-13 验收缺陷 **Q01-01**（回旋刃 3 个进化系统，`weapons.json` 38→41）与 **Q01-02**（精英光环 2 个进 `enemy.json` 11→13；补给箱 3 + 掉落拾取 18 + 玩家核心反馈 4 进 `map.json` 25/128；合计 152 系统 / 883 层，0 重复 ID）；未动 `pending/bab01-quick/` 原件 | `node --check` + `node --test` 4/4 PASS；14.14 BIN 全量重跑 PASS；仓库构建与实机待验 | 不涉及 | 仅 KV（`pending/bab01-gemini/`） |
| GM-03 | 2026-11-23 11:12 | ⚠️ **仅 KV，待代上传**（`pending/bab01-gemini/`） | `pending/bab01-gemini/` 新增 `asset_map.json`、`docs/bab01/gemini_Q01_03_asset_map.md`，回填 6 份数据 JSON 中 95 张主线已有贴图的 `project` 路径，更新 `MANIFEST.json` 及交接/索引 | 修复 GPT-13 **Q01-03**：完成 555 贴图（主线已有 95 + CDragon 14.14 实测 555/555 真 PNG 可直下）、133 网格（主线 29 + 备用分支 62 + 缺口 42）与 21 层无名 `attachedMesh` 实体绑定逐路径映射 | 555/555 CDN PNG 魔数实测 PASS；主线/备用树核对 PASS；仓库构建待验 | 不涉及 | 仅 KV（`pending/bab01-gemini/`） |
| GM-04 | 2026-11-23 19:35 | ⚠️ **仅 KV，待合入 PR #10** | `handover/gemini/PR10_QC19_ASSETS_GM04.md`（新增）、本文件、`handover/README.md`、`FILE_INDEX.json`、`SYNC_STATE.json` | 核验 PR #10（`77c25a35`）QC-19 新增 5 套系统的 9 张贴图与 2 个网格：9/9 贴图 CommunityDragon 14.14 实测真 PNG（HTTP 206 + PNG 魔数，主线/备用均无 → `cdragon_verified_download`，总计 564=95 主线+469 直下）；2/2 `.scb` 网格 CDragon 404 且主线/备用均无 → `missing_unpack`（总计 135=29 主线+62 备用+44 缺口） | 9/9 CDN PNG 魔数实测 PASS；主线/备用树核对 PASS | 不涉及 | 仅 KV |
| GM-05 | 2026-11-23 19:45 | ⚠️ **仅 KV，待合入 PR #10 / B4** | `handover/gemini/B4_Q01_07_FALLBACK_SPEC_GM05.md`（新增）、本文件、`handover/README.md`、`FILE_INDEX.json`、`SYNC_STATE.json` | 完成 GPT-13 **Q01-07** 数据核查与降级规格：基于 PR #10 全部 157 系统 / 903 层统计 20 类未支持字段（611/611 100% 无损保留，含 `alphaErosion` 161、`useNavmeshMask` 91、`colorLookUpY` 83、`FlexShape` 69、`softParticle` 52 等）及 27 层特殊混合模式（`mode3` 22、`mode2` 3、`mode5` 2），给出 B4 首版有依据 fallback 与实现优先级 | 157/903 全量统计与无损保留核验 PASS；实机标定待 B4/B6 | 不涉及 | 仅 KV |
| GM-06 | 2026-11-23 19:46 | ⚠️ **仅 KV，供 UI/HUD 验收参考** | `handover/gemini/HUD_Q01_08_PROBE_GM06.md`（新增）、本文件、`handover/README.md`、`FILE_INDEX.json`、`SYNC_STATE.json` | 实测 GPT-13 **Q01-08** 的 48 张原版 HUD 逻辑贴图（对应 13 张直接图集 + 7 张 `uiautoatlas` 母图，共 20 个实际 PNG）：20/20 在 CommunityDragon 14.14 全部 HTTP 206 + `image/png` + PNG 魔数通过，记录全部 IHDR 像素尺寸（合计 6.09 MiB，0 失败）；未触碰 PR #9 或任何 UI 代码 | 20/20（覆盖 48/48 贴图）CDN PNG 与 IHDR 实测 PASS | 不涉及 | 仅 KV |
| GM-07 | 2026-11-23 19:55 | ⚠️ **仅 KV，待代上传**（`pending/audio-fix-gemini/`） | `handover/gemini/AUDIO_FIX_TRANSFER_LIST_GM07.md`、`pending/audio-fix-gemini/`（`src/audio/audio.ts`、`src/main.ts`、`README.md`、`MANIFEST.json`）、本文件、`handover/README.md`、`COLLAB.md`、`FILE_INDEX.json`、`SYNC_STATE.json` | 诊断并修复线上音频破音、延迟与错音：声道上限 10 + 优先级让位 + SFX/总输出双限幅器 + `onended` 释放节点 + `noise()` 4ms 淡入 + 并发 4 分批解码队列 + `latencyHint:'interactive'` + iOS `.m4a` 自动回退；修复 `main.ts` 中 `ult_r` 播成小爆炸与 `card` 双播重影；输出 110 条 `.ogg` 转 `.m4a` 及 `inbox/gemini/audio-fix/` 临时中转清单 | 代码待本机 `build` 与真机实听验收 | 不涉及 | 仅 KV（`pending/audio-fix-gemini/`） |
| GM-08 | 2026-11-23 19:58 | ⚠️ **仅 KV，待合并至 GitHub** | `COLLAB.md`（新增 2.5 节）、`handover/README.md`（§1 补充 + §3 Gemini 行）、本文件、`FILE_INDEX.json`、`SYNC_STATE.json` | 按用户指示正式写入 **KV 临时中转箱规则（`inbox/<接收AI>/<任务>/`）**：明确无 GitHub 权限 AI 可列清单请有权 AI 传至 `inbox/` 并备注，读取采用并登记后逐 key 精确删除（与 `pending/` 隔离、豁免 2.4 待上传代码门禁） | 文档核对 | 不涉及 | 仅 KV |
| GM-09 | 2026-11-23 20:08 | ⚠️ **仅 KV，待代上传**（`pending/bab01-b4-core-gemini/`） | `pending/bab01-b4-core-gemini/`（5 文件：`curve_eval.ts`、`sim_to_vfx.ts`、`b4_core.test.ts`、`README.md`、`MANIFEST.json`）、本文件、`handover/README.md`、`COLLAB.md`、`FILE_INDEX.json`、`SYNC_STATE.json` | 编写 **BAB-01 B4 纯 TS 核心底座**：实现 `EffectDef` 曲线/随机表/积分/flex 求值器与 `EFFECT_UNITS`/预算判定（保证敌方预警不因低画质丢失）及 `SimEvent`→157 套原版 VFX 路由表（零 `inGame:false` 误绑） | `tsc --noEmit --strict` PASS；4/4 单测 PASS（含 157 套 PR #10 零悬空 ID 校验） | 不涉及 | 仅 KV（`pending/bab01-b4-core-gemini/`） |

| GM-10 | 2026-11-23 20:30 | ⚠️ **仅 KV，待代上传**（`pending/audio-uia-gemini/`） | `COLLAB.md`（新增 2.6 节+看板）、`handover/README.md`、本文件、`handover/gemini/UIA_AUDIO_MAPPING_GM10.md`、`pending/audio-uia-gemini/`（4 文件）、`FILE_INDEX.json`、`SYNC_STATE.json` | ① 按用户指示写入「实机测试先不做，优先把代码跑通」规则；② 消费 GPT 上传的 `inbox/gemini/audio-fix/` 补齐 UIA-1（9 把副武器缺口）、UIA-2（23 组敌人按怪种死亡路由）、补给箱破碎原版事件、指出 `SFX.levelUp` 实为金币哈希、核验 UIA-3 BGM 3 命名事件+2 Segment 边界，输出 `audio_uia_map.ts` + 3/3 单测并按 2.5 节精确删除中转箱 2 个临时 key | `tsc --strict --noEmit` PASS；`node --test` 3/3 PASS | 不涉及 | 仅 KV（`pending/audio-uia-gemini/`） |

| GM-11 | 2026-11-23 20:35 | ⚠️ **仅 KV，待代上传**（`pending/bab01-b1-b3-gemini/`） | `pending/bab01-b1-b3-gemini/`（5 文件：`engine_boot.ts`、`scene_specs.ts`、`b1_b3_foundation.test.ts`、`README.md`、`MANIFEST.json`）、本文件、`handover/README.md`、`COLLAB.md`、`FILE_INDEX.json`、`SYNC_STATE.json` | 补齐 **BAB-01 B1/B2/B3 纯 TS 迁移底座**：WebGPU→WebGL2 自动回退与硬件缩放/上下文丢失守卫、仓库区光照与 1.42 竖屏镜头规格、金克丝 12 态与雷克塞 17 剪辑及 `Wrap/Plane` 隐藏规则 | `tsc --strict --noEmit` PASS；`node --test` 4/4 PASS | 不涉及 | 仅 KV（`pending/bab01-b1-b3-gemini/`） |

| GM-12 | 2026-11-23 20:48 | ⚠️ **仅 KV** | `handover/gemini/MISSING_MESHES_PRIORITY_GM12.md`、本文件、`handover/README.md`、`COLLAB.md`、`FILE_INDEX.json`、`SYNC_STATE.json` | 整理 PR #10 全部 **44 个缺口网格**（40 `.scb` + 3 `.sco` + 1 `.skn`）的 P0(15)/P1(8)/P2(10)/P3(11) 定向解包优先级清单，供执行 AI 分批解包 | 44/44 程序化计数核验通过 | 不涉及 | 仅 KV |

---

## 3. 已读交接基线（2026-11-23 10:42 CST）

已按 `COLLAB.md` 第 0 节顺序通读 KV `tideline-handover` 中以下文档：
- `handover/README.md`、`COLLAB.md`、`SYNC_STATE.json`、`FILE_INDEX.json`
- `handover/quick/HANDOVER.md`、`handover/gpt/HANDOVER.md`、`handover/antigravity/HANDOVER.md`、`handover/muse/HANDOVER.md`
- `AGENTS.md`、`AI_HANDOVER.md`、`PROGRESS.md`

当前已知项目状态摘要：
- **项目目标**：1:1 复刻《英雄联盟：无尽狂潮（Swarm）》第一关「仓库区（Map33）」，原版资产来自 Patch 14.14；现线上版为 Vite + TypeScript + Three.js（M0–M4 已完成，Worker `tideline-swarm` 当前线上版本 `5955ad9a` / MU-01，含 PR #3/#7/#8），用户已批准后续全面迁移至 Babylon.js（`BAB-01`）。
- **关键进行中事项**：
  - `GPT-10`（PR #9，React + HeroUI v3 界面，独立分支待浏览器/iPhone 验收，未合并未部署）。
  - `BAB-Q01`（Quick AI 的 B0/B4 数据准备，14 个新文件仅在 KV `pending/bab01-quick/`；GPT-13 验收结果为数据完整 PASS、集成未通过，需修 Q01-01～Q01-10）。
  - 看板待领项：`PERF-1`（T1/T2b/T6/T7）、`Q-30`（战兔巨爆按 StarStrike 重做）、`WVFX`、`EMAP`、`UIA`、首领雷克塞按原版修复（Q-31 起）、`Issue #1` / `Issue #4` 剩余项。
- **下一步**：等待用户指派具体任务。
