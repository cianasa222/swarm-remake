# 无尽狂潮复刻

《英雄联盟：无尽狂潮（Swarm）》第一关「仓库区（Map33）」3D 复刻项目，基于 **Vite + TypeScript + Three.js** 构建。

## 技术栈
- **渲染与引擎**：Three.js + TypeScript + Vite
- **模拟与渲染解耦**：`src/sim/` 负责确定性逻辑、碰撞与波次，预留多人联机与逻辑级波次缩放接口；`src/render/` 负责 3D 场景、角色骨骼动画、VFX 与画质档位调节。

## 本地开发命令
```bash
npm install
npm run dev              # 启动本地开发服务器
npm run build            # TypeScript 检查 + Vite 生产构建
npm run playtest -- 2 0.85  # 运行无头数值与战斗回归测试
```

## 仓库说明
- 本仓库仅托管**源码、配置、工具脚本与开发文档**；大体积游戏 3D 模型与贴图资产（`public/assets/`、`资产包/`）已通过 `.gitignore` 排除。
- 项目规范、架构与优化方案请查看 [`AGENTS.md`](./AGENTS.md)。
- 当前开发进度与待修事项请查看 [`PROGRESS.md`](./PROGRESS.md)。
