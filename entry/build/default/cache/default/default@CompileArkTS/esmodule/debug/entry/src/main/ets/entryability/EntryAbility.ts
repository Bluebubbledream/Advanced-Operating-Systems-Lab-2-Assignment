import UIAbility from "@ohos:app.ability.UIAbility";
import type window from "@ohos:window";
import hilog from "@ohos:hilog";
import type { BusinessError } from "@ohos:base";
const TAG: string = '[EntryAbility]';
const DOMAIN: number = 0xF000;
export default class EntryAbility extends UIAbility {
    // 移除多余的子窗口缓存（普通应用不需要）
    async onWindowStageCreate(windowStage: window.WindowStage): Promise<void> {
        hilog.info(DOMAIN, TAG, '应用启动，加载主页面');
        try {
            // 直接加载主页面（删除子窗口创建，这是卡住的核心原因）
            await windowStage.loadContent('pages/Index');
            hilog.info(DOMAIN, TAG, '主页面加载成功');
        }
        catch (err) {
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
