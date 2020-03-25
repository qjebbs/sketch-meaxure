import { extend, getDistance, find, hexToRgb, toHTMLEncode } from "../api/helper";
import { toJSString, is, rectToJSON, emojiToEntities, getRadius, getBorders, getFills, getShadows, getOpacity, getStyleName, colorToJSON, toJSNumber, getRect, removeLayer, addText } from "../api/api";
import { TextAligns, regexNames } from "../state/common";
import { context } from "../state/context";

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
export function exportImage(options) {
    options = extend(options, {
        layer: context.artboard,
        path: toJSString(NSTemporaryDirectory()),
        scale: 1,
        name: "preview",
        prefix: "",
        suffix: "",
        format: "png"
    });
    let document = context.document,
        slice = MSExportRequest.exportRequestsFromExportableLayer(options.layer).firstObject(),
        savePathName = [];

    slice.scale = options.scale;
    slice.format = options.format;

    savePathName.push(
        options.path,
        "/",
        options.prefix,
        options.name,
        options.suffix,
        ".",
        options.format
    );
    let savePath = savePathName.join("");

    document.saveArtboardOrSlice_toFile(slice, savePath);

    return savePath;
}
export function getLayer(artboard, layer, data, symbolLayer?) {
    let artboardRect = artboard.absoluteRect(),
        group = layer.parentGroup(),
        layerStates = getStates(layer);

    if (layer && is(layer, MSLayerGroup) && /#note-/.exec(layer.name())) {
        let textLayer;
        let children = layer.children();
        for (let i = 0; i < children.length; i++) {
            if (children[i].stringValue) {
                textLayer = children[i];
                break;
            }
        }

        data.notes.push({
            rect: rectToJSON(textLayer.absoluteRect(), artboardRect),
            note: toHTMLEncode(emojiToEntities(textLayer.stringValue())).replace(/\n/g, "<br>")
        });
        layer.setIsVisible(false);
    }

    if (
        !isExportable(layer) ||
        !layerStates.isVisible ||
        (layerStates.isLocked && !is(layer, MSSliceLayer)) ||
        layerStates.isEmpty ||
        layerStates.hasSlice ||
        layerStates.isMeasure ||
        layerStates.isShapeGroup
    ) {
        return this;
    }

    let layerType = is(layer, MSTextLayer) ? "text" :
        is(layer, MSSymbolInstance) ? "symbol" :
            is(layer, MSSliceLayer) || hasExportSizes(layer) ? "slice" :
                "shape";

    if (symbolLayer && layerType == "text" && layer.textBehaviour() == 0) { // fixed for v40
        layer.setTextBehaviour(1); // fixed for v40
        layer.setTextBehaviour(0); // fixed for v40
    } // fixed for v40

    let exportLayerRect;
    if (context.runningConfig.exportInfluenceRect == true && layerType != "text") {
        // export the influence rect.(include the area of shadows and outside borders...)
        let influenceCGRect = layer.absoluteInfluenceRect();
        exportLayerRect = {
            x: function () {
                return influenceCGRect.origin.x;
            },
            y: function () {
                return influenceCGRect.origin.y;
            },
            width: function () {
                return influenceCGRect.size.width;
            },
            height: function () {
                return influenceCGRect.size.height;
            }
        }
    } else {
        // export the default rect.
        exportLayerRect = layer.absoluteRect();
    }

    let layerData: any = {
        objectID: toJSString(layer.objectID()),
        type: layerType,
        name: toHTMLEncode(emojiToEntities(layer.name())),
        rect: rectToJSON(exportLayerRect, artboardRect)
    };

    if (symbolLayer) layerData.objectID = toJSString(symbolLayer.objectID());


    if (layerType != "slice") {
        let layerStyle = layer.style();
        layerData.rotation = layer.rotation();
        layerData.radius = getRadius(layer);
        layerData.borders = getBorders(layerStyle);
        layerData.fills = getFills(layerStyle);
        layerData.shadows = getShadows(layerStyle);
        layerData.opacity = getOpacity(layerStyle);
        layerData.styleName = getStyleName(layer);
    }

    if (layerType == "text") {
        layerData.content = toHTMLEncode(emojiToEntities(layer.stringValue()));
        layerData.color = colorToJSON(layer.textColor());
        layerData.fontSize = layer.fontSize();
        layerData.fontFace = toJSString(layer.fontPostscriptName());
        layerData.textAlign = TextAligns[layer.textAlignment()];
        layerData.letterSpacing = toJSNumber(layer.characterSpacing()) || 0;
        layerData.lineHeight = layer.lineHeight() || layer.font().defaultLineHeightForFont();
    }

    let layerCSSAttributes = layer.CSSAttributes(),
        css = [];

    for (let i = 0; i < layerCSSAttributes.count(); i++) {
        let c = layerCSSAttributes[i]
        if (!/\/\*/.exec(c)) css.push(toJSString(c));
    }
    if (css.length > 0) {
        layerData.css = css;
        if (is(layer, MSRectangleShape) && !!layer.fixedRadius()) {
            layerData.css.push('border-radius: ' + layer.cornerRadiusString().replace(/;/g, 'px ') + 'px;');
        }
    }

    getMask(group, layer, layerData, layerStates);
    getSlice(layer, layerData, symbolLayer);
    data.layers.push(layerData);
    getSymbol(artboard, layer, layerData, data);
    getText(artboard, layer, layerData, data);
}

export function hasExportSizes(layer) {
    return layer.exportOptions().exportFormats().count() > 0;
}
export function hasEmoji(layer) {
    let fonts = layer.attributedString().fontNames().allObjects();
    return !!/AppleColorEmoji/.exec(fonts);
}
export function isSliceGroup(layer) {
    return is(layer, MSLayerGroup) && hasExportSizes(layer);
}
export function isExportable(layer) {
    return is(layer, MSTextLayer) ||
        is(layer, MSShapeGroup) ||
        is(layer, MSRectangleShape) ||
        is(layer, MSOvalShape) ||
        is(layer, MSShapePathLayer) ||
        is(layer, MSTriangleShape) ||
        is(layer, MSStarShape) ||
        is(layer, MSPolygonShape) ||
        is(layer, MSBitmapLayer) ||
        is(layer, MSSliceLayer) ||
        is(layer, MSSymbolInstance) ||
        isSliceGroup(layer)
}
export function getStates(layer) {
    let isVisible = true,
        isLocked = false,
        hasSlice = false,
        isEmpty = false,
        isMaskChildLayer = false,
        isMeasure = false,
        isShapeGroup = false;

    while (!(is(layer, MSArtboardGroup) || is(layer, MSSymbolMaster))) {
        let group = layer.parentGroup();

        if (regexNames.exec(group.name())) {
            isMeasure = true;
        }

        if (is(group, MSShapeGroup)) {
            isShapeGroup = true;
        }

        if (!layer.isVisible()) {
            isVisible = false;
        }

        if (layer.isLocked()) {
            isLocked = true;
        }

        if (is(group, MSLayerGroup) && hasExportSizes(group)) {
            hasSlice = true
        }

        if (
            context.maskObjectID &&
            group.objectID() == context.maskObjectID &&
            !layer.shouldBreakMaskChain()
        ) {
            isMaskChildLayer = true
        }

        if (
            is(layer, MSTextLayer) &&
            layer.isEmpty()
        ) {
            isEmpty = true
        }

        layer = group;
    }
    return {
        isVisible: isVisible,
        isLocked: isLocked,
        hasSlice: hasSlice,
        isMaskChildLayer: isMaskChildLayer,
        isMeasure: isMeasure,
        isEmpty: isEmpty,
        isShapeGroup: isShapeGroup
    }
}
export function getMask(group, layer, layerData, layerStates) {
    if (layer.hasClippingMask()) {
        if (layerStates.isMaskChildLayer) {
            context.maskCache.push({
                objectID: context.maskObjectID,
                rect: context.maskRect
            });
        }
        context.maskObjectID = group.objectID();
        context.maskRect = layerData.rect;
    } else if (!layerStates.isMaskChildLayer && context.maskCache.length > 0) {
        let mask = context.maskCache.pop();
        context.maskObjectID = mask.objectID;
        context.maskRect = mask.rect;
        layerStates.isMaskChildLayer = true;
    } else if (!layerStates.isMaskChildLayer) {
        context.maskObjectID = undefined;
        context.maskRect = undefined;
    }

    if (layerStates.isMaskChildLayer) {
        let layerRect = layerData.rect;
        let maskRect = context.maskRect;

        layerRect.maxX = layerRect.x + layerRect.width;
        layerRect.maxY = layerRect.y + layerRect.height;
        maskRect.maxX = maskRect.x + maskRect.width;
        maskRect.maxY = maskRect.y + maskRect.height;

        let distance = getDistance(layerRect, maskRect),
            width = layerRect.width,
            height = layerRect.height;

        if (distance.left < 0) width += distance.left;
        if (distance.right < 0) width += distance.right;
        if (distance.top < 0) height += distance.top;
        if (distance.bottom < 0) height += distance.bottom;

        layerData.rect = {
            x: (distance.left < 0) ? maskRect.x : layerRect.x,
            y: (distance.top < 0) ? maskRect.y : layerRect.y,
            width: width,
            height: height
        }

    }
}
export function getFormats(exportFormats) {
    let formats = [];
    for (let i = 0; i < exportFormats.length; i++) {
        let format = exportFormats[i],
            prefix = "",
            suffix = "";

        if (format.namingScheme) {
            if (format.namingScheme()) {
                prefix = format.name();
            } else {
                suffix = format.name();
            }
        } else {
            suffix = format.name();
        }

        formats.push({
            scale: format.scale(),
            prefix: prefix,
            suffix: suffix,
            format: format.fileFormat()
        })
    }
    return formats;
}
export function getExportable(layer, savePath?) {
    let exportable = [],
        size, sizes = layer.exportOptions().exportFormats(),
        fileFormat = toJSString(sizes[0].fileFormat()),
        matchFormat = /png|jpg|tiff|webp/.exec(fileFormat);
    let exportFormats =
        (context.configs.units == "dp/sp" && matchFormat) ? [{
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
        ] :
            (context.configs.units == "pt" && matchFormat) ? [{
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
            ] :
                getFormats(sizes);

    for (let exportFormat of exportFormats) {
        let prefix = exportFormat.prefix || "",
            suffix = exportFormat.suffix || "";
        exportImage({
            layer: layer,
            path: context.assetsPath,
            scale: exportFormat.scale,
            name: layer.name(),
            prefix: prefix,
            suffix: suffix,
            format: exportFormat.format
        });

        exportable.push({
            name: toJSString(layer.name()),
            format: fileFormat,
            path: prefix + layer.name() + suffix + "." + exportFormat.format
        });
    }

    return exportable;
}
export function getSlice(layer, layerData, symbolLayer) {
    let objectID = (layerData.type == "symbol") ? toJSString(layer.symbolMaster().objectID()) :
        (symbolLayer) ? toJSString(symbolLayer.objectID()) :
            layerData.objectID;
    if (
        (
            layerData.type == "slice" ||
            (
                layerData.type == "symbol" &&
                hasExportSizes(layer.symbolMaster())
            )
        ) &&
        !context.sliceCache[objectID]
    ) {
        let sliceLayer = (layerData.type == "symbol") ? layer.symbolMaster() : layer;
        if (symbolLayer && is(symbolLayer.parentGroup(), MSSymbolMaster)) {
            layer.exportOptions().setLayerOptions(2);
        }

        context.assetsPath = context.savePath + "/assets";
        NSFileManager
            .defaultManager()
            .createDirectoryAtPath_withIntermediateDirectories_attributes_error(context.assetsPath, true, nil, nil);

        context.sliceCache[objectID] = layerData.exportable = getExportable(sliceLayer);
        context.slices.push({
            name: layerData.name,
            objectID: objectID,
            rect: layerData.rect,
            exportable: layerData.exportable
        })
    } else if (context.sliceCache[objectID]) {
        layerData.exportable = context.sliceCache[objectID];
    }
}
export function getSymbol(artboard, layer, layerData, data) {
    if (layerData.type == "symbol") {
        let symbolObjectID = toJSString(layer.symbolMaster().objectID());

        layerData.objectID = symbolObjectID;

        if (!hasExportSizes(layer.symbolMaster()) && layer.symbolMaster().children().count() > 1) {
            let symbolRect = getRect(layer),
                symbolChildren = layer.symbolMaster().children(),
                tempSymbol = layer.duplicate(),
                tempGroup = tempSymbol.detachStylesAndReplaceWithGroupRecursively(false);

            let tempSymbolLayers = tempGroup.children().objectEnumerator(),
                overrides = layer.overrides(),
                idx = 0;

            overrides = (overrides) ? overrides.objectForKey(0) : undefined;
            let hasSymbolBackgroud = symbolChildren.length < tempGroup.children().length;

            let tempSymbolLayer;
            while (tempSymbolLayer = tempSymbolLayers.nextObject()) {
                let symbolLayer = undefined;
                if (!hasSymbolBackgroud) {
                    symbolLayer = symbolChildren[idx]
                } else {
                    switch (idx) {
                        case 0:
                            symbolLayer = symbolChildren[0];
                            break;
                        case 1:
                            symbolLayer = undefined;
                            break;
                        default:
                            symbolLayer = symbolChildren[idx - 1];
                            break;
                    }
                }
                if (is(tempSymbolLayer, MSSymbolInstance)) {
                    let symbolMasterObjectID = toJSString(symbolLayer.objectID());
                    if (
                        overrides &&
                        overrides[symbolMasterObjectID] &&
                        !!overrides[symbolMasterObjectID].symbolID
                    ) {
                        let changeSymbol = find({
                            key: "(symbolID != NULL) && (symbolID == %@)",
                            match: toJSString(overrides[symbolMasterObjectID].symbolID)
                        }, context.document.documentData().allSymbols());
                        if (changeSymbol) {
                            tempSymbolLayer.changeInstanceToSymbol(changeSymbol);
                        } else {
                            tempSymbolLayer = undefined;
                        }
                    }
                }
                if (tempSymbolLayer) {
                    getLayer(
                        artboard,
                        tempSymbolLayer,
                        data,
                        symbolLayer
                    );
                }
                idx++
            }
            removeLayer(tempGroup);
        }
    }
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
export function getText(artboard, layer, layerData, data) {

    if (layerData.type == "text" && layer.attributedString().treeAsDictionary().value.attributes.length > 1) {
        if (hasEmoji(layer)) {
            return false;
        }
        let svgExporter = SketchSVGExporter.new().exportLayers([layer.immutableModelObject()]),
            svgStrong = toJSString(NSString.alloc().initWithData_encoding(svgExporter, 4)),
            regExpTspan = new RegExp('<tspan([^>]+)>([^<]*)</tspan>', 'g'),
            regExpContent = new RegExp('>([^<]*)<'),
            offsetX, offsetY, textData = [],
            layerRect = getRect(layer),
            svgSpans = svgStrong.match(regExpTspan);

        for (let a = 0; a < svgSpans.length; a++) {
            let attrsData = getTextAttrs(svgSpans[a]);
            attrsData.content = svgSpans[a].match(regExpContent)[1];
            offsetX = (
                !offsetX ||
                (offsetX && offsetX > toJSNumber(attrsData.x))
            ) ?
                toJSNumber(attrsData.x) : offsetX;

            offsetY = (
                !offsetY ||
                (offsetY && offsetY > toJSNumber(attrsData.y))
            ) ?
                toJSNumber(attrsData.y) : offsetY;

            textData.push(attrsData);
        }

        let parentGroup = layer.parentGroup(),
            parentRect = getRect(parentGroup),
            colorHex = layerData.color["color-hex"].split(" ")[0];

        textData.forEach(function (tData) {

            if (
                tData["content"].trim() &&
                (
                    colorHex != tData.fill ||
                    Object.getOwnPropertyNames(tData).length > 4
                )
            ) {
                let textLayer = addText(),
                    colorRGB = hexToRgb(tData.fill || colorHex),
                    color = MSColor.colorWithRed_green_blue_alpha(colorRGB.r / 255, colorRGB.g / 255, colorRGB.b / 255, (tData["fill-opacity"] || 1));

                textLayer.setName(tData.content);
                textLayer.setStringValue(tData.content);
                textLayer.setTextColor(color);
                textLayer.setFontSize(tData["font-size"] || layerData.fontSize);

                let defaultLineHeight = layer.font().defaultLineHeightForFont();

                textLayer.setLineHeight(layer.lineHeight() || defaultLineHeight);

                textLayer.setCharacterSpacing(toJSNumber(tData["letter-spacing"]) || layer.characterSpacing());
                textLayer.setTextAlignment(layer.textAlignment())

                if (tData["font-family"]) {
                    textLayer.setFontPostscriptName(tData["font-family"].split(",")[0]);
                } else {
                    textLayer.setFontPostscriptName(layer.fontPostscriptName());
                }

                parentGroup.addLayers([textLayer]);

                let textLayerRect = getRect(textLayer);

                textLayerRect.setX(layerRect.x + (toJSNumber(tData.x) - offsetX));
                textLayerRect.setY(layerRect.y + (toJSNumber(tData.y) - offsetY));

                getLayer(
                    artboard,
                    textLayer,
                    data
                );

                removeLayer(textLayer);
            }

        });
    }
}
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