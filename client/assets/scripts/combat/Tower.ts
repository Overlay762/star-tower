import { _decorator, Component, Node, Vec3, Color, Sprite, UITransform, Graphics, CircleCollider2D, Contact2DType, Collider2D, IPhysics2DContact } from 'cc';
import { TowerManager } from './TowerManager';
import { TowerConfig } from '../core/ConfigManager';

const { ccclass, property } = _decorator;

@ccclass('Tower')
export class Tower extends Component {
  @property
  towerId: string = '';

  @property
  level: number = 1;

  private config: TowerConfig | null = null;
  private attackRange: number = 150;
  private attackDamage: number = 10;
  private attackSpeed: number = 1.0;
  private attackCooldown: number = 0;
  private target: Node | null = null;
  private enemiesInRange: Node[] = [];
  private towerNode: Node | null = null;

  onLoad(): void {
    this.towerManager = TowerManager.getInstance();
  }

  // 初始化塔
  init(config: TowerConfig): void {
    this.config = config;
    this.attackRange = config.range;
    this.attackDamage = config.attack;
    this.attackSpeed = config.attackSpeed;

    // 创建视觉表现
    this.createVisual(config.color);
    this.createRangeIndicator();
    this.setupCollider();
  }

  // 创建视觉表现（方块）
  private createVisual(colorHex: string): void {
    const graphics = this.node.getComponent(Graphics) || this.node.addComponent(Graphics);
    const size = 40;

    graphics.clear();
    graphics.fillColor = new Color().fromHEX(colorHex);
    graphics.rect(-size / 2, -size / 2, size, size);
    graphics.fill();

    // 等级标记
    if (this.level > 1) {
      graphics.fillColor = new Color(255, 255, 255, 200);
      graphics.circle(0, 0, 8);
      graphics.fill();
    }
  }

  // 创建攻击范围指示器
  private createRangeIndicator(): void {
    this.towerNode = new Node('RangeIndicator');
    this.towerNode.setParent(this.node);
    this.towerNode.layer = this.node.layer;

    const graphics = this.towerNode.addComponent(Graphics);
    graphics.strokeColor = new Color(255, 255, 255, 80);
    graphics.lineWidth = 1;
    graphics.circle(0, 0, this.attackRange);
    graphics.stroke();

    // 半透明填充
    graphics.fillColor = new Color(255, 255, 255, 20);
    graphics.circle(0, 0, this.attackRange);
    graphics.fill();
  }

  // 设置碰撞体用于范围检测
  private setupCollider(): void {
    const collider = this.node.getComponent(CircleCollider2D) || this.node.addComponent(CircleCollider2D);
    collider.radius = this.attackRange;
    collider.sensor = true;

    collider.on(Contact2DType.BEGIN_CONTACT, this.onEnemyEnter, this);
    collider.on(Contact2DType.END_CONTACT, this.onEnemyExit, this);
  }

  private onEnemyEnter(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void {
    const enemyNode = otherCollider.node;
    if (enemyNode && enemyNode.getComponent('Enemy')) {
      if (!this.enemiesInRange.includes(enemyNode)) {
        this.enemiesInRange.push(enemyNode);
      }
    }
  }

  private onEnemyExit(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null): void {
    const enemyNode = otherCollider.node;
    const index = this.enemiesInRange.indexOf(enemyNode);
    if (index !== -1) {
      this.enemiesInRange.splice(index, 1);
    }
    if (this.target === enemyNode) {
      this.target = null;
    }
  }

  update(dt: number): void {
    this.attackCooldown -= dt;

    // 寻找最近敌人
    this.findTarget();

    if (this.target && this.attackCooldown <= 0) {
      this.attack();
      this.attackCooldown = this.attackSpeed;
    }
  }

  // 寻找范围内最近的敌人
  private findTarget(): void {
    // 清理已销毁的敌人引用
    this.enemiesInRange = this.enemiesInRange.filter(e => e && e.isValid);

    if (this.enemiesInRange.length === 0) {
      this.target = null;
      return;
    }

    // 找距离终点最近的敌人（x坐标最大）
    this.target = this.enemiesInRange.reduce((closest, current) => {
      return current.worldPosition.x > closest.worldPosition.x ? current : closest;
    }, this.enemiesInRange[0]);
  }

  // 攻击
  private attack(): void {
    if (!this.target || !this.target.isValid) return;

    this.towerManager.launchBullet(
      this.node.worldPosition.clone(),
      this.target,
      this.attackDamage,
      this.config!
    );
  }

  // 获取塔数据
  getTowerData(): { id: string; level: number; config: TowerConfig | null } {
    return {
      id: this.towerId,
      level: this.level,
      config: this.config,
    };
  }

  // 升级
  upgrade(): void {
    this.level++;
    if (this.config) {
      this.attackDamage += this.config.upgradeAttackBonus;
    }
    this.createVisual(this.config?.color || '#FFFFFF');
  }

  // 设置范围指示器可见性
  setRangeVisible(visible: boolean): void {
    if (this.towerNode) {
      this.towerNode.active = visible;
    }
  }

  private towerManager: TowerManager | null = null;
}
