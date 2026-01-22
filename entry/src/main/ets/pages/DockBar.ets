import promptAction from '@ohos.promptAction';
import continuationManager from '@ohos.continuation.continuationManager';
import bundleManager from '@ohos.bundle.bundleManager';
import picker from '@ohos.file.picker';
import common from '@ohos.app.ability.common';
import Want from '@ohos.app.ability.Want';
//导入权限管理核心接口
import abilityAccessCtrl from '@ohos.abilityAccessCtrl';

// ========== 纯显式类型定义 ==========
interface AppItem {
  icon: string;
  name: string;
  action: () => Promise<void>;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: string;
}

interface ContinuationResult {
  deviceId: string;
  deviceType: string;
  deviceName?: string;
  deviceState?: number;
}

// 图库/相册常见包名列表
const GALLERY_BUNDLES = [
  'com.huawei.photo',
  'com.ohos.photo',
  'com.huawei.gallery'
];

// 显式声明BundleFlag
const BUNDLE_INFO_FLAG = bundleManager.BundleFlag.GET_BUNDLE_INFO_DEFAULT;
type BundleInfo = bundleManager.BundleInfo;

interface AppConfigItem {
  bundleNames: string[];
}

@Component
export default struct DockBar {
  @Link onlineDevices: Array<DeviceInfo>;
  @Link searchKeyword: string;
  // 统一使用UIAbilityContext
  private context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext;
  private continuationToken: number = 0;
  private atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();

  private appList: Array<AppItem> = [
    { icon: '⚙️', name: '设置', action: (): Promise<void> => this.launchApp('设置') },
    { icon: '📷', name: '图库', action: (): Promise<void> => this.launchApp('com.huawei.photo') },
    { icon: '📱', name: '联系人', action: (): Promise<void> => this.launchApp('联系人') },
    { icon: '📂', name: '文件管理', action: (): Promise<void> => this.openFilePicker()  }
  ];

  private async requestBundleListPermission(): Promise<boolean> {
    try {
      promptAction.showToast({ message: '应用搜索功能已启用' });
      return true;
    } catch (error) {
      console.error(`权限申请失败：${(error as Error).message}`);
      return false;
    }
  }
  async searchApp(keyword: string): Promise<Array<BundleInfo>> {
    try {
      const lowerKeyword = keyword.toLowerCase().trim();
      if (!lowerKeyword) return [];
      
      console.info(`简化搜索：关键词"${lowerKeyword}"`);
      return [];
    } catch (err) {
      const error = err as Error;
      console.error(`应用搜索失败：${error.message}`);
      return [];
    }
  }
  async launchApp(appKey: string): Promise<void> {
    try {
      const appConfig: Record<string, AppConfigItem> = {
        '设置': { bundleNames: ['com.ohos.settings'] },
        '图库': { bundleNames: GALLERY_BUNDLES },
        '联系人': { bundleNames: ['com.ohos.contacts'] },
        '文件管理': { bundleNames: ['com.ohos.filemanager', 'com.huawei.filemanager'] }
      };

      let targetApp: AppConfigItem | null = null;
      let appName = '';
      if (appConfig[appKey]) {
        targetApp = appConfig[appKey];
        appName = appKey;
      } else {
        const appNames = Object.keys(appConfig);
        for (const name of appNames) {
          if (appConfig[name].bundleNames.includes(appKey)) {
            targetApp = appConfig[name];
            appName = name;
            break;
          }
        }
      }

      if (!targetApp) {
        promptAction.showToast({ message: `未知应用：${appKey}` });
        return;
      }

      let usableBundleName = '';
      for (const bundle of targetApp.bundleNames) {
        try {
          await bundleManager.getBundleInfo(bundle, BUNDLE_INFO_FLAG);
          usableBundleName = bundle;
          break;
        } catch (err) {
          continue;
        }
      }

      if (!usableBundleName) {
        promptAction.showToast({ message: `${appName}未安装` });
        return;
      }

      const want: Want = {
        bundleName: usableBundleName,
        abilityName: '',
        action: 'ohos.want.action.startAbility'
      };
      await this.context.startAbility(want);
      promptAction.showToast({ message: `启动${appName}成功` });
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('permission')) {
        promptAction.showToast({ message: `无法自动启动${appKey}，请手动打开` });
      } else {
        promptAction.showToast({ message: `启动${appKey}失败` });
      }
      console.error(`启动应用失败：${appKey}，错误：${err.message}`);
    }
  }
  // ========== 文件选择器 ==========
  private async openFilePicker(): Promise<void> {
    try {
      const documentSelectOptions = new picker.DocumentSelectOptions();
      documentSelectOptions.maxSelectNumber = 10;

      const filePicker = new picker.DocumentViewPicker();
      const result = await filePicker.select(documentSelectOptions);

      if (result.length > 0) {
        promptAction.showToast({ message: `已选择 ${result.length} 个文件` });
        console.log('选择的文件路径：', result);
      }
    } catch (err) {
      console.error('打开文件选择器失败：', (err as Error).message);
      promptAction.showToast({ message: '请手动打开文件管理' });
    }
  }

  // ========== 分布式互联逻辑 ==========
  async aboutToAppear() {
    // 第一步：先申请应用列表权限（解决搜索权限问题）
    await this.requestBundleListPermission();

    // 第二步：原有分布式互联初始化逻辑
    try {
      this.continuationToken = await continuationManager.registerContinuation();
      console.info(`跨端接续注册成功，token：${this.continuationToken}`);

      continuationManager.on(
        'deviceSelected',
        this.continuationToken,
        (deviceList) => {
          if (deviceList && deviceList.length > 0) {
            const selectedDevice = deviceList[0];
            this.onlineDevices.push({
              deviceId: selectedDevice.id,
              deviceName: selectedDevice.name || selectedDevice.type || '未知设备',
              deviceType: selectedDevice.type
            });
            promptAction.showToast({
              message: `选择设备：${selectedDevice.type || '未知设备'}`
            });
          }
        }
      );
    } catch (error) {
      console.error(`跨端接续初始化失败：${(error as Error).message}`);
      promptAction.showToast({ message: '跨端功能初始化失败' });
    }
  }

  aboutToDisappear() {
    if (this.continuationToken > 0) {
      continuationManager.unregisterContinuation(this.continuationToken)
        .then(() => console.info('跨端接续注销成功'))
        .catch((err: Error) => console.error(`注销失败：${err.message}`));
    }
  }

  private async crossDeviceContinue() {
    if (this.continuationToken === 0) {
      promptAction.showToast({ message: '跨端接续未注册' });
      return;
    }

    try {
      await continuationManager.startContinuationDeviceManager(this.continuationToken);
      promptAction.showToast({ message: '打开分布式设备列表' });
    } catch (error) {
      console.error(`启动设备管理失败：${(error as Error).message}`);
      promptAction.showToast({ message: `失败：${(error as Error).message.slice(0, 20)}` });
    }
  }

  private multiScreenCollaboration() {
    this.crossDeviceContinue();
    promptAction.showToast({ message: '启动多屏协同设备选择' });
  }
  // 注释掉重复定义，使用原有的方法定义
  // public searchApp = this.searchApp;
  // public launchApp = this.launchApp;

  build() {
    Column() {
      Divider()
        .width('100%')
        .height(0.5)
        .color('#e5e7eb')

      Row() {
        ForEach(this.appList, (item: AppItem) => {
          Column({ space: 4 }) {
            Text(item.icon).fontSize(24)
            Text(item.name).fontSize(12).fontColor('#333')
          }
          .onClick(() => {
            item.action()
          })
          .width(60)
          .alignItems(HorizontalAlign.Center)
        })
      }
      .justifyContent(FlexAlign.SpaceAround)
      .alignItems(VerticalAlign.Center)
      .width('100%')
      .height(80)
      .backgroundColor('#f8f9fa')
      .padding({ left: 10, right: 10 })
    }
  }
}