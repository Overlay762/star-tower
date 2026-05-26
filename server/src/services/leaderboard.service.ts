import * as leaderboardModel from '../models/leaderboard.model';
import { LeaderboardEntry } from '../types';

// 提交成绩
export function submitScore(userId: number, waves: number): { rank: number } {
  // 计算分数: 波次 * 100 + 额外（基于波次难度曲线）
  const score = waves * 100 + (waves >= 10 ? 200 : 0) + (waves >= 5 ? 50 : 0);

  leaderboardModel.submitScore(userId, waves, score);

  const rank = leaderboardModel.getUserRank(userId);

  console.log(`[Leaderboard] 用户${userId} 提交成绩: 波次${waves}, 分数${score}, 排名${rank}`);

  return { rank };
}

// 获取排行榜 Top N
export function getTopLeaderboard(limit: number = 50): LeaderboardEntry[] {
  const rows = leaderboardModel.getTopLeaderboard(limit);

  return rows.map((row: any, index: number) => ({
    rank: index + 1,
    userId: -1, // 不暴露 userId
    username: row.username,
    wavesReached: row.waves_reached,
    score: row.score,
    submittedAt: row.submitted_at,
  }));
}

// 获取用户排名
export function getUserRank(userId: number): { rank: number; waves: number; score: number } | null {
  const row = leaderboardModel.getUserLeaderboard(userId);
  if (!row) return null;

  const rank = leaderboardModel.getUserRank(userId);

  return {
    rank,
    waves: row.waves_reached,
    score: row.score,
  };
}
