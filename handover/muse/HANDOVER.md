# Muse 交接（执行 AI）

> 角色：执行 Issue #1（解包、转换、贴图）；生产部署（用户直接授权）。
> 编号前缀：`MU-`（2026-11-23 在 `handover/README.md` 第 3 节登记）。
> 部署方式：Wrangler CLI（`CLOUDFLARE_API_TOKEN` 由 Cloudflare 连接器动态凭证提供，`wrangler whoami` 已验证；不在聊天或公开仓库存 token）。

## 改动索引

| 编号 | 时间（CST） | 提交 | 文件（+增/−删） | 改了什么 | 验收 | 部署 | KV |
|---|---|---|---|---|---|---|---|
| MU-01 | 2026-11-23 06:40 | `5e92b91` | `handover/muse/HANDOVER.md`（新建）；`handover/README.md`（合并 KV 新版 + GitHub GPT-08 行 + Muse 行 + §5 线上版本） | 按 `handover/gpt/DEPLOYMENT_GPT08.md` 部署 PR #8（main `6962303`）到生产 Worker `tideline-swarm`；登记实际版本号；合并 README 时保留 Quick AI 的 KV 独有内容（`kv_only_pending`、`pending/` 均未动） | 构建：vite 构建通过；网关测试 4/4；playtest 4/4 全胜；dist 415 文件 / 51 MiB / 最大 13.24 MiB / 无交接文件。线上：首页 200（主域 + workers.dev）、匿名 session `{"accountId":null}`、跨域 POST 403、错误方法 405、profile/save 404、抽查资源 200、交接文档 410 | ✅ 已上线：Version `5955ad9a-6fa9-4355-9f7c-12672c9d0c78`，Deployment `f94499ee-a2a9-486e-a8ee-4c8087ebf9b3`，100% 流量；旧版 `7d862759`（deployment `44d8772f`）保留可回退 | 已同步（本轮） |

## 本轮部署详情（MU-01）

- **部署对象**：GitHub `main` `6962303`（`[GPT-08]`，含 PR #8 合并 `797ef1d` + 部署交接文档）。PR #8 head `b688d0f`。
- **授权通道**：GPT-08 交接里写的阻塞（无 Wrangler 授权、连接器无自定义 Authorization 能力）已解决——Wrangler 用连接器的 API token（动态凭证替身）可直接认证，`wrangler whoami` 识别为 `1515875225@qq.com's Account`（`63223f83…`）；静态资源上传由 Wrangler 自行建上传会话，不需要连接器拼 JWT。
- **构建**：`npm ci` → `npm run build` 的 `tsc --noEmit` 在干净拉取下失败（见下“已知问题”）；`npx vite build` 通过（6.75s，38 模块）；`node --test tools/auth-gateway.test.mjs` 4/4；`node --import tsx tools/playtest.ts 2 0.85` 4/4 全胜；dist 415 文件 / 51 MiB，最大单文件 `warehouse_map1.glb` 13.24 MiB（< 25 MiB），无交接文件。
- **发布**：`npx wrangler deploy --dry-run --config wrangler.jsonc` 核对绑定（`ACCOUNT_AUTH → trash-simulator-auth`、`ASSETS`）后正式发布；上传 141 个新/改资产（273 个已存在，复用）；Worker 与触发器已更新（主域 `swarm.cianasa888.cfd` + workers.dev）。
- **分支与 KV 保护**：未删除任何分支（`asset/14.14-unpacked-assets-20261123` 等均保留）；KV 只做增量——只写 `handover/muse/HANDOVER.md`、`handover/README.md`（合并版）并更新 `SYNC_STATE.json` 的 `live_deployment` / `gpt08_release` / 相关 `sha256` 条目与 `FILE_INDEX.json`；`kv_only_pending`、`pending_branches`、`pending/` 原样保留；`SYNC_STATE.commit` 按原注未动（等 Quick pending 文档 reconciled 后再动）。

## 已知问题（不阻塞本次上线）

1. **`npm run build` 的 tsc 步骤在干净拉取下仍失败**：`tools/q28-regression.test.ts` 的 `node:assert/strict`、`node:fs` 报 TS2591（缺 Node 类型）。已试 `npm install --save-dev @types/node`（本地，未提交）——**没修好**，因为 `tsconfig.json` 的 `"types": ["vite/client"]` 把 `node` 排除在外，tsc 报错本身也提示要再加 `"node"` 到 `types` 字段。报错只影响测试文件的类型检查，**不影响上线包**（vite 构建、网关测试、playtest 全过，dist 与交接文档的 415 文件 / 51 MiB 一致）。后续修法：`tsconfig.json` 的 `types` 加 `"node"`（一行），或把该测试文件移出 `tsc --noEmit` 的检查范围；修好后请回归一次 `npm run build`。
2. **真机视听验收待完成**（交接第 4 步）：桌面 1280×800、iPhone 横/竖屏、帧率与 GPU VAT / 精英动画 / 耀光力场、战兔巨爆、九武器原版音频——需用户或有真机的 AI 实测，本轮未做。
3. **Quick AI 的 KV 独有改动尚未完全 reconciled**：`kv_only_pending`（Q-22 至 Q-29、QC-07 至 QC-15）与 `pending/q22/`–`pending/q28/` 仍只在 KV；本轮只合并了 `handover/README.md` 这一份。完整上传 GitHub + 开 PR 验收仍待有 GitHub 权限的 AI 按 `pending/q22/README.md` 步骤做；注意 QC-15 警告（Q-25/Q-28 里战兔巨爆颜色改动基于错的 Nuke 源，不要合入）。

## 剩余工作

- 真机视听验收（上条第 2 项），用户或 Antigravity 做。
- tsc 报错根治（上条第 1 项），一行 tsconfig 改动 + 回归构建。
- Quick pending 全量 reconciled（上条第 3 项）。
- Issue #1 待领取（原定任务：WAD 解包、转换、贴图；按 COLLAB §0 顺序读交接后再领）。
