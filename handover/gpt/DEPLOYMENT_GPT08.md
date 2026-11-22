# GPT-08 合并与上线交接（2026-11-23 CST）

## 已完成

- 用户明确要求先合并和部署，PR #8 已合并 main，merge commit `797ef1db0077df45f8f8a67b296b67c380586877`，PR head `b688d0fd80e2a35de6e03eea77316c9eda1bfade`。保留 AG-06 资产分支与所有 KV pending 原文，禁止删除。
- GitHub compare 的 30 个变更文件与本机 Git blob 校验全部相同。已有构建 PASS、数值 playtest 4/4、21 种刷新率组合、精英死亡/重置、18 组 Ogg 校验；另跑账号网关 4/4 PASS。dist 415 文件约 51 MiB、单文件均小于 25 MiB。
- 新增可复现发布配置 `wrangler.jsonc`：保留现有 Worker 名、原兼容日期、现有自定义域名和 workers.dev，ASSETS 绑定整个 dist，ACCOUNT_AUTH 服务绑定至既有账号服务，API Worker-first。配置字段已对官方文档复核；尚未运行 Wrangler 生产发布。原服务不改、不复制密钥、不接入原存档。

## 发布阻塞 / 真实线上状态

- 现有线上 Worker `tideline-swarm`：当前生产版本 `7d862759-23ae-4ddd-b0e7-b22966a34c22`，deployment `44d8772f-9da3-4697-aaca-e8e9864f3dd2`，100% 流量。当前只有 ASSETS 绑定。此版本不是本次合并结果。
- Cloudflare API 连接可读配置、部署版本，但静态资源 direct upload 必须使用资产上传会话 JWT 作 Bearer；现有连接没有自定义 Authorization 能力。未发现 Worker Git Builds 触发器、当前环境没有已配置的 Wrangler CLI 授权；浏览器控制台要求登录。不能用仅上传脚本、旧资产或伪造版本代替完整发布。
- 因此 **尚未发布**，旧线上保持不变。用户已授权上线，但未完成部署授权通道。下一位有正常授权的 AI 直接按以下流程部署，不重做 Q28。

## 发布步骤

1. fresh checkout GitHub main，确认 PR #8 已合并（并保留备用资产分支），`npm ci`、`npm run build`、`node --test tools/auth-gateway.test.mjs`、`node --import tsx tools/playtest.ts 2 0.85`。确认 dist 不含交接文件。
2. 现有已授权 Wrangler 环境执行 `npx wrangler deploy --dry-run --config wrangler.jsonc`；核对 Worker 与服务/域名；然后 `npx wrangler deploy --config wrangler.jsonc`，正式上传整个 dist。不得在聊天或公开 GitHub 存 API token。不要覆盖另一个项目或启用额外的自动部署。保留旧版本用于回退。
3. 发布后记录实际新 Version ID、Deployment ID 与 main commit。访问 https://swarm.cianasa888.cfd/ 和 https://tideline-swarm.cianasa888-gbd.workers.dev/，核对首页、游客、音效文件、资源网络无失败。访问主域匿名 /api/swarm/auth/session 得到 JSON accountId:null，跨域 POST 403，错误方法 405，profile/save 404；真实邮箱账号由用户自行测，不让 AI 获取密码。
4. 桌面 1280×800、iPhone 横/竖屏、帧率与 GPU VAT/精英动画/耀光力场、战兔巨爆、九武器原版音频实机验收仍待完成。失败时将 Worker 回退到上面 100% 旧版本；确认静态资源和域名同时回退。真实部署成功再同步 KV 与交接状态。
5. 四种普通怪 GLB 无 ANM；按原交接逐个定向补导，不得误删现成资产。QC-15 的武器映射修正为 StarStrike/PierceShot/HolyBauble，旧错误 Nuke 颜色不能重新合入。

官方发布依据： [静态资产 Direct Upload](https://developers.cloudflare.com/workers/static-assets/direct-upload/)；[Worker-first 路由](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)。
