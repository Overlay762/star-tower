// 塔配置接口
export interface TowerConfig {
  id: string;
  name: string;
  description: string;
  attack: number;
  range: number;
  attackSpeed: number;
  cost: number;
  upgradeCost: number;
  upgradeAttackBonus: number;
  color: string;
  bulletSpeed: number;
  bulletColor: string;
  splashRadius?: number;
  slowPercent?: number;
  slowDuration?: number;
}

// 敌人配置接口
export interface EnemyConfig {
  id: string;
  name: string;
  type: 'normal' | 'elite' | 'boss';
  hp: number;
  speed: number;
  gold: number;
  color: string;
  scale: number;
  damage: number;
}

// 波次配置接口
export interface WaveConfig {
  initialGold: number;
  initialHp: number;
  waves: WaveData[];
}

export interface WaveData {
  wave: number;
  enemyType: string;
  count: number;
  spawnInterval: number;
  restTime: number;
}

// Buff 配置接口
export interface BuffConfig {
  id: string;
  name: string;
  description: string;
  type: string;
  value: number;
  weight: number;
  iconColor: string;
  maxStack: number;
  isStackable: boolean;
}

// 配置管理器（单例）
export class ConfigManager {
  private static instance: ConfigManager;

  private towerConfigs: Map<string, TowerConfig> = new Map();
  private enemyConfigs: Map<string, EnemyConfig> = new Map();
  private waveConfig: WaveConfig | null = null;
  private buffConfigs: BuffConfig[] = [];

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  // 加载塔配置
  loadTowerConfig(data: { towers: TowerConfig[] }): void {
    this.towerConfigs.clear();
    data.towers.forEach(t => this.towerConfigs.set(t.id, t));
    console.log(`[ConfigManager] 加载 ${this.towerConfigs.size} 个塔配置`);
  }

  // 加载敌人配置
  loadEnemyConfig(data: { enemies: EnemyConfig[] }): void {
    this.enemyConfigs.clear();
    data.enemies.forEach(e => this.enemyConfigs.set(e.id, e));
    console.log(`[ConfigManager] 加载 ${this.enemyConfigs.size} 个敌人配置`);
  }

  // 加载波次配置
  loadWaveConfig(data: WaveConfig): void {
    this.waveConfig = data;
    console.log(`[ConfigManager] 加载 ${data.waves.length} 波配置`);
  }

  // 加载 Buff 配置
  loadBuffConfig(data: { buffs: BuffConfig[] }): void {
    this.buffConfigs = data.buffs;
    console.log(`[ConfigManager] 加载 ${this.buffConfigs.length} 个Buff配置`);
  }

  // 获取塔配置
  getTowerConfig(id: string): TowerConfig | undefined {
    return this.towerConfigs.get(id);
  }

  // 获取所有塔配置
  getAllTowerConfigs(): TowerConfig[] {
    return Array.from(this.towerConfigs.values());
  }

  // 获取敌人配置
  getEnemyConfig(id: string): EnemyConfig | undefined {
    return this.enemyConfigs.get(id);
  }

  // 获取波次配置
  getWaveConfig(waveIndex: number): WaveData | undefined {
    if (!this.waveConfig) return undefined;
    return this.waveConfig.waves.find(w => w.wave === waveIndex);
  }

  // 获取波次总数
  getTotalWaves(): number {
    return this.waveConfig ? this.waveConfig.waves.length : 0;
  }

  // 获取初始金币
  getInitialGold(): number {
    return this.waveConfig ? this.waveConfig.initialGold : 200;
  }

  // 获取初始生命值
  getInitialHp(): number {
    return this.waveConfig ? this.waveConfig.initialHp : 20;
  }

  // 获取 Buff 配置列表
  getBuffConfigs(): BuffConfig[] {
    return this.buffConfigs;
  }

  // 获取指定类型的 Buff 配置
  getBuffConfigsByType(type: string): BuffConfig[] {
    return this.buffConfigs.filter(b => b.type === type);
  }
}
