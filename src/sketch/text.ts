import { sketch } from ".";

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface Text {
            isEmpty: boolean;
        }
    }
}

export function extendText() {
    let target = sketch.Text.prototype
    Object.defineProperty(target, "isEmpty", {
        get: function () {
            return this.sketchObject.isEmpty();
        }
    });
}