import { context } from "./common/context";
import { regexNames } from "./common/common";
import { sketch } from "../sketch";

export function clearAllMarks() {
    let targets = context.selection.length ? context.selection.layers : [context.page];
    for (let target of targets) {
        for (let layer of target.allSubLayers()) {
            if (layer.type == sketch.Types.Group && regexNames.exec(layer.name)) {
                layer.remove();
            }
        }
    }
}

export function toggleHidden() {
    let isHidden = !context.configs.isHidden;
    for (let layer of context.page.allSubLayers()) {
        if (layer.type == sketch.Types.Group && regexNames.exec(layer.name)) {
            layer.hidden = isHidden;
        }
    }
    context.configs.isHidden = isHidden;
}
export function toggleLocked() {
    let isLocked = !context.configs.isLocked;
    for (let layer of context.page.allSubLayers()) {
        if (layer.type == sketch.Types.Group && regexNames.exec(layer.name)) {
            layer.locked = isLocked;
        }
    }
    context.configs.isLocked = isLocked;
}