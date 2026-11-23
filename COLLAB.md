# 协作与任务交接规范（COLLAB）

> 最后更新：2026-11-22 22:45（新增 2.2 节交接文档更新规则；交接按 AI 分目录；线上站点不再提供交接文档）· 第 0、1、2.2、5 节维护者：Quick AI（AWS Quick）
> 新加入的 AI / 开发者：**先读交接总入口 [`handover/README.md`](./handover/README.md)**，再按下面第 0 节的顺序读。

---

## 0. 开工前必读（所有 AI、所有会话都必须遵守）

**任何 AI 在开始写代码、改文档、下载资产或审查之前，必须先按顺序读完下列交接文档。没读完不要动手。**

| 顺序 | 文件 | 重点 |
| :---: | :--- | :--- |
| 1 | [`handover/README.md`](./handover/README.md) | **交接总入口**：一页看懂项目、各 AI 的目录和当前状态、怎么判断 KV 是否最新 |
| 2 | `COLLAB.md`（本文件） | 分工、2.1 防冲突规则、**2.2 交接文档更新规则**、任务流程 |
| 3 | `handover/<各 AI>/HANDOVER.md` | 每个 AI 改过什么、是否已验收和部署；至少读 [`handover/quick/HANDOVER.md`](./handover/quick/HANDOVER.md) 第 1.0 节改动索引 |
| 4 | [`AGENTS.md`](./AGENTS.md) | 开发总纲、硬性验收流程、Windows 避坑 |
| 5 | [`AI_HANDOVER.md`](./AI_HANDOVER.md) | 架构与五大契约、资产来源、部署 |
| 6 | [`PROGRESS.md`](./PROGRESS.md) | 里程碑进度 |
| 7 | 与本次任务相关的 Issue 正文和**全部评论** | 以最新评论为准 |

- 读文档时以 GitHub `main` 上的最新版为准；Cloudflare KV 里的副本只是镜像。判断 KV 是否最新：KV 里 `SYNC_STATE.json` 的 `commit` 等于 GitHub `main` 最新提交，就是一致的；不等就以 GitHub 为准。
- **线上网站（`tideline-swarm.cianasa888-gbd.workers.dev`）不再提供交接文档**，旧地址返回 410。
- 下载原版数据先按 [`handover/quick/HANDOVER.md`](./handover/quick/HANDOVER.md) 第 3.0 节判断：环境能直接下载就直接下载；被拒才用 Worker 或 Actions 等可选方案。
- 每个 AI 的改动都要能追溯：按下面 2.2 节登记在自己的 `handover/<ai名>/HANDOVER.md` 里，提交说明以 `[<AI名> <编号>]` 开头。

---

## 1. 角色分工

| 角色 | 负责 | 不负责 |
| :--- | :--- | :--- |
| **Quick AI（AWS Quick，审查）** | 审查其他 AI 提交的代码和 PR：对照 Patch 14.14 原版数据逐项比对、检查架构契约、给出 `PASS` / `需修改` 和优化建议；审查报告写到 `docs/audit/`；核对 GitHub ↔ KV 是否一致并补齐镜像；**2026-11-23 起（用户指示）：修复自己审查发现的「与原版不一致」项，代码只走分支 + PR** | 新功能开发、直接向 `main` 推送代码改动、本机构建/截图、`.wad.client` 下载、lol2gltf 转换、部署 |
| **开发 AI（主线开发）** | `src/` 功能开发：喷泉第二批、M5、新英雄等；本机 `build` / `playtest` / 截图；修复审查意见 | — |
| **执行 AI / 开发者（任务领取方，如 Muse）** | 领取带 `help wanted` 标签的 Issue：`.wad.client` 下载解包、`.scb` / lol2gltf 转换、贴图下载转换 | 修改 `src/`（除非 Issue 明确允许） |
| **用户（项目负责人）** | 确认里程碑、拍板需求与优先级、合并 PR、部署 Cloudflare | — |

> **决策与自主推进原则（用户指示，2026-11-23）**：**Quick AI 为临时审查/辅助角色**，并非唯一入口或必经审批环节。项目方向、功能取舍与优先级均以**用户决定**为准；任何具备开发/编译/解包能力的 AI 都应按用户指示**自主完成开发、资产转换、测试验收与交付**，无需被动等待 Quick AI 派单或回复。

---

## 2. 数据源与同步规则

| 内容 | 权威来源 | 镜像 |
| :--- | :--- | :--- |
| 源码、配置、文档 | **GitHub `main` 分支** | Cloudflare KV `tideline-handover`（key 为仓库相对路径，原样存放） |
| 未合并提交（源码、配置、交接文档） | GitHub 对应分支的固定 commit SHA | KV `pending/github/<ai>/<任务>/<commit>/<仓库相对路径>`；独立清单，不是主线 |
| 14.14 原版参考数据（`.bin.json`） | Cloudflare KV `ref/14.14/<CommunityDragon 相对路径>` | 不进公开仓库（版权） |
| 运行时资产（`.glb` / `.webp` / 特效 `.json`） | GitHub `public/assets/` | 线上 Worker `tideline-swarm`（**只放游戏和资产，不放交接文档**） |
| 任务 | GitHub Issues（标签 `help wanted`） | — |

1. **每次开发提交先上传 GitHub**（独立分支或按授权直接提交 `main`），立即同步 KV；不得等到合并才交接。PR 是验收与集成步骤，不是双端交接的前置条件。
2. 每次提交和每次合并后，**由改动的 AI 自己**按 2.1、2.2 节把变更文件镜像到 KV（没有 Cloudflare 权限的见 2.2 节第 3 条）。镜像时更新 `SYNC_STATE.json` 相应条目；分支独立记录，主线全量一致才可推进全局 `commit`。**GitHub `main` 仍是唯一正式主线，部署另行授权。**
3. 不要直接改 KV 里的源码 key，否则下次同步会被覆盖。
4. `.github/workflows/` 只能由用户在 GitHub 网页上手动维护，AWS Quick 的连接器没有 workflow 权限。

### 2.1 防冲突规则（多个 AI 共用同一批文档时必须遵守）

> 背景：2026-11-22 晚，一次同步把 KV 的 `FILE_INDEX.json` 整份覆盖成 5 条（原有 47 条），已按 KV 实际 key 重建。以下规则就是为了避免再发生这类情况。

1. **先拉后改**：改任何共享文件前，先从 GitHub `main` 拉最新版，在最新版上修改。不要拿本地或上一次会话留下的旧副本直接覆盖。
   - 通过 GitHub API 写文件时，带上刚拉取时的文件 SHA。文件在这期间被别人改过的话，GitHub 会拒绝提交，这时重新拉取、合并后再提交。
2. **只改自己负责的那一节**：`PROGRESS.md`、`AGENTS.md`、`AI_HANDOVER.md`、`COLLAB.md` 按节追加或修改，在节标题或节内注明「作者 · 日期」。
   - 不要整份重写别人写的内容。确实需要改别人的节时，在提交说明里写清原因。
3. **一次提交只做一件事**：提交说明写清改了哪些文件、哪一节。文档和代码可以放在同一次提交里，但不要顺手改无关的文件。
4. **KV 只做镜像，且只做增量**：
   - 只把 GitHub **已经提交**的内容写进对应镜像：按固定 commit SHA 从 GitHub 读回文件，主线使用原 key，分支使用 2.3 节独立前缀；写完核对 SHA-256。Quick 的原有 KV-only 例外和保护规则继续有效。
   - `FILE_INDEX.json` 和 `SYNC_STATE.json` 必须「读取 → 只改对应条目 → 写回」，**禁止整份替换**。
   - 发现 `FILE_INDEX.json` 条目数异常（明显少于 KV 实际 key 数），按 KV 实际 key 重建，并在 `SYNC_STATE.json` 的 `note` 里记一笔。
5. **发现冲突先停**：如果 GitHub 上最新提交不是你拉取时的那个，而且改的是同一个文件，先重新拉取、合并。拿不准怎么合并时，在对应 Issue 下评论或告诉用户，不要强行覆盖。
6. **不在 `main` 上 force push**，不删除别人创建的分支、Issue 或评论。

### 2.2 交接文档更新规则（强制，所有 AI 都要遵守）

> 本节作者：Quick AI · 2026-11-22，按用户要求制定。**这是规则，不是自动化**：没有任何程序会替你更新交接文档或同步 KV，必须由改动的 AI 自己在同一轮工作里完成。

1. **改了就登记**：改代码、资产或配置的那一次提交里，必须同时更新自己的交接文档 `handover/<ai名>/HANDOVER.md`，在「改动索引」表追加一行：编号、时间、提交、文件（+增 / −删 行）、改了什么、验收、部署、KV。**没登记的改动视为不合规，审查直接退回。**
2. **提交说明带名字和编号**：以 `[<AI名> <编号>]` 开头，例如 `[Quick AI Q-12]`、`[GPT GPT-03]`、`[Claude CL-01]`。编号前缀第一次建目录时在 [`handover/README.md`](./handover/README.md) 第 3 节登记，不得与别人重复。任何人用 `git log --grep "<AI名>"` 就能列出这个 AI 的全部提交。
3. **两处同时更新（每次提交，不等合并）**：GitHub 提交后，立刻把这次改动的文件（代码 + 自己的交接文档 + 改过的共享文档）镜像到 Cloudflare KV，按 2.1 节第 4 条及 2.3 节增量更新 `FILE_INDEX.json` / `SYNC_STATE.json` 并核对 SHA-256。分支写「分支已同步」；主线写「主线已同步」；不得把未合并内容当主线。验收、合并、部署各自标记。
   - 没有 Cloudflare 权限的 AI：「KV」列写「待同步」，由下一个有权限的 AI 或 Quick AI 审查时补齐，补齐后改成「已同步」。
4. **按 AI 名字分目录**：每个 AI 一个目录 `handover/<小写名字>/`，例如 `handover/quick/`（Quick AI）、`handover/gpt/`、`handover/claude/`、`handover/gemini/`、`handover/muse/`。
   - 目录里至少有 `HANDOVER.md`（改动索引 + 做过什么 + 剩余工作）；审查报告等可以放同一目录或 `docs/audit/`。
   - **只写自己的目录**，不改别人的目录。共享文档（`COLLAB.md`、`AGENTS.md`、`AI_HANDOVER.md`、`PROGRESS.md`）留在根目录，按 2.1 节只改自己负责的那一节。
   - 第一次建目录时，在 `handover/README.md` 第 3 节加一行自己的信息。
5. **收工前更新总入口**：每次工作结束前，更新 `handover/README.md` 第 3 节**自己那一行**（最后更新时间、最后提交、当前在做什么），并同样同步到 KV。
6. **禁止从非 GitHub 来源整份写 KV**：例如之前线上站点的 `/__sync_kv` 接口会用网站上的旧文件覆盖 KV 文档和索引，2026-11-22 已停用。主线、独立分支各按自己的 GitHub 已提交版本同步；保护原有 Quick KV-only 文件，例外不得伪造 GitHub 提交号。

7. **代码改动走 PR，方便别的 AI 验收**（Quick AI 强制，其他 AI 推荐）：
   - 分支名 `<ai名>/<编号>-<主题>`，例如 `quick/q13-jinx-14.14`；PR 标题以 `[<AI名> <编号>]` 开头，描述里写清改了什么、怎么验收、已知未做项。
   - 自己交接文档里的改动行写分支名和 PR 链接，「验收」列写「⏳ 待验收（PR #N）」。
   - PR 创建及每次后续提交后立即做分支快照同步。验收方在 PR 评论里写结果（`PASS` / `需修改：<清单>`），合并后把改动行的「验收 / 部署 / KV」改成实际状态，并把合并进 `main` 的文件同步到 KV；原分支快照保留。
   - 没有编译能力的 AI（如 Quick AI）提交的 PR，**必须由能编译的 AI 或用户跑过 `build` + `playtest` + 截图才能合并**。
8. **看板随提交维护，谁都可以改**（用户指示，2026-11-23）：
   - 任何 AI 或用户，只要这次提交**新增任务、改变任务状态或完成任务**，就在**同一次提交**里更新第 5 节看板对应的行（新增一行 / 改状态列 / 标 ✅）。
   - 开 PR 的一方加「⏳ 待验收」行；验收合并的一方把它改成「✅ 已合并」；部署的一方写上部署版本号。不用等 Quick AI 来改。
   - 只改和自己这次提交有关的行；发现别的行已过时，可以顺手订正，并在提交说明里写一句。
   - 已完成超过一轮的 ✅ 行可以删掉，保持看板简短。
9. **做不了的事要留给能做的 AI，不指定是谁**（用户指示，2026-11-23）：
   - 因为缺资源、没有编译 / 下载能力等原因做不了的部分，在**同一次提交**里：① 看板加一行，「执行者」写「任意能做的 AI」；② 给出完整清单（原版文件路径、用在哪、下载地址、做完放哪）；③ 量大时开 `[外包任务]` Issue。**不要指定某一个 AI。**
   - **任何 AI** 读到后，只要能做就可以直接做，不用等分配。开工前在 Issue 评论 `领取：<AI名> <编号> <做哪几项>`（或在看板该行写上自己的名字），做完在自己的交接文档登记、在 Issue 勾选，这就是留痕。同一项已有人领取且 24 小时内有进展，其他 AI 不重复做。
   - 接手的 AI **下载资源和补做对应功能一起完成**，不要只下载不接上。
   - 原版文件里有的参数（特效、材质、动作、技能数值）**一律直接照抄**；只有原版文件里确实没有的（例如服务器脚本控制的首领招式数值），才允许推断，并且要标注「推断」和依据。

---

### 2.3 每次提交双端交接（GPT-11 · 用户指示 2026-11-23，优先于旧规则中「只同步 main」的表述）

1. 每次 GitHub 提交（包括未合并 PR、文档提交、后续修复）在同一轮完成 KV 同步，而非等待合并。未合并时以实际 GitHub commit 为准，不得修改主线源码 key。分支快照：`pending/github/<ai>/<任务>/<完整commit SHA>/<仓库相对路径>`，按提交不可变、存在则核对原值，不覆盖旧快照。只镜像本次变更文本/代码/配置/文档；删除项在清单中记录，二进制/超限资产登记 GitHub 路径、blob SHA/哈希及大小，不重复上传 KV 或删除备用资产。
2. 同前缀写 `MANIFEST.json`（分支、commit、父提交/基线、PR 链接、作者、提交号、文件清单与 SHA-256、验收/合并/部署状态、待办）。在 `SYNC_STATE.json.pending_github_commits` 按 `<ai>/<任务>` 增量更新最新 commit、manifest key 和同步状态，指向快照；同步 `FILE_INDEX.json`，所有新 key 读回核验。旧快照及旧 `pending/` 不删除；Quick 原有 `kv_only_pending`、`pending_branches`、其他 AI 记录完整保留。
3. 主线提交/PR 合并按合并后的实际 commit 同步变更文件；保护 key 不覆盖未解决内容，先合并或隔离保存实际主线版本，并记录原因、对应 SHA 和待协调项。全局 `SYNC_STATE.commit` 仅在所有主线镜像均一致时推进；分支记录不能推进。合并后标记分支已合并和实际 merge SHA，保留历史；部署单独记录 Worker 版本，未获授权不部署。
4. 并行同步前重读索引及保护列表，增量合并，写后验证未丢其他条目；若冲突停下协调。没有 GitHub 或 KV 权限时立即标记待同步、记录阻塞及可读取的实际位置，不能声称双端已同步。所有 AI 开工前读主线交接 AND `pending_github_commits`，检查相关未合并提交避免重复开发；不得把未验收分支当正式游戏基线。

## 3. 任务流程：发布 → 领取 → 执行 → 交付 → 验收

```
待领取 ──(评论"领取")──▶ 已领取 ──(开 PR)──▶ 已交付 ──(审核 PASS + 合并)──▶ 已验收（Issue 关闭）
                              │
                              └─(24 小时无进展)──▶ 自动释放，回到待领取
```

1. **发布**：AWS Quick 开 Issue，标题以 `[外包任务]` 开头，打 `help wanted` 标签。正文包含背景、任务清单、验收标准和交付回执模板。
2. **领取**：在 Issue 下评论，格式：
   ```
   领取
   执行者：<AI 名称 / 人名>
   执行环境：<本机 Windows / GitHub Actions windows-latest / 其他>
   领取范围：<全部 / T1 / T1+T2 …>
   预计完成：<YYYY-MM-DD HH:mm CST>
   ```
   - 同一个 Issue（或同一个子任务）同一时间只能有一个执行者。看到已被领取的，不要重复领。
   - 领取后超过 24 小时没有任何评论更新，视为自动释放。
3. **执行**：
   - 从最新 `main` 新建分支：`asset/<主题>-<YYYYMMDD>`（资产类）或 `task/<issue号>-<主题>`（其他类）。
   - 只改 Issue 允许的目录。遇到阻塞（下载失败、哈希无法解析、格式不符）先在 Issue 评论说明，不要擅自改需求。
   - 以 Issue 的**最新评论**为准：AWS Quick 可能已在评论里划掉或追加子任务。
4. **交付**：
   - 开 PR 合入 `main`，标题 `[交付 #<Issue号>] <简述>`，描述第一行写 `Closes #<Issue号>`，然后贴完整的**交付回执**。
   - 提交前在本机跑 `npm.cmd run build`，退出码必须为 0。涉及资产或数值的改动，再跑一次 `npm.cmd run playtest -- 2 0.85`。
   - 在 Issue 下评论一句 `已交付：<PR 链接>`。
5. **验收**：
   - AWS Quick 审核 PR：路径、文件格式、体积、回执完整性，并与 14.14 原版数据比对。审核结果在 PR 评论里写 `PASS` 或 `需修改：<清单>`。
   - 用户合并 PR，Issue 自动关闭。
   - 合并的一方在合并时按 2.2 节第 8 条更新任务看板；AWS Quick 同步 KV 并更新 `PROGRESS.md`。

---

## 4. 硬性规则（违反即退回）

- 任务 PR 不得修改 `src/`，除非 Issue 明确允许。
- 不得提交 `.wad.client`、解包原始目录、未压缩的 `.glb`。`.glb` 必须先过 `node tools/compress_assets.mjs`（`dedup + quantize[排除 TEXCOORD_1] + meshopt`）。
- 单文件小于 25 MiB（Cloudflare 限制）。
- 新增的 `.scb` → JSON 必须与现有 `public/assets/map1/vfx/fountain_*.json` 格式一致。
- 所有资产版权归 Riot Games，仅作非商业开发参考。

---

## 5. 当前任务看板

> 谁提交谁维护（见 2.2 节第 8 条）：新增任务、改变状态、完成任务时，在同一次提交里改这里。

| 编号 | 任务 | 执行者 | 状态 |
| :--- | :--- | :--- | :--- |
| [#1](../../issues/1) | 14.14 `.wad.client` 下载解包（**用 Windows 清单**，见 Issue 21:30 订正）+ 5 个 Nova 网格转 JSON + 15 张贴图（T4）+ 4 种小怪 `skin0.bin.json` | 执行 AI（Muse，待领取） | 🟡 待领取 |
| — | 验收并修正喷泉第一批（`c63e871`，Quick AI 已提交） | 开发 AI + 用户 | ✅ 已验收（AG-01）并上线（AG-02） |
| — | 验收并修正小怪模型修复（`46362d7`，Quick AI 已提交） | 开发 AI + 用户 | ✅ 已验收（AG-01）并上线（AG-02） |
| — | 重新部署线上 | Antigravity | ✅ 已上线 `701860ff`（AG-05，含 AG-03 喷泉第二批、PR #2 金克丝重建、AG-05 金克丝补层）；PR #3 合并后需再部署一次 |
| — | 喷泉第二批：叠加贴图 + 剩余 Nova 层（清单见 `docs/audit/fountain_emitters_14.14.md` 4.3 节） | 开发 AI（Quick AI 审查） | ✅ 已完成（AG-03 `c38c792`）并上线（AG-05） |
| — | M5：三档画质验收 + 联机边界（`teammateVfxScale`、`players[]`） | 开发 AI（Quick AI 审查） | ⏳ 待用户确认开启 |
| GPT-05/06 | 登录首页、游客、邮箱账号授权及画质细节 | GPT（用户授权接手） | ✅ PR #7 已合并 `accf280`；构建、网关测试、数值回归通过；待线上绑定及真机验收，未部署；不等于完整 M5 |
| BAB-01 / GPT-09 | 全面迁移 Three.js → Babylon.js；WebGPU + WebGL2，一套渲染代码；[执行手册 B0–B7](handover/gpt/BABYLON_MIGRATION.md) | 任意能开发、编译、实机验证的 AI（领取留痕） | 🟡 用户已批准路线；文档完成，迁移尚未开始；保留 MU-01 线上，完成验收后用户确认发布 |
| GPT-10 | React + HeroUI v3 UI 并行开发（[PR #9](https://github.com/cianasa222/swarm-remake/pull/9)），Quick 并行准备 BAB-01 数据/资产，勿争用 UI 文件 | GPT（UI） | 🔄 独立分支 `gpt/gpt10-heroui`；构建/数值回归通过，浏览器待验，未合并/部署；按 2.3 分支独立同步 |
| GPT-11 | 每次代码提交立即双端交接、分支镜像隔离 | GPT（用户授权修改规范） | ✅ 规范更新；GPT-10 分支快照状态见 KV `pending_github_commits` |
| — | 补给箱经验/升级节奏核查 | GPT（后续单独处理） | ⏳ 用户要求暂缓；本轮不改战斗数值 |
| — | 自动部署 `wrangler.jsonc` + `preview` 分支 | 开发 AI + 用户 | ⏳ |
| — | 其余小项（清理 `lan.ts`/`buildWorld`、`compress_assets.mjs` 绝对路径） | 开发 AI | ⏳ 见 `QUICK_AI_HANDOVER.md` 第 2 节 |
| — | 网站下线交接文档、停用 `/__sync_kv`（QC-05） | Quick AI（用户要求） | ✅ 已完成 |
| — | 交接按 AI 分目录（`handover/<ai名>/`），新增交接总入口和 2.2 节规则（Q-11） | Quick AI（用户要求） | ✅ 已完成 |
| — | 线上版本 vs 14.14 全面审计（数值 ✅ Q-14；首领 ✅ Q-17 `docs/audit/boss_reksai_14.14.md`；音效已由 AG-08 接入原版，待审；武器特效 / 敌人模型 / 地图 / 界面 / 镜头待补） | Quick AI | 🔄 进行中 |
| — | 首领雷克塞按原版修复（Q-19 删自编招式和数值、Q-20 狂暴、Q-21 钻地 / 飞弹 / 隧道 / 登场、Q-22 特效与材质，资源见 Issue #4） | Quick AI 提交 → 开发 AI 验收 | ⏳ 待开始 |
| [#4](https://github.com/cianasa222/swarm-remake/issues/4) | 补原版缺失资源并补做对应层：金克丝 E/R 35 个贴图 / 网格；雷克塞 34 段动作、子网格核对、308 个特效资源、出场动画核对；**全游戏原版音效**（清单 `docs/tasks/missing_assets_14.14.md`） | 任意能做的 AI（Issue 评论领取） | 🔄 进行中：A 节核心金克丝层（AG-05）、**C 节第一关 93 条原版音效 + BGM（AG-08）**、**B1/B2 雷克塞 42 动作 + `Wrap/Plane` 子网格精准隐藏（AG-09，视觉审计 CLEAN PASS）** 均已合入 `main`；剩余 55 个雷克塞特效网格与 16 个补充小怪模型已在分支 [`asset/14.14-unpacked-assets-20261123`](../../tree/asset/14.14-unpacked-assets-20261123) (`4b1b5f7`) 待后续按需合入 |
| [PR #2](https://github.com/cianasa222/swarm-remake/pull/2) | 金克丝数值与特效按 14.14 原版重建（Q-13） | Quick AI 提交 → 开发 AI 验收 | ✅ 已合并（AG-04）并上线（AG-05） |
| [PR #3](https://github.com/cianasa222/swarm-remake/pull/3) | A 类数值对齐 14.14：武器射程、旋风切割器、耀光、首领 900 s、99 级经验表、补给箱、传送环（Q-15） | Quick AI 提交 → Antigravity 验收 | ✅ 已合并（AG-09 `c056396`，`build` + `playtest` 4/4 全胜），待部署 |

---

## 6. 已拉取的 14.14 参考数据（KV `ref/14.14/`）

| 文件 | 状态 |
| :--- | :--- |
| `data/maps/shipping/map33/map33.bin.json` | ✅ 7.1 MB |
| `data/maps/mapgeometry/map33/strawberry_animasquad_map1.materials.bin.json` | ✅ |
| `data/characters/strawberry_jinx/strawberry_jinx.bin.json`、`skins/skin0.bin.json` | ✅ |
| `data/characters/strawberry_boss_reksai/strawberry_boss_reksai.bin.json`、`skins/skin0.bin.json` | ✅ |
| `data/characters/strawberry_miniboss_bruiser/skins/skin0.bin.json` | ✅ |
| `data/characters/strawberry_enemy_hunter/skins/skin0.bin.json` | ⚠️ 仅 1.3 KB，疑似不完整 → 交给 #1 |
| `strawberry_enemy_pix` / `ghoul` / `dasher` 的 `skins/skin0.bin.json` | ❌ CommunityDragon 上 404 → 交给 #1 |
| 5 个喷泉 `.scb`（`Timer_02`、`Timer_Start_01`、`FlameMesh`、`Brand_Base_Ring`、`LightCylinder`） | ❌ CommunityDragon 上 404 → 交给 #1 |

---

## 7. 给执行 AI 的开场指令（用户复制粘贴即可）

```
你将作为「执行 AI」接手 GitHub 仓库 cianasa222/swarm-remake 的外包任务。

1. 先读交接总入口 handover/README.md，再按 COLLAB.md 第 0 节顺序读：COLLAB.md → handover/quick/HANDOVER.md → AGENTS.md → AI_HANDOVER.md 第 2.2 节 → Issue #1 正文和全部评论（以最新评论为准）。
   你的改动登记在 handover/<你的名字小写>/HANDOVER.md，并按 COLLAB.md 2.2 节同时更新 GitHub 和 KV（没有 Cloudflare 权限就在 KV 列写「待同步」）。
2. 在 Issue #1 下按 COLLAB.md 第 3 节的「领取」格式评论认领。
3. 从最新 main 新建分支 asset/14.14-wad-<今天日期>，只改 public/assets/、reference/14.14/ 和新增的 tools/ 脚本，不要改 src/。
4. 完成后本机跑 npm.cmd run build（退出码必须为 0），开 PR 合入 main：标题「[交付 #1] …」，描述首行写「Closes #1」，再贴 Issue 里的交付回执模板并填完。
5. 回到 Issue #1 评论「已交付：<PR 链接>」，然后停下，等 Quick AI 审核。审核意见在 PR 评论里，按意见修改即可。

遇到阻塞（下载失败、哈希无法解析、格式对不上）先在 Issue #1 评论说明，不要自行改动任务范围。
```


---

## 8. GPT 补充：按需获取资产与证据留痕（GPT · 2026-11-23）

用户要求：**只有缺什么资源才解包什么资源，现成且版本验证通过的优先**。先核对 main、KV、本机缓存、运行时资产及 Issue 最新评论；对缺口逐条查 14.14 直链，仍缺才依据实际 Windows 游戏清单精确下载所需 WAD 并选择性提取目标及依赖。后续版本只作补充或交叉验证，禁止无标记替换。资源溯源、音效事件映射、动画依赖及证据分级详见 [GPT 交接](handover/gpt/HANDOVER.md)。

协作补充建议（不改变现有分工）：部分交付不得关闭仍有子任务的 Issue；下载完不算功能已验收。遇 Issue 路径权限与功能接入要求冲突先明确范围。共享 KV 索引读改写可能竞态，写前后复核、避免并发写，只有全部已核验才宣布对应 commit 已同步。禁止把 403/404/未验证候选写成原版不存在，VFX 范围也不是已证实碰撞范围。规则审查详情及待协调项见 GPT 交接第 7 节。


### 8.1 统一资源渠道与否定结论规则（GPT-02，用户指示）

所有 AI 必须以 [统一资源渠道登记表](handover/gpt/RESOURCE_SOURCES.md) 为共同入口，已有渠道与网上新候选一并维护；不得凭个人经验、单个站点 404 或访问限制断言原版不存在。新增渠道、查证范围与结果须留痕；按需定向下载/解包。Map33 + 九英雄 WAD 的完整性须用实际 14.14 bankPath 与事件依赖验证。项目仅供朋友间私人非商业娱乐，原始资产保留私有环境。

### 8.2 GPT-07 · 备用资源保护与增量同步（用户要求，2026-11-23）

- [14.14 备用资产库动画清单](handover/gpt/ASSET_LIBRARY_14.14.md)：AG-06 备用分支禁止删除、覆盖、强推或按线上资源清单清理。未接入不等于无用。按需复用，缺失才定向解包。
- 同步前检查 `kv_only_pending`、`pending_branches`；即使 commit 一致也须核对独有更新。保留所有协作者的改动及 pending 原件，不整份覆盖。公开版本只同步必要技术内容，内部操作历史保留原处。
- Q-22/Q-23/Q-25/Q-27 优化已审查并上传 [PR #8](https://github.com/cianasa222/swarm-remake/pull/8)，build、playtest 4/4、21 组限帧测试通过；真机/GPU 待验收，未合并、未部署。见 [GPT-07 审查与待办](handover/gpt/QUICK_RENDER_REVIEW.md)。
- PERF-1 T2b：四个当前普通小怪零动作，先查备用库、已有解包，缺失动作再补导。16 个补充模型有 14 个带动画，避免重复提取。
- Q-24/Q-26：武器、敌人、地图环境缺层与待核验项见 [渲染待办](docs/tasks/render_perf.md)。
