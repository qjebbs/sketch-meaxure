import { localize } from "./common/language";
import { colors } from "./common/common";
import { context } from "./common/context";
import { sketch } from "../sketch";
import { sharedLayerStyle } from "./helpers/styles";
export function markOverlays() {
    let selection = context.selection;
    if (selection.length <= 0) {
        sketch.UI.message(localize("Select a layer to mark!"));
        return false;
    }
    for (let layer of selection.layers) {
        overlay(layer)
    }
}

function overlay(target: Layer) {
    let name = "#overlay-" + target.id;
    let artboard = target.getParentArtboard();
    let root = artboard || target.getParentPage();
    if (artboard) sketch.find<Group>(
        `Group, [name="${name}"]`,
        artboard
    ).forEach(g => g.remove());

    let overlayStyle = sharedLayerStyle(context.document, "Sketch MeaXure / Overlay", colors.overlay.shape);
    let container = new sketch.Group({ name: name, parent: root })
    let overlay = new sketch.ShapePath({ name: 'overlay', parent: container });
    overlay.frame = target.frame;
    overlay.sharedStyle = overlayStyle;
    overlay.style = overlayStyle.style;
    container.adjustToFit();
}