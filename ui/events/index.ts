import { artboardsEvents } from "./artboards";
import { dragExportableEvents } from "./dragExportable";
import { layerEvents } from "./layerEvents";
import { zoomEvents } from "./zoom";
import { unitEvents } from "./unit";
import { noteEvents } from "./notes";
import { inspectorEvents } from "./inspector";
import { tabEvents } from "./tab";
import { sliceEvents } from "./slices";
import { panModeEvents } from "./panMode";
import { percentageModeEvents } from "./percentageMode";
import { keyboardZoomEvents } from "./keyboard/zoom";
import { flowEvents } from "./flow";
import { hashChangeEvents } from "./hashChange";
import { keyboardSwitchEvents } from "./keyboard/switch";

export function events() {
    layerEvents();
    artboardsEvents();
    zoomEvents();
    unitEvents();
    noteEvents();
    inspectorEvents();
    tabEvents();
    sliceEvents();
    panModeEvents();
    percentageModeEvents();
    keyboardZoomEvents();
    dragExportableEvents();
    flowEvents();
    keyboardSwitchEvents();
    hashChangeEvents();
}

