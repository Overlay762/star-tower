import { Request, Response } from 'express';
import * as activityService from '../services/activity.service';

// 每日签到 (需JWT)
export function dailySignIn(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const data = activityService.dailySignIn(userId);
  res.json({ success: true, data });
}

// 获取签到状态 (需JWT)
export function getSignInStatus(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const data = activityService.getSignInStatus(userId);
  res.json({ success: true, data });
}

// 获取活动任务列表 (需JWT)
export function getTasks(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const data = activityService.getTasks(userId);
  res.json({ success: true, data });
}
