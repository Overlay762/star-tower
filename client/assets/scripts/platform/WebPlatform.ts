import { IPlatformService, UserInfo } from './IPlatformService';

// Web 平台实现（使用 localStorage）
export class WebPlatform implements IPlatformService {
  private userInfo: UserInfo | null = null;

  async login(): Promise<UserInfo> {
    // 模拟登录 - Web 平台使用本地存储用户
    const savedUser = this.loadData('user_info');
    if (savedUser) {
      this.userInfo = JSON.parse(savedUser);
      return this.userInfo!;
    }

    // 新用户
    this.userInfo = {
      id: Date.now(),
      username: 'Player_' + Math.random().toString(36).substring(2, 8),
      gold: 100,
      level: 1,
    };

    this.saveData('user_info', JSON.stringify(this.userInfo));
    return this.userInfo;
  }

  getUserInfo(): UserInfo | null {
    if (!this.userInfo) {
      const saved = this.loadData('user_info');
      if (saved) {
        this.userInfo = JSON.parse(saved);
      }
    }
    return this.userInfo;
  }

  saveData(key: string, data: string): void {
    localStorage.setItem('td_' + key, data);
  }

  loadData(key: string): string | null {
    return localStorage.getItem('td_' + key);
  }

  removeData(key: string): void {
    localStorage.removeItem('td_' + key);
  }

  share(title: string, desc: string): void {
    // Web 平台使用 navigator.share 或剪贴板
    if (navigator.share) {
      navigator.share({ title, text: desc }).catch(console.error);
    } else {
      // 降级为复制到剪贴板
      navigator.clipboard.writeText(title + ': ' + desc).catch(console.error);
      console.log(`[Share] ${title}: ${desc}`);
    }
  }

  getPlatformName(): string {
    return 'Web';
  }
}
