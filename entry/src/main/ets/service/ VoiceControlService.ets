import notification from '@ohos.notificationManager';
import bundle from '@ohos.bundle';
import { BusinessError } from '@ohos.base';

// 显式定义应用信息类型
interface AppInfo {
  bundleName: string;
  label: string;
}

export class VoiceControlService {
  private isListening: boolean = false;
  private mockAppList: Array<AppInfo> = [
    { bundleName: 'com.ohos.settings', label: '设置' },
    { bundleName: 'com.ohos.photos', label: '相册' },
    { bundleName: 'com.ohos.browser', label: '浏览器' }
  ];

  async startListening(): Promise<void> {
    if (this.isListening) return;
    this.isListening = true;
    console.info('模拟语音监听已启动（无硬件依赖）');
  }

  async stopListening(): Promise<void> {
    if (!this.isListening) return;
    this.isListening = false;
    console.info('模拟语音监听已停止');
  }

  private async handleVoiceCommand(command: string): Promise<void> {
    try {
      if (command.includes('打开')) {
        const appName: string = command.replace('打开', '').trim();
        await this.launchAppByName(appName);
        this.showNotification(`已尝试打开${appName}`);
      } else if (command.includes('搜索')) {
        const keyword: string = command.replace('搜索', '').trim();
        console.info(`执行搜索指令，关键词：${keyword}`);
        this.showNotification(`正在搜索${keyword}`);
      }
    } catch (error) {
      console.error('处理语音指令失败:', (error as BusinessError).message);
    }
  }

  private async launchAppByName(appName: string): Promise<void> {
    if (!appName) return;
    try {
      const targetApp: AppInfo | undefined = this.mockAppList.find((info: AppInfo) => info.label.includes(appName));
      if (targetApp) {
        console.info(`模拟启动应用：${targetApp.label}（包名：${targetApp.bundleName}）`);
      } else {
        this.showNotification(`未找到应用：${appName}`);
      }
    } catch (error) {
      console.error('启动应用失败:', (error as BusinessError).message);
    }
  }

  private showNotification(content: string): void {
    try {
      notification.publish({
        content: {
          contentType: 1,
          normal: {
            title: 'Launcher语音助手',
            text: content
          }
        },
        id: Math.floor(Math.random() * 10000)
      });
    } catch (error) {
      console.error('发送通知失败:', (error as BusinessError).message);
    }
  }
}

export const voiceControlService = new VoiceControlService();