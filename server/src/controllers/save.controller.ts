import { Request, Response } from 'express';
import * as saveService from '../services/save.service';

// 同步存档 (需JWT)
export function syncSave(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { saveData } = req.body;

  if (!saveData) {
    res.status(400).json({ success: false, error: '存档数据不能为空' });
    return;
  }

  const result = saveService.syncSave(userId, saveData);
  console.log(`[Save] 用户${userId} 存档同步成功`);
  res.json({ success: true, data: result });
}

// 加载存档 (需JWT)
export function loadSave(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const result = saveService.loadSave(userId);

  if (!result) {
    res.json({ success: true, data: null });
    return;
  }

  res.json({ success: true, data: result });
}
