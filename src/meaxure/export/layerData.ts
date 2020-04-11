// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { ArtboardData, LayerData, SMType, LayerStates } from "../interfaces";
import { sketch } from "../../sketch";
import { toHTMLEncode, emojiToEntities } from "../helpers/helper";
import { getTextFragment } from "./textFragment";
import { updateMaskStackBeforeLayer, applyMasks, updateMaskStackAfterLayer } from "./mask";
import { getLayerRadius, getBordersFromStyle, getFillsFromStyle, getShadowsFromStyle, parseColor } from "../helpers/styles";
import { SMRect } from "../interfaces";
import { getSlice } from "./slice";
import { makeNote } from "./note";
import { regexNames } from "../common/common";
import { getSymbol } from "./symbol";
import { updateTintStackAfterLayer, applyTint } from "./tint";

export function getLayerData(artboard: Artboard, layer: Layer, data: ArtboardData, byInfluence: boolean, symbolLayer?: Layer): Promise<boolean> {

    updateMaskStackBeforeLayer(layer, artboard);

    let note = makeNote(layer, artboard);
    if (note) {
        data.notes.push(note);
        return;
    }

    let layerStates = getLayerStates(layer);
    if (!isExportable(layer) ||
        !layerStates.isVisible ||
        (layerStates.isLocked && layer.type != sketch.Types.Slice) ||
        layerStates.isEmptyText ||
        layerStates.hasSlice ||
        layerStates.isMeaXure ||
        layerStates.isInShapeGroup) {
        updateMaskStackAfterLayer(layer);
        updateTintStackAfterLayer(layer);
        return;
    }

    let layerType = getSMType(layer);

    // if (symbolLayer && layerType == "text" && layer.textBehaviour() == 0) { // fixed for v40
    //     layer.setTextBehaviour(1); // fixed for v40
    //     layer.setTextBehaviour(0); // fixed for v40
    // } // fixed for v40

    let layerData = <LayerData>{
        objectID: symbolLayer ? symbolLayer.id : layer.id,
        type: layerType,
        name: toHTMLEncode(emojiToEntities(layer.name)),
        rect: getSMRect(layer, artboard, byInfluence),
    };
    getLayerStyles(layer, layerType, layerData);
    applyMasks(layer, layerData);
    applyTint(layer, layerData);
    getSlice(layer, layerData, symbolLayer);
    data.layers.push(layerData);
    if (layerData.type == "symbol") {
        getSymbol(artboard, layer as SymbolInstance, layerData, data, byInfluence);
    }
    getTextFragment(artboard, layer as Text, data);
    updateMaskStackAfterLayer(layer);
    updateTintStackAfterLayer(layer);
}
function getSMType(layer: Layer): SMType {
    if (layer.type == sketch.Types.Text) return "text";
    if (layer.type == sketch.Types.SymbolInstance) return "symbol";
    if (layer.type == sketch.Types.Slice || layer.exportFormats.length > 0) return "slice";
    return "shape";
}

function getLayerStyles(layer: Layer, layerType: SMType, layerData: LayerData) {
    if (layerType != "slice") {
        let layerStyle = layer.style;
        layerData.rotation = layer.transform.rotation;
        layerData.radius = getLayerRadius(layer);
        layerData.borders = getBordersFromStyle(layerStyle);
        layerData.fills = getFillsFromStyle(layerStyle);
        layerData.shadows = getShadowsFromStyle(layerStyle);
        layerData.opacity = layerStyle.opacity;
        let sharedStyle = (layer as Group).sharedStyle;
        layerData.styleName = sharedStyle ? sharedStyle.name : '';
    }
    if (layerType == "text") {
        let text = layer as Text;
        layerData.content = toHTMLEncode(emojiToEntities(text.text));
        layerData.color = parseColor(text.style.textColor);
        layerData.fontSize = text.style.fontSize;
        layerData.fontFace = text.style.fontFamily;
        layerData.textAlign = text.style.alignment;
        layerData.letterSpacing = text.style.kerning || 0;
        layerData.lineHeight = text.style.lineHeight;
    }
    layerData.css = layer.CSSAttributes.filter(attr => !/\/\*/.test(attr));
}
function getSMRect(layer: Layer, artboard: Artboard, byInfluence: boolean): SMRect {
    let layerFrame: Rectangle;
    if (byInfluence && layer.type != sketch.Types.Text) {
        // export the influence rect.(include the area of shadows and outside borders...)
        layerFrame = layer.frameInfluence;
    } else {
        // export the default rect.
        layerFrame = layer.frame.changeBasis({ from: layer.parent, to: artboard });
    }
    return {
        x: layerFrame.x,
        y: layerFrame.y,
        width: layerFrame.width,
        height: layerFrame.height,
    }
}
function isExportable(layer: Layer) {
    return layer.type == sketch.Types.Text ||
        layer.type == sketch.Types.Group ||
        layer.type == sketch.Types.Shape ||
        layer.type == sketch.Types.ShapePath ||
        layer.type == sketch.Types.Image ||
        layer.type == sketch.Types.Slice ||
        layer.type == sketch.Types.SymbolInstance
}
function getLayerStates(layer: Layer): LayerStates {
    let isVisible = true;
    let isLocked = false;
    let hasSlice = false;
    let isEmptyText = false;
    let isMeaXure = false;
    let isInShapeGroup = false;

    while (layer.type != sketch.Types.Artboard && layer.type != sketch.Types.SymbolMaster) {
        let parent = layer.parent;
        if (!isMeaXure) isMeaXure = regexNames.test(layer.name);
        // if parents is shape, this is in shape group
        if (!isInShapeGroup) isInShapeGroup = parent.type == sketch.Types.Shape;
        if (!isVisible) isVisible = !layer.hidden;
        if (!isLocked) isLocked = layer.locked;
        if (!hasSlice) hasSlice = parent.type == sketch.Types.Group && parent.exportFormats.length > 0;
        if (!isEmptyText) isEmptyText = layer.type == sketch.Types.Text && (layer as Text).isEmpty
        layer = parent;
    }
    return {
        isVisible: isVisible,
        isLocked: isLocked,
        hasSlice: hasSlice,
        isMeaXure: isMeaXure,
        isEmptyText: isEmptyText,
        isInShapeGroup: isInShapeGroup
    }
}