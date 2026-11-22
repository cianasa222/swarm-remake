# 统一资源渠道与查证登记表（GPT-02 · 2026-11-23 CST）

适用所有 AI、所有资产类型。项目为朋友间私人娱乐、非商业；原始资产私有留存。不改变现有仓库可见性或部署权限。GitHub main 是唯一统一索引，KV 为镜像。每次开工读本表、最新 Issue 和现有资产。新增渠道应增量登记，不能另立互相冲突的来源清单。

| 渠道 | 类型/用途 | 已确认边界 |
| --- | --- | --- |
| main public/assets、KV ref/14.14、现有部署 CDN、本机 map33_tools/备份 | 已有资源及参考数据 | 优先复用；部署版本须核对 |
| [CommunityDragon 14.14](https://raw.communitydragon.org/14.14/game/) / [文档](https://github.com/CommunityDragon/Docs) / [哈希](https://raw.communitydragon.org/data/hashes/lol/hashes.game.txt) | 已转换配置、贴图、模型、路径 | 某个直链缺失不能证明原版无此文件；14.15/14.16及后续只交叉验证 |
| [Riot 历史清单](https://github.com/Morilli/riot-manifests) / [14.14.6034237 官方 CDN 清单](https://lol.secure.dyn.riotcdn.net/channels/public/releases/17A8CACF07883D41.manifest) / [ManifestDownloader](https://github.com/Morilli/ManifestDownloader) | 原始客户端 WAD 定向取回 | 清单不是媒体本身；实际 CDN 可用性、包名、大小和语言须验证 |
| [Riot Archive Project](https://archive.org/details/riot-archive-project-lol) | 历史客户端备用 | 14.14 实体尚未验证 |
| [Sound Vault](https://github.com/VaultSoft/sound-vault) | 现成角色音效候选 | 未确认 Swarm 14.14；不可凭名称替代 |
| [LoL Wiki Swarm](https://wiki.leagueoflegends.com/en-us/Swarm) / [Riot 官方 Swarm OST](https://www.youtube.com/watch?v=qr2YUL-taMM) | 音乐、实机与机制交叉验证 | 官方 OST 确实存在；专辑混音不保证游戏内循环/音频事件一致 |
| [Data Dragon](https://developer.riotgames.com/docs/lol) | 官方公开基础数据和图标 | 不保证 Swarm 专属数据完整 |
| [CDTB](https://github.com/CommunityDragon/CDTB) / [lol2gltf](https://github.com/LeagueToolkit/lol2gltf) | WAD 提取、角色动画转换 | 工具不是资产来源 |
| [lol-audio-unpack](https://github.com/Virace/lol-audio-unpack) / [bnk-extract-GUI](https://github.com/Morilli/bnk-extract-GUI) / [wwiser](https://github.com/bnnm/wwiser) / [vgmstream](https://github.com/vgmstream/vgmstream) | 地图及英雄 SFX/VO 解包、事件映射、解码 | 工具公开；14.14 Swarm 具体兼容性待实测 |
| [Riot Swarm 技术说明](https://www.riotgames.com/en/news/the-tech-behind-swarm) | 官方架构背景 | 不等于服务端完整脚本 |

## 强制查证规则

1. 先查已有资产、KV 和本机；再搜官方、社区镜像、GitHub、历史归档和相关语言关键词（Swarm、Strawberry、Map33、Anima Squad、原文件名、事件名、hash）。现成且版本/完整性证实的优先。
2. 仍缺则解析 14.14 游戏 manifest，列出真实 WAD 条目，检查 WAD 内 TOC/哈希、BIN 依赖和媒体事件。只下载缺失项所在包、只提取目标及依赖；不盲下全部客户端。
3. Muse 提出的 Map33 + 九英雄 WAD 是候选最小集合，不是已证明全量；先检查已有 WAD，按实际 bankPath 找共享包、语言包及音乐。确认 Event→Action→Sound→Media ID 每条映射完整后，才能宣称音频齐全。不要用“没有直链”否定 CDN 中的原始音效。
4. 统一状态：已验证可用 / 已定位待下载 / 候选未验证 / 当前渠道未收录 / 访问失败 / 已检查明确范围未发现 / 原版数据未提供（附充分证据）。404、403、超时、搜不到、工具限制均不得写为全局不存在。另一个 AI 有不同证据时须核对，不以身份或旧结论压过证据。
5. 结论必须注明日期、查证人、版本/语言、URL 或实际 WAD 路径、检索范围及关键词、HTTP/解析结果、SHA256（取得实体时）、证据链接和下一步。声称“没有”须限定具体文件/范围；声称“齐全”必须有依赖及缺口清单闭环。无权限或能力则留下可接手清单。
6. 每次查到新渠道增量更新本表，记录已证实与待验证的边界；禁止重复调查已核验且无版本变化的资源。来源冲突按 14.14 原始数据优先，保留冲突记录与复核依据。

记录模板：日期 | AI | Issue/资源 | 来源及版本 | 查证步骤 | 状态 | 证据/哈希 | 下一步。
