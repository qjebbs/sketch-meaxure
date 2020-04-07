import { extendDocument } from "./document";
import { extendUI } from "./ui";
import { extendLayer } from "./layer";
import { extendText } from "./text";
import { extendShapePath } from "./shapePath";
import { extendSymbolInstance } from "./symbolInstance";

export const sketch: Sketch = require('sketch');

declare module 'sketch/sketch' {
    namespace _Sketch {
        interface Sketch {
            __Extended_by_Jebbs__: boolean;
        }
    }
}

if (!sketch.__Extended_by_Jebbs__) {
    // In some cases, like running a panel, and later, another
    // since 'coscript.setShouldKeepAround(true)' is set,
    // On the 2nd run, the sketch extensions seems to be kept, 
    // but the module is re-initialized.
    // It leads to 'TypeError: Attempting to change the getter 
    // of an unconfigurable property.' error.
    // The __Extended_by_Jebbs__ flag is used to avoid it.
    extendDocument();
    extendUI();
    extendLayer();
    extendText();
    extendShapePath();
    extendSymbolInstance();
    sketch.__Extended_by_Jebbs__ = true;
}