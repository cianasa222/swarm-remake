# Gemini GM-02/GM-03 + GPT QC-19 代上传交接

本分支依赖 Quick BAB-Q01 PR #12。Gemini 原始 KV `pending/bab01-gemini/` 原件及 manifest 均保留。
本次基于 Gemini 13/13 SHA-256 完整性通过的交付进行代码审查、缺项修补和 14.14 原始参数重放。
尚有 9 张新增贴图、2 个特效网格、5 处 attachedMesh 待验证；MapA 场景与 AnimaSquad_Card 需验收方根据原版录像确定。
**只有数据层修复，BAB-01 引擎/运行器尚未验收、未部署。**


## GPT QC-19 审查修订（2026-11-23）

- 原 GM-02/03 基线 **152 系统 / 883 层**，补充精英血条、首领血条/狂暴、敌人出生/出生眼 **5 系统 / 20 层** 后为 **157 系统 / 903 层**。
- `collectSpellRefs` 增加原版 ResourceResolver 哈希与名称引用解析，回旋刃进化返程和 RapidShot 粉色弹已能识别 `usedBySpells`。
- 金币掉落当前模拟层未实现，`gameRefs.inGame=false`；`AnimaSquad_Card` 实际用途待录像确认，同样暂不绑定。
- 新增系统虽保留原版数据，但 `inGame=false`，须等 UI、首领状态和敌人出生事件逐项验收。MapA 环境 19 套暂不纳入，按用户要求交验收方依据原版录像判断。
- `asset_map.json` 现覆盖 **564 张贴图**（原 GM-03 已验证 555；新增 **9 张待实测**）、**135 种网格**（原 133，新 2；目前待补 44），及 **26 处 attachedMesh**（原 21，新 5 未校验）。
- 源 BIN 转换已在隔离 JS 环境回放，输出 SHA256 来源无缺失、157 系统/903 层；转换器增加 2 项测试（合计 6 项）。完整 npm 构建、真正 Node 回归和浏览器/iPhone 验收尚未执行。
- 依赖 Quick BAB-Q01 PR #12。保留全部 KV 原件；**不得直接合并或部署**。
