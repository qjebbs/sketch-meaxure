import { logger } from "./logger";
import { context } from "./context";

export function message(message) {
    context.document.showMessage(message);
}

export function extend(options, target) {
    var target = target || this;

    for (var key in options) {
        target[key] = options[key];
    }
    return target;
}