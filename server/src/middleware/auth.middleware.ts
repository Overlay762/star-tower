import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'tower-defense-secret-key-2024';

// JWT 鉴权中间件
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: '未提供认证令牌'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

  if (!payload || !payload.userId) {
    res.status(401).json({
      success: false,
      error: '认证令牌无效或已过期'
    });
    return;
  }

  req.user = payload;
  next();
}

// JWT 工具函数
export function generateToken(userId: number, username: string): string {
  return jwt.sign(
    { userId, username } as JwtPayload,
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export { JWT_SECRET };
