# GPT-16 · Quick Q-30 StarStrike 代码代上传及风险门禁

## 范围与来源

来自 KV `pending/q30/` 9/9 SHA-256 原件核验（7 个可入仓代码文件 + 仅在 KV 保存的 README / patch），原版 14.14 的 4 套 StarStrike 系统 / 21 层。三个修改的 `src/render/weapon_vfx.ts`、`vfx.ts`、`assets.ts` 基准 SHA-256 **与 GitHub main 一致**，没有强制覆盖其他分支；`src/sim/` 零修改。

## 审核与改动

- `starstrike_14_14.ts` 及 `starstrike_vfx.ts`：数值数据和渲染在 Three.js 层，保留旧 Babylon 迁移边界；13 个实例化图层为代码目标，GPU DrawCall 尚未实机验证。
- 下载工具检查**完整 8 字节 PNG 魔数**，已有 .webp 复用前先经 sharp 解码验证，不再只检查两字节 PNG 特征。
- TypeScript 产品编译只编译 `src`；工具脚本由 `tsx` 单测执行，避免主线已知的 Node 类型 TS2591 错误。
- 单独增加 14 张 WebP 的资源验收脚本 `tools/q30/verify_assets.mjs`。**当前这些图像文件尚未进入分支**，所以资产门禁预计失败；必须运行转换下载工具，再提交实际 14 张贴图并核对版权/版本后方可过门禁。
- 需要核查 `Strawberry_StarStrike_Light_Inside.scb`（当前圆柱占位）与 `star_burst.json` 原版网格对应关系，纹理/Riot 14.14 原版录像对比、真实 iPhone GPU 性能均待验。
- `assets.ts` 中引用新增贴图，但尚未存在时浏览器只会报告资源加载失败并导致新特效不可见，**不可合并/部署**。

## 交付边界

PR 先作为草稿代码备份。原件 KV `pending/q30/`、备份资产分支、已经部署的 Three.js 版本保持不变；没有替换已上线文件。须验收 14 张贴图 / 网格 / build / 数值回归 / 截图 / 移动端性能后才可合并。

## GPT-16 资源导入结果（2026-11-23）

- GitHub Actions `Q30 one-time original texture import` 运行 [45159196452](https://github.com/cianasa222/swarm-remake/actions/runs/45159196452) **success**；Patch 14.14 CommunityDragon 原版纹理 14/14 经 PNG 文件签名、Sharp 解码及 WebP 转换验证。
- 纹理 commit `20f4e0fbb26980ee68f1bde172c39571da061611` 已写入本 PR 分支，包括 14 个 `public/assets/weapons/vfx/starstrike/*.webp` 与 `SHA256SUMS.txt`。GitHub tree 实见 14 个图像、且有非零大小。既有“贴图尚未入仓”的提示仅指**修复之前的初始 PR**。
- 仍需验证：`Light_Inside.scb` 的真实网格及 `star_burst.json` 对应关系、原版录像同步截图、iPhone GPU/WebGL2 帧率与视觉。数值/构建通过亦不代表真机验收完成；**仍保持草稿，不合并或部署**。
