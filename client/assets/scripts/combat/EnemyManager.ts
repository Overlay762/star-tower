import { Node, Vec3, Prefab, instantiate } from 'cc';
import { Enemy } from './Enemy';
import { EnemyConfig, ConfigManager } from '../core/ConfigManager';
import { EventBus, GameEvent } from '../core/EventBus';

// 敌人生成信息
export interface SpawnInfo {
  enemyType: string;
  pathPoints: Vec3[];
  onSpawnComplete?: () => void;
}

// 敌人管理器（单例）
export class EnemyManager {
  private static instance: EnemyManager;

  private enemies: Enemy[] = [];
  private enemyPrefabs: Map<string, Prefab> = new Map();
  private parentNode: Node | null = null;
  private spawnQueue: SpawnInfo[] = [];
  private isSpawning: boolean = false;
  private spawnTimer: number = 0;
  private spawnInterval: number = 0;
  private spawnCount: number = 0;
  private spawnedCount: number = 0;

  static getInstance(): EnemyManager {
    if (!EnemyManager.instance) {
      EnemyManager.instance = new EnemyManager();
    }
    return EnemyManager.instance;
  }

  // 初始化
  init(enemyPrefabs: Map<string, Prefab>, parentNode: Node): void {
    this.enemyPrefabs = enemyPrefabs;
    this.parentNode = parentNode;
  }

  // 开始波次生成
  startWave(enemyType: string, count: number, interval: number, pathPoints: Vec3[]): void {
    this.spawnCount = count;
    this.spawnedCount = 0;
    this.spawnInterval = interval;
    this.spawnTimer = 0;
    this.isSpawning = true;

    // 预填充生成队列
    for (let i = 0; i < count; i++) {
      this.spawnQueue.push({
        enemyType: enemyType,
        pathPoints: pathPoints,
        onSpawnComplete: () => {
          this.spawnedCount++;
        },
      });
    }

    // 立即生成第一个敌人
    this.spawnNext();
  }

  update(dt: number): void {
    if (!this.isSpawning) return;

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval && this.spawnQueue.length > 0) {
      this.spawnTimer = 0;
      this.spawnNext();
    }

    // 检查波次是否完成
    if (this.spawnQueue.length === 0 && this.spawnedCount >= this.spawnCount) {
      this.isSpawning = false;
    }
  }

  // 生成下一个敌人
  private spawnNext(): void {
    if (this.spawnQueue.length === 0 || !this.parentNode) return;

    const info = this.spawnQueue.shift()!;
    this.spawnEnemy(info);
  }

  // 生成单个敌人
  private spawnEnemy(info: SpawnInfo): void {
    const config = ConfigManager.getInstance().getEnemyConfig(info.enemyType);
    if (!config || !this.parentNode) return;

    let enemyNode: Node;

    const prefab = this.enemyPrefabs.get(info.enemyType);
    if (prefab) {
      enemyNode = instantiate(prefab);
    } else {
      // 动态创建
      enemyNode = new Node('Enemy_' + info.enemyType);
    }

    enemyNode.setParent(this.parentNode);

    const enemy = enemyNode.getComponent(Enemy) || enemyNode.addComponent(Enemy);
    enemy.init(config, info.pathPoints);

    this.enemies.push(enemy);

    EventBus.getInstance().emit(GameEvent.ENEMY_SPAWNED, enemy);

    if (info.onSpawnComplete) {
      info.onSpawnComplete();
    }
  }

  // 获取所有活跃敌人
  getActiveEnemies(): Enemy[] {
    return this.enemies.filter(e => e && e.node && e.node.isValid && !e.getIsDead());
  }

  // 获取活跃敌人数量
  getActiveEnemyCount(): number {
    return this.getActiveEnemies().length;
  }

  // 获取所有敌人
  getAllEnemies(): Enemy[] {
    return this.enemies.filter(e => e && e.node && e.node.isValid);
  }

  // 是否还有待生成的敌人
  hasPendingSpawns(): boolean {
    return this.spawnQueue.length > 0 || this.spawnedCount < this.spawnCount;
  }

  // 波次是否完全结束（所有敌人都已生成且死亡/到达终点）
  isWaveFullyComplete(): boolean {
    return !this.hasPendingSpawns() && this.getActiveEnemies().length === 0;
  }

  // 查找范围内最近的敌人
  findNearestEnemy(position: Vec3, range: number): Enemy | null {
    let nearest: Enemy | null = null;
    let nearestDist = range;

    this.getActiveEnemies().forEach(enemy => {
      const dist = Vec3.distance(position, enemy.getPosition());
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    });

    return nearest;
  }

  // 获取多个范围内的敌人（用于溅射/弹射）
  findEnemiesInRange(position: Vec3, range: number, maxCount: number = 99): Enemy[] {
    return this.getActiveEnemies()
      .filter(e => Vec3.distance(position, e.getPosition()) <= range)
      .sort((a, b) => {
        const distA = Vec3.distance(position, a.getPosition());
        const distB = Vec3.distance(position, b.getPosition());
        return distA - distB;
      })
      .slice(0, maxCount);
  }

  // 清理
  clear(): void {
    this.enemies = [];
    this.spawnQueue = [];
    this.isSpawning = false;
    this.spawnedCount = 0;
    this.spawnCount = 0;
  }
}
