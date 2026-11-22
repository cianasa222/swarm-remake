# GPT-07 — Q-28 / QC-15 独立审查及补交

2026-11-23；原始 KV 补丁保留，不覆盖其他 AI 的交付。PR #8 增量审核，未部署。

## 修复与证据

- QC-15：战兔巨爆 = StarStrike、十字弩 = PierceShot、旋风切割器 = HolyBauble。参见 `docs/audit/live_vs_14.14.md`、14.14 Map33 的独立 Evolve_StarStrike/Evolve_Nuke 数据。Q25/Q28 中使用 Nuke 的巨爆改动撤回；旧基线只是近似。实际 StarStrike Target BG4 cyan (.14,.86,.77) 1.1s、Explosion Ground_Inner (.09,.92,.95) .5s、金色中心 (1,.88,.58) .3s、白色 core .5s、地面 rim .7s；下一轮针对正确 emitter 逐层验证普通/进化。Q25 FrostNova 与 Q27 死亡红橙保留。
- 精英：原版 `bw_ironback_death` GLB 1.633s，稳定 ID 槽位、死亡红圈消失、额外 .25s 留帧；只在 HP<=0 时播放，Boss 清场不伪造死亡，重开清空槽位和攻击计时。未改玩法。
- HollowRadiance：普通/进化的两层普通混合+两层叠加，使用原版网格和 WebP；原图已有 alpha，不重复 alphaMap。完整原版 6/9 emitter 仍未实现；四层色值和透明度来源已复核。
- StatikkShiv：普通 .4s、进化 .2s 的视觉寿命，伤害计算保持原样。
- GPT 补做 Q29 音频：从 AG-06 备用资产 `4b1b5f7` 的 `public/assets/audio/global/events.json` 逐项对应真实事件，复用已有 Ogg 并补入 17 个现成样本，不另行解包。9 把武器的关键释放/命中/爆炸共 18 个音频组（RapidShot, PierceShot, Boomerang, HollowRadiance, HolyBauble, StatikkShiv, StarStrike, Mine, FrostNova）。命中按组限频，原版样本解码前有轻量回退；武器释放只发一次音频事件，不依每发弹重复播放。不是完整 Wwise 事件树复刻；返程/循环/停音/多层、各敌人/环境/补给箱和 UI 精准映射继续补齐。

## 验收

- `npm run build` PASS。
- `node --import tsx tools/playtest.ts 2 0.85` 4/4 PASS，bossTime=900。
- `node --import tsx tools/render-quality.test.ts` 21 种组合 PASS。
- `node_modules/esbuild/bin/esbuild tools/q28-regression.test.ts --bundle --platform=node --format=cjs --define:import.meta.env='{}' --outfile=/tmp/swarm-q28-regression.cjs && node /tmp/swarm-q28-regression.cjs` PASS：稳定槽位、死亡/非死亡清理、重置、18 组 Ogg 文件头。
- 真实 WebGL 截图及 Web Audio 播放/iPhone 验收未完成。不能把通过构建和模拟测试当成视听 1:1 验收。不合并或部署运行时代码，待实机确认。

## 仍需其他环境

四种当前普通小怪 GLB 仍无原版动画片段。优先在反重力已有本地 Map33 解包目录精准寻找对应 ANM 及依赖；无才定向解包。禁止跨模型套动作、清理 AG-06 备用资产或下载整客户端来重复现有资产。未完成的 Q24/Q29 逐项验证内部名称及版本，保留原始 KV 记录。

## GPT-08 发布状态（2026-11-23）

用户明确要求先合并部署；PR #8 已合并 main `797ef1d`。构建和回归已通过；视觉和音效仍未实机验收。Cloudflare 上传授权阻塞，线上 Worker 未变更。详细回退点和发布流程见 [DEPLOYMENT_GPT08.md](DEPLOYMENT_GPT08.md)。
