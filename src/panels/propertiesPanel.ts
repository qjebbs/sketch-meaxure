import { context } from '../state/context';
import { SMPanel } from './panel';
import { logger } from '../api/logger';
export function propertiesPanel() {
    var data = {
        placement: context.runningConfig.placement ? context.runningConfig.placement : "top",
        properties: context.configs.properties && context.configs.properties.length ? context.configs.properties : ["color", "border"],
    };
    return SMPanel({
        url: context.resourcesRoot + "/panel/properties.html",
        width: 280,
        height: 356,
        data: data,
        callback: function (data) {
            logger.debug("properties panel returned", data);
            context.configs.properties = data.properties;
            context.runningConfig.placement = data.placement;
        }
    });
}
