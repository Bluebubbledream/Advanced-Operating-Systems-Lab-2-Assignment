import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { window } from '@kit.ArkUI';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { BusinessError } from '@kit.BasicServicesKit';

const TAG: string = '[EntryAbility]';
const DOMAIN: number = 0xF000;

export default class EntryAbility extends UIAbility {
  // 移除多余的子窗口缓存
  async onWindowStageCreate(windowStage: window.WindowStage): Promise<void> {
    hilog.info(DOMAIN, TAG, '应用启动，加载主页面');
    try {
      // 直接加载主页面,删除子窗口创建，解决卡死
      await windowStage.loadContent('pages/Index');
      hilog.info(DOMAIN, TAG, '主页面加载成功');
    } catch (err) {
      const error = err as BusinessError;
      hilog.error(DOMAIN, TAG, `页面加载失败: Code=${error.code}, Message=${error.message}`);
    }
  }

  onWindowStageDestroy(): void {
    hilog.info(DOMAIN, TAG, '窗口阶段销毁');
  }

  onForeground(): void {
    hilog.info(DOMAIN, TAG, '应用回到前台');
  }

  onBackground(): void {
    hilog.info(DOMAIN, TAG, '应用进入后台');
  }

  onDestroy(): void {
    hilog.info(DOMAIN, TAG, 'Ability实例销毁');
  }
}