// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  gold: number;
  level: number;
}

// 平台抽象接口
export interface IPlatformService {
  // 登录
  login(): Promise<UserInfo>;

  // 获取用户信息
  getUserInfo(): UserInfo | null;

  // 保存数据到平台存储
  saveData(key: string, data: string): void;

  // 从平台存储加载数据
  loadData(key: string): string | null;

  // 移除存储数据
  removeData(key: string): void;

  // 分享功能
  share(title: string, desc: string): void;

  // 获取平台标识
  getPlatformName(): string;
}
