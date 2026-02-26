# Stage 1: 构建
FROM node:20-alpine AS builder
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 拷贝源码
COPY . .

# 生成静态文件
RUN npm run build

# Stage 2: 运行（Nginx 提供静态文件）
FROM nginx:alpine AS runner


RUN apk add --no-cache bash

WORKDIR /usr/share/nginx/html

# 运行时根据环境变量生成 env.js（无需安装 gettext）

# 拷贝静态资源
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf


COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 直接在启动时写入 env.js（展开环境变量）

EXPOSE 80
EXPOSE 443
EXPOSE 3002
EXPOSE 3003


# 仅静态部署（构建期注入）：直接启动 Nginx
# CMD ["nginx", "-g", "daemon off;"]


ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
