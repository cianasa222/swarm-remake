# GPT-13 · BAB-Q01 交付验收及缺口清单（2026-11-23 CST）

**结论：数据包完整性/可复现性 PASS；集成、完整性覆盖、构建、视觉、性能及上线验收未通过。** 本次仅验收与登记，不代上传 Quick 的代码，不合并、不部署、不删除任何资产或 KV 原件。

## 1. 验收证据与实际范围

- 权威主线：`94f649f8d65ccc1cc55157986ad962b036bf5fb8`（GPT-12a）。旧线上版本仍以实际 Worker 部署记录为准（MU-01 记录 `5955ad9a`）。
- Quick BAB-Q01 原件：KV `pending/bab01-quick/`，14 个文件、2,879,270 字节。首次验收时 14/14 SHA-256 与当时 MANIFEST 一致。QC-18 后 README/manifest 已更新，代上传前必须重读当前清单、再次逐项校验；不得用本报告旧哈希覆盖新文件。
- 输入：KV `ref/14.14/data/maps/shipping/map33/map33.bin.json`、`ref/14.14/data/characters/strawberry_jinx/skins/skin0.bin.json`、`ref/14.14/data/characters/strawberry_boss_reksai/skins/skin0.bin.json`。在隔离环境重放 Quick 转换逻辑（原文算法，Web Crypto 预计算原系统 SHA-256），6/6 输出文件逐字节 SHA-256 与首验清单一致。不是实机运行器验证。
- 以最新 main 的 src/tools 和现有依赖隔离检查新增两个 TS 文件。 `tsc --noEmit --types vite/client,node` 无报错；默认 `tsc --noEmit` 返回 1，报错位于主线原有 `tools/q28-regression.test.ts` 的 `node:assert/strict`、`node:fs`（TS2591，Node types 未配置）。 `node --check tools/bab/extract_vfx_14_14.cjs` 正常。正式 build/playtest/截图未完成，不能标 PASS。
- 本包的 `README.md` 是任务说明，不可覆盖仓库根 README；代上传到 docs/bab01 或自身交接目录。原始 BIN 仍保存在 KV，不进公开仓库；派生 JSON 的公开发布边界先核实，保留源路径与哈希。

| 范围 | 系统 | 图层 |
| --- | ---: | ---: |
| 喷泉 | 4 | 52 |
| 9 种武器 | 38 | 144 |
| 金克丝 | 28 | 94 |
| 小怪/精英 | 11 | 101 |
| 雷克塞 | 41 | 351 |
| 合计 | 122 | 742 |

Map33 原始 454 个 VfxSystemDefinitionData，转换选入 56，未入选 398（含其他地图、未实装武器、商店等，不可把 398 全算第一关缺失）。金克丝皮肤 28/28、雷克塞皮肤 38/38（另有 3 个 Map33 雷克塞系统）纳入。已核对无重复系统 ID，抽查常用曲线字段未发现空曲线或未映射的检测对象；**不等于全部原版语义无损、也不是视觉通过。**

## 2. 缺陷、缺项与验收门禁（按优先级）

| ID / 优先级 | 验收发现 | 必须补齐/验证 | 执行者 |
| --- | --- | --- | --- |
| Q01-01 / P0 | 分类正则要求武器关键词后为下划线/结尾，漏掉回旋刃三个进化系统：`Strawberry_Weapon_BoomerangEvolve_Missile_Return`、`Strawberry_Weapon_BoomerangEvolve_Missile`、`Strawberry_Weapon_BoomerangEvolve_Mini_Missile` | 在 Map33 BIN 按实际技能/事件引用修正规则，补测试覆盖基础/进化/返程/小弹；重新生成数据并校验完整性 | 任意能做的 AI；Quick 可 KV 修订 |
| Q01-02 / P0 | 当前玩法已存在但分类漏掉：补给箱 `Strawberry_Destructible_MetalBox_{Idle_01,Explosion,Spawn}`；`Strawberry_Drop_XP_High_Pickup`、`Strawberry_Drop_XP_Pickup`、`Strawberry_Drop_Health_Heal`、`Strawberry_Rebuild_Drop_Health`、`Strawberry_Rebuild_Drop_Health_Missile`、`Strawberry_Rebuild_Drop_Gold_Pickup`；`Strawberry_Elite_Glow`、`Strawberry_Elite_Zone_Glow` | 对照 main sim 事件、14.14 源系统和原版录像，补拾取/补给/精英等当前关卡范围内的定义和统一事件绑定；确认其余复活、事件、地图环境系统是否属于当前范围。不得编造定义 | 任意能做的 AI |
| Q01-03 / P0 | 496 个去重贴图引用全部 project=null。124 个网格路径引用（含各格式），10 个 attachedMesh 图层没有独立网格名，需实体绑定（例如 Elite_MissileFast_Glow Avatar/Fresnel） | 建立逐路径表：原版路径/哈希→主线现成资产→备用库→转换输出/挂点→事件。核对 CDN 实际响应格式/版本，不把构造 URL 当可下载证明。124 是引用而非 124 个缺失文件，不能简单减现有数量。已存在优先复用 | 任意能做的 AI |
| Q01-04 / P0 | RenderPort 只有类型；无 Babylon 初始化/Three 适配/主循环迁移/实际运行时 | B1 建立唯一 render loop，迁移 main 的 vfxOptions、consumeEvents、stats/相机/resize/warmup 等；自动 WebGPU→WebGL2 回退；验证旧功能及不影响 sim，当前依赖仍 Three | 任意能开发及实机验证的 AI |
| Q01-05 / P0 | B4 只有 EffectDef/转换数据，无真实播放器；742 层尚未播放，场景/模型/粒子预算和事件所有者未验证 | 实现池化、批处理、生命周期、曲线/随机表/UV/翻页、挂点、光束与轨迹、地面投影和视觉关键等级；按源系统逐层截图比对；敌方预警不因降特效/低档丢失 | 任意能开发及实机验证的 AI |
| Q01-06 / P0 | 主线默认 tsc 构建阻塞（上节 TS2591）；Quick 未跑完整 build、playtest、浏览器 | 独立 PR 修正 Node types 依赖及配置，避免扩大到无关代码；默认 build、playtest、质量/音频/auth 回归全部通过；零控制台异常/资源失败；1280×800 与真实 iPhone 横竖屏截图 | 任意能做的 AI |
| Q01-07 / P1 | alpha 侵蚀 156 层、软粒子 44、反射 22、子系统 14、颜色查找 Y 72、Navmesh 遮罩 87、FlexShape 59、力场 4、调色板 12 等仍不支持；特殊 blend mode2/3/5 共 18 层（1/15/2） | 保留原值并逐项实现或记录有依据的 fallback；未知混合模式不得宣布已还原。粒子尺寸 0.02×birthScale 原版单位比例与金克丝旧系数差异待同机位截图标定；禁止误用世界单位 | 任意能开发及实机验证的 AI |
| Q01-08 / P1 | HUD 调查列 48 张（13 atlas + 35 loose/auto-atlas），未验证下载及完整映射；1600×1200 设计坐标非设备实际像素；9 个升级 UI VFX、敌方血条样式映射（6/19 待确认）、字体仍待查 | 原版资源真实验证；底部血量/经验/头像、顶部 Boss 条、UV/动画、缩放安全区；不要凭普通 LoL UI 推断 Swarm 头顶条；React/HeroUI 仅壳层及设置等，战斗 HUD 复用原美术；保持 PR #9 独立、不抢其他 UI 路径 | GPT/UI 或任意经协调的 AI |
| Q01-09 / P1 | B0 缺原版同机位截图、性能基线；B2/B3 未迁移地图/材质/相机、已有 GLB 动画、小怪等；4 个小怪缺动作为既有待办 | 先复用现有 42 ANM 雷克塞备用/已转换资源、已有小怪模型/动画及 736 OGG 库，核对实际 clips、映射/LOD/材质；需求缺口才补解包；原音效复用 AG-08 93 条及 5 首 BGM 并验证事件和同步 | 任意能做的 AI |
| Q01-10 / P2 | 其他 8 位英雄未进入本次转换范围；完整关卡/额外武器、环境和升级特效待后续 | 最新主线以已实装玩法为本轮优先；做对应角色时按 14.14 原版逐角色生成定义、绑定动作/技能/音效；不把未实装范围标为当前任务通过条件，不盲目全包下载 | 任意能做的 AI |

## 3. 资源执行规则（必须遵守）

1. 首查 GitHub main `public/assets/`、[14.14 备用资产库](ASSET_LIBRARY_14.14.md)、本机已解包目录及 KV；保留 asset/14.14-unpacked-assets-20261123 所有独有资源。55 个备用 VFX 网格、16 个补充小怪模型、736 OGG 与本批引用并非已核对的一一对应差集。
2. 再查 [统一资源来源](RESOURCE_SOURCES.md) 与 CommunityDragon 14.14 直链（实际下载验证）；最后按 14.14 Windows manifest `17A8CACF07883D41.manifest` 定位最小 WAD / 哈希，缺哪项解哪项并转换。14.15/14.16 仅作补充、交叉验证留痕。不认定未读=不存在，不下载整个客户端。
3. 贴图/网格输出按现有 `public/assets/` 命名及资产契约，Babylon 运行时映射写入独立清单，保留源路径、版本、SHA、转换工具与实测回执；源 BIN/WAD 不发公开库。禁止重复导入已存在资源、覆盖他人备用资产或将 HTML 404 当 PNG。
4. QC-15 更正必须延续：Crossbow=PierceShot、Bunnymega=StarStrike、Cyclonic=HolyBauble；此前误配的 Q25/Q28 色值不得复用。Q01 数据覆盖与视觉验收需分别记录。

## 4. BAB-01 阶段状态、交付顺序与上线门禁

- B0 部分完成（模块清单有，实机基线未验）；B1 仅接口；B2、B3 未迁移；B4 数据准备部分完成（Q01-01～03 等未清），未有实际运行器；B5、B6、B7 未验收/未执行。
- 先并行补 Q01-01～03、Q01-06 和 B1；B2、B3 复用原资产；B4 实现通用 VFX；B5 性能优化；B6 同机位/原版视频、build/playtest、登入、动作音效、队友特效及真实 iPhone 双后端/兼容性测试；B7 用户确认后才发布、回滚核验及按 COLLAB 2.4 清理。
- 交付采用独立任务/分支和 PR；Quick 固定仅写 KV，其他授权 AI 按最新 manifest 逐项代上传。禁止把数据完整性 PASS 写作引擎/全功能验收 PASS。每次 GitHub 提交和 KV 双端交接，待验收项清楚标记；用户未授权合并和部署时保持旧线上版本。
