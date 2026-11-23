# GPT-23 · Gemini GM-11 B1/B2/B3 KV 代传记录

来源：Cloudflare KV `pending/bab01-b1-b3-gemini/MANIFEST.json`，原 Gemini GM-11 模块三件套逐一按 Manifest SHA-256 与字节数校验，Git Blob 保存于本草稿 PR。

- `engine_boot.ts` 是零 Babylon 依赖的抽象 WebGPU/WebGL2 启动策略、硬件缩放、上下文丢失守卫；**不等于实际已启动 Babylon Engine**。
- `scene_specs.ts` 是地图光照、镜头、金克丝/雷克塞动画状态及子网格规则；**不等于 B2/B3 模型、贴图、骨骼已接入**。
- `b1_b3_foundation.test.ts` 的 4 组测试被加入 GitHub Actions，CI 跟随 `npm ci` 和 `npm run build`。
- 以 [PR #15](https://github.com/cianasa222/swarm-remake/pull/15) 为 base，避免重复复制现有 157/903 数据、新 UI 和 StarStrike；**不合并 main，不部署 Cloudflare Worker**。
- 下一个必要工作：在单独的 Babylon runtime 开发 PR 中安装 `@babylonjs/core` 与 loaders，建立 Babylon Engine/Scene、GLB 地图装载和实际渲染循环；仅本 PR 的纯 TS 代码通过测试不是迁移完成。
- 原始 `pending/bab01-b1-b3-gemini/` 与参考/历史 KV 保留；全局 `SYNC_STATE.commit` 不推进。
