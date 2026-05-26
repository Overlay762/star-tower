import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.middleware';
import * as userModel from '../models/user.model';
import { UserInfo } from '../types';

export function register(username: string, password: string): { token: string; user: UserInfo } {
  // 检查用户名是否已存在
  const existing = userModel.findUserByUsername(username);
  if (existing) {
    throw new Error('用户名已存在');
  }

  // 密码哈希
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  // 创建用户
  const user = userModel.createUser(username, passwordHash);

  // 签发 JWT
  const token = generateToken(user.id, user.username);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      gold: user.gold,
      level: user.level,
      maxWave: user.max_wave,
      createdAt: user.created_at,
    },
  };
}

export function login(username: string, password: string): { token: string; user: UserInfo } {
  const user = userModel.findUserByUsername(username);
  if (!user) {
    throw new Error('用户名或密码错误');
  }

  // 验证密码
  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    throw new Error('用户名或密码错误');
  }

  // 签发 JWT
  const token = generateToken(user.id, user.username);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      gold: user.gold,
      level: user.level,
      maxWave: user.max_wave,
      createdAt: user.created_at,
    },
  };
}
