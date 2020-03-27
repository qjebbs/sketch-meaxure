import { localize } from "../state/language";
import { find } from "../api/helper";
import { getRect, removeLayer, addGroup, addShape } from "../api/api";
import { sharedLayerStyle } from "./base";
import { colors } from "../state/common";
import { context } from "../state/context";
import { sketch } from "../sketch";
export function markOverlays() {
    let selection = context.selection;
    if (selection.count() <= 0) {
        sketch.UI.message(localize("Select a layer to mark!"));
        return false;
    }
    for (let i = 0; i < selection.count(); i++) {
        overlay(selection[i]);
    }
}

function overlay(target) {
    //Crashing on exception: -[MSImmutableSharedStyle hasMarkers]: unrecognized selector sent to instance 0x608002a4f510
    let targetRect = getRect(target),
        name = "#overlay-" + target.objectID(),
        container = find({
            key: "(name != NULL) && (name == %@)",
            match: name
        }),
        overlayStyle = sharedLayerStyle("Sketch Measure / Overlay", colors.overlay.shape);

    if (container) removeLayer(container);
    container = addGroup();
    context.current.addLayers([container]);
    container.setName(name);

    let overlay = addShape(),
        overlayRect = getRect(overlay);

    container.addLayers([overlay]);

    overlay.setSharedStyle(overlayStyle);
    overlay.setName("overlay");
    overlayRect.setX(targetRect.x);
    overlayRect.setY(targetRect.y);
    overlayRect.setWidth(targetRect.width);
    overlayRect.setHeight(targetRect.height);

    container.fixGeometryWithOptions(0);
}