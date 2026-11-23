# BAB-01 · B0（模块清单）+ B4（数据准备）—— Quick AI BAB-Q01 待上传文件

> 🔁 **按用户 2026-11-23 09:23 的决定，Quick AI 不连接 GitHub**，本批文件**只在 Cloudflare KV `pending/bab01-quick/`**，由其他 AI 提交（COLLAB 2.4 代上传）。
> **任何能写 GitHub 的 AI 看到后请帮忙上传**，并把 `handover/quick/HANDOVER.md` 的 BAB-Q01 / QC-16 行补进 GitHub 上的交接文档。
> 领取：用户 2026-11-23 08:54 指派 Quick AI 领取 **BAB-01 的 B0 + B4 数据准备子任务**（不含 B1–B3、B5–B7，不含 Babylon 运行器实现）。

## 1. 怎么上传

1. 从**最新 `main`**（GPT-12 记录为 `94f649f`，以实际为准；Quick AI 读的渲染代码是 KV 镜像，对应 `6962303`，上传前在最新 main 上用 `rg` 复核 `docs/bab01/quick_B0_render_inventory.md` 的模块清单）新建分支 **`quick/bab01-b0-b4-data`**。
2. 把下表文件从 KV `pending/bab01-quick/<路径>` 原样放到仓库同路径。**全部是新文件，不改任何现有文件**，不会和 GPT（登录 / 设置 / 升级弹窗 / UI 样式 / 账号）或其他渲染改动冲突。
3. 提交说明：`[Quick AI BAB-Q01] BAB-01 B0 render inventory + B4 engine-agnostic VFX schema & 14.14 data + HUD asset audit（uploaded by <你的前缀>）`。
4. 开 PR 到 `main`（标题 `[Quick AI BAB-Q01] BAB-01 B0+B4 数据准备`），**不部署**。
5. 验收（能编译的 AI）：`npx tsc --noEmit` 检查两个新 TS 文件能过类型检查（它们只被文档引用，不进构建入口，不影响现有包）；`node tools/bab/extract_vfx_14_14.cjs --map33 … --jinx … --reksai … --out /tmp/vfx` 重跑一次，`diff` 输出与仓库里的 `data/14.14/*.json` 应一致。

| 仓库路径 | 内容 | 验证状态 |
| :--- | :--- | :--- |
| `src/render-babylon/render_port.ts` | 引擎无关渲染边界 `RenderPort`（按 main.ts 对旧 Renderer 的全部实际调用整理） | 未编译（待验证） |
| `src/render-babylon/vfx/effect_def.ts` | 通用 VFX 数据结构 `EffectDef` / `EffectLayer` / `Curve` / `EffectSpawnRequest` / `EffectQualityBudget` | 未编译（待验证） |
| `tools/bab/extract_vfx_14_14.cjs` | 原版 VFX BIN → EffectDef 转换脚本（Node，无依赖） | ✅ 已在 Node 沙盒运行 |
| `src/render-babylon/vfx/data/14.14/fountain.json` | 喷泉 4 系统 52 层 | ✅ 生成 |
| `src/render-babylon/vfx/data/14.14/weapons.json` | 9 把副武器 38 系统 144 层（对应关系按 QC-15 更正） | ✅ 生成 |
| `src/render-babylon/vfx/data/14.14/jinx.json` | 金克丝 28 系统 94 层 | ✅ 生成 |
| `src/render-babylon/vfx/data/14.14/enemy.json` | 敌人弹幕 / 精英技能 / 命中 / 死亡 11 系统 101 层 | ✅ 生成 |
| `src/render-babylon/vfx/data/14.14/reksai.json` | 雷克塞 41 系统 351 层 | ✅ 生成 |
| `src/render-babylon/vfx/data/14.14/index.json` | 统计与来源 | ✅ 生成 |
| `docs/bab01/quick_B0_render_inventory.md` | B0：渲染模块清单、Three → Babylon 对应、main.ts 调用 → RenderPort、基线哈希（回归 / 性能全部 NOT RUN） | 文档 |
| `docs/bab01/quick_B4_vfx_14.14.md` | B4：数据说明、规模、各类核对结论、不支持字段、资源可用性、需要的网格清单 | 文档 |
| `docs/bab01/quick_B4_vfx_tables_14.14.md` | 742 层逐层参数表（自动生成） | 文档 |
| `docs/bab01/quick_hud_assets_14.14.md` | 原版战斗 HUD（血条 / 经验条 / 等级 / 升级卡 / 首领血条）布局、贴图、UV、动画、缺失清单 | 文档 |

## 2. 关键结论（详见各文档）

- 原版贴图 **496 张全部能从 CommunityDragon 14.14 直接下载**；**123 个 `.scb/.sco` 特效网格 CommunityDragon 不提供**（项目已有 19 个转换 JSON，雷克塞 55 个在资产分支），缺什么按清单定向补。
- 原版 HUD 贴图 48 张全部能从 CommunityDragon 下载（13 张图集 + 35 张 uiautoatlas 散图），**不需要解包**；升级卡 9 个界面特效系统定义、敌人头顶血条样式映射**未找到 / 未解析**，已列待查。
- 喷泉冷却态 `Foutain_Idle_OnCD`（9 层）不在之前 43 层喷泉审计范围内；雷克塞 351 层在现有代码里 0 处对应。
- **需要用户决定**：`data/14.14/*.json` 是原版派生的运行时参数，是否放公开仓库（与 Q-10「运行时资产保留在公开仓库」同类）。

## 3. 没做的（不在本次范围或做不了）

- B0 的 `npm ci` / `build` / `playtest` / 截图 / 性能基准：NOT RUN（无构建环境、无浏览器）。
- B1 Babylon 引擎接入、B4 运行器实现：未开始（本次只做数据准备）。
- 没有修改登录、设置、升级弹窗、UI 样式、账号接口；没有改游戏数值；没有删除任何资产；没有部署。
