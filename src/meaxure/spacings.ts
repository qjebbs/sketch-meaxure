// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { context } from "./common/context";
import { getIntersection } from "./helpers/helper";
import { SMRect } from "./interfaces";
import { drawSizeForFrame } from "./size";
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
    if (!layerB) return;

    let root = artboard || layerA.getParentPage();
    if (!root) return;
    let fromID = layerA.id;
    let toID = layerB.id;
    let from = context.configs.byInfluence ?
        layerA.frameInfluence.changeBasis({ from: layerA.parent as Group, to: root }) :
        layerA.frame.changeBasis({ from: layerA.parent as Group, to: root });
    let to = context.configs.byInfluence ?
        layerB.frameInfluence.changeBasis({ from: layerB.parent as Group, to: root }) :
        layerB.frame.changeBasis({ from: layerB.parent as Group, to: root });

    switch (position) {
        case "":
        case "horizontal":
            drawHorizontal(root, "#meaxure-spacing-horizontal-" + fromID + "-" + toID, from, to);
            if (position) return;
        case "":
        case "vertical":
            drawVertical(root, "#meaxure-spacing-vertical-" + fromID + "-" + toID, from, to);
            if (position) return;
        case "":
        case "top":
            drawTop(root, "#meaxure-spacing-top-" + fromID + "-" + toID, from, to);
            if (position) return;
        case "":
        case "bottom":
            drawBottom(root, "#meaxure-spacing-bottom-" + fromID + "-" + toID, from, to);
            if (position) return;
        case "":
        case "left":
            drawLeft(root, "#meaxure-spacing-left-" + fromID + "-" + toID, from, to);
            if (position) return;
        case "":
        case "right":
            drawRight(root, "#meaxure-spacing-right-" + fromID + "-" + toID, from, to);
            if (position) return;
        default:
            break;
    }
}

function drawHorizontal(root: Group, layerName: string, from: SMRect, to: SMRect) {
    // make sure from left shape to right
    if (from.x > to.x) [from, to] = swap(from, to);
    let rect = <SMRect>{}
    rect.x = from.x + from.width;
    rect.y = from.y;
    rect.width = to.x - rect.x;
    rect.height = from.height;
    if (rect.width <= 0) {
        logger.debug('No horizontal space for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    drawSpacingShape(layerName, rect, EdgeVertical.middle, root)
}

function drawVertical(root: Group, layerName: string, from: SMRect, to: SMRect) {
    // make sure from higher shape to lower
    if (from.y > to.y) [from, to] = swap(from, to);
    let rect = <SMRect>{};
    rect.x = from.x;
    rect.y = from.y + from.height;
    rect.width = from.width;
    rect.height = to.y - rect.y;
    if (rect.height <= 0) {
        logger.debug('No vertical space for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    drawSpacingShape(layerName, rect, Edge.center, root)
}

function drawTop(root: Group, layerName: string, from: SMRect, to: SMRect) {
    let rect = <SMRect>{};
    let intersection = getIntersection(from, to);
    if (!intersection) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    // make sure from lower shape to higher
    if (from.y < to.y) [from, to] = swap(from, to);
    rect.x = intersection.x;
    rect.y = to.y;
    rect.width = intersection.width;
    rect.height = intersection.y - to.y;
    if (!rect.height) {
        logger.debug('No space for selected layers, skipping...');
        return;
    }
    drawSpacingShape(layerName, rect, Edge.center, root)
}

function drawBottom(root: Group, layerName: string, from: SMRect, to: SMRect) {
    let rect = <SMRect>{};
    let intersection = getIntersection(from, to);
    if (!intersection) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    // make sure from higher bottom shape to lower
    if (from.y + from.height > to.y + to.height) [from, to] = swap(from, to);
    rect.x = intersection.x;
    rect.y = intersection.y + intersection.height;
    rect.width = intersection.width;
    rect.height = to.y + to.height - intersection.y - intersection.height;
    if (!rect.height) {
        logger.debug('No space for selected layers, skipping...');
        return;
    }
    drawSpacingShape(layerName, rect, Edge.center, root)
}

function drawLeft(root: Group, layerName: string, from: SMRect, to: SMRect) {
    let rect = <SMRect>{};
    let intersection = getIntersection(from, to);
    if (!intersection) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    // make sure from right shape to left
    if (from.x < to.x) [from, to] = swap(from, to);
    rect.x = to.x;
    rect.y = intersection.y;
    rect.width = intersection.x - to.x;
    rect.height = intersection.height;
    if (!rect.width) {
        logger.debug('No space for selected layers, skipping...');
        return;
    }
    drawSpacingShape(layerName, rect, EdgeVertical.middle, root)
}

function drawRight(root: Group, layerName: string, from: SMRect, to: SMRect) {
    let rect = <SMRect>{};
    let intersection = getIntersection(from, to);
    if (!intersection) {
        logger.debug('No intersection for selected layers, skipping...');
        return;
    }
    sketch.find<Group>(
        `Group, [name="${layerName}"]`,
        root
    ).forEach(g => g.remove());

    // make sure from left shape (by right border) to right
    if (from.x + from.width > to.x + to.width) [from, to] = swap(from, to);
    rect.x = intersection.x + intersection.width;
    rect.y = intersection.y;
    rect.width = to.x + to.width - intersection.x - intersection.width;
    rect.height = intersection.height;
    if (!rect.width) {
        logger.debug('No space for selected layers, skipping...');
        return;
    }
    drawSpacingShape(layerName, rect, EdgeVertical.middle, root)
}

function drawSpacingShape(
    name: string,
    rect: SMRect,
    drawSizePosition: Edge | EdgeVertical,
    root: Group
) {
    let frame = new sketch.Rectangle(rect.x, rect.y, rect.width, rect.height);
    drawSizeForFrame(frame, drawSizePosition, {
        name: name,
        parent: root,
        background: context.meaxureStyles.spacing.background,
        foreground: context.meaxureStyles.spacing.foreground,
    });
}

function swap<T>(a: T, b: T): [T, T] {
    return [b, a];
}