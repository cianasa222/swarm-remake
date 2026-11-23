# GPT-19 · 已上传代码的无损集成与双端交接（2026-11-23）

## 目标与边界
按照用户要求，核查并修复 PR #5/#6 的过时分支与 UI 冲突，将已在 GitHub 的功能形成**可恢复的单一候选源码树**；GitHub 上传与 Cloudflare KV 镜像是备份，绝不是 Worker 部署。主线 `main` 与在线 Worker `tideline-swarm` 保持不变。

## 可复现来源（全部已有 GitHub 固定快照）
- 主线基准：`cf9b707b050bca9bae3cd6c8853a8d386e905b17`（10 个新增主线提交均为文档变更，不篡改功能基线）。
- React / HeroUI 登录、设置、升级卡：PR #9，`012f85a51a6e00c66428c2953e6d6e81280e8aef`；保留完整 package-lock、前端入口、组件、CSS、原版图标、同源账号 API。
- Babylon 数据和 RenderPort：PR #10，`77c25a3583056f01cbf078beb6b84d8eb48135b2`；157 VFX / 903 层、26 条 attachedMesh、修复 QC-19、附测试；B1/B4 运行器仍未完成。
- StarStrike 原版特效与 14 张 WebP：PR #11，`bc44bc1d53a2f727da70e58e571992aaa555d501`；保留 SHA256SUMS.txt、校验脚本、资源来源；原始 SCB / 实机仍待验。
- 旧分支 PR #5（`051dfd5c`）：仅移植经审查的 shader Alpha 覆盖率修正到最新 `src/render/map_warehouse.ts`，不回退其旧交接文档。
- 旧分支 PR #6（`e0e8fd3`）：仅移植手机宽屏镜头补偿 + 五档相机高度持久化；设置入口适配 PR #9 React 面板，**不拷贝过时的纯 HTML 选项**；升级卡紧凑布局采用 PR #9 已实现的响应式布局。

## 冲突与修复策略
1. 保留 PR #9 的 React `src/main.ts`、`src/entry.ts` 与组件；在 `SettingsState/SettingsActions` 中增加可操作、同步显示的五档相机高度，确保开始页和暂停页都能调整、存储和恢复。
2. `renderer.ts` 统一接入移动端横屏的可视范围补偿，`camTargetOverride` 和 closeup 不采用用户倍率；不改变 FOV、伤害、经验或刷怪配置。
3. `tsconfig.json` 保留 React JSX/Node 类型，同时将项目常规构建范围限定为 `src`；工具测试由 CI 显式运行，以兼容 BAB-Q01/Q30 的测试工具。
4. `.github/workflows/review-checks.yml` 汇总 JS/TS 构建、4 局回归、账号网关、Babylon 数据与 StarStrike 资产校验，**无任何部署步骤**。
5. PR #10 与 PR #11 相同路径以当前最新已审查 Blob 内容为准；共享主线交接文档只增量更新 GPT 行，保留 Quick/Gemini 独有信息。
6. 原始 PR #5/#6/#9/#10/#11、KV `pending/`、历史快照、版权参考数据与资产分支全部保留，无强制合并、无清理。

## 验收层次
- 已做：比较全部源 PR 变更路径、三方文件冲突范围、保留原版贴图 Git blob 并写独立候选。
- 待 GitHub Actions：`npm ci`、`npm run build`、`npm run playtest -- 2 0.85`、账号网关、BAB-Q01 数据和 Q30/14 WebP 测试。
- 待真实设备：iPhone 横竖屏镜头和升级卡/设置、真实邮箱登录、原版 HUD/喷泉/StarStrike 录像对照；Babylon B1-B7 另行开发验收。
- **未声称**编译通过、全部缺陷修复、1:1 原版复刻、完成合并或部署。必须在 CI 通过并完成必要的视觉与真机验收之后，才能决定是否逐项合并。

## Cloudflare KV
按 `COLLAB.md` 2.3 使用新不可变 `pending/github/gpt/gpt19-integration-snapshot/<commit>/` 前缀和 MANIFEST；复用已经在 KV 独立快照中的原始 PR 文件时须登记来源哈希与 Git blob，不覆写既有内容。只写备份数据与索引，不触发 Workers 版本上传或部署。不得推进全局 `SYNC_STATE.commit`，除非主线全量核验一致。
