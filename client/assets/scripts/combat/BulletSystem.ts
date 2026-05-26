import { Node, Vec3, Prefab, instantiate } from 'cc';
import { Bullet } from './Bullet';
import { TowerConfig } from '../core/ConfigManager';

// 子弹系统（管理子弹对象池）
export class BulletSystem {
  private static instance: BulletSystem;

  private bulletPrefab: Prefab | null = null;
  private parentNode: Node | null = null;
  private activeBullets: Bullet[] = [];
  private pool: Node[] = [];
  private maxPoolSize: number = 100;

  constructor(bulletPrefab: Prefab, parentNode: Node) {
    this.bulletPrefab = bulletPrefab;
    this.parentNode = parentNode;
    BulletSystem.instance = this;
  }

  static getInstance(): BulletSystem {
    return BulletSystem.instance;
  }

  // 发射子弹
  fire(origin: Vec3, target: Node, damage: number, config: TowerConfig): Bullet | null {
    if (!this.parentNode) return null;

    const bulletNode = this.getFromPool();
    if (!bulletNode) return null;

    const bullet = bulletNode.getComponent(Bullet) || bulletNode.addComponent(Bullet);
    bullet.init(origin, target, damage, config);
    this.activeBullets.push(bullet);

    return bullet;
  }

  // 从对象池获取子弹
  private getFromPool(): Node | null {
    if (this.pool.length > 0) {
      const node = this.pool.pop()!;
      node.active = true;
      return node;
    }

    // 创建新子弹
    const bulletNode = new Node('Bullet');
    bulletNode.setParent(this.parentNode!);
    bulletNode.active = true;
    return bulletNode;
  }

  // 回收子弹
  recycle(node: Node): void {
    const bullet = node.getComponent(Bullet);
    if (bullet) {
      const index = this.activeBullets.indexOf(bullet);
      if (index !== -1) {
        this.activeBullets.splice(index, 1);
      }
    }

    node.active = false;

    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(node);
    } else {
      node.destroy();
    }
  }

  // 获取活跃子弹
  getActiveBullets(): Bullet[] {
    return this.activeBullets;
  }

  // 获取对象池大小
  getPoolSize(): number {
    return this.pool.length;
  }

  // 清理
  clear(): void {
    this.activeBullets = [];
    this.pool.forEach(n => n.destroy());
    this.pool = [];
  }
}
