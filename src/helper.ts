import { logger } from "./logger";
import { context } from "./context";

let sketch = require('sketch');

export function message(message) {
    sketch.UI.message(message);
}

export function extend(options, target) {
    var target = target || this;

    for (var key in options) {
        target[key] = options[key];
    }
    return target;
}