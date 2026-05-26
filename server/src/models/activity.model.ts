import { findOne, findAll, insert, count } from '../database/db';

export interface SignInRow {
  id: number;
  user_id: number;
  sign_date: string;
  streak: number;
  reward_gold: number;
}

export function getTodaySignIn(userId: number): SignInRow | undefined {
  const today = new Date().toISOString().split('T')[0];
  return findOne<SignInRow>('daily_signin', s => s.user_id === userId && s.sign_date === today);
}

export function getLastSignIn(userId: number): SignInRow | undefined {
  const rows = findAll<SignInRow>('daily_signin', s => s.user_id === userId);
  rows.sort((a, b) => b.sign_date.localeCompare(a.sign_date));
  return rows[0];
}

export function createSignIn(userId: number, date: string, streak: number, rewardGold: number): SignInRow {
  return insert('daily_signin', {
    user_id: userId,
    sign_date: date,
    streak,
    reward_gold: rewardGold,
  }) as SignInRow;
}

export function getTotalSignInCount(userId: number): number {
  return count('daily_signin', (s: SignInRow) => s.user_id === userId);
}
