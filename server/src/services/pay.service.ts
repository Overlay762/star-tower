import * as userModel from '../models/user.model';

// 模拟充值
export function recharge(userId: number, amount: number): { gold: number; added: number } {
  if (amount <= 0) {
    throw new Error('充值金额必须大于0');
  }

  // 模拟充值汇率: 1元 = 10金币
  const goldAdded = amount * 10;

  const user = userModel.findUserById(userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  const newGold = user.gold + goldAdded;
  userModel.updateUserGold(userId, newGold);

  console.log(`[Pay] 用户${userId} 模拟充值 ${amount}元, 获得 ${goldAdded} 金币`);

  return {
    gold: newGold,
    added: goldAdded,
  };
}
