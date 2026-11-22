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
| Quick AI（AWS Quick） | [`handover/quick/`](./quick/HANDOVER.md) | 审查、与 14.14 原版比对；**审查发现的不一致项由 Quick AI 修复，代码走 PR** | `Q-`（git）、`QC-`（Cloudflare）、`QI-`（Issue） | 2026-11-23 01:00 | `[Quick AI Q-13]` | 金克丝按 14.14 原版修复，[PR #2](https://github.com/cianasa222/swarm-remake/pull/2) 待开发 AI 构建验收 |
| Antigravity（原主线开发 AI） | [`handover/antigravity/`](./antigravity/HANDOVER.md) | 主线开发、本机编译/实机截图验收与修复 | `AG-` | 2026-11-23 03:40 | `[Antigravity AG-08]` | **已完成第 1 步**：93 条 14.14 原版 SFX + 5 首原版 BGM 已接入 `src/audio/audio.ts` 并通过浏览器 WebAudio 解码实测；**紧接着推进第 2 步（AG-09）**：验收合并 PR #3 + 雷克塞 42 动作与 Wrap/Plane 子网格修复（若本轮未完可顺延接手） |
| Muse（执行 AI） | 领取任务时建 `handover/muse/` | 执行 Issue #1（解包、转换、贴图） | 首次建目录时登记，建议 `MU-` | — | — | Issue #1 待领取 |
| GPT（ChatGPT） | [`handover/gpt/`](./gpt/HANDOVER.md) | 资产溯源、最小解包、证据与协作审查 | `GPT-` | 2026-11-23 | `[GPT GPT-02]` | [统一资源渠道登记表](./gpt/RESOURCE_SOURCES.md)；未领取执行任务 |
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

## 5. 当前状态速览（2026-11-23 01:00，由 Quick AI 填写）

| 事项 | 状态 |
| :--- | :--- |
| 里程碑 | M0–M4 已完成；M5 待用户确认开启 |
| 中央喷泉 | 第一批（Q-04 + AG-01）已上线；第二批（AG-03，43/43 发射器）Antigravity 记为 CLEAN PASS，待部署 |
| Q-05 小怪只剩影子修复 | ✅ 已上线 |
| 线上网站 | Antigravity AG-02 部署（`54a77c68`）：含 Q-04 / AG-01 / Q-05，不含 AG-03 和 Q-13；交接文档地址返回 410 |
| **待验收的 PR** | [PR #2](https://github.com/cianasa222/swarm-remake/pull/2)（Quick AI Q-13）：金克丝数值与特效按 14.14 原版重建，**Quick AI 未编译**，请开发 AI 构建、playtest、截图后合并 |
| 审查报告 | [`docs/audit/jinx_14.14.md`](../docs/audit/jinx_14.14.md)（Q-12，Q-13 已订正 2 处错误并加第 9 节修复状态）；[`docs/audit/fountain_emitters_14.14.md`](../docs/audit/fountain_emitters_14.14.md) |
| [Issue #1](https://github.com/cianasa222/swarm-remake/issues/1) | 待领取（喷泉部分资产已由 AG-03 补齐，Issue 范围待更新） |
| 用户决定 | M4 压缩后的资产保留在公开仓库（见 `handover/quick/HANDOVER.md` 1.6 节）；审查发现的不一致由 Quick AI 修复、走 PR（同上 0 节） |

---

## 6. 怎么读 Cloudflare KV（需要用户 Cloudflare 账号的 API 权限）

- 账号 `63223f8370990e669e94ab2e9c56683a`，KV `tideline-handover`（`7bbc331619b04fc8b5b5323abba5eef0`）。
- 读文件：`GET /accounts/63223f8370990e669e94ab2e9c56683a/storage/kv/namespaces/7bbc331619b04fc8b5b5323abba5eef0/values/<仓库相对路径>`，路径里的 `/` 写成 `%2F`，例如 `handover%2FREADME.md`。
- `FILE_INDEX.json`：KV 里全部镜像文件的目录（第一条就是本页）。`SYNC_STATE.json`：最后同步的提交号、时间和每个文件的 SHA-256。
- `ref/14.14/` 开头的是 14.14 原版参考数据（版权原因不进公开仓库），读取方式相同。
- KV 的写入规则见 [`COLLAB.md`](../COLLAB.md) 2.1 节第 4 条和 2.2 节：只镜像 GitHub 已提交的内容、只做增量、写完核对哈希。
