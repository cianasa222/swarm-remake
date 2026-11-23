# GPT-10 · 游戏 UI 并行开发交接

基线：main `7c45016`。分支：`gpt/gpt10-heroui`。用户要求 GPT 开发 UI、Quick 并行做引擎迁移的一部分；此分支只做 UI，不迁移渲染器、不合并或部署。

## 实现及接口

- React 19 + HeroUI v3 + Tailwind v4；使用真实 Button/Input/Switch，局部样式，未引入全局 preflight。纯代码冰蓝色登录视觉、月夜灯塔/海潮、玻璃卡片、按压/入场动画，遵循减少动态偏好。
- `src/ui/login.tsx`：游客、邮箱表单、会话恢复、退出/继续，保留正式域名上的现有 `/api/swarm/auth/*`；禁止跨域提交密码，不触碰原账号服务、存档或 Worker。
- `src/ui/game-panels.tsx`：准备/暂停共享状态快照及 `SettingsActions`；画质档、阴影、FX、分辨率、帧率、队友装饰特效、减弱闪光、关闭震屏、静音。`main.ts` 仍调用现有 QualityManager、VFX 与 Audio；切换引擎只需替换该适配层，不必重写 React。队友选项已连现渲染缩放，当前并无完整联机，不能宣称已验收多人过滤。
- 升级卡保留源 offer、原图标、进化条件/等级点、键盘选择及既有暂停机制。战斗 HUD DOM、数值、原版运行资产与 Three.js 渲染模块不变；待 Quick 的 14.14 HUD 数据清单后独立迁移 HUD 布局，能复用原版贴图就用原版，不用 HeroUI 臆造战斗样式。
- 不在战斗每帧运行 React；设置和升级事件触发才更新 React。战斗弹窗避免全屏背景模糊。首屏压缩后 JS 约 104 kB、CSS 约 13.5 kB，战斗仍延迟加载；未做实机 FPS 指标断言。

## Quick 并行任务边界（用户派发）

按 BAB-01 先做 B0 数据清点/基线与 B4 原版 VFX 参数映射，以及 14.14 HUD 资产路径、图集 UV、锚点、原版截图对照清单。缺失资产先证据后转换，保护备用资产，禁止重复下载、全量解包。独立分支/PR，勿同时改 UI/登录/Worker/本分支依赖文件；若需修改共享 `main.ts`，先协调适配接口。不要动 sim 数值或部署线上。完成后交付清单、证据及测试记录，再由主线执行 Babylon 渲染替换。

## 验收与限制

- `npm run build` 通过；`node --import tsx tools/playtest.ts 2 0.85` 四局全部通关；账号网关 4/4；21 个帧率组合/画质覆盖及 Q28 精英动作、18 音效组通过。Q28 测试使用 esbuild Node bundle 注入空 `import.meta.env`（tsx 直接执行缺少 Vite 环境）；不改游戏源码。默认 tsx CLI 的 IPC 被环境禁止，改用 Node loader 执行。
- 独立审查确认 sim/config/render/worker/资产无改动、原账号 API 和 offer 契约保留；修复 HeroUI Switch 控件未包在可点击 Content 内的问题。
- 浏览器启动被环境 socket EPERM 拒绝，不能声称视觉/控制台/资源加载验收完成。已提供 `tools/verify_ui.ts`，在可用浏览器环境运行 `npm run dev`，再执行 `npx tsx tools/verify_ui.ts http://localhost:5173`（可设置 CHROME_PATH），采集桌面、横屏、竖屏及升级/设置截图；另需正式域名测试邮箱登录/会话/退出及 iPhone 实机。截图不要入仓。
- 下一步：完成浏览器/真机检查、Quick 原版 HUD 对照、用户确认后再合并；main 未改变前不得覆写 KV 的主线镜像、SYNC_STATE 或 Quick 独有 pending；合并后按增量与 SHA 核验规则同步。
