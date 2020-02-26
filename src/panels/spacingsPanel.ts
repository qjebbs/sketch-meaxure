import { setConfigs } from '../state/config';
import { context } from '../state/context';
import { SMPanel } from './panel';
export function spacingsPanel() {
    var self = this, data: any = {};
    data.placements = ( /*this.*/context.configs.spacings && /*this.*/ context.configs.spacings.placements) ? /*this.*/ context.configs.spacings.placements : ["top", "left"];
    if ( /*this.*/context.configs.spacings && /*this.*/ context.configs.spacings.byPercentage)
        data.byPercentage = /*this.*/ context.configs.spacings.byPercentage;
    return /*this.*/ SMPanel({
        url: /*this.*/ context.resourcesRoot + "/panel/spacings.html",
        width: 240,
        height: 314,
        data: data,
        callback: function (data) {
            /*self.*/ context.configs = /*self.*/ setConfigs({
            spacings: data
        });
        }
    });
}
