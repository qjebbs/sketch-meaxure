import { context } from "../state/context";
import { message, isIntersect, find, isIntersectX, isIntersectY } from "../api/helper";
import { getDistances, sharedLayerStyle, sharedTextStyle } from "./base";
import { colors } from "../state/common";
import { Rect } from "../api/interfaces";
import { drawSize } from "./size";
import { Layer } from "../api/layer";
import { logger } from "../api/logger";
import { removeLayer } from "../api/api";
import { localize } from "../state/language";

export function drawSpacings(position?: string) {
    if (context.selection.length != 1 && context.selection.length != 2) {
        message(localize("Select 1 or 2 layers to mark!"));
        return false;
    }

    position = position || "";
    let layer: Layer, layers: Layer[] = [];
    let enmu = context.selection.objectEnumerator();
    while (layer = enmu.nextObject()) {
        layers.push(new Layer(layer));
    }
    distance(layers, position);
}

function distance(layers: Layer[], position: string) {
    let layerA = layers[0];
    let layerB = layers.length == 1 ? layerA.current : layers[1];
    if (layerB.isPage) {
        message('Layer not in artboard, skipping...');
        return;
    }

    let artboard = layerA.current;
    let fromID = new String(layerA.ID).toString();
    let toID = new String(layerB.ID).toString();
    let from = context.configs.byInfluence ? layerA.influenceRect : layerA.rect;
    let to = context.configs.byInfluence ? layerB.influenceRect : layerB.rect;

    switch (position) {
        case "":
        case "horizontal":
            drawHorizontal(artboard, "#spacing-horizontal-" + fromID + "-" + toID, from, to);
            if (position) return;
        case "":
        case "vertical":
            drawVertical(artboard, "#spacing-vertical-" + fromID + "-" + toID, from, to);
            if (position) return;
        case "":
        case "top":
            drawTop(artboard, "#spacing-top-" + fromID + "-" + toID, from, to);
            if (position) return;
        case "":
        case "bottom":
            drawBottom(artboard, "#spacing-bottom-" + fromID + "-" + toID, from, to);
            if (position) return;
        case "":
        case "left":
            drawLeft(artboard, "#spacing-left-" + fromID + "-" + toID, from, to);
            if (position) return;
        case "":
        case "right":
            drawRight(artboard, "#spacing-right-" + fromID + "-" + toID, from, to);
            if (position) return;
        default:
            break;
    }
}

function drawHorizontal(artboard: Layer, layerName: string, from: Rect, to: Rect) {
    let tmp = <Rect>{};
    if (isIntersectX(from, to)) {
        logger.debug('No horizontal space for selected layers, skipping...');
        return;
    }

    let container = find({
        key: "(name != NULL) && (name == %@)",
        match: layerName
    });
    if (container) removeLayer(container);

    // make sure from left shape to right
    if (from.x > to.x) [from, to] = swap(from, to);
    tmp.x = from.x + from.width;
    tmp.y = from.y;
    tmp.width = to.x - tmp.x;
    tmp.height = from.height;
    drawSpacingShape(artboard, tmp, "middle", layerName);
}

function drawVertical(artboard: Layer, layerName: string, from: Rect, to: Rect) {
    let tmp = <Rect>{};
    if (isIntersectY(from, to)) {
        logger.debug('No vertical space for selected layers, skipping...');
        return;
    }

    let container = find({
        key: "(name != NULL) && (name == %@)",
        match: layerName
    });
    if (container) removeLayer(container);

    // make sure from higher shape to lower
    if (from.y > to.y) [from, to] = swap(from, to);
    tmp.x = from.x;
    tmp.y = from.y + from.height;
    tmp.width = from.width;
    tmp.height = to.y - tmp.y;
    drawSpacingShape(artboard, tmp, "center", layerName);
}

function drawTop(artboard: Layer, layerName: string, from: Rect, to: Rect) {
    let tmp = <Rect>{};
    if (!isIntersect(from, to)) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }

    let container = find({
        key: "(name != NULL) && (name == %@)",
        match: layerName
    });
    if (container) removeLayer(container);

    // make sure from lower shape to higher
    if (from.y < to.y) [from, to] = swap(from, to);
    tmp.x = from.x;
    tmp.y = to.y;
    tmp.width = from.width;
    tmp.height = from.y - to.y;
    drawSpacingShape(artboard, tmp, "center", layerName);
}

function drawBottom(artboard: Layer, layerName: string, from: Rect, to: Rect) {
    let tmp = <Rect>{};
    if (!isIntersect(from, to)) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }

    let container = find({
        key: "(name != NULL) && (name == %@)",
        match: layerName
    });
    if (container) removeLayer(container);

    // make sure from higher bottom shape to lower
    if (from.y + from.height > to.y + to.height) [from, to] = swap(from, to);
    tmp.x = from.x;
    tmp.y = from.y + from.height;
    tmp.width = from.width;
    tmp.height = to.y + to.height - from.y - from.height;
    drawSpacingShape(artboard, tmp, "center", layerName);
}

function drawLeft(artboard: Layer, layerName: string, from: Rect, to: Rect) {
    let tmp = <Rect>{};
    if (!isIntersect(from, to)) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }

    let container = find({
        key: "(name != NULL) && (name == %@)",
        match: layerName
    });
    if (container) removeLayer(container);

    // make sure from right shape to left
    if (from.x < to.x) [from, to] = swap(from, to);
    tmp.x = to.x;
    tmp.y = from.y;
    tmp.width = from.x - to.x;
    tmp.height = from.height;
    drawSpacingShape(artboard, tmp, "middle", layerName);
}

function drawRight(artboard: Layer, layerName: string, from: Rect, to: Rect) {
    let tmp = <Rect>{};
    if (!isIntersect(from, to)) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }

    let container = find({
        key: "(name != NULL) && (name == %@)",
        match: layerName
    });
    if (container) removeLayer(container);

    // make sure from left shape (by right border) to right
    if (from.x + from.width > to.x + to.width) [from, to] = swap(from, to);
    tmp.x = from.x + from.width;
    tmp.y = from.y;
    tmp.width = to.x + to.width - from.x - from.width;
    tmp.height = from.height;
    drawSpacingShape(artboard, tmp, "middle", layerName);
}

function drawSpacingShape(container: Layer, frame: Rect, drawSizePosition: string, layerName: string) {
    var tempShape = container.newShape({
        layerName: "temp"
    });
    tempShape.rect = frame;
    drawSize(tempShape, drawSizePosition, layerName, {
        shape: sharedLayerStyle("Sketch Measure / Spacing", colors.spacing.shape),
        text: sharedTextStyle("Sketch Measure / Spacing", colors.spacing.text)
    });
    tempShape.remove();
}

function swap<T>(a: T, b: T): [T, T] {
    return [b, a];
}