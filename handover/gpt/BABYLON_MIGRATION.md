# GPT-09 · 无尽狂潮全面迁移 Babylon.js：AI 执行手册

> 2026-11-23 · 用户七星已决定全面迁移渲染引擎。本文件是新技术路线及执行任务书，**不是已完成的迁移**。旧版继续运行，完成新引擎验收并经用户确认后才切换生产。

## 0. 给执行 AI 的指令（可直接复制）

你接手 `cianasa222/swarm-remake` 的 BAB-01 全面迁移。先读 `handover/README.md`、`COLLAB.md`（包含协作与 KV 增量保护）、各 AI 的交接、`AGENTS.md`、`AI_HANDOVER.md`、`PROGRESS.md`、本手册和相关 Issue 及全部评论。以最新 GitHub main 为基线，不用旧本地副本覆盖他人的成果。执行 B0–B7 分段，实际修改、构建、测试和提交；每阶段有可回滚的提交与实测证据，不仅输出建议。先完成渲染兼容工程，再做画面与性能优化。原版 14.14 数据优先，缺什么查什么、补什么。在独立分支完成并走 PR；不得直接切换生产、删除备用资产或重写玩法。遇权限限制登记具体阻塞与可执行步骤，让能做的 AI 接续，不必等待特定 AI 派单。每阶段同步自身交接与看板；最终由用户确认上线。

## 1. 已确定的技术决策与边界

| 层 | 最终方案 | 处理方式 |
|---|---|---|
| 游戏引擎 | Babylon.js + TypeScript + Vite | 全量替换 Three.js 渲染，包括地图、动画、材质、特效、弹幕、镜头；迁移分支允许临时共存，最终运行包不得包含旧 Three 渲染器 |
| 图形后端 | WebGPU + WebGL2 fallback | 一个 Babylon 场景架构、一个游戏状态；启动时按能力和实测选择，任何时刻仅一个活跃引擎 |
| 游戏核心 | 现有 `src/sim/`、配置、随机数、输入、玩法事件与碰撞 | 复用且保持确定性；禁止借迁移擅改伤害、冷却、敌人数量、波次、经验及首领出招 |
| UI / 账号 | 现有 HTML/CSS/TS 登录、游客、邮箱同源网关、HUD、升级、设置 | 原样保留；以后若采用 React/shadcn 等，必须独立任务，不把战斗渲染迁进 DOM |
| 音频 | 现有原版 OGG、事件、BGM、音量与静音机制 | 不重做；保留首领、技能、怪物声音与事件时序 |
| 部署 | 现有 Cloudflare Worker 与资产路径 | 先隔离预览，生产版本与账号服务绑定不变；不引入必须使用本地编辑器的工作流 |
| 未来平台 | 网页优先，移动端兼容，预留微信小游戏平台适配 | 不承诺直接发布；独立验证目标运行时、WebGL 能力、资源和输入接口；小游戏非 DOM 环境需单独 UI/平台适配 |

**不需要写两遍游戏。** Babylon 引擎的 WebGPU/WebGL2 后端共享模型、动画、材质、场景及 VFX 定义。自定义 shader、GPU 特性仍需双后端验证或降级实现。WebGPU 并非天然更快，WebGL2 也必须具备完整玩法和可辨识的关键提示。绝不运行两套引擎同时画同一帧。

## 2. B0 · 冻结可复现基线与防冲突（开工前）

2026-11-23 已核实 main 基线 `62b8591`（Muse MU-01 补交接）；线上为 `tideline-swarm` 版本 `5955ad9a`（deployment `f94499ee`，100%），PR #8 `797ef1d` 已合并并由 Muse 部署；真实设备视听仍待验证。接手时重新核实，不把该历史记录当永远最新。记录上一可回滚版本以及当前 live 版本。

1. `git status --short`；如工作树有他人未提交修改，先用独立 worktree，禁止清理、reset、强推。`git fetch origin main`，从最新主线建立 `<ai名>/<编号>-babylon-migration` 分支，检查其他 AI 有无正在做同样任务，领取 BAB-01。迁移期间同一渲染模块原则上不并行改动；必要修复先进入 main，再显式合并/移植其差异。
2. 检查 `SYNC_STATE.json` 的 `kv_only_pending`、`pending_branches`。PR #8 已合并经过 QC-15 纠错的安全代码，不能重新套入旧 Q25/Q28 补丁。保留所有 KV pending 原件及协作者独有文档，首次迁移不要清理 KV。GitHub `asset/14.14-unpacked-assets-20261123` 是备用资产，禁止删除、覆盖、强推。
3. 检查版本、锁文件、入口、渲染与模拟事件清单，记录构建产物字节、首屏/开战加载、同机同画质 FPS、帧时间、内存、draw calls、错误。保存地图/喷泉/金克丝/精英/Boss/升级画面及原版参考，记录场景、种子、相机、分辨率、时间和画质。不得伪造真机截图或性能结果。
4. 在干净基线 `npm ci`，执行下列回归，Windows 使用 `npm.cmd` / `npx.cmd`；每条检查退出码，不以基线失败作为忽略迁移错误的理由：

```sh
npm ci
npm run build
npm run playtest -- 2 0.85
node tools/auth-gateway.test.mjs
npx tsx tools/q28-regression.test.ts
npx tsx tools/render-quality.test.ts
```

阅读 `tools/verify_browser.ts`、`tools/shots.ts` 参数，使用实际 Chromium/Chrome 与测试地址截图。无浏览器/GPU 时标记未验收并交由有能力的 AI，不能声称 PASS。B0 产物：版本、模块清单、性能基准、回归日志、截图、已知缺陷和资源清单，写入执行者目录。

## 3. B1 · 建立 Babylon 核心和渲染边界

先验证稳定 WebGL2 路径，再接 WebGPU（同一套代码）。查官方 npm 版本，选定稳定、彼此匹配的 `@babylonjs/core`、`@babylonjs/loaders`，精确锁版并提交 lockfile；需要额外模块时按需引入，不整套打包编辑器或 Inspector。示例：`npm install --save-exact @babylonjs/core@<已核实版本> @babylonjs/loaders@<同版本>`。实际运行前替换占位符。

建议在迁移分支建立 `src/render-babylon/`。保留 `src/render/` 旧实现作对照；梳理 `src/main.ts` 与 `src/render/renderer.ts` 构造/resize/update 等调用，抽出只含纯 TS 数据的 `RenderPort`（init/preload/resize/renderFrame/applyQuality/dispose 等，以实际现有接口为准）。`quality.ts`、资产路径、UI 图标 URL、帧率控制等无引擎依赖部分复用或抽离，不复制玩法。

```text
输入 + 固定步长 sim + RNG + 联机接口 → 游戏快照 / 渲染事件 → Babylon 渲染层
                                    ├→ HUD / 账号页面（保持现状）
                                    └→ 音频事件（保持现状）
Babylon 场景/材质/动画/VFX → WebGPU 或 WebGL2（单后端）
```

- 启动时能力检测并异步初始化 WebGPU：检查支持、设备创建、基本场景和所需特性；失败释放半初始化资源，再创建 WebGL2 Engine。可用 `auto/webgpu/webgl2` 调试选项，正式 auto 仅在设备通过兼容验收后优先 WebGPU。设备丢失、context loss 时受控重建渲染资源或提示重启，不丢失/加速模拟、不中途双跑；失败须可读日志。无可用后端显示兼容提示。
- `scene.useRightHandedSystem = true` 在导入前设置作为现有 glTF 坐标对齐起点；实际验证 glTF 节点、相机方向、绕序、法线、骨骼、UV 与世界 x/z，不能靠镜像硬修。统一颜色空间、曝光、透明混合与深度设置。
- `src/main.ts` 继续维持原模拟/画面时序，避免同时注册 Babylon render loop 和既有 RAF；单一时钟，保留限帧及插值。事件只消费一次，暂停/恢复、后台切换、横屏、释放资源均测试。
- 测试预览优先单后端构建/按需加载；实现进度条、错误重试、资源统计、预载/缓存。B1 验收：空场景、原地图/模型最小加载、相机、设置生效、WebGL2 可运行；WebGPU 另记录实际支持状态。

## 4. B2 · 资产管线、地图与相机

| 原模块 | 迁移事项 |
|---|---|
| `assets.ts` | Babylon glTF Loader / AssetContainer、Meshopt 解码与路径验证、纹理缓存、SCB JSON 转 VertexData、两级预载、无重复请求；复用 `VITE_ASSET_BASE_URL` 与原路径 |
| `map_warehouse.ts`、`world.ts`、`env.ts`、`style.ts` | 地图 `warehouse_map1.glb`、材质、光照贴图、环境、物体、特效节点迁移；保持原版烘焙光照和颜色，不改成默认 PBR 后就宣称一样 |
| `lan.ts` | 逐项审查兼容内容与实际调用；保留或映射仍使用的表现，不凭文件名判断可以删 |
| `renderer.ts`、`quality.ts` | 相机、尺寸、后处理、阴影、渲染设置和帧率；复用现有 auto/低/中/高、细节规格 |

- 180×180 地图、原 `walkableB64` 碰撞、66 个补给箱、中央喷泉坐标和 22 张烘焙贴图按当前主线及 14.14 数据核对。核验 TEXCOORD_1/UV2、材质映射、alpha cutout、透明层、贴花与色调。不能将静态烘焙光照丢掉或全换实时阴影；相机同机位、移动端横屏、UI 安全区和触控与基线对齐。
- 已压缩 `.glb`、`.webp`、`.ogg`、SCB 转换 JSON 直接复用。检查 decoder 的版本、公网加载、CORS 和缓存，优先可控的同源或项目既有 CDN，不复制资源目录。`tools/compress_assets.mjs` 需按需运行，保留 TEXCOORD_1、动画和材质映射，单文件 <25 MiB 以兼容现行 Worker 静态资产发布限制。
- 资源查证顺序：[统一资源渠道](RESOURCE_SOURCES.md)、[备用资产清单](ASSET_LIBRARY_14.14.md)、main、备用分支、已解包本机/KV 参考、CommunityDragon 14.14 直链及拳头官方对应 game-client Windows manifest/CDN；仅定向下载必要 WAD/文件，14.15/14.16 后续归档只交叉验证，标记版本差异。查清版本/源路径/用途/哈希/转换命令/输出/验收，禁止用一个 404 或权限失败证明原版不存在。参考 BIN 和原始 WAD/解包文件不放公开仓库或线上；遵守原作者版权，仅在有授权范围内使用，非商业不自动授予许可。未来独立商业/个人资产版本应改用有权使用的原创资产。

## 5. B3 · 角色、小怪、首领、碰撞与动画

覆盖 `hero_jinx.ts`、`enemy_models.ts`、`entities.ts`、`boss_reksai.ts`。以现有精确 GLB + 动画命名为依据，构建 `game entity id → instance/动画 state` 映射，生命周期和池化处理；受击、死亡、复活、精英死亡、位移、翻面、首次登场、Boss 子网格隐藏、武器/骨骼挂点均须复核。先让普通动画正确，再评估共享 skeleton/分组、VAT/薄实例等批处理：普通实例并不自动具有独立骨骼动画，按实际可用性选方案；禁止牺牲动画正确性来追求 draw calls。

- 雷克塞已完成 42 个 `.anm` 对应 GLB 动作补导与 Wrap/Plane 子网格处理；53 个逻辑片段与 42 个文件不能混为一谈，核实动作映射/阶段/时长。备用分支还有 55 个雷克塞特效网格、16 个补充小怪模型，应按需提取；小怪是否有动画查原始 GLB 及备用库，不能直接说没有。
- 现有第一关完整可玩范围与全部已实现英雄/武器是迁移必验项；九英雄的尚未开发功能属于后续内容扩展，不假装迁移自动完成九英雄。未实装角色先保留资产与接口。
- 权威碰撞和技能触发始终来自模拟，动画帧率、LOD、画质不得影响伤害等。保留固定步长、玩家 ownerId、敌人和弹道事件顺序；不以动画长度直接猜出招 CD。原版没有查到的服务器脚本数值标记推断与证据，既有玩法保持，另开原版校正任务。

## 6. B4 · 通用 VFX / 弹幕系统（核心重构）

覆盖 `vfx.ts`、`jinx_vfx.ts`、`weapon_vfx.ts` 及场景/首领内局部特效。不要把 Three.js 的临时 Canvas/点材质 workaround 原样机械翻译。先抽出统一的版本化 EffectDef（原版路径、对象/发射器名、参数依据及哈希、类型、局部/世界空间、挂点、开始/持续/循环、曲线、burst/rate、速度/加速度、大小/旋转、颜色/alpha、UV flipbook、混合和 depth、网格、贴图、质量规则、ownerId、音效事件关联）。从 14.14 `.bin.json` 映射并对照实际图像；Babylon 不会自动理解 Riot 专有 VFX BIN。记录不支持参数、精确替代或待办；不要静默吞掉复杂层。

| 表现 | 实现策略（验证后选） |
|---|---|
| 大量普通粒子、烟尘、火花 | Babylon ParticleSystem/GPUParticleSystem；按能力分配，池化与 atlas，共享材质；透明度与所有曲线必须匹配 |
| 闪电、弹道、冲击环、贴花、星芒 | Mesh/动态顶点/线条、正确 additive 与 alpha、深度策略、SCB 转网格；轨迹与跳链使用真实事件端点，不改命中 |
| 精细 trail、绑定骨骼、复杂网格发射器 | 优先可支持的 CPU/原生 mesh 等路径，必要时专用 shader；不硬塞 GPU 粒子 |
| 自定义 shader / 后处理 | 优先内置材质或兼容两种后端的 shader；必要 GLSL/WGSL 各自测试，保留合理低档降级 |

验收要点：

- 斯塔缇克电刃：真实链路端点、闪电主线、命中爆发、火花/星芒等逐层对照原版；按已审核的寿命、颜色、UV 与事件检查，不能只画一根蓝线；不得混用十字弩 PierceShot、战兔巨爆 StarStrike、旋风切割器 HolyBauble 与 Nuke 的资料（QC-15）。
- 喷泉：对照 43 个发射器审计及 AG-03 已实现层，逐项记录启用/充能/计时/治疗 Nova/冷却；保留现有透明遮罩，使用相同画面与同屏对比，不能漏层或重现之前贴花透明失效。其余九武器、金克丝 E/R、敌人死亡、首领出场/钻地/飞弹/落石等逐项对应当前已实装部分及原版资源。
- 建立按 `ownerId` 区分自己的特效、队友装饰层、敌人/危险警示/必要提示；“减轻队友特效”只降队友装饰，不隐藏敌方预警、弹道命中或关键反馈。池化实例、粒子生命周期与音效触发计数做回归。裁剪渲染对象不能删除模拟实体。
- 建立场景级 VFX 测试页/可控事件重播：冻结输入，用固定事件和时间点截屏，对比原版参考、旧版和新版。在基线缺层情况下标记原版证据、先完整接回已实现层，再单独补缺；少写硬编码特效，复用定义与通用运行器。

## 7. B5 · 画质、性能及移动端

- 保留自动、低、中、高，细节设置：阴影、特效强度、分辨率、队友特效、30/60/不限帧。分级控制阴影、DPR/动态分辨率、装饰粒子、后处理、LOD、距离剔除；不改变游戏逻辑，危险提示始终可见。初版保留原高档画面标准，从测得瓶颈逐一优化，避免自动 HDR/bloom 造成过曝。
- 静态场景合批与材质复用，动态用对象池、实例/VAT、纹理 atlas；显式释放 texture/material/mesh/animation/engine 资源，避免每帧 GC；GPU 粒子预算、防过绘制、按屏幕大小与距离裁剪装饰层。加载前后端共用资源，不把一个模型复制两遍；树摇与动态加载，记录实际下载体积。切换地图、返回登录、重开游戏后资源应回落，没有无限增长和重复请求。
- 同场景同画质比较旧版与新版：1280×800 桌面、844×390 横屏移动示例；实际 iPhone Safari、Android Chrome、桌面 Chrome/Edge，至少测一个强和一个弱机型，有 WebGPU 及强制 WebGL2 组合。固定种子/时间、DPR、分辨率、阴影和同等画面效果，至少三次；记录冷启动/热缓存 JS 和资产下载、CPU/GPU 帧时间（可获取时）、p50/p95/p99 帧间隔、FPS、draw calls、粒子/实例数量、内存/峰值、掉帧。压力档用现有真实后期波次，并可另外模拟 100/300/500 个实体作为测试情境，不能修改正式波次。测试 15 分钟流程、Boss 大爆发、密集小怪和弹幕、音频并发、后台恢复。
- 初始目标：桌面高档尽可能稳定 60fps，中低设备以稳定 30fps 为保底目标；不是承诺，实测无法达标须记录瓶颈及解决计划。相同画质不可用明显更少特效伪装提速。比较网络体积、首次开战时间和资源峰值；任何明显回归或体积增长要说明原因并经用户确认。浏览器/设备暂不可测则标注 `NOT RUN`，不是 PASS。

## 8. B6 · 功能、回归、视觉独立审查

按 AGENTS 硬性流程独立 AI 复核原版 BIN、截图、`src/config.ts`；如环境支持，安排有能力的独立审查者，审查结论留痕，不指定唯一 AI。迁移每阶段先跑 B0 命令，再增加：

- 固定种子同输入逐步比对 sim 快照/HP/XP/波次/敌人数/命中/胜负、30/60/不限帧及后台恢复；游戏事件顺序与次数一致，渲染不能改变 sim。保存数值 diff 及失败定位。
- 首屏/游客/真实邮箱登录/退出/会话恢复/账号服务故障下游客可玩；网关 mock 与正常请求、跨域 POST、错误方法、缺少绑定错误行为不回归。不要读取或复制密钥，不改账号服务或用户数据；生产账号实测须合法测试账号与授权。
- 桌面/手机输入、升级卡、布局、设置持久化、音效和 BGM；两后端的地图、角色、武器、喷泉、雷克塞完整战斗关键细节逐项截图/录像（1280×800 全画面为硬性要求），相关控制台报错和失败资源加载为零。预览交接文档不可从站点公开访问，旧文档路径维持 410/拒绝。
- 每个阶段记录 `PASS / FAIL / NOT RUN`，附 commit、设备、后端、分辨率、复现命令、日志与截图。没有测试环境或能力时交给能完成的 AI，不能把静态检查当 GPU 真机验收。

## 9. B7 · 清理依赖、上线门禁和回滚

1. 全功能与回归通过后，把 Babylon 渲染器设为唯一支持的正式渲染实现；检查 `rg -n` 所有 `three`/旧 Renderer imports 与依赖链。迁移工具或遗留描述先核实，不删除备用资源或旧历史；从实际生产依赖、打包入口移除 Three.js、无用 `@types/three` 及旧渲染代码，经审查证明无调用。保留原版运行基线和 git 历史用于对照回滚，不保留双套运行包。重新执行完整 B6，检查产物与 sourcemap 不意外打包原始参考数据、交接、密钥、旧引擎。
2. 开 PR 指向 main，按 COLLAB 要求交接与看板更新，审查方 `PASS / 需修改`。用隔离预览进行完整实测，不覆盖线上、现有 Worker secrets、绑定、路由或真实存档。未授权不得创建/修改新生产服务；无预览部署权限时交付命令及明确阻塞。
3. 用户验收通过后才合并最终切换并授权生产部署；核实现行 Cloudflare 配置与账号绑定，保持 `wrangler.jsonc` 资产与 API 路由，执行正式发布流程，记录版本 ID/流量/commit，复测首页/资源/登录/游客/完整战斗/移动端。
4. 若黑屏、资源 404、登录异常、玩法回归、持续掉帧或关键特效错失，停止扩大发布，按平台正常 rollback 回 B0 实测的最后健康版本，核对流量和站点，再从分支修复；不重写主线历史、不动账号数据。记录恢复前后版本、原因和结果。

## 10. 任务表、交付格式及后续扩展

| 阶段 | 交付物 | 完成条件 | 初始状态 |
|---|---|---|---|
| B0 | baseline 报告、分支、测试场景 | 可复现旧版 | 待领取 |
| B1 | RenderPort、初始化、WebGL2、WebGPU 适配 | 最小场景+资源启动、后端检测/失败回退 | 待做 |
| B2 | 地图/材质/镜头/资产 | 原地图与加载对齐 | 待做 |
| B3 | 全角色/动画/弹道模型 | 实现范围完整、死亡与首领正确 | 待做 |
| B4 | VFX 数据层/运行器及各模块 | 喷泉、武器、Boss 逐层可核验 | 待做 |
| B5 | 画质/性能/移动 | 性能报告+同画质无明显回归 | 待做 |
| B6 | 全流程验收 | 回归、视听、双后端、账号、真机实测 | 待做 |
| B7 | 唯一 Babylon 构建与发布回执 | 移除旧依赖、用户验收后上线/回滚检查 | 待做 |

执行者每次交接：编号 / 最新 main 与分支 commit / 改动文件 / 资产来源及缺项 / 命令与退出码 / 双后端设备结果 / 截图与统计 / 已知问题 / PR / 部署状态 / KV SHA-256 与未同步原因 / 下步可执行事项。GitHub main 是权威；只有提交后的内容才镜像，`FILE_INDEX.json` 和 `SYNC_STATE.json` 必须增量读改写；保留 `kv_only_pending` 与全部 pending 原件，未全面一致不得把全局 commit 改成最新。共享入口只改自身行，独有文档不得整份覆盖。按现有协作规则另行领取未完成原版资源补项、M5 与新英雄；不把未开发内容混入迁移完成率。

未来微信小游戏：把 storage、fetch/资源加载、计时、触控、生命周期、音频、canvas/上下文、账号与 UI 接口集中到平台适配层，保持 sim/VFX 定义独立。先小样验证目标微信小游戏运行时支持的 WebGL/WebGPU 与 Babylon 版本、包体/分包/资源限制、真实手机性能；网页 H5、微信网页和原生小游戏不是同一发布环境。目前不改变线上网页，也不承诺无适配直接移植。

### GPT-13 · BAB-Q01 验收回执（2026-11-23）

[BAB-Q01 验收与缺口清单](BAB_Q01_ACCEPTANCE_GPT13.md)：14/14 首验哈希与 6/6 转换重放通过；122 系统/742 层仅为数据准备。Q01-01～10 记录原版系统遗漏、资产映射、原版 HUD、运行器、默认构建阻塞及 B0–B7 阶段门禁。不代表正式验收或已迁移，补项后再按本手册逐阶段验收。保持 Quick 原始交付与旧线上版本。

## 11. 技术文档（以官方最新稳定版本为准）

- [Babylon WebGPU 支持](https://doc.babylonjs.com/setup/support/webGPU)
- [ES6 模块 / Tree shaking](https://doc.babylonjs.com/setup/frameworkPackages/es6Support/treeShaking/)
- [glTF Loader](https://doc.babylonjs.com/features/featuresDeepDive/importers/glTF/)
- [粒子系统](https://doc.babylonjs.com/features/featuresDeepDive/particles)
- [Baked texture animations](https://doc.babylonjs.com/features/featuresDeepDive/animation/baked_texture_animations)
- [Scene optimizer](https://doc.babylonjs.com/features/featuresDeepDive/scene/sceneOptimizer/)
- [坐标系统](https://doc.babylonjs.com/features/featuresDeepDive/mesh/transforms/coordinateSystems/)
