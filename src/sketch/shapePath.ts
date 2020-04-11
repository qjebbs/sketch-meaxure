// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from ".";

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface ShapePath {
            radius: number[]
        }
    }
}

export function extendShapePath() {
    let target = sketch.ShapePath.prototype
    Object.defineProperty(target, "radius", {
        get: function (): number[] {
            if (!this.sketchObject.cornerRadiusString) return undefined;
            let cornerRadius = this.sketchObject.cornerRadiusString();
            if (!cornerRadius) return undefined;
            return cornerRadius.split(';').map(Number);
        }
    });
}
