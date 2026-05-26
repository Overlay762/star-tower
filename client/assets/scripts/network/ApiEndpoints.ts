// API 端点常量

const BASE_URL = 'http://localhost:3000/api';

export const ApiEndpoints = {
  // 基础
  BASE_URL,
  HEALTH: `${BASE_URL}/health`,

  // 认证
  AUTH_REGISTER: `${BASE_URL}/auth/register`,
  AUTH_LOGIN: `${BASE_URL}/auth/login`,

  // 用户
  USER_PROFILE: `${BASE_URL}/user/profile`,

  // 存档
  SAVE_SYNC: `${BASE_URL}/save/sync`,
  SAVE_LOAD: `${BASE_URL}/save/load`,

  // 支付
  PAY_RECHARGE: `${BASE_URL}/pay/recharge`,

  // 活动
  ACTIVITY_DAILY: `${BASE_URL}/activity/daily`,
  ACTIVITY_SIGN_STATUS: `${BASE_URL}/activity/sign-status`,
  ACTIVITY_TASKS: `${BASE_URL}/activity/tasks`,

  // 排行榜
  LEADERBOARD_SUBMIT: `${BASE_URL}/leaderboard/submit`,
  LEADERBOARD_WAVES: `${BASE_URL}/leaderboard/waves`,
  LEADERBOARD_ME: `${BASE_URL}/leaderboard/me`,
};
