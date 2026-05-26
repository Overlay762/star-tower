import * as activityModel from '../models/activity.model';
import * as userModel from '../models/user.model';
import { SignInInfo, ActivityTask } from '../types';

// 每日签到
export function dailySignIn(userId: number): SignInInfo {
  const today = new Date().toISOString().split('T')[0];

  // 检查今天是否已签到
  const existing = activityModel.getTodaySignIn(userId);
  if (existing) {
    throw new Error('今日已签到');
  }

  // 获取上次签到记录（计算连续天数）
  const lastSignIn = activityModel.getLastSignIn(userId);

  let streak = 1;
  if (lastSignIn) {
    const lastDate = new Date(lastSignIn.sign_date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
      streak = lastSignIn.streak + 1;
    }
  }

  // 计算奖励（连续签到加成）
  const baseReward = 20;
  const streakBonus = Math.min(streak - 1, 6) * 5; // 最多额外+30
  const rewardGold = baseReward + streakBonus;

  // 创建签到记录
  activityModel.createSignIn(userId, today, streak, rewardGold);

  // 更新用户金币
  const user = userModel.findUserById(userId);
  if (user) {
    userModel.updateUserGold(userId, user.gold + rewardGold);
  }

  console.log(`[Activity] 用户${userId} 每日签到, 连续${streak}天, 获得${rewardGold}金币`);

  return {
    signed: true,
    streak: streak,
    rewardGold: rewardGold,
    totalGold: (user?.gold || 0) + rewardGold,
  };
}

// 获取签到状态
export function getSignInStatus(userId: number): SignInInfo {
  const today = new Date().toISOString().split('T')[0];
  const existing = activityModel.getTodaySignIn(userId);
  const lastSignIn = activityModel.getLastSignIn(userId);

  if (existing) {
    return {
      signed: true,
      streak: existing.streak,
      rewardGold: existing.reward_gold,
      totalGold: userModel.findUserById(userId)?.gold || 0,
    };
  }

  return {
    signed: false,
    streak: lastSignIn?.streak || 0,
    rewardGold: 0,
    totalGold: userModel.findUserById(userId)?.gold || 0,
  };
}

// 获取活动任务列表
export function getTasks(userId: number): ActivityTask[] {
  const user = userModel.findUserById(userId);
  if (!user) return [];

  const tasks: ActivityTask[] = [
    {
      id: 'task_play_1',
      name: '初次挑战',
      description: '完成 1 局游戏',
      progress: user.max_wave > 0 ? 1 : 0,
      target: 1,
      completed: user.max_wave > 0,
      rewardGold: 30,
    },
    {
      id: 'task_wave_5',
      name: '塔防新手',
      description: '通关第 5 波',
      progress: Math.min(user.max_wave, 5),
      target: 5,
      completed: user.max_wave >= 5,
      rewardGold: 50,
    },
    {
      id: 'task_wave_10',
      name: '塔防大师',
      description: '通关所有 10 波',
      progress: Math.min(user.max_wave, 10),
      target: 10,
      completed: user.max_wave >= 10,
      rewardGold: 100,
    },
    {
      id: 'task_login_3',
      name: '常客',
      description: '累计登录 3 天',
      progress: Math.min(activityModel.getTotalSignInCount(userId), 3),
      target: 3,
      completed: activityModel.getTotalSignInCount(userId) >= 3,
      rewardGold: 60,
    },
    {
      id: 'task_gold_500',
      name: '小富翁',
      description: '累计获得 500 金币',
      progress: Math.min(user.gold, 500),
      target: 500,
      completed: user.gold >= 500,
      rewardGold: 40,
    },
  ];

  return tasks;
}
