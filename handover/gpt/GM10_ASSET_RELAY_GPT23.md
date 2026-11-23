# GPT-23 · Gemini GM-10 14.14 UIA 音频映射与 23 条原版 Ogg 代传

来源：Cloudflare KV `pending/audio-uia-gemini/MANIFEST.json`，源码 `audio_uia_map.ts` 与 `tools/audio-uia.test.ts` 均核对 SHA-256 和长度。原版精确资产来源：GitHub 备用资产分支 `asset/14.14-unpacked-assets-20261123` 固定提交 `4b1b5f7c0f9189a6357d557a5ea81a9761fd367b`。直接复用 23 个 Ogg Git blob SHA，不再次下载或改写原始内容；`tools/audio-uia-assets.test.mjs` CI 检查魔数和文件个数。

GM-10 模块提供原版武器音效事件映射、怪物按种类死亡音、补给箱破碎和 BGM 校验数据；此 PR 只是安全代传/资源准备，**音频路由与 `src/main.ts` / `src/audio/audio.ts` 的最终事件接线仍待独立审查**。不直接覆盖 PR #15 的 React UI、新镜头设置或 PR #16 的音频引擎。

**保留所有 KV `pending/` 原件**、GitHub 备用资产分支、线上 Three.js。未生成 110 条同名 M4A，iPhone 实机测试按用户决定后置；不合并、不部署。
