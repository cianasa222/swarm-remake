# GPT-23 · Babylon 全量迁移分工、资产缺口和 KV→GitHub 代传任务单
日期：2026-11-23（CST）· 状态：**可领取/可继续执行的任务清单**，不是其它 AI 已被远程启动的承诺。

## 权限与责任
- **Quick（KV-only）**：原版 14.14 VFX 数据、粒子/材质/网格运行器实现与静态测试；仅写 `pending/` 和自己的交接，不能访问 GitHub、执行仓库本地构建或部署。
- **Gemini（KV-only）**：B1/B2/B3 配置、状态机、GLB/动画与音频事件映射、缺失资产来源和降级逻辑；仅写 `pending/` 和自己的交接，不能在 GitHub 合并、不能替有权 AI 做真实设备/本地 Windows 解包。
- **GPT（当前 GitHub + Cloudflare 已连接）**：检查/修复 KV 提交的源码，按源 Manifest SHA-256 核验并上传 GitHub 独立草稿 PR，打通工程接口、CI、追踪 GitHub blob/文件清单与 Cloudflare KV 快照；不合并生产主线、不部署。
- **Antigravity（原主线 AI）**：适合 Babylon 实体/动作/材质/角色与原有 `src/sim/` 边界适配，须确认它在当前会话确实有本机/GitHub 权限后才能代传或执行；未自动通知。
- **Muse（曾执行解包和 Worker 发布）**：适合在有本机工具/授权情况下按 GM-12 清单定向解包/转换 SCB/SCO/SKN 和纹理；后续由 GPT 核对哈希并提交正式仓库。不得把原始 WAD/未经审查的受保护参考包直接推公开仓库。

## 最新已落 GitHub 的成果
| PR | 状态 | 说明 |
| --- | --- | --- |
| [#15](https://github.com/cianasa222/swarm-remake/pull/15) | 草稿/CI PASS | 新 UI、镜头、喷泉、157/903 数据、StarStrike 的整合基线；[PR #14](https://github.com/cianasa222/swarm-remake/pull/14) 为另一个待去重快照 |
| [#17](https://github.com/cianasa222/swarm-remake/pull/17) | 草稿/CI PASS | GM-09 B4 纯 TS 曲线/事件路由；**无实时特效绘制** |
| [#18](https://github.com/cianasa222/swarm-remake/pull/18) | 草稿/CI PASS | GM-11 `engine_boot.ts`、`scene_specs.ts`、4 组单测；**无真正 Babylon Engine/场景** |
| [#16](https://github.com/cianasa222/swarm-remake/pull/16) | 草稿/CI PASS | GM-07 音频限幅/解码队列/两个错音修复 |
| [#19](https://github.com/cianasa222/swarm-remake/pull/19) | 草稿/CI PASS | GM-10 音效映射和 23 个 Ogg blob，源自固定资产分支 `4b1b5f7c`；**事件接线尚需实现** |
| [#10](https://github.com/cianasa222/swarm-remake/pull/10) / [#11](https://github.com/cianasa222/swarm-remake/pull/11) | 草稿/CI PASS | 157 套 903 层 VFX 数据与 Q-30 StarStrike/14 WebP |

**继承关系：** #18、#17、#16 的 base 为 #15；#19 的 base 为 #16。后续须选择唯一集成候选，并按明确依赖关系组合，勿把各草稿直接无序合并到 `main`。

## 优先领取的 KV 代码任务
| 任务 | 执行角色 | 写入 KV 位置 | 最低交付与边界 |
| --- | --- | --- | --- |
| **GM-13 B1 真实 Babylon 适配器** | Gemini | `pending/bab01-b1-runtime-gemini/` | 基于 #18 `engine_boot.ts` 实现可接 `@babylonjs/core` `WebGPUEngine`/WebGL2 `Engine` 的生命周期适配、初始化失败回退、Canvas 占用、context loss、最小场景工厂与单元测试；不得声称实机已测 |
| **GM-14 B2/B3 地图与人物适配** | Gemini | `pending/bab01-b2-b3-gemini/` | 输出 GLB 地图/镜头/光照、金克丝12态/雷克塞17动作、敌群动画的可执行模块、材质/动画清单、测试。仅从 PR #15 / #18 的固定版本读契约，不复制旧 `src/main.ts` |
| **BAB-Q02 B4 绘制运行器** | Quick | `pending/bab01-b4-runtime-quick/` | 对接 #10 `effect_def.ts`、#17 `curve_eval/sim_to_vfx.ts`；输出 Particle/Mesh/Material/UV/child emitter 运行器、生命周期、特效分层/预算、敌方预警安全降级与单测，记录无法模拟的原版字段；不得改 `src/sim/`、UI、账号 |
| **GM-15 资源定位与降级表** | Gemini | `pending/bab01-assets-gemini/` + `handover/gemini/` | 按 GM-12 44 个路径 P0=15/P1=8/P2=10/P3=11 与已有资产分支对照，逐项记录来源/哈希/可否定向提取/所属系统/占位是否安全；确定需要通过 `inbox/` 向授权 AI 请求哪些 manifest、路径索引，不复制 WAD |
| **音频事件接线** | Gemini（映射/测试）→ GPT（合并） | `pending/audio-uia-wiring-gemini/` | 在 GM-07/#16 与 GM-10/#19 之上接入武器/敌人死亡/补给箱事件；清楚区分 23 Ogg 已入草稿与 110 iOS M4A 尚缺，保持 React/UI |
| **B5 预算与性能** | Quick（策略）→ GPT/Antigravity（运行接入） | `pending/bab01-perf-quick/` | WebGL2/WebGPU 画质梯度、实例/DrawCalls、阴影/粒子、队友特效削减；不得剔除敌方关键提示；先做自动化测试，真机后置 |

以上为**任务建议和共享交接信息**，不是已向 Quick/Gemini 触发异步执行；它们读取本文件后应在各自 KV 交接登记领取状态、文件清单及完成标准。各 AI 避免改对方命名空间。

## 按需补齐的资产（核对现有 GitHub 分支后）
1. **已经代传**：GM-10 最小 23 个原版 Ogg **全部存在**于资产分支，已按原 Git blob（共 399,148 字节）安全加入草稿 PR #19，不需要再转存二进制到 KV。GM-07 仍缺 **110 条 iOS M4A**，代码优先阶段不阻塞；正式 iOS 音频验收前须合规转码和测试。
2. **需定向解包**：GM-12 统计 **44 个未找到的网格**（40 SCB/3 SCO/1 SKN），P0=15 核心武器、P1=8 掉落/补给、P2=10 Boss/精英、P3=11 暂缓。Gemini 优先确认文件路径与已有备用资产；Muse/具 Windows 工具的 AI 定向提取和转换，GPT 再审查后按需提交。这 44 个不要求在 B1 启动前全部完成。
3. **已有备用但未完全接入**：资产备用分支有 25 个 GLB，对比当前 `main` 的 9 个，差额 16 个；须按敌人/首领/动作实际需求选择，不能全量盲目复制。备用库有 736 条 Ogg、主线 110，按事件最小子集补。
4. **贴图及 HUD**：GM-04 的 14.14 纹理映射中有较多只验证 CDN 未进入运行仓库的贴图；应优先确认 B4 实际引用后拉取、压缩、记录原版来源和哈希。GM-06 的 48 个 HUD 逻辑图对应 **13 张直接图集 + 7 张母图**，已验证源站，不代表已经接入 React。
5. **StarStrike 特效网格身份和原版表现**仍待证据核查；先确保粒子可绘制，真实性标定后置，暂不用错误别的英雄模型替代且声称原版。

## 强制的资产与代码中转操作规程（所有 AI）
1. **KV-only AI 提交代码**：写 `pending/<ai任务>/` 下源码、测试、`README.md`、`MANIFEST.json`（文件名、目标 GitHub 路径、SHA-256、大小、依赖、是否已通过静态测试），在 `SYNC_STATE.json` 登记待代传。不允许用旧代码全文件覆盖新版本。
2. **KV-only AI 需 GitHub/备用资产信息**：先申请 `inbox/<接收AI>/<任务>/<文件名>`，说明源固定分支/SHA/路径/内容为何必要。有权限者从已授权源提取所需 JSON、配置、子网格/动画索引到 `inbox/` 并 SHA-256 读回；**二进制大文件和 WAD 优先在 GitHub/私有原始库保管，不随意上传 KV**。
3. **GPT 等有权 AI 代传**：先对比 GitHub 主线/整合分支是否已有相同 SHA，保留新旧差异；验证源内容哈希、兼容性与许可证/可公开边界；将源码或经批准可公开的转换资源上传**独立草稿 PR**，运行 `tsc`、build、回归及文件头/哈希门禁。禁止未经审查直接合并 `main`。
4. **同步凭证**：使用不可变 `pending/github/<branch>/<commit>/` 记录本轮**文本源码快照**、Git blob SHA、SHA-256、Manifest；OGG/WebP/GLB 可以只记 GitHub blob SHA 和固定源 commit，不能谎称二进制也在 KV。使用批量写入，但批量 N Key 仍计 N 次 KV 写操作；将记录增量写入 `SYNC_STATE.pending_github_commits`、`FILE_INDEX.json`，写后批量读回。
5. **严格清理范围**：`inbox/` 仅在目标 AI 确认消费并记录后精确清理；`pending/` 原始代码待整个合并/部署/验收/可恢复门禁满足才可按规则清理。所有原版 WAD/BIN、历史资产和旧 PR 不作破坏性删除；`SYNC_STATE.commit` 只有主线全量镜像核验通过时才能推进。

## 完整迁移剩余代码闭环
B1 真正启动 Scene → B2 地图/材质/相机 → B3 角色/敌人/弹道/动画 → B4 数据驱动的可见 VFX → B5 画质与性能 → B6 自动化整局测试（iPhone/原版视频集中后置）→ B7 经用户批准后唯一 Babylon 运行包、保留旧 Three.js 回滚路径和生产部署。**目前仍未达到 B7。**
