import { findOne, insert, update } from '../database/db';

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  gold: number;
  level: number;
  max_wave: number;
  created_at: string;
}

export function findUserByUsername(username: string): UserRow | undefined {
  return findOne<UserRow>('users', u => u.username === username);
}

export function findUserById(id: number): UserRow | undefined {
  return findOne<UserRow>('users', u => u.id === id);
}

export function createUser(username: string, passwordHash: string): UserRow {
  return insert('users', {
    username,
    password_hash: passwordHash,
    gold: 100,
    level: 1,
    max_wave: 0,
    created_at: new Date().toISOString(),
  }) as UserRow;
}

export function updateUserGold(userId: number, gold: number): void {
  update('users', (u: UserRow) => u.id === userId, (u: UserRow) => { u.gold = gold; });
}

export function updateUserMaxWave(userId: number, maxWave: number): void {
  update('users', (u: UserRow) => u.id === userId, (u: UserRow) => {
    if (maxWave > u.max_wave) u.max_wave = maxWave;
  });
}

export function updateUserLevel(userId: number, level: number): void {
  update('users', (u: UserRow) => u.id === userId, (u: UserRow) => { u.level = level; });
}
