import { SMExportable, LayerData, SMExportFormat } from "../interfaces";
import { assetsPath } from ".";
import { context } from "../common/context";
import { exportImage } from "./files";

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
    let objectID = layerData.objectID;
    if (layerData.type == "symbol") {
        objectID = (layer as SymbolInstance).master.id;
    } else if (symbolLayer) {
        objectID = symbolLayer.id;
    }
    // if layer is slice or an instance exportale symbol master
    // export it, if haven't yet
    if (
        (
            layerData.type == "slice" ||
            (layerData.type == "symbol" && (layer as SymbolInstance).master.exportFormats.length)
        ) && !sliceCache[objectID]
    ) {
        let sliceLayer: Layer = layer;
        if (layerData.type == "symbol") sliceLayer = (layer as SymbolInstance).master;

        NSFileManager
            .defaultManager()
            .createDirectoryAtPath_withIntermediateDirectories_attributes_error(assetsPath, true, nil, nil);

        sliceCache[objectID] = layerData.exportable = getExportable(sliceLayer);
        slices.push({
            name: layerData.name,
            objectID: objectID,
            rect: layerData.rect,
            exportable: layerData.exportable
        })
    } else if (sliceCache[objectID]) {
        layerData.exportable = sliceCache[objectID];
    }
}
function getExportable(layer: Layer, savePath?: string): SMExportable[] {
    let exportable = [];
    let sizes = layer.exportFormats;
    let fileFormat = sizes[0].fileFormat;
    let matchFormat = /png|jpg|tiff|webp/.exec(fileFormat);
    let exportFormats: SMExportFormat[];
    if (context.configs.units == "dp/sp" && matchFormat) {
        exportFormats = [{
            scale: 1 / context.configs.scale,
            prefix: "drawable-mdpi/",
            format: fileFormat
        },
        {
            scale: 1.5 / context.configs.scale,
            prefix: "drawable-hdpi/",
            format: fileFormat
        },
        {
            scale: 2 / context.configs.scale,
            prefix: "drawable-xhdpi/",
            format: fileFormat
        },
        {
            scale: 3 / context.configs.scale,
            prefix: "drawable-xxhdpi/",
            format: fileFormat
        },
        {
            scale: 4 / context.configs.scale,
            prefix: "drawable-xxxhdpi/",
            format: fileFormat
        }
        ]
    } else if (context.configs.units == "pt" && matchFormat) {
        exportFormats = [{
            scale: 1 / context.configs.scale,
            suffix: "",
            format: fileFormat
        },
        {
            scale: 2 / context.configs.scale,
            suffix: "@2x",
            format: fileFormat
        },
        {
            scale: 3 / context.configs.scale,
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