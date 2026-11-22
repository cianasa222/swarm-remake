# Quick AI 交接文档（QUICK_AI_HANDOVER）

> **本文档由 Quick AI（AWS Quick）编写和维护。**
> 最后更新：2026-11-22 21:40 CST · 对应 GitHub `main` 提交：`bdd38ad` 之后的文档同步提交
> 仓库：`https://github.com/cianasa222/swarm-remake` · Cloudflare KV 镜像：`tideline-handover`（`7bbc331619b04fc8b5b5323abba5eef0`）
> 配套阅读：[`COLLAB.md`](./COLLAB.md)（分工、流程、防冲突）→ [`AGENTS.md`](./AGENTS.md) → [`AI_HANDOVER.md`](./AI_HANDOVER.md) → [`PROGRESS.md`](./PROGRESS.md)

---

## 0. 角色变更（2026-11-22 起生效）

用户指定：**Quick AI 今后只做「审查 + 与原版比对 + 优化建议」，不再做功能开发。**

| 现在由 Quick AI 做 | 不再由 Quick AI 做（交给其他 AI） |
| :--- | :--- |
| 审查其他 AI 提交到 GitHub 的代码和 PR | `src/` 功能开发（喷泉第二批、M5、新英雄等） |
| 对照 Patch 14.14 原版数据（`map33.bin.json`、角色 `skin0.bin.json` 等）逐项比对参数 | 直接向 `main` 推送代码改动 |
| 检查是否遵守架构约定（`AI_HANDOVER.md` 1.3 节五大契约） | `.wad.client` 下载、lol2gltf 转换（本来就做不了） |
| 写审查报告到 `docs/audit/`，在 PR 下评论 `PASS` / `需修改：<清单>` 和优化建议 | 本机 `build` / `playtest` / 截图（本来就做不了） |
| 核对 GitHub ↔ KV 是否一致，发现不一致时按 COLLAB 2.1 补齐镜像 | 部署 Cloudflare |

**怎么请 Quick AI 审查**：开 PR（或直接提交到 `main` 后）告诉用户，由用户在 AWS Quick 对话里说「审查 PR #N」或「审查提交 <SHA>」。Quick AI 会读 diff、拉原版数据比对，然后在 PR 评论里给结论。

---

## 1. Quick AI 已完成的操作（2026-11-22）

### 1.1 代码改动（都在 `main` 上，**都还没有在本机编译和实测**）

| 提交 | 文件 | 内容 | 状态 |
| :--- | :--- | :--- | :--- |
| `05a1ef1` | `public/_headers` | 静态资源统一加 `Access-Control-Allow-Origin: *`，替代 `worker.js` 里加 CORS（`run_worker_first` 应为 `false`，否则 `_headers` 不生效） | 待部署 |
| `c63e871` | `src/render/map_warehouse.ts` | 喷泉精修第一批 9 项（详见 `PROGRESS.md` 2.5 节）：Nova ×1.75、各层原版寿命、补 Nova 两层冲击波和 Gold/Gold1 粒子、补 Timer `Decal_Start2`、healspark 和 sparklies1 改为原版发射式、Basic4/Edge12/Edge17/波浪峰值修正、去掉计时圈暖黄。新增通用粒子设施 `makeFxPool` | 🧪 待验收 |
| `46362d7` | `src/render/enemy_models.ts` | **修复小怪只剩影子**：M4 量化后小怪 GLB 的 `POSITION` 是 Int16 归一化，反量化缩放写在骨骼 `inverseBindMatrices` 里；`InstancedEnemyModel` 原来丢掉蒙皮属性，模型只剩 1–2 cm。新增 `bakeStaticGeometry()`，按静止姿态 `applyBoneTransform` 烘焙后再合批 | 🧪 待验收 |

**验收清单（交给开发 AI / 用户）**：
1. `npm.cmd run build`、`npm.cmd run playtest -- 2 0.85` 退出码均为 0。
2. `?spot=hub` 1280×800 截 4 张：常驻 / 充能中 / 满充 Nova 瞬间 / 冷却。重点看：Nova 放大后光柱是否切穿外围建筑；healspark 0.4 m 是否过小；sparklies1 是否从进度圈前端生成（进度头角度由 `fountain_timer.json` 的 uv.x 自动拟合，最可能出错）。
3. 第一波小怪：模型是否出现、大小是否正常、朝向和姿势是否正确。
4. 有问题时由开发 AI 修改，修完再交 Quick AI 审查。

### 1.2 文档

| 提交 | 文件 | 内容 |
| :--- | :--- | :--- |
| `a6dfb65` | `COLLAB.md` | 新建：分工、GitHub ↔ KV 同步规则、任务领取/交付/验收流程、任务看板、执行 AI 开场指令 |
| `834ca30` | `docs/audit/fountain_emitters_14.14.md` | 喷泉 43 个发射器与代码逐项比对（28 有对应 / 15 缺失），并标注修复分工 |
| `c63e871` | `PROGRESS.md` | 新增 2.5 节（喷泉精修第一批） |
| `7ce4bd1` | `AI_HANDOVER.md` | 2.2 节补 Patch 14.14 Windows 客户端 7 个官方清单地址 |
| `bdd38ad` | `COLLAB.md` | 新增 2.1 节防冲突规则，刷新任务看板 |
| 本次 | `QUICK_AI_HANDOVER.md`、`COLLAB.md`、`AI_HANDOVER.md`、`PROGRESS.md`、`docs/ci/fetch-14.14-reference.yml` | 角色变更、本交接文档、免解包直链方法 |

### 1.3 GitHub Issue

- [Issue #1](https://github.com/cianasa222/swarm-remake/issues/1)：外包任务（T1 下载解包 / T2 5 个 Nova 网格 / T3 lol2gltf 复核 / T4 15 张贴图）。**以最新评论为准**，已有 4 次订正（09:42 范围、09:48 流程、20:41 网格与贴图、21:30 改用 Windows 清单）。目前**待领取**。

### 1.4 Cloudflare 账号里的操作（账号 `63223f8370990e669e94ab2e9c56683a`）

| 资源 | 状态 | 说明 |
| :--- | :--- | :--- |
| KV `tideline-handover` | 使用中 | 源码和文档镜像（47 条，见 `FILE_INDEX.json`）+ `SYNC_STATE.json`（最后同步的提交号和每个文件的 SHA-256）+ `ref/14.14/` 原版参考数据 |
| Worker `tideline-ref-fetcher` | **已停用**（定时任务已清空，公开网址已关闭） | 从 CommunityDragon 抓取原版文件写入 KV 的临时工具，代码见第 3.3 节；需要时重新设定时任务即可复用 |
| Worker `tideline-swarm` | 未改动 | 线上站点仍是 2026-11-22 06:31 部署的版本，**今天所有代码改动都还没上线** |

### 1.5 排查过、已有结论的问题

| 问题 | 结论 |
| :--- | :--- |
| `tideline-swarm.cianasa888-gbd.workers.dev` 对外部工具返回 403 | 不是站点配置问题；数据中心发出的请求会被 Cloudflare 边缘拦截或执行环境本身禁止外网。浏览器访问正常 |
| GitHub 连接器写 `.github/workflows/` 被拒（`INSUFFICIENT_SCOPE`） | 连接器本身没有 workflow 权限，重连无效。工作流文件只能由用户在 GitHub 网页手动建 |
| GitHub 连接器一度读写都失败（OAuth 异常） | 用户撤销授权后重连解决 |
| KV `FILE_INDEX.json` 被整份覆盖成 5 条 | 已按 KV 实际 key 重建为 47 条；为此新增 COLLAB 2.1 防冲突规则 |
| `worker.js` 里加的 CORS 头对静态资源不生效 | 静态资源默认不经过 Worker 代码；已改用 `public/_headers` |

---

## 2. 剩余工作（交给开发 AI / 执行 AI，Quick AI 负责审查）

| 优先级 | 事项 | 建议负责方 |
| :---: | :--- | :--- |
| P0 | 验收并修正 `c63e871`（喷泉第一批）和 `46362d7`（小怪修复），见 1.1 节验收清单 | 开发 AI + 用户 |
| P0 | 重新部署线上：`git pull` → `npm.cmd run build` → 部署 `dist/`，`run_worker_first: false` | 用户 |
| P1 | Issue #1：T1 下载解包、T2 5 个 Nova 网格、T4 15 张贴图、4 种小怪 `skin0.bin.json` | 执行 AI（Muse） |
| P1 | 喷泉第二批：7 个常驻层的 textureMult 叠加；Timer 进度遮罩换用 `Base_Timer_Mult_05–09`；Nova `Beamdown` ×2、`flashBlend`、`Ground_Light_mesh1`、`Ring`、`ShapeAround`、`InhaleFire` ×3、`teamring_circle1`（依赖 Issue #1 交付，清单见审查报告 4.3 节） | 开发 AI |
| P2 | M5：三档画质验收；`teammateVfxScale` 目前只在 `jinx_vfx.ts`，`weapon_vfx.ts` 还没有；`game.ts` 还没有 `players[]` | 开发 AI |
| P2 | 自动部署：在仓库根目录加 `wrangler.jsonc`（Worker 名 `tideline-swarm`，只上传 `dist/`，纯静态资源），用户在 Cloudflare 后台连接 GitHub；建议非生产分支 `preview` 走预览地址 | 开发 AI + 用户 |
| P3 | 清理没有被引用的 `src/render/lan.ts`（1022 行）和 `world.ts` 里的 `buildWorld()`（`WorldView` 类型仍在用） | 开发 AI |
| P3 | `tools/compress_assets.mjs` 写死了本机绝对路径（如第 11 行 `c:/七星/游戏/...`），改成相对项目根目录 | 开发 AI |
| P3 | `strawberry_enemy_hunter/skins/skin0.bin.json` 只有 1.3 KB，疑似不完整，由 Issue #1 解包后替换 | 执行 AI |

---

## 3. 原版数据来源与「免解包直链直下」方法

### 3.1 CommunityDragon Patch 14.14（免解包，直接 HTTP GET）

根地址：`https://raw.communitydragon.org/14.14/game/`（目录页可在浏览器直接浏览，路径全小写）

| 类别 | 地址 | 实测 |
| :--- | :--- | :--- |
| 地图配置（喷泉 / 补给箱 / 刷怪 / 全部 VFX 发射器） | `data/maps/shipping/map33/map33.bin.json` | ✅ 7.1 MB，最后修改 2024-07-23 |
| 地图材质与 `MapSunProperties` | `data/maps/mapgeometry/map33/strawberry_animasquad_map1.materials.bin.json` | ✅ |
| 金克丝数值 / 特效 | `data/characters/strawberry_jinx/strawberry_jinx.bin.json`、`.../skins/skin0.bin.json` | ✅ |
| 雷克塞 | `data/characters/strawberry_boss_reksai/strawberry_boss_reksai.bin.json`、`.../skins/skin0.bin.json` | ✅ |
| 精英怪 Bruiser | `data/characters/strawberry_miniboss_bruiser/skins/skin0.bin.json` | ✅ |
| 小怪 Hunter | `data/characters/strawberry_enemy_hunter/skins/skin0.bin.json` | ⚠️ 仅 1.3 KB |
| 小怪 Pix / Ghoul / Dasher | `data/characters/strawberry_enemy_{pix,ghoul,dasher}/skins/skin0.bin.json` | ❌ 404，需解包 |
| 地图特效贴图 | `assets/maps/particles/strawberry/<小写名>.strawberryrebuild.png` | ✅ 目录可浏览（例：`healingstation_scan_lines.strawberryrebuild.png`） |
| 地图特效网格 `.scb` | `assets/maps/particles/strawberry/*.scb` | ❌ 404（CommunityDragon 不托管 `.scb`），需解包 |
| 22 张烘焙光照 | `data/maps/mapgeometry/map33/strawberry_animasquad_map1_lightmaps/0.png` … `21.png` | 未实测 |
| 其余角色、UI 图标、新英雄 | 见 `AI_HANDOVER.md` 2.1 节完整列表 | — |

**文件名规则**：游戏里的路径 `ASSETS/Maps/Particles/Strawberry/HealingStation_Dots.StrawberryRebuild.dds` 对应 CommunityDragon 的 `assets/maps/particles/strawberry/healingstation_dots.strawberryrebuild.png`（全小写，`.dds`/`.tex` 换成 `.png`）。

### 3.2 拳头官方 Patch 14.14 清单（需要 ManifestDownloader，在 Windows 上跑）

来源：[`Morilli/riot-manifests`](https://github.com/Morilli/riot-manifests) 的 `LoL/NA1/windows/lol-game-client/14.14.*.txt`（**不要用 `macos` 目录**）。7 个小版本的地址已写入 `AI_HANDOVER.md` 2.2 节；默认用最后一版：

`14.14.6034237` → `https://lol.secure.dyn.riotcdn.net/channels/public/releases/17A8CACF07883D41.manifest`

清单只记录文件名和数据块索引，要用 ManifestDownloader 按清单从同一 CDN 下载拼出 `.wad.client`，再用 `hashes.game.txt` 解包。

### 3.3 方法 A（已验证）：用 Cloudflare Worker 定时任务抓到 KV

**为什么需要**：从 AI 执行环境或部分数据中心直接请求 CommunityDragon 会返回 403 或被禁止外网，但部署好的 Worker 可以正常访问。

**步骤**（Cloudflare API，账号 `63223f8370990e669e94ab2e9c56683a`）：
1. `PUT /accounts/{id}/workers/scripts/tideline-ref-fetcher`（multipart：`metadata` 绑定 KV `KV` → `7bbc331619b04fc8b5b5323abba5eef0`，加下面的 `worker.js`）。
2. `POST .../scripts/tideline-ref-fetcher/subdomain`，内容 `{ "enabled": false, "previews_enabled": false }`（不开放公网访问）。
3. `PUT .../scripts/tideline-ref-fetcher/schedules`，内容 `[{ "cron": "* * * * *" }]`。**首次生效约需 2–8 分钟**。
4. 读 KV `ref/14.14/<路径>.status` 看结果（`http_code`、`bytes`、`ok`），成功的文件在 `ref/14.14/<路径>`。
5. 完成后**务必** `PUT .../schedules`，内容 `[]`，停掉定时任务。

```js
// worker.js —— 按 PATHS 抓取 CommunityDragon 14.14 文件写入 KV；已成功的不重复抓
const G = "https://raw.communitydragon.org/14.14/game/";
const PATHS = [
  "data/maps/shipping/map33/map33.bin.json",
  // "assets/maps/particles/strawberry/healingstation_scan_lines.strawberryrebuild.png",
];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
export default {
  async scheduled(event, env) {
    for (const rel of PATHS) {
      const key = "ref/14.14/" + rel;
      const prev = await env.KV.get(key + ".status");
      if (prev) { try { if (JSON.parse(prev).ok) continue; } catch {} }
      const st = { url: G + rel, utc: new Date().toISOString() };
      try {
        const r = await fetch(G + rel, { headers: { "User-Agent": UA } });
        st.http_code = r.status;
        const buf = await r.arrayBuffer();
        st.bytes = buf.byteLength;
        const head = new Uint8Array(buf.slice(0, 8));
        const isJson = rel.endsWith(".json");
        st.ok = r.status === 200 && (isJson ? head[0] === 123 : true);
        if (st.ok) await env.KV.put(key, buf); // KV 单值上限 25 MiB
        else st.body_head = new TextDecoder().decode(buf.slice(0, 600));
      } catch (e) { st.error = String((e && e.message) || e); }
      await env.KV.put(key + ".status", JSON.stringify(st));
    }
  },
};
```

**已抓到的 KV 参考数据**（`ref/14.14/` 下，不进公开仓库）：`map33.bin.json`、`strawberry_animasquad_map1.materials.bin.json`、金克丝 ×2、雷克塞 ×2、Bruiser `skin0`、Hunter `skin0`（不完整）。

### 3.4 方法 B（未验证）：GitHub Actions 抓到 `reference-14.14` 分支

工作流文件已写好，放在 [`docs/ci/fetch-14.14-reference.yml`](./docs/ci/fetch-14.14-reference.yml)（Quick AI 没有 workflow 权限，只能放在 `docs/` 下）。用户在 GitHub 网页新建 `.github/workflows/fetch-14.14-reference.yml` 并粘贴内容即可启用；运行后结果写进 `reference-14.14` 分支的 `FETCH_STATUS.txt`。GitHub 运行机是否也被 CommunityDragon 拦截**尚未测试**。如需在 Windows 运行机上跑 ManifestDownloader / lol2gltf，可在此基础上改 `runs-on: windows-latest`。

---

## 4. 审查时要重点核对的已知坑（给 Quick AI 和开发 AI）

1. **量化 + 蒙皮的 GLB**：`tools/compress_assets.mjs` 的 `quantize` 会把 `POSITION` 存成 Int16 归一化，蒙皮网格的反量化缩放在 `inverseBindMatrices` 里。任何**不走 `SkinnedMesh` 而直接取顶点**的代码（合批、碰撞、包围盒）都必须先 `applyBoneTransform` 烘焙，否则尺寸只有约 1 个单位。
2. **`TEXCOORD_1` 不能量化**：地图烘焙光照 UV 依赖它（`AI_HANDOVER.md` 1.3 节第 5 条）。
3. **单位换算**：拳头 1 单位 = 0.01 m；面片尺寸 = 2 × `birthScale` / 100 m；网格缩放 = `birthScale` / 100；系统 `transform` 缩放（如 Nova 1.75）要整体乘上。
4. **颜色空间**：`.bin.json` 里的颜色是 sRGB 数值，写进 Shader uniform 或顶点属性前要转线性，经 `colorspace_fragment` 输出后才和原版一致。
5. **`PointsMaterial` 会忽略 `Texture.repeat/offset`**：图集必须用 `loadSpriteCell()` 切格，或用自定义 Shader 按帧采样。
6. **画质档位只调渲染负载**：`QUALITY_SPECS[tier].fxScale` 只能缩放粒子发射数量，不能改 `src/sim/` 的刷怪数量。
7. **所有资源必须经 `src/render/assets.ts` 加载**：审查时检查 `new GLTFLoader` / `new THREE.TextureLoader` / 裸 `fetch('./assets/...')`。
8. **`src/sim/` 纯净度**：不得出现 `three`、`window`、`document`、`Math.random`（随机数统一用 `makeRng`）。

---

## 5. 防冲突方案（摘要，完整规则见 `COLLAB.md` 2.1 节）

1. **先拉后改**：改共享文件前先从 GitHub `main` 拉最新版；通过 API 写文件时带上拉取时的文件 SHA，冲突会被 GitHub 拒绝。
2. **只改自己负责的那一节**，注明作者和日期，不整份重写别人的内容。
3. **一次提交只做一件事**，提交说明写清改了哪些文件、哪一节。
4. **KV 只做镜像、只做增量**：只镜像 GitHub 上已提交的内容，写完核对 SHA-256；`FILE_INDEX.json` / `SYNC_STATE.json` 只改对应条目，禁止整份替换；条目数异常时按 KV 实际 key 重建并在 `SYNC_STATE.json` 的 `note` 里记录。
5. **发现冲突先停**，重新拉取合并；拿不准就在 Issue 里说明或问用户。
6. **不在 `main` 上 force push**，不删除别人的分支、Issue 或评论。

**同步分工（角色变更后）**：提交者如果有 Cloudflare 权限，就自己按上述规则镜像到 KV；没有权限的，Quick AI 在审查时核对并补齐镜像。**两边不一致时一律以 GitHub `main` 为准。**
