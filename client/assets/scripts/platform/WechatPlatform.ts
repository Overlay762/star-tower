import { IPlatformService, UserInfo } from './IPlatformService';

// 微信小游戏平台实现（骨架）
export class WechatPlatform implements IPlatformService {
  private userInfo: UserInfo | null = null;

  async login(): Promise<UserInfo> {
    // 微信小游戏登录
    // 实际接入时需调用 wx.login() 获取 code，然后发往后端换取用户信息
    console.log('[WechatPlatform] login - 待接入微信API');

    this.userInfo = {
      id: Date.now(),
      username: 'WeChat_Player',
      gold: 100,
      level: 1,
    };

    return this.userInfo;
  }

  getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  saveData(key: string, data: string): void {
    // 微信小游戏使用 wx.setStorageSync
    if (typeof wx !== 'undefined' && wx.setStorageSync) {
      wx.setStorageSync('td_' + key, data);
    }
  }

  loadData(key: string): string | null {
    if (typeof wx !== 'undefined' && wx.getStorageSync) {
      return wx.getStorageSync('td_' + key) || null;
    }
    return null;
  }

  removeData(key: string): void {
    if (typeof wx !== 'undefined' && wx.removeStorageSync) {
      wx.removeStorageSync('td_' + key);
    }
  }

  share(title: string, desc: string): void {
    if (typeof wx !== 'undefined' && wx.shareAppMessage) {
      wx.shareAppMessage({ title, imageUrl: '' });
    }
  }

  getPlatformName(): string {
    return 'WeChat';
  }
}

// 声明微信全局变量
declare const wx: any;
