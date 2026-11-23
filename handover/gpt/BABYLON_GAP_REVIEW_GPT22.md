# GPT-22｜Babylon B0–B7 最新进度、缺口与代码优先执行单

> 日期：2026-11-23 21:02 CST。依据 GitHub main `c3150682`、草稿 PR #9/#10/#11/#14/#15/#16/#17，以及 Cloudflare KV 的 GM-05/06/09/10/11/12 文档、Manifest 与 `SYNC_STATE.json`。本报告是**代码交接审查**，不是渲染引擎已完成的证明。

## 用户最新决策（必须遵守）
当前阶段 **先打通代码、类型、构建、单测与 CI，暂缓 iPhone/真实设备验收**。这是 Gemini GM-10 写入 `COLLAB.md` 2.6 的用户 20:25 决定。真实设备和原版逐帧核对后移到完整运行之后、正式切流之前。此阶段继续开发不要求先完成所有 44 个缺失网格。临时 `inbox/` 只可按 2.5 在消费记录完成后精确删除；`pending/` 原始源码仍由 2.4 保护。

## 最新的真实代码位置
| 来源 | 内容 | 当前状态 |
| --- | --- | --- |
| `main` | 旧 Three.js 可运行基线、现有 sim、登录/账号网关/音频 | 权威主线；非 Babylon 新版 |
| [PR #10](https://github.com/cianasa222/swarm-remake/pull/10) | BAB-Q01 原版 VFX 157 系统/903 层、26 个 attachedMesh 绑定 | 数据测试通过，草稿；**不是 B4 运行器** |
| [PR #11](https://github.com/cianasa222/swarm-remake/pull/11) | Q-30 StarStrike 4 系统/21 层、14 张 WebP | 资源与数值 CI 通过，待实际运行 |
| [PR #14](https://github.com/cianasa222/swarm-remake/pull/14) | UI+数据+StarStrike 一份整合快照 | 草稿，须与 #15 逐文件去重 |
| [PR #15](https://github.com/cianasa222/swarm-remake/pull/15) | React UI/镜头/喷泉+Babylon 数据+StarStrike 统一代码候选 | 当前建议作为 B1–B4 集成基底，草稿/未合并/未部署；注意验证 #14 独有内容 |
| [PR #16](https://github.com/cianasa222/swarm-remake/pull/16) | GM-07 音效限幅、解码队列、Ogg→M4A 选择及错音修复 | CI PASS；缺 110 条转码 M4A，真机后置 |
| [PR #17](https://github.com/cianasa222/swarm-remake/pull/17) | GM-09 纯 TS `curve_eval.ts`、`sim_to_vfx.ts` + 4 组测试 | CI PASS；并未实现 Babylon 绘制 |
| **KV `pending/bab01-b1-b3-gemini/`** | GM-11 B1 双后端初始化/上下文守卫、B2 光照镜头规格、B3 金克丝 12 态/雷克塞 17 剪辑/Wrap-Plane 规则 | **尚未代传 GitHub**；tsc strict/4 测试 PASS |
| **KV `pending/audio-uia-gemini/`** | GM-10 音频事件扩展、按怪种死亡音、补给箱破碎及 3 组测试 | **尚未代传 GitHub**；tsc strict/3 测试 PASS |
| **KV `handover/gemini/MISSING_MESHES_PRIORITY_GM12.md`** | 44 缺失网格：P0 15、P1 8、P2 10、P3 11（40 SCB、3 SCO、1 SKN） | 已有精确原版路径；按需解包，不阻塞最小引擎运行 |

## B0–B7 缺口诊断
| 阶段 | 已有资产/逻辑 | 目前真正缺的工程 |
| --- | --- | --- |
| **B0** 基线 | main 旧游戏/线上回滚记录、PR #14/#15 双备份 | 统一新引擎开发基准，审查 #14 和 #15 差异；记录构建、测试与回退点 |
| **B1** Babylon 引擎 | RenderPort 契约、GM-11 纯 TS engine_boot | **真正安装/接入 Babylon Engine/Loader，Canvas/WebGPU→WebGL2 fallback，打开最小可视场景**；不能同时运行两个引擎 |
| **B2** 地图材质 | 压缩 GLB/纹理/光照、GM-11 scene_specs、手机镜头规则 | glTF 加载、地图及材质、烘焙光照 UV、相机/视口、场景可视 |
| **B3** 人物动画 | GLB 备用动画、GM-11 金克丝/雷克塞状态规则 | Babylon AnimationGroup、骨骼/实例化、怪物与首领模型、动作切换及场景事件 |
| **B4** 特效 | PR #10 数据、PR #17 曲线/路由、PR #11 StarStrike | **真正的粒子/网格/UV/Shader/混合/子系统运行器**；映射 SimEvent→VFX；防止低画质消除敌方关键预警 |
| **B5** 性能 | 旧版动态分辨率/帧率管理；预算方案 | Babylon 绘制调用合批/场景优化/阴影/队友特效、双后端性能基线 |
| **B6** 验收 | build/playtest/基础数据回归自动检查 | **先完整自动化与浏览器关卡功能跑通**；设备/原版视觉比对后置 |
| **B7** 生产切换 | 旧 Three.js 与 Worker 可回退 | 仅完整功能及最终验收后移除旧依赖；用户批准后合并部署、验证回滚 |

## B4 未还原字段的明确门禁
Gemini GM-05 报告的 903 层中共有 27 层特殊混合模式：mode3=22、mode2=3、mode5=2，未按原版截图验收；运行器初版要**明确 fallback + 每系统每层仅告警一次**，不能静默声称完全原版。更多非支持字段见 [GM-05 报告](../gemini/B4_Q01_07_FALLBACK_SPEC_GM05.md)。GM-06 验证 48 张逻辑 HUD 图对应 13 张原始图集+7 张 mother atlas；资源可获取并不等于现有 React 界面已还原。

## 44 网格分批方案
引用 [GM-12 清单](../gemini/MISSING_MESHES_PRIORITY_GM12.md)：**P0 15**（地雷、十字弩、冰爆、UwU、耀光、斯塔缇克）→ **P1 8**（掉落、补给箱、升级）→ **P2 10**（雷克塞/精英预警）→ **P3 11**（毒区、落石、金币、3D 血条）。先能运行最小场景和通用运行器，之后按优先级填资源；必要时明确标注占位，**敌方预警不可因缺原素材消失**。

## 代码优先执行次序
1. **GM-11 KV → 独立 GitHub 草稿 PR**：核对 Manifest SHA；接入 PR #15 候选（或经过 #14 差异审查后的唯一集成分支），运行 `tsc`、build、B1 4 测试。随后编写真正 Babylon Engine/Loader 场景；纯 TS 源码提交≠完成 B1。
2. **B2/B3 最小可玩场景**：地图 glTF + 金克丝/少量小怪动画 + 现有 sim 与输入/HUD 同步，先跑通一局，再逐步扩展雷克塞与全部原版动画。
3. **B4 运行器**：在 PR #17 B4 纯逻辑之上完成 Babylon Particle/Mesh/Material 渲染、子粒子、生命周期、预算与模式降级；优先敌方提示，再武器、拾取和 Boss；GM-12 P0/P1 资源按需补充。
4. **音频/UI 并行不阻塞迁移**：GM-10 KV 代传并与 PR #16 整合，避免旧 main.ts 覆盖 PR #15 的 React；23 条最小 OGG 资源按需补，110 M4A 留到 iOS 听测前。
5. **自动化门禁**：每一步 `npm ci`、`npm run build`、`npm run playtest -- 2 0.85` 和模块测试，未验证的功能不得描述为完整迁移；记录 PR、固定 commit、文件哈希、依赖、剩余项。

## 数据同步和上线边界
主线 `main` 与生产 Worker 不动；所有迁移代码均草稿分支逐项审查。KV `pending/github/` 固定 SHA 快照与 Manifest、`SYNC_STATE.pending_github_commits`、`FILE_INDEX` 按 COLLAB 2.3 增量更新。Quick/Gemini `pending/`、参考 `ref/14.14/`、历史版本长期保护；KV 全局 `SYNC_STATE.commit` 未完成全量镜像核验前不得推进。用户只批准代码优先，**没有批准直接部署**。
