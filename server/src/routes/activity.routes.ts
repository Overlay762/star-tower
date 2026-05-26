import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as activityController from '../controllers/activity.controller';

export const activityRoutes = Router();

// GET /api/activity/daily - 每日签到
activityRoutes.get('/daily', authMiddleware, activityController.dailySignIn);

// GET /api/activity/sign-status - 签到状态
activityRoutes.get('/sign-status', authMiddleware, activityController.getSignInStatus);

// GET /api/activity/tasks - 活动任务列表
activityRoutes.get('/tasks', authMiddleware, activityController.getTasks);
