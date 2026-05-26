// 游戏事件枚举
export enum GameEvent {
  // 敌人事件
  ENEMY_DIED = 'enemy_died',
  ENEMY_REACHED_END = 'enemy_reached_end',
  ENEMY_SPAWNED = 'enemy_spawned',

  // 波次事件
  WAVE_START = 'wave_start',
  WAVE_COMPLETE = 'wave_complete',
  ALL_WAVES_COMPLETE = 'all_waves_complete',

  // 经济事件
  GOLD_CHANGED = 'gold_changed',
  HP_CHANGED = 'hp_changed',

  // 游戏状态事件
  GAME_START = 'game_start',
  GAME_OVER = 'game_over',
  GAME_WIN = 'game_win',

  // Build / Buff 事件
  BUFF_SELECTED = 'buff_selected',
  BUILD_PANEL_SHOW = 'build_panel_show',
  BUILD_PANEL_HIDE = 'build_panel_hide',

  // 塔事件
  TOWER_BUILT = 'tower_built',
  TOWER_UPGRADED = 'tower_upgraded',
  TOWER_SOLD = 'tower_sold',
  TOWER_SELECTED = 'tower_selected',
  TOWER_DESELECTED = 'tower_deselected',

  // 平台事件
  LOGIN_SUCCESS = 'login_success',
  LOGOUT = 'logout',
}

// 事件回调类型
type EventCallback = (...args: any[]) => void;

// 全局事件总线（单例）
export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, EventCallback[]> = new Map();

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  // 注册事件监听
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // 取消事件监听
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 触发事件
  emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(...args));
    }
  }

  // 清除所有事件监听
  clear(): void {
    this.listeners.clear();
  }
}
