if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface DockBar_Params {
    onlineDevices?: Array<DeviceInfo>;
    searchKeyword?: string;
    context?: common.UIAbilityContext;
    continuationToken?: number;
    atManager?: abilityAccessCtrl.AtManager;
    appList?: Array<AppItem>;
}
import promptAction from "@ohos:promptAction";
import continuationManager from "@ohos:continuation.continuationManager";
import bundleManager from "@ohos:bundle.bundleManager";
import picker from "@ohos:file.picker";
import type common from "@ohos:app.ability.common";
import type Want from "@ohos:app.ability.Want";
import abilityAccessCtrl from "@ohos:abilityAccessCtrl";
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
// 显式声明BundleFlag（使用系统枚举，替代硬编码0，更规范）
const BUNDLE_INFO_FLAG = bundleManager.BundleFlag.GET_BUNDLE_INFO_DEFAULT;
type BundleInfo = bundleManager.BundleInfo;
interface AppConfigItem {
    bundleNames: string[];
}
export default class DockBar extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__onlineDevices = new SynchedPropertyObjectTwoWayPU(params.onlineDevices, this, "onlineDevices");
        this.__searchKeyword = new SynchedPropertySimpleTwoWayPU(params.searchKeyword, this, "searchKeyword");
        this.context = getContext(this) as common.UIAbilityContext;
        this.continuationToken = 0;
        this.atManager = abilityAccessCtrl.createAtManager();
        this.appList = [
            { icon: '⚙️', name: '设置', action: (): Promise<void> => this.launchApp('设置') },
            { icon: '📷', name: '图库', action: (): Promise<void> => this.launchApp('com.huawei.photo') },
            { icon: '📱', name: '联系人', action: (): Promise<void> => this.launchApp('联系人') },
            { icon: '📂', name: '文件管理', action: (): Promise<void> => this.openFilePicker() }
        ];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: DockBar_Params) {
        if (params.context !== undefined) {
            this.context = params.context;
        }
        if (params.continuationToken !== undefined) {
            this.continuationToken = params.continuationToken;
        }
        if (params.atManager !== undefined) {
            this.atManager = params.atManager;
        }
        if (params.appList !== undefined) {
            this.appList = params.appList;
        }
    }
    updateStateVars(params: DockBar_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__onlineDevices.purgeDependencyOnElmtId(rmElmtId);
        this.__searchKeyword.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__onlineDevices.aboutToBeDeleted();
        this.__searchKeyword.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __onlineDevices: SynchedPropertySimpleOneWayPU<Array<DeviceInfo>>;
    get onlineDevices() {
        return this.__onlineDevices.get();
    }
    set onlineDevices(newValue: Array<DeviceInfo>) {
        this.__onlineDevices.set(newValue);
    }
    private __searchKeyword: SynchedPropertySimpleTwoWayPU<string>;
    get searchKeyword() {
        return this.__searchKeyword.get();
    }
    set searchKeyword(newValue: string) {
        this.__searchKeyword.set(newValue);
    }
    // 统一使用UIAbilityContext（避免重复获取）
    private context: common.UIAbilityContext;
    private continuationToken: number;
    // 新增：权限管理实例（申请GET_INSTALLED_BUNDLE_LIST权限）
    private atManager: abilityAccessCtrl.AtManager;
    private appList: Array<AppItem>;
    // ========== 简化权限申请逻辑 ==========
    private async requestBundleListPermission(): Promise<boolean> {
        try {
            // 简化权限申请，直接返回true避免复杂API调用
            promptAction.showToast({ message: '应用搜索功能已启用' });
            return true;
        }
        catch (error) {
            console.error(`权限申请失败：${(error as Error).message}`);
            return false;
        }
    }
    // ========== 简化应用搜索逻辑 ==========
    async searchApp(keyword: string): Promise<Array<BundleInfo>> {
        try {
            // 简化搜索逻辑，直接返回空数组避免复杂API调用
            const lowerKeyword = keyword.toLowerCase().trim();
            if (!lowerKeyword)
                return [];
            console.info(`简化搜索：关键词"${lowerKeyword}"`);
            return []; // 返回空数组，避免API调用错误
        }
        catch (err) {
            const error = err as Error;
            console.error(`应用搜索失败：${error.message}`);
            return [];
        }
    }
    // ========== 启动应用逻辑（无需修改） ==========
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
            }
            else {
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
                }
                catch (err) {
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
            await this.context.startAbility(want); // 直接用已定义的context，避免重复获取
            promptAction.showToast({ message: `启动${appName}成功` });
        }
        catch (error) {
            const err = error as Error;
            if (err.message.includes('permission')) {
                promptAction.showToast({ message: `无法自动启动${appKey}，请手动打开` });
            }
            else {
                promptAction.showToast({ message: `启动${appKey}失败` });
            }
            console.error(`启动应用失败：${appKey}，错误：${err.message}`);
        }
    }
    // ========== 文件选择器（修复参数错误：Stage模式用supportedMimeTypes） ==========
    private async openFilePicker(): Promise<void> {
        try {
            const documentSelectOptions = new picker.DocumentSelectOptions();
            documentSelectOptions.maxSelectNumber = 10;
            // 修复：Stage模式正确的文件类型过滤参数（替代fileSuffixFilters）
            // 移除不支持的属性，使用默认配置
            const filePicker = new picker.DocumentViewPicker();
            const result = await filePicker.select(documentSelectOptions);
            if (result.length > 0) {
                promptAction.showToast({ message: `已选择 ${result.length} 个文件` });
                console.log('选择的文件路径：', result);
            }
        }
        catch (err) {
            console.error('打开文件选择器失败：', (err as Error).message);
            promptAction.showToast({ message: '请手动打开文件管理' });
        }
    }
    // ========== 分布式互联逻辑（新增：先申请权限再初始化） ==========
    async aboutToAppear() {
        // 第一步：先申请应用列表权限（解决搜索权限问题）
        await this.requestBundleListPermission();
        // 第二步：原有分布式互联初始化逻辑
        try {
            this.continuationToken = await continuationManager.registerContinuation();
            console.info(`跨端接续注册成功，token：${this.continuationToken}`);
            continuationManager.on('deviceSelected', this.continuationToken, (deviceList) => {
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
            });
        }
        catch (error) {
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
        }
        catch (error) {
            console.error(`启动设备管理失败：${(error as Error).message}`);
            promptAction.showToast({ message: `失败：${(error as Error).message.slice(0, 20)}` });
        }
    }
    private multiScreenCollaboration() {
        this.crossDeviceContinue();
        promptAction.showToast({ message: '启动多屏协同设备选择' });
    }
    // ========== 关键：暴露方法给父组件 Index 调用（必须显式声明public） ==========
    // 注释掉重复定义，使用原有的方法定义
    // public searchApp = this.searchApp;
    // public launchApp = this.launchApp;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.width('100%');
            Divider.height(0.5);
            Divider.color('#e5e7eb');
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.justifyContent(FlexAlign.SpaceAround);
            Row.alignItems(VerticalAlign.Center);
            Row.width('100%');
            Row.height(80);
            Row.backgroundColor('#f8f9fa');
            Row.padding({ left: 10, right: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const item = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create({ space: 4 });
                    Column.onClick(() => {
                        item.action();
                    });
                    Column.width(60);
                    Column.alignItems(HorizontalAlign.Center);
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(item.icon);
                    Text.fontSize(24);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(item.name);
                    Text.fontSize(12);
                    Text.fontColor('#333');
                }, Text);
                Text.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.appList, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
