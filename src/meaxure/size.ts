import { SMLayer } from "../api/SMLayer";
import { context } from "../state/context";
import { find } from "../api/helper";
import { sharedLayerStyle, sharedTextStyle, lengthUnit, Rectangle, setStyle, getDistances } from "./base";
import { colors } from "../state/common";
import { SMRect } from "../api/interfaces-deprecated";
import { localize } from "../state/language";
import { removeLayer } from "../api/api";
import { sketch } from "../sketch";

export function drawSizes(position) {
    position = position || "top";
    if (context.selection.length <= 0) {
        sketch.UI.message(localize("Select any layer to mark!"));
        return false;
    }
    for (let layer of context.selection.layers) {
        drawSize(new SMLayer(layer.sketchObject), position);
    }
}

export function drawSize(layer: SMLayer, position: string, name?, style?) {
    let sizeType = /top|middle|bottom/.exec(position) ? "width" : "height";
    let id = new String(layer.ID).toString();
    name = name || "#" + sizeType + "-" + position + "-" + id;
    let found = find({
        key: "(name != NULL) && (name == %@)",
        match: name
    });
    if (found) removeLayer(found);

    let rect = context.configs.byInfluence ? layer.influenceRect : layer.rect,
        layerSize = /top|middle|bottom/.exec(position) ? rect.width : rect.height,
        text = lengthUnit(layerSize);
    style = style || {
        shape: sharedLayerStyle("Sketch Measure / Size", colors.size.shape),
        text: sharedTextStyle("Sketch Measure / Size", colors.size.text)
    };
    let container = layer.current;
    if (context.configs.byPercentage && !container.isPage) {
        let containerRect = context.configs.byInfluence ? container.influenceRect : container.rect,
            containerSize = /top|middle|bottom/.exec(position) ? containerRect.width : containerRect.height;
        text = lengthUnit(layerSize, containerSize)
    }
    let group = createGroup(layer, position, name),
        forSize = createLine(sizeType, group, position, style);
    createLabel(sizeType, group, position, text, style, forSize);
    group.adjustToFit();
}
function createGroup(layer: SMLayer, position: string, name: string) {
    if (layer) {
        let rect = context.configs.byInfluence ? layer.influenceRect : layer.rect,
            artboard = layer.current,
            size = /top|middle|bottom/.exec(position) ? rect.width : rect.height,
            sizeX = rect.x,
            sizeY = rect.y;
        /top|middle|bottom/.exec(position) ? sizeY = "middle" == position ? Math.round(sizeY + (rect.height - size) / 2) : "bottom" == position ? Math.round(sizeY + rect.height) : Math.round(sizeY - size) : /left|center|right/.exec(position) && (sizeX = "center" == position ? Math.round(sizeX + (rect.width - size) / 2) : "right" == position ? Math.round(sizeX + rect.width) : Math.round(sizeX - size));
        let group = artboard.newGroup({
            frame: Rectangle(0, 0, size, size),
            name: name
        });
        group.rect = {
            x: sizeX,
            y: sizeY,
            width: null,
            height: null,
        }
        return group;
    }
}
function createLabel(sizeType: string, group: SMLayer, position: string, text: string, style: any, forSize: any) {

    let size = "width" == sizeType ? group.frame.width : group.frame.height,
        offset = forSize ? 4 : 0,
        textLayer = group.newText({
            text: text
        }),
        flag = false;
    setStyle(textLayer, style.text);

    let textX = /top|middle|bottom/.exec(position) ?
        Math.round((size - textLayer.frame.width) / 2) :
        "left" == position ?
            size - textLayer.frame.width - 10 - offset :
            10 + offset,
        textY = /left|center|right/.exec(position) ?
            Math.round((size - textLayer.frame.height) / 2) :
            "bottom" == position ?
                10 + offset :
                size - (textLayer.frame.height + 10 + offset),
        textWidth = textLayer.frame.width,
        textHeight = textLayer.frame.height,
        arrowPosition = "top" == position ?
            "bottom" :
            "right" == position ?
                "left" :
                "bottom" == position ?
                    "top" :
                    "right";
    if (forSize) {
        let distance = getDistances(forSize);
        if (/top|middle|bottom/.exec(position) && size > textWidth + 28) {
            textY = "top" == position ?
                size - textHeight + 3 :
                "bottom" == position ?
                    -7 :
                    Math.round((size - textHeight) / 2);
            flag = true;
        } else if (/left|center|right/.exec(position) && size > textHeight + 28) {
            if ("left" == position) {
                textX = Math.round(size - textWidth / 2 - 4);
            } else if ("right" == position) {
                textX = -Math.round(textWidth / 2 - 4)
            } else {
                textX = Math.round((size - textWidth) / 2);
            }
            flag = true;
        } else if ("middle" == position) {
            textY = distance.top < distance.bottom ?
                Math.round(size / 2 + 10) :
                Math.round(size / 2 - textHeight - 11);
            arrowPosition = distance.top < distance.bottom ? "top" : "bottom"
        } else if ("center" == position && size <= textHeight + 28) {
            textX = distance.left < distance.right ?
                Math.round(size / 2 + 10) :
                Math.round(size / 2 - textWidth - 11);
            arrowPosition = distance.left < distance.right ? "left" : "right";
        }
    }
    let textRect = Rectangle(textX, textY, textWidth, textHeight),
        arrowX = /top|middle|bottom/.exec(position) ?
            Math.round(textX + (textWidth - 6) / 2) :
            "right" == arrowPosition ?
                textX + textWidth :
                textX - 6,
        arrowY = /left|center|right/.exec(position) ?
            Math.round(textY + (textHeight - 6) / 2) :
            "top" == arrowPosition ?
                textY - 6 :
                textY + textHeight,
        boxRect = Rectangle(textX - 4, textY - 4, textWidth + 8, textHeight + 8),
        box = group.newShape({
            frame: boxRect,
            name: "box"
        }),
        arrowRect = Rectangle(arrowX, arrowY, 6, 6),
        arrow = group.newShape({
            frame: Rectangle(0, 0, 100, 100),
            name: "arrow"
        }),
        boxObject = box.sketchObject,
        arrowObject = arrow.sketchObject;
    boxObject.layers().firstObject().setCornerRadiusFromComponents("2");
    arrowObject.setRotation(45);
    textLayer.frame = textRect;
    arrow.frame = arrowRect;
    textLayer.adjustToFit();
    textLayer.moveToFront();
    textLayer.deselect();
    setStyle(arrow, style.shape);
    setStyle(box, style.shape);
    let artboard = box.current;
    if (artboard.isArtboard) {
        let artboardRect = artboard.rect,
            boxNewRect = <SMRect>{},
            textNewRext: any = {};
        boxRect = box.rect;
        if (artboardRect.x > boxRect.x) {
            boxNewRect.x = artboardRect.x;
        } else {
            if (artboardRect.x + artboardRect.width < boxRect.x + boxRect.width) {
                boxNewRect.x = artboardRect.x + artboardRect.width - boxRect.width;
            }
        }
        if (artboardRect.y > boxRect.y) {
            boxNewRect.y = artboardRect.y;
        } else {
            if (artboardRect.y + artboardRect.height < boxRect.y + boxRect.height) {
                boxNewRect.y = artboardRect.y + artboardRect.height - boxRect.height;
            }
        }
        if (boxNewRect.x) {
            textNewRext.x = boxNewRect.x + 4;
        }
        if (boxNewRect.y) {
            textNewRext.y = boxNewRect.y + 4;
        }
        box.rect = boxNewRect;
        box.text = textNewRext;
    }
    if (flag) arrow.remove();
}
function createLine(sizeType: string, group: SMLayer, position: string, style: any) {
    let size = "width" == sizeType ? group.frame.width : group.frame.height,
        x1 = "width" == sizeType ? 0 : "left" == position ? size - 4 : "center" == position ? Math.round((size - 1) / 2) : 3,
        y1 = "height" == sizeType ? 0 : "top" == position ? size - 4 : "middle" == position ? Math.round((size - 1) / 2) : 3,
        w1 = "width" == sizeType ? size : 1,
        h1 = "height" == sizeType ? size : 1,
        w2 = "width" == sizeType ? 1 : 5,
        h2 = "width" == sizeType ? 5 : 1,
        x2 = "width" == sizeType ? 0 : "left" == position ? size - 6 : "center" == position ? Math.round((size - 5) / 2) : 1,
        y2 = "height" == sizeType ? 0 : "top" == position ? size - 6 : "middle" == position ? Math.round((size - 5) / 2) : 1,
        x3 = "width" == sizeType ? size - 1 : "left" == position ? size - 6 : "center" == position ? Math.round((size - 5) / 2) : 1,
        y3 = "height" == sizeType ? size - 1 : "top" == position ? size - 6 : "middle" == position ? Math.round((size - 5) / 2) : 1,
        lineRect = Rectangle(x1, y1, w1, h1),
        lineShape = group.newShape({
            frame: lineRect,
            name: "line"
        }),
        startRect = Rectangle(x2, y2, w2, h2),
        start = group.newShape({
            frame: startRect,
            name: "start"
        }),
        endRect = Rectangle(x3, y3, w2, h2),
        end = group.newShape({
            frame: endRect,
            name: "end"
        }),
        shape = style.shape;
    setStyle(lineShape, shape);
    setStyle(start, shape);
    setStyle(end, shape);
    return lineShape
}

