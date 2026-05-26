import { findOne, upsert } from '../database/db';
import { SaveData } from '../types';

export interface SaveRow {
  id: number;
  user_id: number;
  save_data: string;
  updated_at: string;
}

export function getSaveByUserId(userId: number): { save_data: string; updated_at: string } | undefined {
  const row = findOne<SaveRow>('saves', s => s.user_id === userId);
  return row ? { save_data: row.save_data, updated_at: row.updated_at } : undefined;
}

export function upsertSave(userId: number, saveData: SaveData): void {
  const dataJson = JSON.stringify(saveData);
  upsert('saves',
    (s: SaveRow) => s.user_id === userId,
    {
      user_id: userId,
      save_data: dataJson,
      updated_at: new Date().toISOString(),
    }
  );
}
