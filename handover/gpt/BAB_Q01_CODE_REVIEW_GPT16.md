# GPT-16 · Quick BAB-Q01 + Gemini GM-02/03 代码审查

- **范围**：Quick 提供 B0 渲染清单、RenderPort、EffectDef、HUD/原版 VFX 资料；Gemini 提供最新转换器、单测、六类数据、资产映射。两套数据以 Gemini 为主，不用 Quick 旧 122 系统覆盖新版。
- Quick 原始 KV MANIFEST：13/14 项匹配，唯一不一致为后来修改的 README 哈希；其余源码/数据均核对过。Gemini 13/13 全部匹配。README 和 MANIFEST 是 KV 工作流原件，不覆盖仓库根 README；原件留 KV。
- **修复**：解析 ResourceResolver 哈希关联（回旋刃返程弹、RapidShot 粉弹）；将三套金币特效和用途不明的 AnimaSquad_Card 标记 `gameRefs.inGame=false`，阻止错误事件绑定。
- 14.14 BIN 验证新增 5 个系统：MiniBoss HealthBar(4)、MapBoss Healthbar(6)、MapBoss Enraged(2)、Spawner SpawnVFX(4)、SpawnVFX Eye(4)。**157 套特效 / 903 层**（原 Gemini 152/883），五套均禁用自动绑定，待 HUD / 原版录像确定用途。
- Gemini GM-03 原来 555 张贴图（含 95 主线路径）不作假定替换；新增 9 张纹理、2 个网格引用标为未验证，需按需下载/解包。原版 BIN/WAD 不进公开仓库。已有 42 个缺失网格依然待补。
- MapA 环境 19 项与 AnimaSquad_Card 用途，按 QC-19 用户决定交由录像验收方定；此次不虚构结论、不激活。
- 转换器直接从 BIN 再生成 JSON 时不含 GM-03 的 `project` 路径回填，比较须同时复用资产映射；此行为属现有生成/二次映射流程。检验 `node --test tools/bab/extract_vfx_14_14.test.cjs`、`npm run build`，运行结果见 PR/CI。
- **尚未完成**：Babylon B1 引擎、B4 VFX 运行器、纹理及网格全部验证、WebGPU/WebGL2 实机与 iPhone 对照、部署；不得将数据通过称作上线通过。

## CI 发现并修复的主线构建配置缺陷

首次 CI `npm ci` 通过，`npm run build` 在旧 `tsconfig.json` 上因 `tools/q28-regression.test.ts` 引用 `node:assert/strict`、`node:fs` 且未安装 Node 类型报 TS2591。构建仅需检查浏览器运行时代码，调整 `tsconfig.json.include` 为 `src`；工具的行为检查改由专门 Node/tsx 单测覆盖。此改动不影响游戏玩法、脚本运行或部署。
