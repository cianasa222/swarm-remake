# 无尽狂潮复刻（Swarm Map33 Warehouse District）— 开发总纲与工作区规范

> **新会话开启后，必须先按 [`COLLAB.md`](./COLLAB.md) 第 0 节的顺序读完交接文档再动手**：`COLLAB.md` → [`QUICK_AI_HANDOVER.md`](./QUICK_AI_HANDOVER.md)（第 1.0 节改动总索引）→ 本文件 → [`AI_HANDOVER.md`](./AI_HANDOVER.md) → [`PROGRESS.md`](./PROGRESS.md) → 相关 Issue。（2026-11-22 Quick AI 按用户要求修改本行）

---

## 1. 项目定位与开发总纲

本项目（`tideline`）旨在 **1:1 复刻《英雄联盟：无尽狂潮（Swarm）》第一关「仓库区（Map33）」**，采用 **Vite + TypeScript + Three.js** 构建，使用拳头 Patch 14.14 官方解包 3D 模型、贴图、骨骼动画与特效网格还原高档实机画面。

### 总体开发路线
`导入现成资产 → 对齐高档实机画面 → 跑通首波到 Boss → 加预载和缓存 → 验收画质档`

### 里程碑规划（每完成一个里程碑须先经用户确认，再开启下一个）
- **M0（已完成 / PASS）**：Map33 原版 3D 仓库场景（`warehouse_map1.glb`，`104/106` 材质映射，1:1 对齐 `180m×180m` `walkableB64` 碰撞网格）+ 第一位英雄 **幻灵战队金克丝**（`strawberry_jinx.glb`，`133` 骨骼、`18` 套 4 向跑打/火箭/大招/死亡动画）与 Swarm 俯视角对齐。
- **M1（已完成 / CLEAN PASS）**：地图核心交互机制与特效对齐——**中央治愈喷泉**（官方坐标 `(-0.45, -2.40)` + 5 套 `.scb` 3D 特效网格 + 22 张官方烘焙光照贴图 `MapSunProperties`）+ **66 个补给箱（`metalbox.glb` + 蓝光信标 + 破碎特效）**。
- **M2（已完成 / PASS）**：第一关原版小怪 / 精英怪 / **雷克塞 Boss（`strawberry_boss_reksai`）** 3D 模型与动画导入及首波到 Boss 流程跑通。
- **M3（已完成 / CLEAN PASS）**：金克丝官方武器/技能特效 + 5 武器 / 6 被动进化系统 + 官方人物头像技能栏 HUD 对齐原版数值与特效。
- **M4（已完成 / CLEAN PASS）**：统一两级预载与去重缓存体系（`src/render/assets.ts` + 开局进度条 + WebGL 着色器预编译 + `VITE_ASSET_BASE_URL` CDN 支持）+ 资产 Meshopt/WebP 压缩（`172.56 MB` → `36.75 MB`，最大单文件 `warehouse_map1.glb` 降至 `13.24 MB < 25 MiB`，可直接部署 Cloudflare Pages）。
- **M5（待开启）**：低 / 中 / 高三档画质验收与联机边界验证，以及后续新英雄扩展。

---

## 2. 架构原则与优化方案

1. **联机接口预留（多人可扩展）**：
   - `src/sim/` 模拟层与 `src/render/` 渲染层严格解耦，避免在渲染层写死单人全局状态。
   - 预留 `players[]`、`SimInput` 与确定性 `rng` 随机数边界，保证后续可直接接入联机帧同步或状态同步。
2. **怪物波次逻辑与画质档位严格解耦**：
   - 怪物刷怪数量、波次密度与自适应缩放属于**逻辑层（`src/sim/`）**，仅按玩家人数/难度调节；**绝不允许**因低画质档位而删减逻辑层怪物数量。
   - 画质档位（低 / 中 / 高）仅调节**渲染负载**：实时阴影开关、像素渲染倍率（DPR）、粒子发射密度、合批渲染等。
3. **「减轻队友特效」选项预留**：
   - 特效（`vfx.ts`）与弹道渲染需区分「自身玩家」与「队友」通道，预留开关接口以便后续联机时降低队友弹道/光效透明度与粒子数量。
4. **预载与缓存方案（M4 重点）**：
   - 高频道具、敌人、弹道统一使用 `InstancedMesh` 或对象池复用，避免频繁 `new Mesh` / `dispose`。
   - 对原版大体积 `.glb` 与贴图按关卡建立预载队列与材质/纹理缓存，避免怪物首次刷出或 Boss 登场时掉帧。

---

## 3. 原版核心数值基线（`src/config.ts`）

- **`PLAYER`**：`maxHp: 1000`、`speed: 3.5`、`radius: 0.35`
- **`MATCH`**：`bossTime: 897`（`14:57` 首领登场）
- **`FOUNTAIN`**：`x: -0.45`、`z: -2.40`、`zoneRadius: 11.4`、`chargeTime: 10.0`、`decayRate: 0.35`、`healFraction: 0.60`、`cooldown: 75.0`
- **`SUPPLY_BOX`**：`hp: 60`、`radius: 0.68`、`respawnTime: 90`、`xpDrops: 2`、`xpValue: 22`、`healChance: 0.30`、`ultChance: 0.25`、`ultGain: 8`

---

## 4. 验收标准与 Windows 开发避坑指南

### 每次改动后的硬性验收流程
1. **构建与数值回归**：`npm.cmd run build`（`tsc --noEmit && vite build`）与 `npm.cmd run playtest -- 2 0.85` 均须退出码 `0`。
2. **浏览器实机验证**：以 `1280x800` 分辨率在实机浏览器截图检查，确认控制台报错 `0`、网络资源加载失败 `0`（注意避免只看局部裁剪图而漏掉全局结构）。
3. **独立 AI 分身逐项复核**：派发独立 `research` 子代理，同时比对**原版 `.bin.json` 参数**、**实机截图**与 **`src/config.ts` 玩法数值**，确认无误后再向用户汇报。

### Windows 环境与工程避坑清单
- **PowerShell PATH 与命令**：调用 Node / Git / `gh` 前注意检查 `$env:Path`（`C:\Program Files\nodejs`、`C:\Program Files\Git\cmd`、`C:\Program Files\GitHub CLI`）；Node 脚本统一用 `npm.cmd`（不要用 `npm.ps1`）；PowerShell 5.1 不支持 `&&`，请分行执行并检查 `$LASTEXITCODE`。
- **防止 Vite Chokidar `EBUSY`**：运行 Vite 开发服务器期间，禁止用脚本直接往 `public/` 下载覆盖文件；应先下载到临时目录，再 `Move-Item -Force` 原子移入 `public/`。
- **Three.js `PointsMaterial` 精灵图集与 `CanvasTexture` 尺寸陷阱**：`PointsMaterial` 会忽略 `Texture.repeat` 与 `Texture.offset`。凡是精灵序列图用于 `PointsMaterial`（如 `lilstar_4x2.png`），必须先用离屏 Canvas 裁剪为固定尺寸 `CanvasTexture`（**禁止在 `img.onload` 中修改 `cv.width`/`cv.height`**，否则 WebGL2 `texStorage2D` 不可变纹理会静默失效变成全透明）；而 `MeshBasicMaterial` 网格材质优先直接用原生 `tex.repeat.set(...)` / `tex.offset.set(...)` 裁剪。
- **Windows 自动化验证脚本防挂起**：凡是用 Node 启动 Vite + Playwright 的验证脚本，必须设置 **60 秒总超时熔断**、`finally` 中调用 `spawnSync('taskkill', ['/PID', String(vite.pid), '/T', '/F'], { stdio: 'ignore' })` 清理进程树，并在脚本末尾显式执行 **`process.exit(0)`**，杜绝子进程句柄残留导致任务卡死。
- **加速插件**：本机已全局安装 `agy-fast`（`v0.2.8`），新会话优先使用其提供的 `batch_search`、`read_slices`、`apply_edits`、`run_checks` 批量工具。
