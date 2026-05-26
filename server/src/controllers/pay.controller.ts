import { Request, Response } from 'express';
import { z } from 'zod';
import * as payService from '../services/pay.service';

const rechargeSchema = z.object({
  amount: z.number().int().min(1).max(10000),
});

// 模拟充值 (需JWT)
export function recharge(req: Request, res: Response): void {
  const result = rechargeSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      success: false,
      error: '参数校验失败: ' + result.error.errors.map(e => e.message).join(', '),
    });
    return;
  }

  const userId = req.user!.userId;
  const { amount } = result.data;

  const data = payService.recharge(userId, amount);
  res.json({ success: true, data });
}
