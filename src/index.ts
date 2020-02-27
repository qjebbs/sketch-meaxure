import { settingsPanel } from "./panels/settingsPanel";
import { updateContext } from "./state/context";
import { logger } from "./api/logger";
import { markToolbar } from "./panels/toolbar";
import { message } from "./api/helper";
import { exportSpecification } from "./exporter/export";
import { markNote } from "./mark/note";
import { liteProperties, markProperties } from "./mark/properties";
import { markOverlays } from "./mark/overlay";
import { drawCoordinate } from "./mark/coordinate";

function runAndCatch(fn: Function, context, ...args) {
    try {
        updateContext(context);
        fn(...args);
    } catch (error) {
        logger.error(error);
        message(error);
    }
}

export function commandInit(context) {
    return false;
}

export function commandSettings(context?) {
    runAndCatch(settingsPanel, context);
}

export function commandToolbar(context) {
    runAndCatch(markToolbar, context);
}

export function commandOverlays(context?) {
    runAndCatch(markOverlays, context);
}
export function commandSizes(context?) {
    // runAndCatch(fn, context);
    message('markSizes()');
}
export function commandSpacings(context?) {
    // runAndCatch(fn, context);
    message('markSpacings()');
}
export function commandProperties(context?) {
    runAndCatch(() => {
        // call from UI, or alt key pressed
        if (!context || NSEvent.modifierFlags() == NSAlternateKeyMask) {
            markProperties();
        } else {
            liteProperties();
        }
    }, context);

}
export function commandNote(context?) {
    runAndCatch(markNote, context);
}
export function commandCoordinate(context?) {
    runAndCatch(drawCoordinate, context);
}
export function commandHidden(context?) {
    // runAndCatch(fn, context);
    //TODO: hidden command to be implemented
    message("hidden command to be implemented");
}
export function commandLocked(context?) {
    // runAndCatch(fn, context);
    //TODO: locked command to be implemented
    message("locked command to be implemented");
}
export function commandClear(context?) {
    // runAndCatch(fn, context);
    //TODO: clear command to be implemented
    message("clear command to be implemented");
}
export function commandColor(context?) {
    // runAndCatch(fn, context);
    //TODO: color command to be implemented
    message("color command to be implemented");
}
export function commandExportable(context?) {
    // runAndCatch(fn, context);
    if (NSEvent.modifierFlags() == NSAlternateKeyMask) {
        //TODO: slice command to be implemented
        message("slice command to be implemented");
    } else {
        //TODO: exportable command to be implemented
        message("exportable command to be implemented");
    }
}
export function commandExport(context?) {
    runAndCatch(exportSpecification, context);
}