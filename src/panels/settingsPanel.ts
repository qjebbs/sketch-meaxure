import { context } from '../state/context';
import { createWebviewPanel } from '../webviewPanel';

interface SettingData {
    language?: string;
    scale: number;
    units: string;
    colorFormat: string;
}

export function settingsPanel() {
    let data: any = {};
    data.language = context.languageData;
    if (context.configs) {
        data.scale = context.configs.scale;
        data.units = context.configs.units;
        data.colorFormat = context.configs.format;
    }
    let panel = createWebviewPanel({
        url: context.resourcesRoot + "/panel/settings.html",
        width: 240,
        height: 316,
    });
    panel.onWebviewDOMReady(() => panel.postMessage(data));
    panel.onDidReceiveMessage<SettingData>((data) => {
        context.configs.scale = data.scale;
        context.configs.units = data.units;
        context.configs.format = data.colorFormat;
        panel.close();
    });
    panel.showModal();
}
