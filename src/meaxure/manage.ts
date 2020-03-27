import { context } from "../state/context";
import { is, removeLayer } from "../api/api";
import { regexNames } from "../state/common";

export function clearAllMarks() {
    let targets = context.selection.length ? context.selection : [context.page];
    for (let i = 0; i < targets.length; i++) {
        let current = targets[i];
        let layer;
        let layers = current.children().objectEnumerator();
        while (layer = layers.nextObject()) {
            if (is(layer, MSLayerGroup) && regexNames.exec(layer.name())) {
                removeLayer(layer)
            }
        }
    }
}

export function toggleHidden() {
    let layer;
    let layers = context.page.children().objectEnumerator();
    let isHidden = !context.configs.isHidden;
    while (layer = layers.nextObject()) {
        if (is(layer, MSLayerGroup) && regexNames.exec(layer.name())) {
            layer.setIsVisible(isHidden);
        }
    }
    context.configs.isHidden = isHidden;
}
export function toggleLocked() {
    let isLocked = !context.configs.isLocked;
    let layers = context.page.children().objectEnumerator();

    let layer;
    while (layer = layers.nextObject()) {
        if (is(layer, MSLayerGroup) && regexNames.exec(layer.name())) {
            layer.setIsLocked(isLocked);
        }
    }
    context.configs.isLocked = isLocked;
}