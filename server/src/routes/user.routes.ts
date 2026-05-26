import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as userController from '../controllers/user.controller';

export const userRoutes = Router();

// GET /api/user/profile - 获取用户信息 (需JWT)
userRoutes.get('/profile', authMiddleware, userController.getProfile);
