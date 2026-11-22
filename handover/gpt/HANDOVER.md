# GPT 交接文档（资源溯源、缺失资产与协作审查）

> 作者：GPT（ChatGPT） · 2026-11-23 CST · GPT-01
> 职责：资源来源调查、证据分级、按需解包方案、协作规则审查；不抢占他人任务，不擅自开发、合并代码或部署。

## 1. 改动索引

| 编号 | 日期 CST | 提交 | 文件 | 改了什么 | 验收 | 部署 | KV |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GPT-01 | 2026-11-23 | `git log --grep "GPT-01"` | 本文件（新增）、handover/README.md（+1 行）、COLLAB.md（新增 GPT 补充节） | 资源最小获取策略、证据标准、协作漏洞审查 | 文档核对 | 不涉及 | 以 KV SYNC_STATE.json 读回哈希为准 |
| GPT-02 | 2026-11-23 | `git log --grep GPT-02` | RESOURCE_SOURCES.md（新增）、COLLAB.md、入口、本文件 | 统一渠道及禁止无证据否定 | 文档核对 | 不涉及 | 以 KV SYNC_STATE.json 为准 |
| GPT-05 | 2026-11-23 | `git log --grep GPT-05` | 首页、画质管理、渲染、浏览器测试入口 | 用户授权接手登录/设置；纯代码首页与游客；邮箱跨站授权待实现 | build 通过；浏览器环境拒绝 socket，待真机验收 | 未部署 | 分支，合并后同步 |

## 2. 接手基线

已读交接入口、COLLAB、Quick / Antigravity 交接、AGENTS、AI_HANDOVER、PROGRESS、Issue #1 / #4 及评论、雷克塞审计及缺失资产清单。基线 main `85714eadad3b8f3a0fb62653835ded9582be005f`（Q-20）。KV 对上述交接正文逐一比对一致；KV 状态所记 commit 同基线。M0–M4 已完成阶段验收，不等于完全 1:1；M5 等用户确认。AG-05 已上线 Worker 版本 701860ff；PR #3 尚待验收，不能按已合并处理。Issue #1 Muse 已领取 T1/T2/T4（评论可见）；AG-03 已交付喷泉 5 个 Nova 网格及 15 张贴图，先查剩余小怪配置，不重复下载。Issue #4 A 金克丝已补，B 雷克塞动作/子网格/VFX、C 原版音效、D 出场仍待执行。未领取这些执行任务，本轮无代码/资产改动。

## 3. 核心策略：缺什么才获取什么

1. 先对比最新 main、已部署版本、`public/assets/`、现有 GLB clip/材质、KV `ref/14.14/`、本机 map33_tools/gamedata 和备份、Issue 最新评论、其他 AI 已交付文件。以功能/事件为单位列缺口；已有合格资产直接复用。注意同一贴图可服务多套 VFX。
2. 优先现成已转换资源或 14.14 社区直链。验证 HTTP 状态、文件签名/解析、完整性、版本/语言、路径、哈希和使用许可；不能把 HTML 错误页当资源。404 仅说明该地址未提供，不说明客户端无此资源；403/超时记为未读取。14.15、14.16及后续仅交叉验证；相同内容需同源哈希或字段差异证明，不默默替换 14.14。
3. 仍缺才用 14.14 原版 Windows 游戏清单定位最小 WAD。已有本机同版清单优先，否则使用 14.14.6034237（17A8CACF07883D41.manifest）。先列清单，再精确匹配实际包名/语言；Map33 内可能包含敌人和 Boss，不假定每个角色有独立 WAD。过滤器 -f 作用于清单文件路径而非 WAD 内条目；下载必要 WAD 后用哈希表定位并只提取所需条目及依赖。共享音频/地图包仅在依赖证据指向时追加；不下载整个客户端，不盲目解包所有英雄/地图。不确定体积时先估算并报告。
4. 仅转换缺失文件，保持现有命名/动画/骨骼兼容、压缩规则和统一加载契约。临时落盘、校验后原子移入；阶段验收记录真实结果。资产及对应功能一起交付；若修改 src 超出 Issue 范围，先明确授权。不得把原始 WAD、原始音频库或私有参考数据推公开仓库；既有压缩资产公开政策不变，新增发布需遵守权利限制。
5. 每个缺失项记录：Issue 子任务 | 游戏原路径/路径 hash | manifest 小版本及 ID | WAD/语言 | 获取 URL | 源 SHA-256 | 工具版本和命令 | 输出路径/哈希/体积 | 对应事件或层 | 证据等级 | 验收 | 未知项。保留失败原因与替代渠道，供下一 AI 续接。

## 4. 资源渠道（现成优先，候选不等于已验证）

| 渠道 | 用途与边界 |
| --- | --- |
| [现有项目](https://github.com/cianasa222/swarm-remake)、KV、本机缓存、[运行时 CDN](https://tideline-swarm.cianasa888-gbd.workers.dev/assets/) | 已转换资源首选；运行时 CDN 不是原版证据，版本随部署变化 |
| [CommunityDragon 14.14](https://raw.communitydragon.org/14.14/game/) | BIN JSON、PNG、部分模型，见 AI_HANDOVER 与缺失清单；动画图 JSON ≠ ANM，事件名 ≠ 音频。未确认 Swarm 原版音效/动作二进制直链 |
| [CommunityDragon Docs](https://github.com/CommunityDragon/Docs) / [CDTB](https://github.com/CommunityDragon/CDTB) | WAD 路径与提取工具、哈希表 [hashes.game.txt](https://raw.communitydragon.org/data/hashes/lol/hashes.game.txt) |
| [Morilli/riot-manifests](https://github.com/Morilli/riot-manifests) | 历史清单索引，不是音效或客户端实体。正确目录 lol-game-client，非 lol-standalone-client-content |
| [官方 14.14 清单](https://lol.secure.dyn.riotcdn.net/channels/public/releases/17A8CACF07883D41.manifest) / [ManifestDownloader](https://github.com/Morilli/ManifestDownloader) | 从 Riot CDN 按实际清单条目拉取必要 WAD；具体旧数据块是否仍可下载须实测 |
| [Riot Archive Project](https://archive.org/details/riot-archive-project-lol) | 历史客户端备用候选，未验证具体 14.14 文件及完整性，不能直接当权威资产 |
| [Sound Vault](https://github.com/VaultSoft/sound-vault) / [LoL Wiki](https://wiki.leagueoflegends.com/en-us/Swarm) | 社区音频/录像/攻略补充候选；普通英雄或其他皮肤音效不等于 Swarm 音效；Wiki 两首音乐见缺失清单 F，可能转码，需权利及版本核实 |
| [lol2gltf](https://github.com/LeagueToolkit/lol2gltf) / [vgmstream](https://github.com/vgmstream/vgmstream) / [bnk-extract-GUI](https://github.com/Morilli/bnk-extract-GUI) / [wwiser](https://github.com/bnnm/wwiser) | 动画/模型转换、Wwise bank 分析和媒体解码；工具版本、支持格式与命令先查帮助，不猜参数 |

## 5. 重点解决方案：雷克塞与音频

- B1/D：从动画图建立逻辑 clip → ANM → SKL/SKN 依赖图，53 逻辑片段与 42 独立 ANM 不是同一个计数；审计记录 8 段已导出，34 待补是候选差集，必须枚举现有 GLB、去重后复核。先定位出场相关动作，验证过渡、循环、骨骼挂点及实际录像帧时间，别凭文件名认定出场顺序。
- B2/B3：SKN 子网格名称/索引为直接证据；OBJ 体积推断只是候选。将 308 条引用去重并查现有资产，按登场→落石→钻地→飞弹→隧道→撕裂分批。贴图直链优先；SCB/动画依赖才解包，保留 UV、颜色、曲线和父级变换。
- C：从 14.14 map33、角色皮肤与音频配置收集实际事件名（首领 15 个见清单 C）。按清单定位 SFX / VO / Music 相关 WAD、共享银行、语言包。解析 events bank 的 Event→Action→Sound/Random/Sequence/Switch→Media ID，结合音频 bank 与 WPK/WEM 取媒体，保留事件随机变体、增益、重复、循环、停止和触发时机；不能凭 WEM 数字编号或听感硬配。SFX 与 VO 分开，VO 语言待用户确认。按实际格式解码；必要时经 PCM/WAV 再编码 Ogg，不能仅改扩展名。先雷克塞登场及技能、再金克丝、小怪、喷泉/补给、HUD/升级、BGM，分批验证事件触发、音量、循环停止、并发限流、浏览器音频解锁。合成音仅明确标注临时 fallback，不能算原版已完成。
- 验收须记录原始路径、事件映射、输出 SHA、实听/录像比对；代码照原事件驱动，保留音量与节流，避免渲染反向改变 sim。正式交付遵循现有 build/playtest/截图规则。

## 6. 证据分级与推断边界

- A 原版明确：14.14 客户端字段、媒体、动画、网格直接可读，完整路径/字段/原值/单位/换算/条件可追溯。客户端字段可能有多种速度或继承覆盖，需解析实际生效字段。
- B 原版派生：VFX 几何、动画长度、事件关联等计算值，明确公式及假设，不等同服务器伤害/碰撞范围或攻击前摇。
- C 实机测量：14.14 录像链接、时间码、帧率、难度/人数、测量方法、重复样本与误差。后版录像单列。
- D 未知/临时：查不到或证据冲突，留待确认。不得把未读取写成不存在；不得把猜测填成官方值或为了通关率反调已证实原版字段。

雷克塞报告中飞弹的视觉坑半径 5.6m 与字段 5.75m 只是单一对照，不能推出其他技能误差小于 3%。客户端有 53 动画片段/38 VFX 不等同已导出媒体或已实现技能。服务器脚本不存在于已检查客户端数据和完全不可获得是两个结论；先检查可解析依赖、地图、BUFF/Spell/动画图，再根据录像估计，注明置信度。Riot 关于 [Swarm 技术](https://www.riotgames.com/en/news/the-tech-behind-swarm) 可作架构背景，不提供具体私有脚本数值。

## 7. 协作规则审查（待全体协调的事项）

- 目前 README 第 5 节及 PROGRESS 有过期状态，Issue #1 看板仍写待领取，实际 Muse 已领、AG-03 已补喷泉。建议状态以最新 main、Issue 评论、PR 合并和部署证据为准，避免重做。
- 原规则“下载和补功能一起完成”与 Issue #4 B3 “只放资源也行”冲突；部分任务禁止 src。需 Issue 明确允许路径与剩余接入责任，不能以资源已下等于功能完成。
- 多 AI 同改 KV：读改写无原子 CAS，可能覆盖索引；SYNC_STATE 同时有 sha256/files 和 synced_at_utc/synced_at，数值不一致。建议单写者/交接确认，提交前后重读，双字段兼容更新，逐项哈希校验，不把部分同步宣布全局一致。
- 任务部分交付不得用 Closes #N 关闭整个未完成 Issue；子任务独立领取，24h 更新不得抢占仍有效领取。合并后再同步 main，不把分支镜像当主线。
- 所有 AI 统一状态：发现→领取→资源验证→接入→构建→审查→合并→部署→KV 核验，不跳级。文档专用提交可免运行时 build，但不可声称游戏验收。保留测试失败和未运行原因；公开仓库不放密钥、原始档案。

本轮仅提交文档与规则补充，不认领执行、不改代码、不部署。之后 GPT 按 COLLAB 与上述原则协作。

## 8. GPT-02 用户补充要求

统一资源来源渠道与查证结论，见 [RESOURCE_SOURCES.md](./RESOURCE_SOURCES.md)。任何 AI 不得将未检索到、站点未收录或访问失败等同原版不存在；新增渠道统一登记。私人非商业娱乐；原始资产私有保存。Muse 的 10 WAD 方案先验证依赖，不预判齐全或缺失。

## 9. GPT-05 登录与设置接手

- 基线 main `94dc89f2`，AG-09 已合并，待部署；另有 `gpt/mobile-framing-and-upgrades`（GPT-04 `e0e8fd3`）独立处理横屏镜头与升级卡，禁止重复修改。
- 用户要求：纯代码、精美 iOS 风格登录首页，垃圾处理器邮箱与游客，详细画质、减轻队友特效。升级/补给箱经验节奏问题另记待办，不在本轮改变经验数值。
- 已实现：代码绘制灯塔/月夜/海潮，玻璃面板、动效、横竖屏、安全区、减少动态偏好；游客点击后动态加载 Three.js；画质细节持久化，同步准备/暂停界面：实时阴影（关闭/1024/2048）、特效装饰粒子、渲染分辨率、队友枪口装饰 VFX 预留（现单人，不代表完整联机特效过滤）。核心技能判定与敌方预警不变。
- Cloudflare 实际核对：`trash-simulator-auth` 现有邮箱接口 `/api/auth/email/`，限定 AUTH_ORIGIN，现有登录会话机制不支持已验证的跨应用授权。原站 `https://game.cianasa888.cfd/` 账号入口已链接，明确未完成游戏邮箱登录。下一步需设计原站授权码回跳、游戏服务端兑换及独立会话；不得复用垃圾处理器存档、跨域密码表单、伪造登录成功或放宽全站 CORS。未改原账号服务。
- 验收：`npm run build` 通过；浏览器启动因平台 socket EPERM 失败，未完成视觉验收。提交独立 PR，合并前须在可用设备核对登录、游客、低/高阴影切换、设置重载、暂停菜单与横竖屏。不得部署未验收版本。
