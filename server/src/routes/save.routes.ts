import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as saveController from '../controllers/save.controller';

export const saveRoutes = Router();

// POST /api/save/sync - 云存档同步
saveRoutes.post('/sync', authMiddleware, saveController.syncSave);

// GET /api/save/load - 云存档加载
saveRoutes.get('/load', authMiddleware, saveController.loadSave);
