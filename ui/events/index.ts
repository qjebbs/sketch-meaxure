import { artboardsEvents } from "./artboards";
import { dragExportableEvents } from "./dragExportable";
import { layerEvents } from "./layerEvents";
import { zoomEvents } from "./zoom";
import { unitEvents } from "./unit";
import { noteEvents } from "./notes";
import { inspectorEvents } from "./inspector";
import { tabEvents } from "./tab";
import { sliceEvents } from "./slices";
import { dragViewerEvents } from "./panMode";
import { percentageModeEvents } from "./percentageMode";
import { keyboardZoomEvents } from "./keyboardZoom";

export function events() {
    layerEvents();
    artboardsEvents();
    zoomEvents();
    unitEvents();
    noteEvents();
    inspectorEvents();
    tabEvents();
    sliceEvents();
    dragViewerEvents();
    percentageModeEvents();
    keyboardZoomEvents();
    dragExportableEvents();
}

