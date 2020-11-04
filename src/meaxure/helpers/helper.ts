// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { context } from "../common/context";
import { SMRect } from "../interfaces";
import * as path from '@skpm/path';

export function convertUnit(value: number | number[], isText?: boolean, percentageType?: "width" | "height") {
    if (value instanceof Array) {
        let units = context.configs.units.split("/"),
            unit = units[0];
        if (units.length > 1 && isText) {
            unit = units[1];
        }
        let scale = context.configs.resolution;
        let tempValues = [];
        value.forEach(function (element) {
            tempValues.push(Math.round(element / scale * 10) / 10);
        });
        return tempValues.join(unit + ' ') + unit;
    } else {
        if (percentageType && context.artboard) {
            let artboardRect = context.artboard.frame;
            if (percentageType == "width") {
                return Math.round((value / artboardRect.width) * 1000) / 10 + "%";
            } else if (percentageType == "height") {
                return Math.round((value / artboardRect.height) * 1000) / 10 + "%";
            }
        }
        let val = Math.round(value / context.configs.resolution * 10) / 10;
        let units: string[] = context.configs.units.split("/");
        let unit = units[0];
        if (units.length > 1 && isText) {
            unit = units[1];
        }
        return val + unit;
    }
}

export function lengthUnit(value: number, percentageToValue?: number, isText?: boolean) {
    if (percentageToValue && !isText) return Math.round(value / percentageToValue * 1e3) / 10 + "%";
    value = Math.round(value / context.configs.resolution * 10) / 10;
    let units = context.configs.units.split("/"),
        unit = units[0];
    if (isText && units.length > 1) unit = units[1];
    return "" + value + unit;
}

export function getIntersection(a: SMRect, b: SMRect): SMRect {
    if (!a || !b) return undefined;
    let x1 = Math.max(a.x, b.x);
    let y1 = Math.max(a.y, b.y);
    let x2 = Math.min(a.x + a.width, b.x + b.width);
    let y2 = Math.min(a.y + a.height, b.y + b.height);
    let width = x2 - x1;
    let height = y2 - y1;
    if (width < 0 || height < 0) {
        // no intersection
        return undefined;
    }
    return {
        x: x1,
        y: y1,
        width: width,
        height: height,
    }
}

export function getResourcePath(): string {
    return path.resourcePath("")
}

export function toHTMLEncode(str) {
    return toJSString(str)
        .replace(/\</g, "&lt;")
        .replace(/\>/g, '&gt;')
        .replace(/\'/g, "&#39;")
        .replace(/\"/g, "&quot;")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029")
        .replace(/\ud83c|\ud83d/g, "");
    // return str.replace(/\&/g, "&amp;").replace(/\"/g, "&quot;").replace(/\'/g, "&#39;").replace(/\</g, "&lt;").replace(/\>/g, '&gt;');
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
    for (let prop in x) {
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
export function emojiToEntities(str) {
    let emojiRegExp = new RegExp("(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])", "g");
    return str.replace(
        emojiRegExp,
        function (match) {
            let u = "";
            for (let i = 0; i < match.length; i++) {
                if (!(i % 2)) {
                    u += "&#" + match.codePointAt(i)
                }
            }

            return u;
        });
}

export function toSlug(str) {
    return toJSString(str)
        .toLowerCase()
        .replace(/(<([^>]+)>)/ig, "")
        .replace(/[\/\+\|]/g, " ")
        .replace(new RegExp("[\\!@#$%^&\\*\\(\\)\\?=\\{\\}\\[\\]\\\\\\\,\\.\\:\\;\\']", "gi"), '')
        .replace(/\s+/g, '-');
}
export function toJSString(str) {
    return new String(str).toString();
}
export function toJSNumber(str) {
    return Number(toJSString(str));
}

export function openURL(url) {
    let nsurl = NSURL.URLWithString(url);
    NSWorkspace.sharedWorkspace().openURL(nsurl);
}

export function newStopwatch() {
    let start: number;
    let last: number;
    let statistics: { [key: string]: number };
    let stopwatch = {
        restart: function () {
            start = Date.now();
            last = start;
            statistics = {};
        },
        elpased: function () {
            return Date.now() - start;
        },
        tik: function (phase: string) {
            let now = Date.now();
            if (!statistics[phase]) statistics[phase] = 0;
            statistics[phase] += now - last;
            last = now;
        },
        statistics: function () {
            return statistics;
        }
    }
    stopwatch.restart();
    return stopwatch;
}