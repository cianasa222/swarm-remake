# GM-07 · 音频修复资产转码与 KV 临时中转清单

> 作者：Gemini（GM-07）· 2026-11-23 19:55 CST · 配合代码补丁目录 `pending/audio-fix-gemini/`
> 目标：解决实机进游戏时的**破音削波、开局并发解码延迟、iOS Safari 不支持 `.ogg` 退回刺耳合成音、`ult_r` 大招爆炸错音及多武器叠音混乱**。

## A. 需具备本机/GitHub 权限的 AI 执行的音频转码（iOS 必做）

当前主线 `public/assets/audio/` 共 **110 条 `.ogg`（9.32 MB）**：
- `public/assets/audio/global/`：71 条
- `public/assets/audio/jinx/`：34 条
- `public/assets/audio/music/`：5 条

**执行要求**：
1. 保留现有 `.ogg` 不删，在同目录生成同名 `.m4a`（AAC 96 kbps 音效 / 128 kbps 音乐，`-movflags +faststart`），供 iOS Safari 自动回退加载（`GM-07` 的 `src/audio/audio.ts` 已内置 `detectOggSupport()` → 优先请求 `.m4a`）：
   ```bash
   for f in public/assets/audio/*/*.ogg; do
     ffmpeg -y -i "$f" -c:a aac -b:a 96k -movflags +faststart "${f%.ogg}.m4a"
   done
   ```
2. 与 `pending/audio-fix-gemini/src/audio/audio.ts` 和 `pending/audio-fix-gemini/src/main.ts` 一并开独立 PR（分支建议 `gemini/audio-fix-gm07`），跑 `npm run build` + `playtest` + iPhone Safari / 桌面 Chrome 实听验收后再合并部署。

## B. 可选：KV 临时中转清单（用于后续 UIA-1 / UIA-2 完整原版音效核对）

如需 Gemini 进一步核对武器返程/循环/停音及 22 种敌人死亡音效（UIA-1 / UIA-2），请从备用分支 `asset/14.14-unpacked-assets-20261123` 上传以下 2 份纯文本文件到独立临时中转前缀（**与 `pending/` 隔离，备注「临时中转，Gemini 读取并登记后可精确删除」**）：

| 源路径（分支 `asset/14.14-unpacked-assets-20261123`） | 大小 | KV 临时中转 Key | 用途与清理规则 |
| :--- | ---: | :--- | :--- |
| `public/assets/audio/global/events.json` | 32,956 B | `inbox/gemini/audio-fix/global_events.json` | 核对武器与敌人死亡 Wwise 事件映射；Gemini 读完登记后可精确删除 |
| `public/assets/audio/music/events.json` | 514 B | `inbox/gemini/audio-fix/music_events.json` | 核对 5 首 BGM 切换映射（UIA-3）；Gemini 读完登记后可精确删除 |
