# 交接总入口（任何 AI 开工前先读这一页）

> ⛔ **同步 KV 前必读（用户指示，GPT-12 更新）**：Quick / 其他 AI 无 GitHub 权限时，查 KV `SYNC_STATE.json` 的 `kv_only_pending`、`pending_branches` 与 `pending_github_commits`，按任务核对实际 GitHub 提交/PR 后代上传未提交内容；共享文档须合并双方新增内容，不覆盖独有资料。**仅在合并、实际部署、上线/实机验收通过、GitHub 可恢复且主线 KV 核验后，才允许精确清理重复临时代码。** 交接、清单、参考/备用资产永久保留；不删除其他任务或整个索引。详见 COLLAB 2.2 第 10 条及 2.4。

> 本页结构由 Quick AI（AWS Quick）于 2026-11-22 建立。**第 3 节每个 AI 只改自己那一行**，其他节按 [`COLLAB.md`](../COLLAB.md) 2.1 节防冲突规则修改。

---

## 1. 一句话看懂

- **项目**：1:1 复刻《英雄联盟：无尽狂潮（Swarm）》第一关「仓库区（Map33）」，Vite + TypeScript + Three.js，资产全部来自拳头 Patch 14.14 原版。
- **以谁为准**：GitHub [`cianasa222/swarm-remake`](https://github.com/cianasa222/swarm-remake) 的 `main` 分支是唯一权威版本。Cloudflare KV `tideline-handover` 是镜像，**可能落后**。线上网站只放游戏，**不放交接文档**。
- **KV 是不是最新**：读 KV 里的 `SYNC_STATE.json`，它的 `commit` 等于 GitHub `main` 最新提交就是一致；不等就以 GitHub 为准。KV 不会自动跟着 GitHub 变，要由改动的 AI 手动同步。
- **改了代码要做什么**：同一轮工作里，在自己的 `handover/<ai名>/HANDOVER.md` 登记改动，提交到 GitHub，再同步到 KV（规则见 [`COLLAB.md`](../COLLAB.md) 2.2 节）。
- **每次提交即时双端交接（GPT-11 · 用户指示）**：不等合并；查 `SYNC_STATE.json.pending_github_commits` 获取未合并 PR 的最新快照、文件清单与交接，KV `pending/github/<ai>/<任务>/<commit>/` 独立存放。合并后再增量同步主线；线上部署独立。见 COLLAB 2.3；保留 Quick 独有资料。
- **代上传与清理（GPT-12 · 用户确认）**：Quick 仅 KV 的变更由任何有 GitHub 权限的 AI 核对后代上传独立 PR；不得重复提交已合并内容。旧临时代码保留至线上及实机验收通过后按 COLLAB 2.4 精确清理，保留可恢复版本与交接记录。
- **Quick 固定工作方式**（Quick KV 交接记录：用户 2026-11-23 09:23 决定）：Quick 不连 GitHub，只更新 KV 代码与交接；提交 GitHub、开 PR、编译验收由其他 AI 负责。待提交清单查 `SYNC_STATE.json.pending_branches` 与 `pending_github_commits.quick/*`。
- **⚠️ Quick AI 暂时连不上 GitHub（2026-11-23 起，GitHub 连接器授权失效）**：Quick AI 的新代码在 KV `pending/q22/`、`pending/q23/`、`pending/q25/`、`pending/q27/`、`pending/q28/`（说明 `pending/q22/README.md`，基准 `bd8a87b`），新审查报告 `docs/audit/weapons_vfx_14.14.md`、`docs/audit/enemies_map_14.14.md`、`docs/audit/ui_camera_audio_14.14.md`、任务单 `docs/tasks/render_perf.md`，文档改动列在 KV `SYNC_STATE.json` 的 `kv_only_pending`。**任何能写 GitHub 的 AI 看到就请帮忙上传 GitHub，并把 Quick AI 交接（`handover/quick/HANDOVER.md` 的 Q-22 至 Q-29、QC-07 至 QC-14）补进总文档**。**从 GitHub 往 KV 同步时，先看 `kv_only_pending`，别把这些 KV 独有的改动覆盖掉**（11-23 05:23 的 GPT-06 同步就覆盖过一次，Quick AI 已在 QC-10 重新合并）。
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
| Quick AI（AWS Quick） | [`handover/quick/`](./quick/HANDOVER.md) | **角色由用户随时指定**；当前：14.14 原版比对与特效还原、BAB-01 数据准备。**按用户决定不连 GitHub，只更新 KV 代码与交接，由其他 AI 提交** | `Q-`、`QC-`、`QI-`、`BAB-Q` | 2026-11-23 18:15 | `QC-19`（比对 GM-02/03） | 待提交：**`pending/q30/`（Q-30 战兔巨爆）**、`pending/bab01-quick/`（BAB-Q01）、3 份审查报告 + 任务单。Q01-01～03 缺口以 Gemini `pending/bab01-gemini/` 为准，Quick 的差异建议见 `handover/quick/QC19_GM02_REVIEW.md` |
| Antigravity（原主线开发 AI） | [`handover/antigravity/`](./antigravity/HANDOVER.md) | 主线开发、本机编译/实机截图验收与修复 | `AG-` | 2026-11-23 03:55 | `[Antigravity AG-09]` | **两步任务全部完成**：① AG-08 93 条 14.14 原版 SFX + 5 首原版 BGM 已接入 `src/audio/audio.ts`；② AG-09 已验收并合并 PR #3（`c056396`）+ 合入 42 动作版 `reksai.glb`、彻底修复 `Wrap/Plane` 子网格隐藏并接入 17 个原版动作剪辑，3 张特写截图视觉审计 CLEAN PASS；待按需部署线上 |
| Muse（执行 AI） | [`handover/muse/`](./muse/HANDOVER.md) | 执行 Issue #1（解包、转换、贴图）；生产部署 | `MU-` | 2026-11-23 06:40 | `[Muse MU-01]` | GPT-08（PR #8）已部署上线，版本 `5955ad9a`，deployment `f94499ee`，100% 流量；真机视听待验；Issue #1 待领取 |
| GPT（ChatGPT） | [`handover/gpt/`](./gpt/HANDOVER.md) | 资产溯源、最小解包、审查修复、用户授权开发与发布 | `GPT-` | 2026-11-23 | `[GPT-16]`（PR #10/#11）；GPT-10 [PR #9](https://github.com/cianasa222/swarm-remake/pull/9) | [BAB-01 迁移](./gpt/BABYLON_MIGRATION.md)；UI 独立分支已开发，构建/回归通过，实机待验、未合并/部署；[UI 交接](https://github.com/cianasa222/swarm-remake/blob/gpt/gpt10-heroui/handover/gpt/UI_GPT10.md)。每次提交双端同步；代上传及上线验收后清理见 COLLAB 2.2/2.4；[BAB-Q01 缺口与验收](./gpt/BAB_Q01_ACCEPTANCE_GPT13.md)（数据通过，集成未通过）；保留 MU-01 线上与备用资产；[PR #10](https://github.com/cianasa222/swarm-remake/pull/10) CI PASS、[PR #11](https://github.com/cianasa222/swarm-remake/pull/11) 14/14 贴图 CI PASS，均为草稿未部署 |
| Gemini | [`handover/gemini/`](./gemini/HANDOVER.md) | **与 Quick AI 相同，角色由用户随时指定；仅可访问 Cloudflare（不连 GitHub），只更新 KV 代码与交接，由其他 AI 代提交 GitHub** | `GM-` | 2026-11-23 11:12 | `GM-03`（仅 KV，`pending/bab01-gemini/`） | 已完成 BAB-Q01 的 **Q01-01 / Q01-02 / Q01-03** 修复：152 系统 / 883 层、555 贴图实测 100% 真 PNG（主线已回填 95）、133 网格逐路径表（主线 29 + 备用 62 + 缺口 42）与 21 层 `attachedMesh` 绑定，待有 GitHub 权限 AI 代上传验收 |
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

## 5. 当前状态速览（2026-11-23 06:05，由 Quick AI 更新；以各 AI 交接文档和 `COLLAB.md` 看板为准）

| 事项 | 状态 |
| :--- | :--- |
| 里程碑 | M0–M4 已完成；M5 待用户确认开启 |
| 线上网站 | Worker `tideline-swarm` 最新部署 **`5955ad9a`（11-23 06:40，Muse MU-01）**，PR #8（GPT-08，`797ef1d`，main `6962303`）已上线，100% 流量，deployment `f94499ee`；上一版 `7d862759`（deployment `44d8772f`，保留可回退）。验收：首页 200、匿名 session `accountId:null`、跨域 POST 403、错误方法 405、profile/save 404、资源 200、交接文档 410；真机视听待验 |
| 待验收的 PR | PR #3 ✅ 已合并（AG-09 `c056396`）；PR #7 ✅ 已合并（GPT-06 `accf280`，待部署 / 真机验收）；[PR #5](https://github.com/cianasa222/swarm-remake/pull/5)（GPT-03：喷泉贴花透明遮罩，**待用户 iPhone 同机位复核**） |
| 外包任务 PERF-1 | 渲染性能与画质，任务单 `docs/tasks/render_perf.md`（**只在 KV**）；待领取：T2b 重新导出带动作的小怪、T1 KTX2、T6 MSAA 实测、T7 特效合批 |
| Q-22 / Q-23 / Q-25 / Q-27 / Q-28（仅 KV） | 小怪顶点动画 + 小怪不投实时阴影 + 角色贴图各向异性（`pending/q22/`）；手机锁 60 帧 + 动态分辨率 + `?perf=1`（`pending/q23/`）；战兔巨爆 / 冰爆护甲颜色和寿命（`pending/q25/`）；小怪死亡特效红橙（`pending/q27/`）；精英死亡动作 + 耀光力场 4 层 + 战兔巨爆进化配色 + 斯塔缇克闪电时长（`pending/q28/`，最后提交）。**待能写 GitHub 的 AI 上传、开一个 PR、编译验收** |
| 原版音效 | ✅ AG-08 已接入 93 条原版 `.ogg` + BGM（`main`，待部署）；全部 736 条在资产分支 |
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
