import { SMRect } from "../interfaces";
import { sketch } from "../../sketch";
import { logger } from "../common/logger";
import { LayerData } from "../interfaces";

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
        let groupLayers = m.stopAfterGroup.layers;
        let lastLayer = groupLayers[groupLayers.length - 1];
        if (lastLayer.type == sketch.Types.Group) {
            groupLayers = lastLayer.allSubLayers();
            lastLayer = groupLayers[groupLayers.length - 1];
        }
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
        let sibilings = layer.parent.layers;
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
            stopAfterGroup: layer.parent,
            rect: layer.frame.changeBasis({
                from: layer.parent,
                to: artboard,
            })
        });
    }
}
export function applyMasks(layer: Layer, layerData: LayerData) {
    // If no active masks, nothing to do
    if (!maskStack.length) return;
    // we have currentMask applied to current layer
    // logger.debug(`${layer.name} has clip mask of ${maskStack.reduce((p, c) => p += c.mask.name + ',', '')}`)
    let layerRect = layerData.rect;
    for (let mask of maskStack) {
        layerRect = getIntersection(mask.rect, layerRect)
    }
    // caculate intersection of layer and mask, as the clipped frame of the layer
    layerData.rect = layerRect;
}
function getIntersection(a: SMRect, b: SMRect): SMRect {
    let x1 = Math.max(a.x, b.x);
    let y1 = Math.max(a.y, b.y);
    let x2 = Math.min(a.x + a.width, b.x + b.width);
    let y2 = Math.min(a.y + a.height, b.y + b.height);
    let width = x2 - x1;
    let height = y2 - y1;
    if (width < 0 || height < 0) {
        // no intersection
        width = 0;
        height = 0;
    }
    return {
        x: x1,
        y: y1,
        width: width,
        height: height,
    }
}