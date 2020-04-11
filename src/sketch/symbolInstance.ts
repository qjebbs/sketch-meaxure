// Copyright 2020 Jebbs. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

import { sketch } from ".";

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface SymbolInstance {
            changeSymbolMaster(master: SymbolMaster): SymbolInstance;
        }
    }
}

export function extendSymbolInstance() {
    let target = sketch.SymbolInstance.prototype
    target.changeSymbolMaster = function (master: SymbolMaster): SymbolInstance {
        this.sketchObject.changeInstanceToSymbol(master.sketchObject);
        return this;
    }
}
