import { context } from '../common/context';
import { createWebviewPanel, WebviewPanel } from '../../webviewPanel';
import { logger } from '../common/logger';

export function propertiesPanel() {
    let identifier = 'co.jebbs.sketch-meaxure.properties';
    if (WebviewPanel.exists(identifier)) return false;

    let data = {
        language: context.languageData,
        // placement: context.runningConfig.placement ? context.runningConfig.placement : "top",
        properties: context.configs.properties && context.configs.properties.length ? context.configs.properties : ["color", "border"],
    };

    let panel = createWebviewPanel({
        identifier: 'co.jebbs.sketch-meaxure.properties',
        url: context.resourcesRoot + "/panel/properties.html",
        width: 280,
        height: 296,
    });
    panel.onDidReceiveMessage('init', () => data);
    return new Promise<boolean>((resolve, reject) => {
        panel.onClose(() => resolve(false));
        panel.onDidReceiveMessage<any>('submit', (data) => {
            context.configs.properties = data.properties;
            // context.runningConfig.placement = data.placement;
            resolve(true)
            panel.close();
        });
        panel.show();
    });
}
