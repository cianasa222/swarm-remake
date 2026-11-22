# GPT-07：14.14 备用资产库保护与动画实测清单

用户要求：**反重力 Antigravity 已上传的本地解包备用资产必须保留**。未上线、未接入 main、暂时无引用，不等于可删。禁止删除/覆盖/强推 `asset/14.14-unpacked-assets-20261123`，禁止按线上文件清单去清理此分支；新增资源使用独立提交，原始 WAD/原始未解包文件不入公开仓库。主线按需求从备用库定向复用，不整库重复下载或部署。所有协作 AI 先查本分支和已有本地解包目录，再查统一资源渠道。

来源：[`asset/14.14-unpacked-assets-20261123`](https://github.com/cianasa222/swarm-remake/tree/asset/14.14-unpacked-assets-20261123)，提交 `4b1b5f7`，AG-06 原始清单 `reference/14.14/UNPACKED_ASSETS_MANIFEST.md`。含 736 条原版音频、55 个雷克塞特效网格、3 个金克丝特效网格和 16 个补充敌人/隧道 GLB。2026-11-23 GPT 直接通过 Git blob 读取 22 个敌人 GLB 的 JSON chunk，统计 `animations` 和 `skins[].joints`，非仅清单推断。

| 文件（均在 public/assets/enemies/） | 骨骼 | 动画片段 | 备注 |
| --- | ---: | ---: | --- |
| enemy_pix.glb | 26 | 0 | main 同 SHA，需补导 |
| enemy_ghoul.glb | 33 | 0 | main 同 SHA，需补导 |
| enemy_hunter.glb | 41 | 0 | main 同 SHA，需补导 |
| enemy_dasher.glb | 23 | 0 | main 同 SHA，需补导 |
| enemy_daisy.glb | 59 | 5 | death/idle/run |
| enemy_divider.glb | 23 | 3 | death/idle/run |
| enemy_exploder.glb | 8 | 3 | death/idle/run |
| enemy_fast.glb | 59 | 2 | death/idle |
| enemy_fuemigo.glb | 24 | 8 | death/idle/run |
| enemy_lancer.glb | 40 | 6 | dash/dash_exit/death/idle |
| enemy_minireksai.glb | 89 | 19 | run/burrow/channel/death 等 |
| enemy_red.glb | 41 | 9 | run/spawn/idle/death 等 |
| enemy_shield.glb | 33 | 5 | run/dash_exit/death/idle |
| enemy_shy.glb | 39 | 5 | idle/run |
| enemy_spawner.glb | 6 | 0 | 待核实原版动画依赖 |
| enemy_swarmer.glb | 22 | 3 | death/idle/run |
| enemy_tibbers.glb | 49 | 4 | death/idle/run |
| miniboss_artillery.glb | 81 | 19 | attack/spell/channel/run/death 等 |
| miniboss_bruiser.glb | 64 | 4 | main 已有，death 未接入 |
| miniboss_dasher.glb | 65 | 0 | 待核实原版动画依赖 |
| reksai.glb | 89 | 42 | main 已有，首领动作映射待深化 |
| reksai_tunnel.glb | 7 | 9 | open/close/spawn/spell4/death 等 |

22 个模型共 146 段嵌入式动画，16 个补充模型中 **14 个有动画（合计 100 段）**，应优先复用并按原版映射接入；不是 16 个模型全缺动作。分支未发现原始 `.anm` 文件；原始动作已转换嵌入 GLB，四个当前普通小怪的原版动作仍需从已有本机解包目录或定向 Map33 WAD 补导。不能随意跨角色套用其他模型的动作。已有资源不再下载，缺哪项才解包哪项。
