if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface LauncherDesktop_Params {
    onlineDevices?: Array<DeviceInfo>;
    searchKeyword?: string;
    searchResults?: Array<SearchResultItem>;
    isSearching?: boolean;
    context?: Context;
    dockBar?: DockBar | null;
}
import DockBar from "@normalized:N&&&entry/src/main/ets/pages/DockBar&";
import type { DeviceInfo } from "@normalized:N&&&entry/src/main/ets/pages/DockBar&";
import promptAction from "@ohos:promptAction";
import type { Context } from "@ohos:abilityAccessCtrl";
import type bundleManager from "@ohos:bundle.bundleManager";
// 搜索结果项的接口定义（适配真实BundleInfo结构）
interface SearchResultItem {
    name: string; // 应用名
    bundle: string; // 包名
}
class LauncherDesktop extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__onlineDevices = new ObservedPropertyObjectPU([
            { deviceId: 'local_device_01', deviceName: '测试', deviceType: 'Laptop' }
        ], this, "onlineDevices");
        this.__searchKeyword = new ObservedPropertySimplePU('', this, "searchKeyword");
        this.__searchResults = new ObservedPropertyObjectPU([], this, "searchResults");
        this.__isSearching = new ObservedPropertySimplePU(false, this, "isSearching");
        this.context = getContext(this) as Context;
        this.dockBar = null;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: LauncherDesktop_Params) {
        if (params.onlineDevices !== undefined) {
            this.onlineDevices = params.onlineDevices;
        }
        if (params.searchKeyword !== undefined) {
            this.searchKeyword = params.searchKeyword;
        }
        if (params.searchResults !== undefined) {
            this.searchResults = params.searchResults;
        }
        if (params.isSearching !== undefined) {
            this.isSearching = params.isSearching;
        }
        if (params.context !== undefined) {
            this.context = params.context;
        }
        if (params.dockBar !== undefined) {
            this.dockBar = params.dockBar;
        }
    }
    updateStateVars(params: LauncherDesktop_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__onlineDevices.purgeDependencyOnElmtId(rmElmtId);
        this.__searchKeyword.purgeDependencyOnElmtId(rmElmtId);
        this.__searchResults.purgeDependencyOnElmtId(rmElmtId);
        this.__isSearching.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__onlineDevices.aboutToBeDeleted();
        this.__searchKeyword.aboutToBeDeleted();
        this.__searchResults.aboutToBeDeleted();
        this.__isSearching.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __onlineDevices: ObservedPropertyObjectPU<Array<DeviceInfo>>;
    get onlineDevices() {
        return this.__onlineDevices.get();
    }
    set onlineDevices(newValue: Array<DeviceInfo>) {
        this.__onlineDevices.set(newValue);
    }
    private __searchKeyword: ObservedPropertySimplePU<string>;
    get searchKeyword() {
        return this.__searchKeyword.get();
    }
    set searchKeyword(newValue: string) {
        this.__searchKeyword.set(newValue);
    }
    private __searchResults: ObservedPropertyObjectPU<Array<SearchResultItem>>;
    get searchResults() {
        return this.__searchResults.get();
    }
    set searchResults(newValue: Array<SearchResultItem>) {
        this.__searchResults.set(newValue);
    }
    private __isSearching: ObservedPropertySimplePU<boolean>;
    get isSearching() {
        return this.__isSearching.get();
    }
    set isSearching(newValue: boolean) {
        this.__isSearching.set(newValue);
    }
    private context: Context;
    private dockBar: DockBar | null;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.width('100%');
            Column.height('100%');
            Column.padding({ top: 20 });
            Column.backgroundColor('#f5f7fa');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 替换suffix为Row布局
            // 搜索栏 + 搜索按钮 组合布局
            Row.create({ space: 10 });
            // 替换suffix为Row布局
            // 搜索栏 + 搜索按钮 组合布局
            Row.width('92%');
            // 替换suffix为Row布局
            // 搜索栏 + 搜索按钮 组合布局
            Row.alignItems(VerticalAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '🔍 搜索应用/文件/互联设备' });
            TextInput.flexGrow(1);
            TextInput.height(48);
            TextInput.backgroundColor('#f0f2f5');
            TextInput.borderRadius(24);
            TextInput.padding({ left: 20, right: 20 });
            TextInput.fontSize(16);
            TextInput.onChange((value) => {
                this.searchKeyword = value.trim();
                if (!this.searchKeyword) {
                    this.searchResults = [];
                }
            });
            TextInput.onSubmit(async () => {
                await this.handleSearch();
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 搜索按钮（替代suffix，无兼容性问题）
            Button.createWithLabel('搜索');
            // 搜索按钮（替代suffix，无兼容性问题）
            Button.width(60);
            // 搜索按钮（替代suffix，无兼容性问题）
            Button.height(32);
            // 搜索按钮（替代suffix，无兼容性问题）
            Button.backgroundColor('#007dff');
            // 搜索按钮（替代suffix，无兼容性问题）
            Button.borderRadius(16);
            // 搜索按钮（替代suffix，无兼容性问题）
            Button.fontColor('#fff');
            // 搜索按钮（替代suffix，无兼容性问题）
            Button.fontSize(14);
            // 搜索按钮（替代suffix，无兼容性问题）
            Button.onClick(async () => {
                await this.handleSearch();
            });
        }, Button);
        // 搜索按钮（替代suffix，无兼容性问题）
        Button.pop();
        // 替换suffix为Row布局
        // 搜索栏 + 搜索按钮 组合布局
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 设备提示（逻辑不变）
            if (this.onlineDevices.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`📱 已发现 ${this.onlineDevices.length} 台分布式设备`);
                        Text.fontSize(15);
                        Text.fontColor('#007dff');
                        Text.margin({ top: 10 });
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                });
            }
            // 搜索结果区域
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 搜索结果区域
            if (this.isSearching) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🔍 正在搜索...');
                        Text.fontSize(16);
                        Text.fontColor('#666');
                        Text.margin({ top: 20 });
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                });
            }
            else if (this.searchKeyword && this.searchResults.length > 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.width('92%');
                        List.height('auto');
                        List.flexGrow(1);
                        List.margin({ top: 10 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const item = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create({ space: 10 });
                                        Row.padding({ left: 15, right: 15, top: 10, bottom: 10 });
                                        Row.backgroundColor('#fff');
                                        Row.borderRadius(12);
                                        Row.margin({ bottom: 8 });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('📱');
                                        Text.fontSize(20);
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create({ space: 4 });
                                        Column.flexGrow(1);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.name);
                                        Text.fontSize(16);
                                        Text.fontColor('#333');
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`包名：${item.bundle}`);
                                        Text.fontSize(12);
                                        Text.fontColor('#999');
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('启动');
                                        Button.width(60);
                                        Button.height(32);
                                        Button.borderRadius(16);
                                        Button.fontSize(14);
                                        Button.onClick(async () => {
                                            await this.dockBar?.launchApp(item.bundle);
                                        });
                                    }, Button);
                                    Button.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.searchResults, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
            else if (this.searchKeyword && this.searchResults.length === 0) {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`❌ 未找到“${this.searchKeyword}”相关应用`);
                        Text.fontSize(16);
                        Text.fontColor('#666');
                        Text.margin({ top: 20 });
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(3, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('桌面应用区域');
                        Text.fontSize(18);
                        Text.fontColor('#666');
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('输入关键词搜索已安装应用');
                        Text.fontSize(14);
                        Text.fontColor('#999');
                        Text.margin({ top: 10 });
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new DockBar(this, {
                        onlineDevices: this.__onlineDevices,
                        searchKeyword: this.__searchKeyword
                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 125, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            onlineDevices: this.onlineDevices,
                            searchKeyword: this.searchKeyword
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "DockBar" });
        }
        Column.pop();
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
                name: item.name || '',
                bundle: item.name // 包名
            } as SearchResultItem));
            promptAction.showToast({ message: `找到${this.searchResults.length}个相关应用` });
        }
        catch (error) {
            this.searchResults = [];
            promptAction.showToast({ message: '搜索失败，请重试' });
            console.error(`搜索错误：${(error as Error).message}`);
        }
        finally {
            this.isSearching = false;
        }
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "LauncherDesktop";
    }
}
registerNamedRoute(() => new LauncherDesktop(undefined, {}), "", { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
