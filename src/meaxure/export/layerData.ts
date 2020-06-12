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
import { getSymbol } from "./symbol";
import { updateTintStackAfterLayer, applyTint } from "./tint";
import { stopwatch } from ".";
import { tempLayers } from "./tempLayers";

export function getLayerData(artboard: Artboard, layer: Layer, data: ArtboardData, byInfluence: boolean, symbolLayer?: Layer): Promise<boolean> {
    // stopwatch.tik('before updateMaskStackBeforeLayer');
    updateMaskStackBeforeLayer(layer, artboard);
    // stopwatch.tik('updateMaskStackBeforeLayer');
    let layerRect = getSMRect(layer, artboard, byInfluence);
    layerRect = applyMasks(layer, layerRect, artboard);
    if (!layerRect) {
        onLayerEnd(layer);
        return;
    }
    // stopwatch.tik('applyMasks');
    let note = makeNote(layer, artboard);
    if (note) {
        data.notes.push(note);
        onLayerEnd(layer);
        return;
    }
    // stopwatch.tik('make notes');
    let layerStates = getLayerStates(layer);
    // stopwatch.tik('getLayerStates');
    if (!isExportable(layer) ||
        layerStates.isHidden ||
        (layerStates.isLocked && layer.type != sketch.Types.Slice) ||
        layerStates.isEmptyText ||
        layerStates.isInSlice ||
        layerStates.isMeaXure ||
        layerStates.isInShapeGroup) {
        onLayerEnd(layer);
        return;
    }

    let layerType = getSMType(layer);
    // stopwatch.tik('get layerType');

    let layerData = <LayerData>{
        objectID: symbolLayer ? symbolLayer.id : layer.id,
        type: layerType,
        name: toHTMLEncode(emojiToEntities(layer.name)),
        rect: layerRect,
    };
    // stopwatch.tik('prepare layer data');
    getLayerStyles(layer, layerType, layerData);
    // stopwatch.tik('getLayerStyles');
    applyTint(layer, layerData);
    // stopwatch.tik('applyTint');
    getSlice(layer, layerData, symbolLayer);
    // stopwatch.tik('getSlice');
    data.layers.push(layerData);
    if (layerData.type == SMType.symbol) {
        getSymbol(artboard, layer as SymbolInstance, layerData, data, byInfluence);
    }
    getTextFragment(artboard, layer as Text, data);
    // stopwatch.tik('getTextFragment');
    onLayerEnd(layer);
}
function onLayerEnd(layer: Layer) {
    updateMaskStackAfterLayer(layer);
    updateTintStackAfterLayer(layer);
    // stopwatch.tik('update stack');
}
function getSMType(layer: Layer): SMType {
    if (layer.exportFormats.length > 0) return SMType.slice;
    let master = (layer as SymbolInstance).master;
    if (master && master.exportFormats.length) return SMType.slice;
    if (layer.type == sketch.Types.Text) return SMType.text;
    if (layer.type == sketch.Types.SymbolInstance) return SMType.symbol;
    return SMType.shape;
}

function getLayerStyles(layer: Layer, layerType: SMType, layerData: LayerData) {
    if (layerType != SMType.slice) {
        let layerStyle = layer.style;
        layerData.shadows = getShadowsFromStyle(layerStyle);
        layerData.rotation = layer.transform.rotation;
        layerData.opacity = layerStyle.opacity;
        if (layer.type !== sketch.Types.Group) {
            layerData.radius = getLayerRadius(layer);
            layerData.borders = getBordersFromStyle(layerStyle);
            // don't show tint fills for group
            layerData.fills = getFillsFromStyle(layerStyle);
            let sharedStyle = (layer as ShapePath).sharedStyle;
            layerData.styleName = sharedStyle ? sharedStyle.name : '';
        }
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
        layerFrame = layer.frameInfluence.changeBasis({ from: layer.parent as Group, to: artboard });
    } else {
        // export the default rect.
        layerFrame = layer.frame.changeBasis({ from: layer.parent as Group, to: artboard });
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
    let isHidden = false;
    let isLocked = false;
    let isInSlice = false;
    let isEmptyText = false;
    let isMeaXure = false;
    let isInShapeGroup = false;

    while (layer.type != sketch.Types.Artboard && layer.type != sketch.Types.SymbolMaster) {
        let parent = layer.parent as Group;
        if (!isMeaXure) isMeaXure = layer.name.startsWith('#meaxure-');
        // if parents is shape, this is in shape group
        if (!isInShapeGroup) isInShapeGroup = parent.type == sketch.Types.Shape;
        if (!isHidden) isHidden = layer.hidden && !tempLayers.exists(layer);
        if (!isLocked) isLocked = layer.locked;
        if (!isInSlice) isInSlice = parent.type == sketch.Types.Group && parent.exportFormats.length > 0;
        if (!isEmptyText) isEmptyText = layer.type == sketch.Types.Text && (layer as Text).isEmpty
        layer = parent;
    }
    return {
        isHidden: isHidden,
        isLocked: isLocked,
        isInSlice: isInSlice,
        isMeaXure: isMeaXure,
        isEmptyText: isEmptyText,
        isInShapeGroup: isInShapeGroup
    }
}