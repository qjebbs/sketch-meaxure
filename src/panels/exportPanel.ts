import { context } from "../state/context";
import { calcArtboardsRow, calcArtboardsColumn, find } from "../api/helper";
import { toJSString } from "../api/api";
import { SMPanel } from "./panel";
import { createWebviewPanel } from "../webviewPanel";

interface ExportData {
    language: string;
    selection: any[];
    current: any[];
    pages: any[];
    exportOption: boolean;
    exportInfluenceRect: boolean;
    order: string;
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
        order: context.runningConfig.order ? context.runningConfig.order : "positive",
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
        while (artboard = artboards.nextObject()) {
            // if(!is(artboard, MSSymbolMaster)){
            let artboardData: any = {};
            artboardData.name = toJSString(artboard.name());
            artboardData.objectID = toJSString(artboard.objectID());
            artboardData.MSArtboardGroup = artboard;
            artboardData.x1 = artboard.rect().origin.x;
            artboardData.y1 = artboard.rect().origin.y;
            artboardData.x2 = artboardData.x1 + artboard.rect().size.width;
            artboardData.y2 = artboardData.y1 + artboard.rect().size.height;
            artboardData.row = undefined;
            artboardData.column = undefined;
            pageData.artboards.push(artboardData);
            // }
        }
        switch (context.configs.artboardOrder) {
            case 'layer-order':
                pageData.artboards.reverse();
                break;
            case 'artboard-cols':
                calcArtboardsColumn(pageData.artboards);
                pageData.artboards.sort((a, b) => {
                    return a.column > b.column ||
                        (a.column == b.column && a.y1 > b.y1) ||
                        (a.column == b.column && a.y1 == b.y1 && a.x1 > b.x2)
                });
                break;
            case 'artboard-rows':
            default:
                calcArtboardsRow(pageData.artboards);
                pageData.artboards.sort((a, b) => {
                    return a.row > b.row ||
                        (a.row == b.row && a.x1 > b.x1) ||
                        (a.row == b.row && a.x1 == b.x1 && a.y1 > b.y2)
                });
                break;
        }
        data.pages.push(pageData);
    }

    let exitCode = 1;
    let panel = createWebviewPanel({
        url: context.resourcesRoot + "/panel/export.html",
        width: 320,
        height: 597,
    });
    panel.onWebviewDOMReady(() => panel.postMessage(data));
    panel.onDidReceiveMessage<ExportData>((response) => {
        exitCode = 0;
        context.selectionArtboards = [];
        context.allCount = 0;
        for (let p = 0; p < data.pages.length; p++) {
            let artboards = data.pages[p].artboards;
            if (response.order == 'reverse') {
                artboards = artboards.reverse();
            } else if (response.order == 'alphabet') {
                artboards = artboards.sort(function (a, b) {
                    let nameA = a.name.toUpperCase(),
                        nameB = b.name.toUpperCase();
                    return nameA > nameB;
                });
            }

            for (let a = 0; a < artboards.length; a++) {
                let artboard = artboards[a].MSArtboardGroup,
                    objectID = toJSString(artboard.objectID());
                if (response[objectID]) {
                    context.allCount += artboard.children().count();
                    context.selectionArtboards.push(artboard);
                }
            }
        }
        context.runningConfig.exportOption = response.exportOption;
        context.runningConfig.exportInfluenceRect = response.exportInfluenceRect;
        context.runningConfig.order = response.order;
        panel.close();
    });
    panel.showModal();
    return exitCode;
}