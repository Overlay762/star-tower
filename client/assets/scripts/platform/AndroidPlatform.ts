import { IPlatformService, UserInfo } from './IPlatformService';

// Android 平台实现（骨架，未来通过 JSBridge 调用原生能力）
export class AndroidPlatform implements IPlatformService {
  private userInfo: UserInfo | null = null;

  async login(): Promise<UserInfo> {
    console.log('[AndroidPlatform] login - 待接入 Android SDK');
    this.userInfo = { id: Date.now(), username: 'Android_Player', gold: 100, level: 1 };
    return this.userInfo;
  }

  getUserInfo(): UserInfo | null { return this.userInfo; }
  saveData(key: string, data: string): void { console.log('[Android] saveData:', key); }
  loadData(key: string): string | null { return null; }
  removeData(key: string): void {}
  share(title: string, desc: string): void {}
  getPlatformName(): string { return 'Android'; }
}
