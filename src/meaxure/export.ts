import { exportPanel } from "../panels/exportPanel";
import { sketch } from "../sketch";
import { localize } from "../state/language";
import { context } from "../state/context";
import { createWebviewPanel } from "../webviewPanel";
import { toSlug, emojiToEntities } from "../api/api";
import { toHTMLEncode, tik } from "../api/helper";
import { writeFile, buildTemplate, exportImage } from "../api/utilities";
import { regexNames } from "../state/common";
import { SMRect } from "../api/interfaces-deprecated";
import { logger } from "../api/logger";
import { SMExportable, ExportData, ArtboardData, LayerData, SMNote, LayerStates, SMExportFormat, SMType } from "../api/interfaces";
import { getBordersFromStyle, getFillsFromStyle, getShadowsFromStyle, parseColor, getLayerRadius } from "../api/styles";

interface MaskStackData {
    mask: Layer,
    stopBeforeLayer: Layer,
    stopAfterGroup: Group,
    rect: SMRect,
}

let slices = [];
let colors = [];
let maskStack: MaskStackData[];
let sliceCache: { [key: string]: SMExportable[] } = {}
let tempDetachedGroups: Group[] = [];
let savePath: string;
let assetsPath: string;
let exporting = false;
export async function exportSpecification() {
    if (exporting) {
        sketch.UI.message('Please wait for former task to exit.');
        return;
    }
    let results = await exportPanel();
    if (!results) return;
    if (results.selectionArtboards.length <= 0) return false;
    savePath = sketch.UI.savePanel(
        localize("Export spec"),
        localize("Export to:"),
        localize("Export"),
        true,
        context.document.displayName().stringByDeletingPathExtension()
    );
    if (!savePath) return;

    exporting = true;
    let stopWatch = tik();
    slices = [];
    colors = [];
    maskStack = [];
    sliceCache = {};
    tempDetachedGroups = [];
    let processingPanel = createWebviewPanel({
        url: context.resourcesRoot + "/panel/processing.html",
        width: 304,
        height: 104,
    });
    processingPanel.onClose(() => cancelled = true);
    processingPanel.show();
    let onFinishCleanup = function () {
        for (let tmp of tempDetachedGroups) {
            if (tmp) tmp.remove();
        }
        exporting = false;
        processingPanel.close();
    }
    let template = NSString.stringWithContentsOfFile_encoding_error(context.resourcesRoot + "/template.html", 4, nil);
    let data: ExportData = {
        scale: context.configs.scale,
        unit: context.configs.units,
        colorFormat: context.configs.format,
        artboards: [],
        slices: [],
        colors: []
    };

    let cancelled = false;
    let layerIndex = 0;
    for (let i = 0; i < results.selectionArtboards.length; i++) {
        let artboard = results.selectionArtboards[i];
        let page = artboard.parent as Page;
        let fileName = toSlug(page.name + ' ' + artboard.name);
        data.artboards[i] = <ArtboardData>{
            notes: [],
            layers: [],
        };
        data.artboards[i].pageName = toHTMLEncode(emojiToEntities(page.name));
        data.artboards[i].pageObjectID = page.id;
        data.artboards[i].name = toHTMLEncode(emojiToEntities(artboard.name));
        data.artboards[i].slug = fileName
        data.artboards[i].objectID = artboard.id;
        data.artboards[i].width = artboard.frame.width;
        data.artboards[i].height = artboard.frame.height;
        for (let layer of artboard.allSubLayers()) {
            layerIndex++;
            if (cancelled) {
                onFinishCleanup();
                sketch.UI.message('Cancelled by user.');
                return;
            }
            processingPanel.postMessage('process', {
                percentage: Math.round(layerIndex / results.allCount * 100),
                text: localize("Processing layer %@ of %@", [layerIndex, results.allCount])
            });
            let taskError: Error;
            await getLayerTask(artboard, layer, data.artboards[i], results.byInfluence)
                .catch(err => taskError = err);
            if (taskError) {
                onFinishCleanup();
                logger.error(taskError);
                return;
            }
        }
        if (results.advancedMode) {
            exportArtboardAdvanced(artboard, data.artboards[i], savePath, i);
        }
        else {
            exportArtboard(artboard, data.artboards[i], savePath, template);
        }
    }
    data.slices = slices;
    data.colors = colors;

    let selectingPath = savePath;
    if (results.advancedMode) {
        writeFile({
            content: buildTemplate(template, {
                lang: context.languageData,
                data: JSON.stringify(data)
            }),
            path: savePath,
            fileName: "index.html"
        });
        selectingPath = savePath + "/index.html";
    }
    onFinishCleanup();
    NSWorkspace.sharedWorkspace().activateFileViewerSelectingURLs([NSURL.fileURLWithPath(selectingPath)]);
    sketch.UI.message(localize("Export complete! Takes %s seconds", [stopWatch.tok() / 1000]));
}

function getLayerTask(artboard: Artboard, layer: Layer, data: ArtboardData, byInfluence: boolean, symbolLayer?: Layer): Promise<boolean> {
    return new Promise<true>((resolve, reject) => {
        try {
            getLayerData(artboard, layer, data, byInfluence, symbolLayer)
        } catch (error) {
            reject(error)
        }
        resolve(true);
    });
}

function exportArtboardAdvanced(artboard: Artboard, data: ArtboardData, savePath: string, index: number) {
    // data.artboards[artboardIndex].imagePath = "preview/" + objectID + ".png";
    data.imagePath = "preview/" + encodeURI(data.slug) + ".png";

    exportImage(artboard, {
        format: 'png',
        scale: 2,
    }, savePath + "/preview", data.slug);

    writeFile({
        content: "<meta http-equiv=\"refresh\" content=\"0;url=../index.html#artboard" + index + "\">",
        path: savePath + "/links",
        fileName: data.slug + ".html"
    });
}

function exportArtboard(artboard: Artboard, data: ArtboardData, savePath: string, template: string) {
    let imageURL = NSURL.fileURLWithPath(
        exportImage(
            artboard,
            {
                format: 'png',
                scale: 2,
            }, savePath, data.objectID
        )
    );
    let imageData = NSData.dataWithContentsOfURL(imageURL);
    let imageBase64 = imageData.base64EncodedStringWithOptions(0);
    data.imageBase64 = 'data:image/png;base64,' + imageBase64;

    let newData = JSON.parse(JSON.stringify(data));
    newData.artboards = [data];

    writeFile({
        content: buildTemplate(template, {
            lang: context.languageData,
            data: JSON.stringify(newData)
        }),
        path: savePath,
        fileName: data.slug + ".html"
    });
}

function getLayerData(artboard: Artboard, layer: Layer, data: ArtboardData, byInfluence: boolean, symbolLayer?: Layer): Promise<boolean> {

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
    applyMasks(layer, layerData, artboard);
    getSlice(layer, layerData, symbolLayer);
    data.layers.push(layerData);
    if (layerData.type == "symbol") {
        getSymbol(artboard, layer as SymbolInstance, layerData, data, byInfluence);
    }
    // TODO: get sub text
    // getText(artboard, layer, layerData, data);
    updateMaskStackAfterLayer(layer);
}

function makeNote(layer: Layer, artboard: Artboard): SMNote {
    if (!layer || layer.type != sketch.Types.Group || ! /#note-/.test(layer.name)) return undefined;
    let textLayer: Text;
    let layers = layer.allSubLayers();
    for (let layer of layers) {
        if (layer.type == sketch.Types.Text) {
            textLayer = layer as Text;
            break;
        }
    }
    layer.hidden = true;
    return <SMNote>{
        rect: layer.frame.changeBasis({ from: layer.parent, to: artboard }),
        note: toHTMLEncode(emojiToEntities(textLayer.text).replace(/\n/g, "<br>")),
    };
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
function getSMType(layer: Layer): SMType {
    if (layer.type == sketch.Types.Text) return "text";
    if (layer.type == sketch.Types.SymbolInstance) return "symbol";
    if (layer.type == sketch.Types.Slice || layer.exportFormats.length > 0) return "slice";
    return "shape";
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
function updateMaskStackAfterLayer(layer: Layer) {
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
            logger.debug(`mask ${m.mask.name} stops after layer ${layer.name} of group ${m.stopAfterGroup.name}`);
            continue;
        }
        tempStack.push(m);
    }
    maskStack = tempStack;
}
function updateMaskStackBeforeLayer(layer: Layer, artboard: Artboard) {
    // check if masks still applies
    if (maskStack.length) {
        // remove mask from stack if meet stop layer
        let tempStack = [];
        for (let m of maskStack) {
            if (m.stopBeforeLayer && layer.id == m.stopBeforeLayer.id) {
                logger.debug(`mask ${m.mask.name} stops before layer ${layer.name}`);
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
        if (!breakMaskLayer) {
            logger.debug(`find mask ${layer.name} stops after group ${layer.parent.name}`);
        } else {
            logger.debug(`find mask ${layer.name} stops before layer ${breakMaskLayer.name}`);
        }
        maskStack.push({
            mask: layer,
            stopBeforeLayer: breakMaskLayer,
            stopAfterGroup: layer.parent,
            rect: layer.frame.changeBasis({
                from: layer.parent,
                to: artboard,
            })
        });
    }
}
function applyMasks(layer: Layer, layerData: LayerData, artboard: Artboard) {
    // If no active masks, nothing to do
    if (!maskStack.length) return;
    // we have currentMask applied to current layer
    logger.debug(`${layer.name} has clip mask of ${maskStack.reduce((p, c) => p += c.mask.name + ',', '')}`)
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
function getSlice(layer: Layer, layerData: LayerData, symbolLayer: Layer) {
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

        assetsPath = savePath + "/assets";
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
function getSymbol(artboard: Artboard, layer: SymbolInstance, layerData: LayerData, data: ArtboardData, byInfluence: boolean) {
    if (layerData.type != "symbol") return;
    let master = layer.master
    let masterID = master.id;

    layerData.objectID = masterID;

    if (master.exportFormats.length || master.allSubLayers().length < 2) return;
    let tempInstance = layer.duplicate() as SymbolInstance;
    let tempGroup = tempInstance.detach({ recursively: false });
    tempDetachedGroups.push(tempGroup);

    let idx = 0;
    let masterAllLayers = master.allSubLayers();
    let instanceAllLayers = tempGroup.allSubLayers();
    let hasSymbolBackgroud = masterAllLayers.length < instanceAllLayers.length;

    for (let instanceLayer of instanceAllLayers) {
        let masterLayer: Layer = undefined;
        if (!hasSymbolBackgroud) {
            masterLayer = masterAllLayers[idx]
        } else {
            switch (idx) {
                case 0:
                    masterLayer = masterAllLayers[0];
                    break;
                case 1:
                    break;
                default:
                    masterLayer = masterAllLayers[idx - 1];
                    break;
            }
        }
        if (!masterLayer) continue;
        if (instanceLayer) {
            getLayerData(
                artboard,
                instanceLayer,
                data,
                byInfluence,
                masterLayer
            );
        }
        idx++
    }
    tempGroup.remove();
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
function isExportable(layer: Layer) {
    return layer.type == sketch.Types.Text ||
        layer.type == sketch.Types.Group ||
        layer.type == sketch.Types.Shape ||
        layer.type == sketch.Types.ShapePath ||
        layer.type == sketch.Types.Image ||
        layer.type == sketch.Types.Slice ||
        layer.type == sketch.Types.SymbolInstance
}