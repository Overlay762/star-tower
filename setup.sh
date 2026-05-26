#!/usr/bin/env bash
#
# 多平台塔防 Demo - 一键环境搭建 & 启动脚本
# (Linux / macOS)
#

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "============================================"
echo "  多平台塔防 Demo - 环境搭建 & 启动脚本"
echo "  (Linux / macOS)"
echo "============================================"
echo ""

# ====== 检查 Node.js ======
echo "[1/4] 检查 Node.js 环境..."

if ! command -v node &>/dev/null; then
    echo "[ERROR] 未检测到 Node.js，请先安装 Node.js 18+"
    echo "        下载地址: https://nodejs.org/"
    echo "        或使用 nvm: https://github.com/nvm-sh/nvm"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "[OK] Node.js 版本: ${NODE_VERSION}"

# ====== 检查 npm ======
if ! command -v npm &>/dev/null; then
    echo "[ERROR] 未检测到 npm"
    exit 1
fi
echo "[OK] npm 已就绪"

echo ""

# ====== 安装后端依赖 ======
echo "[2/4] 安装后端依赖 (server/)..."
cd "${SCRIPT_DIR}/server"

if [ ! -d "node_modules" ]; then
    echo "正在安装依赖，请稍候..."
    npm install
    echo "[OK] 后端依赖安装完成"
else
    echo "[SKIP] 后端依赖已存在，跳过安装"
fi

echo ""

# ====== 安装前端依赖 ======
echo "[3/4] 安装前端依赖 (client/)..."
cd "${SCRIPT_DIR}/client"

if [ ! -d "node_modules" ]; then
    echo "正在安装依赖，请稍候..."
    npm install
    echo "[OK] 前端依赖安装完成"
else
    echo "[SKIP] 前端依赖已存在，跳过安装"
fi

echo ""

# ====== 启动后端服务 ======
echo "[4/4] 启动后端服务..."
cd "${SCRIPT_DIR}/server"

echo ""
echo "============================================"
echo "  后端服务启动中..."
echo "  地址: http://localhost:3000"
echo ""
echo "  按 Ctrl+C 停止服务"
echo "============================================"
echo ""

npm run dev
