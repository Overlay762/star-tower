import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as leaderboardController from '../controllers/leaderboard.controller';

export const leaderboardRoutes = Router();

// POST /api/leaderboard/submit - 提交成绩
leaderboardRoutes.post('/submit', authMiddleware, leaderboardController.submitScore);

// GET /api/leaderboard/waves - 获取排行榜
leaderboardRoutes.get('/waves', authMiddleware, leaderboardController.getTopLeaderboard);

// GET /api/leaderboard/me - 获取我的排名
leaderboardRoutes.get('/me', authMiddleware, leaderboardController.getUserRank);
