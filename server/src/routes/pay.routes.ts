import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as payController from '../controllers/pay.controller';

export const payRoutes = Router();

// POST /api/pay/recharge - 模拟充值
payRoutes.post('/recharge', authMiddleware, payController.recharge);
