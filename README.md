# v-frontend（Verilocale AI E-KYC Console）

本仓库是 `v-backend` 的对应前端项目：基于 **React + Vite + TypeScript**，提供控制台/管理端界面，并包含一个基于 Gemini 的“知识库问答”侧边助手（缺少 Key 时自动降级）。

## Quick Links

- Runbook (Start Here): `docs/runbook/README.md`

## 知识库

- AI First 前端实现知识库：`docs/AI_FIRST_FRONTEND_KB.md`

## 本地运行

### 1) 安装依赖

```bash
npm ci
```

### 2) 配置环境变量（可选，但推荐）

本项目通过 Vite 读取环境变量（`import.meta.env.*`），同时为了兼容 AI Studio 模板，`vite.config.ts` 会把 `GEMINI_API_KEY` 注入为 `process.env.API_KEY`：`vite.config.ts:18`。

建议创建 `.env.local`（不要提交）：

```bash
# 后端 API
# - 本机同机部署：默认可用 http://localhost:8082/api/v1
# - VM / 跨容器 / 远程后端：必须改成可路由的 IP/域名
#   例如：VITE_API_BASE_URL=http://192.168.64.4:8082/api/v1
VITE_API_BASE_URL=http://localhost:8082/api/v1

# 是否启用 mock（默认 false）
VITE_USE_MOCK=false

# Google OAuth（如不使用可不填）
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

# Gemini Key（如不使用“知识库问答”可不填）
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

（推荐）也可从模板复制：`cp .env.example .env.local` 然后再改。
### 3) 启动开发服务

```bash
npm run dev
```

默认端口：`3000`（见 `vite.config.ts:13`）。

## 与后端联调

- 后端默认地址（可通过 `VITE_API_BASE_URL` 覆盖）：`services/config.ts:32`
- 推荐先把后端启动到 `http://localhost:8082`，再启动本前端。
- 健康检查：`curl http://localhost:8082/health`

## 本地CI脚本

```bash
# 快速校验：typecheck + build（node_modules 不存在时会自动 npm ci）
./scripts/test-quick.sh

# 完整校验：强制 npm ci + typecheck + build + 基础安全检查
./scripts/test-all.sh
```
