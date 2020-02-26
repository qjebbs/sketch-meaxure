import { _ } from "../state/language";
import { logger } from "../logger";
import { exportPanel } from "../panels/exportPanel";
import { context } from "../state/context";
import { SMPanel } from "../panels/panel";
import { toHTMLEncode, getRect, toSlug, emojiToEntities, toJSString } from "../api/api";
import { message, getSavePath } from "../helper";
import { getLayer, exportImage, writeFile, buildTemplate } from "./utilities";

export function exportSpecification() {
    if (/*this.*/exportPanel()) {
        if (/*this.*/context.selectionArtboards.length <= 0) {
            return false;
        }
        var savePath = /*this.*/getSavePath();

        if (savePath) {
            // /*self.*/message(_("Exporting..."));
            var processingPanel = /*this.*/SMPanel({
                url: /*this.*/context.resourcesRoot + "/panel/processing.html",
                width: 304,
                height: 104,
                floatWindow: true
            }),
                processing = processingPanel.windowScriptObject(),
                template = NSString.stringWithContentsOfFile_encoding_error(/*this.*/context.resourcesRoot + "/template.html", 4, nil);

            /*this.*/savePath = savePath;
            var idx = 1,
                artboardIndex = 0,
                layerIndex = 0,
                layerCount = 0,
                exporting = false,
                data = {
                    scale: /*self.*/context.configs.scale,
                    unit: /*self.*/context.configs.unit,
                    colorFormat: /*self.*/context.configs.colorFormat,
                    artboards: [],
                    slices: [],
                    colors: []
                };

            /*self.*/context.slices = [];
            /*self.*/context.sliceCache = {};
            /*self.*/context.maskCache = [];
            /*self.*/context.wantsStop = false;

            coscript.scheduleWithRepeatingInterval_jsFunction(0, function (interval) {
                // /*self.*/message('Processing layer ' + idx + ' of ' + context.allCount);
                processing.evaluateWebScript("processing('" + Math.round(idx / context.allCount * 100) + "%', '" + _("Processing layer %@ of %@", [idx, context.allCount]) + "')");
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
                    var artboard = /*self.*/context.selectionArtboards[artboardIndex],
                        page = artboard.parentGroup(),
                        layer = artboard.children()[layerIndex],
                        msg = page.name() + ' - ' + artboard.name() + ' - ' + layer.name();
                    // log( page.name() + ' - ' + artboard.name() + ' - ' + layer.name());
                    try {
                        /*self.*/getLayer(
                        artboard, // Sketch artboard element
                        layer, // Sketch layer element
                        data.artboards[artboardIndex] // Save to data
                    );
                        layerIndex++;
                        layerCount++;
                        exporting = false;
                    } catch (e) {
                        /*self.*/context.wantsStop = true;
                        logger.error(e)
                        processing.evaluateWebScript("$('#processing-text').html('<small>" + /*self.*/toHTMLEncode(msg) + "</small>');");
                        // if (ga) ga.sendError(message)
                    }

                    if (layerIndex >= artboard.children().length) {
                        var objectID = artboard.objectID(),
                            artboardRect = /*self.*/getRect(artboard),
                            page = artboard.parentGroup(),
                            // name = /*self.*/toSlug(/*self.*/toHTMLEncode(page.name()) + ' ' + /*self.*/toHTMLEncode(artboard.name()));
                            slug = /*self.*/toSlug(page.name() + ' ' + artboard.name());

                        data.artboards[artboardIndex].pageName = /*self.*/toHTMLEncode(/*self.*/emojiToEntities(page.name()));
                        data.artboards[artboardIndex].pageObjectID = /*self.*/toJSString(page.objectID());
                        data.artboards[artboardIndex].name = /*self.*/toHTMLEncode(/*self.*/emojiToEntities(artboard.name()));
                        data.artboards[artboardIndex].slug = slug;
                        data.artboards[artboardIndex].objectID = /*self.*/toJSString(artboard.objectID());
                        data.artboards[artboardIndex].width = artboardRect.width;
                        data.artboards[artboardIndex].height = artboardRect.height;

                        if (!/*self.*/context.configs.exportOption) {
                            var imageURL = NSURL.fileURLWithPath(/*self.*/exportImage({
                                layer: artboard,
                                scale: 2,
                                name: objectID
                            })),
                                imageData = NSData.dataWithContentsOfURL(imageURL),
                                imageBase64 = imageData.base64EncodedStringWithOptions(0);
                            data.artboards[artboardIndex].imageBase64 = 'data:image/png;base64,' + imageBase64;

                            var newData = JSON.parse(JSON.stringify(data));
                            newData.artboards = [data.artboards[artboardIndex]];
                            /*self.*/writeFile({
                                content: /*self.*/buildTemplate(template, {
                                    lang: context.languageData,
                                    data: JSON.stringify(newData)
                                }),
                                path: /*self.*/toJSString(savePath),
                                fileName: slug + ".html"
                            });
                        } else {
                            // data.artboards[artboardIndex].imagePath = "preview/" + objectID + ".png";
                            data.artboards[artboardIndex].imagePath = "preview/" + encodeURI(slug) + ".png";

                            /*self.*/exportImage({
                                layer: artboard,
                                path: /*self.*/toJSString(savePath) + "/preview",
                                scale: 2,
                                // name: objectID,
                                name: slug
                            });

                            /*self.*/writeFile({
                                content: "<meta http-equiv=\"refresh\" content=\"0;url=../index.html#artboard" + artboardIndex + "\">",
                                path: /*self.*/toJSString(savePath) + "/links",
                                fileName: slug + ".html"
                            });
                        }


                        layerIndex = 0;
                        artboardIndex++;
                    }

                    if (artboardIndex >= /*self.*/context.selectionArtboards.length && layerCount >= context.allCount) {
                        if (/*self.*/context.slices.length > 0) {
                            data.slices = /*self.*/context.slices;
                        }

                        if (/*self.*/context.configs.colors && /*self.*/context.configs.colors.length > 0) {
                            data.colors = /*self.*/context.configs.colors;
                        }

                        var selectingPath = savePath;
                        if (/*self.*/context.configs.exportOption) {
                            /*self.*/writeFile({
                            content: /*self.*/buildTemplate(template, {
                                lang: context.languageData,
                                data: JSON.stringify(data)
                            }),
                            path: /*self.*/toJSString(savePath),
                            fileName: "index.html"
                        });
                            selectingPath = savePath + "/index.html";
                        }
                        NSWorkspace.sharedWorkspace().activateFileViewerSelectingURLs([NSURL.fileURLWithPath(selectingPath)]);

                        /*self.*/message(_("Export complete!"));
                        /*self.*/context.wantsStop = true;
                    }

                }

                if (/*self.*/context.wantsStop === true) {
                    // if (ga) ga.sendEvent('spec', 'spec done');
                    return interval.cancel();
                }


            });
        }
    }
}