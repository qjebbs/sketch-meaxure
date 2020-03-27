import { extend } from "./helper";
import { toJSString } from "./api";
import { context } from "../state/context";
import { SMExportFormat } from "./interfaces";

export function exportImage(layer: Layer, format: SMExportFormat, path: string, name: string) {
    let document = context.document;
    let slice = MSExportRequest.exportRequestsFromExportableLayer(layer.sketchObject).firstObject();
    let savePathName = [];

    slice.scale = format.scale;
    slice.format = format.format;

    savePathName.push(
        path,
        "/",
        format.prefix,
        name,
        format.suffix,
        ".",
        format.format
    );
    let savePath = savePathName.join("");

    document.saveArtboardOrSlice_toFile(slice, savePath);
    return savePath;
}

export function writeFile(options) {
    options = extend(options, {
        content: "Type something!",
        path: toJSString(NSTemporaryDirectory()),
        fileName: "temp.txt"
    })
    let content = NSString.stringWithString(options.content),
        savePathName = [];

    NSFileManager
        .defaultManager()
        .createDirectoryAtPath_withIntermediateDirectories_attributes_error(options.path, true, nil, nil);

    savePathName.push(
        options.path,
        "/",
        options.fileName
    );
    let savePath = savePathName.join("");

    content.writeToFile_atomically_encoding_error(savePath, false, 4, null);
}

export function getTextAttrs(str): any {
    let data = {},
        regExpAttr = new RegExp('([a-z\-]+)\=\"([^\"]+)\"', 'g'),
        regExpAttr1 = new RegExp('([a-z\-]+)\=\"([^\"]+)\"'),
        attrs = str.match(regExpAttr);
    for (let a = 0; a < attrs.length; a++) {
        let attrData = regExpAttr1.exec(attrs[a]),
            key = attrData[1],
            value = attrData[2];

        data[key] = value;
    }
    return data;
}
// export function getText(artboard, layer, layerData, data) {

//     if (layerData.type == "text" && layer.attributedString().treeAsDictionary().value.attributes.length > 1) {
//         if (hasEmoji(layer)) {
//             return false;
//         }
//         let svgExporter = SketchSVGExporter.new().exportLayers([layer.immutableModelObject()]),
//             svgStrong = toJSString(NSString.alloc().initWithData_encoding(svgExporter, 4)),
//             regExpTspan = new RegExp('<tspan([^>]+)>([^<]*)</tspan>', 'g'),
//             regExpContent = new RegExp('>([^<]*)<'),
//             offsetX, offsetY, textData = [],
//             layerRect = getRect(layer),
//             svgSpans = svgStrong.match(regExpTspan);

//         for (let a = 0; a < svgSpans.length; a++) {
//             let attrsData = getTextAttrs(svgSpans[a]);
//             attrsData.content = svgSpans[a].match(regExpContent)[1];
//             offsetX = (
//                 !offsetX ||
//                 (offsetX && offsetX > toJSNumber(attrsData.x))
//             ) ?
//                 toJSNumber(attrsData.x) : offsetX;

//             offsetY = (
//                 !offsetY ||
//                 (offsetY && offsetY > toJSNumber(attrsData.y))
//             ) ?
//                 toJSNumber(attrsData.y) : offsetY;

//             textData.push(attrsData);
//         }

//         let parentGroup = layer.parentGroup(),
//             parentRect = getRect(parentGroup),
//             colorHex = layerData.color["color-hex"].split(" ")[0];

//         textData.forEach(function (tData) {

//             if (
//                 tData["content"].trim() &&
//                 (
//                     colorHex != tData.fill ||
//                     Object.getOwnPropertyNames(tData).length > 4
//                 )
//             ) {
//                 let textLayer = addText(),
//                     colorRGB = hexToRgb(tData.fill || colorHex),
//                     color = MSColor.colorWithRed_green_blue_alpha(colorRGB.r / 255, colorRGB.g / 255, colorRGB.b / 255, (tData["fill-opacity"] || 1));

//                 textLayer.setName(tData.content);
//                 textLayer.setStringValue(tData.content);
//                 textLayer.setTextColor(color);
//                 textLayer.setFontSize(tData["font-size"] || layerData.fontSize);

//                 let defaultLineHeight = layer.font().defaultLineHeightForFont();

//                 textLayer.setLineHeight(layer.lineHeight() || defaultLineHeight);

//                 textLayer.setCharacterSpacing(toJSNumber(tData["letter-spacing"]) || layer.characterSpacing());
//                 textLayer.setTextAlignment(layer.textAlignment())

//                 if (tData["font-family"]) {
//                     textLayer.setFontPostscriptName(tData["font-family"].split(",")[0]);
//                 } else {
//                     textLayer.setFontPostscriptName(layer.fontPostscriptName());
//                 }

//                 parentGroup.addLayers([textLayer]);

//                 let textLayerRect = getRect(textLayer);

//                 textLayerRect.setX(layerRect.x + (toJSNumber(tData.x) - offsetX));
//                 textLayerRect.setY(layerRect.y + (toJSNumber(tData.y) - offsetY));

//                 getLayer(
//                     artboard,
//                     textLayer,
//                     data
//                 );

//                 removeLayer(textLayer);
//             }

//         });
//     }
// }
export function buildTemplate(content, data) {
    content = content.replace(new RegExp("\\<\\!\\-\\-\\s([^\\s\\-\\-\\>]+)\\s\\-\\-\\>", "gi"), function ($0, $1) {
        if ($1 in data) {
            return data[$1];
        } else {
            return $0;
        }
    });
    return content;
}