import { context, updateContext } from '../common/context';
import { createWebviewPanel } from '../../webviewPanel';
import { logger } from '../common/logger';
import { getResourcePath } from '../helpers/helper';
import { getLanguageScript } from '../common/language';
import { drawSizes } from '../size';
import { drawCoordinate } from '../coordinate';
import { drawSpacings } from '../spacings';
import { markProperties } from '../properties';
import { markNote } from '../note';
import { clearAllMarks, toggleHidden, toggleLocked } from '../manage';
import { exportSpecification } from '../export';
import { settingsPanel } from './settingsPanel';
import { markOverlays } from '../overlay';

interface CommandMessage {
    action: string,
    options: string,
    byInfluence: boolean,
    byPercentage: boolean,
}

const workers = {
    coordinate: drawCoordinate,
    overlay: markOverlays,
    size: drawSizes,
    spacing: drawSpacings,
    properties: markProperties,
    note: markNote,
    clear: clearAllMarks,
    visibility: toggleHidden,
    lock: toggleLocked,
    export: exportSpecification,
    settings: settingsPanel,
}

export function markToolbar() {
    let panel = createWebviewPanel({
        identifier: 'co.jebbs.sketch-meaxure.toolbar',
        url: getResourcePath() + "/panel/toolbar.html",
        acceptsFirstMouse: true,
        width: 120,
        height: 472,
    });
    if (!panel) return undefined;

    let data: any = {};
    data.language = getLanguageScript();
    if (context.configs) {
        data.byInfluence = context.configs.byInfluence;
        data.byPercentage = context.configs.byPercentage;
    }
    panel.onDidReceiveMessage('init', () => data);
    panel.onDidReceiveMessage<CommandMessage>('command', msg => {
        updateContext();
        context.configs.byInfluence = msg.byInfluence;
        context.configs.byPercentage = msg.byPercentage;
        workers[msg.action](msg.options);
    });
    panel.show();
}

