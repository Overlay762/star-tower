import { PlatformManager } from '../platform/PlatformManager';
import { HttpClient } from '../network/HttpClient';
import { ApiEndpoints } from '../network/ApiEndpoints';
import { GameManager } from '../core/GameManager';

// 存档数据结构
export interface SaveData {
  level: number;
  gold: number;
  unlockedTowers: string[];
  maxWaveReached: number;
}

// 存档系统（单例）
export class SaveSystem {
  private static instance: SaveSystem;

  private saveKey: string = 'game_save';

  static getInstance(): SaveSystem {
    if (!SaveSystem.instance) {
      SaveSystem.instance = new SaveSystem();
    }
    return SaveSystem.instance;
  }

  // 序列化存档
  serialize(): string {
    const gm = GameManager.getInstance();
    const stats = gm.getStats();
    const activeBuffs = gm.getActiveBuffs();

    const saveData: SaveData = {
      level: 1,
      gold: gm.getGold(),
      unlockedTowers: ['tower_arrow', 'tower_cannon', 'tower_ice'], // 默认全部解锁
      maxWaveReached: stats.wavesReached,
    };

    return JSON.stringify(saveData);
  }

  // 反序列化存档
  deserialize(data: string): SaveData | null {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed.gold === 'number' && Array.isArray(parsed.unlockedTowers)) {
      return parsed as SaveData;
    }
    console.error('[Save] 存档数据格式无效');
    return null;
  }

  // 本地保存
  saveLocal(): void {
    const platform = PlatformManager.getInstance().getPlatform();
    const data = this.serialize();
    platform.saveData(this.saveKey, data);
    console.log('[Save] 本地存档已保存');
  }

  // 本地加载
  loadLocal(): SaveData | null {
    const platform = PlatformManager.getInstance().getPlatform();
    const data = platform.loadData(this.saveKey);
    if (data) {
      return this.deserialize(data);
    }
    console.log('[Save] 未找到本地存档');
    return null;
  }

  // 云端同步
  async syncCloud(): Promise<boolean> {
    const client = HttpClient.getInstance();
    const saveData = this.serialize();

    const response = await client.post(ApiEndpoints.SAVE_SYNC, {
      saveData: JSON.parse(saveData),
    });

    if (response.success) {
      console.log('[Save] 云存档同步成功');
      return true;
    }

    console.error('[Save] 云存档同步失败:', response.error);
    return false;
  }

  // 云端加载
  async loadCloud(): Promise<SaveData | null> {
    const client = HttpClient.getInstance();
    const response = await client.get<{ saveData: SaveData; timestamp: string }>(ApiEndpoints.SAVE_LOAD);

    if (response.success && response.data?.saveData) {
      console.log('[Save] 云存档加载成功');
      return response.data.saveData;
    }

    console.log('[Save] 未找到云存档:', response.error);
    return null;
  }

  // 自动保存（本地 + 云端）
  async autoSave(): Promise<void> {
    this.saveLocal(); // 本地总是保存

    // 尝试云端同步
    const client = HttpClient.getInstance();
    if (client.getToken()) {
      await this.syncCloud();
    }
  }

  // 加载存档（优先云端，回退本地）
  async load(): Promise<SaveData | null> {
    // 先尝试云端
    const client = HttpClient.getInstance();
    if (client.getToken()) {
      const cloudData = await this.loadCloud();
      if (cloudData) return cloudData;
    }

    // 回退本地
    return this.loadLocal();
  }

  // 重置存档
  reset(): void {
    const platform = PlatformManager.getInstance().getPlatform();
    platform.removeData(this.saveKey);
    console.log('[Save] 存档已重置');
  }
}
