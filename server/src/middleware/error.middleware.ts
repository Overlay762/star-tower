import { Request, Response, NextFunction } from 'express';

// 全局错误处理中间件
export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  res.status(500).json({
    success: false,
    error: err.message || '服务器内部错误'
  });
}
