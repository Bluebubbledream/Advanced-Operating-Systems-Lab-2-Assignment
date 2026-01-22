import window from '@ohos.window';
import display from '@ohos.display';
import { BusinessError } from '@ohos.base';

// 显式定义显示结果接口
interface DisplayResult {
  id: number;
  name: string;
  size: string;
}

// 显式定义显示信息接口
interface DisplayInfo {
  displayId: number;
  name: string;
  width: number;
  height: number;
}

export class MultiScreenService {
  private mockDisplayList: Array<DisplayInfo> = [
    { displayId: 0, name: '主屏', width: 1920, height: 1080 },
    { displayId: 1, name: '副屏', width: 1366, height: 768 }
  ];

  async extendToSecondScreen(): Promise<boolean> {
    try {
      const displays = this.mockDisplayList;
      if (displays.length <= 1) {
        console.info('未检测到副屏设备');
        return false;
      }
      const secondDisplay = displays[1];
      console.info(`检测到副屏：${secondDisplay.name}，分辨率${secondDisplay.width}x${secondDisplay.height}`);
      return true;
    } catch (error) {
      console.error('多屏扩展失败:', (error as BusinessError).message);
      return false;
    }
  }

  async getDisplayInfo(): Promise<Array<DisplayResult>> {
    try {
      const displays = this.mockDisplayList;
      // 关键修复：显式断言返回值为 DisplayResult 类型
      return displays.map((disp: DisplayInfo): DisplayResult => ({
        id: disp.displayId,
        name: disp.name,
        size: `${disp.width}x${disp.height}`
      }));
    } catch (error) {
      console.error('获取显示屏信息失败:', (error as BusinessError).message);
      return [];
    }
  }
}

export const multiScreenService = new MultiScreenService();