import { sketch } from ".";

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface Document {
            filePath: string;
            fileName: string;
        }
    }
}

export function extendDocument() {
    let prototype = sketch.Document.prototype
    Object.defineProperty(prototype, "filePath", {
        get: function () {
            let sketchObject = this.sketchObject;
            return sketchObject.fileURL() ? sketchObject.fileURL().path().stringByDeletingLastPathComponent() : "~";
        }
    });
    Object.defineProperty(prototype, "fileName", {
        get: function () {
            let sketchObject = this.sketchObject;
            return sketchObject.displayName().stringByDeletingPathExtension();
        }
    });
}