import { sharedLayerStyle, sharedTextStyle, lengthUnit, Rectangle, setStyle } from "./base";

import { colors } from "../state/common";
import { context } from "../state/context";
import { find } from "../api/helper";
import { Layer } from "../api/layer";
import { localize } from "../state/language";
import { removeLayer } from "../api/api";
import { sketch } from "../sketch";

export function drawCoordinate() {
    if (context.selection.length <= 0) {
        sketch.UI.message(localize("Select any layer to mark!"));
        return false;
    }
    let layer;
    let enmu = context.selection.objectEnumerator();
    while (layer = enmu.nextObject()) {
        coordinateLayer(new Layer(layer));
    }
}
function coordinateLayer(layer: Layer) {
    let layerID = new String(layer.ID).toString();
    let layerName = "#coordinate-" + layerID;
    let container = find({
        key: "(name != NULL) && (name == %@)",
        match: layerName
    });
    if (container) removeLayer(container);

    let layerRect = context.configs.byInfluence ? layer.influenceRect : layer.rect,
        artboard = layer.current,
        artboardRect = context.configs.byInfluence ? artboard.influenceRect : artboard.rect,
        layerStyle = sharedLayerStyle("Sketch Measure / Coordinate", colors.coordinate.shape),
        textStyle = sharedTextStyle("Sketch Measure / Coordinate", colors.coordinate.text),
        group = artboard.newGroup({
            frame: Rectangle(0, 0, layerRect.width, layerRect.height),
            name: layerName
        }),
        crossX = group.newShape({
            frame: Rectangle(-8, 0, 17, 1),
            name: "crosshair-x"
        }),
        crossY = group.newShape({
            frame: Rectangle(0, -8, 1, 17),
            name: "crosshair-y"
        }),
        posX = lengthUnit(layerRect.x - artboardRect.x),
        posY = lengthUnit(layerRect.y - artboardRect.y),
        text = posX + ", " + posY,
        textShape = group.newText({
            text: text
        });
    setStyle(textShape, textStyle);
    let bgRect = Rectangle(15, 15, textShape.frame.width, textShape.frame.height);
    textShape.frame = bgRect;
    let bgShape = group.newShape({
        frame: Rectangle(11, 11, textShape.frame.width + 8, textShape.frame.height + 8),
        name: "box"
    });
    bgShape.sketchObject.layers().firstObject().setCornerRadiusFromComponents("2")
    textShape.adjustToFit();
    textShape.moveToFront();
    textShape.deselect();
    setStyle(bgShape, layerStyle);
    setStyle(crossX, layerStyle);
    setStyle(crossY, layerStyle);
    group.rect = {
        x: layerRect.x - 8,
        y: layerRect.y - 8,
        width: null,
        height: null,
    }
    group.adjustToFit();
}

