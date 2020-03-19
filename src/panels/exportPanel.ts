import { context } from "../state/context";
import { calcArtboardsRow, calcArtboardsColumn, find } from "../api/helper";
import { toJSString } from "../api/api";
import { createWebviewPanel } from "../webviewPanel";

type OptionArtboardOrder = 'artboard-rows' | 'artboard-cols' | 'layer-order' | 'alphabet';

interface ExportData {
    language: string;
    selection: any[];
    current: any[];
    pages: any[];
    exportOption: boolean;
    exportInfluenceRect: boolean;
    order: OptionArtboardOrder;
    reverse: boolean;
}

interface ExportPanelMessage {
    action: 'init' | 'update' | 'sort' | 'submit';
    data: ExportData;
}

export function exportPanel() {
    context.artboardsData = [];
    context.selectionArtboards = {};
    let data = <ExportData>{
        language: context.languageData,
        selection: [],
        current: [],
        pages: [],
        exportOption: context.runningConfig.exportOption === undefined ? true : context.runningConfig.exportOption,
        exportInfluenceRect: context.runningConfig.exportInfluenceRect,
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

    let pages = context.document.pages().objectEnumerator();
    let page;
    while (page = pages.nextObject()) {
        let pageData: any = {},
            artboards = page.artboards().objectEnumerator();
        pageData.name = toJSString(page.name());
        pageData.objectID = toJSString(page.objectID());
        pageData.artboards = [];
        let artboard;
        let layerOrder = 0;
        while (artboard = artboards.nextObject()) {
            layerOrder++;
            // if(!is(artboard, MSSymbolMaster)){
            let artboardData: any = {};
            artboardData.name = toJSString(artboard.name());
            artboardData.objectID = toJSString(artboard.objectID());
            artboardData.MSArtboardGroup = artboard;
            artboardData.layerOrder = layerOrder;
            artboardData.x1 = artboard.rect().origin.x;
            artboardData.y1 = artboard.rect().origin.y;
            artboardData.x2 = artboardData.x1 + artboard.rect().size.width;
            artboardData.y2 = artboardData.y1 + artboard.rect().size.height;
            artboardData.row = undefined;
            artboardData.column = undefined;
            pageData.artboards.push(artboardData);
            // }
        }
        data.pages.push(pageData);
    }

    let isCanceled = true;
    let panel = createWebviewPanel({
        url: context.resourcesRoot + "/panel/export.html",
        width: 320,
        height: 597,
    });
    panel.onWebviewDOMReady(() => panel.postMessage<ExportPanelMessage>({ action: "init", data: data }));
    panel.onDidReceiveMessage<ExportPanelMessage>((msg) => {
        if (msg.action == 'sort') {
            data.order = msg.data.order;
            for (let p = 0; p < data.pages.length; p++) {
                data.pages[p].artboards = sortArtboards(data.pages[p].artboards, msg.data.order, msg.data.reverse);
            }
            panel.postMessage<ExportPanelMessage>({ action: 'update', data: data });
            return;
        } else if (msg.action == 'submit') {
            isCanceled = false;
            context.selectionArtboards = [];
            context.allCount = 0;
            for (let p = 0; p < data.pages.length; p++) {
                let artboards: any[] = data.pages[p].artboards;
                // don't sort again, already done in sort requests.
                // artboards = sortArtboards(artboards, message.data.order, message.data.reverse);
                for (let a = 0; a < artboards.length; a++) {
                    let artboard = artboards[a].MSArtboardGroup,
                        objectID = toJSString(artboard.objectID());
                    if (msg.data[objectID]) {
                        context.allCount += artboard.children().count();
                        context.selectionArtboards.push(artboard);
                    }
                }
            }
            context.runningConfig.exportOption = msg.data.exportOption;
            context.runningConfig.exportInfluenceRect = msg.data.exportInfluenceRect;
            context.runningConfig.order = msg.data.order;
            panel.close();
        }
    });
    panel.showModal();
    return !isCanceled;
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