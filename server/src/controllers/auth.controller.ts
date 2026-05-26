import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';

// 请求体校验 schema
const registerSchema = z.object({
  username: z.string().min(2).max(20),
  password: z.string().min(4).max(50),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// 注册
export function register(req: Request, res: Response): void {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      success: false,
      error: '参数校验失败: ' + result.error.errors.map(e => e.message).join(', '),
    });
    return;
  }

  const { username, password } = result.data;

  const data = authService.register(username, password);

  if (!data) {
    res.status(400).json({ success: false, error: '注册失败' });
    return;
  }

  console.log(`[Auth] 新用户注册: ${username}`);
  res.json({ success: true, data });
}

// 登录
export function login(req: Request, res: Response): void {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      success: false,
      error: '参数校验失败: ' + result.error.errors.map(e => e.message).join(', '),
    });
    return;
  }

  const { username, password } = result.data;

  const data = authService.login(username, password);

  if (!data) {
    res.status(401).json({ success: false, error: '登录失败' });
    return;
  }

  console.log(`[Auth] 用户登录: ${username}`);
  res.json({ success: true, data });
}
