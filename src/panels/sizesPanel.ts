import { setConfigs } from '../state/config';
import { context } from '../state/context';
import { SMPanel } from './panel';
export function sizesPanel() {
    var self = this, data: any = {};
    if ( /*this.*/context.configs.sizes && /*this.*/ context.configs.sizes.widthPlacement)
        data.widthPlacement = /*this.*/ context.configs.sizes.widthPlacement;
    if ( /*this.*/context.configs.sizes && /*this.*/ context.configs.sizes.heightPlacement)
        data.heightPlacement = /*this.*/ context.configs.sizes.heightPlacement;
    if ( /*this.*/context.configs.sizes && /*this.*/ context.configs.sizes.byPercentage)
        data.byPercentage = /*this.*/ context.configs.sizes.byPercentage;
    return /*this.*/ SMPanel({
        url: /*this.*/ context.resourcesRoot + "/panel/sizes.html",
        width: 240,
        height: 358,
        data: data,
        callback: function (data) {
            /*self.*/ context.configs = /*self.*/ setConfigs({
            sizes: data
        });
        }
    });
}
