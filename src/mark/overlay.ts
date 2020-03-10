import { localize } from "../state/language";
import { message, find } from "../api/helper";
import { getRect, removeLayer, addGroup, addShape } from "../api/api";
import { sharedLayerStyle } from "./base";
import { colors } from "../state/common";
import { context } from "../state/context";
export function markOverlays() {
    let selection = /*this.*/ context.selection;
    if (selection.count() <= 0) {
        /*this.*/ message(localize("Select a layer to mark!"));
        return false;
    }
    for (let i = 0; i < selection.count(); i++) {
        /*this.*/ overlay(selection[i]);
    }
}

function overlay(target) {
    //Crashing on exception: -[MSImmutableSharedStyle hasMarkers]: unrecognized selector sent to instance 0x608002a4f510
    let targetRect = /*this.*/getRect(target),
        name = "#overlay-" + target.objectID(),
        container = /*this.*/find({
            key: "(name != NULL) && (name == %@)",
            match: name
        }),
        overlayStyle = /*this.*/sharedLayerStyle("Sketch Measure / Overlay", /*this.*/colors.overlay.shape);

    if (container) /*this.*/removeLayer(container);
    container = /*this.*/addGroup();
    /*this.*/context.current.addLayers([container]);
    container.setName(name);

    let overlay = /*this.*/addShape(),
        overlayRect = /*this.*/getRect(overlay);

    container.addLayers([overlay]);

    overlay.setSharedStyle(overlayStyle);
    overlay.setName("overlay");
    overlayRect.setX(targetRect.x);
    overlayRect.setY(targetRect.y);
    overlayRect.setWidth(targetRect.width);
    overlayRect.setHeight(targetRect.height);

    container.fixGeometryWithOptions(0);
}