# 多平台塔防 Demo

基于 Cocos Creator 3.x + Node.js 的跨平台塔防游戏 Demo，同一套游戏逻辑可运行于 PC Web / Android / iOS / 微信小游戏。

---

## 环境依赖

| 依赖项 | 版本要求 | 说明 |
|--------|----------|------|
| **Node.js** | `>= 18.x` | 后端运行环境 (推荐 20 LTS) |
| **npm** | `>= 9.x` | 包管理器 (随 Node.js 附带) |
| **Cocos Creator** | `3.9.x` | 前端游戏引擎 IDE |
| **TypeScript** | `5.3.x` | 后端编译 (通过 ts-node 运行) |

### 后端依赖 (server/package.json)

| 包名 | 版本 | 用途 |
|------|------|------|
| `express` | `^4.18.2` | HTTP 服务框架 |
| `jsonwebtoken` | `^9.0.2` | JWT 鉴权 |
| `bcryptjs` | `^2.4.3` | 密码哈希 |
| `cors` | `^2.8.5` | 跨域请求 |
| `zod` | `^3.22.4` | 请求参数校验 |
| `ts-node` | `^10.9.2` | TypeScript 直接运行 (dev) |
| `typescript` | `^5.3.3` | TypeScript 编译器 |
| `@types/*` | - | TypeScript 类型声明 |

### 前端依赖 (client/)

> 前端通过 **Cocos Creator 编辑器** 管理，无需额外 `npm install`。`client/package.json` 仅用于项目元数据标识。

---

## 项目结构

```
demo/
├── client/              # Cocos Creator 3.x 前端项目
│   ├── assets/
│   │   ├── scripts/
│   │   │   ├── core/        # 核心模块 (EventBus, ConfigManager, GameManager, ObjectPool)
│   │   │   ├── combat/      # 战斗系统 (Tower, Enemy, Bullet, DamageResolver)
│   │   │   ├── wave/        # 波次系统
│   │   │   ├── economy/     # 经济系统
│   │   │   ├── build/       # Build三选一系统
│   │   │   ├── platform/    # 平台抽象层 (Web/Android/iOS/微信)
│   │   │   ├── network/     # HTTP客户端 + API端点定义
│   │   │   ├── save/        # 存档系统 (本地+云端)
│   │   │   └── ui/          # UI组件 (HUD/TowerSelector/BuildPanel/GameOverPanel)
│   │   ├── config/          # JSON配置文件 (tower/enemy/wave/buff)
│   │   ├── scenes/          # Cocos 场景文件
│   │   ├── prefabs/         # Cocos 预制体
│   │   └── resources/       # 资源文件
│   ├── settings/            # Cocos 编辑器设置
│   ├── package.json
│   └── tsconfig.json
│
├── server/              # Node.js 后端服务
│   ├── src/
│   │   ├── app.ts           # Express 入口
│   │   ├── routes/          # API路由 (auth/user/save/pay/activity/leaderboard)
│   │   ├── controllers/     # 控制器 (请求处理+zod校验)
│   │   ├── services/        # 业务逻辑层
│   │   ├── models/          # 数据模型 (JSON存储CRUD)
│   │   ├── middleware/      # 中间件 (JWT鉴权/错误处理)
│   │   ├── database/        # JSON文件数据库初始化
│   │   └── types/           # 全局类型定义
│   ├── package.json
│   └── tsconfig.json
│
├── setup.bat            # [Windows] 一键环境搭建+启动
├── setup.sh             # [Linux/macOS] 一键环境搭建+启动
├── start-server.bat     # [Windows] 快速启动后端
├── start-server.sh      # [Linux/macOS] 快速启动后端
├── README.md
└── .gitignore
```

## 核心功能

### 游戏系统
- 🏰 **战斗系统**: 塔建造/攻击、敌人移动、子弹飞行、伤害结算
- 🌊 **波次系统**: 10波配置驱动，普通波/精英波/Boss波
- 💰 **经济系统**: 击杀获金币 → 建塔消耗金币，形成回环
- ⚡ **Build三选一**: 每波结束后选择1个Buff (roguelike策略深度)
- 🗂️ **存档系统**: 本地 + 云端双存档

### 后端服务
- 🔐 **账号系统**: 注册/登录，JWT鉴权
- ☁️ **云存档**: 存档云端同步
- 💳 **支付模拟**: 模拟充值金币
- 🎁 **活动系统**: 每日签到、任务系统
- 🏆 **排行榜**: 波次通关排行

### 平台支持
- PC Web (HTML5)
- Android (APK)
- iOS (Xcode工程)
- 微信小游戏

## 快速开始

### 方式一：一键脚本启动（推荐）

**Windows:**
```cmd
双击运行 setup.bat
```

**Linux / macOS:**
```bash
chmod +x setup.sh start-server.sh
./setup.sh
```

脚本会自动：检查 Node.js 环境 → 安装依赖 → 启动后端服务。

---

### 方式二：仅启动后端（依赖已安装）

**Windows:**
```cmd
双击运行 start-server.bat
```

**Linux / macOS:**
```bash
chmod +x start-server.sh
./start-server.sh
```

---

### 方式三：手动分步启动

#### 1. 启动后端服务

```bash
cd server
npm install        # 首次需安装依赖
npm run dev        # 启动开发服务器
```

服务启动在 **http://localhost:3000**

#### 2. 打开前端项目

1. 安装 [Cocos Creator 3.9.x](https://www.cocos.com/creator-download)
2. 启动 Cocos Creator → 打开项目 → 选择 `client/` 目录
3. 点击编辑器顶部的 ▶ 运行按钮预览游戏

---

### 跨平台构建

在 Cocos Creator 编辑器中：
- 菜单 → 项目 → 构建发布
- 选择目标平台：**Web Mobile** / **Android** / **iOS** / **微信小游戏**
- 点击构建

| 平台 | 输出 | 说明 |
|------|------|------|
| Web Mobile | HTML5 网页 | 可直接部署到 Web 服务器 |
| Android | APK 安装包 | 需 Android Studio + NDK |
| iOS | Xcode 工程 | 仅 macOS + Xcode 环境 |
| 微信小游戏 | 微信小游戏包 | 需微信开发者工具 |

## API 文档

**Base URL:** `http://localhost:3000`

### 认证模块
| 方法 | 路径 | 鉴权 | 说明 | 请求体 |
|------|------|------|------|--------|
| POST | `/api/auth/register` | - | 注册账号 | `{ username, password }` |
| POST | `/api/auth/login` | - | 登录获取Token | `{ username, password }` |

### 用户模块
| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/user/profile` | JWT | 获取用户信息 (金币/等级) |

### 存档模块
| 方法 | 路径 | 鉴权 | 说明 | 请求体 |
|------|------|------|------|--------|
| POST | `/api/save/sync` | JWT | 云端同步存档 | `{ saveData: object }` |
| GET | `/api/save/load` | JWT | 拉取云端存档 | - |

### 支付模块
| 方法 | 路径 | 鉴权 | 说明 | 请求体 |
|------|------|------|------|--------|
| POST | `/api/pay/recharge` | JWT | 模拟充值 (1元=10金币) | `{ amount: number }` |

### 活动模块
| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/activity/daily` | JWT | 每日签到 (连续签到加成) |
| GET | `/api/activity/tasks` | JWT | 获取活动任务列表 |
| POST | `/api/activity/tasks/:id/claim` | JWT | 领取任务奖励 |

### 排行榜模块
| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/leaderboard/submit` | JWT | 提交通关成绩 |
| GET | `/api/leaderboard/waves` | JWT | Top 50 排行榜 |

> **所有需鉴权的接口** 必须在 Header 中携带 `Authorization: Bearer <token>`

---

## 配置说明

所有游戏数值通过 `client/assets/config/` 下的 JSON 文件配置，**修改 JSON 即生效，无需改代码**。

### tower.json — 塔属性
```jsonc
{
  "towers": [
    {
      "id": "arrow_tower",
      "name": "箭塔",
      "cost": 100,          // 建造费用
      "attack": 25,         // 基础攻击力
      "range": 200,         // 攻击范围 (像素)
      "attackSpeed": 1.0,   // 攻击间隔 (秒)
      "color": "#4CAF50"    // 占位色
    }
  ]
}
```

### enemy.json — 敌人属性
```jsonc
{
  "enemies": [
    {
      "id": "slime",
      "name": "史莱姆",
      "maxHp": 100,         // 生命值
      "speed": 80,          // 移动速度
      "goldReward": 10,     // 击杀赏金
      "color": "#2196F3"    // 占位色
    }
  ]
}
```

### wave.json — 波次配置
```jsonc
{
  "waves": [
    {
      "wave": 1,
      "enemy": "slime",     // 敌人类型 ID
      "count": 10,          // 出怪数量
      "interval": 1.0       // 出怪间隔 (秒)
    }
  ]
}
```

### buff.json — Buff 配置
```jsonc
{
  "buffs": [
    {
      "id": "buff_atk_up",
      "name": "攻击力+20%",
      "description": "所有塔攻击力提升20%",
      "type": "attack",     // 效果类型: attack/slow/bounce/range/speed/gold
      "value": 0.2,         // 效果数值
      "weight": 10          // 随机权重
    }
  ]
}
```

## 架构设计

```
┌──────────────────────────────┐
│        UI / View Layer        │  ← HUD, TowerSelector, BuildPanel
├──────────────────────────────┤
│     Game Logic Layer          │  ← Combat, Wave, Economy, Build
├──────────────────────────────┤
│   System / Service Layer      │  ← EventBus, ConfigManager, GameManager
├──────────────────────────────┤
│   Platform Abstraction Layer  │  ← Web/Android/iOS/WeChat
├──────────────────────────────┤
│      Cocos Creator Engine     │
└──────────────────────────────┘
          ↕ HTTP REST
┌──────────────────────────────┐
│      Node.js Backend          │  ← Express + JWT + JSON DB
└──────────────────────────────┘
```

## 常见问题

### Q1: 启动 `setup.bat` 报错 "未检测到 Node.js"？
> 需要先安装 Node.js 18+ → [nodejs.org](https://nodejs.org/)

### Q2: 端口 3000 被占用？
```bash
# Windows
netstat -ano | findstr :3000
# 找到 PID 后: taskkill /PID <PID> /F

# Linux/macOS
lsof -i :3000
kill -9 <PID>
```

### Q3: Cocos Creator 如何打开项目？
> 启动 Cocos Creator 3.9.x → 点击"打开其他项目" → 选择 `client/` 目录

### Q4: 数据存储在哪里？
> 后端使用 JSON 文件存储，所有数据保存在：
> - 用户数据: `server/data/users.json`
> - 存档数据: `server/data/saves.json`
> - 签到记录: `server/data/checkins.json`
> - 排行数据: `server/data/leaderboard.json`
>
> 删除这些 JSON 文件即可重置全部数据。

### Q5: 如何修改游戏数值？
> 编辑 `client/assets/config/` 下的 JSON 文件，刷新游戏即生效，无需重新编译。

---

## 技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| 前端引擎 | Cocos Creator | 3.9.x |
| 前端语言 | TypeScript | ES2015+ |
| 后端框架 | Express | 4.18.x |
| 后端语言 | TypeScript | 5.3.x |
| 鉴权 | JSON Web Token | 9.x |
| 密码加密 | bcryptjs | 2.4.x |
| 参数校验 | Zod | 3.22.x |
| 数据存储 | JSON 文件 | 零依赖 |
| 目标平台 | PC Web / Android / iOS / 微信小游戏 | - |
