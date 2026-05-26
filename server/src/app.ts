import express from 'express';
import cors from 'cors';
import { initDatabase } from './database/db';
import { errorMiddleware } from './middleware/error.middleware';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { saveRoutes } from './routes/save.routes';
import { payRoutes } from './routes/pay.routes';
import { activityRoutes } from './routes/activity.routes';
import { leaderboardRoutes } from './routes/leaderboard.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 初始化数据库
initDatabase();

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/save', saveRoutes);
app.use('/api/pay', payRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// 全局错误处理
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[Server] 塔防后端服务已启动: http://localhost:${PORT}`);
  console.log(`[Server] API 健康检查: http://localhost:${PORT}/api/health`);
});

export default app;
