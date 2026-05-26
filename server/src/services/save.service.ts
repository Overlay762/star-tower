import * as saveModel from '../models/save.model';
import * as userModel from '../models/user.model';
import { SaveData } from '../types';

// 同步存档
export function syncSave(userId: number, saveData: SaveData): { timestamp: string } {
  saveModel.upsertSave(userId, saveData);

  // 同步更新用户的 max_wave 和 gold
  const user = userModel.findUserById(userId);
  if (user) {
    if (saveData.maxWaveReached > user.max_wave) {
      userModel.updateUserMaxWave(userId, saveData.maxWaveReached);
    }
    if (saveData.gold > user.gold) {
      userModel.updateUserGold(userId, saveData.gold);
    }
    if (saveData.level > user.level) {
      userModel.updateUserLevel(userId, saveData.level);
    }
  }

  const saved = saveModel.getSaveByUserId(userId);
  return {
    timestamp: saved?.updated_at || new Date().toISOString(),
  };
}

// 加载存档
export function loadSave(userId: number): { saveData: SaveData; timestamp: string } | null {
  const saved = saveModel.getSaveByUserId(userId);
  if (!saved) return null;

  const saveData = JSON.parse(saved.save_data) as SaveData;
  return {
    saveData,
    timestamp: saved.updated_at,
  };
}
