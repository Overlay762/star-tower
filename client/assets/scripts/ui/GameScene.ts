import { _decorator, Component, Node, Vec3, Color, Graphics, Label, UITransform, director } from 'cc';
import { EventBus, GameEvent } from '../core/EventBus';
import { GameManager } from '../core/GameManager';
import { ConfigManager } from '../core/ConfigManager';
import { TowerManager } from '../combat/TowerManager';
import { EnemyManager } from '../combat/EnemyManager';
import { WaveSystem } from '../wave/WaveSystem';
import { HUD } from './HUD';
import { TowerSelector } from './TowerSelector';
import { BuildPanel } from './BuildPanel';
import { GameOverPanel } from './GameOverPanel';
import { EconomySystem } from '../economy/EconomySystem';
import { BuildSystem } from '../build/BuildSystem';
import { PlatformManager } from '../platform/PlatformManager';
import { HttpClient } from '../network/HttpClient';
import { SaveSystem } from '../save/SaveSystem';

const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {
  @property(Node)
  mapNode: Node | null = null;

  @property(Node)
  uiNode: Node | null = null;

  private pathPoints: Vec3[] = [];
  private towerSlots: Vec3[] = [];
  private selectedSlotIndex: number = -1;
  private selectedTowerId: string = '';
  private isSelectingTower: boolean = false;

  async onLoad(): Promise<void> {
    console.log('[GameScene] 初始化游戏场景...');

    // 创建场景结构
    this.createSceneNodes();

    // 加载配置
    await this.loadConfigs();

    // 初始化平台
    await this.initPlatform();

    // 创建地图
    this.createMap();

    // 初始化系统
    this.initSystems();

    // 创建 UI
    this.createUI();

    // 开始游戏
    this.startGame();

    console.log('[GameScene] 游戏场景初始化完成');
  }

  // 创建场景节点
  private createSceneNodes(): void {
    // 地图层
    this.mapNode = new Node('MapLayer');
    this.mapNode.setParent(this.node);
    this.mapNode.setPosition(0, 0);
    this.mapNode.layer = 1 << 25; // UI_2D

    // UI 层
    this.uiNode = new Node('UILayer');
    this.uiNode.setParent(this.node);
    this.uiNode.setPosition(0, 0);
    this.uiNode.layer = 1 << 25;
  }

  // 加载配置文件
  private async loadConfigs(): Promise<void> {
    const cm = ConfigManager.getInstance();

    // 塔配置
    const towerData = {
      towers: [
        { id: 'tower_arrow', name: '箭塔', description: '基础攻击塔', attack: 15, range: 180, attackSpeed: 0.6, cost: 50, upgradeCost: 80, upgradeAttackBonus: 10, color: '#4A90D9', bulletSpeed: 400, bulletColor: '#FFFFFF' },
        { id: 'tower_cannon', name: '炮塔', description: '高伤害范围攻击', attack: 35, range: 140, attackSpeed: 1.5, cost: 80, upgradeCost: 120, upgradeAttackBonus: 20, color: '#D94A4A', bulletSpeed: 300, bulletColor: '#FF6B6B', splashRadius: 60 },
        { id: 'tower_ice', name: '冰塔', description: '减速敌人', attack: 8, range: 160, attackSpeed: 0.8, cost: 60, upgradeCost: 90, upgradeAttackBonus: 5, color: '#4AD9D9', bulletSpeed: 350, bulletColor: '#A0F0F0', slowPercent: 0.4, slowDuration: 2.0 },
      ]
    };
    cm.loadTowerConfig(towerData);

    // 敌人配置
    const enemyData = {
      enemies: [
        { id: 'enemy_normal', name: '史莱姆', type: 'normal', hp: 80, speed: 100, gold: 10, color: '#E8D44D', scale: 1.0, damage: 1 },
        { id: 'enemy_elite', name: '精英怪', type: 'elite', hp: 250, speed: 70, gold: 30, color: '#9B59B6', scale: 1.4, damage: 2 },
        { id: 'enemy_boss', name: 'BOSS', type: 'boss', hp: 800, speed: 40, gold: 100, color: '#E87830', scale: 2.0, damage: 5 },
      ]
    };
    cm.loadEnemyConfig(enemyData);

    // 波次配置
    const waveData = {
      initialGold: 200,
      initialHp: 20,
      waves: [
        { wave: 1, enemyType: 'enemy_normal', count: 8, spawnInterval: 0.8, restTime: 5 },
        { wave: 2, enemyType: 'enemy_normal', count: 12, spawnInterval: 0.7, restTime: 5 },
        { wave: 3, enemyType: 'enemy_normal', count: 10, spawnInterval: 0.7, restTime: 8 },
        { wave: 4, enemyType: 'enemy_elite', count: 6, spawnInterval: 1.2, restTime: 8 },
        { wave: 5, enemyType: 'enemy_normal', count: 15, spawnInterval: 0.5, restTime: 5 },
        { wave: 6, enemyType: 'enemy_elite', count: 5, spawnInterval: 1.0, restTime: 8 },
        { wave: 7, enemyType: 'enemy_normal', count: 20, spawnInterval: 0.4, restTime: 10 },
        { wave: 8, enemyType: 'enemy_elite', count: 8, spawnInterval: 0.9, restTime: 10 },
        { wave: 9, enemyType: 'enemy_normal', count: 15, spawnInterval: 0.5, restTime: 8 },
        { wave: 10, enemyType: 'enemy_boss', count: 1, spawnInterval: 0, restTime: 0 },
      ]
    };
    cm.loadWaveConfig(waveData);

    // Buff 配置
    const buffData = {
      buffs: [
        { id: 'buff_atk_up', name: '攻击提升', description: '所有塔攻击力 +20%', type: 'atk_boost', value: 0.2, weight: 10, iconColor: '#FF6B6B', maxStack: 5, isStackable: true },
        { id: 'buff_atk_speed', name: '急速射击', description: '所有塔攻击速度 +25%', type: 'speed_boost', value: 0.25, weight: 10, iconColor: '#FFD700', maxStack: 4, isStackable: true },
        { id: 'buff_range_up', name: '射程扩展', description: '所有塔射程 +15%', type: 'range_boost', value: 0.15, weight: 8, iconColor: '#4A90D9', maxStack: 3, isStackable: true },
        { id: 'buff_freeze', name: '冰冻强化', description: '攻击附带冰冻减速50%', type: 'freeze', value: 0.5, weight: 7, iconColor: '#4AD9D9', maxStack: 1, isStackable: false },
        { id: 'buff_ricochet', name: '弹射强化', description: '子弹可弹射+1个目标', type: 'ricochet', value: 1, weight: 7, iconColor: '#B0B0C0', maxStack: 3, isStackable: true },
        { id: 'buff_crit', name: '致命一击', description: '15%概率双倍伤害', type: 'crit', value: 0.15, weight: 8, iconColor: '#E87830', maxStack: 1, isStackable: false },
        { id: 'buff_gold_boost', name: '淘金热', description: '击杀金币+30%', type: 'gold_boost', value: 0.3, weight: 8, iconColor: '#FFD700', maxStack: 3, isStackable: true },
        { id: 'buff_hp_regen', name: '生命恢复', description: '立即恢复3点生命', type: 'hp_regen', value: 3, weight: 6, iconColor: '#E74C3C', maxStack: 99, isStackable: true },
        { id: 'buff_splash', name: '溅射强化', description: '攻击造成30%溅射', type: 'splash', value: 0.3, weight: 6, iconColor: '#D94A4A', maxStack: 1, isStackable: false },
        { id: 'buff_instant_gold', name: '意外之财', description: '立即获得80金币', type: 'instant_gold', value: 80, weight: 7, iconColor: '#FFD700', maxStack: 99, isStackable: true },
      ]
    };
    cm.loadBuffConfig(buffData);

    console.log('[GameScene] 配置加载完成');
  }

  // 初始化平台
  private async initPlatform(): Promise<void> {
    const platform = PlatformManager.getInstance().getPlatform();
    try {
      const userInfo = await platform.login();
      console.log(`[GameScene] 平台登录成功: ${userInfo.username}`);

      // 恢复 Token
      HttpClient.getInstance().loadToken();
    } catch (error) {
      console.error('[GameScene] 平台登录失败:', error);
    }
  }

  // 创建地图
  private createMap(): void {
    if (!this.mapNode) return;

    // 草地背景
    const grass = new Node('Grass');
    grass.setParent(this.mapNode);
    const grassGraphics = grass.addComponent(Graphics);
    grassGraphics.fillColor = new Color(45, 90, 39);
    grassGraphics.rect(-600, -400, 1200, 800);
    grassGraphics.fill();

    // 敌人路径
    this.createPath();

    // 塔位
    this.createTowerSlots();
  }

  // 创建路径
  private createPath(): void {
    if (!this.mapNode) return;

    const pathNode = new Node('Path');
    pathNode.setParent(this.mapNode);

    const pathGraphics = pathNode.addComponent(Graphics);
    pathGraphics.fillColor = new Color(139, 115, 85);

    // S形路径
    const segments = [
      { x: -550, y: -300, w: 200, h: 80 },
      { x: -200, y: -300, w: 80, h: 80 },
      { x: -200, y: -100, w: 400, h: 80 },
      { x: 200, y: -100, w: 80, h: 80 },
      { x: 200, y: 100, w: 400, h: 80 },
      { x: 420, y: 100, w: 80, h: 80 },
      { x: 420, y: 300, w: 270, h: 80 },
    ];

    segments.forEach(seg => {
      pathGraphics.rect(seg.x, seg.y, seg.w, seg.h);
      pathGraphics.fill();
    });

    // 路径点（敌人移动路线）
    this.pathPoints = [
      new Vec3(-550, -340, 0),
      new Vec3(-200, -340, 0),
      new Vec3(-200, -140, 0),
      new Vec3(200, -140, 0),
      new Vec3(200, 60, 0),
      new Vec3(420, 60, 0),
      new Vec3(420, 260, 0),
    ];

    // 起点标记
    const startNode = new Node('Start');
    startNode.setParent(pathNode);
    startNode.setPosition(-550, -340);
    const startGraphics = startNode.addComponent(Graphics);
    startGraphics.fillColor = new Color(76, 175, 80);
    startGraphics.circle(0, 0, 15);
    startGraphics.fill();

    // 终点标记
    const endNode = new Node('End');
    endNode.setParent(pathNode);
    endNode.setPosition(420, 260);
    const endGraphics = endNode.addComponent(Graphics);
    endGraphics.fillColor = new Color(244, 67, 54);
    endGraphics.circle(0, 0, 20);
    endGraphics.fill();

    console.log(`[GameScene] 路径创建完成, ${this.pathPoints.length} 个路径点`);
  }

  // 创建塔位
  private createTowerSlots(): void {
    if (!this.mapNode) return;

    const slotPositions = [
      new Vec3(-450, -200, 0), new Vec3(-350, -200, 0),
      new Vec3(-150, -200, 0), new Vec3(-50, -200, 0),
      new Vec3(-50, -20, 0),   new Vec3(50, -20, 0),
      new Vec3(150, -20, 0),   new Vec3(250, -20, 0),
      new Vec3(250, 150, 0),   new Vec3(350, 150, 0),
    ];

    this.towerSlots = slotPositions;

    // 绘制塔位标记
    const slotsNode = new Node('TowerSlots');
    slotsNode.setParent(this.mapNode);

    slotPositions.forEach((pos, index) => {
      const slot = new Node(`Slot_${index}`);
      slot.setParent(slotsNode);
      slot.setPosition(pos);

      const slotGraphics = slot.addComponent(Graphics);
      slotGraphics.strokeColor = new Color(255, 255, 255, 80);
      slotGraphics.lineWidth = 2;
      slotGraphics.rect(-20, -20, 40, 40);
      slotGraphics.stroke();

      // 虚线填充
      slotGraphics.fillColor = new Color(255, 255, 255, 30);
      slotGraphics.rect(-20, -20, 40, 40);
      slotGraphics.fill();
    });

    // 初始化塔管理器
    TowerManager.getInstance().addTowerSlot(new Vec3()); // 占位
    this.towerSlots.forEach(pos => {
      TowerManager.getInstance().addTowerSlot(pos);
    });

    console.log(`[GameScene] 创建 ${slotPositions.length} 个塔位`);
  }

  // 初始化系统
  private initSystems(): void {
    // 初始化塔管理器
    const towerManager = TowerManager.getInstance();
    const bulletPrefab = null as any; // 使用动态创建
    const towerPrefabs = new Map();
    towerManager.init(towerPrefabs, bulletPrefab, this.mapNode!);

    // 初始化敌人管理器
    const enemyManager = EnemyManager.getInstance();
    const enemyPrefabs = new Map();
    enemyManager.init(enemyPrefabs, this.mapNode!);

    // 初始化波次系统
    const waveSystem = WaveSystem.getInstance();
    waveSystem.init(this.pathPoints);

    // 初始化游戏管理器
    const gm = GameManager.getInstance();
    const cm = ConfigManager.getInstance();
    gm.init(cm.getTotalWaves(), cm.getInitialGold(), cm.getInitialHp());

    console.log('[GameScene] 系统初始化完成');
  }

  // 创建 UI
  private createUI(): void {
    if (!this.uiNode) return;

    // HUD
    const hudNode = new Node('HUD');
    hudNode.setParent(this.uiNode);
    hudNode.setPosition(0, 370);
    hudNode.addComponent(HUD);

    // 塔选择栏
    const selectorNode = new Node('TowerSelector');
    selectorNode.setParent(this.uiNode);
    selectorNode.setPosition(0, -370);
    selectorNode.addComponent(TowerSelector);

    // Build 面板
    const buildPanelNode = new Node('BuildPanel');
    buildPanelNode.setParent(this.uiNode);
    buildPanelNode.addComponent(BuildPanel);

    // 游戏结束面板
    const gameOverNode = new Node('GameOverPanel');
    gameOverNode.setParent(this.uiNode);
    gameOverNode.addComponent(GameOverPanel);

    // 监听塔选择事件
    const bus = EventBus.getInstance();
    bus.on(GameEvent.TOWER_SELECTED, this.onTowerSelected, this);
  }

  // 点击塔位
  private onTowerSlotClick(slotIndex: number): void {
    if (this.selectedTowerId) {
      // 尝试建塔
      const economy = EconomySystem.getInstance();
      if (economy.buildTower(slotIndex, this.selectedTowerId, this.mapNode!)) {
        this.selectedSlotIndex = -1;
        this.selectedTowerId = '';
      }
    }
  }

  // 塔被选中
  private onTowerSelected(towerId: string): void {
    this.selectedTowerId = towerId;
    this.isSelectingTower = true;
    console.log(`[GameScene] 选择了塔: ${towerId}, 请点击塔位放置`);
  }

  // 开始游戏
  private startGame(): void {
    const gm = GameManager.getInstance();
    gm.startGame();

    const waveSystem = WaveSystem.getInstance();
    waveSystem.startGame();

    console.log('[GameScene] 游戏开始!');
  }

  update(dt: number): void {
    const gm = GameManager.getInstance();

    if (gm.getGameOver()) return;
    if (!gm.getPlaying()) return;

    // 更新波次系统
    WaveSystem.getInstance().update(dt);

    // 更新敌人管理器
    EnemyManager.getInstance().update(dt);
  }
}
