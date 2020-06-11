// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { SMRect } from "../interfaces";
import { sketch } from "../../sketch";
import { logger } from "../common/logger";
import { LayerData } from "../interfaces";
import { getIntersection } from "../helpers/helper";

interface MaskStackData {
    mask: Layer,
    stopBeforeLayer: Layer,
    stopAfterGroup: Group,
    rect: SMRect,
}
let maskStack: MaskStackData[] = [];

export function clearMaskStack(): void {
    maskStack = [];
}
export function updateMaskStackAfterLayer(layer: Layer) {
    if (!maskStack.length) return;
    // check if masks still applies
    // remove mask from stack if meet stop layer
    let tempStack = [];
    for (let m of maskStack) {
        // We must enumerate the whole stack masks,
        // given that 2 or more masks end on the same layer:
        // When a parent mask gourp, includes a child mask gourp,
        // parent mask ends on last layer of last child (which is the child mask group),
        // child mask ends on last layer of itself,
        // they are the same one.
        if (!m.stopAfterGroup) continue;
        let lastLayer = m.stopAfterGroup.getLastChildren();

        // if current is the last child layer of the stop group, mask stops
        if (layer.id == lastLayer.id) {
            // logger.debug(`mask ${m.mask.name} stops after layer ${layer.name} of group ${m.stopAfterGroup.name}`);
            continue;
        }
        tempStack.push(m);
    }
    maskStack = tempStack;
}
export function updateMaskStackBeforeLayer(layer: Layer, artboard: Artboard) {
    // check if masks still applies
    if (maskStack.length) {
        // remove mask from stack if meet stop layer
        let tempStack = [];
        for (let m of maskStack) {
            if (m.stopBeforeLayer && layer.id == m.stopBeforeLayer.id) {
                // logger.debug(`mask ${m.mask.name} stops before layer ${layer.name}`);
                continue;
            }
            tempStack.push(m);
        }
        maskStack = tempStack;
    }
    // This function depends on the enumerate order of layers.
    // It requires the enumeration order from bottom layer to up, 
    // children first siblings later, which is same to mask influence direction.
    // So we firstly meet the mask layer, then it's influenced siblings and their children.
    if (layer.hasClippingMask) {
        // find a mask, keep in stack. 
        let breakMaskLayer: Layer;
        let sibilings = (layer.parent as Group).layers;
        for (let i = layer.index + 1; i < sibilings.length; i++) {
            if (sibilings[i].shouldBreakMaskChain) {
                breakMaskLayer = layer;
                break;
            }
        }
        maskStack.push({
            mask: layer,
            stopBeforeLayer: breakMaskLayer,
            // we still set the stopAfterGroup, since the breakMaskLayer 
            // could have chances to be deleted before enumerate to it
            stopAfterGroup: layer.parent as Group,
            rect: layer.frame.changeBasis({
                from: layer.parent as Group,
                to: artboard,
            })
        });
    }
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