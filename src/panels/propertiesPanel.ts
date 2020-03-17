import { context } from '../state/context';
import { createWebviewPanel } from '../webviewPanel';

export function propertiesPanel() {
    let data = {
        language: context.languageData,
        // placement: context.runningConfig.placement ? context.runningConfig.placement : "top",
        properties: context.configs.properties && context.configs.properties.length ? context.configs.properties : ["color", "border"],
    };

    let isCanceled = true;
    let panel = createWebviewPanel({
        url: context.resourcesRoot + "/panel/properties.html",
        width: 280,
        height: 296,
    });
    panel.onWebviewDOMReady(() => panel.postMessage(data));
    panel.onDidReceiveMessage<any>((data) => {
        isCanceled = false;
        context.configs.properties = data.properties;
        // context.runningConfig.placement = data.placement;
        panel.close();
    })
    panel.showModal();
    return !isCanceled;
}
