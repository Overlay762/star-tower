import { IPlatformService } from './IPlatformService';
import { WebPlatform } from './WebPlatform';
import { WechatPlatform } from './WechatPlatform';
import { AndroidPlatform } from './AndroidPlatform';
import { IOSPlatform } from './IOSPlatform';

// 平台管理器（单例）
export class PlatformManager {
  private static instance: PlatformManager;
  private platform: IPlatformService;

  private constructor() {
    this.platform = this.detectPlatform();
    console.log(`[PlatformManager] 当前平台: ${this.platform.getPlatformName()}`);
  }

  static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
    }
    return PlatformManager.instance;
  }

  // 检测当前运行平台
  private detectPlatform(): IPlatformService {
    // 微信小游戏环境检测
    if (typeof wx !== 'undefined' && typeof wx.login === 'function') {
      return new WechatPlatform();
    }

    // Android 原生环境检测
    if (typeof jsb !== 'undefined' && this.isAndroid()) {
      return new AndroidPlatform();
    }

    // iOS 原生环境检测
    if (typeof jsb !== 'undefined' && this.isIOS()) {
      return new IOSPlatform();
    }

    // 默认 Web 平台
    return new WebPlatform();
  }

  private isAndroid(): boolean {
    return false; // 实际接入时需检测
  }

  private isIOS(): boolean {
    return false; // 实际接入时需检测
  }

  // 获取平台实例
  getPlatform(): IPlatformService {
    return this.platform;
  }
}

// 声明全局变量
declare const wx: any;
declare const jsb: any;
