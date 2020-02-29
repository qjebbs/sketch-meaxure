import { sharedLayerStyle, sharedTextStyle, lengthUnit, Rectangle, setStyle } from "./base";

import { colors } from "../state/common";
import { context } from "../state/context";
import { message } from "../api/helper";
import { Layer } from "../api/layer";
import { localize } from "../state/language";

export function drawCoordinate() {
    if (context.selection.length <= 0) {
        message(localize("Select any layer to mark!"));
        return false;
    }
    let layer;
    let enmu = context.selection.objectEnumerator();
    while (layer = enmu.nextObject()) {
        coordinateLayer(new Layer(layer));
    }
}
function coordinateLayer(layer: Layer) {
    var layerRect = context.configs.byInfluence ? layer.influenceRect : layer.rect,
        artboard = layer.current,
        artboardRect = context.configs.byInfluence ? artboard.influenceRect : artboard.rect,
        layerID = new String(layer.ID).toString(),
        layerName = "#coordinate-" + layerID,
        layerStyle = /*self.*/sharedLayerStyle("Sketch Measure / Coordinate", /*self.*/colors.coordinate.shape),
        textStyle = /*self.*/sharedTextStyle("Sketch Measure / Coordinate", /*self.*/colors.coordinate.text),
        group = artboard.newGroup({
            frame: /*self.*/Rectangle(0, 0, layerRect.width, layerRect.height),
            name: layerName
        }),
        crossX = group.newShape({
            frame: /*self.*/Rectangle(-8, 0, 17, 1),
            name: "crosshair-x"
        }),
        crossY = group.newShape({
            frame: /*self.*/Rectangle(0, -8, 1, 17),
            name: "crosshair-y"
        }),
        posX = /*self.*/lengthUnit(layerRect.x - artboardRect.x),
        posY = /*self.*/lengthUnit(layerRect.y - artboardRect.y),
        text = posX + ", " + posY,
        textShape = group.newText({
            text: text
        });
    setStyle(textShape, textStyle);
    var bgRect = /*self.*/Rectangle(15, 15, textShape.frame.width, textShape.frame.height);
    textShape.frame = bgRect;
    var bgShape = group.newShape({
        frame: /*self.*/Rectangle(11, 11, textShape.frame.width + 8, textShape.frame.height + 8),
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

