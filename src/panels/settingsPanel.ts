import { MarkConfig, setConfigs } from '../state/config';
import { context } from '../state/context';
import { logger } from '../logger';
import { SMPanel } from './panel';

export function settingsPanel() {
    let data = <MarkConfig>{};
    if ( /*this.*/context.configs) {
        data.scale = /*this.*/ context.configs.scale;
        data.unit = /*this.*/ context.configs.unit;
        data.colorFormat = /*this.*/ context.configs.colorFormat;
        data.artboardOrder = /*this.*/ context.configs.artboardOrder;
    }
    return /*this.*/ SMPanel({
        width: 240,
        height: 386,
        data: data,
        callback: function (data) {
            logger.debug("setting panel returned:", data);
            /*self.*/ context.configs = /*self.*/ setConfigs(data);
        }
    });
}
