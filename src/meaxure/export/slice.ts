// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { SMExportable, LayerData, SMExportFormat, SMType } from "../interfaces";
import { assetsPath } from ".";
import { context } from "../common/context";
import { exportImage } from "./files";
import { sketch } from "../../sketch";

let slices = [];
let sliceCache: { [key: string]: SMExportable[] } = {}

export function clearSliceCache(): void {
    slices = [];
    sliceCache = {};
}
export function getCollectedSlices(): any[] {
    return slices;
}
export function getSlice(layer: Layer, layerData: LayerData, symbolLayer: Layer) {
    let sliceLayer: Layer;
    if (layer.exportFormats.length > 0) {
        sliceLayer = symbolLayer || layer;
    } else if (layer.type == sketch.Types.SymbolInstance) {
        let layerMaster = (layer as SymbolInstance).master;
        // symbol instance of none, #4
        if (!layerMaster) return;
        if (!layerMaster.exportFormats.length) return;
        sliceLayer = layerMaster;
    }
    if (!sliceLayer) return;
    let layerID = sliceLayer.id;
    let layerName = sliceLayer.name;
    layerData.objectID = layerID;
    // export it, if haven't yet
    if (!sliceCache[layerID]) {
        NSFileManager.defaultManager()
            .createDirectoryAtPath_withIntermediateDirectories_attributes_error(assetsPath, true, nil, nil);
        sliceCache[layerID] = layerData.exportable = getExportable(sliceLayer);
        slices.push({
            name: layerName,
            objectID: layerID,
            rect: layerData.rect,
            exportable: layerData.exportable
        })
    } else if (sliceCache[layerID]) {
        layerData.exportable = sliceCache[layerID];
    }
}
function getExportable(layer: Layer): SMExportable[] {
    let exportable = [];
    let sizes = layer.exportFormats;
    let exportFormats = sizes.map(s => parseExportFormat(s, layer));
    for (let exportFormat of exportFormats) {
        let prefix = exportFormat.prefix || "",
            suffix = exportFormat.suffix || "";
        exportImage(layer, {
            scale: exportFormat.scale,
            prefix: prefix,
            suffix: suffix,
            format: exportFormat.format
        }, assetsPath, layer.name);

        exportable.push({
            name: layer.name,
            format: exportFormat.format,
            path: prefix + layer.name + suffix + "." + exportFormat.format
        });
    }

    return exportable;
}
function parseExportFormat(format: ExportFormat, layer: Layer): SMExportFormat {
    let scale = 1;
    let numberReg = /\d+(\.\d+)?/i;
    let sizeNumber = parseFloat(numberReg.exec(format.size)[0]);
    if (format.size.endsWith('x')) {
        scale = sizeNumber / context.configs.resolution;
    } else if (format.size.endsWith('h') || format.size.endsWith('height')) {
        scale = sizeNumber / layer.frame.height;
    } else if (format.size.endsWith('w') || format.size.endsWith('width') || format.size.endsWith('px')) {
        scale = sizeNumber / layer.frame.width;
    }
    return {
        scale: scale,
        suffix: format.suffix ? format.suffix : "",
        prefix: format.prefix ? format.prefix : "",
        format: format.fileFormat,
    }
}