import { settingsPanel } from "./panel";
import { initContext } from "./context";
import { logger } from "./logger";

export function commandInit(context) {
    // Sketch = new API();
    // ga = new Analytics(context);
    // if (ga) ga.sendEvent('file', 'open sketch file');
    // var manifestCore = new manifestMaster(context);
    // manifestCore.init()
    // checkVersion();
    require('sketch').UI.message("commandSettings Init!");
    return false;
}


export function commandSettings(context) {
    logger.debug("commandSettings running!");
    initContext(context);
    settingsPanel();
}
