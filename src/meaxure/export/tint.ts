// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { SMColor, SMGradient } from "../interfaces";
import { sketch } from "../../sketch";
import { logger } from "../common/logger";
import { LayerData } from "../interfaces";
import { parseColor } from "../helpers/styles";

let tintStack: Group[] = [];

export function clearTintStack(): void {
    tintStack = [];
}
function pushStackIfHasTint(layer: Layer): void {
    if (layer.type !== sketch.Types.Group) return;
    if (!layer.style.fills || !layer.style.fills.filter(f => f.enabled).length) return;
    // logger.debug(`Find tint in ${layer.name}`)
    tintStack.push(layer as Group);
}
export function updateTintStackAfterLayer(layer: Layer) {
    pushStackIfHasTint(layer);
    if (!tintStack.length) return;
    // check if tints still applies
    // remove tint from stack if meet stop layer
    while (true) {
        // pop all stopped tint stops from stack
        if (!tintStack.length) return;
        let tint = tintStack[tintStack.length - 1];
        let lastLayer = tint.getLastChildren();
        if (layer.id !== lastLayer.id) return;
        tintStack.pop();
    }
}
export function applyTint(layer: Layer, layerData: LayerData) {
    // If no active tints, nothing to do
    if (!tintStack.length) return;
    if (layer.type == sketch.Types.Group) return;
    // the first tint of the stack applied to current layer
    // logger.debug(`${layer.name} has tint from ${tintStack.reduce((p, c) => p += c.name + ',', '')}`)
    let tint = tintStack[0];
    // apply tint to fills and text color
    let tintFill = tint.style.fills.filter(f => f.enabled)[0];
    if (layerData.fills) layerData.fills.forEach(
        fill => {
            if (fill.fillType == sketch.Style.FillType.Color) {
                fill.color = applyTintToSMColor(fill.color, tintFill.color);
                return;
            } else if (fill.fillType == sketch.Style.FillType.Gradient) {
                fill.gradient = applyTintToSMGradient(fill.gradient, tintFill.color);
                return;
            }
        }
    );
    if (layerData.color) layerData.color = applyTintToSMColor(layerData.color, tintFill.color)
}
export function applyTintToSMColor(color: SMColor, tintColor: string): SMColor {
    if (!color) return color;
    // logger.debug(`current: ${color}, tint: ${tintColor}`);
    let tintAlpha = parseInt(tintColor.substr(7, 2), 16);
    let alpha = Math.round(color.alpha * tintAlpha / 255);
    // logger.debug(`new alpha: ${alpha.toString(16)}, ${alpha / 255 * 100}%`);
    let appliedColor = `${tintColor.substr(0, 7)}${alpha.toString(16)}`;
    color = parseColor(appliedColor);
    // logger.debug(`applied: ${color["rgba-hex"]}`);
    return color;
}
export function applyTintToSMGradient(gradient: SMGradient, tintColor: string): SMGradient {
    if (!gradient) return gradient;
    gradient.colorStops.forEach(stop => {
        stop.color = applyTintToSMColor(stop.color, tintColor);
    })
    return gradient;
}