# GPT-19 · 多 AI 已有源码整合与非部署双端备份

日期：2026-11-23（CST）。唯一整合 PR：[PR #15](https://github.com/cianasa222/swarm-remake/pull/15)，分支 `gpt/gpt19-code-integration`，首个源码整合提交 `9082e648876b5844d8b5adae61ff706aa0fb258b`，基线 `cf9b707b050bca9bae3cd6c8853a8d386e905b17`。

## 目标及保护
用户要求检查修复**已上传代码**，完整上传 GitHub 和 Cloudflare，但**明确不部署**。保持主线 `main`、生产 Worker `tideline-swarm`、原账号 Worker、生产路由、原始 KV `pending/`、其他 AI 分支及资产分支不变。不得把草稿 PR 当已发布、不得提前关闭被引用 PR。

## 完整代码整合（基于 GitHub 原始 blob，而非仅复制摘要）
- PR #5 GPT-03：将双纹理贴花 shader 从 `max(alpha, RGB)` 改为纹理各自 alpha 轮廓，不带入过时文档；真机喷泉同机位验收待做。
- PR #6 GPT-04：保留手机横屏镜头 `max(.66,min(1,1.95/aspect))`、镜头高度五档（80/90/100/115/130%）及 `tideline_camera_height` 偏好，**适配 PR #9 的 React 设置组件**，没有把旧 HTML 设置下拉框覆盖新 UI；保留移动端紧凑升级卡样式。
- PR #9 GPT-10：React/HeroUI 登录、设置与升级选择相关代码、依赖锁文件和验证脚本整体引用原始 Git blob；保留当前同源网关及游客流程；账号真实服务绑定与 iPhone 待验。
- PR #10 BAB-Q01 + GM-02/03：源码、157 系统/903 层数据、26 `attachedMesh` 映射、B0/B4 文档与测试，保留其最新修复版而非重复的 PR #12/#13。
- PR #11 Q-30：StarStrike VFX 源码、4 套/21 层、14 张 WebP、SHA256SUMS、数值/资源检查脚本完整 Git blob。原始单次导入 workflow 不复制到整合分支，以免重复触发资产上传。
- TypeScript 配置保留 React JSX/Node 类型，并遵从数据 PR 的 `include: ["src"]`（测试由 workflow 显式执行），避免不同 PR 的 `tsconfig` 相互覆盖。

## 验证与未完
- 首个整合 commit `9082e648` 的 GitHub Actions `Review checks` **success**：`npm ci`、`npm run build`、Babylon 数据测试、Q30 数值测试及 14 张贴图检查（以 workflow 具体命令为准）。
- 自动检查通过不代表原版 14.14 视觉还原、真实邮箱登录、iPhone FPS/交互或 Babylon B1-B7 完成。
- PR #15 为草稿，**不得合并和部署**，待原版/实机验收；PR #5/#6/#9/#10/#11 原始分支均保留以便比对。
- Cloudflare KV 快照按 COLLAB 2.3 使用 `pending/github/gpt/gpt19-code-integration/<SHA>/`，文本源码完整备份，二进制资源沿用 GitHub blob + SHA/路径清单；历史 Quick/Gemini 独有 KV 不覆盖。同步以 KV manifest 读回及 `SYNC_STATE.json.pending_github_commits` 为准。
- Cloudflare Worker **无部署动作**，既有版本维持 `5955ad9a`（部署 `f94499ee`，记录的已上线基线，非本次新验证）。

## Cloudflare 完整文本快照与代码资产恢复清单（2026-11-23）

- 完整文本/源码/配置/交接：**147 文件、6,558,211 字节**，写入 Cloudflare KV `tideline-handover` 的 `pending/github/gpt/gpt19-code-integration/037a152fcce6bd9bc5e0e1766401998feee18686/`。逐一 `GET` 读回，并对每项校验 Git blob SHA-1 与 SHA-256，147/147 **PASS**。
- 其他**392 个二进制资源、49,944,910 字节**：保持 GitHub 原仓库和版本固定 blob，KV MANIFEST 记录路径/大小/Git SHA；未复制二进制至 KV（遵守 COLLAB 2.3）。不把其称为 KV 内的实物。
- `MANIFEST.json` 列出仓库全部 **539 个 Git 文件**及如何恢复；Cloudflare `FILE_INDEX.json` 新增 148 条（含 manifest），读回后共 418 条；`SYNC_STATE.json.pending_github_commits['gpt/gpt19-code-integration']` 已登记，保留原有 8 组条目及 `kv_only_pending`、`pending_branches`。
- 同步操作**未改**全局 `SYNC_STATE.commit`（该字段代表旧主线镜像，仍为 `bd8a87b6`），没有把未合并分支当正式主线。
- Cloudflare Worker 部署只读核查：`tideline-swarm` 仍部署 `f94499ee`，版本 `5955ad9a` 流量 100%。本次只使用 KV 数据存储，不上传/部署 Worker。
- 本次另在整合分支增强 GitHub Actions 游戏数值/认证/帧率/精英音频回归门禁；以最新提交 GitHub Actions 结果作为最终 CI 判断，不能沿用上一提交的 PASS 证明新提交。

## CI 修复：Node 导入资源加载器的 Vite 环境兼容

在强化回归门禁后，`tools/q28-regression.test.ts` 引入 `src/render/assets.ts`，直接访问 `import.meta.env.VITE_ASSET_BASE_URL` 在非 Vite Node/tsx 环境中抛出 `TypeError`。该错误是测试模块初始化的兼容性缺陷，不是游戏数值/性能回归。修复为 `import.meta.env?.VITE_ASSET_BASE_URL`：Vite 生产资源路径维持原语义；Node 未注入时回退 `.`。原失败 CI 已记录，不伪称通过；修复后须重跑全部检查并记录新的提交号。
