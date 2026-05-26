import { GameManager } from '../core/GameManager';
import { ConfigManager, EnemyConfig } from '../core/ConfigManager';

// Buff 类型常量
export const BuffType = {
  ATK_BOOST: 'atk_boost',
  SPEED_BOOST: 'speed_boost',
  RANGE_BOOST: 'range_boost',
  FREEZE: 'freeze',
  RICOCHET: 'ricochet',
  CRIT: 'crit',
  GOLD_BOOST: 'gold_boost',
  SPLASH: 'splash',
  HP_REGEN: 'hp_regen',
  INSTANT_GOLD: 'instant_gold',
} as const;

// 伤害结算结果
export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isFrozen: boolean;
  freezeSlow: number;
  freezeDuration: number;
  splashDamage: number;
  splashRadius: number;
  ricochetCount: number;
}

// 伤害结算器（纯逻辑模块，不继承 Component）
export class DamageResolver {
  private static instance: DamageResolver;

  static getInstance(): DamageResolver {
    if (!DamageResolver.instance) {
      DamageResolver.instance = new DamageResolver();
    }
    return DamageResolver.instance;
  }

  // 计算实际伤害
  calculateDamage(baseAtk: number, enemyConfig?: EnemyConfig): DamageResult {
    const gm = GameManager.getInstance();

    const atkBonus = gm.getBuffBonus(BuffType.ATK_BOOST);
    const critChance = gm.getBuffBonus(BuffType.CRIT);
    const freezeBuff = gm.getActiveBuffs().find(b => b.type === BuffType.FREEZE);
    const splashBuff = gm.getActiveBuffs().find(b => b.type === BuffType.SPLASH);
    const ricochetBuff = gm.getActiveBuffs().find(b => b.type === BuffType.RICOCHET);

    // 基础伤害
    let damage = baseAtk * (1 + atkBonus);

    // 暴击判定
    const isCrit = critChance > 0 ? Math.random() < critChance : false;
    if (isCrit) {
      damage *= 2;
    }

    // 冰冻效果
    const isFrozen = !!freezeBuff;
    const freezeSlow = isFrozen ? freezeBuff!.value : 0;
    const freezeDuration = isFrozen ? 2.0 : 0;

    // 溅射伤害
    const splashDamage = splashBuff ? damage * splashBuff.value : 0;
    const splashRadius = splashBuff ? 60 : 0;

    // 弹射次数
    const ricochetCount = ricochetBuff ? Math.floor(ricochetBuff.value) : 0;

    return {
      damage: Math.round(damage),
      isCrit,
      isFrozen,
      freezeSlow,
      freezeDuration,
      splashDamage,
      splashRadius,
      ricochetCount,
    };
  }

  // 计算击杀金币奖励
  calculateGoldReward(baseGold: number): number {
    const gm = GameManager.getInstance();
    const goldBonus = gm.getBuffBonus(BuffType.GOLD_BOOST);
    return Math.round(baseGold * (1 + goldBonus));
  }
}
