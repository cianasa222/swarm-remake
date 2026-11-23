# Quick AI 交接文档（handover/quick/HANDOVER.md）

> 🔁 **工作方式（用户 2026-11-23 09:23 决定）**：Quick AI **不再连接 GitHub**，只负责更新 Cloudflare KV 上的代码（`pending/<任务>/`）和交接文档；**提交到 GitHub、开 PR、编译验收由其他 AI 负责**（读 `SYNC_STATE.json` 的 `kv_only_pending` / `pending_branches` / `pending_github_commits.quick/*` 和各 `pending/*/README.md`）。其他 AI 上传后请在自己的交接文档登记 commit，并把 `pending_branches` 对应项标 `merged` / 填 commit。

> 📌 **当前状态（2026-11-23 10:30，QC-18 清理）**：
> - **BAB-Q01 的 Q01-01～03 缺口**：以 Gemini `pending/bab01-gemini/` 为准；Quick 的差异建议见 `handover/quick/QC19_GM02_REVIEW.md`（QC-19），`pending/bab01-quick-q02/` 只是参考脚本，不要上传。
> - **只在 KV、等其他 AI 提交的**：`pending/q30/`（**Q-30 战兔巨爆原版重做**，步骤见该目录 README）；`pending/bab01-quick/`（BAB-Q01，14 个新文件，步骤见该目录 README；GPT-13 验收意见见 `handover/gpt/BAB_Q01_ACCEPTANCE_GPT13.md`）；审查报告 `docs/audit/weapons_vfx_14.14.md`（顶部有 QC-15 更正）、`docs/audit/enemies_map_14.14.md`、`docs/audit/ui_camera_audio_14.14.md`；任务单 `docs/tasks/render_perf.md`；本文件和 `handover/README.md` / `COLLAB.md` 里 Quick AI 写的行（清单见 KV `SYNC_STATE.json` 的 `kv_only_pending`）。如果 GitHub 上已有同名文件，以 GitHub 为准再合并。
> - **已完成、不要再套用的**：`pending/q22/`、`q23/`、`q25/`、`q27/`、`q28/` 已由 GPT-07 审查、GPT-08 PR #8 合入（`797ef1d`，剔除了 QC-15 指出的战兔巨爆错误改色），并随 `5955ad9a` 上线；原件按 COLLAB 2.4 保留作历史，真机验收通过前不清理。
> - 同步 KV 时按 `COLLAB.md` 2.2 第 10 条、2.3、2.4：`kv_only_pending` 里的文件先合并，不整份覆盖；`pending/` 不删除。

> **本文档由 Quick AI（AWS Quick）编写和维护。**
> 最后更新：2026-11-23 18:15 CST（**QC-19**：BAB-Q01 缺口修复与 Gemini GM-02/03 撞车，改为比对意见，以 Gemini 版为准；Q-30 仍在 KV 待上传）· 改动编号已排到 **Q-30 / QC-19 / BAB-Q01**
> 原路径 `QUICK_AI_HANDOVER.md` 只保留跳转说明，不再更新。交接总入口：[`handover/README.md`](../README.md)
> 仓库：`https://github.com/cianasa222/swarm-remake` · Cloudflare KV 镜像：`tideline-handover`（`7bbc331619b04fc8b5b5323abba5eef0`）
> 配套阅读：[`COLLAB.md`](../../COLLAB.md)（分工、流程、防冲突）→ [`AGENTS.md`](../../AGENTS.md) → [`AI_HANDOVER.md`](../../AI_HANDOVER.md) → [`PROGRESS.md`](../../PROGRESS.md)

---

## 0. 角色变更（2026-11-22 起生效）

> 历史记录。**当前工作方式见文件顶部 🔁**：角色由用户随时指定；Quick AI 只写 KV，GitHub 提交由其他 AI 负责。

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


**2026-11-23 04:44 再次调整（用户原话：「你的角色我任意决定」）**：Quick AI 的角色**由用户随时指定**，上面的「只审查」不再是硬限制；用户让做什么就做什么（包括发布任务、写代码、改文档），仍遵守 `COLLAB.md` 2.1 / 2.2 的防冲突和登记规则。同日用户指示：**GitHub 暂时不用管，改动先写 Cloudflare KV 并做好交接**。

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
| Q-15 | 11-23 01:20 | 代码：分支 `quick/q15-a-class-14.14` `3655218`，[PR #3](https://github.com/cianasa222/swarm-remake/pull/3) | `src/config.ts`（+21 / −10）、`src/sim/game.ts`（+10 / −8）、`src/sim/weapons.ts`（+5 / −5） | **修复** Q-14 的 A 类 14 项：耀光生命加成 3.5%；UwU/十字弩射程 9 m、回旋刃 8 m、巨爆选目标 8 m、巨爆进化爆炸 1.8 m；旋风切割器半径 2.0/3.5、命中半径 0.5/0.65、击退 1.5 m、受击间隔 1.0 s；首领 900 s；原版完整 99 级经验表（第 91 项笔误按中值修正）；补给箱生命 100；超距传送 22–23 m。**未编译**；PR #2 已合并，PR #3 目标已改为 `main`，待验收 | ✅ Antigravity AG-09 验收 PASS（`build` 1.28s + `playtest` 4/4 全胜 `bossTime=900`，已合并 `c056396`） | ⏳ 未部署 | 已同步 |
| Q-16 | 11-23 01:30 | 提交说明 `[Quick AI Q-16] …`（`git log --grep "Q-16"`） | `COLLAB.md`、`handover/quick/HANDOVER.md` | **用户决定**：任务看板改为「谁提交谁维护」，新增 `COLLAB.md` 2.2 节第 8 条，第 3 节第 5 步同步改写；订正看板 4 行过时状态（喷泉第一批、小怪模型已上线；喷泉第二批已完成待部署；部署行补 AG-03）；新增「全面审计进行中」一行。（Q-14 报告里预留的 Q-16/Q-17 修复编号顺延） | 文档 | — | 已同步 |
| Q-17 | 11-23 01:45 | 提交说明 `[Quick AI Q-17] …`（`git log --grep "Q-17"`） | `docs/audit/boss_reksai_14.14.md`（新增）、`handover/quick/HANDOVER.md`、`COLLAB.md`（看板） | **审查**：首领雷克塞 vs 14.14（审查对象 `a84d57a`，首领代码与当前 `main` 相同）。依据：首领角色 bin（唯一技能 `Plasma_Missile`）、skin0 的 38 套特效、map33 的 15 个首领音效事件。结论：招式基本是自编的（弹幕环、50% 二阶段原版都没有），钻地击飞 / 等离子飞弹 / 隧道 / 狂暴缺失；登场没有击飞和岩墙；`reksai.glb` 只有一个材质 `Body`，隐藏 Wrap / Plane 的代码不生效（待截图确认）；死亡动画播不出；38 套特效一套都没用。修复计划 Q-18 至 Q-21 | 审查报告 | — | 已同步 |
| Q-18 | 11-23 01:55 | 提交说明 `[Quick AI Q-18] …`（`git log --grep "Q-18"`） | `docs/tasks/missing_assets_14.14.md`（新增）、`docs/audit/boss_reksai_14.14.md`（新增第 0 节）、`COLLAB.md`（2.2 节第 9 条 + 看板）、`handover/quick/HANDOVER.md`；[Issue #4](https://github.com/cianasa222/swarm-remake/issues/4) | **用户决定**：做不了的事必须交给能做的 AI（新增 2.2 节第 9 条）；原版有的参数一律照抄，只有原版确实没有的才推断。把金克丝缺的 35 个贴图 / 网格、雷克塞缺的 34 段动作、子网格核对和 308 个特效资源整理成清单（带下载地址），开 Issue #4 交给 Antigravity，并要求下载和补做一起完成。首领报告补充：雷克塞角色记录没有技能列表，招式由服务器脚本驱动，除等离子飞弹外的数值原版文件里没有。**补充**：清单新增 C 节音效（线上全部是合成音，原版音频 0 个，要从本机 wad 解 `.bnk`/`.wpk` 转 `.ogg`）、D 节首领出场动画（候选动作 + 原版出场特效链）；B2 子网格顺序按原版 `.obj` 大小推断为 0 Body / 1 Fin / 2 Scale / 3 Wrap / 4 Plane（待截图确认）。**补充 2**：清单新增 E 节「不在 CommunityDragon 上的文件怎么拿」——用户提供的 3 个来源（riot-manifests、ManifestDownloader、CommunityDragon）已核对；指出 `lol-standalone-client-content` 是客户端界面清单、游戏文件要用 `lol-game-client`（14.14.6034237 欧服 = 北美服 = `17A8CACF07883D41.manifest`）；写好下载 / 过滤 / 解包 / 转换命令。（原计划的首领修复编号顺延为 Q-19 至 Q-22） | 文档 | — | 已同步 |
| Q-19 | 11-23 02:00 | 提交说明 `[Quick AI Q-19] …` | `COLLAB.md`（看板） | 按 2.2 节第 8 条订正看板：AG-05 已部署 `701860ff`，但看板未改。部署行改为已上线；PR #2、喷泉第二批改为已上线；Issue #4 改为进行中（A 节金克丝缺层 AG-05 已补齐；B / C / D 未开始）。核对 KV：AG-05 的文件与 GitHub 一致。（首领修复编号顺延为 Q-20 至 Q-23） | 文档 | — | 已同步 |
| Q-20 | 11-23 02:10 | 提交说明 `[Quick AI Q-20] …` | `COLLAB.md`（2.2 节第 9 条改写 + 看板）、`docs/tasks/missing_assets_14.14.md`（新增 F 节）、`handover/quick/HANDOVER.md`；Issue #4 | **用户决定**：做不了的事**不指定**给某个 AI，任何能做的 AI 读到就直接做，在 Issue 评论领取、做完登记留痕即可。Issue #4、看板、清单里的「Antigravity」全部改为「任意能做的 AI」。核对直链：动作 `.anm` 和音效在 CommunityDragon 上都没有（任何角色都不导出），Wiki 只有 2 个背景音乐；只能按清单 E 节下载 wad 解包。（首领修复编号顺延为 Q-21 至 Q-24） | 文档 | — | 已同步 |
| Q-21 | 11-23 03:45 | 提交说明 `[Quick AI Q-21] …` | `docs/tasks/missing_assets_14.14.md`（顶部状态说明）、`handover/README.md`（只改自己那行 + 第 5 节）、`COLLAB.md`（自己那行看板）、`handover/quick/HANDOVER.md` | 读交接文档后订正自己过时的说法：音效、雷克塞 42 段动作、子网格顺序、55 个特效网格、16 个补充小怪模型已由 Antigravity 从本机客户端解出（AG-06 资产分支 `4b1b5f7`），93 条原版音效 + BGM 已接入 `main`（AG-08）。清单里「原版音频 0 个 / 只能靠别人下 wad」的结论作废；子网格顺序与 Q-18 推断一致。KV 补同步 AG-08 的文本文件。（首领修复编号顺延：Q-22 至 Q-28 已用于渲染、武器特效、敌人与地图，首领修复从 Q-30 起） | 文档 | — | 已同步 |
| Q-22 | 11-23 05:18 | ⚠️ **未进 GitHub**：代码在 KV `pending/q22/`（补丁 `pending/q22/q22.patch`，`94dc89f` 与 `bd8a87b` 都能直接套），待能写 GitHub 的 AI 建分支 `quick/q22-render-quality` 开 PR | `src/render/enemy_models.ts`（+415 / −19）、`src/render/entities.ts`（+53 / −14）、`src/render/hero_jinx.ts`（+1 / −1）、`src/render/boss_reksai.ts`（+1 / −1） | **用户要求按画质方案一、二类改代码**。① 小怪顶点动画（VAT）：加载时把原版动作烘进 HalfFloat 贴图，单 DrawCall 播跑 / 攻击；模型没有动作时自动退回静止姿态（**现在 4 个小怪模型都没有动作，见 QC-08，合并后画面暂时不变，需重新导出**）。③ 小怪不再投实时阴影（已有圆形软影；VAT 没有深度材质，投影会是静止姿态）。④ 角色 / 小怪 / 首领贴图 `anisotropy: 4`（地图本来就是最大值）。**没改的及原因**：② 色调——map33.bin 里没有任何色调 / 曝光 / 后处理参数，现有 `NeutralToneMapping` 是 M1 对照原版截图校准并通过美术审查的，保持不变；⑤ 光照探针——原版角色光照是太阳 + 天光（`MapSunProperties`），项目已按原版参数对齐，加探针会偏离原版，不做；⑥ 泛光——项目本来就没有后处理泛光，特效都是原版贴图叠加，已符合；⑦ 3D 降分辨率 + 锐化——界面本来就是原生分辨率的网页元素；锐化需要多一层 HDR 中间缓冲，在 iPhone 上可能抵消省下的像素，改到第三类和动态分辨率一起实测再定；⑧ KTX2——要先转换二进制贴图（Quick AI 环境做不了），且现有 `getTexture()` 同步返回普通 `Texture`，接 KTX2 要改加载结构，交给 PERF-1 T1。**未编译、未实测** | ✅ PR #8 合并 `797ef1d`（GPT-07 审查后的安全子集，build + playtest 4/4 + 回归测试 PASS）；随 `5955ad9a` 上线（MU-01 11-23 06:40）；真机视听待验；4 个普通小怪模型仍无动作（PERF-1 T2b），VAT 暂时退回静止姿态 | ✅ `5955ad9a` | 原件保留（历史），主线已同步 |
| Q-23 | 11-23 05:22 | ⚠️ **未进 GitHub**：代码在 KV `pending/q23/`（**05:31 已按 `bd8a87b` 重做**，合并了 GPT-05 细节画质；补丁 `pending/q23/q23.patch`），与 Q-22 放同一分支 `quick/q22-render-quality`、同一个 PR | `src/render/quality.ts`（+115 / −10）、`src/render/renderer.ts`（+1 / −1）、`src/main.ts`（+35 / −0） | **用户要求继续做第三类（省性能）**。① 帧率上限：手机默认 60、桌面不限，`?fps=` 可改；② 档内动态分辨率 0.75–1.0，先降分辨率再降档，阈值以帧率上限为基准，降档后 60 秒不升回；③ `?perf=1` 性能面板（帧率 / 档位 / 渲染比例 / DrawCall / 三角形），供 iPhone 实测。**没做**：阴影视锥缩小（会切掉屏幕边缘阴影、改变已验收画面）；抗锯齿换 FXAA（先用性能面板实测 MSAA 代价）；特效粒子合批（改动面大，无编译环境，交 PERF-1 T7）。**未编译、未实测** | ✅ PR #8 合并 `797ef1d`（GPT-07 审查后的安全子集，build + playtest 4/4 + 回归测试 PASS）；随 `5955ad9a` 上线（MU-01 11-23 06:40）；真机视听待验 | ✅ `5955ad9a` | 原件保留（历史），主线已同步 |
| Q-24 | 11-23 05:31 | ⚠️ **未进 GitHub**：KV `docs/audit/weapons_vfx_14.14.md`，待提交到 `main` | `docs/audit/weapons_vfx_14.14.md`（新增） | **审查**：第一关 9 把武器特效 vs 14.14（`map33.bin.json` 111 个武器粒子系统）。结论：战兔巨爆颜色全错（原版粉红 / 品红，项目青 + 黄）、寿命偏短；冰爆护甲颜色 / 寿命不对；地雷用的是手搭几何体而不是原版 `Ziggs_Satchel` 模型，爆炸 13 层只做了通用环；耀光力场缺暗橙底和橙色噪声层；斯塔缇克缺命中特效；UwU / 回旋刃 / 旋风切割器缺拖尾和光晕；旋风切割器视觉约原版 2 倍（换算规则待定）；**十字弩原版按撞墙次数换 4 种颜色并有撞墙特效，模拟层没有反弹**（需核对 SpellData） | 审查报告 | — | 仅 KV |
| Q-25 | 11-23 05:31 | ⚠️ **未进 GitHub**：代码在 KV `pending/q25/`，与 Q-22 / Q-23 同一分支、同一个 PR | `src/render/weapon_vfx.ts`（+19 / −10） | **修复** Q-24 里只需改常量的项：战兔巨爆准星 / 光柱 / 爆炸 / 裂纹的颜色和寿命，冰爆护甲冰环 / 裂纹的颜色、透明度、寿命，进化冰盾颜色，全部照抄原版发射器参数。需要新资源或改模拟层的留给任意能做的 AI（报告第 2 节，看板 WVFX 行）。**未编译** | ✅ PR #8 合并 `797ef1d`（GPT-07 审查后的安全子集，build + playtest 4/4 + 回归测试 PASS）；随 `5955ad9a` 上线（MU-01 11-23 06:40）；真机视听待验；**战兔巨爆改色已剔除**（QC-15），冰爆护甲改动保留 | ✅ `5955ad9a` | 原件保留（历史），主线已同步 |
| Q-26 | 11-23 05:45 | ⚠️ **未进 GitHub**：KV `docs/audit/enemies_map_14.14.md`，待提交到 `main` | `docs/audit/enemies_map_14.14.md`（新增） | **审查**：敌人模型 + 地图 vs 14.14（敌人数值和刷怪已在 Q-14 审过，不重复）。结论：4 种小怪没有动作；死亡特效颜色不对（原版红橙）；敌人材质原版 `selfIllumination 2.5` + unlit，项目用 PBR 受光照，推断偏暗（待截图）；精英缩放按项目自己的规则应为 0.017、代码 0.0068（待截图）；地图太阳 / 天光颜色和方向与原版一致，但原版地图表面不吃实时光和实时阴影（推断），项目加了 35% 直射光、实时阴影和冷蓝暗部（M1 已校准，不改）；地图材质 104 / 107（缺的 3 个是 TFT / 灰盒原型）；原版第一关的海浪、海沫、海岸线、焦散、水池、池塘、海鸥、鱼、通风口烟雾**全部没做**。任务列在看板 EMAP-1 至 EMAP-5 | 审查报告 | — | 仅 KV |
| Q-27 | 11-23 05:45 | ⚠️ **未进 GitHub**：代码在 KV `pending/q27/`，与 Q-22 / Q-23 / Q-25 同一分支、同一个 PR | `src/render/vfx.ts`（+3 / −1） | **修复**：小怪死亡粒子颜色暗青 → 红橙 `0xff4639`、寿命 0.35 → 0.5 s，照抄原版 `Strawberry_Enemy_Death`。**未编译** | ✅ PR #8 合并 `797ef1d`（GPT-07 审查后的安全子集，build + playtest 4/4 + 回归测试 PASS）；随 `5955ad9a` 上线（MU-01 11-23 06:40）；真机视听待验 | ✅ `5955ad9a` | 原件保留（历史），主线已同步 |
| Q-28 | 11-23 05:55 | ⚠️ **未进 GitHub**：代码在 KV `pending/q28/`，与 Q-22 / Q-23 / Q-25 / Q-27 同一分支、同一个 PR，**最后提交**（叠在 Q-22 / Q-25 / Q-27 上） | `src/render/enemy_models.ts`（+80 / −4）、`src/render/weapon_vfx.ts`（+55 / −16）、`src/render/vfx.ts`（+7 / −3）、`src/sim/game.ts`（+4 / −3） | **用户要求把审查找出的问题修掉**。这批是不需要新资源、不改玩法的项：① 精英死亡动作（绑定原版 death，按 id 固定槽位，渲染侧原地播放）；② 耀光力场按原版 4 层（补橙色火焰普通混合层、外圈普通混合层），普通 / 进化颜色照抄；③ 战兔巨爆进化版橙金光柱 / 橙色爆炸环，`explode` 事件加可选 `evolved`；④ 附带的通用环 / 粒子改原版色；⑤ 斯塔缇克闪电显示时长 0.4 s / 进化 0.2 s。**仍需新资源或改玩法、没修的**：地雷原版模型和 13 层爆炸、十字弩撞墙反弹、斯塔缇克命中特效、冰爆护甲环绕冰晶 / 冰刺、拖尾光晕类、统一尺寸换算、小怪带动作模型、地图环境特效、敌人材质 / 精英缩放（待截图）——都在看板 PERF-1 / WVFX / EMAP 行。**未编译** | ✅ PR #8 合并 `797ef1d`（GPT-07 审查后的安全子集，build + playtest 4/4 + 回归测试 PASS）；随 `5955ad9a` 上线（MU-01 11-23 06:40）；真机视听待验；**战兔巨爆进化配色已剔除**（QC-15），精英死亡 / 耀光 4 层 / 斯塔缇克闪电保留 | ✅ `5955ad9a` | 原件保留（历史），主线已同步 |
| Q-29 | 11-23 06:00 | ⚠️ **未进 GitHub**：KV `docs/audit/ui_camera_audio_14.14.md`，待提交到 `main` | `docs/audit/ui_camera_audio_14.14.md`（新增） | **审查**：界面 + 镜头 + 音效 vs 14.14（`map33.bin.json` 音效库 `BankUnit`、30 条公告定义）。结论：9 把副武器原版各有专属音效（31 个事件），项目全无（命中、爆炸借用金克丝的声音）；敌人死亡原版按怪种分 22 个，项目共用 3 个；补给箱破碎借用拾取声；背景音乐缺中期 / 后期两段；横幅文字自编、含原版没有的「狂暴二阶段」；原版有 21 种关内目标（打箱子、精英包围等），项目没有这个系统；镜头参数不在 bin、界面布局不在 KV，无法按数据核对。**未改代码**：音效文件名是 Wwise 哈希，对照表在 `.bnk`，KV 里没有，Quick AI 环境也读不了资产分支。任务列在看板 UIA-1 至 UIA-6 | 审查报告 | — | 仅 KV |
| Q-30 | 11-23 11:20 | ⚠️ **未进 GitHub**：KV `pending/q30/`（说明见该目录 README），待上传到分支 `quick/q30-starstrike` 开独立 PR | `src/render/starstrike_14_14.ts`、`starstrike_vfx.ts`（新增）；`weapon_vfx.ts`、`vfx.ts`、`assets.ts`（修改）；`tools/q30/fetch_starstrike_14_14.mjs`、`tools/q30-starstrike.test.ts`（新增） | **战兔巨爆按 14.14 原版 StarStrike 4 个系统 21 层重做**（QC-15 遗留）：普通落点 / 进化落点 / 进化红橙大落点各 4 层（底图、描边、X 准星、竖直激光），爆炸 9 层（碎片、金色中心光柱、主光柱、地面光圈、地裂、地面耀光、旋涡网格、内光网格、下落竖条）。数据由 BAB-Q01 提取结果脚本转写，未手改；固定 13 次绘制、粒子不存状态。去掉旧 1 层准星 + 4 片交叉光柱 + 原版没有的青色冲击环和黄色粒子。**只改画面，`src/sim/` 零改动**。14 张原版贴图由脚本从 CommunityDragon 下载；`Light_Inside.scb` 网格缺失时用圆柱占位。尺寸系数 0.02 未经截图校准（GPT-13 Q01-07） | ⏳ 未编译 / 未实机；数据与时间轴已脚本复核 | — | 仅 KV（`pending/q30/`） |
| QC-19 | 11-23 18:15 | ⚠️ 仅 KV | `handover/quick/QC19_GM02_REVIEW.md`（新增）；`pending/bab01-quick-q02/`（参考脚本 + README，**不要上传**） | 用户 11:05 指派修 GPT-13 的 Q01-01～02，本地做到一半（贴图核对时工具中断）；18:09 读交接发现 **Gemini GM-02/03 已在 11:02–11:12 完成并交付** `pending/bab01-gemini/`，于是不再交重复的数据包，改为比对意见：两边结论基本一致；建议 Gemini 版再合入 ① 技能引用按 ResourceResolver 解析哈希键（补回旋刃进化返程、粉色 UwU 弹的技能来源）② 金币标 `inGame:false`（项目没有金币）③ 精英 / 首领头顶血条与首领狂暴 ④ 敌人出生特效；MapA 环境 19 个、`AnimaSquad_Card` 用途两项判断不同，**用户 18:16 决定交给验收方对照原版录像定** | 比对（Quick 本地重跑两次一致，原 122 系统不变） | — | 仅 KV |
| BAB-Q01 | 11-23 09:40 | ⚠️ **未进 GitHub**：KV `pending/bab01-quick/`（14 个新文件 + MANIFEST），待能写 GitHub 的 AI 建分支 `quick/bab01-b0-b4-data` 开 PR（步骤见该目录 README） | **全部新文件，不改现有文件**：`src/render-babylon/render_port.ts`、`src/render-babylon/vfx/effect_def.ts`、`tools/bab/extract_vfx_14_14.cjs`、`src/render-babylon/vfx/data/14.14/{fountain,weapons,jinx,enemy,reksai,index}.json`、`docs/bab01/quick_B0_render_inventory.md`、`docs/bab01/quick_B4_vfx_14.14.md`、`docs/bab01/quick_B4_vfx_tables_14.14.md`、`docs/bab01/quick_hud_assets_14.14.md` | **用户 08:54 指派领取 BAB-01 B0 + B4 数据准备**。① B0：15 个渲染模块清单、Three → Babylon 对应、main.ts 全部调用 → `RenderPort` 接口、KV 镜像哈希基线（回归 / 性能 NOT RUN）。② B4：引擎无关 `EffectDef` 数据结构；转换脚本把 14.14 原版 122 个特效系统 742 层（喷泉 4/52、九武器 38/144〔按 QC-15 正确对应〕、金克丝 28/94、敌人弹幕 11/101、雷克塞 41/351）全部转成数据并记录原版路径 + SHA-256；逐层参数表与代码对照；原版贴图 496 张全部可从 CommunityDragon 直接下载，123 个 `.scb/.sco` 网格需从资产分支或解包取。③ HUD：从原版 UI bin 整理血条 / 经验条 / 等级 / 头像框 / 升级按钮与动效 / 首领血条 / 升级卡的坐标、贴图、UV、帧动画，48 张贴图全部可下载；升级卡 9 个界面特效定义、敌人头顶血条样式映射未找到，列入缺失清单。**未改 UI / 登录 / 设置 / 升级弹窗 / 账号（GPT 负责）、未改数值、未删资产、未部署** | TS 未编译（待验证）；转换脚本已实际运行 | — | 仅 KV（`pending/bab01-quick/`） |

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
| QC-07 | 11-23 04:55 | KV `tideline-handover` | **只写 KV，未进 GitHub**（GitHub 连接器 OAuth 失效，用户指示先只写 KV）。新增 `docs/tasks/render_perf.md`（外包任务 PERF-1：渲染性能与画质，T1–T6）；`COLLAB.md` 看板加 PERF-1 行、订正部署行（Cloudflare 查到 04:07 新部署 `7d862759`）；`handover/README.md` 自己一行 + 第 5 节；本文件；`FILE_INDEX.json` 加 1 条；`SYNC_STATE.json` 新增 `kv_only_pending` 字段、订正 `open_prs` / `live_deployment`。**`commit` 字段仍是 `94dc89f`**，KV 这几个文件比 GitHub 新。核查结论：普通小怪（pix/ghoul/hunter/dasher）是静止姿态烘焙 + 正弦起伏，没有骨骼动作；精英、首领有。 | ⚠️ **待提交 GitHub**：下一个能写 GitHub 的 AI，请把 `kv_only_pending` 列出的 4 个文件从 KV 原样提交到 `main`（注意 `COLLAB.md` / `README.md` 若 GitHub 上已有更新要手动合并，不要整份覆盖），提交后删掉 `kv_only_pending` 并把 `commit` 改成新提交号。**从 GitHub 往 KV 同步的 AI：先合并这些 KV 改动，别直接覆盖** |
| QC-08 | 11-23 05:12–05:18 | Worker `tideline-ref-fetcher` + KV | ① 临时把 `tideline-ref-fetcher` 改为一次性探测：从 Cloudflare 内部读线上 `/assets/enemies/*.glb` 的 glTF 头，写入 `_probe/enemy_glb.json`；读取后**已删除该 key、已清空定时任务**（Worker 代码保留为探测版，与 QC-06 后一样处于停用状态）。结论：`enemy_pix / ghoul / hunter / dasher` 有骨骼（26 / 33 / 41 / 23 根）但 **0 段动作**；`miniboss_bruiser` 有 4 段。② 写入 `pending/q22/` 下 4 个源码文件、`q22.patch`、`README.md`；更新本文件、`handover/README.md`、`COLLAB.md`（看板）、`docs/tasks/render_perf.md`、`FILE_INDEX.json`、`SYNC_STATE.json`（`kv_only_pending` 追加）。写前核对 KV 未被他人改动，写后逐个回读核对 SHA-256 | ✅ 已完成；⚠️ 文档改动待提交 GitHub（同 QC-07） |
| QC-09 | 11-23 05:22 | KV `tideline-handover` | 写入 `pending/q23/` 下 3 个源码文件和 `q23.patch`；`pending/q22/README.md` 新增第 4 节（Q-23）；更新本文件、`handover/README.md`、`COLLAB.md`（看板）、`docs/tasks/render_perf.md`、`FILE_INDEX.json`、`SYNC_STATE.json`。写前核对 KV 未被他人改动，写后逐个回读核对 SHA-256 | ✅ 已完成；⚠️ 待提交 GitHub（同 QC-07） |
| QC-10 | 11-23 05:31 | KV `tideline-handover` | 写入 `docs/audit/weapons_vfx_14.14.md`、`pending/q25/`。**写前核对发现冲突**：GPT-06 在 05:23 把 GitHub `main@bd8a87b`（PR #7：登录首页、细节画质）同步进 KV，`handover/README.md`、`COLLAB.md` 被 GitHub 版覆盖，Quick AI 在 KV 里加的「连不上 GitHub」说明和看板行丢失；PR #7 还改了 Q-23 改的 3 个文件。处理：没有覆盖对方的内容，以 KV 当前（= GitHub）版本为底，**只把 Quick AI 自己的行和说明重新加上**；Q-23 按 `bd8a87b` 重做（合并细节画质）；`SYNC_STATE.json` 保留 GPT-06 的 `commit` / `changed_files`，只更新 `kv_only_pending`、`pending_branches` 和 Quick AI 文件的哈希。另：之前登记的 Q-22 / Q-23 / QC-08 / QC-09 时间写成了 05:40 / 06:05，实际是 05:18 / 05:22，已订正 | ✅ 已完成；⚠️ 待提交 GitHub |
| QC-11 | 11-23 05:38 | KV `tideline-handover` | **用户要求**：注明其他 AI 不能覆盖 Quick AI 只在 KV 的改动。`COLLAB.md` 顶部加提示、2.2 节新增第 10 条「同步 KV 前先查 KV 独有的改动，不准覆盖」；`handover/README.md`、`AGENTS.md`、本文件顶部加同样的提示；`SYNC_STATE.json` 的 `rule` 补充同步前必读 `kv_only_pending`，新增 `READ_FIRST` 字段。写前核对 KV 与 QC-10 写入一致，写后回读 SHA-256 | ✅ 已完成；⚠️ 待提交 GitHub（`AGENTS.md` 也加入 `kv_only_pending`） |
| QC-12 | 11-23 05:45 | KV `tideline-handover` | 写入 `docs/audit/enemies_map_14.14.md`、`pending/q27/`；更新 `pending/q22/README.md` 第 6 节、本文件、`handover/README.md`、`COLLAB.md`（看板）、`FILE_INDEX.json`、`SYNC_STATE.json`。写前核对（KV 与 QC-11 写入一致），写后回读 SHA-256 | ✅ 已完成；⚠️ 待提交 GitHub |
| QC-13 | 11-23 05:55 | KV `tideline-handover` | 05:50 再试 GitHub 连接器仍是 OAuth 401，按用户指示只写 KV。写入 `pending/q28/`（4 个完整文件 + 补丁）；更新 `pending/q22/README.md` 第 7 节、两份审查报告的修复状态、本文件、`handover/README.md`、`COLLAB.md`（看板）、`FILE_INDEX.json`、`SYNC_STATE.json`。写前核对、写后回读 SHA-256 | ✅ 已完成；⚠️ 待提交 GitHub |
| QC-14 | 11-23 06:00 | KV `tideline-handover` | 写入 `docs/audit/ui_camera_audio_14.14.md`；更新本文件、`handover/README.md`、`COLLAB.md`（看板，全面审计行改为完成）、`FILE_INDEX.json`、`SYNC_STATE.json`。写前核对、写后回读 SHA-256 | ✅ 已完成；⚠️ 待提交 GitHub |
| QC-15 | 11-23 06:05 | KV `tideline-handover` | **用户 06:01 要求停下**，把遇到的问题和已写好的代码同步到 KV。新增本文件第 1.7 节（遇到的问题 + 武器对应错误更正）；在 `docs/audit/weapons_vfx_14.14.md`、`docs/audit/ui_camera_audio_14.14.md`、`pending/q22/README.md` 顶部加更正说明；看板加「Q-30 战兔巨爆按 StarStrike 重做」行。**没有新代码**（06:00 之后只在查十字弩数据，未写代码）。写前核对、写后回读 SHA-256 | ✅ 已完成；⚠️ 待提交 GitHub |
| QC-16 | 11-23 09:40 | KV `tideline-handover` | BAB-Q01 写入 `pending/bab01-quick/`（14 个文件，每个写前确认 key 不存在、写后回读 SHA-256 一致）+ `MANIFEST.json`；更新本文件、`handover/README.md`（自己一行）、`COLLAB.md`（看板加 BAB-01 B0+B4 行）、`FILE_INDEX.json`、`SYNC_STATE.json`（`kv_only_pending` 追加、`pending_branches` 追加、`pending_github_commits.quick/bab01` 标记未提交）。读取原版数据：KV `ref/14.14/` 的 map33 / 金克丝 / 雷克塞 bin.json；CommunityDragon 14.14 UI bin 与目录（只读） | ✅ 已完成；⚠️ 待提交 GitHub |
| QC-17 | 11-23 09:25 | KV `tideline-handover` | **用户决定**：Quick AI 不再连接 GitHub，只更新 Cloudflare KV 的代码与交接文档，由其他 AI 提交到 GitHub。更新本文件顶部、`handover/README.md`（提示 + 自己一行）、`COLLAB.md`（2.2 节第 10 条补一句）、`SYNC_STATE.json`（`quick_workflow` 字段）。写前核对、写后回读 | ✅ 已完成 |
| QC-18 | 11-23 10:30 | KV `tideline-handover` | **用户要求清理 Quick AI 写的过时内容**（只改 Quick AI 自己写的部分）：本文件——两条旧横幅合并为一条当前状态，Q-22 / 23 / 25 / 27 / 28 状态改为 PR #8 合并并上线，1.1 / 1.4 / 1.7 / 第 0 节 / 第 2 节加历史标注或改为最新；`handover/README.md`——第 1 节旧「连不上 GitHub」说明、第 5 节状态速览、自己那一行；`COLLAB.md` 看板——部署行、Q-22–Q-28 行、PERF-1 / T6、Q-30、UIA、首领修复编号、PR #3、其余小项的文件指向；`pending/q22/README.md` 顶部加「已完成勿重复套用」；`docs/tasks/render_perf.md` T2/T4/T5 改为已上线；`pending/bab01-quick/README.md` 与 `MANIFEST.json` 的 GitHub 状态改为按用户决定只写 KV；`SYNC_STATE.json` 只改 Quick AI 字段（`READ_FIRST` 里关于 Quick 的一句、`kv_only_pending.reason` / `by` / `at_cst` / 文件哈希、`pending_branches` 与 `pending_github_commits` 的 BAB-Q01 状态），其他 AI 的字段未动。写前核对、写后回读 SHA-256 | ✅ 已完成 |
| QI-01 | 11-22 09:35 | [Issue #1](https://github.com/cianasa222/swarm-remake/issues/1) | 新建外包任务 | 待领取 |
| QI-02 | 11-22 09:42 / 09:48 / 20:41 / 21:30 | Issue #1 评论 | 范围更新 / 流程说明 / 网格与贴图订正 / 改用 Windows 清单 | 以最新评论为准 |

### 1.7 2026-11-23 遇到的问题（QC-15 汇总，给接手的 AI）

| # | 问题 | 影响 | 现状 / 怎么处理 |
| :--- | :--- | :--- | :--- |
| 1 | **GitHub 连接器 OAuth 失效**（HTTP 401「Invalid response format received from the OAuth Server」），04:4x 起每次都失败，05:50、05:57 再试仍失败 | Quick AI 无法读写 GitHub、开 Issue / PR | **已结案**：09:23 用户决定 Quick AI 不再连接 GitHub，只写 KV，由其他 AI 提交（QC-17）。q22–q28 已由 PR #8 合入上线 |
| 2 | **没有编译环境**（沙盒里没有 TypeScript / esbuild / Node 构建） | Q-22 至 Q-28 当时未编译 | **已解决**：GPT-07 在 PR #8 跑过 `build`、`playtest` 4/4、`render-quality` 21 组、`q28-regression` 全部 PASS；**真机视听仍待验**。BAB-Q01 的两个 TS 文件同样未编译，由上传方检查 |
| 3 | **KV 被覆盖过一次**：05:23 GPT-06 从 GitHub 同步 `bd8a87b` 时整份覆盖了 `handover/README.md`、`COLLAB.md`，Quick AI 的说明和看板行丢失；PR #7 还改了 Q-23 动过的 3 个文件 | 交接说明丢失、Q-23 基准过期 | QC-10 已以 GitHub 版为底重新合并；Q-23 按 `bd8a87b` 重做；QC-11 新增 `COLLAB.md` 2.2 节第 10 条「同步前先查 `kv_only_pending`，不准覆盖」 |
| 4 | **4 个小怪 `.glb` 有骨骼但 0 段动作**（QC-08 实测） | Q-22 的顶点动画合并后画面暂时不变 | 看板 PERF-1 T2b：重新导出带原版动作的模型 |
| 5 | **读不到资产分支和 `.bnk`**：原版音效文件名是 Wwise 哈希，对照表在 `.bnk`，KV 里没有；沙盒访问 `raw.githubusercontent.com` 也失败 | 武器 / 敌人死亡音效没法自己接 | 看板 UIA-1 / UIA-2 |
| 6 | **线上 `.glb` 只能从 Cloudflare 内部读**（外部请求 403） | — | QC-08 用临时 Worker 探测，已清理 |
| 7 | ⛔ **Quick AI 自己的错误：3 把武器对错了原版数据** | Q-24 武器审查、Q-25、Q-28、Q-29 音效审查里这 3 把的结论和改动有误 | 见下 |

**第 7 项详细说明**（战兔巨爆的画面已在 Q-30 按 StarStrike 重做，待上传验收）：Q-14 审计（`live_vs_14.14.md` 第 0 节）早就写明了对应关系：UwU = RapidShot、旋风切割器 = **HolyBauble**、耀光 = HollowRadiance、斯塔缇克 = StatikkShiv、十字弩 = **PierceShot**、回旋刃 = Boomerang、巨爆 = **StarStrike**、地雷 = Mine_Wrapper、冰爆 = FrostNova。Q-24 写武器特效审查时没对照这张表，把十字弩当成 ScatterArrows、巨爆当成 Nuke、旋风切割器当成 CircleShot（名字相近的另几把武器）。06:00 查十字弩技能数据时发现：`PierceShot` 的伤害 / 数量 / 暴击（90–170、3–25 支、+10–30%）和项目 `crossbow` 完全一致，`StarStrike` 的数量 / 伤害 / 选目标 8 m / 爆炸 1.8 m 和项目 `bunnymega` 完全一致。

| 项 | 错误结论 | 正确情况 |
| :--- | :--- | :--- |
| 十字弩 | 原版按撞墙次数换 4 色、有撞墙反弹 | 原版 `Strawberry_PierceShot_Mis`：紫色网格箭头 (0.88, 0.71, 0.98)、蓝色光晕 (0.04, 0.54, 1)、青色拖尾 (0.06, 0.94, 0.93) 0.5 s；飞弹宽 0.6 m、速度 20 m/s、射程 17 m（项目 24 m/s、9 m，射程 9 m 是 castRange 选目标距离，Q-15 已对齐）。**没有撞墙反弹** |
| 战兔巨爆 | 原版粉红 / 品红，Q-25 / Q-28 改了颜色 | 原版 `StarStrike_Karthus_Explosion`：光柱中心金 (1, 0.88, 0.58) 0.3 s、光柱核心白 0.5 s、地面内圈青 (0.09, 0.92, 0.95)、地裂白、准星 `XTarget` 青 (0.14, 0.86, 0.77) 1.1 s。**项目原来的青 + 黄更接近原版**，Q-25 / Q-28 的巨爆颜色改动要撤回（见 `pending/q22/README.md` 顶部） |
| 旋风切割器 | 视觉约原版 2 倍 | 原版 `HolyBauble_Evolve_Blades_Glow` bS 85 → 1.7 m，`OrbVisualAoEMultiplier` 1.5 / 进化 2；项目 1.6 / 2.05 m 基本一致。进化版原版有橙色猫脸层（`HolyBauble_Evolve_CatFace` ×3），项目没有 |
| 音效 | 十字弩 / 旋风 / 巨爆事件名 | 正确事件见 `ui_camera_audio_14.14.md` 顶部更正 |

**下一步**（Q-30，看板已加行）：按 StarStrike 原版参数重做战兔巨爆特效，出一版去掉 Q-25 / Q-28 错误部分的 `weapon_vfx.ts` / `vfx.ts`；重写武器审查里这 3 把的章节。

### 1.1 代码改动详情（历史，2026-11-22；下面三项均已由 AG-01 验收、AG-02 上线，现随 `5955ad9a` 在线）

| 提交 | 文件 | 内容 | 状态 |
| :--- | :--- | :--- | :--- |
| `05a1ef1` | `public/_headers` | 静态资源统一加 `Access-Control-Allow-Origin: *`，替代 `worker.js` 里加 CORS（`run_worker_first` 应为 `false`，否则 `_headers` 不生效） | ✅ 已上线 |
| `c63e871` | `src/render/map_warehouse.ts` | 喷泉精修第一批 9 项（详见 `PROGRESS.md` 2.5 节）：Nova ×1.75、各层原版寿命、补 Nova 两层冲击波和 Gold/Gold1 粒子、补 Timer `Decal_Start2`、healspark 和 sparklies1 改为原版发射式、Basic4/Edge12/Edge17/波浪峰值修正、去掉计时圈暖黄。新增通用粒子设施 `makeFxPool` | ✅ AG-01 验收（修正 3 处）、AG-02 上线 |
| `46362d7` | `src/render/enemy_models.ts` | **修复小怪只剩影子**：M4 量化后小怪 GLB 的 `POSITION` 是 Int16 归一化，反量化缩放写在骨骼 `inverseBindMatrices` 里；`InstancedEnemyModel` 原来丢掉蒙皮属性，模型只剩 1–2 cm。新增 `bakeStaticGeometry()`，按静止姿态 `applyBoneTransform` 烘焙后再合批 | ✅ AG-01 验收、AG-02 上线 |

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
| Worker `tideline-swarm` | **当前 `5955ad9a`**（deployment `f94499ee`，Muse MU-01 11-23 06:40，含 PR #8）；上一版 `7d862759` 保留可回退。历史：AG-02 `54a77c68`（11-22 23:52） | 交接文档路径仍返回 410（MU-01 验收）；`/__sync_kv` 已停用（QC-05） |

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

> ⚠️ 本表是 2026-11-22 的旧清单，**最新任务以 `COLLAB.md` 第 5 节看板为准**。已完成：两项 P0（AG-01 验收、之后多次部署，当前 `5955ad9a`）、喷泉第二批（AG-03）；自动部署已有 `wrangler.jsonc`（GPT-06 / MU-01 使用）。

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
