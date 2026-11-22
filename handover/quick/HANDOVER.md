# Quick AI 交接文档（handover/quick/HANDOVER.md）

> **本文档由 Quick AI（AWS Quick）编写和维护。**
> 最后更新：2026-11-23 01:00 CST（Q-13 金克丝按 14.14 原版修复，代码在 PR #2 待验收；角色补充：审查发现的不一致项由 Quick AI 修复、代码走 PR）· 改动编号已排到 **Q-13 / QC-06**，见第 1.0 节
> 原路径 `QUICK_AI_HANDOVER.md` 只保留跳转说明，不再更新。交接总入口：[`handover/README.md`](../README.md)
> 仓库：`https://github.com/cianasa222/swarm-remake` · Cloudflare KV 镜像：`tideline-handover`（`7bbc331619b04fc8b5b5323abba5eef0`）
> 配套阅读：[`COLLAB.md`](../../COLLAB.md)（分工、流程、防冲突）→ [`AGENTS.md`](../../AGENTS.md) → [`AI_HANDOVER.md`](../../AI_HANDOVER.md) → [`PROGRESS.md`](../../PROGRESS.md)

---

## 0. 角色变更（2026-11-22 起生效）

用户指定：**Quick AI 今后只做「审查 + 与原版比对 + 优化建议」，不再做功能开发。**

| 现在由 Quick AI 做 | 不再由 Quick AI 做（交给其他 AI） |
| :--- | :--- |
| 审查其他 AI 提交到 GitHub 的代码和 PR | `src/` 功能开发（喷泉第二批、M5、新英雄等） |
| 对照 Patch 14.14 原版数据（`map33.bin.json`、角色 `skin0.bin.json` 等）逐项比对参数 | 直接向 `main` 推送代码改动 |
| 检查是否遵守架构约定（`AI_HANDOVER.md` 1.3 节五大契约） | `.wad.client` 下载、lol2gltf 转换（本来就做不了） |
| 写审查报告到 `docs/audit/`，在 PR 下评论 `PASS` / `需修改：<清单>` 和优化建议 | 本机 `build` / `playtest` / 截图（本来就做不了） |
| 核对 GitHub ↔ KV 是否一致，发现不一致时按 COLLAB 2.1 补齐镜像 | 部署 Cloudflare |

**2026-11-23 补充（用户指示）**：Quick AI 审查中发现的「与 14.14 原版不一致」项，**由 Quick AI 直接修复**。
- 代码一律提交到分支 `quick/q<编号>-<主题>` 并开 PR，**不直接推 `main`**；PR 由开发 AI（Antigravity）构建、playtest、截图验收后合并（或由用户合并）。
- 改动登记、文档、审查报告仍直接提交到 `main` 并同步 KV；分支上的代码**合并进 `main` 后**再同步 KV。
- 2026-11-22 的 Q-04、Q-05 当时是直接提交到 `main` 的，已由 Antigravity AG-01 验收并上线；从 Q-13 起改为走 PR。

**怎么请 Quick AI 审查**：开 PR（或直接提交到 `main` 后）告诉用户，由用户在 AWS Quick 对话里说「审查 PR #N」或「审查提交 <SHA>」。Quick AI 会读 diff、拉原版数据比对，然后在 PR 评论里给结论。

---

## 1. Quick AI 已完成的操作（2026-11-22）

### 1.0 改动总索引（Quick AI 的每一次改动都必须登记在这里）

**登记规则**（Quick AI 自己遵守，也方便别的 AI 审查、检查和部署）：
1. 每次改动分配一个递增编号：git 提交用 `Q-xx`，Cloudflare 操作用 `QC-xx`，GitHub Issue 操作用 `QI-xx`。提交说明以 `[Quick AI Q-xx]` 开头。别的 AI 用 `git log --grep "Quick AI"` 就能列出 Quick AI 的全部提交。
2. **在同一次提交里**往下表追加一行：时间、提交号、改了哪些文件（行数）、改了什么、验收、部署、KV。提交后立刻把改动的文件镜像到 KV，「KV」列写「已同步」（规则见 `COLLAB.md` 2.2 节）。
3. 验收或部署状态有变化时，由完成那一步的 AI 或用户更新对应行（只改状态列，不改别的列）。
4. 回滚某一项：`git revert <提交号>`；只回滚其中一个文件：`git checkout <提交号>~1 -- <文件>` 后再提交。
5. Q-09 起，Quick AI 以审查为主；Q-13 起，审查发现的不一致项由 Quick AI 修复（见第 0 节补充）。
6. **代码改动走 PR**：行里写分支名和 PR 编号，「验收」列写「⏳ 待验收（PR #N）」；合并后由合并方把「验收 / 部署 / KV」改成实际状态。

#### A. GitHub 代码与文档提交

| 编号 | 时间（CST） | 提交 | 文件（+增 / −删 行） | 改了什么 | 验收 | 部署 | KV |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| Q-01 | 11-22 09:04 | [`05a1ef1`](https://github.com/cianasa222/swarm-remake/commit/05a1ef170b672d4c1196b6cfd8b78812cce8caff) | `public/_headers`（+2，新增） | 静态资源统一加 `Access-Control-Allow-Origin: *` | — | ✅ 随 AG-02 上线 | 已同步 |
| Q-02 | 11-22 09:48 | [`a6dfb65`](https://github.com/cianasa222/swarm-remake/commit/a6dfb65bbf9f799914e8b7f58a35e5ba10e72261) | `COLLAB.md`（+115，新增） | 分工、GitHub ↔ KV 同步、任务流程、看板 | 文档 | — | 已同步 |
| Q-03 | 11-22 20:40 | [`834ca30`](https://github.com/cianasa222/swarm-remake/commit/834ca3059a88e8274ad343bbe47e75e264eb0305) | `docs/audit/fountain_emitters_14.14.md`（+120，新增） | 喷泉 43 个发射器与代码逐项比对报告 | 文档 | — | 已同步 |
| Q-04 | 11-22 21:05 | [`c63e871`](https://github.com/cianasa222/swarm-remake/commit/c63e871b57276799c51b90611c7fd463041d708f) | `src/render/map_warehouse.ts`（+552 / −188）、`PROGRESS.md`（+20 / −1）、审查报告（+10 / −10） | **喷泉精修第一批 9 项**：新增 `makeWaveMat`、`makeFxPool`、`curve1/curve4/curveIntegral`、`fitTimerHead`、`novaGroup`（×1.75）；healspark、sparklies1 改为原版发射式；补 Nova 两层冲击波、Gold/Gold1、Timer `Decal_Start2`；修正 Basic4 / Edge12 / Edge17 / 波浪峰值；去掉计时圈暖黄；删除旧的 `hexPts/hex2Pts/chargePts/novaT` | ✅ Antigravity AG-01 验收，修正 3 处后 CLEAN PASS | ✅ AG-02 已上线（`54a77c68`） | 已同步 |
| Q-05 | 11-22 21:11 | [`46362d7`](https://github.com/cianasa222/swarm-remake/commit/46362d7a170fae55135e1f6a128317a266c1b70e) | `src/render/enemy_models.ts`（+46 / −12） | **修复小怪只剩影子**：新增 `bakeStaticGeometry()`，量化蒙皮 GLB 在合批前按骨骼烘焙；`InstancedEnemyModel.ensureLoaded()` 改用它 | ✅ Antigravity AG-01 验收 PASS（8/8 小怪正常） | ✅ AG-02 已上线（`54a77c68`） | 已同步 |
| Q-06 | 11-22 21:29 | [`7ce4bd1`](https://github.com/cianasa222/swarm-remake/commit/7ce4bd126c2151439e1f6e0a1c1b6afc900d5880) | `AI_HANDOVER.md`（+14） | 2.2 节补 14.14 Windows 客户端 7 个官方清单地址 | 文档 | — | 已同步 |
| Q-07 | 11-22 21:30 | [`bdd38ad`](https://github.com/cianasa222/swarm-remake/commit/bdd38ad073a19a6c264e9b10b1bfa75cb05b0b9c) | `COLLAB.md`（+21 / −3） | 新增 2.1 节防冲突规则，刷新看板 | 文档 | — | 已同步 |
| Q-08 | 11-22 21:39 | [`06ed484`](https://github.com/cianasa222/swarm-remake/commit/06ed484aefc57a44d6e073a69c6666ff017b09ed) | `QUICK_AI_HANDOVER.md`（+196，新增）、`COLLAB.md`（+14 / −10）、`PROGRESS.md`（+5 / −2）、`AI_HANDOVER.md`（+2）、`docs/ci/fetch-14.14-reference.yml`（+84，新增） | 角色变更为只做审查；本交接文档；Actions 下载工作流（放在 `docs/ci/`，需手动复制到 `.github/workflows/`） | 文档 | — | 已同步 |
| Q-09 | 11-22 21:50 | 提交说明 `[Quick AI Q-09] …`（`git log --grep "Q-09"`） | `QUICK_AI_HANDOVER.md`、`COLLAB.md`、`AGENTS.md` | 新增本改动总索引；「开工前必读交接文档」写成规则（`COLLAB.md` 第 0 节，`AGENTS.md` 开头指向它）；下载方法改为「先直接下载，被拒才用 Worker」 | 文档 | — | 已同步 |
| Q-10 | 11-22 21:58 | 提交说明 `[Quick AI Q-10] …`（`git log --grep "Q-10"`） | `QUICK_AI_HANDOVER.md` | 登记**用户决定**：M4 压缩后的运行时资产保留在公开仓库（新增第 1.6 节） | 文档 | — | 已同步 |
| Q-11 | 11-22 22:45 | 提交说明 `[Quick AI Q-11] …`（`git log --grep "Q-11"`） | `handover/README.md`（新增）、`handover/quick/HANDOVER.md`（由 `QUICK_AI_HANDOVER.md` 迁移）、`QUICK_AI_HANDOVER.md`（改为跳转）、`COLLAB.md`、`AGENTS.md`、`AI_HANDOVER.md` | 新增交接总入口；按 AI 名字分目录；`COLLAB.md` 新增 2.2 节「交接文档更新规则（强制）」；去掉线上站点的交接文档链接；修复 Q-10 插入时弄断的表格 | 文档 | — | 已同步 |
| Q-12 | 11-23 00:35 | 提交说明 `[Quick AI Q-12] …`（`git log --grep "Q-12"`） | `docs/audit/jinx_14.14.md`（新增）、`handover/quick/HANDOVER.md`、`handover/README.md`（第 3 节自己一行 + 第 5 节） | **审查**：金克丝移速、Q/E/R/被动数值、28 套特效与 14.14 原版逐项比对（审查对象 `457e56d`）；结论 E 伤害、R 伤害、被动移速 ❌，特效尺寸换算规则全项目不统一 ⚠️；修改建议交开发 AI | 审查报告 | — | 已同步 |
| Q-13 | 11-23 01:00 | 代码：分支 `quick/q13-jinx-14.14` `c5d1b04`，[PR #2](https://github.com/cianasa222/swarm-remake/pull/2)；文档：`main` 上的 `[Quick AI Q-13]` 提交 | 分支：`src/config.ts`、`src/sim/game.ts`、`src/main.ts`、`src/render/jinx_vfx.ts`、`src/render/weapon_vfx.ts`；`main`：`docs/audit/jinx_14.14.md`（订正 + 第 9 节）、本文件、`handover/README.md`、`COLLAB.md` | **按用户指示修复金克丝与 14.14 原版的不一致**：E/R 伤害、前摇、E 锥形随机和 22 m、R 命中即爆和已损失生命加成、被动移速、受击半径、索敌距离、子弹判定、穿透衰减；被动光环、R 飞行、E/R 爆炸、子弹和 E 火箭特效按原版重建。订正 Q-12 报告 2 处错误（E 射程、被动移速含义） | ✅ Antigravity AG-04 验收 CLEAN PASS（`build` + `playtest` 4/4 + 7 组 `1280×800` 截图，已合并 `c92c5d5`） | ⏳ 未部署 | 已同步 |
| Q-14 | 11-23 01:30 | 提交说明 `[Quick AI Q-14] …`（`git log --grep "Q-14"`） | `docs/audit/live_vs_14.14.md`（新增）、`handover/quick/HANDOVER.md` | **审查**：线上版本（`ecc07343` = `a84d57a`）的武器/被动/敌人/波次/掉落/首领与 14.14 原版逐项比对。一致：12 被动、9 武器冷却伤害数量、进化配对；A 类数值不符 18 项（耀光生命加成、4 把武器射程、旋风切割器 4 项、首领 900 s、30 级后经验表、补给箱等）；B 类结构不符 4 项（21 段原版刷怪时间线与 20 种敌人、近战普攻/精英技能、首领战刷怪与狂暴、原版无冲刺）；C 类无法核对 7 项。修复计划 Q-15/16/17，需等 PR #2 合并后开分支 | 审查报告 | — | 已同步 |
| Q-15 | 11-23 01:20 | 代码：分支 `quick/q15-a-class-14.14` `3655218`，[PR #3](https://github.com/cianasa222/swarm-remake/pull/3) | `src/config.ts`（+21 / −10）、`src/sim/game.ts`（+10 / −8）、`src/sim/weapons.ts`（+5 / −5） | **修复** Q-14 的 A 类 14 项：耀光生命加成 3.5%；UwU/十字弩射程 9 m、回旋刃 8 m、巨爆选目标 8 m、巨爆进化爆炸 1.8 m；旋风切割器半径 2.0/3.5、命中半径 0.5/0.65、击退 1.5 m、受击间隔 1.0 s；首领 900 s；原版完整 99 级经验表（第 91 项笔误按中值修正）；补给箱生命 100；超距传送 22–23 m。**未编译**；PR #2 已合并，PR #3 目标已改为 `main`，待验收 | ⏳ 待验收 | — | 已同步 |

**验收 Q-13（PR #2）时重点看**：
- `npm.cmd run build`：`PlayerState` 新增 `eCastT` / `rCastT` / `excitedCount`；`JINX_E` / `JINX_R` / `JINX_PASSIVE` 字段改名（`baseDamage` → `level1Damage`，删除 `msBonus` / `asBonus`）；`allocPlane` / `allocMesh` 末尾新增可选参数；新方法 `ultAimDir` / `startUlt` / `setPassiveRing`。
- `playtest`：难度会变（E 降、R 前期升、被动移速大降、受击半径变小），记录通关率和等级曲线；**不要为平衡改回非原版数值**，有问题在 PR 里说明。
- 截图：被动光环是否过大、E 22 m 锥形齐射、R 命中第一个敌人即爆、R 地面投影 13.6 m 是否过大。

**审查 Q-04 / Q-05 时重点看**：
- Q-04：`npm.cmd run build` 能否通过（新增 TS 类型 `FxCurves`、`FxParticle`、`FxPool`）；`?spot=hub` 下 Nova 放大 1.75 倍后光柱会不会穿出建筑；healspark 0.4 m 是否过小；sparklies1 生成点是否在进度圈前端（取决于 `fitTimerHead()` 的拟合结果）。
- Q-05：第一波小怪模型是否出现，大小、朝向、姿势是否正确；精英怪、雷克塞不经过这段代码，不受影响。

#### B. Cloudflare 与 GitHub Issue 操作（不在 git 历史里，单独登记）

| 编号 | 时间（CST） | 位置 | 操作 | 当前状态 |
| :--- | :--- | :--- | :--- | :--- |
| QC-01 | 11-22 09:15–09:21 | Worker `tideline-ref-fetcher` | 新建：关闭公网访问，每分钟定时抓 `map33.bin.json` 写入 KV | 抓取成功后已清空定时任务 |
| QC-02 | 11-22 09:33–09:42 | 同上 | 扩到 15 个路径（10 个 `.bin.json` + 5 个 `.scb`） | 8 个成功、7 个 404；已清空定时任务 |
| QC-03 | 每个 Q-xx 之后 | KV `tideline-handover` | 镜像对应文件，更新 `FILE_INDEX.json` / `SYNC_STATE.json`，写完核对 SHA-256 | 与 GitHub `main` 一致 |
| QC-04 | 11-22 21:08 | KV `FILE_INDEX.json` | 发现被整份覆盖成 5 条，按 KV 实际 key 重建为 47 条。**根因（22:35 查明）**：线上 Worker `tideline-swarm` 第 4、5 版（11-22 20:33 / 20:36 用 wrangler 部署）带有公开接口 `/__sync_kv`，任何人访问一次就用网站上的旧文件整份覆盖 KV 文档和 `FILE_INDEX.json` | 已修复；接口已在 QC-05 停用 |
| QC-05 | 11-22 22:35–22:36 | Worker `tideline-swarm` | **用户要求下线网站上的交接文档**。上传第 6 版 Worker 代码（保留全部静态资源和 `_headers`，去掉 KV 绑定）；再用 PATCH 生成第 7 版，`run_worker_first` 只拦 `/AI_HANDOVER.md`、`/PROGRESS.md`、`/AGENTS.md`、`/FULL_SOURCE_BUNDLE.md` 四个路径，Worker 对它们和 `/__sync_kv` 返回 **410**，其余请求照旧走静态资源。**回滚**：部署回第 5 版 `a3c67b1e-d464-42ed-a4a7-bf66e29446d6` | 第 7 版 `fd0b8ae2-54ef-433a-81e7-a1b2c4f73afb` 已 100% 部署；验证见 QC-06 |
| QC-06 | 11-22 22:36 | Worker `tideline-ref-fetcher` | 临时改为一次性探测：从 Cloudflare 内部请求线上站点 8 个路径，结果写入 KV `_probe/site_check.json`；读取后删除该 key、清空定时任务 | ✅ 22:44 验证通过：`/` 200（HTML）；4 份交接文档和 `/__sync_kv` 均 410；`/assets/map1/minimap.webp`、`/assets/enemies/enemy_pix.glb` 200，均带 `Access-Control-Allow-Origin: *`。探测 key 已删除，定时任务已清空 |
| QI-01 | 11-22 09:35 | [Issue #1](https://github.com/cianasa222/swarm-remake/issues/1) | 新建外包任务 | 待领取 |
| QI-02 | 11-22 09:42 / 09:48 / 20:41 / 21:30 | Issue #1 评论 | 范围更新 / 流程说明 / 网格与贴图订正 / 改用 Windows 清单 | 以最新评论为准 |

### 1.1 代码改动详情（都在 `main` 上，**都还没有在本机编译和实测**）

| 提交 | 文件 | 内容 | 状态 |
| :--- | :--- | :--- | :--- |
| `05a1ef1` | `public/_headers` | 静态资源统一加 `Access-Control-Allow-Origin: *`，替代 `worker.js` 里加 CORS（`run_worker_first` 应为 `false`，否则 `_headers` 不生效） | 待部署 |
| `c63e871` | `src/render/map_warehouse.ts` | 喷泉精修第一批 9 项（详见 `PROGRESS.md` 2.5 节）：Nova ×1.75、各层原版寿命、补 Nova 两层冲击波和 Gold/Gold1 粒子、补 Timer `Decal_Start2`、healspark 和 sparklies1 改为原版发射式、Basic4/Edge12/Edge17/波浪峰值修正、去掉计时圈暖黄。新增通用粒子设施 `makeFxPool` | 🧪 待验收 |
| `46362d7` | `src/render/enemy_models.ts` | **修复小怪只剩影子**：M4 量化后小怪 GLB 的 `POSITION` 是 Int16 归一化，反量化缩放写在骨骼 `inverseBindMatrices` 里；`InstancedEnemyModel` 原来丢掉蒙皮属性，模型只剩 1–2 cm。新增 `bakeStaticGeometry()`，按静止姿态 `applyBoneTransform` 烘焙后再合批 | 🧪 待验收 |

**验收清单（交给开发 AI / 用户）**：
1. `npm.cmd run build`、`npm.cmd run playtest -- 2 0.85` 退出码均为 0。
2. `?spot=hub` 1280×800 截 4 张：常驻 / 充能中 / 满充 Nova 瞬间 / 冷却。重点看：Nova 放大后光柱是否切穿外围建筑；healspark 0.4 m 是否过小；sparklies1 是否从进度圈前端生成（进度头角度由 `fountain_timer.json` 的 uv.x 自动拟合，最可能出错）。
3. 第一波小怪：模型是否出现、大小是否正常、朝向和姿势是否正确。
4. 有问题时由开发 AI 修改，修完再交 Quick AI 审查。

### 1.2 文档

| 提交 | 文件 | 内容 |
| :--- | :--- | :--- |
| `a6dfb65` | `COLLAB.md` | 新建：分工、GitHub ↔ KV 同步规则、任务领取/交付/验收流程、任务看板、执行 AI 开场指令 |
| `834ca30` | `docs/audit/fountain_emitters_14.14.md` | 喷泉 43 个发射器与代码逐项比对（28 有对应 / 15 缺失），并标注修复分工 |
| `c63e871` | `PROGRESS.md` | 新增 2.5 节（喷泉精修第一批） |
| `7ce4bd1` | `AI_HANDOVER.md` | 2.2 节补 Patch 14.14 Windows 客户端 7 个官方清单地址 |
| `bdd38ad` | `COLLAB.md` | 新增 2.1 节防冲突规则，刷新任务看板 |
| 本次 | `QUICK_AI_HANDOVER.md`、`COLLAB.md`、`AI_HANDOVER.md`、`PROGRESS.md`、`docs/ci/fetch-14.14-reference.yml` | 角色变更、本交接文档、免解包直链方法 |

### 1.3 GitHub Issue

- [Issue #1](https://github.com/cianasa222/swarm-remake/issues/1)：外包任务（T1 下载解包 / T2 5 个 Nova 网格 / T3 lol2gltf 复核 / T4 15 张贴图）。**以最新评论为准**，已有 4 次订正（09:42 范围、09:48 流程、20:41 网格与贴图、21:30 改用 Windows 清单）。目前**待领取**。

### 1.4 Cloudflare 账号里的操作（账号 `63223f8370990e669e94ab2e9c56683a`）

| 资源 | 状态 | 说明 |
| :--- | :--- | :--- |
| KV `tideline-handover` | 使用中 | 源码和文档镜像（47 条，见 `FILE_INDEX.json`）+ `SYNC_STATE.json`（最后同步的提交号和每个文件的 SHA-256）+ `ref/14.14/` 原版参考数据 |
| Worker `tideline-ref-fetcher` | **已停用**（定时任务已清空，公开网址已关闭；最后一次用于 QC-06 站点探测） | 从 CommunityDragon 抓取原版文件写入 KV 的临时工具，代码见第 3.3 节；需要时重新设定时任务即可复用 |
| Worker `tideline-swarm` | Antigravity AG-02 部署（`54a77c68`，11-22 23:52） | 包含 Q-04 / AG-01 / Q-05；保留 QC-05 的 410 文档拦截和 `/__sync_kv` 停用 |

### 1.5 排查过、已有结论的问题

| 问题 | 结论 |
| :--- | :--- |
| `tideline-swarm.cianasa888-gbd.workers.dev` 对外部工具返回 403 | 不是站点配置问题；数据中心发出的请求会被 Cloudflare 边缘拦截或执行环境本身禁止外网。浏览器访问正常 |
| GitHub 连接器写 `.github/workflows/` 被拒（`INSUFFICIENT_SCOPE`） | 连接器本身没有 workflow 权限，重连无效。工作流文件只能由用户在 GitHub 网页手动建 |
| GitHub 连接器一度读写都失败（OAuth 异常） | 用户撤销授权后重连解决 |
| KV `FILE_INDEX.json` 被整份覆盖成 5 条 | 已按 KV 实际 key 重建为 47 条；为此新增 COLLAB 2.1 防冲突规则 |
| `worker.js` 里加的 CORS 头对静态资源不生效 | 静态资源默认不经过 Worker 代码；已改用 `public/_headers`（20:33 那次部署已带上，线上生效） |
| KV 文档和索引被莫名覆盖 | 线上 Worker 的公开接口 `/__sync_kv` 会用网站旧文件覆盖 KV；已在 QC-05 停用。今后禁止任何「非 GitHub 来源整份写 KV」的机制（`COLLAB.md` 2.2 节第 6 条） |

### 1.6 用户决定（其他 AI 请照此执行，不要擅自改动）

| 日期 | 决定 | 说明 |
| :--- | :--- | :--- |
| 2026-11-22 21:55 | **M4 压缩后的运行时资产（`public/assets/`，273 个文件、约 38.5 MB）保留在公开 GitHub 仓库，仓库保持公开** | 好处：Cloudflare 自动部署和其他 AI 拉下仓库即可直接构建。**不要**把仓库改成私有、不要把资产移出仓库或加进 `.gitignore`，除非用户另有指示。未压缩原始资产（`_assets_raw_backup`）、解包目录（`资产包/`）、`.wad.client`、解包工具仍只留在用户本机，**不得提交**。风险备忘：这些是 Riot Games 的版权资源；如收到 GitHub DMCA 下架通知，应急方案是把仓库改为私有，或把资产迁到 Cloudflare R2 并在构建时设置 `VITE_ASSET_BASE_URL`（`src/render/assets.ts` 已支持），具体由用户决定。 |

---

## 2. 剩余工作（交给开发 AI / 执行 AI，Quick AI 负责审查）

| 优先级 | 事项 | 建议负责方 |
| :---: | :--- | :--- |
| P0 | 验收并修正 `c63e871`（喷泉第一批）和 `46362d7`（小怪修复），见 1.1 节验收清单 | 开发 AI + 用户 |
| P0 | 重新部署线上：`git pull` → `npm.cmd run build` → 部署 `dist/`，`run_worker_first: false` | 用户 |
| P1 | Issue #1：T1 下载解包、T2 5 个 Nova 网格、T4 15 张贴图、4 种小怪 `skin0.bin.json` | 执行 AI（Muse） |
| P1 | 喷泉第二批：7 个常驻层的 textureMult 叠加；Timer 进度遮罩换用 `Base_Timer_Mult_05–09`；Nova `Beamdown` ×2、`flashBlend`、`Ground_Light_mesh1`、`Ring`、`ShapeAround`、`InhaleFire` ×3、`teamring_circle1`（依赖 Issue #1 交付，清单见审查报告 4.3 节） | 开发 AI |
| P2 | M5：三档画质验收；`teammateVfxScale` 目前只在 `jinx_vfx.ts`，`weapon_vfx.ts` 还没有；`game.ts` 还没有 `players[]` | 开发 AI |
| P2 | 自动部署：在仓库根目录加 `wrangler.jsonc`（Worker 名 `tideline-swarm`，只上传 `dist/`，纯静态资源），用户在 Cloudflare 后台连接 GitHub；建议非生产分支 `preview` 走预览地址 | 开发 AI + 用户 |
| P3 | 清理没有被引用的 `src/render/lan.ts`（1022 行）和 `world.ts` 里的 `buildWorld()`（`WorldView` 类型仍在用） | 开发 AI |
| P3 | `tools/compress_assets.mjs` 写死了本机绝对路径（如第 11 行 `c:/七星/游戏/...`），改成相对项目根目录 | 开发 AI |
| P3 | `strawberry_enemy_hunter/skins/skin0.bin.json` 只有 1.3 KB，疑似不完整，由 Issue #1 解包后替换 | 执行 AI |

---

## 3. 原版数据来源与「免解包直链直下」方法

### 3.0 先选下载方法（按环境决定，Worker 和 Actions 都是可选方案）

1. **先直接下载**：在你自己的环境里对第 3.1 节的直链执行 `curl -L -o <文件> <地址>` 或 `fetch`。返回 200 且内容正确（`.json` 以 `{` 开头、`.png` 以 PNG 文件头开头），就直接用，**不需要 Worker**。用户本机、大多数开发 AI 的本机环境都属于这种情况。
2. **直接下载被拒**（403、域名解析失败、执行环境禁止外网）时，才用 **3.3 节 Cloudflare Worker 方案**（可选，已验证）。Quick AI 的执行环境就是这种情况。
3. 也可以用 **3.4 节 GitHub Actions 方案**（可选，尚未验证），前提是有人能在 GitHub 网页上建工作流文件。
4. `.scb` 网格和 Pix / Ghoul / Dasher 的 `skin0.bin.json` 在 CommunityDragon 上 404，任何方法都直链不到，只能按 3.2 节下载 `.wad.client` 解包。

### 3.1 CommunityDragon Patch 14.14（免解包，直接 HTTP GET）

根地址：`https://raw.communitydragon.org/14.14/game/`（目录页可在浏览器直接浏览，路径全小写）

| 类别 | 地址 | 实测 |
| :--- | :--- | :--- |
| 地图配置（喷泉 / 补给箱 / 刷怪 / 全部 VFX 发射器） | `data/maps/shipping/map33/map33.bin.json` | ✅ 7.1 MB，最后修改 2024-07-23 |
| 地图材质与 `MapSunProperties` | `data/maps/mapgeometry/map33/strawberry_animasquad_map1.materials.bin.json` | ✅ |
| 金克丝数值 / 特效 | `data/characters/strawberry_jinx/strawberry_jinx.bin.json`、`.../skins/skin0.bin.json` | ✅ |
| 雷克塞 | `data/characters/strawberry_boss_reksai/strawberry_boss_reksai.bin.json`、`.../skins/skin0.bin.json` | ✅ |
| 精英怪 Bruiser | `data/characters/strawberry_miniboss_bruiser/skins/skin0.bin.json` | ✅ |
| 小怪 Hunter | `data/characters/strawberry_enemy_hunter/skins/skin0.bin.json` | ⚠️ 仅 1.3 KB |
| 小怪 Pix / Ghoul / Dasher | `data/characters/strawberry_enemy_{pix,ghoul,dasher}/skins/skin0.bin.json` | ❌ 404，需解包 |
| 地图特效贴图 | `assets/maps/particles/strawberry/<小写名>.strawberryrebuild.png` | ✅ 目录可浏览（例：`healingstation_scan_lines.strawberryrebuild.png`） |
| 地图特效网格 `.scb` | `assets/maps/particles/strawberry/*.scb` | ❌ 404（CommunityDragon 不托管 `.scb`），需解包 |
| 22 张烘焙光照 | `data/maps/mapgeometry/map33/strawberry_animasquad_map1_lightmaps/0.png` … `21.png` | 未实测 |
| 其余角色、UI 图标、新英雄 | 见 `AI_HANDOVER.md` 2.1 节完整列表 | — |

**文件名规则**：游戏里的路径 `ASSETS/Maps/Particles/Strawberry/HealingStation_Dots.StrawberryRebuild.dds` 对应 CommunityDragon 的 `assets/maps/particles/strawberry/healingstation_dots.strawberryrebuild.png`（全小写，`.dds`/`.tex` 换成 `.png`）。

### 3.2 拳头官方 Patch 14.14 清单（需要 ManifestDownloader，在 Windows 上跑）

来源：[`Morilli/riot-manifests`](https://github.com/Morilli/riot-manifests) 的 `LoL/NA1/windows/lol-game-client/14.14.*.txt`（**不要用 `macos` 目录**）。7 个小版本的地址已写入 `AI_HANDOVER.md` 2.2 节；默认用最后一版：

`14.14.6034237` → `https://lol.secure.dyn.riotcdn.net/channels/public/releases/17A8CACF07883D41.manifest`

清单只记录文件名和数据块索引，要用 ManifestDownloader 按清单从同一 CDN 下载拼出 `.wad.client`，再用 `hashes.game.txt` 解包。

### 3.3 可选方案 A（已验证）：用 Cloudflare Worker 定时任务抓到 KV

**什么时候用**：只有在 3.0 节第 1 步直接下载失败时才用。从部分 AI 执行环境或数据中心直接请求 CommunityDragon 会返回 403 或被禁止外网，但部署好的 Worker 可以正常访问。需要有用户 Cloudflare 账号的 API 权限。

**步骤**（Cloudflare API，账号 `63223f8370990e669e94ab2e9c56683a`）：
1. `PUT /accounts/{id}/workers/scripts/tideline-ref-fetcher`（multipart：`metadata` 绑定 KV `KV` → `7bbc331619b04fc8b5b5323abba5eef0`，加下面的 `worker.js`）。
2. `POST .../scripts/tideline-ref-fetcher/subdomain`，内容 `{ "enabled": false, "previews_enabled": false }`（不开放公网访问）。
3. `PUT .../scripts/tideline-ref-fetcher/schedules`，内容 `[{ "cron": "* * * * *" }]`。**首次生效约需 2–8 分钟**。
4. 读 KV `ref/14.14/<路径>.status` 看结果（`http_code`、`bytes`、`ok`），成功的文件在 `ref/14.14/<路径>`。
5. 完成后**务必** `PUT .../schedules`，内容 `[]`，停掉定时任务。

```js
// worker.js —— 按 PATHS 抓取 CommunityDragon 14.14 文件写入 KV；已成功的不重复抓
const G = "https://raw.communitydragon.org/14.14/game/";
const PATHS = [
  "data/maps/shipping/map33/map33.bin.json",
  // "assets/maps/particles/strawberry/healingstation_scan_lines.strawberryrebuild.png",
];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
export default {
  async scheduled(event, env) {
    for (const rel of PATHS) {
      const key = "ref/14.14/" + rel;
      const prev = await env.KV.get(key + ".status");
      if (prev) { try { if (JSON.parse(prev).ok) continue; } catch {} }
      const st = { url: G + rel, utc: new Date().toISOString() };
      try {
        const r = await fetch(G + rel, { headers: { "User-Agent": UA } });
        st.http_code = r.status;
        const buf = await r.arrayBuffer();
        st.bytes = buf.byteLength;
        const head = new Uint8Array(buf.slice(0, 8));
        const isJson = rel.endsWith(".json");
        st.ok = r.status === 200 && (isJson ? head[0] === 123 : true);
        if (st.ok) await env.KV.put(key, buf); // KV 单值上限 25 MiB
        else st.body_head = new TextDecoder().decode(buf.slice(0, 600));
      } catch (e) { st.error = String((e && e.message) || e); }
      await env.KV.put(key + ".status", JSON.stringify(st));
    }
  },
};
```

**已抓到的 KV 参考数据**（`ref/14.14/` 下，不进公开仓库）：`map33.bin.json`、`strawberry_animasquad_map1.materials.bin.json`、金克丝 ×2、雷克塞 ×2、Bruiser `skin0`、Hunter `skin0`（不完整）。

### 3.4 可选方案 B（未验证）：GitHub Actions 抓到 `reference-14.14` 分支

工作流文件已写好，放在 [`docs/ci/fetch-14.14-reference.yml`](../../docs/ci/fetch-14.14-reference.yml)（Quick AI 没有 workflow 权限，只能放在 `docs/` 下）。用户在 GitHub 网页新建 `.github/workflows/fetch-14.14-reference.yml` 并粘贴内容即可启用；运行后结果写进 `reference-14.14` 分支的 `FETCH_STATUS.txt`。GitHub 运行机是否也被 CommunityDragon 拦截**尚未测试**。如需在 Windows 运行机上跑 ManifestDownloader / lol2gltf，可在此基础上改 `runs-on: windows-latest`。

---

## 4. 审查时要重点核对的已知坑（给 Quick AI 和开发 AI）

1. **量化 + 蒙皮的 GLB**：`tools/compress_assets.mjs` 的 `quantize` 会把 `POSITION` 存成 Int16 归一化，蒙皮网格的反量化缩放在 `inverseBindMatrices` 里。任何**不走 `SkinnedMesh` 而直接取顶点**的代码（合批、碰撞、包围盒）都必须先 `applyBoneTransform` 烘焙，否则尺寸只有约 1 个单位。
2. **`TEXCOORD_1` 不能量化**：地图烘焙光照 UV 依赖它（`AI_HANDOVER.md` 1.3 节第 5 条）。
3. **单位换算**：拳头 1 单位 = 0.01 m；面片尺寸 = 2 × `birthScale` / 100 m；网格缩放 = `birthScale` / 100；系统 `transform` 缩放（如 Nova 1.75）要整体乘上。
4. **颜色空间**：`.bin.json` 里的颜色是 sRGB 数值，写进 Shader uniform 或顶点属性前要转线性，经 `colorspace_fragment` 输出后才和原版一致。
5. **`PointsMaterial` 会忽略 `Texture.repeat/offset`**：图集必须用 `loadSpriteCell()` 切格，或用自定义 Shader 按帧采样。
6. **画质档位只调渲染负载**：`QUALITY_SPECS[tier].fxScale` 只能缩放粒子发射数量，不能改 `src/sim/` 的刷怪数量。
7. **所有资源必须经 `src/render/assets.ts` 加载**：审查时检查 `new GLTFLoader` / `new THREE.TextureLoader` / 裸 `fetch('./assets/...')`。
8. **`src/sim/` 纯净度**：不得出现 `three`、`window`、`document`、`Math.random`（随机数统一用 `makeRng`）。

---

## 5. 防冲突方案（摘要，完整规则见 `COLLAB.md` 2.1 节）

1. **先拉后改**：改共享文件前先从 GitHub `main` 拉最新版；通过 API 写文件时带上拉取时的文件 SHA，冲突会被 GitHub 拒绝。
2. **只改自己负责的那一节**，注明作者和日期，不整份重写别人的内容。
3. **一次提交只做一件事**，提交说明写清改了哪些文件、哪一节。
4. **KV 只做镜像、只做增量**：只镜像 GitHub 上已提交的内容，写完核对 SHA-256；`FILE_INDEX.json` / `SYNC_STATE.json` 只改对应条目，禁止整份替换；条目数异常时按 KV 实际 key 重建并在 `SYNC_STATE.json` 的 `note` 里记录。
5. **发现冲突先停**，重新拉取合并；拿不准就在 Issue 里说明或问用户。
6. **不在 `main` 上 force push**，不删除别人的分支、Issue 或评论。

**同步分工**：按 `COLLAB.md` 2.2 节，**谁改代码，谁就在同一轮工作里同时更新 GitHub 和 KV 两处的交接文档**；没有 Cloudflare 权限的，在改动行的「KV」列写「待同步」，由有权限的 AI 或 Quick AI 审查时补齐。**两边不一致时一律以 GitHub `main` 为准。**
