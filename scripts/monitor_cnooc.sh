#!/bin/bash

# 配置目标 URL
URL="https://ops.w.cnooc.com.cn/page/login?redirect_uri=/page/monitor-board/home?node_id%3D1%26current_tab%3Dtab_1%26current_sub_tab%3Dsubtab_1_8"

# 打印时间戳
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pinging URL..."

# 执行请求
# -s: 静默模式
# -L: 跟随重定向
# -o /dev/null: 丢弃响应体
# -w: 输出 HTTP 状态码
HTTP_CODE=$(curl -s -L -o /dev/null -w "%{http_code}" "$URL")

echo "Result: HTTP $HTTP_CODE"
