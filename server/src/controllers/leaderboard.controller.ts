import { Request, Response } from 'express';
import * as leaderboardService from '../services/leaderboard.service';

// 提交成绩 (需JWT)
export function submitScore(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const { waves } = req.body;

  if (typeof waves !== 'number' || waves < 0) {
    res.status(400).json({ success: false, error: '参数 waves 不合法' });
    return;
  }

  const data = leaderboardService.submitScore(userId, waves);
  res.json({ success: true, data });
}

// 获取排行榜 (需JWT)
export function getTopLeaderboard(req: Request, res: Response): void {
  const limit = parseInt(req.query.limit as string) || 50;
  const data = leaderboardService.getTopLeaderboard(Math.min(limit, 100));
  res.json({ success: true, data });
}

// 获取用户排名 (需JWT)
export function getUserRank(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const data = leaderboardService.getUserRank(userId);
  res.json({ success: true, data });
}
