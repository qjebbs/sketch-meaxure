import { setConfigs } from '../state/config';
import { context } from '../state/context';
import { SMPanel } from './panel';
export function propertiesPanel() {
    var self = this, data = ( /*this.*/context.configs.properties) ? /*this.*/ context.configs.properties : {
        placement: "top",
        properties: ["color", "border"]
    };
    return /*this.*/ SMPanel({
        url: /*this.*/ context.resourcesRoot + "/panel/properties.html",
        width: 280,
        height: 356,
        data: data,
        callback: function (data) {
            /*self.*/ context.configs = /*self.*/ setConfigs({
            properties: data
        });
        }
    });
}
