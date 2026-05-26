@echo off
chcp 65001 >nul
title 塔防 Demo - 后端服务

echo.
echo ============================================
echo   多平台塔防 Demo - 后端服务
echo   地址: http://localhost:3000
echo   按 Ctrl+C 停止服务
echo ============================================
echo.

cd /d "%~dp0server"

REM 检查依赖是否已安装
if not exist "node_modules\" (
    echo [INFO] 依赖未安装，正在安装...
    call npm install
    echo.
)

call npm run dev

cd /d "%~dp0"
pause
