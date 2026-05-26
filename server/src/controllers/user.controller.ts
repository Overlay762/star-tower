import { Request, Response } from 'express';
import * as userService from '../services/user.service';

// 获取用户信息 (需JWT)
export function getProfile(req: Request, res: Response): void {
  const userId = req.user!.userId;
  const profile = userService.getUserProfile(userId);

  if (!profile) {
    res.status(404).json({ success: false, error: '用户不存在' });
    return;
  }

  res.json({ success: true, data: profile });
}
