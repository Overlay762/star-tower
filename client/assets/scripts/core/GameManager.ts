import { EventBus, GameEvent } from './EventBus';

// 游戏状态枚举
export enum GameState {
  WAITING = 'waiting',
  PLAYING = 'playing',
  PAUSED = 'paused',
  WAVE_COMPLETE = 'wave_complete',
  GAME_OVER = 'game_over',
}

// 全局 Buff 效果
export interface ActiveBuff {
  id: string;
  name: string;
  type: string;
  value: number;
  stacks: number;
}

// 游戏全局状态管理器（单例）
export class GameManager {
  private static instance: GameManager;

  private state: GameState = GameState.WAITING;
  private currentWave: number = 0;
  private totalWaves: number = 10;
  private gold: number = 200;
  private hp: number = 20;
  private maxHp: number = 20;
  private killCount: number = 0;
  private waveEnemiesAlive: number = 0;
  private activeBuffs: Map<string, ActiveBuff> = new Map();
  private isPaused: boolean = false;

  // 局内统计
  private totalKills: number = 0;
  private totalGoldEarned: number = 0;
  private wavesReached: number = 0;

  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  // 初始化游戏
  init(totalWaves: number, initialGold: number, initialHp: number): void {
    this.state = GameState.WAITING;
    this.currentWave = 0;
    this.totalWaves = totalWaves;
    this.gold = initialGold;
    this.hp = initialHp;
    this.maxHp = initialHp;
    this.killCount = 0;
    this.waveEnemiesAlive = 0;
    this.activeBuffs.clear();
    this.isPaused = false;
    this.totalKills = 0;
    this.totalGoldEarned = 0;
    this.wavesReached = 0;
  }

  // 开始游戏
  startGame(): void {
    this.state = GameState.PLAYING;
    EventBus.getInstance().emit(GameEvent.GAME_START);
  }

  // 开始波次
  startWave(waveIndex: number): void {
    this.currentWave = waveIndex;
    this.wavesReached = waveIndex;
    this.state = GameState.PLAYING;
    EventBus.getInstance().emit(GameEvent.WAVE_START, waveIndex);
  }

  // 波次完成
  completeWave(waveIndex: number): void {
    this.state = GameState.WAVE_COMPLETE;
    EventBus.getInstance().emit(GameEvent.WAVE_COMPLETE, waveIndex);

    if (waveIndex >= this.totalWaves) {
      this.state = GameState.GAME_OVER;
      EventBus.getInstance().emit(GameEvent.ALL_WAVES_COMPLETE);
      EventBus.getInstance().emit(GameEvent.GAME_WIN);
    }
  }

  // 增加金币
  addGold(amount: number): void {
    this.gold += amount;
    this.totalGoldEarned += amount;
    EventBus.getInstance().emit(GameEvent.GOLD_CHANGED, this.gold);
  }

  // 扣除金币
  spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      EventBus.getInstance().emit(GameEvent.GOLD_CHANGED, this.gold);
      return true;
    }
    return false;
  }

  // 检查是否能支付
  canAfford(amount: number): boolean {
    return this.gold >= amount;
  }

  // 扣血
  loseHp(damage: number): void {
    this.hp -= damage;
    EventBus.getInstance().emit(GameEvent.HP_CHANGED, this.hp);
    if (this.hp <= 0) {
      this.hp = 0;
      this.state = GameState.GAME_OVER;
      EventBus.getInstance().emit(GameEvent.GAME_OVER, false);
    }
  }

  // 加血
  healHp(amount: number): void {
    this.hp = Math.min(this.hp + amount, this.maxHp);
    EventBus.getInstance().emit(GameEvent.HP_CHANGED, this.hp);
  }

  // 敌人死亡
  onEnemyDied(): void {
    this.killCount++;
    this.totalKills++;
    this.waveEnemiesAlive--;
    EventBus.getInstance().emit(GameEvent.ENEMY_DIED, this.killCount);
  }

  // 敌人到达终点
  onEnemyReachedEnd(damage: number): void {
    this.waveEnemiesAlive--;
    this.loseHp(damage);
    EventBus.getInstance().emit(GameEvent.ENEMY_REACHED_END);
  }

  // 设置当前波次剩余敌人数
  setWaveEnemiesAlive(count: number): void {
    this.waveEnemiesAlive = count;
  }

  // 减少当前波次剩余敌人数
  decrementWaveEnemiesAlive(): void {
    this.waveEnemiesAlive--;
  }

  // 应用 Buff
  applyBuff(buffId: string, buffName: string, buffType: string, value: number): void {
    const existing = this.activeBuffs.get(buffId);
    if (existing) {
      existing.stacks++;
      existing.value += value;
    } else {
      this.activeBuffs.set(buffId, {
        id: buffId,
        name: buffName,
        type: buffType,
        value: value,
        stacks: 1,
      });
    }
  }

  // 获取所有活跃 Buff
  getActiveBuffs(): ActiveBuff[] {
    return Array.from(this.activeBuffs.values());
  }

  // 获取指定类型 Buff 的总加成
  getBuffBonus(type: string): number {
    let total = 0;
    this.activeBuffs.forEach(buff => {
      if (buff.type === type) {
        total += buff.value;
      }
    });
    return total;
  }

  // 获取 Buff 总堆叠数
  getBuffStacks(buffId: string): number {
    const buff = this.activeBuffs.get(buffId);
    return buff ? buff.stacks : 0;
  }

  // 暂停/恢复
  togglePause(): void {
    this.isPaused = !this.isPaused;
    this.state = this.isPaused ? GameState.PAUSED : GameState.PLAYING;
  }

  // 获取统计信息
  getStats(): { totalKills: number; totalGoldEarned: number; wavesReached: number } {
    return {
      totalKills: this.totalKills,
      totalGoldEarned: this.totalGoldEarned,
      wavesReached: this.wavesReached,
    };
  }

  // 重置
  reset(): void {
    this.activeBuffs.clear();
    EventBus.getInstance().clear();
  }

  // Getters
  getState(): GameState { return this.state; }
  getCurrentWave(): number { return this.currentWave; }
  getTotalWaves(): number { return this.totalWaves; }
  getGold(): number { return this.gold; }
  getHp(): number { return this.hp; }
  getMaxHp(): number { return this.maxHp; }
  getKillCount(): number { return this.killCount; }
  getWaveEnemiesAlive(): number { return this.waveEnemiesAlive; }
  getGameOver(): boolean { return this.state === GameState.GAME_OVER; }
  getWaveComplete(): boolean { return this.state === GameState.WAVE_COMPLETE; }
  getPlaying(): boolean { return this.state === GameState.PLAYING; }
}
