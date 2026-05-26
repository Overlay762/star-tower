import { _decorator, Component, Node, Vec3, Color, Sprite, UITransform, Graphics } from 'cc';
import { EnemyConfig } from '../core/ConfigManager';

const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
  @property
  enemyId: string = '';

  @property
  currentHp: number = 100;

  @property
  maxHp: number = 100;

  @property
  moveSpeed: number = 100;

  @property
  goldReward: number = 10;

  @property
  enemyDamage: number = 1;

  private pathPoints: Vec3[] = [];
  private currentPathIndex: number = 0;
  private isDead: boolean = false;
  private isFrozen: boolean = false;
  private frozenTimer: number = 0;
  private frozenSlow: number = 0;
  private config: EnemyConfig | null = null;

  // 初始化敌人
  init(config: EnemyConfig, path: Vec3[]): void {
    this.config = config;
    this.enemyId = config.id;
    this.maxHp = config.hp;
    this.currentHp = config.hp;
    this.moveSpeed = config.speed;
    this.goldReward = config.gold;
    this.enemyDamage = config.damage;
    this.pathPoints = path;
    this.currentPathIndex = 0;
    this.isDead = false;

    // 设置初始位置为路径起点
    if (this.pathPoints.length > 0) {
      this.node.setPosition(this.pathPoints[0]);
    }

    // 创建视觉表现
    this.createVisual(config.color, config.scale);
  }

  // 创建视觉表现（圆形）
  private createVisual(colorHex: string, size: number): void {
    const graphics = this.node.getComponent(Graphics) || this.node.addComponent(Graphics);
    const radius = 18 * size;

    graphics.clear();
    graphics.fillColor = new Color().fromHEX(colorHex);
    graphics.circle(0, 0, radius);
    graphics.fill();

    // 边框
    graphics.strokeColor = new Color(255, 255, 255, 100);
    graphics.lineWidth = 2;
    graphics.circle(0, 0, radius);
    graphics.stroke();

    // 血条背景
    graphics.fillColor = new Color(50, 50, 50, 200);
    graphics.rect(-20, radius + 5, 40, 5);
    graphics.fill();
  }

  // 更新血条
  private updateHpBar(): void {
    const graphics = this.node.getComponent(Graphics);
    if (!graphics) return;

    const radius = 18 * (this.config?.scale || 1.0);
    const hpPercent = this.currentHp / this.maxHp;

    // 血条
    const barColor = hpPercent > 0.5 ? new Color(76, 175, 80) : hpPercent > 0.25 ? new Color(255, 193, 7) : new Color(244, 67, 54);
    graphics.fillColor = barColor;
    graphics.rect(-20, radius + 5, 40 * hpPercent, 5);
    graphics.fill();
  }

  update(dt: number): void {
    if (this.isDead) return;

    // 处理冰冻计时器
    if (this.isFrozen) {
      this.frozenTimer -= dt;
      if (this.frozenTimer <= 0) {
        this.isFrozen = false;
        this.frozenSlow = 0;
      }
    }

    this.moveAlongPath(dt);
  }

  // 沿路径移动
  private moveAlongPath(dt: number): void {
    if (this.currentPathIndex >= this.pathPoints.length - 1) {
      // 到达终点
      this.onReachEnd();
      return;
    }

    const target = this.pathPoints[this.currentPathIndex + 1];
    const current = this.node.position;
    const direction = new Vec3();
    Vec3.subtract(direction, target, current);

    const distance = direction.length();
    const speed = this.isFrozen ? this.moveSpeed * (1 - this.frozenSlow) : this.moveSpeed;
    const step = speed * dt;

    if (step >= distance) {
      // 到达当前路径点
      this.node.setPosition(target);
      this.currentPathIndex++;
    } else {
      direction.normalize();
      direction.multiplyScalar(step);
      this.node.setPosition(current.add(direction));
    }
  }

  // 到达终点
  private onReachEnd(): void {
    this.isDead = true;

    // 通知 GameManager 扣血
    const { GameManager } = require('../core/GameManager');
    GameManager.getInstance().onEnemyReachedEnd(this.enemyDamage);

    this.node.destroy();
  }

  // 受到伤害
  takeDamage(damage: number): number {
    if (this.isDead) return 0;

    this.currentHp -= damage;
    this.updateHpBar();

    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.die();
      return damage;
    }
    return damage;
  }

  // 死亡
  private die(): void {
    if (this.isDead) return;
    this.isDead = true;

    const { GameManager } = require('../core/GameManager');
    const { DamageResolver } = require('./DamageResolver');

    // 计算金币奖励
    const goldReward = DamageResolver.getInstance().calculateGoldReward(this.goldReward);
    GameManager.getInstance().addGold(goldReward);
    GameManager.getInstance().onEnemyDied();

    this.node.destroy();
  }

  // 施加冰冻效果
  applyFreeze(slowPercent: number, duration: number): void {
    this.isFrozen = true;
    this.frozenSlow = slowPercent;
    this.frozenTimer = duration;
  }

  // Getters
  getIsDead(): boolean { return this.isDead; }
  getCurrentHp(): number { return this.currentHp; }
  getMaxHp(): number { return this.maxHp; }
  getHpPercent(): number { return this.currentHp / this.maxHp; }
  getPosition(): Vec3 { return this.node.worldPosition.clone(); }
}
