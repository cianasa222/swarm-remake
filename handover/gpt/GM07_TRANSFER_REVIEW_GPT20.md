# GPT-20 / GM-07 音频代码代传、审核及 Cloudflare 中转规则

日期：2026-11-23（CST）。来源：Gemini GM-07 临时工作区 `pending/audio-fix-gemini/`，由 GPT 代传代码。后续以本文件和 GitHub PR 的真实 SHA 为准。

## 为什么使用叠加 PR
`main` 仍保留 Three.js 稳定版本；[PR #15](https://github.com/cianasa222/swarm-remake/pull/15) 已集成 PR #5/#6/#9/#10/#11 的 UI、镜头、Babylon 数据及 StarStrike。为了不覆盖 React 入口与改过的设置，GM-07 从 **PR #15 最新提交作为基线**另开草稿 PR，PR 目标是 `gpt/gpt19-code-integration`，而非立即改 `main`。待设备验收和缺失 AAC 资源补齐后逐级整合。

## 本次代传审查
1. 将 GM-07 `pending/audio-fix-gemini/src/audio/audio.ts` 完整按 SHA 原件上传：预载四并发队列、SFX 并发控制与限幅器、SFX/BGM 双通道、防削波、Ogg/M4A 候选、WebAudio 节点完成释放。
2. 不采用旧 `pending/audio-fix-gemini/src/main.ts` 覆盖新入口，只精确移植两处事件：`ult_r` 使用正确大爆炸音效；`card` 拾取不再重复播放升级音效（升级事件另行处理）。
3. 把 Gemini 的 `handover/gemini/AUDIO_FIX_TRANSFER_LIST_GM07.md` **原样**收入代码分支，保留版权标记与转码要求。
4. PR 包含不执行上线的构建、playtest、认证网关、数值/渲染及资源检测工作流。通过 CI 仅表明代码构建/静态回归通过，音频听感和真机仍待验。
5. **剩余阻塞**：110 条原始 Ogg 同名 AAC `.m4a` 尚未产生、校验或上传；因此 iPhone Safari 回退音效**未验收**。需使用 ffmpeg 按 Gemini 文档转码且保留 Ogg 原件，听测 iPhone Safari 与 Chrome，核查浏览器自动播放约束、音频延迟与并发失真。
6. 禁止在没有对应文件时宣称 iOS 原版音频已可用；不得将 Gemini 的旧版 `src/main.ts` 整份覆盖已集成 React UI、相机设置与 Babylon 数据；不修改 `src/sim/`。

## Cloudflare KV 文本与任务规则（规范补充）
- `pending/<ai>/<task>/`：**正式待代传代码**，在 GitHub 文件提交、固定 SHA 对比、CI 和实际验收前不得删除；逐任务合入，不整份覆盖。
- `inbox/<receiver_ai>/<task>/<filename>`：**只作临时只读传输**，用途限定到指定接收 AI；须先在 `SYNC_STATE.json.kv_inbox` 登记请求、原始分支、源路径、目标 Key，再按源 Git blob SHA 验证写入，附 SHA-256、长度和读回结果。只有接收方已读、将发现写进其交接文件并明确标记 `consumed` 后，才可精确删除列明的 `inbox` Key，不得触及 `pending/`、`ref/14.14/` 或他人中转项。
- `pending/github/<ai>/<branch>/<commit>/`：**每个 GitHub 提交独立不可变快照**，优先完整文本 + `MANIFEST.json`（每项 Git blob SHA、SHA-256、长度和来源）；压缩/GLB/WebP 等二进制可以仅保留 GitHub blob SHA 和 Git 历史来源，禁止谎称已写进 KV。Commit 新建快照，绝不复用/覆盖旧 SHA。
- `SYNC_STATE.json.pending_github_commits` 和 `FILE_INDEX.json`：写前读取原件、增量合并，写后读回并校验；保留 Quick/Gemini 的 `kv_only_pending` / `pending_branches` 和旧整合 PR #14/#15；GitHub 分支镜像**不改变**全局 `SYNC_STATE.commit`（只有 `main` 全量镜像正确时才更新）。
- PR 关闭、CI 通过和 Worker 部署是互不替代的事件；未完成原版画面和 iPhone 实机时保持草稿且不部署。

## Gemini 请求的音频事件索引已提供
`inbox/gemini/audio-fix/global_events.json` 以及 `inbox/gemini/audio-fix/music_events.json` 已从 GitHub 资产备用分支 `asset/14.14-unpacked-assets-20261123` 读取，写入 KV 后 SHA-256 读回匹配，`SYNC_STATE.json.kv_inbox['gemini/audio-fix'].status=uploaded_for_gemini`；仍由 Gemini 阅读后登记消费，**不可提前删除**。

## 未完成/保护
- 原始 PR #5/#6/#9/#10/#11、PR #14/#15、Quick/Gemini KV、asset 分支和原版解包文件均保留。
- 未修改 `main`，未上传任何 Worker 版本或执行部署。
