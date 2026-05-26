import fs from 'fs';
import path from 'path';

// 简易 JSON 文件数据库（替代 SQLite，零依赖，Demo 足够用）

const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'tower-defense.json');

interface Database {
  users: any[];
  saves: any[];
  daily_signin: any[];
  leaderboard: any[];
  _autoIncrement: number;
}

let db: Database = {
  users: [],
  saves: [],
  daily_signin: [],
  leaderboard: [],
  _autoIncrement: 1,
};

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 从文件加载
function loadDatabase(): void {
  if (fs.existsSync(DB_PATH)) {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    db = JSON.parse(raw);
  }
}

// 保存到文件
function saveDatabase(): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// 初始化数据库
export function initDatabase(): void {
  loadDatabase();
  console.log('[Database] JSON 数据库初始化完成');
  console.log(`[Database] 数据文件: ${DB_PATH}`);
}

// 通用 CRUD 操作
export function findOne<T = any>(table: string, predicate: (row: T) => boolean): T | undefined {
  const rows = (db as any)[table] as T[];
  return rows.find(predicate);
}

export function findAll<T = any>(table: string, predicate?: (row: T) => boolean): T[] {
  const rows = (db as any)[table] as T[];
  return predicate ? rows.filter(predicate) : rows;
}

export function insert(table: string, data: any): any {
  data.id = db._autoIncrement++;
  (db as any)[table].push(data);
  saveDatabase();
  return data;
}

export function update(table: string, predicate: (row: any) => boolean, updater: (row: any) => void): boolean {
  const rows = (db as any)[table];
  const index = rows.findIndex(predicate);
  if (index !== -1) {
    updater(rows[index]);
    saveDatabase();
    return true;
  }
  return false;
}

export function upsert(table: string, uniquePredicate: (row: any) => boolean, data: any): any {
  const rows = (db as any)[table];
  const index = rows.findIndex(uniquePredicate);
  if (index !== -1) {
    // 更新
    Object.assign(rows[index], data);
    saveDatabase();
    return rows[index];
  } else {
    // 插入
    return insert(table, data);
  }
}

export function remove(table: string, predicate: (row: any) => boolean): boolean {
  const rows = (db as any)[table];
  const index = rows.findIndex(predicate);
  if (index !== -1) {
    rows.splice(index, 1);
    saveDatabase();
    return true;
  }
  return false;
}

export function count(table: string, predicate?: (row: any) => boolean): number {
  const rows = (db as any)[table];
  return predicate ? rows.filter(predicate).length : rows.length;
}

export function query<T = any>(sql: string, ...params: any[]): T[] {
  // 简单的查询仿真 - 仅用于兼容旧接口
  console.warn('[Database] query() 是仿真方法，请使用 findOne/findAll');
  return [];
}

export function run(sql: string, ...params: any[]): any {
  console.warn('[Database] run() 是仿真方法，请使用 insert/update');
  return { lastInsertRowid: 0, changes: 0 };
}

export default db;
