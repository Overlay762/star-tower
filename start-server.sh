#!/usr/bin/env bash
#
# 多平台塔防 Demo - 后端服务快速启动
# (Linux / macOS)
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "============================================"
echo "  多平台塔防 Demo - 后端服务"
echo "  地址: http://localhost:3000"
echo "  按 Ctrl+C 停止服务"
echo "============================================"
echo ""

cd "${SCRIPT_DIR}/server"

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "[INFO] 依赖未安装，正在安装..."
    npm install
    echo ""
fi

npm run dev
