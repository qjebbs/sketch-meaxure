import { context } from "../state/context";
import { find, tik } from "../api/helper";
import { toJSString } from "../api/api";
import { createWebviewPanel } from "../webviewPanel";
import { logger } from "../api/logger";
import { sketch } from "../sketch";

type OptionArtboardOrder = 'artboard-rows' | 'artboard-cols' | 'layer-order' | 'alphabet';
interface PageInfo {
    name: string,
    objectID: string,
    artboards: ArtboardInfo[]
}

interface ArtboardInfo {
    name: string,
    objectID: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    row: number,
    column: number,
    layerOrder: number,
}
interface ExportData {
    language: string;
    selection: any[];
    current: any[];
    pages: PageInfo[];
    exportOption: boolean;
    exportInfluenceRect: boolean;
    order: OptionArtboardOrder;
    reverse: boolean;
}

interface ExportConfig {
    selectionArtboards: Artboard[];
    allCount: number;
    advancedMode: boolean;
    byInfluence: boolean;
}

export function exportPanel(): Promise<ExportConfig> {
    let [data, allArtboards] = prepareExportData();
    let panel = createWebviewPanel({
        identifier: 'co.jebbs.sketch-meaxure.export',
        url: context.resourcesRoot + "/panel/export.html",
        width: 320,
        height: 597,
    });
    function onSubmit(rdata: ExportData, resolve: (boolean) => void) {
        let exportArtboards: Artboard[] = [];
        let layersCount = 0;
        for (let page of data.pages) {
            // don't sort again, already done in sort requests.
            // artboards = sortArtboards(artboards, message.data.order, message.data.reverse);
            for (let info of page.artboards) {
                if (rdata[info.objectID]) {
                    let artboard = allArtboards[info.objectID];
                    layersCount += artboard.allSubLayers().length;
                    exportArtboards.push(artboard);
                }
            }
        }
        context.runningConfig.order = rdata.order;
        resolve(<ExportConfig>{
            selectionArtboards: exportArtboards,
            allCount: layersCount,
            advancedMode: rdata.exportOption,
            byInfluence: rdata.exportInfluenceRect,
        });
        panel.close();
    }
    panel.onDidReceiveMessage<ExportData>('init', () => data);
    panel.onDidReceiveMessage<ExportData>('sort', rdata => {
        data.order = rdata.order;
        for (let p = 0; p < data.pages.length; p++) {
            data.pages[p].artboards = sortArtboards(data.pages[p].artboards, rdata.order, rdata.reverse);
        }
        return data;
    });
    return new Promise<ExportConfig>((resolve, reject) => {
        panel.onClose(() => resolve(undefined));
        panel.onDidReceiveMessage<ExportData>('submit', rdata => onSubmit(rdata, resolve));
        panel.show();
    });
}

function prepareExportData(): [ExportData, { [key: string]: Artboard }] {
    let allArtboards: { [key: string]: Artboard } = {};
    let data = <ExportData>{
        language: context.languageData,
        selection: [],
        current: [],
        pages: [],
        exportOption: true,
        exportInfluenceRect: context.configs.byInfluence,
        order: 'artboard-rows',
        reverse: false,
    };

    if (context.selection.count() > 0) {
        let selectionArtboards = find({
            key: "(class != NULL) && (class == %@)",
            match: MSArtboardGroup
        }, context.selection, true);
        if (selectionArtboards.count() > 0) {
            let artboard;
            selectionArtboards = selectionArtboards.objectEnumerator();
            while (artboard = selectionArtboards.nextObject()) {
                data.selection.push(toJSString(artboard.objectID()));
            }
        }
    }
    if (context.artboard) data.current.push(toJSString(context.artboard.objectID()));

    for (let page of sketch.Document.fromNative(context.document).pages) {
        let pageData = <PageInfo>{};
        let artboards = page.layers as Artboard[];
        pageData.name = page.name;
        pageData.objectID = page.id;
        pageData.artboards = [];
        let layerOrder = 0;
        for (let artboard of artboards) {
            layerOrder++;
            let artboardData = <ArtboardInfo>{};
            artboardData.name = artboard.name;
            artboardData.objectID = artboard.id;
            allArtboards[artboardData.objectID] = artboard;
            artboardData.layerOrder = layerOrder;
            artboardData.x1 = artboard.frame.x as number;
            artboardData.y1 = artboard.frame.y;
            artboardData.x2 = artboardData.x1 + artboard.frame.width;
            artboardData.y2 = artboardData.y1 + artboard.frame.height;
            artboardData.row = undefined;
            artboardData.column = undefined;
            pageData.artboards.push(artboardData);
        }
        data.pages.push(pageData);
    }
    return [data, allArtboards];
}

function sortArtboards(artboards: any[], artboardOrder: OptionArtboardOrder, reverse?: boolean): any[] {
    switch (artboardOrder) {
        case 'layer-order':
            artboards = artboards.sort(function (a, b) {
                return b.layerOrder - a.layerOrder;
            });
            break;
        case 'alphabet':
            artboards = artboards.sort(function (a, b) {
                let nameA = a.name.toUpperCase(),
                    nameB = b.name.toUpperCase();
                return nameA > nameB ? 1 : -1;
            });
            break;
        case 'artboard-cols':
            calcArtboardsColumn(artboards);
            artboards = artboards.sort((a, b) => {
                let larger = a.column > b.column ||
                    (a.column == b.column && a.y1 > b.y1) ||
                    (a.column == b.column && a.y1 == b.y1 && a.x1 > b.x2);
                return larger ? 1 : -1;
            });
            break;
        case 'artboard-rows':
            calcArtboardsRow(artboards);
            artboards = artboards.sort((a, b) => {
                let larger = a.row > b.row ||
                    (a.row == b.row && a.x1 > b.x1) ||
                    (a.row == b.row && a.x1 == b.x1 && a.y1 > b.y2);
                return larger ? 1 : -1;
            });
            break;
        default:
            break;
    }
    if (reverse) return artboards.reverse();
    return artboards;
}

function calcArtboardsRow(artboardDatas) {
    let curRow = 0;
    let unCalcData = artboardDatas;
    let rowTop = 0;
    let rowBottom = 0;
    while (unCalcData.length) {
        curRow++;
        // Find the top most artboard to start the row
        let topMost = unCalcData[0];
        for (let item of unCalcData) {
            if (topMost.y1 > item.y1) {
                topMost = item;
            }
        }
        // logger.debug("top most: " + topMost.name);
        rowTop = topMost.y1;
        rowBottom = topMost.y2;
        // Find intersecting artboards
        let isRangeExtened = true;
        while (isRangeExtened) {
            // Row range may updates when new item found,
            // new range could include more items.
            // So, loop until range not extended.
            isRangeExtened = false;
            for (let item of artboardDatas.filter(a => !a.row)) {
                // If not beneath or above the range,
                // we found an intersecting artboard.
                if (!(item.y1 > rowBottom || item.y2 < rowTop)) {
                    // Extend row range.
                    if (rowTop > item.y1) {
                        rowTop = item.y1;
                        isRangeExtened = true;
                    }
                    if (rowBottom < item.y2) {
                        rowBottom = item.y2;
                        isRangeExtened = true;
                    }
                    item.row = curRow;
                }
            }
        }
        // Calculate next row.
        unCalcData = artboardDatas.filter(a => !a.row)
    }
}

function calcArtboardsColumn(artboardDatas) {
    let Col = 0;
    let unCalcData = artboardDatas;
    let colLeft = 0;
    let colRight = 0;
    while (unCalcData.length) {
        Col++;
        // Find the left most artboard to start the column
        let leftMost = unCalcData[0];
        for (let item of unCalcData) {
            if (leftMost.x1 > item.x1) {
                leftMost = item;
            }
        }
        // logger.debug("left most: " + leftMost.name);
        colLeft = leftMost.x1;
        colRight = leftMost.x2;
        // Find intersecting artboards
        let isRangeExtened = true;
        while (isRangeExtened) {
            // Column range may updates when new item found,
            // new range could include more items.
            // So, loop until range not extended.
            isRangeExtened = false;
            for (let item of artboardDatas.filter(a => !a.column)) {
                // If not on right or left of the range,
                // we found an intersecting artboard.
                if (!(item.x1 > colRight || item.x2 < colLeft)) {
                    // Extend column range.
                    if (colLeft > item.x1) {
                        colLeft = item.x1;
                        isRangeExtened = true;
                    }
                    if (colRight < item.x2) {
                        colRight = item.x2;
                        isRangeExtened = true;
                    }
                    item.column = Col;
                }
            }
        }
        // Calculate next column.
        unCalcData = artboardDatas.filter(a => !a.column)
    }
}