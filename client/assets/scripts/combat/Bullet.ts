import { _decorator, Component, Node, Vec3, Color, Graphics, Collider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { Enemy } from './Enemy';
import { TowerConfig } from '../core/ConfigManager';
import { DamageResolver } from './DamageResolver';

const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
  @property
  speed: number = 400;

  @property
  damage: number = 10;

  private target: Node | null = null;
  private targetEnemy: Enemy | null = null;
  private isActive: boolean = false;
  private config: TowerConfig | null = null;

  // 初始化子弹
  init(origin: Vec3, target: Node, damage: number, config: TowerConfig): void {
    this.node.setPosition(origin);
    this.target = target;
    this.targetEnemy = target.getComponent(Enemy);
    this.damage = damage;
    this.speed = config.bulletSpeed;
    this.config = config;
    this.isActive = true;

    // 创建视觉表现（小圆点）
    this.createVisual(config.bulletColor);

    // 设置碰撞检测
    const collider = this.node.getComponent(Collider2D) || this.node.addComponent(require('cc').CircleCollider2D);
    const circleCollider = collider as any;
    circleCollider.radius = 6;
    circleCollider.sensor = true;

    collider.on(Contact2DType.BEGIN_CONTACT, this.onHitEnemy, this);
  }

  private createVisual(colorHex: string): void {
    const graphics = this.node.getComponent(Graphics) || this.node.addComponent(Graphics);
    graphics.clear();
    graphics.fillColor = new Color().fromHEX(colorHex);
    graphics.circle(0, 0, 5);
    graphics.fill();
  }

  private onHitEnemy(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void {
    if (!this.isActive) return;

    const enemy = otherCollider.node.getComponent(Enemy);
    if (!enemy) return;

    this.onHit(enemy);
  }

  // 命中敌人
  private onHit(enemy: Enemy): void {
    const resolver = DamageResolver.getInstance();

    // 计算伤害
    const result = resolver.calculateDamage(this.damage);

    // 对主目标造成伤害
    enemy.takeDamage(result.damage);

    // 处理冰冻效果
    if (result.isFrozen && this.config?.slowPercent) {
      enemy.applyFreeze(
        this.config.slowPercent + result.freezeSlow,
        Math.max(this.config.slowDuration || 0, result.freezeDuration) + 2.0
      );
    }

    // 处理弹射
    this.handleRicochet(enemy, result.ricochetCount);

    // 处理溅射伤害
    if (result.splashDamage > 0) {
      this.handleSplashDamage(enemy, result);
    }

    // 回收子弹
    this.deactivate();
  }

  // 弹射处理
  private handleRicochet(hitEnemy: Enemy, ricochetCount: number): void {
    if (ricochetCount <= 0) return;

    const { EnemyManager } = require('./EnemyManager');
    const enemies = EnemyManager.getInstance().findEnemiesInRange(
      hitEnemy.getPosition(),
      200,
      ricochetCount + 1
    );

    // 跳过已命中的敌人
    const remainingEnemies = enemies.filter(e => e !== hitEnemy).slice(0, ricochetCount);

    remainingEnemies.forEach(enemy => {
      enemy.takeDamage(Math.round(this.damage * 0.6));
    });
  }

  // 溅射伤害处理
  private handleSplashDamage(hitEnemy: Enemy, result: any): void {
    if (result.splashDamage <= 0 || result.splashRadius <= 0) return;

    const { EnemyManager } = require('./EnemyManager');
    const enemies = EnemyManager.getInstance().findEnemiesInRange(
      hitEnemy.getPosition(),
      result.splashRadius,
      10
    );

    enemies.forEach(enemy => {
      if (enemy !== hitEnemy) {
        enemy.takeDamage(Math.round(result.splashDamage));
      }
    });
  }

  update(dt: number): void {
    if (!this.isActive) return;
    if (!this.target || !this.target.isValid) {
      // 目标已消失，回收子弹
      this.deactivate();
      return;
    }

    // 向目标移动
    const direction = new Vec3();
    Vec3.subtract(direction, this.target.worldPosition, this.node.worldPosition);
    const distance = direction.length();

    if (distance < 10) {
      // 命中目标
      if (this.targetEnemy) {
        this.onHit(this.targetEnemy);
      } else {
        this.deactivate();
      }
      return;
    }

    direction.normalize();
    direction.multiplyScalar(this.speed * dt);
    this.node.setPosition(this.node.position.add(direction));
  }

  // 停用并回收
  deactivate(): void {
    this.isActive = false;
    this.target = null;
    this.targetEnemy = null;

    if (this.node && this.node.isValid) {
      const { BulletSystem } = require('./BulletSystem');
      BulletSystem.getInstance().recycle(this.node);
    }
  }

  getIsActive(): boolean { return this.isActive; }
}
