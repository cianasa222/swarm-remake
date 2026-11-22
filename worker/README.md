# Swarm 账号网关（GPT-06）

现有 `tideline-swarm` Worker 的模块入口使用 `worker/index.mjs`；同一次发布应构建本仓库 `dist/`，保留既有 `ASSETS` 静态资源绑定，并增加 **Service Binding** `ACCOUNT_AUTH` → 已存在的 `trash-simulator-auth` Worker（默认入口）。无需导出、复制密钥或绑定原游戏 D1。静态资源配置需将 `/api/swarm/auth/*` 设为 Worker-first；其他静态资源保持既有行为，交接文件不可发布。现有线上 Worker 未在本提交部署。

仅在 `https://swarm.cianasa888.cfd` 开放邮箱账号认证，其他预览/Workers.dev 地址支持游客。原服务的 `login`、`session` 和 `logout` 由受信任的服务绑定调用；Swarm 使用独立 host-only Cookie 名，认证 token 仍由原服务创建和撤销。这不是新的权限范围独立的令牌系统，且不提供云端存档同步。原 `profile`、`save`、`reset`、`setup`、`send`、`verify` 等接口不向 Swarm 开放。注册沿用原站。无密钥、密码或 session token 被写入日志/前端存储。

部署前先检查既有 Worker 版本和配置，保留可回退版本。采用原发布流程上传完整 `dist/`（包括本次 main 已有游戏资产）；不要仅更新 Worker 脚本导致静态资源路径/配置丢失。发布后验证：匿名 `/api/swarm/auth/session` 为 JSON、`accountId: null`，跨域 POST 为 403，非法方法为 405、profile/save 为 404；通过真实服务绑定验证客户端 IP 仍被上游用于限流；由用户自行输入其合法测试账号完成真机登录、刷新、退出，确认两个游戏的 Cookie 和存档不互相覆盖。检查 1280×800 与移动端游戏流程、核心资源及控制台。失败时回退到上个完整 Worker 版本。不要把真实凭据传给 AI。

本地测试：`node --test tools/auth-gateway.test.mjs`、`npm run build`、`node --import tsx tools/playtest.ts 2 0.85`。
