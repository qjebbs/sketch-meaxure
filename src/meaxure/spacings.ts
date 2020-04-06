import { context } from "./common/context";
import { isIntersect, isIntersectX, isIntersectY } from "./helpers/helper";
import { SMRect } from "./interfaces";
import { drawSize } from "./size";
import { logger } from "./common/logger";
import { localize } from "./common/language";
import { sketch } from "../sketch";
import { Edge, EdgeVertical } from "../sketch/layer/alignment";

export function drawSpacings(position?: string) {
    if (context.selection.length != 1 && context.selection.length != 2) {
        sketch.UI.message(localize("Select 1 or 2 layers to mark!"));
        return false;
    }

    position = position || "";
    let layers: Layer[] = [];
    for (let layer of context.selection.layers) {
        layers.push(layer);
    }
    distance(layers, position);
}

function distance(layers: Layer[], position: string) {
    let layerA = layers[0];
    let artboard = layerA.getParentArtboard();
    let layerB = layers.length == 1 ? artboard : layers[1];
    if (!layerB) {
        sketch.UI.message('Layer not in artboard, skipping...');
        return;
    }

    let root = artboard || layerA.getParentPage();
    let fromID = layerA.id;
    let toID = layerA.id;
    let from = context.configs.byInfluence ?
        layerA.frameInfluence :
        layerA.frame.changeBasis({ from: layerA.parent, to: artboard });
    let to = context.configs.byInfluence ?
        layerB.frameInfluence :
        layerB.frame.changeBasis({ from: layerB.parent, to: artboard });

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

function drawHorizontal(root: Group, layerName: string, from: SMRect, to: SMRect) {
    let tmp = <SMRect>{};
    if (isIntersectX(from, to)) {
        logger.debug('No horizontal space for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    // make sure from left shape to right
    if (from.x > to.x) [from, to] = swap(from, to);
    tmp.x = from.x + from.width;
    tmp.y = from.y;
    tmp.width = to.x - tmp.x;
    tmp.height = from.height;
    drawSpacingShape(root, tmp, EdgeVertical.middle, layerName);
}

function drawVertical(root: Group, layerName: string, from: SMRect, to: SMRect) {
    let tmp = <SMRect>{};
    if (isIntersectY(from, to)) {
        logger.debug('No vertical space for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    // make sure from higher shape to lower
    if (from.y > to.y) [from, to] = swap(from, to);
    tmp.x = from.x;
    tmp.y = from.y + from.height;
    tmp.width = from.width;
    tmp.height = to.y - tmp.y;
    drawSpacingShape(root, tmp, Edge.center, layerName);
}

function drawTop(root: Group, layerName: string, from: SMRect, to: SMRect) {
    let tmp = <SMRect>{};
    if (!isIntersect(from, to)) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    // make sure from lower shape to higher
    if (from.y < to.y) [from, to] = swap(from, to);
    tmp.x = from.x;
    tmp.y = to.y;
    tmp.width = from.width;
    tmp.height = from.y - to.y;
    drawSpacingShape(root, tmp, Edge.center, layerName);
}

function drawBottom(root: Group, layerName: string, from: SMRect, to: SMRect) {
    let tmp = <SMRect>{};
    if (!isIntersect(from, to)) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    // make sure from higher bottom shape to lower
    if (from.y + from.height > to.y + to.height) [from, to] = swap(from, to);
    tmp.x = from.x;
    tmp.y = from.y + from.height;
    tmp.width = from.width;
    tmp.height = to.y + to.height - from.y - from.height;
    drawSpacingShape(root, tmp, Edge.center, layerName);
}

function drawLeft(root: Group, layerName: string, from: SMRect, to: SMRect) {
    let tmp = <SMRect>{};
    if (!isIntersect(from, to)) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    // make sure from right shape to left
    if (from.x < to.x) [from, to] = swap(from, to);
    tmp.x = to.x;
    tmp.y = from.y;
    tmp.width = from.x - to.x;
    tmp.height = from.height;
    drawSpacingShape(root, tmp, EdgeVertical.middle, layerName);
}

function drawRight(root: Group, layerName: string, from: SMRect, to: SMRect) {
    let tmp = <SMRect>{};
    if (!isIntersect(from, to)) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    // make sure from left shape (by right border) to right
    if (from.x + from.width > to.x + to.width) [from, to] = swap(from, to);
    tmp.x = from.x + from.width;
    tmp.y = from.y;
    tmp.width = to.x + to.width - from.x - from.width;
    tmp.height = from.height;
    drawSpacingShape(root, tmp, EdgeVertical.middle, layerName);
}

function drawSpacingShape(
    root: Group, frame: SMRect,
    drawSizePosition: Edge | EdgeVertical, layerName: string
) {
    let tempShape = new sketch.ShapePath({ parent: root })
    tempShape.frame = new sketch.Rectangle(frame.x, frame.y, frame.width, frame.height);
    drawSize(tempShape, drawSizePosition, {
        name: layerName,
        background: context.meaxureStyles.spacing.background,
        foreground: context.meaxureStyles.spacing.foreground
    });
    tempShape.remove();
}

function swap<T>(a: T, b: T): [T, T] {
    return [b, a];
}