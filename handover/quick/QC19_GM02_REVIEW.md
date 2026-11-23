# QC-19 · 对 Gemini GM-02 / GM-03（BAB-Q01 缺口修复）的比对意见

> Quick AI（AWS Quick），2026-11-23 18:15 CST。只在 KV。**以 Gemini `pending/bab01-gemini/` 为准**，本文件只列差异建议，不替代、不覆盖 Gemini 的交付，也没改 `pending/bab01-quick/` 原件。
> 背景：用户 11:05 让 Quick AI 修 GPT-13 的 Q01-01～02；Quick AI 本地做到一半（贴图核对时工具中断），18:09 读交接时发现 Gemini 已在 11:02–11:12 完成并交付到 KV，于是改为比对。
> Quick AI 的参考脚本（**仅供对照，不要原样上传**）：`pending/bab01-quick-q02/tools/bab/extract_vfx_14_14.cjs`。数据 JSON 没上传（可由脚本对 KV `ref/14.14/` 三份 BIN 重跑复现；Quick 本地实测两次输出逐字节一致，原有 122 个系统内容不变）。

## 1. 双方一致的部分（确认 Gemini 结论）

- Q01-01：回旋刃 3 个进化系统，根因与修法相同（武器名后允许接 `Evolve`）。weapons 41 / 150 两边一致。
- Q01-02：精英光环 2 个、补给箱 3 个、经验 / 回血 / 门禁卡拾取 / 金币掉落 18 个、`Strawberry_Player_Hit`，两边都收录。
- 喷泉、金克丝两份文件逐字节不变。

## 2. 建议合并进 Gemini 版的（有依据）

| # | 问题 | 依据 | 建议 |
| :---: | :--- | :--- | :--- |
| 1 | **技能引用漏解析哈希键**：`Strawberry_Weapon_BoomerangEvolve_Missile_Return`、`Strawberry_RapidShot_Mis_Pink` 在 Gemini 版里 `usedBySpells` 为空 | 技能字段 `mMissileEffectKey` 存的是 `ResourceResolver`（map33 `{b0d15443}`）的资源键，返程弹的键是哈希 `{a86658d8}`，不是可读名；旧 `collectSpellRefs` 只按名字匹配 | 在 `collectSpellRefs` 开头先建"资源键 → 系统 id"表（代码见第 4 节）。修后：返程弹 ← `Augment_Weapon_BoomerangEvolveReturnMissile`，粉色 UwU 弹 ← `Augment_Weapon_RapidShotMis`；其余 122 个系统内容不变 |
| 2 | **金币掉落项目里没有** | `src/sim/game.ts` 只有经验晶片 `shards`、回血 `pickups`、精英门禁卡 `accessCards`，没有金币 | 金币 3 个系统保留数据，`gameRefs` 加 `inGame: false`，避免运行器绑到不存在的事件 |
| 3 | **精英 / 首领头顶血条、首领狂暴**：`Strawberry_MiniBoss_HealthBar`（4 层）、`Strawberry_MapBoss_Healthbar`（6 层）、`Strawberry_MapBoss_Enraged`（2 层）未收录 | 项目有精英怪和雷克塞首领；GPT-13 Q01-08 也列了"敌方血条样式映射待确认" | 收录，标 `binding: 'name'`；血条是否用这套由 UI 负责方（GPT-10）定 |
| 4 | **敌人出生特效**：`Strawberry_Spawner_SpawnVFX`、`_Eye`（各 4 层）未收录 | 项目每波都有敌人入场 | 收录到 enemy，`role: spawn / spawnEye`；是否对应入场口要看原版录像 |

## 3. 需要用户 / 验收方定的（两边判断不同）

| 项 | Gemini | Quick | 说明 |
| :--- | :--- | :--- | :--- |
| 第一关地图环境 `Strawberry_MapA_*`（海浪、海沫、海岸线、水池、池塘、海鸥、鱼群、通风口烟雾等 19 个） | 不收录（归 EMAP-1，以后再做） | 收录，标 `inGame: false` | Q-26 审查确认第一关就是 MapA，项目现在一个都没有。先把数据备好不影响运行；Gemini 的做法也合理，**听用户定** |
| `Strawberry_AnimaSquad_Card` | 当门禁卡掉落（`card / dropIdle`） | 没收录 | 名字更像"动物小队卡片"展示特效，**未找到技能或掉落引用**，建议用原版录像确认再定用途 |
| `Strawberry_AugmentSelection_InWorld_Ceremony`（升级）、`Strawberry_Rebuild_TargeterOrientation(_Manual)`（瞄准圈） | 收录 | 没收录 | 用途推断合理；升级仪式与升级弹窗相关，和 GPT-10 UI 协调 |

> ✅ **用户决定（2026-11-23 18:16 CST）**：本节两项（第一关 MapA 环境 19 个是否现在收录、`Strawberry_AnimaSquad_Card` 的用途）**都交给验收方定**——由 Gemini 或代上传 / 验收的 AI 对照原版录像决定，Quick AI 不再改动。第 2 节 4 条建议照旧，由 Gemini 或代上传方决定是否合入。

## 4. 第 1 项的代码（加在 Gemini 版 `collectSpellRefs` 里）

```js
function collectSpellRefs(bin, idSet) {
  const refs = new Map();
  // Q01-01：技能字段（mMissileEffectKey 等）引用的是 ResourceResolver 的资源键，可能是可读名，也可能是 {哈希}
  // （如回旋刃进化返程 {a86658d8} → Strawberry_Weapon_BoomerangEvolve_Missile_Return），先按解析表还原成系统 id
  const resolve = new Map();
  for (const v of Object.values(bin)) {
    if (!v || v.__type !== 'ResourceResolver' || !v.resourceMap) continue;
    for (const [rk, sys] of Object.entries(v.resourceMap)) if (typeof sys === 'string') resolve.set(rk, sys.split('/').pop());
  }
  const walk = (o, path, spell) => {
    if (typeof o === 'string') {
      const id = resolve.get(o) || o.split('/').pop();
      if (idSet.has(id)) {
        if (!refs.has(id)) refs.set(id, []);
```

## 5. 贴图

Quick 本地版新增系统引用 100 张贴图，89 张不在 BAB-Q01 的探测记录里；Gemini GM-03 已对全部 555 张实测（555/555 真 PNG），**以 Gemini 结果为准**，Quick 不再重复探测。若采纳第 2、3 节的额外系统，需要把它们的贴图补进 Gemini 的 `asset_map.json` 再测一次。
