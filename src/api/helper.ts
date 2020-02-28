import { context } from "../state/context";
import { _ } from "../state/language";
import { getRect, is, removeLayer } from "./api";
import { regexNames } from "../state/common";
import { logger } from "./logger";
import { Rect } from "./interfaces";

let sketch = require('sketch');

export function message(message) {
    sketch.UI.message(message);
}

export function extend(options, target) {
    var target = target || this;

    for (var key in options) {
        target[key] = options[key];
    }
    return target;
}

export function mathHalf(number) {
    return Math.round(number / 2);
}
export function convertUnit(value, isText?, percentageType?) {
    if (value instanceof Array) {
        var units = /*this.*/context.configs.units.split("/"),
            unit = units[0];

        if (units.length > 1 && isText) {
            unit = units[1];
        }

        var scale = /*this.*/context.configs.scale;
        var tempValues = [];

        value.forEach(function (element) {
            tempValues.push(Math.round(element / scale * 10) / 10);
        });

        return tempValues.join(unit + ' ') + unit;

    } else {

        if (percentageType && /*this.*/context.artboard) {
            var artboardRect = /*this.*/getRect(/*this.*/context.artboard);
            if (percentageType == "width") {
                return Math.round((value / artboardRect.width) * 1000) / 10 + "%";
            } else if (percentageType == "height") {
                return Math.round((value / artboardRect.height) * 1000) / 10 + "%";
            }
        }

        let val = Math.round(value / /*this.*/context.configs.scale * 10) / 10,
            units: string[] = /*this.*/context.configs.units.split("/"),
            unit = units[0];

        if (units.length > 1 && isText) {
            unit = units[1];
        }

        return val + unit;
    }

}
export function toHex(c) {
    var hex = Math.round(c).toString(16).toUpperCase();
    return hex.length == 1 ? "0" + hex : hex;
}
export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: /*this.*/ parseInt(result[1], 16),
        g: /*this.*/parseInt(result[2], 16),
        b: /*this.*/parseInt(result[3], 16)
    } : null;
}
export function isIntersect(a: Rect, b: Rect) {
    return isIntersectX(a, b) && isIntersectY(a, b);
}
export function isIntersectX(a: Rect, b: Rect) {
    return (a.x >= b.x && a.x <= b.x + b.width) || //left board of a in x range of b
        (a.x + a.width >= b.x && a.x + a.width <= b.x + b.width) || //right board of a in x range of b
        (a.x < b.x && a.x + a.width > b.x + b.width)  // x range of a includes b's
}
export function isIntersectY(a: Rect, b: Rect) {
    return (a.y >= b.y && a.y <= b.y + b.height) || //top board of a in y range of b
        (a.y + a.height >= b.y && a.y + a.height <= b.y + b.height) || //bottom board of a in y range of b
        (a.y < b.y && a.y + a.height > b.y + b.height); // y range of a includes b's
}
export function getDistance(targetRect, containerRect?) {
    var containerRect = containerRect || /*this.*/getRect(/*this.*/context.current);

    return {
        top: (targetRect.y - containerRect.y),
        right: (containerRect.maxX - targetRect.maxX),
        bottom: (containerRect.maxY - targetRect.maxY),
        left: (targetRect.x - containerRect.x),
    }
}
export function find(format, container?, returnArray?) {
    if (!format || !format.key || !format.match) {
        return false;
    }
    var predicate = NSPredicate.predicateWithFormat(format.key, format.match),
        container = container || /*this.*/context.current,
        items;

    if (container.pages) {
        items = container.pages();
    } else if (/*this.*/is(container, MSSharedStyleContainer) || /*this.*/is(container, MSSharedTextStyleContainer)) {
        items = container.objectsSortedByName();
    } else if (container.children) {
        items = container.children();
    } else {
        items = container;
    }

    var queryResult = items.filteredArrayUsingPredicate(predicate);

    if (returnArray) return queryResult;

    if (queryResult.count() == 1) {
        return queryResult[0];
    } else if (queryResult.count() > 0) {
        return queryResult;
    } else {
        return false;
    }
}
export function calcArtboardsRow(artboardDatas) {
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
        logger.debug("top most: " + topMost.name);
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
export function calcArtboardsColumn(artboardDatas) {
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
        logger.debug("left most: " + leftMost.name);
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

export function getSavePath() {
    var filePath = /*this.*/context.document.fileURL() ? /*this.*/context.document.fileURL().path().stringByDeletingLastPathComponent() : "~";
    var fileName = /*this.*/context.document.displayName().stringByDeletingPathExtension();
    var savePanel = NSSavePanel.savePanel();

    savePanel.setTitle(_("Export spec"));
    savePanel.setNameFieldLabel(_("Export to:"));
    savePanel.setPrompt(_("Export"));
    savePanel.setCanCreateDirectories(true);
    savePanel.setNameFieldStringValue(fileName);

    if (savePanel.runModal() != NSOKButton) {
        return false;
    }

    return savePanel.URL().path();
}

export function deepEqual(x, y) {
    if (x === y) {
        return true;
    }
    if (!(typeof x == "object" && x != null) || !(typeof y == "object" && y != null)) {
        return false;
    }
    if (Object.keys(x).length != Object.keys(y).length) {
        return false;
    }
    for (var prop in x) {
        if (y.hasOwnProperty(prop)) {
            if (!deepEqual(x[prop], y[prop])) {
                return false;
            }
        } else {
            return false;
        }
    }
    return true;
}