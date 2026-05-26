import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

export const authRoutes = Router();

// POST /api/auth/register - 注册
authRoutes.post('/register', authController.register);

// POST /api/auth/login - 登录
authRoutes.post('/login', authController.login);
