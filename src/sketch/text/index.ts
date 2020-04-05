import { sketch } from "..";
import { TextFragment, getFragments } from "./textFragment";

export enum TextBehaviour {
    autoWidth = 0,
    autoHeight = 1,
    fixedSize = 2,
}

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface Text {
            isEmpty: boolean;
            textBehaviour: TextBehaviour;
            getFragments(): TextFragment[];
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
    Object.defineProperty(target, "textBehaviour", {
        get: function () {
            let val = this.sketchObject.textBehaviour();
            return TextBehaviour[val];
        },
        set: function (val: TextBehaviour) {
            return this.sketchObject.setTextBehaviour(val);
        }
    });
    target.getFragments = function () { return getFragments(this) };
}