#!/bin/bash

# 完整校验：依赖安装 + 类型检查 + 构建 + 基础安全检查
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd "$(dirname "$0")/.."

echo "======================================"
echo "🔍 前端本地CI测试（Full）"
echo "======================================"
echo ""

echo -e "${BLUE}[1/4] 安装依赖（npm ci）...${NC}"
npm ci
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

echo -e "${BLUE}[2/4] TypeScript 类型检查...${NC}"
npm run -s typecheck
echo -e "${GREEN}✅ 类型检查通过${NC}"
echo ""

echo -e "${BLUE}[3/4] 构建（vite build）...${NC}"
npm run -s build
echo -e "${GREEN}✅ 构建通过${NC}"
echo ""

echo -e "${BLUE}[4/4] 基础安全检查（禁止提交证书/私钥/本地环境文件）...${NC}"

if git ls-files | grep -E '\.(pem|key)$' >/dev/null 2>&1; then
  echo -e "${RED}❌ 检测到被Git跟踪的证书/私钥文件（*.pem/*.key），请移除后再提交${NC}"
  git ls-files | grep -E '\.(pem|key)$' || true
  exit 1
fi

if git ls-files | grep -E '(^|/)(\.env(\.|$)|\.env\.local$)' >/dev/null 2>&1; then
  echo -e "${RED}❌ 检测到被Git跟踪的 .env 文件，请移除后再提交${NC}"
  git ls-files | grep -E '(^|/)(\.env(\.|$)|\.env\.local$)' || true
  exit 1
fi

echo -e "${GREEN}✅ 安全检查通过${NC}"
echo ""

echo -e "${GREEN}🎉 Full CI 全部通过！${NC}"

