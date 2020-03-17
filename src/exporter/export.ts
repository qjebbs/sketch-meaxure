import { localize } from "../state/language";
import { logger } from "../api/logger";
import { exportPanel } from "../panels/exportPanel";
import { context } from "../state/context";
import { getRect, toSlug, emojiToEntities, toJSString } from "../api/api";
import { message, getSavePath, toHTMLEncode } from "../api/helper";
import { getLayer, exportImage, writeFile, buildTemplate } from "./utilities";
import { createWebviewPanel } from "../webviewPanel";

export function exportSpecification() {
    if (exportPanel() != 0) return;
    if (context.selectionArtboards.length <= 0) return false;
    let savePath = getSavePath();
    if (!savePath) return;

    let processingPanel = createWebviewPanel({
        url: context.resourcesRoot + "/panel/processing.html",
        width: 304,
        height: 104,
    });
    let template = NSString.stringWithContentsOfFile_encoding_error(context.resourcesRoot + "/template.html", 4, nil);
    let idx = 1;
    let artboardIndex = 0;
    let layerIndex = 0;
    let layerCount = 0;
    let exporting = false;
    let data = {
        scale: context.configs.scale,
        unit: context.configs.units,
        colorFormat: context.configs.format,
        artboards: [],
        slices: [],
        colors: []
    };

    context.slices = [];
    context.sliceCache = {};
    context.maskCache = [];
    let canceled = false;
    processingPanel.onClose(() => canceled = true);
    processingPanel.show();

    coscript.scheduleWithRepeatingInterval_jsFunction(0, function (interval) {
        // message('Processing layer ' + idx + ' of ' + context.allCount);
        processingPanel.postMessage({
            percentage: Math.round(idx / context.allCount * 100),
            text: localize("Processing layer %@ of %@", [idx, context.allCount])
        });

        idx++;

        if (!data.artboards[artboardIndex]) {
            data.artboards.push({
                layers: [],
                notes: []
            });
            context.maskCache = [];
            context.maskObjectID = undefined;
            context.maskRect = undefined;
        }

        if (!exporting) {
            exporting = true;
            let artboard = context.selectionArtboards[artboardIndex],
                page = artboard.parentGroup(),
                layer = artboard.children()[layerIndex],
                msg = page.name() + ' - ' + artboard.name() + ' - ' + layer.name();
            // log( page.name() + ' - ' + artboard.name() + ' - ' + layer.name());
            try {
                getLayer(
                    artboard, // Sketch artboard element
                    layer, // Sketch layer element
                    data.artboards[artboardIndex] // Save to data
                );
                layerIndex++;
                layerCount++;
                exporting = false;
            } catch (e) {
                canceled = true;
                logger.error(e)
            }

            if (layerIndex >= artboard.children().length) {
                let objectID = artboard.objectID(),
                    artboardRect = getRect(artboard),
                    page = artboard.parentGroup(),
                    // name = toSlug(toHTMLEncode(page.name()) + ' ' + toHTMLEncode(artboard.name()));
                    slug = toSlug(page.name() + ' ' + artboard.name());

                data.artboards[artboardIndex].pageName = toHTMLEncode(emojiToEntities(page.name()));
                data.artboards[artboardIndex].pageObjectID = toJSString(page.objectID());
                data.artboards[artboardIndex].name = toHTMLEncode(emojiToEntities(artboard.name()));
                data.artboards[artboardIndex].slug = slug;
                data.artboards[artboardIndex].objectID = toJSString(artboard.objectID());
                data.artboards[artboardIndex].width = artboardRect.width;
                data.artboards[artboardIndex].height = artboardRect.height;

                if (!context.runningConfig.exportOption) {
                    let imageURL = NSURL.fileURLWithPath(exportImage({
                        layer: artboard,
                        scale: 2,
                        name: objectID
                    })),
                        imageData = NSData.dataWithContentsOfURL(imageURL),
                        imageBase64 = imageData.base64EncodedStringWithOptions(0);
                    data.artboards[artboardIndex].imageBase64 = 'data:image/png;base64,' + imageBase64;

                    let newData = JSON.parse(JSON.stringify(data));
                    newData.artboards = [data.artboards[artboardIndex]];
                    writeFile({
                        content: buildTemplate(template, {
                            lang: context.languageData,
                            data: JSON.stringify(newData)
                        }),
                        path: toJSString(savePath),
                        fileName: slug + ".html"
                    });
                } else {
                    // data.artboards[artboardIndex].imagePath = "preview/" + objectID + ".png";
                    data.artboards[artboardIndex].imagePath = "preview/" + encodeURI(slug) + ".png";

                    exportImage({
                        layer: artboard,
                        path: toJSString(savePath) + "/preview",
                        scale: 2,
                        // name: objectID,
                        name: slug
                    });

                    writeFile({
                        content: "<meta http-equiv=\"refresh\" content=\"0;url=../index.html#artboard" + artboardIndex + "\">",
                        path: toJSString(savePath) + "/links",
                        fileName: slug + ".html"
                    });
                }


                layerIndex = 0;
                artboardIndex++;
            }

            if (artboardIndex >= context.selectionArtboards.length && layerCount >= context.allCount) {
                if (context.slices.length > 0) {
                    data.slices = context.slices;
                }

                if (context.runningConfig.colors && context.runningConfig.colors.length > 0) {
                    data.colors = context.runningConfig.colors;
                }

                let selectingPath = savePath;
                if (context.runningConfig.exportOption) {
                    writeFile({
                        content: buildTemplate(template, {
                            lang: context.languageData,
                            data: JSON.stringify(data)
                        }),
                        path: toJSString(savePath),
                        fileName: "index.html"
                    });
                    selectingPath = savePath + "/index.html";
                }
                NSWorkspace.sharedWorkspace().activateFileViewerSelectingURLs([NSURL.fileURLWithPath(selectingPath)]);

                message(localize("Export complete!"));
                canceled = true;
            }

        }

        if (canceled === true) {
            processingPanel.close();
            return interval.cancel();
        }

    });

}