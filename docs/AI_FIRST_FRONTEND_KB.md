# AI First 知识库（v-frontend）

> 目标：把本项目“当前可运行的事实 + 关键业务实现路径”整理成可被人类与 AI 共同检索复用的前端知识库。

## 1. 现状快照（事实与证据）

- 技术栈：React + Vite + TypeScript（见 `package.json:7`、`vite.config.ts:1`）
- 开发服务器：默认 `0.0.0.0:3000`（见 `vite.config.ts:12`）
- 后端联调基地址：默认 `http://localhost:8082/api/v1`（见 `services/config.ts:32`）
- AI（Gemini）助手：通过 `@google/genai` 调用（见 `lib/ai.ts:2`）
- 运行时配置注入脚本：页面会加载 `/env-config.js` 与 `/env.js`（见 `index.html:84`）

## 2. 配置与环境变量

### 2.1 Vite 环境变量

- `VITE_API_BASE_URL`：后端 API Base URL（默认 `http://localhost:8082/api/v1`）
  - 读取逻辑：`services/config.ts:2`
- `VITE_USE_MOCK`：是否启用 mock（默认 `false`）
  - 读取逻辑：`services/config.ts:23`
- `VITE_GOOGLE_CLIENT_ID`：Google OAuth Client ID
  - 读取逻辑：`services/config.ts:38`

### 2.2 Gemini API Key 注入方式（兼容 AI Studio 模板）

Vite 配置会把 `GEMINI_API_KEY` 注入为 `process.env.API_KEY`：

- 注入点：`vite.config.ts:18`
- 使用点：`lib/ai.ts:8`

缺少 Key 时，AI 功能会自动降级并返回固定提示：`lib/ai.ts:50`。

## 3. 本地运行 Runbook

```bash
npm ci
npm run dev
```

快速验证：

```bash
./scripts/test-quick.sh
```

## 4. 与后端联调 Runbook

1) 先启动后端（默认端口 8082）
2) 前端配置 `VITE_API_BASE_URL=http://localhost:8082/api/v1`
3) 启动前端并验证登录/组织切换/Key 管理等页面是否可正常请求

后端健康检查：

```bash
curl http://localhost:8082/health
```

## 5. 关键模块索引（按业务能力）

### 5.1 API 配置与运行时注入

- 运行时注入（Docker/生产）：`window.__ENV__`（见 `services/config.ts:6`）
- 构建时注入（Vite）：`import.meta.env`（见 `services/config.ts:14`）

### 5.2 AI 知识库问答

- 系统提示词构建：`lib/ai.ts:22`
- 历史消息裁剪（仅保留最后 10 条）：`lib/ai.ts:59`

### 5.3 后端接口调用

- 建议以 `services/` 作为后端 API 的集中封装层（便于 mock/鉴权/错误处理统一）。

## 6. 本地CI脚本说明

- 快速校验：`scripts/test-quick.sh:1`（typecheck + build；若无 `node_modules` 自动 `npm ci`）
- 完整校验：`scripts/test-all.sh:1`（强制 `npm ci` + typecheck + build + 安全检查）

## 7. 安全边界（必须遵守）

- `cert/` 下包含私钥（例如 `cert/privkey.pem`），必须保持不入库（已通过 `.gitignore` 排除）。
- `.env.local` 属于本地环境配置，不得提交。

## 8. 给 AI 的 Prompt 模板（可直接复制）

### 8.1 定位某个页面/功能如何调用后端

```
请在 v-frontend 中定位“<功能/页面>”调用后端 API 的路径：
1) 页面入口组件文件与行号
2) 调用的 service 封装函数文件与行号
3) 最终请求 URL 组成（baseUrl + path），并指出可用的环境变量覆盖项
4) 错误处理与用户提示逻辑（在哪里做）
```
