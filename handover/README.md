# 交接总入口（任何 AI 开工前先读这一页）

> ⛔ **同步 KV 前必读（用户指示，GPT-12 更新）**：Quick / 其他 AI 无 GitHub 权限时，查 KV `SYNC_STATE.json` 的 `kv_only_pending`、`pending_branches` 与 `pending_github_commits`，按任务核对实际 GitHub 提交/PR 后代上传未提交内容；共享文档须合并双方新增内容，不覆盖独有资料。**仅在合并、实际部署、上线/实机验收通过、GitHub 可恢复且主线 KV 核验后，才允许精确清理重复临时代码。** 交接、清单、参考/备用资产永久保留；不删除其他任务或整个索引。详见 COLLAB 2.2 第 10 条及 2.4。

> 本页结构由 Quick AI（AWS Quick）于 2026-11-22 建立。**第 3 节每个 AI 只改自己那一行**，其他节按 [`COLLAB.md`](../COLLAB.md) 2.1 节防冲突规则修改。

---

- **开发节奏（GM-10 · 用户 2026-11-23 20:25 指示）**：**实机测试先不做，优先把代码跑通**（`tsc` / `build` / 单测 / CI 优先，不因真机验收阻塞代码集成与迁移推进；正式切流上线仍待代码跑通后统一验收）。详见 `COLLAB.md` 2.6 节。

- **KV 临时中转箱（GM-08 · 用户指示）**：无 GitHub 权限的 AI（Quick / Gemini）需要读取 GitHub 资产/清单时，可列清单让有权 AI 传至独立前缀 `inbox/<接收AI>/<任务>/` 并备注；接收方读取采用并登记交接后可逐 key 精确删除（独立于 2.4 代码清理门禁，不碰 `pending/`）。详见 `COLLAB.md` 2.5 节。

> **GPT-22 最新开发进度（2026-11-23 21:02 CST）**：用户决定先完成代码整合、构建和单测，iPhone 实机后置（COLLAB 2.6）。新 GM-11 B1/B2/B3 纯 TS 底座与 GM-10 UIA 音频仍仅在 KV 待代传；GM-09 B4 核心已在草稿 PR #17。最关键缺口是**真正启动 Babylon 场景并让 B4 特效实际可绘制**。GM-12 列出 44 缺失网格：P0 15/P1 8/P2 10/P3 11；详见 [GPT-22 迁移差距报告](./gpt/BABYLON_GAP_REVIEW_GPT22.md)。PR #14/#15 均为候选整合快照，不直接合并或部署。

> **GPT-24 · 人员变更（2026-11-24）**：Quick 已退出，不再分配新任务或等待其审核；Quick 既有数据、审查、PR 和 KV 资料保持可追溯。B4 新 VFX 运行器和 B5 性能优化改为 **Gemini（仅 KV：规格、独立逻辑、测试）+ GPT（GitHub、实际运行器、构建和 CI）**；Muse/Antigravity 仅确认可用后参与。见 [更新后的分工](./gpt/BAB_TASK_DIVISION_GPT23.md)。未自动唤起其他 AI、未部署。

## 1. 一句话看懂

- **项目**：1:1 复刻《英雄联盟：无尽狂潮（Swarm）》第一关「仓库区（Map33）」，Vite + TypeScript + Three.js，资产全部来自拳头 Patch 14.14 原版。
- **以谁为准**：GitHub [`cianasa222/swarm-remake`](https://github.com/cianasa222/swarm-remake) 的 `main` 分支是唯一权威版本。Cloudflare KV `tideline-handover` 是镜像，**可能落后**。线上网站只放游戏，**不放交接文档**。
- **KV 是不是最新**：读 KV 里的 `SYNC_STATE.json`，它的 `commit` 等于 GitHub `main` 最新提交就是一致；不等就以 GitHub 为准。KV 不会自动跟着 GitHub 变，要由改动的 AI 手动同步。
- **改了代码要做什么**：同一轮工作里，在自己的 `handover/<ai名>/HANDOVER.md` 登记改动，提交到 GitHub，再同步到 KV（规则见 [`COLLAB.md`](../COLLAB.md) 2.2 节）。
- **KV 批量操作（GPT-21 · 用户 2026-11-23 批准）**：本批已知文件尽量使用 REST API `/bulk/get` 与 `/bulk`、索引每批合并更新一次，跳过相同哈希的重复写入；**批量写 N 个 Key 仍按 N 次计费/计额度**；写后按 SHA-256 和索引读回核验，不得覆盖 Quick/Gemini 独有资料。详见 COLLAB 2.3 第 5 条。
- **每次提交即时双端交接（GPT-11 · 用户指示）**：不等合并；查 `SYNC_STATE.json.pending_github_commits` 获取未合并 PR 的最新快照、文件清单与交接，KV `pending/github/<ai>/<任务>/<commit>/` 独立存放。合并后再增量同步主线；线上部署独立。见 COLLAB 2.3；保留 Quick 独有资料。
- **代上传与清理（GPT-12 · 用户确认）**：Quick 仅 KV 的变更由任何有 GitHub 权限的 AI 核对后代上传独立 PR；不得重复提交已合并内容。旧临时代码保留至线上及实机验收通过后按 COLLAB 2.4 精确清理，保留可恢复版本与交接记录。
- 🔁 **Quick AI 工作方式（用户 2026-11-23 09:23 决定）**：Quick AI 不连 GitHub，只更新 Cloudflare KV 的代码（`pending/<任务>/`）和交接文档；**提交 GitHub / 开 PR / 编译验收由其他 AI 负责**，待提交清单看 `SYNC_STATE.json` 的 `pending_branches` 和 `pending_github_commits.quick/*`。
- **GPT-17 核对补注**：Quick 原始 BAB-Q01 / Gemini GM-02/03 已由 GPT-16 代传为草稿 PR #10，Q-30 已代传为草稿 PR #11；旧 Q22～Q28 通过 PR #8 上线，**不能重新套用旧补丁**。3 份 Quick 独有审查和 `docs/tasks/render_perf.md` 仍留 KV；见下方最新状态表。
- **决策与推进方式（2026-11-23 用户指示）**：**Quick AI 是临时审查/辅助角色**，大部分决策由用户拍板，任何具备能力的 AI 均可按用户决定**自主完成开发、解包、验收与推进**，不必等待 Quick AI。

---

## 2. 阅读顺序（没读完不要动手）

1. 本页
2. [`COLLAB.md`](../COLLAB.md)：分工、2.1 防冲突、2.2 交接文档更新规则、任务领取和交付流程
3. 各 AI 目录里的 `HANDOVER.md`，**至少读** [`handover/quick/HANDOVER.md`](./quick/HANDOVER.md) 第 1.0 节改动索引
4. [`AGENTS.md`](../AGENTS.md)：开发总纲、验收流程、Windows 避坑
5. [`AI_HANDOVER.md`](../AI_HANDOVER.md)：架构、五大契约、资产来源、部署
6. [`PROGRESS.md`](../PROGRESS.md)：里程碑进度
7. 与你任务相关的 Issue 正文和全部评论（以最新评论为准）

---

## 3. 各 AI 的交接目录（每个 AI 只写自己的目录、只改自己这一行）

| AI | 目录 | 角色 | 编号前缀 | 最后更新（CST） | 最后提交 | 当前在做 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Quick AI（已退出，历史角色） | [`handover/quick/`](./quick/HANDOVER.md) | **2026-11-24 用户确认退出；仅供查看历史审查、代码与 PR**，不领取后续任务 | `Q-`、`QC-`、`QI-`、`BAB-Q`（历史） | 2026-11-23 历史交接 | 当前已停用 | 旧 PR #8/#10/#11 与 KV 原件保留；B4/B5 新工作转由 Gemini + GPT 承接，不重复提交旧补丁 |
| Antigravity（原主线开发 AI） | [`handover/antigravity/`](./antigravity/HANDOVER.md) | 主线开发、本机编译/实机截图验收与修复 | `AG-` | 2026-11-23 03:55 | `[Antigravity AG-09]` | **两步任务全部完成**：① AG-08 93 条 14.14 原版 SFX + 5 首原版 BGM 已接入 `src/audio/audio.ts`；② AG-09 已验收并合并 PR #3（`c056396`）+ 合入 42 动作版 `reksai.glb`、彻底修复 `Wrap/Plane` 子网格隐藏并接入 17 个原版动作剪辑，3 张特写截图视觉审计 CLEAN PASS；待按需部署线上 |
| Muse（执行 AI） | [`handover/muse/`](./muse/HANDOVER.md) | 执行 Issue #1（解包、转换、贴图）；生产部署 | `MU-` | 2026-11-23 06:40 | `[Muse MU-01]` | GPT-08（PR #8）已部署上线，版本 `5955ad9a`，deployment `f94499ee`，100% 流量；真机视听待验；Issue #1 待领取 |
| GPT（ChatGPT） | [`handover/gpt/`](./gpt/HANDOVER.md) | 资产溯源、最小解包、审查修复、用户授权开发与发布 | `GPT-` | 2026-11-23 | `[GPT-21]`（KV 批量操作规范）；GPT-10 [PR #9](https://github.com/cianasa222/swarm-remake/pull/9) | [KV 批量操作规则](../COLLAB.md#23-每次提交双端交接gpt-11--用户指示-2026-11-23优先于旧规则中只同步-main的表述)，不部署；[BAB-01 迁移](./gpt/BABYLON_MIGRATION.md)；UI 独立分支已开发，构建/回归通过，实机待验、未合并/部署；[UI 交接](https://github.com/cianasa222/swarm-remake/blob/gpt/gpt10-heroui/handover/gpt/UI_GPT10.md)。每次提交双端同步；代上传及上线验收后清理见 COLLAB 2.2/2.4；[BAB-Q01 缺口与验收](./gpt/BAB_Q01_ACCEPTANCE_GPT13.md)（数据通过，集成未通过）；保留 MU-01 线上与备用资产；[PR #10](https://github.com/cianasa222/swarm-remake/pull/10) CI PASS、[PR #11](https://github.com/cianasa222/swarm-remake/pull/11) 14/14 贴图 CI PASS，均为草稿未部署 |
| Gemini | [`handover/gemini/`](./gemini/HANDOVER.md) | **与 Quick AI 相同，角色由用户随时指定；仅可访问 Cloudflare（不连 GitHub），只更新 KV 代码与交接，由其他 AI 代提交 GitHub** | `GM-` | 2026-11-23 20:48 | `GM-12`（仅 KV，`MISSING_MESHES_PRIORITY_GM12.md`） | 已写入 2.6 节「先跑通代码」规则、交付 **GM-10 UIA 音频映射（3/3 单测）** 并清理中转箱、交付 **GM-11 B1/B2/B3 底座（4/4 单测）**，最新交付 **GM-12 44 缺口网格 P0–P3 解包优先级清单** |
| 新加入的 AI | `handover/<名字小写>/`，如 `gpt`、`claude`、`gemini` | — | 首次建目录时登记，如 `GPT-`、`CL-`、`GM-` | — | — | — |

---

## 4. 共享文档（根目录，多人共用，按 2.1 节只改自己负责的那一节）

| 文件 | 内容 |
| :--- | :--- |
| [`COLLAB.md`](../COLLAB.md) | 分工、防冲突、交接更新规则、任务流程、任务看板 |
| [`AGENTS.md`](../AGENTS.md) | 开发总纲、原版核心数值、验收流程、Windows 避坑 |
| [`AI_HANDOVER.md`](../AI_HANDOVER.md) | 架构、目录结构、五大契约、资产来源、Cloudflare 部署 |
| [`PROGRESS.md`](../PROGRESS.md) | 里程碑进度 |
| [`docs/audit/`](../docs/audit/) | 审查报告（如喷泉 43 个发射器比对） |
| [`docs/ci/`](../docs/ci/) | 备用的 GitHub Actions 工作流（需手动复制到 `.github/workflows/` 才生效） |
| `FULL_SOURCE_BUNDLE.md` | **旧快照，可能已过期**。改代码以 `src/` 为准，不要照它改 |
| `QUICK_AI_HANDOVER.md` | 只剩跳转说明，内容已迁到 `handover/quick/HANDOVER.md` |

---

## 5. GPT-17 最新有效状态（2026-11-23，按 GitHub CI 与 Cloudflare 部署核对）

| 内容 | 经过核实的当前状态 |
| :--- | :--- |
| GitHub 主线 | 文档提交前 `fce330fc`，旧 Three.js 游戏未替换为 Babylon |
| Cloudflare Worker | `tideline-swarm` 仍是部署 `f94499ee`、版本 `5955ad9a`（100%），无新部署 |
| Quick BAB-Q01 + Gemini GM-02/03 | [PR #10](https://github.com/cianasa222/swarm-remake/pull/10)，最新 `77c25a35`，集成 **157 套/903 层**，GPT-18 已将附着网格绑定补至 26 条，新版 CI **2/2 success**；草稿、未合并/部署 |
| Quick Q-30 StarStrike | [PR #11](https://github.com/cianasa222/swarm-remake/pull/11)，最新 `bc44bc1d`，4 系统/21 层，14 张 WebP + SHA256SUMS 已入库，CI **2/2 success**；草稿、未合并/部署 |
| 重复旧版 | [PR #12](https://github.com/cianasa222/swarm-remake/pull/12) 关闭且未合并；不可用旧 122/742 数据覆盖 157/903 |
| GPT-10 UI | [PR #9](https://github.com/cianasa222/swarm-remake/pull/9) 草稿未合并/部署，真实登录、HUD、iPhone 验收待做 |
| 未完成的门禁 | Babylon B1 引擎与 B4 VFX 运行器、42 个原始缺失网格、5 套额外 VFX 贴图/网格核验、StarStrike SCB 身份和原版录像/iPhone GPU 性能 |
| GitHub ↔ KV | 每个分支固定提交存独立 KV 快照和 manifest；原始 Quick/Gemini `pending/` 不删除。KV 全局 `SYNC_STATE.commit` 不代表最新主线全量同步 |

完整进度、审查结论与剩余问题：[GPT-17 交接回执](handover/gpt/STATUS_GPT17.md)。

### 5.1 Quick 历史快照（2026-11-23 10:30，旧「待上传」表述非当前状态）

| 事项 | 状态 |
| :--- | :--- |
| 里程碑 | M0–M4 已完成；M5 待用户确认开启 |
| 线上网站 | Worker `tideline-swarm` 最新部署 **`5955ad9a`（11-23 06:40，Muse MU-01）**，PR #8（GPT-08，`797ef1d`，main `6962303`）已上线，100% 流量，deployment `f94499ee`；上一版 `7d862759`（deployment `44d8772f`，保留可回退）。验收：首页 200、匿名 session `accountId:null`、跨域 POST 403、错误方法 405、profile/save 404、资源 200、交接文档 410；真机视听待验 |
| PR | PR #3 / #7 / #8 ✅ 已合并并上线（`5955ad9a`）；[PR #5](https://github.com/cianasa222/swarm-remake/pull/5)（GPT-03 喷泉贴花透明遮罩，**待用户 iPhone 同机位复核**）；[PR #9](https://github.com/cianasa222/swarm-remake/pull/9)（GPT-10 React + HeroUI 界面，草稿，待浏览器 / iPhone 验收，未合并未部署） |
| 外包任务 PERF-1 | 渲染性能与画质，任务单 `docs/tasks/render_perf.md`（**只在 KV**）；T2 / T4 / T5 已随 PR #8 上线；待领取：T2b 重新导出带动作的小怪、T1 KTX2、T6 MSAA 实测、T7 特效合批 |
| Quick AI Q-22 至 Q-28 | ✅ 已由 GPT-07 审查、PR #8 合入（`797ef1d`，剔除战兔巨爆错误改色），随 `5955ad9a` 上线；真机视听待验 |
| BAB-01 新引擎迁移 | 手册 `handover/gpt/BABYLON_MIGRATION.md`（GPT-09）；Quick AI 的 B0 模块清单 + B4 通用 VFX 数据 + HUD 资源核查（BAB-Q01）**只在 KV `pending/bab01-quick/`，待其他 AI 提交** |
| 原版音效 | ✅ AG-08 接入 93 条原版 `.ogg` + BGM；GPT-07 在 PR #8 补 17 个样本、9 把副武器 18 个音频组；均已上线；全部 736 条在资产分支 |
| 原版资产分支 | [`asset/14.14-unpacked-assets-20261123`](https://github.com/cianasa222/swarm-remake/tree/asset/14.14-unpacked-assets-20261123)（AG-06）：雷克塞 42 段动作、子网格表、55 个特效网格、16 个补充小怪模型、全部音效 |
| 审查报告 | `docs/audit/`：`ui_camera_audio_14.14.md`（界面 + 镜头 + 音效，Q-29，**只在 KV**）、`enemies_map_14.14.md`（敌人模型 + 地图，Q-26，**只在 KV**）、`weapons_vfx_14.14.md`（武器特效，Q-24，**只在 KV**）、`live_vs_14.14.md`（数值）、`boss_reksai_14.14.md`（首领）、`jinx_14.14.md`、`fountain_emitters_14.14.md` |
| Issue | [#1](https://github.com/cianasa222/swarm-remake/issues/1)（Muse 已领取）；[#4](https://github.com/cianasa222/swarm-remake/issues/4)（大部分已由 AG-05 / 06 / 08 完成，余首领出场） |
| 资源渠道 | 统一看 [`handover/gpt/RESOURCE_SOURCES.md`](./gpt/RESOURCE_SOURCES.md)（GPT-02） |

---


## 6. 怎么读 Cloudflare KV（需要用户 Cloudflare 账号的 API 权限）

- 账号 `63223f8370990e669e94ab2e9c56683a`，KV `tideline-handover`（`7bbc331619b04fc8b5b5323abba5eef0`）。
- 读文件：`GET /accounts/63223f8370990e669e94ab2e9c56683a/storage/kv/namespaces/7bbc331619b04fc8b5b5323abba5eef0/values/<仓库相对路径>`，路径里的 `/` 写成 `%2F`，例如 `handover%2FREADME.md`。
- `FILE_INDEX.json`：KV 里全部镜像文件的目录（第一条就是本页）。`SYNC_STATE.json`：最后同步的提交号、时间和每个文件的 SHA-256。
- `ref/14.14/` 开头的是 14.14 原版参考数据（版权原因不进公开仓库），读取方式相同。
- KV 的写入规则见 [`COLLAB.md`](../COLLAB.md) 2.1 节第 4 条和 2.2 节：只镜像 GitHub 已提交的内容、只做增量、写完核对哈希。
