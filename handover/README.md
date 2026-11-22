# 交接总入口（任何 AI 开工前先读这一页）

> 本页结构由 Quick AI（AWS Quick）于 2026-11-22 建立。**第 3 节每个 AI 只改自己那一行**，其他节按 [`COLLAB.md`](../COLLAB.md) 2.1 节防冲突规则修改。

---

## 1. 一句话看懂

- **项目**：1:1 复刻《英雄联盟：无尽狂潮（Swarm）》第一关「仓库区（Map33）」，Vite + TypeScript + Three.js，资产全部来自拳头 Patch 14.14 原版。
- **以谁为准**：GitHub [`cianasa222/swarm-remake`](https://github.com/cianasa222/swarm-remake) 的 `main` 分支是唯一权威版本。Cloudflare KV `tideline-handover` 是镜像，**可能落后**。线上网站只放游戏，**不放交接文档**。
- **KV 是不是最新**：读 KV 里的 `SYNC_STATE.json`，它的 `commit` 等于 GitHub `main` 最新提交就是一致；不等就以 GitHub 为准。KV 不会自动跟着 GitHub 变，要由改动的 AI 手动同步。
- **改了代码要做什么**：同一轮工作里，在自己的 `handover/<ai名>/HANDOVER.md` 登记改动，提交到 GitHub，再同步到 KV（规则见 [`COLLAB.md`](../COLLAB.md) 2.2 节）。
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
| Quick AI（AWS Quick） | [`handover/quick/`](./quick/HANDOVER.md) | 临时审查 / 辅助：与 14.14 原版比对，审查发现的不一致项由 Quick AI 修复，代码走 PR | `Q-`（git）、`QC-`（Cloudflare）、`QI-`（Issue） | 2026-11-23 03:45 | `[Quick AI Q-21]` | 已审：数值（Q-14，修复见 [PR #3](https://github.com/cianasa222/swarm-remake/pull/3) 待验收）、首领雷克塞（Q-17）；下一步审武器特效 / 敌人模型 / 地图 |
| Antigravity（原主线开发 AI） | [`handover/antigravity/`](./antigravity/HANDOVER.md) | 主线开发、本机编译/实机截图验收与修复 | `AG-` | 2026-11-23 03:55 | `[Antigravity AG-09]` | **两步任务全部完成**：① AG-08 93 条 14.14 原版 SFX + 5 首原版 BGM 已接入 `src/audio/audio.ts`；② AG-09 已验收并合并 PR #3（`c056396`）+ 合入 42 动作版 `reksai.glb`、彻底修复 `Wrap/Plane` 子网格隐藏并接入 17 个原版动作剪辑，3 张特写截图视觉审计 CLEAN PASS；待按需部署线上 |
| Muse（执行 AI） | 领取任务时建 `handover/muse/` | 执行 Issue #1（解包、转换、贴图） | 首次建目录时登记，建议 `MU-` | — | — | Issue #1 待领取 |
| GPT（ChatGPT） | [`handover/gpt/`](./gpt/HANDOVER.md) | 资产溯源、最小解包、证据与协作审查；用户授权开发 UI | `GPT-` | 2026-11-23 | `[GPT GPT-05]` | 登录首页与细节画质；游客已实现，邮箱跨站授权与真机验收待办；[资源渠道表](./gpt/RESOURCE_SOURCES.md) |
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

## 5. 当前状态速览（2026-11-23 03:45，由 Quick AI 更新；以各 AI 交接文档和 `COLLAB.md` 看板为准）

| 事项 | 状态 |
| :--- | :--- |
| 里程碑 | M0–M4 已完成；M5 待用户确认开启 |
| 线上网站 | `701860ff`（AG-05）：含喷泉第二批（AG-03）、金克丝重建（PR #2）、金克丝补层（AG-05）。**不含** AG-08 原版音效、PR #3 |
| 待验收的 PR | [PR #3](https://github.com/cianasa222/swarm-remake/pull/3)（Quick AI Q-15：A 类 14 项数值对齐 14.14），AG-09 进行中 |
| 原版音效 | ✅ AG-08 已接入 93 条原版 `.ogg` + BGM（`main`，待部署）；全部 736 条在资产分支 |
| 原版资产分支 | [`asset/14.14-unpacked-assets-20261123`](https://github.com/cianasa222/swarm-remake/tree/asset/14.14-unpacked-assets-20261123)（AG-06）：雷克塞 42 段动作、子网格表、55 个特效网格、16 个补充小怪模型、全部音效 |
| 审查报告 | `docs/audit/`：`live_vs_14.14.md`（数值）、`boss_reksai_14.14.md`（首领）、`jinx_14.14.md`、`fountain_emitters_14.14.md` |
| Issue | [#1](https://github.com/cianasa222/swarm-remake/issues/1)（Muse 已领取）；[#4](https://github.com/cianasa222/swarm-remake/issues/4)（大部分已由 AG-05 / 06 / 08 完成，余首领出场） |
| 资源渠道 | 统一看 [`handover/gpt/RESOURCE_SOURCES.md`](./gpt/RESOURCE_SOURCES.md)（GPT-02） |

---

## 6. 怎么读 Cloudflare KV（需要用户 Cloudflare 账号的 API 权限）

- 账号 `63223f8370990e669e94ab2e9c56683a`，KV `tideline-handover`（`7bbc331619b04fc8b5b5323abba5eef0`）。
- 读文件：`GET /accounts/63223f8370990e669e94ab2e9c56683a/storage/kv/namespaces/7bbc331619b04fc8b5b5323abba5eef0/values/<仓库相对路径>`，路径里的 `/` 写成 `%2F`，例如 `handover%2FREADME.md`。
- `FILE_INDEX.json`：KV 里全部镜像文件的目录（第一条就是本页）。`SYNC_STATE.json`：最后同步的提交号、时间和每个文件的 SHA-256。
- `ref/14.14/` 开头的是 14.14 原版参考数据（版权原因不进公开仓库），读取方式相同。
- KV 的写入规则见 [`COLLAB.md`](../COLLAB.md) 2.1 节第 4 条和 2.2 节：只镜像 GitHub 已提交的内容、只做增量、写完核对哈希。
