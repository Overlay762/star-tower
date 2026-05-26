// 全局类型定义

// JWT Payload
export interface JwtPayload {
  userId: number;
  username: string;
}

// 统一 API 响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  gold: number;
  level: number;
  maxWave: number;
  createdAt: string;
}

// 存档数据
export interface SaveData {
  level: number;
  gold: number;
  unlockedTowers: string[];
  maxWaveReached: number;
}

// 排行榜条目
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  wavesReached: number;
  score: number;
  submittedAt: string;
}

// 签到信息
export interface SignInInfo {
  signed: boolean;
  streak: number;
  rewardGold: number;
  totalGold: number;
}

// 活动任务
export interface ActivityTask {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  rewardGold: number;
}

// Express Request 扩展
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
