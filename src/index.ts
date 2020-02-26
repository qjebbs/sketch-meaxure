import { settingsPanel } from "./panel";
import { initOrUpdateContext } from "./context";
import { logger } from "./logger";
import { markToolbar } from "./toolbar";
import { message } from "./helper";

export function commandInit(context) {
    return false;
}


export function commandSettings(context?) {
    initOrUpdateContext(context);
    settingsPanel();
}

export function commandToolbar(context) {
    initOrUpdateContext(context);
    markToolbar();
}

export function commandOverlays(context?) {
    initOrUpdateContext(context);
    //TODO: mark-overlays command to be implemented
    message("mark-overlays command to be implemented");
}
export function commandSizes(context?) {
    initOrUpdateContext(context);
    if (NSEvent.modifierFlags() == NSAlternateKeyMask /*917504*/) {
        //TODO: mark-sizes command to be implemented
        message("mark-sizes command to be implemented");
    } else {
        //TODO: lite-sizes command to be implemented
        message("lite-sizes command to be implemented");
    }
}
export function commandSpacings(context?) {
    initOrUpdateContext(context);
    if (NSEvent.modifierFlags() == NSAlternateKeyMask /*917504*/) {
        //TODO: mark-spacings command to be implemented
        message("mark-spacings command to be implemented");
    } else {
        //TODO: lite-spacings command to be implemented
        message("lite-spacings command to be implemented");
    }
}
export function commandProperties(context?) {
    initOrUpdateContext(context);
    if (NSEvent.modifierFlags() == NSAlternateKeyMask) {
        //TODO: mark-properties command to be implemented
        message("mark-properties command to be implemented");
    } else {
        //TODO: lite-properties command to be implemented
        message("lite-properties command to be implemented");
    }
}
export function commandNote(context?) {
    initOrUpdateContext(context);
    //TODO: mark-note command to be implemented
    message("mark-note command to be implemented");
}
export function commandHidden(context?) {
    initOrUpdateContext(context);
    //TODO: hidden command to be implemented
    message("hidden command to be implemented");
}
export function commandLocked(context?) {
    initOrUpdateContext(context);
    //TODO: locked command to be implemented
    message("locked command to be implemented");
}
export function commandClear(context?) {
    initOrUpdateContext(context);
    //TODO: clear command to be implemented
    message("clear command to be implemented");
}
export function commandColor(context?) {
    initOrUpdateContext(context);
    //TODO: color command to be implemented
    message("color command to be implemented");
}
export function commandExportable(context?) {
    initOrUpdateContext(context);
    if (NSEvent.modifierFlags() == NSAlternateKeyMask) {
        //TODO: slice command to be implemented
        message("slice command to be implemented");
    } else {
        //TODO: exportable command to be implemented
        message("exportable command to be implemented");
    }
}
export function commandExport(context?) {
    initOrUpdateContext(context);
    //TODO: export command to be implemented
    message("export command to be implemented");
}
export function commandToolbar2(context?) {
    initOrUpdateContext(context);
    //TODO: toolbar2 command to be implemented
    message("toolbar2 command to be implemented");
}