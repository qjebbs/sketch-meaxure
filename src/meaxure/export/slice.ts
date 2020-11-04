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
    let fileFormat = sizes[0].fileFormat;
    let matchFormat = /png|jpg|tiff|webp/.exec(fileFormat);
    let exportFormats: SMExportFormat[];
    if (context.configs.units == "dp/sp" && matchFormat) {
        exportFormats = [{
            scale: 1 / context.configs.resolution,
            prefix: "drawable-mdpi/",
            format: fileFormat
        },
        {
            scale: 1.5 / context.configs.resolution,
            prefix: "drawable-hdpi/",
            format: fileFormat
        },
        {
            scale: 2 / context.configs.resolution,
            prefix: "drawable-xhdpi/",
            format: fileFormat
        },
        {
            scale: 3 / context.configs.resolution,
            prefix: "drawable-xxhdpi/",
            format: fileFormat
        },
        {
            scale: 4 / context.configs.resolution,
            prefix: "drawable-xxxhdpi/",
            format: fileFormat
        }
        ]
    } else if (context.configs.units == "pt" && matchFormat) {
        exportFormats = [{
            scale: 1 / context.configs.resolution,
            suffix: "",
            format: fileFormat
        },
        {
            scale: 2 / context.configs.resolution,
            suffix: "@2x",
            format: fileFormat
        },
        {
            scale: 3 / context.configs.resolution,
            suffix: "@3x",
            format: fileFormat
        }
        ]
    } else {
        exportFormats = sizes.map(s => parseExportFormat(s, layer));
    }
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
            format: fileFormat,
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
        scale = sizeNumber;
    } else if (format.size.endsWith('h') || format.size.endsWith('height')) {
        scale = sizeNumber / layer.frame.height;
    } else if (format.size.endsWith('w') || format.size.endsWith('width') || format.size.endsWith('px')) {
        scale = sizeNumber / layer.frame.width;
    }
    return {
        scale: scale,
        suffix: !format.suffix && scale !== 1 ? '@' + format.size : format.suffix,
        prefix: format.prefix,
        format: format.fileFormat,
    }
}