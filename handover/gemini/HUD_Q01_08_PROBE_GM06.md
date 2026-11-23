# GM-06 · Q01-08 48 张 HUD 贴图 CommunityDragon 14.14 直链实测报告

> 作者：Gemini（GM-06）· 2026-11-23 19:46 CST · 仅 KV（不碰 PR #9 或任何 UI 代码）
> 核验依据：`pending/bab01-quick/docs/bab01/quick_hud_assets_14.14.md` 第 4 节（48 张逻辑贴图 = 13 张直接图集 + 7 张 `uiautoatlas` 母图覆盖 35 张散图）；对应验收单 `handover/gpt/BAB_Q01_ACCEPTANCE_GPT13.md` 第 2 节 `Q01-08`。

## 1. 实测总览

- **实测结果**：**20 / 20 实际 PNG 文件（覆盖 48 / 48 逻辑 HUD 贴图）100% PASS**，0 失败 / 0 个 404，无需解包 WAD。
- **验证方法**：对每个 [CommunityDragon 14.14](https://raw.communitydragon.org/14.14/game/) 直链发送 `GET Range: bytes=0-23`，逐项核验 HTTP 206、`Content-Type: image/png`、8 字节 PNG 魔数及 IHDR 精确像素宽高（供后续 `uiautoatlas` 按归一化 UV 裁切）。
- **总原始体积**：20 张 PNG 合计约 **6,386,431 字节（6.09 MiB）**（压缩转 WebP 后体积将大幅下降）。
- **仍待后续处理的 Q01-08 非直链项**：升级卡 9 个界面特效定义、敌方头顶血条样式映射（6/19 待确认）、1600×1200 设计坐标到真机安全区缩放与字体核对，以及与 [PR #9](https://github.com/cianasa222/swarm-remake/pull/9) 的 UI 边界协调。

## 2. 13 张直接图集实测明细

| 路径（前缀 `https://raw.communitydragon.org/14.14/game/`） | HTTP / PNG | 分辨率 (IHDR) | 字节数 | Last-Modified (GMT) |
| :--- | :---: | :---: | ---: | :--- |
| `assets/ux/cherry/augments/augmentselection/cherry_modalatlas.png` | 206 ✅ | 1024×1024 | 180,854 | 2023-10-17 22:37:14 |
| `assets/ux/common/tooltipatlas.png` | 206 ✅ | 32×16 | 326 | 2024-07-23 01:37:39 |
| `assets/ux/gamemodes/slime_atlas.png` | 206 ✅ | 1024×1024 | 658,869 | 2023-10-17 22:34:15 |
| `assets/ux/lol/animatedmeters.png` | 206 ✅ | 1024×2048 | 1,989,817 | 2024-07-28 23:58:27 |
| `assets/ux/lol/clarity_abilityatlas.png` | 206 ✅ | 1024×1024 | 485,307 | 2024-04-25 00:20:07 |
| `assets/ux/lol/clarity_hudatlas.png` | 206 ✅ | 1024×1024 | 367,427 | 2023-12-07 22:22:47 |
| `assets/ux/lol/clarity_levelupatlas.png` | 206 ✅ | 1024×1024 | 287,438 | 2023-10-17 22:35:46 |
| `assets/ux/lol/clarity_levelupatlas2.png` | 206 ✅ | 1024×2048 | 1,326,818 | 2024-07-28 23:56:47 |
| `assets/ux/lol/clarity_resourceatlas.png` | 206 ✅ | 512×128 | 10,906 | 2023-08-04 01:14:00 |
| `assets/ux/lol/hudresetatlas.png` | 206 ✅ | 1024×1024 | 462,999 | 2024-07-28 23:59:13 |
| `assets/ux/lol/perkssummonerspecialistui_atlas.png` | 206 ✅ | 128×128 | 3,340 | 2024-07-28 23:59:52 |
| `assets/ux/lol/statspanel_atlas.png` | 206 ✅ | 512×512 | 47,975 | 2024-07-28 23:56:31 |
| `assets/ux/strawberry/playerframe/strawberry_xpatlas.png` | 206 ✅ | 1024×1024 | 45,937 | 2024-07-23 01:37:48 |

## 3. 7 张 `uiautoatlas` 母图实测明细（覆盖全部 35 张散图）

| 路径（前缀 `https://raw.communitydragon.org/14.14/game/`） | 覆盖散图数 | HTTP / PNG | 分辨率 (IHDR) | 字节数 | Last-Modified (GMT) |
| :--- | :---: | :---: | :---: | ---: | :--- |
| `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png` | 12 | 206 ✅ | 2048×128 | 41,646 | 2024-07-23 01:37:48 |
| `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryrounds/atlas_0.png` | 8 | 206 ✅ | 2048×256 | 62,875 | 2024-07-23 01:37:43 |
| `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryplayerframe/atlas_0.png` | 5 | 206 ✅ | 1024×256 | 42,722 | 2024-07-23 01:37:49 |
| `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryherostats/atlas_0.png` | 3 | 206 ✅ | 1024×1024 | 301,924 | 2024-07-23 01:37:49 |
| `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryplayerinventory/atlas_0.png` | 3 | 206 ✅ | 512×128 | 5,150 | 2024-07-23 01:37:41 |
| `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberrygameheader/atlas_0.png` | 3 | 206 ✅ | 1024×128 | 51,541 | 2024-07-23 01:37:42 |
| `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberrybosshealthbar/atlas_0.png` | 1 | 206 ✅ | 256×128 | 22,888 | 2024-07-23 01:37:47 |
