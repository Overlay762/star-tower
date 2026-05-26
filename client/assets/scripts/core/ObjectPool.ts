// 通用对象池封装
// 注意: Cocos Creator 3.x 的 NodePool 需要通过 import { NodePool } from 'cc' 导入
// 此文件提供通用封装以供战斗系统使用

export interface IPoolable {
  onReuse(...args: any[]): void;
  onRelease(): void;
}

export class ObjectPool<T extends IPoolable> {
  private pool: T[] = [];
  private factory: () => T;
  private initialSize: number;
  private maxSize: number;

  constructor(factory: () => T, initialSize: number = 10, maxSize: number = 200) {
    this.factory = factory;
    this.initialSize = initialSize;
    this.maxSize = maxSize;
    this.preFill();
  }

  // 预填充对象池
  private preFill(): void {
    for (let i = 0; i < this.initialSize; i++) {
      const obj = this.factory();
      obj.onRelease();
      this.pool.push(obj);
    }
  }

  // 获取对象
  get(...args: any[]): T {
    let obj: T;
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.factory();
    }
    obj.onReuse(...args);
    return obj;
  }

  // 回收对象
  put(obj: T): void {
    if (this.pool.length < this.maxSize) {
      obj.onRelease();
      this.pool.push(obj);
    }
  }

  // 获取活跃对象数量
  getActiveCount(): number {
    return 0; // 仅由外部追踪
  }

  // 获取池中可用对象数量
  getPoolSize(): number {
    return this.pool.length;
  }

  // 清空对象池
  clear(): void {
    this.pool = [];
  }
}
