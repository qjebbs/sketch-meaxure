import { colors } from "./common/common";
import { context } from "./common/context";
import { localize } from "./common/language";
import { sketch } from "../sketch";
import { createLabel } from "./helpers/elements";
import { LayerAlignment, LayerVerticalAlignment } from "../sketch/alignment";
import { sharedLayerStyle, sharedTextStyle } from "./helpers/styles";
import { lengthUnit } from "./helpers/helper";

export function drawCoordinate() {
    if (context.selection.length <= 0) {
        sketch.UI.message(localize("Select any layer to mark!"));
        return false;
    }
    for (let layer of context.selection.layers) {
        coordinateLayer(layer);
    }
}
function coordinateLayer(layer: Layer) {
    let layerID = layer.id;
    let layerName = "#coordinate-" + layerID;
    let artboard = layer.getParentArtboard();
    if (!artboard) return;
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        artboard
    ).forEach(g => g.remove());

    let layerRect = context.configs.byInfluence ? layer.frameInfluence : layer.frame.changeBasis({ from: layer.parent, to: artboard });
    let artboardRect = context.configs.byInfluence ? artboard.frameInfluence : artboard.frame.changeBasis({ from: artboard.parent, to: artboard });
    let layerStyle = sharedLayerStyle(context.document, "Sketch MeaXure / Coordinate", colors.coordinate.shape);
    let textStyle = sharedTextStyle(context.document, "Sketch MeaXure / Coordinate", colors.coordinate.text);

    let container = new sketch.Group({ name: layerName, parent: artboard });
    let cross = new sketch.Group({ name: 'cross', parent: container });
    let crossX = new sketch.ShapePath({ parent: cross });
    crossX.frame.width = 17;
    crossX.frame.height = 1;
    crossX.sharedStyle = layerStyle;
    crossX.style = layerStyle.style;
    let crossY = crossX.duplicate();
    crossY.transform.rotation = 90;
    crossY.alignToByPostion(crossX, LayerAlignment.center);
    cross.adjustToFit();

    let posX = lengthUnit(layerRect.x - artboardRect.x);
    let posY = lengthUnit(layerRect.y - artboardRect.y);
    let text = posX + ", " + posY;
    let label = createLabel(text, {
        parent: container,
        name: 'label',
        foreground: textStyle,
        background: layerStyle
    });
    label.alignTo(cross,
        { from: LayerAlignment.left, to: LayerAlignment.center },
        { from: LayerVerticalAlignment.top, to: LayerVerticalAlignment.middle }
    );
    label.frame.offset(2, 2);
    container.adjustToFit();
    container.frame.x = layerRect.x - 8;
    container.frame.y = layerRect.y - 8;
}

