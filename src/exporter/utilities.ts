import { extend, getDistance, find, hexToRgb } from "../api/helper";
import { toJSString, is, rectToJSON, toHTMLEncode, emojiToEntities, getRadius, getBorders, getFills, getShadows, getOpacity, getStyleName, colorToJSON, toJSNumber, getRect, removeLayer, addText } from "../api/api";
import { TextAligns, regexNames } from "../state/common";
import { context } from "../state/context";

export function writeFile(options) {
    var options = /*this.*/extend(options, {
        content: "Type something!",
        path: /*this.*/toJSString(NSTemporaryDirectory()),
        fileName: "temp.txt"
    }),
        content = NSString.stringWithString(options.content),
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
    var options = /*this.*/extend(options, {
        layer: /*this.*/context.artboard,
        path: /*this.*/toJSString(NSTemporaryDirectory()),
        scale: 1,
        name: "preview",
        prefix: "",
        suffix: "",
        format: "png"
    }),
        document = /*this.*/context.document,
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
    var artboardRect = artboard.absoluteRect(),
        group = layer.parentGroup(),
        layerStates = /*this.*/getStates(layer);

    if (layer && /*this.*/is(layer, MSLayerGroup) && /NOTE\#/.exec(layer.name())) {
        var textLayer;
        var children = layer.children();
        for (let i = 0; i < children.length; i++) {
            if (children[i].stringValue) {
                textLayer = children[i];
                break;
            }
        }

        data.notes.push({
            rect: /*this.*/rectToJSON(textLayer.absoluteRect(), artboardRect),
            note: /*this.*/toHTMLEncode(/*this.*/emojiToEntities(textLayer.stringValue())).replace(/\n/g, "<br>")
        });
        layer.setIsVisible(false);
    }

    if (
        !/*this.*/isExportable(layer) ||
        !layerStates.isVisible ||
        (layerStates.isLocked && !/*this.*/is(layer, MSSliceLayer)) ||
        layerStates.isEmpty ||
        layerStates.hasSlice ||
        layerStates.isMeasure ||
        layerStates.isShapeGroup
    ) {
        return this;
    }

    var layerType = /*this.*/is(layer, MSTextLayer) ? "text" :
        /*this.*/is(layer, MSSymbolInstance) ? "symbol" :
            /*this.*/is(layer, MSSliceLayer) || /*this.*/hasExportSizes(layer) ? "slice" :
                "shape";

    if (symbolLayer && layerType == "text" && layer.textBehaviour() == 0) { // fixed for v40
        layer.setTextBehaviour(1); // fixed for v40
        layer.setTextBehaviour(0); // fixed for v40
    } // fixed for v40

    var exportLayerRect;
    if (context.runningConfig.exportInfluenceRect == true && layerType != "text") {
        // export the influence rect.(include the area of shadows and outside borders...)
        var influenceCGRect = layer.absoluteInfluenceRect();
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

    var layerData: any = {
        objectID: /*this.*/toJSString(layer.objectID()),
        type: layerType,
        name: /*this.*/toHTMLEncode(/*this.*/emojiToEntities(layer.name())),
        rect: /*this.*/rectToJSON(exportLayerRect, artboardRect)
    };

    if (symbolLayer) layerData.objectID = /*this.*/toJSString(symbolLayer.objectID());


    if (layerType != "slice") {
        var layerStyle = layer.style();
        layerData.rotation = layer.rotation();
        layerData.radius = /*this.*/getRadius(layer);
        layerData.borders = /*this.*/getBorders(layerStyle);
        layerData.fills = /*this.*/getFills(layerStyle);
        layerData.shadows = /*this.*/getShadows(layerStyle);
        layerData.opacity = /*this.*/getOpacity(layerStyle);
        layerData.styleName = /*this.*/getStyleName(layer);
    }

    if (layerType == "text") {
        layerData.content = /*this.*/toHTMLEncode(/*this.*/emojiToEntities(layer.stringValue()));
        layerData.color = /*this.*/colorToJSON(layer.textColor());
        layerData.fontSize = layer.fontSize();
        layerData.fontFace = /*this.*/toJSString(layer.fontPostscriptName());
        layerData.textAlign = TextAligns[layer.textAlignment()];
        layerData.letterSpacing = /*this.*/toJSNumber(layer.characterSpacing()) || 0;
        layerData.lineHeight = layer.lineHeight() || layer.font().defaultLineHeightForFont();
    }

    var layerCSSAttributes = layer.CSSAttributes(),
        css = [];

    for (var i = 0; i < layerCSSAttributes.count(); i++) {
        var c = layerCSSAttributes[i]
        if (!/\/\*/.exec(c)) css.push(/*this.*/toJSString(c));
    }
    if (css.length > 0) {
        layerData.css = css;
        if (/*this.*/is(layer, MSRectangleShape) && !!layer.fixedRadius()) {
            layerData.css.push('border-radius: ' + layer.cornerRadiusString().replace(/;/g, 'px ') + 'px;');
        }
    }

    /*this.*/getMask(group, layer, layerData, layerStates);
    /*this.*/getSlice(layer, layerData, symbolLayer);
    data.layers.push(layerData);
    /*this.*/getSymbol(artboard, layer, layerData, data);
    /*this.*/getText(artboard, layer, layerData, data);
}

export function hasExportSizes(layer) {
    return layer.exportOptions().exportFormats().count() > 0;
}
export function hasEmoji(layer) {
    var fonts = layer.attributedString().fontNames().allObjects();
    return !!/AppleColorEmoji/.exec(fonts);
}
export function isSliceGroup(layer) {
    return /*this.*/is(layer, MSLayerGroup) && /*this.*/hasExportSizes(layer);
}
export function isExportable(layer) {
    return /*this.*/is(layer, MSTextLayer) ||
        /*this.*/is(layer, MSShapeGroup) ||
        /*this.*/is(layer, MSRectangleShape) ||
        /*this.*/is(layer, MSOvalShape) ||
        /*this.*/is(layer, MSShapePathLayer) ||
        /*this.*/is(layer, MSTriangleShape) ||
        /*this.*/is(layer, MSStarShape) ||
        /*this.*/is(layer, MSPolygonShape) ||
        /*this.*/is(layer, MSBitmapLayer) ||
        /*this.*/is(layer, MSSliceLayer) ||
        /*this.*/is(layer, MSSymbolInstance) ||
        /*this.*/isSliceGroup(layer)
}
export function getStates(layer) {
    var isVisible = true,
        isLocked = false,
        hasSlice = false,
        isEmpty = false,
        isMaskChildLayer = false,
        isMeasure = false,
        isShapeGroup = false;

    while (!(/*this.*/is(layer, MSArtboardGroup) || /*this.*/is(layer, MSSymbolMaster))) {
        var group = layer.parentGroup();

        if (/*this.*/regexNames.exec(group.name())) {
            isMeasure = true;
        }

        if (/*this.*/is(group, MSShapeGroup)) {
            isShapeGroup = true;
        }

        if (!layer.isVisible()) {
            isVisible = false;
        }

        if (layer.isLocked()) {
            isLocked = true;
        }

        if (/*this.*/is(group, MSLayerGroup) && /*this.*/hasExportSizes(group)) {
            hasSlice = true
        }

        if (
            /*this.*/context.maskObjectID &&
            group.objectID() == /*this.*/context.maskObjectID &&
            !layer.shouldBreakMaskChain()
        ) {
            isMaskChildLayer = true
        }

        if (
            /*this.*/is(layer, MSTextLayer) &&
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
            /*this.*/context.maskCache.push({
            objectID: /*this.*/context.maskObjectID,
            rect: /*this.*/maskRect
        });
        }
        /*this.*/context.maskObjectID = group.objectID();
        /*this.*/maskRect = layerData.rect;
    } else if (!layerStates.isMaskChildLayer && /*this.*/context.maskCache.length > 0) {
        var mask = /*this.*/context.maskCache.pop();
        /*this.*/context.maskObjectID = mask.objectID;
        /*this.*/maskRect = mask.rect;
        layerStates.isMaskChildLayer = true;
    } else if (!layerStates.isMaskChildLayer) {
        /*this.*/context.maskObjectID = undefined;
        /*this.*/maskRect = undefined;
    }

    if (layerStates.isMaskChildLayer) {
        var layerRect = layerData.rect,
            maskRect = /*this.*/maskRect;

        layerRect.maxX = layerRect.x + layerRect.width;
        layerRect.maxY = layerRect.y + layerRect.height;
        maskRect.maxX = maskRect.x + maskRect.width;
        maskRect.maxY = maskRect.y + maskRect.height;

        var distance = /*this.*/getDistance(layerRect, maskRect),
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
    var formats = [];
    for (var i = 0; i < exportFormats.length; i++) {
        var format = exportFormats[i],
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
    var exportable = [],
        size, sizes = layer.exportOptions().exportFormats(),
        fileFormat = /*this.*/toJSString(sizes[0].fileFormat()),
        matchFormat = /png|jpg|tiff|webp/.exec(fileFormat);
    var exportFormats =
        (/*self.*/context.configs.units == "dp/sp" && matchFormat) ? [{
            scale: 1 / /*self.*/context.configs.scale,
            prefix: "drawable-mdpi/",
            format: fileFormat
        },
        {
            scale: 1.5 / /*self.*/context.configs.scale,
            prefix: "drawable-hdpi/",
            format: fileFormat
        },
        {
            scale: 2 / /*self.*/context.configs.scale,
            prefix: "drawable-xhdpi/",
            format: fileFormat
        },
        {
            scale: 3 / /*self.*/context.configs.scale,
            prefix: "drawable-xxhdpi/",
            format: fileFormat
        },
        {
            scale: 4 / /*self.*/context.configs.scale,
            prefix: "drawable-xxxhdpi/",
            format: fileFormat
        }
        ] :
            (context.configs.units == "pt" && matchFormat) ? [{
                scale: 1 / /*self.*/context.configs.scale,
                suffix: "",
                format: fileFormat
            },
            {
                scale: 2 / /*self.*/context.configs.scale,
                suffix: "@2x",
                format: fileFormat
            },
            {
                scale: 3 / /*self.*/context.configs.scale,
                suffix: "@3x",
                format: fileFormat
            }
            ] :
        /*self.*/getFormats(sizes);

    for (let exportFormat of exportFormats) {
        var prefix = exportFormat.prefix || "",
            suffix = exportFormat.suffix || "";
        /*self.*/exportImage({
                layer: layer,
                path: /*self.*/context.assetsPath,
                scale: exportFormat.scale,
                name: layer.name(),
                prefix: prefix,
                suffix: suffix,
                format: exportFormat.format
            });

        exportable.push({
            name: /*self.*/toJSString(layer.name()),
            format: fileFormat,
            path: prefix + layer.name() + suffix + "." + exportFormat.format
        });
    }

    return exportable;
}
export function getSlice(layer, layerData, symbolLayer) {
    var objectID = (layerData.type == "symbol") ? /*this.*/toJSString(layer.symbolMaster().objectID()) :
        (symbolLayer) ? /*this.*/toJSString(symbolLayer.objectID()) :
            layerData.objectID;
    if (
        (
            layerData.type == "slice" ||
            (
                layerData.type == "symbol" &&
                /*this.*/hasExportSizes(layer.symbolMaster())
            )
        ) &&
        !/*this.*/context.sliceCache[objectID]
    ) {
        var sliceLayer = (layerData.type == "symbol") ? layer.symbolMaster() : layer;
        if (symbolLayer && /*this.*/is(symbolLayer.parentGroup(), MSSymbolMaster)) {
            layer.exportOptions().setLayerOptions(2);
        }

        /*this.*/context.assetsPath = /*this.*/context.savePath + "/assets";
        NSFileManager
            .defaultManager()
            .createDirectoryAtPath_withIntermediateDirectories_attributes_error(/*this.*/context.assetsPath, true, nil, nil);

        /*this.*/context.sliceCache[objectID] = layerData.exportable = /*this.*/getExportable(sliceLayer);
        /*this.*/context.slices.push({
                name: layerData.name,
                objectID: objectID,
                rect: layerData.rect,
                exportable: layerData.exportable
            })
    } else if (/*this.*/context.sliceCache[objectID]) {
        layerData.exportable = /*this.*/context.sliceCache[objectID];
    }
}
export function getSymbol(artboard, layer, layerData, data) {
    if (layerData.type == "symbol") {
        var symbolObjectID = /*this.*/toJSString(layer.symbolMaster().objectID());

        layerData.objectID = symbolObjectID;

        if (!/*self.*/hasExportSizes(layer.symbolMaster()) && layer.symbolMaster().children().count() > 1) {
            var symbolRect = /*this.*/getRect(layer),
                symbolChildren = layer.symbolMaster().children(),
                tempSymbol = layer.duplicate(),
                tempGroup = tempSymbol.detachStylesAndReplaceWithGroupRecursively(false);

            var tempSymbolLayers = tempGroup.children().objectEnumerator(),
                overrides = layer.overrides(),
                idx = 0;

            overrides = (overrides) ? overrides.objectForKey(0) : undefined;
            var hasSymbolBackgroud = symbolChildren.length < tempGroup.children().length;

            let tempSymbolLayer;
            while (tempSymbolLayer = tempSymbolLayers.nextObject()) {
                var symbolLayer = undefined;
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
                // if(layer) console.log(tempSymbolLayer.name());
                // if(symbolLayer) console.log(symbolLayer.name());
                // console.log("====");
                if (/*self.*/is(tempSymbolLayer, MSSymbolInstance)) {
                    var symbolMasterObjectID = /*self.*/toJSString(symbolLayer.objectID());
                    if (
                        overrides &&
                        overrides[symbolMasterObjectID] &&
                        !!overrides[symbolMasterObjectID].symbolID
                    ) {
                        var changeSymbol = /*self.*/find({
                            key: "(symbolID != NULL) && (symbolID == %@)",
                            match: /*self.*/toJSString(overrides[symbolMasterObjectID].symbolID)
                        }, /*self.*/context.document.documentData().allSymbols());
                        if (changeSymbol) {
                            tempSymbolLayer.changeInstanceToSymbol(changeSymbol);
                        } else {
                            tempSymbolLayer = undefined;
                        }
                    }
                }
                if (tempSymbolLayer) {
                    /*self.*/getLayer(
                    artboard,
                    tempSymbolLayer,
                    data,
                    symbolLayer
                );
                }
                idx++
            }
            /*this.*/removeLayer(tempGroup);
        }
    }
}
export function getTextAttrs(str): any {
    var data = {},
        regExpAttr = new RegExp('([a-z\-]+)\=\"([^\"]+)\"', 'g'),
        regExpAttr1 = new RegExp('([a-z\-]+)\=\"([^\"]+)\"'),
        attrs = str.match(regExpAttr);
    for (var a = 0; a < attrs.length; a++) {
        var attrData = regExpAttr1.exec(attrs[a]),
            key = attrData[1],
            value = attrData[2];

        data[key] = value;
    }
    return data;
}
export function getText(artboard, layer, layerData, data) {

    if (layerData.type == "text" && layer.attributedString().treeAsDictionary().value.attributes.length > 1) {
        if (/*this.*/hasEmoji(layer)) {
            return false;
        }
        var svgExporter = SketchSVGExporter.new().exportLayers([layer.immutableModelObject()]),
            svgStrong = /*this.*/toJSString(NSString.alloc().initWithData_encoding(svgExporter, 4)),
            regExpTspan = new RegExp('<tspan([^>]+)>([^<]*)</tspan>', 'g'),
            regExpContent = new RegExp('>([^<]*)<'),
            offsetX, offsetY, textData = [],
            layerRect = /*this.*/getRect(layer),
            svgSpans = svgStrong.match(regExpTspan);

        for (var a = 0; a < svgSpans.length; a++) {
            var attrsData = /*this.*/getTextAttrs(svgSpans[a]);
            attrsData.content = svgSpans[a].match(regExpContent)[1];
            offsetX = (
                !offsetX ||
                (offsetX && offsetX > /*this.*/toJSNumber(attrsData.x))
            ) ?
                /*this.*/toJSNumber(attrsData.x) : offsetX;

            offsetY = (
                !offsetY ||
                (offsetY && offsetY > /*this.*/toJSNumber(attrsData.y))
            ) ?
                /*this.*/toJSNumber(attrsData.y) : offsetY;

            textData.push(attrsData);
        }

        var parentGroup = layer.parentGroup(),
            parentRect = /*self.*/getRect(parentGroup),
            colorHex = layerData.color["color-hex"].split(" ")[0];

        textData.forEach(function (tData) {

            if (
                tData["content"].trim() &&
                (
                    colorHex != tData.fill ||
                    Object.getOwnPropertyNames(tData).length > 4
                )
            ) {
                var textLayer = /*self.*/addText(),
                    colorRGB = /*self.*/hexToRgb(tData.fill || colorHex),
                    color = MSColor.colorWithRed_green_blue_alpha(colorRGB.r / 255, colorRGB.g / 255, colorRGB.b / 255, (tData["fill-opacity"] || 1));

                textLayer.setName(tData.content);
                textLayer.setStringValue(tData.content);
                textLayer.setTextColor(color);
                textLayer.setFontSize(tData["font-size"] || layerData.fontSize);

                var defaultLineHeight = layer.font().defaultLineHeightForFont();

                textLayer.setLineHeight(layer.lineHeight() || defaultLineHeight);

                textLayer.setCharacterSpacing(/*self.*/toJSNumber(tData["letter-spacing"]) || layer.characterSpacing());
                textLayer.setTextAlignment(layer.textAlignment())

                if (tData["font-family"]) {
                    textLayer.setFontPostscriptName(tData["font-family"].split(",")[0]);
                } else {
                    textLayer.setFontPostscriptName(layer.fontPostscriptName());
                }

                parentGroup.addLayers([textLayer]);

                var textLayerRect = /*self.*/getRect(textLayer);

                textLayerRect.setX(layerRect.x + (/*self.*/toJSNumber(tData.x) - offsetX));
                textLayerRect.setY(layerRect.y + (/*self.*/toJSNumber(tData.y) - offsetY));

                /*self.*/getLayer(
                    artboard,
                    textLayer,
                    data
                );

                /*self.*/removeLayer(textLayer);
            }

        });
    }
}
export function buildTemplate(content, data) {
    var content = content.replace(new RegExp("\\<\\!\\-\\-\\s([^\\s\\-\\-\\>]+)\\s\\-\\-\\>", "gi"), function ($0, $1) {
        if ($1 in data) {
            return data[$1];
        } else {
            return $0;
        }
    });
    return content;
}