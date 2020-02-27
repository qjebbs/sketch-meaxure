import { context } from "../state/context";
import { calcArtboardsRow, calcArtboardsColumn, find } from "../api/helper";
import { toJSString } from "../api/api";
import { SMPanel } from "./panel";

export function exportPanel() {
    // if (ga) ga.sendEvent('spec', 'export to spec viewer');
    /*this.*/context.artboardsData = [];
    /*this.*/context.selectionArtboards = {};
    var data: any = {};
    data.selection = [];
    data.current = [];
    data.pages = [];

    data.exportOption = /*self.*/context.runningConfig.exportOption;
    if (data.exportOption == undefined) {
        data.exportOption = true;
    }

    data.exportInfluenceRect = /*self.*/context.runningConfig.exportInfluenceRect;
    if (data.exportInfluenceRect == undefined) {
        data.exportInfluenceRect = false;
    }

    /*self.*/context.runningConfig.order = (/*self.*/context.runningConfig.order) ? /*self.*/context.runningConfig.order : "positive";
    data.order = /*self.*/context.runningConfig.order;

    if (/*this.*/context.selection.count() > 0) {
        var selectionArtboards = /*this.*/find({
            key: "(class != NULL) && (class == %@)",
            match: MSArtboardGroup
        }, /*this.*/context.selection, true);
        if (selectionArtboards.count() > 0) {
            let artboard;
            selectionArtboards = selectionArtboards.objectEnumerator();
            while (artboard = selectionArtboards.nextObject()) {
                data.selection.push(/*this.*/toJSString(artboard.objectID()));
            }
        }
    }
    if (/*this.*/context.artboard) data.current.push(/*this.*/toJSString(/*this.*/context.artboard.objectID()));

    var pages = /*this.*/context.document.pages().objectEnumerator();
    let page;
    while (page = pages.nextObject()) {
        var pageData: any = {},
            artboards = page.artboards().objectEnumerator();
        pageData.name = /*this.*/toJSString(page.name());
        pageData.objectID = /*this.*/toJSString(page.objectID());
        pageData.artboards = [];
        let artboard;
        while (artboard = artboards.nextObject()) {
            // if(!/*this.*/is(artboard, MSSymbolMaster)){
            var artboardData: any = {};
            artboardData.name = /*this.*/toJSString(artboard.name());
            artboardData.objectID = /*this.*/toJSString(artboard.objectID());
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
        switch (/*this.*/context.configs.artboardOrder) {
            case 'layer-order':
                pageData.artboards.reverse();
                break;
            case 'artboard-cols':
                /*this.*/calcArtboardsColumn(pageData.artboards);
                pageData.artboards.sort((a, b) => {
                    return a.column > b.column ||
                        (a.column == b.column && a.y1 > b.y1) ||
                        (a.column == b.column && a.y1 == b.y1 && a.x1 > b.x2)
                });
                break;
            case 'artboard-rows':
            default:
                /*this.*/calcArtboardsRow(pageData.artboards);
                pageData.artboards.sort((a, b) => {
                    return a.row > b.row ||
                        (a.row == b.row && a.x1 > b.x1) ||
                        (a.row == b.row && a.x1 == b.x1 && a.y1 > b.y2)
                });
                break;
        }
        data.pages.push(pageData);
    }

    /*self.*/context.allData = data;
    console.log(data);
    return /*this.*/SMPanel({
        url: /*this.*/context.resourcesRoot + "/panel/export.html",
        width: 320,
        height: 597,
        data: data,
        callback: function (data) {
            var allData = /*self.*/context.allData;
            /*self.*/context.selectionArtboards = [];
            /*self.*/context.allCount = 0;

            for (var p = 0; p < allData.pages.length; p++) {
                var artboards = allData.pages[p].artboards;
                if (data.order == 'reverse') {
                    artboards = artboards.reverse();
                } else if (data.order == 'alphabet') {
                    artboards = artboards.sort(function (a, b) {
                        var nameA = a.name.toUpperCase(),
                            nameB = b.name.toUpperCase();
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        return 0;
                    });
                }

                for (var a = 0; a < artboards.length; a++) {
                    var artboard = artboards[a].MSArtboardGroup,
                        objectID = /*self.*/toJSString(artboard.objectID());
                    if (data[objectID]) {
                        /*self.*/context.allCount += artboard.children().count();
                        /*self.*/context.selectionArtboards.push(artboard);
                    }
                }
            }
            context.runningConfig.exportOption = data.exportOption;
            context.runningConfig.exportInfluenceRect = data.exportInfluenceRect;
            context.runningConfig.order = data.order;
        }
    });
}