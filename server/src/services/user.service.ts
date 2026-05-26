import * as userModel from '../models/user.model';
import { UserInfo } from '../types';

export function getUserProfile(userId: number): UserInfo | null {
  const user = userModel.findUserById(userId);
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    gold: user.gold,
    level: user.level,
    maxWave: user.max_wave,
    createdAt: user.created_at,
  };
}
