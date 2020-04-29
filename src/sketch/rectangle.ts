// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from ".";

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface Rectangle {
            intersection(to: Rectangle): Rectangle;
            isEuqal(to: Rectangle): boolean;
        }
    }
}

export function extendRectangle() {
    let target = sketch.Rectangle.prototype
    target.intersection = function (to: Rectangle) {
        return getIntersection(this, to);
    }
    target.isEuqal = function (to: Rectangle) {
        return isEuqal(this, to);
    }
}

function getIntersection(a: Rectangle, b: Rectangle): Rectangle {
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
    return new sketch.Rectangle(x1, y1, width, height);
}
function isEuqal(a: Rectangle, b: Rectangle): boolean {
    return a.x == b.x && a.y == b.y &&
        a.width == b.width && a.height == b.height;
}