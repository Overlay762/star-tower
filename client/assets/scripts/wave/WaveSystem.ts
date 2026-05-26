import { Vec3 } from 'cc';
import { EventBus, GameEvent } from '../core/EventBus';
import { GameManager, GameState } from '../core/GameManager';
import { ConfigManager } from '../core/ConfigManager';
import { EnemyManager } from '../combat/EnemyManager';

// 波次系统（单例）
export class WaveSystem {
  private static instance: WaveSystem;

  private totalWaves: number = 0;
  private currentWaveIndex: number = 0;
  private isBetweenWaves: boolean = false;
  private restTimer: number = 0;
  private waveStarted: boolean = false;
  private checkTimer: number = 0;
  private pathPoints: Vec3[] = [];

  static getInstance(): WaveSystem {
    if (!WaveSystem.instance) {
      WaveSystem.instance = new WaveSystem();
    }
    return WaveSystem.instance;
  }

  // 初始化
  init(pathPoints: Vec3[]): void {
    this.pathPoints = pathPoints;
    this.totalWaves = ConfigManager.getInstance().getTotalWaves();
    this.currentWaveIndex = 0;
    this.isBetweenWaves = false;
    this.restTimer = 0;
    this.waveStarted = false;
    this.checkTimer = 0;

    console.log(`[WaveSystem] 初始化, 共 ${this.totalWaves} 波`);
  }

  // 开始游戏
  startGame(): void {
    this.currentWaveIndex = 0;
    this.startNextWave();
  }

  // 开始下一波
  private startNextWave(): void {
    this.currentWaveIndex++;
    if (this.currentWaveIndex > this.totalWaves) {
      // 所有波次完成
      GameManager.getInstance().completeWave(this.currentWaveIndex - 1);
      return;
    }

    const gm = GameManager.getInstance();
    const waveConfig = ConfigManager.getInstance().getWaveConfig(this.currentWaveIndex);

    if (!waveConfig) {
      console.warn(`[WaveSystem] 未找到波次 ${this.currentWaveIndex} 配置`);
      return;
    }

    console.log(`[WaveSystem] 开始波次 ${this.currentWaveIndex} / ${this.totalWaves}`);

    gm.startWave(this.currentWaveIndex);
    this.waveStarted = true;

    // 生成敌人
    const enemyManager = EnemyManager.getInstance();
    enemyManager.startWave(
      waveConfig.enemyType,
      waveConfig.count,
      waveConfig.spawnInterval,
      this.pathPoints
    );
  }

  update(dt: number): void {
    const gm = GameManager.getInstance();
    if (gm.getState() === GameState.GAME_OVER || gm.getState() === GameState.WAITING) {
      return;
    }

    if (this.isBetweenWaves) {
      this.restTimer -= dt;
      if (this.restTimer <= 0) {
        this.isBetweenWaves = false;
        this.startNextWave();
      }
      return;
    }

    // 检查波次是否结束
    this.checkTimer += dt;
    if (this.checkTimer >= 0.5) {
      this.checkTimer = 0;
      this.checkWaveComplete();
    }
  }

  // 检查波次是否完成
  private checkWaveComplete(): void {
    const enemyManager = EnemyManager.getInstance();

    if (this.waveStarted && enemyManager.isWaveFullyComplete()) {
      this.waveStarted = false;
      const gm = GameManager.getInstance();

      console.log(`[WaveSystem] 波次 ${this.currentWaveIndex} 完成`);

      if (this.currentWaveIndex >= this.totalWaves) {
        gm.completeWave(this.currentWaveIndex);
        return;
      }

      // 触发 Build 选择面板
      gm.completeWave(this.currentWaveIndex);

      if (gm.getState() !== GameState.GAME_OVER) {
        // 等待 restTime
        const waveConfig = ConfigManager.getInstance().getWaveConfig(this.currentWaveIndex);
        this.restTimer = waveConfig?.restTime || 5;
        this.isBetweenWaves = true;

        // 触发 Build 面板显示
        EventBus.getInstance().emit(GameEvent.BUILD_PANEL_SHOW);
      }
    }
  }

  // 跳过休息
  skipRest(): void {
    if (this.isBetweenWaves) {
      this.restTimer = 0;
    }
  }

  // 获取当前波次
  getCurrentWave(): number {
    return this.currentWaveIndex;
  }

  // 获取总波次
  getTotalWaves(): number {
    return this.totalWaves;
  }

  // 获取休息剩余时间
  getRestTime(): number {
    return this.restTimer;
  }

  // 是否在波间休息
  getIsResting(): boolean {
    return this.isBetweenWaves;
  }

  // 清理
  clear(): void {
    this.totalWaves = 0;
    this.currentWaveIndex = 0;
    this.isBetweenWaves = false;
    this.restTimer = 0;
    this.waveStarted = false;
    this.checkTimer = 0;
  }
}
