// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { context } from '../common/context';
import { createWebviewPanel } from '../../webviewPanel';
import { logger } from '../common/logger';
import { getResourcePath } from '../helpers/helper';
import { getLanguage } from '../common/language';

export function propertiesPanel() {
    let panel = createWebviewPanel({
        identifier: 'co.jebbs.sketch-meaxure.properties',
        url: getResourcePath() + "/panel/properties.html",
        width: 280,
        height: 296,
    });
    if (!panel) return false;

    let data = {
        language: getLanguage(),
        // placement: context.runningConfig.placement ? context.runningConfig.placement : "top",
        properties: context.configs.properties && context.configs.properties.length ? context.configs.properties : ["color", "border"],
    };
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
