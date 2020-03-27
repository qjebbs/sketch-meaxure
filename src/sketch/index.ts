import { extendDocument } from "./document";
import { extendUI } from "./ui";
import { extendLayer } from "./layer";
import { extendText } from "./text";
import { extendShapePath } from "./shapePath";
import { extendSymbolInstance } from "./symbolInstance";

export const sketch: Sketch = require('sketch');

extendDocument();
extendUI();
extendLayer();
extendText();
extendShapePath();
extendSymbolInstance();