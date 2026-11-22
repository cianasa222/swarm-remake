# Antigravity（开发 AI）交接文档（handover/antigravity/HANDOVER.md）

> **本文档由 Antigravity（主线开发 AI）编写和维护。**
> 最后更新：2026-11-23 03:55 CST · 改动编号已排到 **AG-09**
> 交接总入口：[`handover/README.md`](../README.md) · 协作规范：[`COLLAB.md`](../../COLLAB.md)

---

## 1. 改动总索引（按 `COLLAB.md` 2.2 节强制登记）

| 编号 | 时间（CST） | 提交 | 文件（+增 / −删 行） | 改了什么 | 验收 | 部署 | KV |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| AG-01 | 11-22 23:32 | `[Antigravity AG-01]` (`a84d57a`) | `src/render/map_warehouse.ts`（+29 / −26）、`handover/antigravity/HANDOVER.md`（新增）、`handover/README.md`（+1 / −1） | 验收 Quick AI 的 Q-04（`c63e871`）与 Q-05（`46362d7`）：Q-05 小怪 4 模型全部 **PASS**；修复 Q-04 喷泉 3 处实机视觉缺陷——修正 `novaWaves` 缩放（`fountain_wave.json` 顶点 `maxR=46.33`，`novaGroup ×1.75` 下由 `0.8/0.4` 修正为 `0.175/0.135`，消除 64.9m 穿墙与低面数折线）、修复 `makeFxPool` 亮度与 `healspark` / `sparklies1` / `Gold` / `Gold1` 粒子尺寸和起始缩放曲线（消除 10% 零缩放延迟） | ✅ **CLEAN PASS**（`build` + `playtest` 4/4 + 5 张 `1280×800` 实机截图独立审计通过） | ✅ 已部署（见 AG-02） | 已同步 |
| AG-02 | 11-22 23:52 | `[Antigravity AG-02]` (`457e56d`) | `handover/antigravity/HANDOVER.md`、`handover/README.md`（+1 / −1） | 发布 `a84d57a` 最新构建至 Cloudflare Worker `tideline-swarm`（并补齐全部静态文件 MIME 类型，最终 `deployment_id: ecc07343780a483c958c5acc8a018209`），保留 v7 410 文档拦截、`public/_headers` CORS 与零 KV 绑定，线上全端点验收通过 | ✅ 线上实测 PASS（`/`、`index-BKy7dgh5.js`、`index-BNns1gdj.css`、`warehouse_map1.glb`、`enemy_dasher.glb` 均 `200` + 正确 `Content-Type` + `ACAO: *`；4 交接文档与 `/__sync_kv` 均 `410`） | ✅ 已上线 | 已同步 |
| AG-03 | 11-23 00:20 | `[Antigravity AG-03]` (`c38c792`) | `public/assets/map1/vfx/`（新增 5 个 Nova `.scb` 网格 JSON + 15 张 T4 `.webp` 贴图，合计 145 KB）、`src/render/map_warehouse.ts`、`src/render/assets.ts`、`handover/antigravity/HANDOVER.md`、`handover/README.md` | **补全中央喷泉第二批（43/43 发射器 100% 对齐 Patch 14.14）**：从本机 `Map33` 解包目录转换 `fountain_nova_flame/ring/swirl/shape/indicator.json` 并下载转换 15 张 T4 `.webp`；接入 7 个常驻层 `textureMult`（`scan_lines`/`dots`/`base_glow`/`glow_hardedge`）、Timer 原版 `Base_Timer_Mult_06–09` 进度遮罩、Nova 剩余 10 层（`flashBlend`/`Beamdown`×2/`Ground_Light_mesh1`/`InhaleFire`×3/`Ring`×2/`ShapeAround`/`teamring_circle1`，按顶点 `maxR` 校准防穿墙，4.2 s 两段式收尾），全部纳入 Stage 1 预载 | ✅ **CLEAN PASS**（`build` 1.20s + `playtest` 4/4 + 5 张 `1280×800` 实机截图 0 报错且独立审计通过） | ✅ 已部署（见 AG-05） | 已同步 |
| AG-04 | 11-23 01:09 | `[Antigravity AG-04]` (`7f8cf6d`) | `handover/quick/HANDOVER.md`（仅更新 Q-13 状态列）、`handover/antigravity/HANDOVER.md`、`handover/README.md` | **验收并合并 PR #2（Quick AI Q-13 金克丝 14.14 重建，`c92c5d5`）**：`build`（1.25s）+ `playtest` 4/4 全胜（0 承伤，无需改回非原版数值）+ 7 组 `1280×800` 截图独立视觉审计 CLEAN PASS（被动光环与 R 13.6m 地面投影均比例合适、E 9 发 90° 齐射与爆炸正常、R 命中首个普通小怪即爆精准 500 伤），评论 PASS 并合并，增量同步全部 8 个文件至 KV | ✅ **CLEAN PASS** | ✅ 已部署（见 AG-05） | 已同步 |
| AG-05 | 11-23 01:46 | `[Antigravity AG-05]` (`68b7844`) | `public/assets/heroes/jinx/vfx/`（新增 6 张原版 14.14 `.webp` 贴图，共 140.1 KB）、`src/render/jinx_vfx.ts`、`src/render/assets.ts`、`docs/audit/jinx_14.14.md`、`handover/antigravity/HANDOVER.md`、`handover/README.md` | **补齐金克丝 14.14 全部缺失特效层并上线 Cloudflare**：从 CommunityDragon 14.14 拉取并转换 `sand_streaks`/`r_rocks_2x2`/`cloud_face_flipbook`/`particles_1_9`/`r_ground_smoke02`/`speed_impact` 6 张 `.webp`；补齐 E 爆炸 `SandBurst`、R 飞行 `Left/Right Wind` + `Dark/Add Smoke` + `Spots` 猫脸点 + `LittleStar` + `Mid PixelCast` + 3D `Speed_impact`（`r_castring.json`）+ 3D `R_Swirl` 青黄尾环（`r_swirl.json`）、R 爆炸 `CloudFace4` 2×2 翻页云脸动画 + `fast` 碎石 + `Dark Smoke` 黑烟 + `SolidBeams` 径向光束；并将 AG-03 + Q-13 + AG-05 合集部署上线至 `tideline-swarm`（`deployment_id: 701860ffe5144dd7936c3be4b0c2e05b`） | ✅ **CLEAN PASS**（`build` 1.21s + 4 张 `1280×800` 截图 0 报错独立视觉审计通过 + 线上全端点验收 PASS） | ✅ 已上线 | 已同步 |
| AG-06 | 11-23 03:15 | 分支 `asset/14.14-unpacked-assets-20261123` (`4b1b5f7`)；文档 `[Antigravity AG-06]` (`52fc77f`) | **816 个解包专属资产文件**（分支 `asset/14.14-unpacked-assets-20261123`）：`public/assets/audio/{jinx,global,music}/*.ogg` + `events.json`（736 条 `.ogg` 共 46.42 MB，305 个事件映射）、`public/assets/enemies/reksai.glb`（42 段全动作，3.05 MB）、`reference/14.14/reksai_submeshes.json`（`[Body,Fin,Scale,Wrap,Plane]`）、`public/assets/enemies/reksai_vfx/*.json`（55 个 3D 网格）、`public/assets/heroes/jinx/vfx/jinx_{sk,vfxmeshes_02,offset_quad_01}.json`、`public/assets/enemies/*.glb`（16 个第一关补充小怪与隧道压缩模型，6.16 MB）、`reference/14.14/UNPACKED_ASSETS_MANIFEST.md` | **将本机已解包的 14.14 专属资产（网上不解包就找不到的音效、3D 模型、动画、`.scb` 网格）全部转为网页开放格式并推送独立分支**：实测 Chromium `decodeAudioData()` 解码 `.ogg` 通过、`npm.cmd run build` `1.76s` PASS、全部分支文件 `< 25 MiB`、零 `.wad.client` 与未压缩 `.glb` | ✅ 分支构建与解码校验 PASS（待按需合并进 `main`） | —（分支资产库） | 已同步 |
| AG-07 | 11-23 03:21 | `[Antigravity AG-07]` (`02300ef`) | `COLLAB.md`、`handover/README.md`、`handover/antigravity/HANDOVER.md` | 按用户指示在 `COLLAB.md` 第 1 节与 `handover/README.md` 第 1 节补充协作原则：**Quick AI 为临时审查/辅助角色，项目决策以用户为准，任何具备能力的 AI 均可按用户决定自主完成开发、资产转换与验收，无需被动等待 Quick AI** | ✅ 文档规范更新 | — | 已同步 |
| AG-08 | 11-23 03:40 | `[Antigravity AG-08]` (`2f5b415`) | `public/assets/audio/{jinx,global,music}/*.ogg` + `jinx/events.json`（从 `asset/14.14-unpacked-assets-20261123` 精选合入 93 条 `.ogg`，共 9.08 MB）、`src/audio/audio.ts`（+351 行重构）、`src/main.ts`（+3 行）、`handover/antigravity/HANDOVER.md`、`handover/README.md`、`COLLAB.md` | **接入 Patch 14.14 原版音效与 BGM（完成用户两步任务第 1 步）**：按 `mus_map33_events.bnk` 与向下 HIRC 事件表将 93 条原版 `.ogg` 接入 `AudioFX`（金克丝 Q/E/R/命中/被动/换枪、击杀/受击/经验/治疗/升级、中央喷泉治疗与就绪、副武器地雷/脉冲、敌人蓄力/射击、波次警报、雷克塞警报/怒吼/砸地/横扫/二阶段，以及仓库区开场序曲 `307974760.ogg` → 主循环 `854037489.ogg` → 雷克塞 Boss 主题 `71063538.ogg` 跨淡 → 胜/负横幅曲 `91455257.ogg` / `632537467.ogg`），带核心 SFX 预热解码与零延迟程序化合成回退 | ✅ **PASS**（`build` 1.47s + Playwright Headless Edge 实机解码测试：60 条原版 `.ogg` 解码 0 失败、`main→boss→victory/defeat` 切换 0 报错、`0` 4xx/5xx 请求） | ⏳ 待部署 | 已同步 |
| AG-09 | 11-23 03:55 | `[Antigravity AG-09]`（含合并 PR #3 `c056396`） | PR #3（`src/config.ts`、`src/sim/game.ts`、`src/sim/weapons.ts`，+36 / −23）；`public/assets/enemies/reksai.glb`（42 动作版，3.05 MB）、`reference/14.14/reksai_submeshes.json`、`src/render/boss_reksai.ts`（+68 行）、`src/render/entities.ts`（+1 / −1）、`handover/antigravity/HANDOVER.md`、`handover/quick/HANDOVER.md`（仅更新 Q-15 行）、`handover/README.md`、`COLLAB.md` | **完成用户两步任务第 2 步**：① 验收并合并 [PR #3](https://github.com/cianasa222/swarm-remake/pull/3)（Quick AI Q-15：A 类 14 项数值对齐 14.14，`build` 1.28s + `playtest` 4/4 全胜 `bossTime=900`，评论 PASS 并合入 `c056396`）；② 从 `asset/14.14-unpacked-assets-20261123` 合入 42 动作版 `reksai.glb` 与 `reksai_submeshes.json`，修复 `dedup` 合并材质名导致 `Wrap`/`Plane` 未隐藏的缺陷（按名称 + 原版顶点数 `1250/122` + 索引 `3/4` 三重精准隐藏，保留 `[0] Body 6518` / `[1] Fin 344` / `[2] Scale 365`），并接入 17 个精确匹配的 14.14 原版动作剪辑（含 `spell1`、`spell1_frenzy_mirror`、`spell2_knockup`、`spell2_unburrow`、`run_burrowed`、`run_injured`、`channel_windup`、`channel_loop`、`death` 等） | ✅ **CLEAN PASS**（`build` 1.34s + `playtest` 4/4 全胜 + 3 张 `1280×800` 雷克塞特写截图独立视觉审计 CLEAN PASS，0 报错、Wrap/Plane 100% 消失、42 clips / 17 动作精准绑定） | ⏳ 待部署（含 AG-08 + PR #3 + AG-09） | 已同步 |

---

## 2. 本轮验收与修复详情

### 2.1 Q-05（`46362d7` 小怪量化蒙皮烘焙修复）— PASS
- 实机在玩家周围布置 8 只小怪（`Pix` ×2、`Ghoul` ×2、`Hunter` ×2、`Dasher` ×2），8/8 模型均完整渲染在地面阴影上方，尺寸、站姿、贴图与朝向正确，彻底修复 M4 量化后小怪只剩影子的问题。

### 2.2 Q-04（`c63e871` 喷泉第一批 9 项）— 修复 3 项后 CLEAN PASS
1. **Nova 穿墙与低面数折线**：实测 `fountain_wave.json` 原始顶点最大半径 `maxR = 46.33`，放在 `novaGroup`（`scale = 1.75`）下使用 `sxz = 0.8 / 0.4` 时实际扩散半径高达 `64.9m / 32.4m`，导致切穿广场左右混凝土围墙。已修正为 `0.175 / 0.135`（实际最大半径 `14.2m / 10.9m`），严丝合缝贴合广场内缘。
2. **`healspark` 与 `sparklies1` 可见性**：`makeFxPool` 片段着色器改为 `min(tex.a, luma)` 并微调提亮（`×1.45`）；`healspark` 基准尺寸由 `0.4` 调整为 `1.15 * rnd(0.55, 1.0)`；`sparklies1` 半径贴合 `9.2m` 进度环并提升起始透明度（`0.65 -> 1.0 -> 0`），充能进度弧前端火花清晰可见。
3. **`Gold` / `Gold1` 爆发粒子**：移除 `GOLD_SCALE_T` 前 10% 的零缩放延迟，将 `goldPool` / `gold1Pool` 尺寸提升至 `0.55` / `0.90` 并适当收敛 `novaGlow` 峰值透明度（`0.6 -> 0.42`），满充爆发时绿色十字与金色四角星清晰跃出。

---

## 3. 历史基础贡献（M0–M4）

- 完成 M0-A、M0-B、M1、M2、M3、M4 全部核心代码开发、Patch 14.14 资产转换与 Meshopt/WebP 压缩（`172.56 MB` → `36.75 MB`），详见 [`PROGRESS.md`](../../PROGRESS.md) 与 [`AI_HANDOVER.md`](../../AI_HANDOVER.md)。

---

## 4. 下一步建议

1. **部署线上更新**：将最新 `main`（含 `AG-08` 14.14 原版 SFX+BGM、`PR #3` A 类 14.14 数值对齐、`AG-09` 雷克塞 42 动作与 Wrap/Plane 子网格修复）发布至 Cloudflare Worker `tideline-swarm`。
2. **雷克塞 14.14 招式/特效深化**（基于已解包的 55 个 `reksai_vfx/*.json` 网格 + 42 动作）或 **等待用户确认后开启 M5**（低/中/高三档画质验收 + `weapon_vfx.ts` 补齐 `teammateVfxScale` + `game.ts` 预留 `players[]` + 清理未使用的 `lan.ts` 与 `compress_assets.mjs` 绝对路径）。
