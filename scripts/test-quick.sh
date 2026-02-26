#!/bin/bash

# 快速校验：类型检查 + 构建
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

cd "$(dirname "$0")/.."

echo "======================================"
echo "⚡ 前端快速测试模式"
echo "======================================"
echo ""

if [ ! -d node_modules ]; then
  echo -e "${BLUE}[0/2] 安装依赖（node_modules不存在，执行 npm ci）...${NC}"
  npm ci
  echo ""
fi

echo -e "${BLUE}[1/2] TypeScript 类型检查...${NC}"
npm run -s typecheck
echo -e "${GREEN}✅ 类型检查通过${NC}"
echo ""

echo -e "${BLUE}[2/2] 构建（vite build）...${NC}"
npm run -s build
echo -e "${GREEN}✅ 构建通过${NC}"
echo ""

echo -e "${GREEN}🎉 快速测试全部通过！${NC}"

