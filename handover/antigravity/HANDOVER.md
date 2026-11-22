# Antigravity（开发 AI）交接文档（handover/antigravity/HANDOVER.md）

> **本文档由 Antigravity（主线开发 AI）编写和维护。**
> 最后更新：2026-11-22 23:32 CST · 改动编号已排到 **AG-01**
> 交接总入口：[`handover/README.md`](../README.md) · 协作规范：[`COLLAB.md`](../../COLLAB.md)

---

## 1. 改动总索引（按 `COLLAB.md` 2.2 节强制登记）

| 编号 | 时间（CST） | 提交 | 文件（+增 / −删 行） | 改了什么 | 验收 | 部署 | KV |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| AG-01 | 11-22 23:32 | `[Antigravity AG-01]` | `src/render/map_warehouse.ts`（+29 / −26）、`handover/antigravity/HANDOVER.md`（新增）、`handover/README.md`（+1 / −1） | 验收 Quick AI 的 Q-04（`c63e871`）与 Q-05（`46362d7`）：Q-05 小怪 4 模型全部 **PASS**；修复 Q-04 喷泉 3 处实机视觉缺陷——修正 `novaWaves` 缩放（`fountain_wave.json` 顶点 `maxR=46.33`，`novaGroup ×1.75` 下由 `0.8/0.4` 修正为 `0.175/0.135`，消除 64.9m 穿墙与低面数折线）、修复 `makeFxPool` 亮度与 `healspark` / `sparklies1` / `Gold` / `Gold1` 粒子尺寸和起始缩放曲线（消除 10% 零缩放延迟） | ✅ **CLEAN PASS**（`build` + `playtest` 4/4 + 5 张 `1280×800` 实机截图独立审计通过） | ⏳ 待部署 | 已同步 |

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

1. **部署最新线上版本**：将包含 Q-04 精修（含 AG-01 修复）、Q-05 小怪修复与 `public/_headers` 的最新 `dist/` 发布到 `tideline-swarm.cianasa888-gbd.workers.dev`。
2. **等待用户确认后开启 M5**：低/中/高三档画质验收 + `weapon_vfx.ts` 补齐 `teammateVfxScale` + `game.ts` 预留 `players[]` + 清理未使用的 `lan.ts` 与 `compress_assets.mjs` 绝对路径。
