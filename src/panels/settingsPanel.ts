import { context } from '../state/context';
import { createWebviewPanel, WebviewPanel } from '../webviewPanel';
import { logger } from '../api/logger';

interface SettingData {
    language?: string;
    scale: number;
    units: string;
    colorFormat: string;
}

export function settingsPanel() {
    let identifier = 'co.jebbs.sketch-meaxure.settings';
    if (WebviewPanel.exists(identifier)) return false;

    let data: any = {};
    data.language = context.languageData;
    if (context.configs) {
        data.scale = context.configs.scale;
        data.units = context.configs.units;
        data.colorFormat = context.configs.format;
    }
    let panel = createWebviewPanel({
        identifier: identifier,
        url: context.resourcesRoot + "/panel/settings.html",
        width: 240,
        height: 316,
    });
    panel.onDidReceiveMessage('init', () => data);
    panel.onDidReceiveMessage<SettingData>('submit', data => {
        context.configs.scale = data.scale;
        context.configs.units = data.units;
        context.configs.format = data.colorFormat;
        panel.close();
    });
    panel.show();
}
