@echo off
chcp 65001 >nul
title 塔防 Demo - 一键搭建 &amp; 启动

echo.
echo ============================================
echo   多平台塔防 Demo - 环境搭建 &amp; 启动脚本
echo   (Windows)
echo ============================================
echo.

REM ====== 检查 Node.js ======
echo [1/4] 检查 Node.js 环境...
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 未检测到 Node.js，请先安装 Node.js 18+ 
    echo         下载地址: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js 版本: %NODE_VERSION%

REM ====== 检查 npm ======
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 未检测到 npm
    pause
    exit /b 1
)
echo [OK] npm 已就绪

echo.

REM ====== 安装后端依赖 ======
echo [2/4] 安装后端依赖 (server/)...
cd /d "%~dp0server"
if not exist "node_modules\" (
    echo 正在安装依赖，请稍候...
    call npm install
    if errorlevel 1 (
        echo [ERROR] 后端依赖安装失败
        cd /d "%~dp0"
        pause
        exit /b 1
    )
    echo [OK] 后端依赖安装完成
) else (
    echo [SKIP] 后端依赖已存在，跳过安装
)

echo.

REM ====== 安装前端依赖 ======
echo [3/4] 安装前端依赖 (client/)...
cd /d "%~dp0client"
if not exist "node_modules\" (
    echo 正在安装依赖，请稍候...
    call npm install
    if errorlevel 1 (
        echo [OK] 前端依赖安装完成 (或无需额外依赖)
    )
) else (
    echo [SKIP] 前端依赖已存在，跳过安装
)

echo.

REM ====== 启动后端服务 ======
echo [4/4] 启动后端服务...
cd /d "%~dp0server"

echo.
echo ============================================
echo   后端服务启动中...
echo   地址: http://localhost:3000
echo.
echo   按 Ctrl+C 停止服务
echo ============================================
echo.

call npm run dev

cd /d "%~dp0"
pause
