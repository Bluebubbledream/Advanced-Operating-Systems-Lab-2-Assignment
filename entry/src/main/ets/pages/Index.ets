import DockBar from './DockBar';
import type { DeviceInfo } from './DockBar';
import promptAction from '@ohos.promptAction';
// 导入Stage模式正确的上下文类型
import type { Context } from '@ohos.abilityAccessCtrl';
// 修复：导入BundleInfo类型，匹配DockBar的搜索结果
import bundleManager from '@ohos.bundle.bundleManager';

// 搜索结果项的接口定义
interface SearchResultItem {
  name: string; // 应用名
  bundle: string; // 包名
}

@Entry
@Component
struct LauncherDesktop {
  @State onlineDevices: Array<DeviceInfo> = [
    { deviceId: 'local_device_01', deviceName: '测试', deviceType: 'Laptop' }
  ];
  @State searchKeyword: string = '';
  @State searchResults: Array<SearchResultItem> = [];
  @State isSearching: boolean = false;
  private context: Context = getContext(this) as Context;
  private dockBar: DockBar | null = null;

  build() {
    Column({ space: 15 }) {
      // 替换suffix为Row布局
      // 搜索栏 + 搜索按钮 组合布局
      Row({ space: 10 }) {
        TextInput({ placeholder: '🔍 搜索应用/文件/互联设备' })
          .flexGrow(1) // 占满剩余宽度
          .height(48)
          .backgroundColor('#f0f2f5')
          .borderRadius(24)
          .padding({ left: 20, right: 20 })
          .fontSize(16)
          .onChange((value) => {
            this.searchKeyword = value.trim();
            if (!this.searchKeyword) {
              this.searchResults = [];
            }
          })
          .onSubmit(async () => {
            await this.handleSearch();
          });

        // 搜索按钮
        Button('搜索')
          .width(60)
          .height(32)
          .backgroundColor('#007dff')
          .borderRadius(16)
          .fontColor('#fff')
          .fontSize(14)
          .onClick(async () => {
            await this.handleSearch();
          });
      }
      .width('92%') // 保持原宽度
      .alignItems(VerticalAlign.Center);

      // 设备提示（逻辑不变）
      if (this.onlineDevices.length > 0) {
        Text(`📱 已发现 ${this.onlineDevices.length} 台分布式设备`)
          .fontSize(15)
          .fontColor('#007dff')
          .margin({ top: 10 })
          .textAlign(TextAlign.Center);
      }

      // 搜索结果区域
      if (this.isSearching) {
        Text('🔍 正在搜索...')
          .fontSize(16)
          .fontColor('#666')
          .margin({ top: 20 })
          .textAlign(TextAlign.Center);
      } else if (this.searchKeyword && this.searchResults.length > 0) {
        List() {
          ForEach(this.searchResults, (item: SearchResultItem) => {
            ListItem() {
              Row({ space: 10 }) {
                Text('📱').fontSize(20)
                Column({ space: 4 }) {
                  Text(item.name).fontSize(16).fontColor('#333')
                  Text(`包名：${item.bundle}`).fontSize(12).fontColor('#999')
                }.flexGrow(1)
                Button('启动')
                  .width(60)
                  .height(32)
                  .borderRadius(16)
                  .fontSize(14)
                  .onClick(async () => {
                    await this.dockBar?.launchApp(item.bundle);
                  })
              }
              .padding({ left: 15, right: 15, top: 10, bottom: 10 })
              .backgroundColor('#fff')
              .borderRadius(12)
              .margin({ bottom: 8 })
            }
          })
        }
        .width('92%')
        .height('auto')
        .flexGrow(1)
        .margin({ top: 10 });
      } else if (this.searchKeyword && this.searchResults.length === 0) {
        Text(`❌ 未找到“${this.searchKeyword}”相关应用`)
          .fontSize(16)
          .fontColor('#666')
          .margin({ top: 20 })
          .textAlign(TextAlign.Center);
      } else {
        Column()
          .flexGrow(1)
          .width('100%')
          .justifyContent(FlexAlign.Center) {
          Text('桌面应用区域').fontSize(18).fontColor('#666').textAlign(TextAlign.Center);
          Text('输入关键词搜索已安装应用').fontSize(14).fontColor('#999').margin({ top: 10 }).textAlign(TextAlign.Center);
        }
      }
      DockBar({
        onlineDevices: $onlineDevices,
        searchKeyword: $searchKeyword
      })
    }
    .width('100%')
    .height('100%')
    .padding({ top: 20 })
    .backgroundColor('#f5f7fa');
  }

  private async handleSearch() {
    if (!this.searchKeyword) {
      promptAction.showToast({ message: '请输入搜索关键词' });
      return;
    }
    this.isSearching = true;
    try {
      const results = await this.dockBar?.searchApp(this.searchKeyword) || [];
      // 格式化结果
      this.searchResults = results.map((item: bundleManager.BundleInfo) => ({
        name: item.name || '', // 使用name属性作为应用名
        bundle: item.name // 包名
      } as SearchResultItem));
      promptAction.showToast({ message: `找到${this.searchResults.length}个相关应用` });
    } catch (error) {
      this.searchResults = [];
      promptAction.showToast({ message: '搜索失败，请重试' });
      console.error(`搜索错误：${(error as Error).message}`);
    } finally {
      this.isSearching = false;
    }
  }
}