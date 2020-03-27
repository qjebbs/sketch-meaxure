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
