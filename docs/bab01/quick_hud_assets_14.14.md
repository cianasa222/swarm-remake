# BAB-01 · 原版战斗 HUD 资源清单（血条 / 经验条 / 等级 / 升级卡）——Quick AI BAB-Q01

> Quick AI（AWS Quick）2026-11-23。**只做核查和清单，没有改任何 UI 代码 / 样式 / 升级弹窗 / 账号接口**（这些模块由 GPT 负责）。⚠️ 只在 Cloudflare KV，待上传 GitHub。

## 0. 结论

1. 原版 Swarm 战斗 HUD 的布局在 CommunityDragon 14.14 的 UI bin 里（`clientstates/gameplay/ux/lol/strawberry/<模块>/uibase.cdtb.bin.json`），**坐标、尺寸、层级、贴图、图集 UV、帧动画参数都能直接读到**，本文件已整理出血条、经验条、等级、头像框、升级按钮 / 动效、首领血条、升级卡的全部元素。
2. HUD 用到的 **48 张贴图全部能在 CommunityDragon 下载**：13 张 `.tex` 图集（`assets/ux/lol/clarity_*.png` 等）+ 35 张散图（被打包进 `uiautoatlas/.../atlas_0.png`，每张的归一化 UV 已列在第 4 节）。**不需要解包 WAD**。
3. 项目现状：战斗 HUD 是 HTML / CSS 画的（`#hp-fill`、`#xp-fill`、`#lvl-badge`、`#boss-bar`、`#boss-fill`、升级卡 `#cards` 等），**没有用任何原版 HUD 图集**；只用了原版武器 / 被动图标（`public/assets/ui/weapons/*.webp`、`passives/*.webp`）和金克丝头像 / 技能图标。
4. **缺口**：① 升级卡的 9 个界面特效系统（`Upgrade_Weapon_*VFX`、`Upgrade_ChoiceBGVFX`、`SpecialDraft_Ceremony`）在 map33.bin 里没有，在 CommunityDragon 的 UI 目录也没找到定义文件，**位置待查**；② 敌人头顶血条（`lolfloatinginfobars`）的类型名是哈希，Swarm 敌人用的 `unitHealthBarStyle` 6 / 19 对应哪一套样式**未解析**；③ 字体、文字样式未核对。

## 1. 坐标约定（原版 UI bin）

- 所有元素的 `UIRect` 以 **1600 × 1200 设计分辨率** 给出（`SourceResolutionWidth/Height`），`position` 是左上角像素坐标，`Size` 是宽高。
- 头像框 / 血条 / 经验条的锚点都是 `Anchor (0.5, 1.0)`（底部居中）：屏幕宽高变化时按底边中点缩放。首领血条 `Anchor` 见原文件（顶部居中）。
- `TextureData.mTextureUV` 是图集里的像素矩形 `[x0, y0, x1, y1]`，图集尺寸见 `mTextureSourceResolutionWidth/Height`（`Clarity_HUDAtlas` 1024×1024、`Clarity_LevelUpAtlas2` 1024×2048、`Strawberry_XPAtlas` 1024×1024）。
- `UiElementEffectAnimationData`：图集翻页动画，`FramesPerSecond` × `TotalNumberOfFrames`，每行 `NumberOfFramesPerRowInAtlas` 帧，从 UV 起点开始排列；`mFinishBehavior` 1 = 播完停住（推断，待截图）。

## 2. 元素清单（来源 `strawberryplayerframe/uibase.cdtb.bin.json` 等）

### 2.1 玩家血条（`PlayerResourceBars/PlayerHPMeter`）

| 元素 | 类型 | 位置 (x, y) | 尺寸 | 层 | 贴图 | UV（像素） | 动画 |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- | :--- |
| `PlayerHP_AnimationGreen` | EffectAnimation | 494,1130 | 538×18 | 6 | Clarity_LevelUpAtlas2.tex | 1,466,463,481 | 30 fps × 60 帧，每行 2 |
| `PlayerHP_Backdrop` | Icon | 494,1130 | 538×18 | 3 | Clarity_HUDAtlas.tex | 393,76,878,94 |  |
| `PlayerHP_BarFade` | Icon | 494,1130 | 538×18 | 4 | Clarity_HUDAtlas.tex | 914,272,930,288 |  |
| `PlayerHP_BarTextureGreen` | Icon | 494,1130 | 538×18 | 5 | Clarity_HUDAtlas.tex | 2,920,461,938 |  |
| `PlayerHP_BarTip` | Icon | 1047,1116 | 12×44 | 7 | Clarity_HUDAtlas.tex | 822,145,834,189 |  |
| `PlayerHP_BookendLeft` | Icon | 490,1129 | 4×18 | 6 | Clarity_HUDAtlas.tex | 469,854,473,872 |  |
| `PlayerHP_BookendRight` | Icon | 1032,1130 | 4×18 | 6 | Clarity_HUDAtlas.tex | 478,854,482,872 |  |
| `PlayerHP_RegenText` | Text | 1000,1132 | 26×13 | 9 |  |  |  |
| `PlayerHP_ValueText` | Text | 722,1133 | 82×12 | 9 |  |  |  |

> 同目录还有资源条 `PlayerPARMeter`（蓝 / 黄 / 白 / 红 / 紫 / 浅蓝 / 橙 7 套皮肤，位置 494,1154 尺寸 538×18），金克丝在 Swarm 里没有法力条，是否显示待截图确认。

### 2.2 经验条、等级、头像框（`Player_Frame`）

| 元素 | 类型 | 位置 (x, y) | 尺寸 | 层 | 贴图 | UV（像素） | 动画 |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- | :--- |
| `LevelBackground` | Icon | 433,1153 | 52×46 | 9 | LevelIndicator_Frame.png |  |  |
| `PlayerExp_Backdrop` | Icon | 462,1181 | 591×16 | 1 |  |  |  |
| `PlayerExp_BarTexture` | EffectFillPercentage | 462,1181 | 591×16 | 2 | Strawberry_XPAtlas.tex | 631,869,679,989 |  |
| `PlayerIcon` | EffectDesaturate | 346,1047 | 136×136 | 5 |  |  |  |
| `PlayerLevel` | Text | 449,1168 | 21×21 | 10 |  |  |  |
| `PortraitFrame` | Icon | 310,1012 | 198×207 | 6 |  |  |  |
| `PortraitFrameUnderlay` | Icon | 344,1046 | 140×140 | 4 | Clarity_HUDAtlas.tex | 803,794,943,934 |  |
| `PortraitFrame_ButtonFrame` | Icon | 311,1105 | 90×90 | 7 |  |  |  |
| `PortraitFrame_Default` | Icon | 340,1041 | 148×148 | 6 | ChampionPortrait_Frame.png |  |  |

> 经验条 `PlayerExp_BarTexture` 是 `EffectFillPercentage`（按百分比裁切填充），贴图 `Strawberry_XPAtlas` UV (631,869)–(679,989)；底板 `PlayerExp_Backdrop` 没有贴图字段（推断用纯色或父级）。

### 2.3 升级按钮（`LevelUp`，4 个槽，表中只列第 0 个；1–3 号 x 依次为 621 / 695 / 768）

| 元素 | 类型 | 位置 (x, y) | 尺寸 | 层 | 贴图 | UV（像素） | 动画 |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- | :--- |
| `Evolve0_ButtonDefault` | Icon | 547,975 | 58×56 | 3 | Clarity_HUDAtlas.tex | 545,266,615,336 |  |
| `Evolve0_ButtonDisabled` | Icon | 547,975 | 58×56 | 6 | Clarity_HUDAtlas.tex | 718,199,776,255 |  |
| `Evolve0_ButtonHover` | Icon | 547,975 | 58×56 | 4 | Clarity_HUDAtlas.tex | 932,272,948,288 |  |
| `Evolve0_ButtonRegion` | Region | 547,975 | 58×56 | 4 |  |  |  |
| `Evolve0_Image` | EffectDesaturate | 547,975 | 58×56 | 2 |  |  |  |
| `LevelUp0_ButtonClicked` | Icon | 547,975 | 58×56 | 5 | Clarity_HUDAtlas.tex | 599,197,657,253 |  |
| `LevelUp0_ButtonDefault` | Icon | 547,975 | 58×56 | 2 | Clarity_HUDAtlas.tex | 482,197,540,253 |  |
| `LevelUp0_ButtonDisabled` | Icon | 547,975 | 58×56 | 5 | Clarity_HUDAtlas.tex | 657,197,715,253 |  |
| `LevelUp0_ButtonHover` | Icon | 547,975 | 58×56 | 4 | Clarity_HUDAtlas.tex | 541,197,599,253 |  |
| `LevelUp0_ButtonRegion` | Region | 547,975 | 58×56 | 4 |  |  |  |
| `LevelUp_Text` | Text | 629,935 | 120×27 | 3 |  |  |  |

### 2.4 升级动效（`LevelUpFxOut`，表中只列 0 号槽）

| 元素 | 类型 | 位置 (x, y) | 尺寸 | 层 | 贴图 | UV（像素） | 动画 |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- | :--- |
| `LevelUp0_IdleGlow` | EffectAnimation | 546,973 | 60×60 | 6 | Clarity_LevelUpAtlas2.tex | 1,1080,60,1138 | 30 fps × 61 帧，每行 16 |
| `LevelUp0_IdleSheen` | EffectAnimation | 546,973 | 60×60 | 7 | Clarity_LevelUpAtlas.tex | 0,843,59,900 | 30 fps × 16 帧，每行 16 |
| `LevelUp0_SelectedOut` | EffectAnimation | 532,959 | 93×149 | 6 | Clarity_LevelUpAtlas2.tex | 1,1,97,154 | 30 fps × 20 帧，每行 10 |
| `LevelUp0_UnselectedOut` | EffectAnimation | 547,975 | 58×56 | 6 | Clarity_LevelUpAtlas.tex | 0,781,55,837 | 30 fps × 9 帧，每行 9 |

### 2.5 首领血条（`strawberrybosshealthbar`）

| 元素 | 类型 | 位置 (x, y) | 尺寸 | 层 | 贴图 | UV（像素） | 动画 |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- | :--- |
| `BossPortrait` | Icon | 770,38 | 65×66 | 5 |  |  |  |
| `BossStatusIcon` | Icon | 856,38 | 16×16 | 5 |  |  |  |
| `BossStatusText` | Text | 876,40 | 111×13 |  |  |  |  |
| `BossHealthBarFrame` | Icon | 343,0 | 918×116 | 4 | Slime_Atlas.tex | 2,62,766,159 |  |
| `BossHealthBarFrame_Decoration` | Icon | 692,27 | 235×99 | 3 | BossHealthBar_Decoration_Frame.png |  |  |
| `BossHealthBar_BarTextureRed` | Icon | 366,4 | 875×32 | 5 | Slime_Atlas.tex | 7,250,737,277 |  |
| `BossHealthBar_Bg` | Icon | 366,4 | 875×32 | 4 | Slime_Atlas.tex | 7,280,737,307 |  |
| `BossHealthBar_Text` | Text | 725,6 | 156×27 | 7 |  |  |  |

### 2.6 升级卡（`strawberryaugmentselection`）

| 元素 | 类型 | 位置 (x, y) | 尺寸 | 层 | 贴图 | UV（像素） | 动画 |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- | :--- |
| `AugmentSelection_Background` | Icon |  |  |  | Cherry_ModalAtlas.tex | 10,164,26,180 |  |
| `Augment_Region` | Region | 160,240 | 1280×600 | 2 |  |  |  |
| `Augment_Desc` | Text | 688,616 | 224×136 | 20 |  |  |  |
| `Augment_HitRegion` | Region | 624,240 | 352×600 | 99 |  |  |  |
| `Augment_Icon` | Icon | 708,324 | 184×184 | 15 |  |  |  |
| `Augment_IconBorder` | Icon | 700,316 | 200×200 | 16 |  |  |  |
| `Augment_LevelTitle` | Text | 699,270 | 202×24 | 20 |  |  |  |
| `Augment_Name` | Text | 688,540 | 224×34 | 20 |  |  |  |
| `TagBg` | Icon | 770,583 | 60×16 | 20 | AugmentTag_Frame.png |  |  |
| `Text` | Text | 774,583 | 52×16 | 21 |  |  |  |
| `Augment_TagSpacer` | Region | 796,583 | 8×16 |  |  |  |  |
| `Augment_levelUpData` | Text | 688,616 | 224×136 | 20 |  |  |  |
| `AEI_Bg` | Icon | 744,782 | 112×80 | 14 | EvolvePanel_Background.png |  |  |
| `ER_Icon` | Icon | 752,802 | 40×40 | 15 | EvolvePanel_Evolve_Icon.png |  |  |
| `Region` | Region | 752,798 | 92×48 |  |  |  |  |
| `Icon` | Icon | 796,798 | 48×48 | 15 |  |  |  |
| `Padding` | Region | 792,798 | 56×48 |  |  |  |  |
| `TagRowRegion` | Region | 650,583 | 300×16 |  |  |  |  |
| `ProgressMeter_frame_Left` | Icon | 560,0 | 170×21 | 2 | TimerBar_Frame_Left.png |  |  |
| `TimeBar_Left` | Icon | 570,1 | 156×14 | 3 | TimerBar_Fill.png |  |  |
| `ProgressMeter_frame_Right` | Icon | 870,0 | 170×21 | 2 | TimerBar_Frame_Right.png |  |  |
| `TimeBar_Right` | Icon | 874,1 | 156×14 | 3 | TimerBar_Fill.png |  |  |
| `Clicked` | Icon | 753,904 | 93×48 | 4 | Reroll_Button_Clicked.png |  |  |
| `Default` | Icon | 753,904 | 93×48 | 4 | Reroll_Button_Default.png |  |  |
| `Disabled` | Icon | 753,904 | 93×48 | 4 | Reroll_Button_Disabled.png |  |  |
| `HitRegion` | Region | 753,904 | 93×48 | 10 |  |  |  |
| `Hover` | Icon | 753,904 | 93×48 | 4 | Reroll_Button_Hover.png |  |  |
| `RerollCountText` | Text | 806,916 | 24×24 | 5 |  |  |  |
| `TimeBarText` | Text | 735,14 | 130×40 | 7 |  |  |  |
| `TimeBarText_BG` | Icon | 712,0 | 176×80 | 4 | Timer_Background.png |  |  |
| `Timer_Decoration_BG` | Icon | 705,0 | 190×48 | 1 | Timer_Decoration_Background.png |  |  |

升级卡挂的界面特效（`UiElementParticleSystemData`，**定义文件未找到**）：

- `Augment_RefreshVFX` → `ClientStates/Gameplay/UX/LoL/Strawberry/StrawberryAugmentSelection/Particles/Upgrade_Weapon_RefreshVFX`
- `Augment_NotPickedVFX` → `ClientStates/Gameplay/UX/LoL/Strawberry/StrawberryAugmentSelection/Particles/Upgrade_Weapon_NotSelected`
- `Augment_IdleVFX` → `ClientStates/Gameplay/UX/LoL/Strawberry/StrawberryAugmentSelection/Particles/Upgrade_Weapon_IdleVFX`
- `Augment_HoverVFX` → `ClientStates/Gameplay/UX/LoL/Strawberry/StrawberryAugmentSelection/Particles/Upgrade_Weapon_HoverVFX`
- `Augment_RefreshOverlayVFX` → `ClientStates/Gameplay/UX/LoL/Strawberry/StrawberryAugmentSelection/Particles/Upgrade_Weapon_RefreshOverlayVFX`
- `Augment_PickedVFX` → `ClientStates/Gameplay/UX/LoL/Strawberry/StrawberryAugmentSelection/Particles/Upgrade_Weapon_SelectedVFX`
- `Augment_FlashInVFX` → `ClientStates/Gameplay/UX/LoL/Strawberry/StrawberryAugmentSelection/Particles/Upgrade_Weapon_FlashInVFX`
- `AugmentSelection_BackgroundVFX` → `ClientStates/Gameplay/UX/LoL/Strawberry/StrawberryAugmentSelection/Particles/Upgrade_ChoiceBGVFX`
- `AugmentSelection_CelebrationVFX` → `ClientStates/Gameplay/UX/LoL/Strawberry/StrawberryAugmentSelection/Particles/SpecialDraft_Ceremony`

## 3. 升级卡美术资源（CommunityDragon `assets/ux/strawberry/upgradeselection/`，可直接下载）

- `mgx/`（12）：`base_glow.png`、`card_flashreveal.png`、`card_halftone.png`、`card_selected_halftone.png`、`card_symbol.png`、`card_texture_prismatic.png`、`particle.png`、`ref_card_augment.png`、`ref_card_passive.png`、`ref_card_weapon.png`、`ref_card_weaponevol.png`、`texture_scanlines.png`
- `mgx/augment/`（10）：`augment_accent_texture_gradient.png`、`augment_accentl_fill.png`、`augment_accentl_outline.png`、`augment_accentr_fill.png`、`augment_accentr_outline.png`、`augment_background.png`、`augment_frame.png`、`augment_frame_glow.png`、`augment_frame_hover.png`、`augment_notselected.png`
- `mgx/passive/`（14）：`passive_accent_fill.png`、`passive_accent_outline.png`、`passive_background.png`、`passive_background_hover.png`、`passive_card_mask02.png`、`passive_card_mask_small.png`、`passive_card_pattern_mask.png`、`passive_edge_glitch.png`、`passive_edge_glow.png`、`passive_frame.png`、`passive_frame_glow.png`、`passive_frame_hover.png`、`passive_highlight.png`、`passive_notselected.png`
- `mgx/weapon/`（16）：`weapon_accentl_fill.png`、`weapon_accentl_outline.png`、`weapon_accentr_fill.png`、`weapon_accentr_outline.png`、`weapon_background.png`、`weapon_background_hover.png`、`weapon_card_mask02.png`、`weapon_card_mask_small.png`、`weapon_card_pattern_mask.png`、`weapon_edge_glitch.png`、`weapon_edge_glow.png`、`weapon_frame.png`、`weapon_frame_glow.png`、`weapon_frame_hover.png`、`weapon_highlight.png`、`weapon_notselected.png`
- `mgx/weaponevolution/`（14）：`ceremony_card_rolling_base.png`、`ceremony_card_rolling_glow.png`、`evilcat_sprite.png`、`jinx_skin40_dot_03.png`、`jinx_skin40_e_shapes01.png`、`jinx_skin40_r_glow.png`、`jinx_skin40_r_shapes02_01.png`、`sweep_mask.png`、`weaponevol_accent_texture_gradient.png`、`weaponevol_accentl_fill.png`、`weaponevol_accentr_fill.png`、`weaponevol_background.png`、`weaponevol_frame.png`、`weaponevol_frame_glow.png`
- `ui/`（2）：`weaponcard_iconborder_frame.png`、`weaponevolvecard_iconborder_frame.png`
- `icons/`（37）：`aoesize_buff.png`、`aoesize_large.png`、`aoesize_small.png`、`armor_buff.png`、`armor_large.png`、`armor_small.png`、`cooldown_buff.png`、`cooldown_large.png`、`cooldown_small.png`、`critchance_buff.png`、`critchance_large.png`、`critchance_small.png`、`damage_buff.png`、`damage_large.png`、`damage_small.png`、`duration_buff.png`、`duration_large.png`、`duration_small.png`、`exp_buff.png`、`exp_large.png`、`exp_small.png`、`gaingold_large.png`、`healthregeneration_buff.png`、`healthregeneration_large.png`、`healthregeneration_small.png`、`maxhealth_buff.png`、`maxhealth_large.png`、`maxhealth_small.png`、`movespeed_buff.png`、`movespeed_large.png`、`movespeed_small.png`、`pickuprange_buff.png`、`pickuprange_large.png`、`pickuprange_small.png`、`projectilecount_buff.png`、`projectilecount_large.png`、`projectilecount_small.png`
- `icons/weapon/`（29）：`9171_holybauble.png`、`9172_twinshadows.png`、`9173_hollowradiance.png`、`9174_statikkshiv.png`、`9175_crescentstrike.png`、`9176_gatlinggun.png`、`9177_firestrike.png`、`9178_dropthehammer.png`、`9179_fanofknives.png`、`9180_uwublaster.png`、`9181_neonlotus.png`、`9183_boomerang.png`、`9184_starstrike.png`、`9185_firebomb.png`、`9187_tibbers.png`、`9188_mine.png`、`9189_train.png`、`9190_scatterarrows.png`、`9192_poisontrail.png`、`9193_frostnova.png`、`9300_jinx_weapon.png`、`9301_leona_weapon.png`、`9302_seraphine_weapon.png`、`9303_briar_weapon.png`、`9304_yasuo_weapon.png`、`9305_illaoi_weapon.png`、`9306_xayah_weapon.png`、`9307_aurora_weapon.png`、`9308_riven_weapon.png`
- `icons/blessing_augment/`（39）：`armorup_buff.png`、`armorup_large.png`、`bitesized_large.png`、`bulletmania_large.png`、`cardcollector_large.png`、`celebration_buff.png`、`celebration_large.png`、`circleofstats_buff.png`、`circleofstats_large.png`、`criticalexpansion_buff.png`、`criticalexpansion_large.png`、`death_and_taxes_large.png`、`dimensionscrambler_large.png`、`ebbandflow_large.png`、`elitebomber_large.png`、`fast_healer_large.png`、`gatheringspeed_large.png`、`glasscannon_large.png`、`heavy_hitter_large.png`、`hoarder_large.png`、`juggernaut_large.png`、`largerthanlife_large.png`、`longrange_large.png`、`longroad_buff.png`、`longroad_large.png`、`metabolicoverdrive_large.png`、`nocrit_large.png`、`pickmeup_large.png`、`pointblank_large.png`、`rageengine_large.png`、`rammingspeed_large.png`、`sprayandpray_large.png`、`stealessence_large.png`、`timenotdamage_large.png`、`ultimatehaste_large.png`、`withhaste_large.png`、`xpfanatic_buff.png`、`xpfanatic_large.png`、`zookeeper_large.png`

> 这些是卡片底板、边框、发光、扫描线、半调、进化仪式等贴图，推断由上面的界面特效系统引用；找到系统定义后才能确定每张图怎么用。

## 4. HUD 贴图可用性（48 张，全部可得）

| 原版贴图 | 用在 | 取法 | 位置 |
| :--- | :--- | :--- | :--- |
| `AugmentTag_Frame.png` | augmentselection | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.0010,0.0156)–(0.0322,0.1406)` |
| `Cherry_ModalAtlas.tex` | augmentselection | 直接下载 | `assets/ux/cherry/augments/augmentselection/cherry_modalatlas.png` |
| `Reroll_Button_Clicked.png` | augmentselection | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.3057,0.0156)–(0.3511,0.3906)` |
| `Reroll_Button_Default.png` | augmentselection | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.3545,0.0156)–(0.3999,0.3906)` |
| `Reroll_Button_Disabled.png` | augmentselection | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.4033,0.0156)–(0.4487,0.3906)` |
| `Reroll_Button_Hover.png` | augmentselection | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.4521,0.0156)–(0.4976,0.3906)` |
| `HoverHighlight.png` | rounds | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryrounds/atlas_0.png UV(0.4033,0.0078)–(0.4336,0.3672)` |
| `LowTime_Bar_Glow.png` | rounds | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryrounds/atlas_0.png UV(0.1982,0.0078)–(0.2607,0.0469)` |
| `LowTime_Red_Backer.png` | rounds | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryrounds/atlas_0.png UV(0.2627,0.0078)–(0.3252,0.0469)` |
| `RoundTracker_Frame.png` | rounds | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryrounds/atlas_0.png UV(0.4365,0.0078)–(0.6709,0.4453)` |
| `RoundTracker_RoundMarker_Hazard_Icon.png` | rounds | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryrounds/atlas_0.png UV(0.3916,0.0078)–(0.4014,0.0859)` |
| `RoundTracker_TimeLine_Bar.png` | rounds | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryrounds/atlas_0.png UV(0.0010,0.0078)–(0.1963,0.0234)` |
| `TimerBar_Fill.png` | rounds | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryrounds/atlas_0.png UV(0.3271,0.0078)–(0.3896,0.0469)` |
| `roundtracker_glow.png` | rounds | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryrounds/atlas_0.png UV(0.6729,0.0078)–(0.9482,0.5547)` |
| `Scoreboard_PlayerListItem_AugmentTile_Prismatic_Frame.png` | herostats | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryherostats/atlas_0.png UV(0.0020,0.0020)–(0.0371,0.0371)` |
| `TooltipAtlas.tex` | playerframe | 直接下载 | `assets/ux/common/tooltipatlas.png` |
| `Slime_Atlas.tex` | bosshealthbar | 直接下载 | `assets/ux/gamemodes/slime_atlas.png` |
| `AnimatedMeters.tex` | playerframe | 直接下载 | `assets/ux/lol/animatedmeters.png` |
| `Clarity_AbilityAtlas.tex` | playerframe, playerinventory | 直接下载 | `assets/ux/lol/clarity_abilityatlas.png` |
| `Clarity_HUDAtlas.tex` | gameheader, playerframe, playerinventory | 直接下载 | `assets/ux/lol/clarity_hudatlas.png` |
| `Clarity_LevelUpAtlas.tex` | playerframe | 直接下载 | `assets/ux/lol/clarity_levelupatlas.png` |
| `Clarity_LevelUpAtlas2.tex` | playerframe, playerinventory | 直接下载 | `assets/ux/lol/clarity_levelupatlas2.png` |
| `Clarity_ResourceAtlas.tex` | playerframe | 直接下载 | `assets/ux/lol/clarity_resourceatlas.png` |
| `HUDResetAtlas.tex` | playerframe | 直接下载 | `assets/ux/lol/hudresetatlas.png` |
| `PerksSummonerSpecialistUI_Atlas.tex` | playerframe | 直接下载 | `assets/ux/lol/perkssummonerspecialistui_atlas.png` |
| `StatsPanel_Atlas.tex` | playerframe | 直接下载 | `assets/ux/lol/statspanel_atlas.png` |
| `EvolveRecipe.png` | herostats | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryherostats/atlas_0.png UV(0.3496,0.0020)–(0.5996,0.8057)` |
| `StatsPanel_Frame_Background.png` | herostats | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryherostats/atlas_0.png UV(0.0410,0.0020)–(0.3457,0.4082)` |
| `BossHealthBar_Decoration_Frame.png` | bosshealthbar | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberrybosshealthbar/atlas_0.png UV(0.0078,0.0156)–(0.9258,0.7891)` |
| `GoldFrame_Background.png` | playerinventory | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryplayerinventory/atlas_0.png UV(0.0039,0.0156)–(0.3594,0.2500)` |
| `QuestCounter_Background.png` | gameheader | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberrygameheader/atlas_0.png UV(0.5684,0.0156)–(0.7539,0.6328)` |
| `QuestTimer_Background.png` | gameheader | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberrygameheader/atlas_0.png UV(0.3770,0.0156)–(0.5625,0.5547)` |
| `ScoreFrame_Background.png` | gameheader | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberrygameheader/atlas_0.png UV(0.0020,0.0156)–(0.1797,0.2500)` |
| `TimerBar_Fill.png` | augmentselection | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.0342,0.0156)–(0.1104,0.1250)` |
| `TimerBar_Frame_Left.png` | augmentselection | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.1123,0.0156)–(0.1953,0.1797)` |
| `TimerBar_Frame_Right.png` | augmentselection | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.1982,0.0156)–(0.2812,0.1797)` |
| `Timer_Background.png` | augmentselection, gameheader | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.5967,0.0156)–(0.6826,0.6406)` |
| `Timer_Decoration_Background.png` | augmentselection, gameheader | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.5010,0.0156)–(0.5938,0.3906)` |
| `ChampionPortrait_Frame.png` | playerframe | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryplayerframe/atlas_0.png UV(0.1582,0.0078)–(0.3027,0.5859)` |
| `InventoryItem_Border.png` | playerinventory | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryplayerinventory/atlas_0.png UV(0.5039,0.0156)–(0.6133,0.5625)` |
| `LevelIndicator_Frame.png` | playerframe | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryplayerframe/atlas_0.png UV(0.0020,0.0078)–(0.0527,0.1875)` |
| `Passive_Border.png` | playerframe | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryplayerframe/atlas_0.png UV(0.1074,0.0078)–(0.1543,0.2500)` |
| `PlayerFrame_Background.png` | playerframe | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryplayerframe/atlas_0.png UV(0.3066,0.0078)–(0.8984,0.6719)` |
| `Reward_Border.png` | playerframe | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryplayerframe/atlas_0.png UV(0.0566,0.0078)–(0.1035,0.1953)` |
| `Strawberry_XPAtlas.tex` | playerframe | 直接下载 | `assets/ux/strawberry/playerframe/strawberry_xpatlas.png` |
| `WeaponSlots_Evolve_Border.png` | playerinventory | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryplayerinventory/atlas_0.png UV(0.3711,0.0156)–(0.4961,0.5156)` |
| `EvolvePanel_Background.png` | augmentselection | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.6846,0.0156)–(0.7900,0.6406)` |
| `EvolvePanel_Evolve_Icon.png` | augmentselection | 图集散图 | `uiautoatlas/clientstates/gameplay/ux/lol/strawberry/strawberryaugmentselection/atlas_0.png UV(0.2842,0.0156)–(0.3037,0.3281)` |

下载地址前缀：`https://raw.communitydragon.org/14.14/game/`。散图要从 `atlas_0.png` 按归一化 UV 裁出（UV × 图集像素尺寸）。

## 5. 缺失 / 待查清单

| # | 项 | 现状 | 下一步 |
| ---: | :--- | :--- | :--- |
| 1 | 升级卡 9 个界面特效系统定义 | map33.bin 0 处引用；CommunityDragon `clientstates/.../strawberryaugmentselection/` 只有 uibase | 在 14.14 客户端 UI WAD 里按路径 `ClientStates/Gameplay/UX/LoL/Strawberry/StrawberryAugmentSelection/Particles/*` 的哈希查（`hashes.game.txt`）；找不到就用第 3 节贴图 + 录像推断，标「推断」 |
| 2 | 敌人头顶血条样式 | `lolfloatinginfobars/uibase` 类型名为哈希（`{1a65e950}` ×300 等）；Swarm 敌人 `unitHealthBarStyle` 6 / 19、精英 6、首领用独立首领血条 | 用 CDTB 哈希表解析类型名，再按 style 编号找对应元素；贴图在 `assets/ux/floatinghealthbars/`（已列 6 张） |
| 3 | 升级卡 / 头像框文字样式、字体 | 未核对 | 查 `TextData` 的 `fontDescription` 与 `assets/ux/fonts/` |
| 4 | 金克丝是否显示资源条（PAR） | 原版布局里有 7 套资源条皮肤 | 原版录像确认 |
| 5 | 项目接入 | 项目 HUD 为 HTML/CSS，未用原版图集 | **由 GPT 决定**（UI 模块归 GPT 负责）；Babylon 迁移不改 DOM HUD（手册第 1 节） |
