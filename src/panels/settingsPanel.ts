import { context } from '../state/context';
import { logger } from '../api/logger';
import { SMPanel } from './panel';

export function settingsPanel() {
    let data: any = {};
    if ( /*this.*/context.configs) {
        data.scale = /*this.*/ context.configs.scale;
        data.units = /*this.*/ context.configs.units;
        data.colorFormat = /*this.*/ context.configs.format;
        data.artboardOrder = /*this.*/ context.configs.artboardOrder;
    }
    return /*this.*/ SMPanel({
        width: 240,
        height: 386,
        data: data,
        callback: function (data) {
            logger.debug("setting panel returned:", data);
            context.configs.scale = data.scale;
            context.configs.units = data.units;
            context.configs.format = data.colorFormat;
            context.configs.artboardOrder = data.artboardOrder;
        }
    });
}
