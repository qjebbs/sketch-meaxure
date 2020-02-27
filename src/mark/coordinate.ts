import { sharedLayerStyle, sharedTextStyle } from "./base";

import { colors } from "../state/common";
import { context } from "../state/context";
import { message } from "../api/helper";
import { Layer } from "../api/layer";

export function drawCoordinate() {
    if (context.selection.length <= 0) {
        message("Selcet any layer to mark!");
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

function lengthUnit(value: number, t?, flag?: boolean) {
    if (t && !flag) return Math.round(value / t * 1e3) / 10 + "%";
    var value = Math.round(value / context.configs.scale * 10) / 10,
        units = context.configs.units.split("/"),
        unit = units[0];
    if (flag && units.length > 1) unit = units[1];
    return "" + value + unit;
}

function Rectangle(x: number, y: number, width: number, height: number) {
    return {
        x: x,
        y: y,
        width: width,
        height: height
    }
}

function setStyle(layer: Layer, style) {
    layer.sketchObject.setSharedStyle(style);
}