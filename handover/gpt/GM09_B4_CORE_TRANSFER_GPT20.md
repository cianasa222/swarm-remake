# GPT-20 · GM-09 Babylon B4 纯 TS 核心代传审核

日期：2026-11-23 CST。原始内容来自 Cloudflare KV `pending/bab01-b4-core-gemini/`（`GM-09`），原件包含 `README.md`、`curve_eval.ts`、`sim_to_vfx.ts`、`b4_core.test.ts`。不复制该 KV README 到根 README。

## 集成基准
由于 `main` 不含尚未合并的 PR #10 Babylon 数据，GM-09 应先叠加到已整合数据的 [PR #15](https://github.com/cianasa222/swarm-remake/pull/15)（`gpt/gpt19-code-integration`），避免独立 PR 因不存在 `effect_def.ts` 和 VFX JSON 无法构建。原始 [PR #10](https://github.com/cianasa222/swarm-remake/pull/10) 与其他分支均保留。

## 审查和提交内容
- `src/render-babylon/vfx/curve_eval.ts`：关键帧、概率随机、Vec2/Vec3/Color、积分、Flex、统一单位换算和重要级预算；
- `src/render-babylon/vfx/sim_to_vfx.ts`：将模拟层事件解析为确定的 14.14 effect ID + 位置、owner、importance；无 Three.js、Babylon.js 和 DOM 依赖，不改 `src/sim/`；
- `tools/bab/b4_core.test.ts`：四组测试，含对 157 套 EffectDef 数据集所有引用 ID 的静态校验，以及敌方预警与低画质不能被错误过滤的约束；
- 工作流追加 B4 测试步，保持项目原 CI 流程，不增加任何部署动作。

## 门禁
自动编译与单元测试成功只是纯 TS B4 数据和事件路由的基础验收，不表示 Babylon B1-B7 运行器、原版画面/SCB 对照、WebGPU 或 iPhone GPU 真实完成。PR 必须保持草稿，禁止合并到生产 `main` 或触发 Cloudflare Workers 部署。

## KV 保留
遵守 `COLLAB.md` 2.2–2.4：提交 GitHub 后为精确 Commit 新建独立 `pending/github/` 文件快照、Git SHA/256 Manifest；`SYNC_STATE.json.pending_github_commits` 只新增本任务，保留 Quick/Gemini 原始 `pending/`、`inbox/`、参考资产和 `kv_only_pending`；不推进全局 `SYNC_STATE.commit`。未经用户确认及终端实机验收不清理任何历史。
