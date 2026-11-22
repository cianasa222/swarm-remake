# GPT-07 — Quick AI Q-22/Q-23/Q-25 审查与待同步记录

- 基线：GitHub main `bd8a87b694afa86ec5f6de327aa8b06730eb3270`；原始补丁及交接来自 KV `pending/q22/`、`pending/q23/`、`pending/q25/`，已在独立工作树应用；未覆盖原有工作树。
- Q-22：修复 DataTexture 的 TypeScript ArrayBuffer 类型错误；区分循环及不循环动画插值，攻击停留在末帧；只为已加载动画的敌人建立攻击计时，使用 WeakMap 避免保留死亡敌人。未改 sim；动画实际接入仍待原版资产。
- Q-23：独立时间轴限帧修复 90/144Hz 误跳帧；性能面板显示未截断的实际帧间隙；保留 GPT-05 的手动画质与分辨率覆盖。
- Q-25（已更正）：冰爆护甲保留。QC-15 核实战兔巨爆是 StarStrike 而非 Nuke，撤回本轮错误使用 Nuke 的颜色、透明度及寿命。旧视觉基线不是完整 1:1；见 [QUICK_RENDER_Q28_REVIEW.md](QUICK_RENDER_Q28_REVIEW.md)。
- Q-27（QC-12 新增）：直接读取 14.14 `Strawberry_Enemy_Death`，核实红橙色 HeartGlow 和 Basic 火花 0.5s。保留 Quick AI 的颜色/寿命近似修正，完整六层尚未接入。
- 构建 PASS；`node --import tsx tools/playtest.ts 2 0.85` 4/4 全胜，bossTime=900；`tools/render-quality.test.ts` 21 种帧率组合及画质覆盖/暂停后恢复 PASS。普通 tsx CLI 因 IPC EPERM，无头浏览器因 socket EPERM 启动失败；未取得视觉验收，不得合并运行时代码或部署。测试路径应在有权限环境用 1280×800 及 iPhone 实机补齐。

## 待完成事项

1. **PERF-1 T2b 普通小怪原版动作**：Pix 26 骨骼、Ghoul 33、Hunter 41、Dasher 23，四个当前 GLB 均 0 clips。AG-06 资产分支同名 GLB 与 main blob SHA 完全相同，未发现 `.anm`。优先检查已有 14.14 Map33 解包目录；缺什么才解什么，核对真实动画图及模型依赖。不要下载整个客户端，不要将 CommunityDragon 404 当成原版不存在。补导跑、攻击、待机及死亡，核对 Hunter 射击、Dasher 冲锋/回收、动作时序；死亡表现不得改变模拟判定。单文件 <25MiB，保留压缩动画，输出四个 `public/assets/enemies/enemy_*.glb`。CPU 烘焙、GPU VAT shader 和真机负载均需补测。
2. **PERF-1 其他**：KTX2、MSAA/FXAA 实测、粒子合批、阴影视觉对比。当前模拟上限 160，只允许独立渲染压测 300 实例，不改玩法上限；记录前后帧率、帧时间、DrawCall、资源占用。
3. **Q-24/VFX**：地雷原版模型与爆炸层，武器拖尾、命中层，冰晶冰刺、进化光柱区分；Q-24 的十字弩/旋风映射错误，不能直接采用反弹等结论。先核实 PierceShot/HolyBauble 本身。参数原版有就直接取证，没有才标明推断。
4. **既有待办**：雷克塞出场与特效，镜头/升级卡（PR #6），经验节奏，喷泉贴花（PR #5），真实认证服务绑定及实机验收（PR #7 已合并但未确认部署）。不重复领取其他 AI 的工作。

## 同步阻塞及交接规则

2026-11-23：用户明确确认现阶段公开仓库可同步，后期转私有。不上传原始解包档、账号凭据或隐私信息。同步前重读 GitHub main 与 KV `kv_only_pending`、`pending_branches`、`FILE_INDEX.json`，保留 Quick QC-07 至 QC-12 所有更新；文档同步 main，待验收代码单独 PR；未完成合并前不得清理 `pending/`。所有 KV 写前读回核对，写后 SHA-256 验证，不能只看 commit 相同就认定全部一致。

**备用资产分支保护（用户明确要求）**：见 [ASSET_LIBRARY_14.14.md](ASSET_LIBRARY_14.14.md)。即使未上线、未被 main 引用也不得删除或重写 AG-06 资产分支；按需从现有资源复用。
