import { Node, Vec3, Prefab, instantiate } from 'cc';
import { Tower } from './Tower';
import { BulletSystem } from './BulletSystem';
import { EventBus, GameEvent } from '../core/EventBus';
import { TowerConfig, ConfigManager } from '../core/ConfigManager';

// 塔位信息
export interface TowerSlot {
  position: Vec3;
  occupied: boolean;
  towerNode: Node | null;
}

// 塔管理器（单例）
export class TowerManager {
  private static instance: TowerManager;

  private towers: Tower[] = [];
  private towerSlots: TowerSlot[] = [];
  private bulletSystem: BulletSystem | null = null;
  private towerPrefabs: Map<string, Prefab> = new Map();

  static getInstance(): TowerManager {
    if (!TowerManager.instance) {
      TowerManager.instance = new TowerManager();
    }
    return TowerManager.instance;
  }

  // 初始化
  init(towerPrefabs: Map<string, Prefab>, bulletPrefab: Prefab, mapNode: Node): void {
    this.towerPrefabs = towerPrefabs;
    this.bulletSystem = new BulletSystem(bulletPrefab, mapNode);
  }

  // 设置塔位
  setTowerSlots(slots: TowerSlot[]): void {
    this.towerSlots = slots;
  }

  // 添加塔位
  addTowerSlot(position: Vec3): void {
    this.towerSlots.push({
      position: position,
      occupied: false,
      towerNode: null,
    });
  }

  // 建造塔
  buildTower(slotIndex: number, towerId: string, parentNode: Node): boolean {
    if (slotIndex < 0 || slotIndex >= this.towerSlots.length) return false;
    const slot = this.towerSlots[slotIndex];
    if (slot.occupied) return false;

    const config = ConfigManager.getInstance().getTowerConfig(towerId);
    if (!config) return false;

    const prefab = this.towerPrefabs.get(towerId);
    if (!prefab) {
      // 无预制体时动态创建
      const towerNode = new Node('Tower_' + towerId);
      towerNode.setParent(parentNode);
      towerNode.setPosition(slot.position);

      const tower = towerNode.addComponent(Tower);
      tower.init(config);

      this.towers.push(tower);
      slot.occupied = true;
      slot.towerNode = towerNode;

      EventBus.getInstance().emit(GameEvent.TOWER_BUILT, slotIndex, towerId);
      return true;
    }

    const towerNode = instantiate(prefab);
    towerNode.setParent(parentNode);
    towerNode.setPosition(slot.position);

    const tower = towerNode.getComponent(Tower);
    if (tower) {
      tower.init(config);
      this.towers.push(tower);
    }

    slot.occupied = true;
    slot.towerNode = towerNode;

    EventBus.getInstance().emit(GameEvent.TOWER_BUILT, slotIndex, towerId);
    return true;
  }

  // 出售塔
  sellTower(slotIndex: number): number {
    if (slotIndex < 0 || slotIndex >= this.towerSlots.length) return 0;
    const slot = this.towerSlots[slotIndex];
    if (!slot.occupied || !slot.towerNode) return 0;

    const tower = slot.towerNode.getComponent(Tower);
    const refund = tower ? Math.floor((tower.getTowerData().config?.cost || 0) * 0.6) : 0;

    const index = this.towers.indexOf(tower!);
    if (index !== -1) {
      this.towers.splice(index, 1);
    }

    slot.towerNode.destroy();
    slot.occupied = false;
    slot.towerNode = null;

    EventBus.getInstance().emit(GameEvent.TOWER_SOLD, slotIndex, refund);
    return refund;
  }

  // 升级塔
  upgradeTower(slotIndex: number): boolean {
    if (slotIndex < 0 || slotIndex >= this.towerSlots.length) return false;
    const slot = this.towerSlots[slotIndex];
    if (!slot.occupied || !slot.towerNode) return false;

    const tower = slot.towerNode.getComponent(Tower);
    if (tower) {
      tower.upgrade();
      EventBus.getInstance().emit(GameEvent.TOWER_UPGRADED, slotIndex);
      return true;
    }
    return false;
  }

  // 发射子弹
  launchBullet(origin: Vec3, target: Node, damage: number, config: TowerConfig): void {
    if (this.bulletSystem) {
      this.bulletSystem.fire(origin, target, damage, config);
    }
  }

  // 获取所有塔
  getTowers(): Tower[] {
    return this.towers;
  }

  // 获取塔位信息
  getTowerSlots(): TowerSlot[] {
    return this.towerSlots;
  }

  // 获取空闲塔位
  getAvailableSlots(): number[] {
    return this.towerSlots
      .map((slot, index) => slot.occupied ? -1 : index)
      .filter(index => index !== -1);
  }

  // 清理
  clear(): void {
    this.towers = [];
    this.towerSlots = [];
    this.bulletSystem?.clear();
  }
}
