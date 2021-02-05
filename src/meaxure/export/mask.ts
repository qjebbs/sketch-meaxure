// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { SMRect } from "../interfaces";
import { getIntersection } from "../helpers/helper";

interface MaskStackData {
    mask: Layer,
    stopAt: Layer,
    rect: SMRect,
}
let maskStack: MaskStackData[] = [];

export function clearMaskStack(): void {
    maskStack = [];
}
export function updateMaskStackBeforeLayer(layer: Layer) {
    // This function depends on the enumerate order of layers.
    // It requires the enumeration order from bottom layer to up, 
    // children first siblings later, which is same to mask influence direction.
    // So we firstly meet the mask layer, then it's influenced siblings and their children.

    // check if masks still applies
    validateMasks(layer);
    tryAddMask(layer);
}
export function applyMasks(layer: Layer, layerRect: SMRect, artboard: Artboard): SMRect {
    // if (maskStack.length) logger.debug(`${layer.name} has clip mask of ${maskStack.reduce((p, c) => p += c.mask.name + ',', '')}`)
    for (let mask of maskStack) {
        // caculate intersection of layer and mask, as the clipped frame of the layer
        layerRect = getIntersection(mask.rect, layerRect);
    }
    // caculate intersection of layer and artboard
    layerRect = getIntersection(artboard.frame.changeBasis({ from: artboard.parent, to: artboard }), layerRect);
    return layerRect;
}
function validateMasks(layer: Layer) {
    if (!maskStack.length) return;
    // remove mask from stack if meet stop layer
    // We must loop until current not match,
    // given that we can have 2 or more masks in one group.
    for (let i = maskStack.length - 1; i >= 0; i--) {
        let m = maskStack[i];
        if (layer.id !== m.stopAt.id) {
            break;
        }
        // console.log(`mask ${m.mask.name} stops at layer ${m.stopAt.name}`);
        maskStack.pop();
    }
}
function tryAddMask(layer: Layer) {
    if (!layer.hasClippingMask) {
        return
    }
    // find a mask, keep in stack. 
    let stopAt: Layer;
    let sibilings = (layer.parent as Group).layers;
    for (let i = layer.index + 1; i < sibilings.length; i++) {
        if (sibilings[i].shouldBreakMaskChain) {
            stopAt = sibilings[i];
            break;
        }
    }
    if (!stopAt) stopAt = layer.parent as Layer;
    // console.log(`find mask ${layer.name} will stop at layer ${stopAt.name}`);
    maskStack.push({
        mask: layer,
        stopAt: stopAt,
        rect: layer.frame.changeBasis({
            from: layer.parent as Group,
            to: layer.getParentArtboard(),
        })
    });
}
