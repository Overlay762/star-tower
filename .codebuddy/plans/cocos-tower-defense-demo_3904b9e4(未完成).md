---
name: cocos-tower-defense-demo
overview: 从零搭建 Cocos Creator 3.x 多平台塔防 Demo，包含完整的战斗/波次/经济/Build(三选一)/平台抽象/存档系统，使用扁平风几何图形作为占位美术，能实际运行并通过配置调整数值。
design:
  architecture:
    framework: react
  styleKeywords:
    - 扁平化
    - 几何图形
    - 纯色块
    - 休闲塔防
    - 简洁明快
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 24px
      weight: 700
    subheading:
      size: 16px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#4A90D9"
      - "#D94A4A"
      - "#4AD9D9"
    background:
      - "#2D5A27"
      - "#8B7355"
      - "#1A1A2E"
      - "#2D2D44"
    text:
      - "#FFFFFF"
      - "#B0B0C0"
    functional:
      - "#FFD700"
      - "#E74C3C"
      - "#E8D44D"
      - "#9B59B6"
      - "#E87830"
      - "#FFFFFF"
todos:
  - id: setup-cocos-project
    content: 创建 Cocos Creator 3.9.x 项目骨架，包含目录结构、tsconfig.json、package.json 和基础项目配置
    status: pending
  - id: create-config-json
    content: 编写全部 JSON 配置文件（tower.json/enemy.json/wave.json/buff.json），定义塔、敌人、波次、Buff的完整数值
    status: pending
    dependencies:
      - setup-cocos-project
  - id: implement-core-eventbus-config
    content: 实现 core/ 核心模块——EventBus 事件总线、ConfigManager 配置加载器、GameManager 状态管理、ObjectPool 对象池
    status: pending
    dependencies:
      - setup-cocos-project
  - id: implement-combat-system
    content: 实现 combat/ 战斗系统全模块：Tower组件、TowerManager、Enemy组件、EnemyManager、Bullet组件、BulletSystem、DamageResolver
    status: pending
    dependencies:
      - implement-core-eventbus-config
      - create-config-json
  - id: implement-wave-economy-build
    content: 实现 WaveSystem 波次系统、EconomySystem 经济系统、BuildSystem 三选一系统及 BuffData 定义
    status: pending
    dependencies:
      - implement-core-eventbus-config
      - implement-combat-system
  - id: implement-platform-save
    content: 实现 platform/ 平台抽象层（IPlatformService + WebPlatform + PlatformManager）和 save/ 存档系统
    status: pending
    dependencies:
      - implement-core-eventbus-config
  - id: create-scene-prefabs-ui
    content: 创建 GameScene 场景、全部预制体（Tower/Enemy/Bullet）、UI组件（HUD/TowerSelector/BuildPanel/GameOverPanel），组装完整可玩游戏
    status: pending
    dependencies:
      - implement-combat-system
      - implement-wave-economy-build
  - id: integrate-and-test
    content: 全系统集成联调：事件流打通、数值平衡验证、游戏完整流程测试（从开始到结束→重新开始），确保单局5-10分钟可玩
    status: pending
    dependencies:
      - create-scene-prefabs-ui
      - implement-platform-save
---

## 产品概述

构建一个支持多平台（PC Web / Android / iOS / 微信小游戏）的塔防 Demo，使用 Cocos Creator 3.9.x + TypeScript 开发。核心验证目标：同一套游戏逻辑无需修改即可跨平台运行，基础战斗循环成立，数值成长曲线合理，系统架构支持后续扩展（活动/商业化/后端）。

## 核心功能

- **战斗系统**：塔的建造与攻击、敌人沿路径移动、子弹飞行与命中、伤害结算，全部走状态机模式
- **波次系统**：配置驱动的多波次敌人刷新，支持普通波、精英波、Boss波，自动计算波次结束与下一波开始
- **经济系统**：金币产出（击杀奖励）+ 金币消耗（建塔/升级），形成闭环，产出略小于消耗以维持挑战性
- **Build三选一系统**：每波结束后弹出3张Buff卡牌，玩家选择1张获得局内永久增益（如攻击+20%、冰霜减速、弹射+1等），赋予 roguelike 策略深度
- **平台抽象层**：IPlatformService 接口统一封装登录、存储、分享等平台能力，提供 Web/Android/iOS/WeChat 四个实现
- **存档系统**：本地序列化/反序列化存档，保存玩家等级、金币等持久化数据
- **全部数值配置化**：塔属性、敌人属性、波次配置、Buff效果全部走 JSON 配置文件，调数值无需改代码

## 技术栈

- **游戏引擎**：Cocos Creator 3.9.x
- **开发语言**：TypeScript
- **配置格式**：JSON（tower.json / enemy.json / wave.json / buff.json）
- **目标平台**：PC Web（HTML5）/ Android / iOS / 微信小游戏
- **构建方式**：Cocos Creator 原生跨平台构建流水线

## 实现方案

### 整体架构策略

采用严格的四层分层架构，自上而下为：UI/View层 → GameLogic层 → System/Service层 → Platform Abstraction层。核心原则是**逻辑与平台彻底解耦**——所有游戏业务逻辑禁止直接调用任何平台特定 API（微信API、Android SDK、iOS SDK），统一通过 IPlatformService 接口调用。

战斗系统采用**纯状态机模式**：Update(delta) → SpawnEnemy() → TowerAttack() → BulletMove() → DamageApply() → CheckWaveEnd()，每一帧的输入确定性地驱动状态更新和输出，保证战斗可复现、可回放。

### 关键技术决策

**1. 组件化而非继承**
Cocos Creator 3.x 使用 Component 模式。每个游戏实体（塔、敌人、子弹）都是一个挂载了对应 Component 的 Node。不采用深层继承链，通过组合 Component 实现行为复用，符合引擎最佳实践。

**2. 配置驱动的数值系统**
所有战斗相关数值（攻击力、血量、移速、波次配置、Buff效果）均存储在 JSON 配置文件中，通过 ConfigManager 在运行时加载。修改数值只需改 JSON，不需动任何 TypeScript 代码。引擎内置的 resources.load 用于运行时加载 config 目录下的 JSON 资源。

**3. 事件总线解耦系统间通信**
使用单例 EventBus 在战斗、波次、经济、Build 四个子系统之间传递消息（如敌人的死亡事件触发金币增加、波次结束事件触发Build选择弹窗），避免系统间直接耦合。

**4. 对象池优化**
子弹和敌人使用对象池（NodePool）管理，避免频繁创建/销毁带来的 GC 压力。塔防游戏中子弹是最频繁创建销毁的对象，对象池是标配。

### 实现注意事项

- **性能**：敌人和子弹使用 Cocos Creator 内置的 NodePool 进行对象复用，减少 GC 抖动
- **日志**：统一使用 cc.log / cc.warn / cc.error，关键战斗事件（波次开始/结束、Boss出现、游戏结束）打日志以便调试
- **兼容性**：所有 Cocos API 调用限定在 Cocos Creator 3.x 的稳定 API 范围内，避免使用实验性 API 或 2.x 遗留 API
- **蓝牙半径控制**：所有修改集中在 assets/ 目录下，不动原生平台模板代码（native/ 目录），后续跨平台构建时由 Cocos Creator 自动处理

## 架构设计

### 系统架构图

```
┌──────────────────────────────────────────────────┐
│                   UI / View Layer                  │
│   HUD.ts  |  TowerSelector.ts  |  BuildPanel.ts   │
│   GameOverPanel.ts  |  GameScene.ts               │
├──────────────────────────────────────────────────┤
│               Game Logic Layer                     │
│   CombatSystem  │  WaveSystem  │  EconomySystem   │
│   BuildSystem   │  SaveSystem                     │
│   TowerManager  │  EnemyManager  │  BulletSystem  │
│   DamageResolver                                 │
├──────────────────────────────────────────────────┤
│             System / Service Layer                 │
│   EventBus  │  ConfigManager  │  GameManager      │
├──────────────────────────────────────────────────┤
│          Platform Abstraction Layer                │
│   IPlatformService                                │
│   WebPlatform  │  WeChatPlatform                   │
│   AndroidPlatform  │  iOSPlatform                  │
├──────────────────────────────────────────────────┤
│              Engine (Cocos Creator 3.x)            │
└──────────────────────────────────────────────────┘
```

### 数据流

```
用户点击建塔 → TowerSelector发出事件 → EconomySystem检查金币
  → 扣除金币 → TowerManager创建塔Node → CombatSystem注册塔
  → 每帧Update → Tower寻找范围内敌人 → 创建子弹 → BulletSystem飞行
  → DamageResolver结算 → 敌人死亡 → EventBus发出EnemyDied事件
  → EconomySystem加金币 → WaveSystem检查是否波次结束
  → 触发BuildSystem弹出三选一 → 玩家选择Buff → CombatSystem应用全局增益
```

## 目录结构

```
demo/
├── assets/
│   ├── scripts/
│   │   ├── core/
│   │   │   ├── EventBus.ts          # [NEW] 全局事件总线，单例模式。提供 on/emit/off 方法，用于战斗/波次/经济/Build系统间解耦通信。事件类型用字符串常量枚举。
│   │   │   ├── ConfigManager.ts     # [NEW] 配置管理器。运行时通过 resources.load 加载 config/ 下所有 JSON 文件，提供 getTowerConfig/getEnemyConfig/getWaveConfig/getBuffConfig 泛型查询方法，带缓存避免重复加载。
│   │   │   ├── GameManager.ts       # [NEW] 游戏全局状态管理器。管理游戏状态枚举（WAITING/PLAYING/PAUSED/WAVE_COMPLETE/GAME_OVER），持有所有子系统的引用，控制游戏主循环。
│   │   │   └── ObjectPool.ts        # [NEW] 通用对象池封装。基于 Cocos NodePool，提供 get/put/clear 方法，支持预初始化容量。
│   │   ├── combat/
│   │   │   ├── Tower.ts             # [NEW] 塔组件。持有塔数据（攻击力/范围/攻速/类型），每帧检测范围内最近敌人，冷却到则调用 BulletSystem 发射子弹。
│   │   │   ├── TowerManager.ts      # [NEW] 塔管理器。管理所有场上塔的列表，提供建造/出售/升级接口，处理塔位占用状态。
│   │   │   ├── Enemy.ts             # [NEW] 敌人组件。持有敌人数据（血量/移速/金币奖励），沿预设路径点移动，被击中时更新血量，死亡时发出事件。
│   │   │   ├── EnemyManager.ts      # [NEW] 敌人管理器。管理敌人生成/移动/死亡，持有敌人路径点数组，处理敌人到达终点扣血逻辑。
│   │   │   ├── Bullet.ts            # [NEW] 子弹组件。持有伤害值/速度/目标引用，每帧向目标移动，命中时触发 DamageResolver 结算。
│   │   │   ├── BulletSystem.ts      # [NEW] 子弹系统。管理子弹对象池，提供发射/回收接口，处理子弹的创建与飞行更新。
│   │   │   └── DamageResolver.ts    # [NEW] 伤害结算器。纯逻辑模块（不继承 Component），计算实际伤害=基础攻击×(1+全局Buff加成)，处理暴击/减速等Buff效果。
│   │   ├── wave/
│   │   │   └── WaveSystem.ts        # [NEW] 波次系统。持有当前波次索引和 wave.json 配置，按配置的时间间隔生成敌人，管理波间等待，发出波次开始/结束事件。
│   │   ├── economy/
│   │   │   └── EconomySystem.ts     # [NEW] 经济系统。管理金币余额，提供 earn/spend/canAfford 接口，监听敌人死亡事件自动加金币，监听建塔事件扣金币。
│   │   ├── build/
│   │   │   ├── BuildSystem.ts       # [NEW] Build系统。管理全局Buff列表，每波结束时随机抽3个Buff，处理玩家选择并应用永久增益到 CombatSystem。
│   │   │   └── BuffData.ts          # [NEW] Buff数据结构定义。定义 BuffEffect 接口（id/name/description/type/value/icon），以及 BuffType 枚举（ATK_BOOST/SPEED_BOOST/FREEZE/RICOCHET/CRIT等）。
│   │   ├── platform/
│   │   │   ├── IPlatformService.ts  # [NEW] 平台抽象接口。定义 login/getUserInfo/saveData/loadData/share 方法签名，所有平台实现必须实现此接口。
│   │   │   ├── WebPlatform.ts       # [NEW] Web平台实现。使用 localStorage 存储，login 返回模拟用户数据。
│   │   │   ├── WechatPlatform.ts    # [NEW] 微信小游戏平台实现（骨架）。使用 wx 全局API，留空具体实现待接入微信SDK测试。
│   │   │   ├── AndroidPlatform.ts   # [NEW] Android平台实现（骨架）。未来通过 JSBridge 调用原生能力。
│   │   │   ├── IOSPlatform.ts       # [NEW] iOS平台实现（骨架）。未来通过 JSBridge 调用原生能力。
│   │   │   └── PlatformManager.ts   # [NEW] 平台管理器。根据运行时环境自动选择正确的 IPlatformService 实现，对外暴露统一接口。
│   │   ├── save/
│   │   │   └── SaveSystem.ts        # [NEW] 存档系统。定义 SaveData 接口（level/gold/unlockedTowers），提供 serialize/deserialize/save/load 方法，底层调用 IPlatformService 的存储能力。
│   │   └── ui/
│   │       ├── HUD.ts               # [NEW] 顶部HUD组件。显示波次、金币、生命值，监听 EventBus 事件实时更新。
│   │       ├── TowerSelector.ts     # [NEW] 底部塔选择栏组件。显示可选塔类型、费用，处理点击选择逻辑，发出建塔事件。
│   │       ├── BuildPanel.ts        # [NEW] Build三选一弹窗组件。波次结束时弹出，显示3张Buff卡片，处理点击选择并通知 BuildSystem。
│   │       └── GameOverPanel.ts     # [NEW] 游戏结束面板。显示胜利/失败状态、统计信息、重新开始按钮。
│   ├── config/
│   │   ├── tower.json               # [NEW] 塔配置表。定义箭塔/炮塔/冰塔的 id/name/attack/range/attackSpeed/cost/color 字段。
│   │   ├── enemy.json               # [NEW] 敌人配置表。定义slime/elite/boss的 id/name/hp/speed/gold/color/scale 字段。
│   │   ├── wave.json                # [NEW] 波次配置表。定义每波次的 wave/enemyType/count/spawnInterval/restTime 字段。
│   │   └── buff.json                # [NEW] Buff配置表。定义所有可选Buff的 id/name/description/type/value/weight/iconColor 字段。
│   ├── scenes/
│   │   └── GameScene.scene          # [NEW] 游戏主场景。包含地图背景、路径、塔位节点、敌人出生点/终点、UI Canvas层级。
│   ├── prefabs/
│   │   ├── TowerArrow.prefab        # [NEW] 箭塔预制体（蓝色方块+Sprite渲染+CircleCollider范围检测）
│   │   ├── TowerCannon.prefab       # [NEW] 炮塔预制体（红色方块+Sprite渲染+CircleCollider范围检测）
│   │   ├── TowerIce.prefab          # [NEW] 冰塔预制体（青色方块+Sprite渲染+CircleCollider范围检测）
│   │   ├── EnemyNormal.prefab       # [NEW] 普通敌人预制体（黄色圆形+Sprite渲染+路径移动脚本）
│   │   ├── EnemyElite.prefab        # [NEW] 精英敌人预制体（紫色稍大圆形+Sprite渲染）
│   │   ├── EnemyBoss.prefab         # [NEW] Boss敌人预制体（橙色最大圆形+Sprite渲染）
│   │   └── Bullet.prefab            # [NEW] 子弹预制体（白色小圆点+Sprite渲染+飞行脚本）
│   └── resources/
│       └── (占位资源，运行时通过代码生成几何图形Sprite)
├── settings/
│   └── (Cocos Creator 自动生成的项目设置)
├── package.json                      # [NEW] 项目元数据
└── tsconfig.json                     # [NEW] TypeScript编译配置，moduleResolution设为node，target为ES2015+
```

## 关键接口定义

```typescript
// IPlatformService.ts — 平台抽象接口
interface IPlatformService {
  login(): Promise<UserInfo>;
  getUserInfo(): UserInfo | null;
  saveData(key: string, data: string): void;
  loadData(key: string): string | null;
  share(title: string, desc: string): void;
}

// EventBus.ts — 事件类型枚举
enum GameEvent {
  ENEMY_DIED = 'enemy_died',
  ENEMY_REACHED_END = 'enemy_reached_end',
  WAVE_START = 'wave_start',
  WAVE_COMPLETE = 'wave_complete',
  ALL_WAVES_COMPLETE = 'all_waves_complete',
  GOLD_CHANGED = 'gold_changed',
  HP_CHANGED = 'hp_changed',
  GAME_OVER = 'game_over',
  BUFF_SELECTED = 'buff_selected',
}

// SaveSystem.ts — 存档数据结构
interface SaveData {
  level: number;
  gold: number;
  unlockedTowers: string[];
}
```

## 设计风格

采用扁平化几何图形风格，所有游戏元素使用纯色方块和圆形表示，摒弃复杂纹理和动画骨架。整体视觉简洁明快，适合快速开发和跨平台一致展示。地图为俯视视角塔防经典布局。

## 页面设计（单场景游戏）

### 1. 地图区域（中央主区域）

- 深绿色(#2D5A27)背景代表草地，浅棕色(#8B7355)宽条带代表敌人移动路径
- 路径从左边缘起点蜿蜒至右边缘终点，呈S形或折线形
- 路径两侧分布半透明虚线框标记的可建造塔位（共约10-12个），点击塔位高亮为亮绿色边框
- 敌人（黄色/紫色/橙色圆形）沿路径从左到右平滑移动
- 已建塔（蓝/红/青色方块）显示在塔位上，塔周围显示淡色圆形范围指示器

### 2. 顶部 HUD 栏

- 深色半透明背景条(#1A1A2E, 透明度70%)横跨顶部
- 左侧：白色文字"Wave 3/10"，字体18px加粗
- 中间：金色(#FFD700)圆形图标 + 白色金币数字，如"🪙 250"
- 右侧：红色心形图标 + 白色生命数字，如"❤️ 20"

### 3. 底部塔选择栏

- 深色半透明背景条横跨底部，高度约80px
- 水平排列3个塔选择按钮：箭塔(蓝色方块图标+文字+费用)、炮塔(红色方块图标+文字+费用)、冰塔(青色方块图标+文字+费用)
- 每个按钮圆角12px，宽120px，选中时边框高亮为白色发光
- 金币不足时按钮变灰半透明，不可点击

### 4. Build三选一弹窗

- 波次结束时，全屏半透明黑色遮罩(透明度60%)覆盖游戏画面
- 居中白色圆角面板(440x320px)，标题"选择强化"白色加粗
- 3张Buff卡片横向排列，每张180x240px，圆角16px带微阴影
- 卡片内容：顶部彩色圆形图标、Buff名称(16px白色)、效果描述(12px浅灰)、点击选中
- 选中动效：卡片微微放大(scale 1.05) + 边框亮色发光

### 5. 游戏结束面板

- 与Build弹窗类似布局，居中面板
- 显示"Victory!"或"Defeat!"标题（胜利金色/失败红色）
- 下方显示本局统计：击杀数、到达波次、剩余金币
- 底部"再来一局"按钮（亮色圆角按钮，hover发光）

## 色彩系统

- 地图草地：#2D5A27，路径：#8B7355
- 箭塔：#4A90D9(蓝)，炮塔：#D94A4A(红)，冰塔：#4AD9D9(青)
- 普通敌人：#E8D44D(黄圆)，精英：#9B59B6(紫圆)，Boss：#E87830(橙大圆)
- 子弹：#FFFFFF(白点)，弹射子弹：#4AD9D9(青点)
- UI面板背景：#1A1A2E(深蓝黑)，卡片：#2D2D44
- 文字主色：#FFFFFF，副文字：#B0B0C0
- 金币色：#FFD700，生命色：#E74C3C