# 协作与任务交接规范（COLLAB）

> 最后更新：2026-11-22（晚，补充第 2.1 节防冲突规则）· 维护者：AWS Quick（主线开发）
> 新加入的 AI / 开发者：先读本文件，再读 [`AGENTS.md`](./AGENTS.md)、[`PROGRESS.md`](./PROGRESS.md)、[`AI_HANDOVER.md`](./AI_HANDOVER.md)。

---

## 1. 角色分工

| 角色 | 负责 | 不负责 |
| :--- | :--- | :--- |
| **AWS Quick（主线）** | `src/` 代码开发（M5 及以后）、从 CommunityDragon 拉取并核对 14.14 配置 JSON、维护文档、GitHub → KV 同步、发布任务 Issue、审核 PR | 本机构建/截图、`.wad.client` 下载、lol2gltf 转换 |
| **执行 AI / 开发者（任务领取方）** | 领取带 `help wanted` 标签的 Issue：`.wad.client` 下载解包、`.scb` / lol2gltf 转换、本机 `build` / `playtest` / 截图验收 | 修改 `src/`（除非 Issue 明确允许） |
| **用户（项目负责人）** | 确认里程碑、合并 PR、部署 Cloudflare | — |

---

## 2. 数据源与同步规则

| 内容 | 权威来源 | 镜像 |
| :--- | :--- | :--- |
| 源码、配置、文档 | **GitHub `main` 分支** | Cloudflare KV `tideline-handover`（key 为仓库相对路径，原样存放） |
| 14.14 原版参考数据（`.bin.json`） | Cloudflare KV `ref/14.14/<CommunityDragon 相对路径>` | 不进公开仓库（版权） |
| 运行时资产（`.glb` / `.webp` / 特效 `.json`） | GitHub `public/assets/` | 线上 Worker `tideline-swarm` |
| 任务 | GitHub Issues（标签 `help wanted`） | — |

1. **所有改动先进 GitHub `main`**，可以直接提交，也可以合并 PR。
2. 每次 `main` 变更后，AWS Quick 把变更文件镜像到 KV，并更新 KV 里的 `SYNC_STATE.json`（记录 commit SHA、时间、文件列表）。**KV 与 GitHub 不一致时，一律以 GitHub `main` 为准。**
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
   - 只把 GitHub `main` 上**已经提交**的内容写进 KV：先从 GitHub 读回文件再写入，写完核对 SHA-256。
   - `FILE_INDEX.json` 和 `SYNC_STATE.json` 必须「读取 → 只改对应条目 → 写回」，**禁止整份替换**。
   - 发现 `FILE_INDEX.json` 条目数异常（明显少于 KV 实际 key 数），按 KV 实际 key 重建，并在 `SYNC_STATE.json` 的 `note` 里记一笔。
5. **发现冲突先停**：如果 GitHub 上最新提交不是你拉取时的那个，而且改的是同一个文件，先重新拉取、合并。拿不准怎么合并时，在对应 Issue 下评论或告诉用户，不要强行覆盖。
6. **不在 `main` 上 force push**，不删除别人创建的分支、Issue 或评论。

---

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
   - 合并后 AWS Quick 同步 KV，并更新 `PROGRESS.md` 和本文件的任务看板。

---

## 4. 硬性规则（违反即退回）

- 任务 PR 不得修改 `src/`，除非 Issue 明确允许。
- 不得提交 `.wad.client`、解包原始目录、未压缩的 `.glb`。`.glb` 必须先过 `node tools/compress_assets.mjs`（`dedup + quantize[排除 TEXCOORD_1] + meshopt`）。
- 单文件小于 25 MiB（Cloudflare 限制）。
- 新增的 `.scb` → JSON 必须与现有 `public/assets/map1/vfx/fountain_*.json` 格式一致。
- 所有资产版权归 Riot Games，仅作非商业开发参考。

---

## 5. 当前任务看板

| 编号 | 任务 | 执行者 | 状态 |
| :--- | :--- | :--- | :--- |
| [#1](../../issues/1) | 14.14 `.wad.client` 下载解包（**用 Windows 清单**，见 Issue 21:30 订正）+ 5 个 Nova 网格转 JSON + 15 张贴图（T4）+ 4 种小怪 `skin0.bin.json` | Muse（待领取） | 🟡 待领取 |
| — | 喷泉精修第一批：9 项不需要新资产的修复（`c63e871`） | AWS Quick | 🧪 已提交，待用户本机 build + 截图验收 |
| — | 小怪只剩影子：量化蒙皮模型烘焙修复（`46362d7`） | AWS Quick | 🧪 已提交，待用户本机验收 |
| — | 喷泉精修第二批：叠加贴图 + 剩余 Nova 层 | AWS Quick | ⏳ 等 #1 交付 |
| — | M5：低/中/高三档画质验收 + 联机边界（`teammateVfxScale`、`players[]`） | AWS Quick | ⏳ 待用户确认开启 |

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

1. 先按顺序读：COLLAB.md → AGENTS.md → AI_HANDOVER.md 第 2.2 节 → Issue #1 正文和全部评论（以最新评论为准）。
2. 在 Issue #1 下按 COLLAB.md 第 3 节的「领取」格式评论认领。
3. 从最新 main 新建分支 asset/14.14-wad-<今天日期>，只改 public/assets/、reference/14.14/ 和新增的 tools/ 脚本，不要改 src/。
4. 完成后本机跑 npm.cmd run build（退出码必须为 0），开 PR 合入 main：标题「[交付 #1] …」，描述首行写「Closes #1」，再贴 Issue 里的交付回执模板并填完。
5. 回到 Issue #1 评论「已交付：<PR 链接>」，然后停下，等 AWS Quick 审核。审核意见在 PR 评论里，按意见修改即可。

遇到阻塞（下载失败、哈希无法解析、格式对不上）先在 Issue #1 评论说明，不要自行改动任务范围。
```
