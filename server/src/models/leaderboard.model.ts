import { findOne, findAll, upsert } from '../database/db';
import { findUserById } from './user.model';

export interface LeaderboardRow {
  id: number;
  user_id: number;
  waves_reached: number;
  score: number;
  submitted_at: string;
}

export function submitScore(userId: number, waves: number, score: number): void {
  const existing = findOne<LeaderboardRow>('leaderboard', l => l.user_id === userId);
  upsert('leaderboard',
    (l: LeaderboardRow) => l.user_id === userId,
    {
      user_id: userId,
      waves_reached: existing ? Math.max(existing.waves_reached, waves) : waves,
      score: existing ? Math.max(existing.score, score) : score,
      submitted_at: new Date().toISOString(),
    }
  );
}

export function getTopLeaderboard(limit: number = 50): { username: string; waves_reached: number; score: number; submitted_at: string }[] {
  const rows = findAll<LeaderboardRow>('leaderboard');
  rows.sort((a, b) => {
    if (b.waves_reached !== a.waves_reached) return b.waves_reached - a.waves_reached;
    return b.score - a.score;
  });

  return rows.slice(0, limit).map(row => {
    const user = findUserById(row.user_id);
    return {
      username: user?.username || 'Unknown',
      waves_reached: row.waves_reached,
      score: row.score,
      submitted_at: row.submitted_at,
    };
  });
}

export function getUserRank(userId: number): number {
  const rows = findAll<LeaderboardRow>('leaderboard');
  rows.sort((a, b) => {
    if (b.waves_reached !== a.waves_reached) return b.waves_reached - a.waves_reached;
    return b.score - a.score;
  });
  const index = rows.findIndex(r => r.user_id === userId);
  return index !== -1 ? index + 1 : 0;
}

export function getUserLeaderboard(userId: number): { waves_reached: number; score: number } | undefined {
  const row = findOne<LeaderboardRow>('leaderboard', l => l.user_id === userId);
  if (!row) return undefined;
  return { waves_reached: row.waves_reached, score: row.score };
}
