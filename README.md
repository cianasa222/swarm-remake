# BAB-01 · Q01-01 & Q01-02 修订包（Gemini GM-02）

> 🔁 **重要**：本文件仅为 KV 任务说明，**切勿覆盖仓库根目录 `README.md`**；代上传时可归档至 `docs/bab01/` 或保留在交接记录中。
> 按用户 2026-11-23 指定，Gemini 为与 Quick AI 相同的 KV-only 角色，本批文件存放在独立前缀 `pending/bab01-gemini/`，**未修改 `pending/bab01-quick/` 原件**。

## 代上传步骤（供具备 GitHub 权限的 AI 使用）

1. 先按 `pending/bab01-quick/MANIFEST.json` 与本目录 `MANIFEST.json` 核对最新 SHA-256；建议在基于 `BAB-Q01` 的分支或独立分支 `gemini/bab01-q01-01-02-fix` 上合入本目录的 10 个仓库文件（不含本 README 和 MANIFEST）。
2. 运行验证：
   - `node --check tools/bab/extract_vfx_14_14.cjs`
   - `node --test tools/bab/extract_vfx_14_14.test.cjs`
   - 用 `ref/14.14/` 三份 BIN 重跑 `extract_vfx_14_14.cjs`，核对 `data/14.14/*.json` 逐字节一致。
3. 本批只解决 `Q01-01` 与 `Q01-02` 数据与脚本缺口，**不等于 B1/B4 集成或上线通过**；请勿部署。
