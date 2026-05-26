import { EventBus, GameEvent } from '../core/EventBus';
import { GameManager } from '../core/GameManager';
import { TowerManager } from '../combat/TowerManager';
import { ConfigManager } from '../core/ConfigManager';

// 经济系统（单例）
export class EconomySystem {
  private static instance: EconomySystem;

  static getInstance(): EconomySystem {
    if (!EconomySystem.instance) {
      EconomySystem.instance = new EconomySystem();
    }
    return EconomySystem.instance;
  }

  // 获取当前金币
  getGold(): number {
    return GameManager.getInstance().getGold();
  }

  // 检查是否能支付
  canAfford(amount: number): boolean {
    return GameManager.getInstance().canAfford(amount);
  }

  // 建造塔
  buildTower(slotIndex: number, towerId: string, parentNode: any): boolean {
    const gm = GameManager.getInstance();
    const config = ConfigManager.getInstance().getTowerConfig(towerId);

    if (!config) return false;
    if (!gm.canAfford(config.cost)) return false;

    const towerManager = TowerManager.getInstance();
    const success = towerManager.buildTower(slotIndex, towerId, parentNode);

    if (success) {
      gm.spendGold(config.cost);
      console.log(`[Economy] 建造 ${towerId} 花费 ${config.cost} 金币, 剩余 ${gm.getGold()}`);
    }

    return success;
  }

  // 出售塔
  sellTower(slotIndex: number): number {
    const towerManager = TowerManager.getInstance();
    const refund = towerManager.sellTower(slotIndex);

    if (refund > 0) {
      GameManager.getInstance().addGold(refund);
      console.log(`[Economy] 出售塔获得 ${refund} 金币`);
    }

    return refund;
  }

  // 升级塔
  upgradeTower(slotIndex: number): boolean {
    const gm = GameManager.getInstance();
    const config = ConfigManager.getInstance().getAllTowerConfigs();

    const towerManager = TowerManager.getInstance();
    const slots = towerManager.getTowerSlots();

    if (slotIndex < 0 || slotIndex >= slots.length) return false;
    const slot = slots[slotIndex];
    if (!slot.occupied || !slot.towerNode) return false;

    const tower = slot.towerNode.getComponent('Tower') as any;
    const towerData = tower.getTowerData();
    const upgradeCost = towerData.config?.upgradeCost || 0;

    if (!gm.canAfford(upgradeCost)) return false;

    const success = towerManager.upgradeTower(slotIndex);
    if (success) {
      gm.spendGold(upgradeCost);
      console.log(`[Economy] 升级塔花费 ${upgradeCost} 金币`);
    }

    return success;
  }
}
